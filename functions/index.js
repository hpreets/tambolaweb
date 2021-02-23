// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });




// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.createTicketV2 = functions.region('asia-south1').https.onCall(async (data, context) => {

    // functions.logger.info('INSIDE createTicketV2');
    let ticket = {};

    var db = admin.firestore();

    const uid = context.auth.uid; // "6tb9RSlJpZy66hxw2FCCYbHe1izU"; // context.auth.uid;
    // functions.logger.info("uid ::" + uid + "; context.auth.uid ::" + context.auth.uid);

    let tjson = {};
    let gameid = null;
    let answersArr = null;

    const currGame = await db.collection("settings").doc("currgame").get();
    if (currGame.data()) {
        if (currGame.data().gameover === false) {
            // functions.logger.info("currGame data ::" + currGame);
            functions.logger.info("currGame data in JSON ::" + JSON.stringify(currGame.data()));
            gameid = currGame.data().gameid;
            // functions.logger.info("gameid ::" + gameid);
            answersArr = currGame.data().answers.split('#');
            // functions.logger.info("answersArr ::" + answersArr);

            if (!gameid) {
                // Throwing an HttpsError so that the client gets the error details.
                throw new functions.https.HttpsError('failed-precondition', 'Not able to fetch gameid.');
            }
            const tkt = await db.collection("tickets").doc(gameid + "_" + uid).get();
            if (!tkt.data()) {

                functions.logger.info('Generating ticket for ' + gameid + "_" + uid);
                let rowctr = 1;
                let colctr = 1;
                for (let ctr = 0; ctr < 15; ctr++) {
                    let rndInt = Math.floor(Math.random() * Math.floor(90-ctr)); // getRandomInt(90-ctr);
                    tjson['c'+ rowctr + colctr] = answersArr[rndInt];
                    answersArr.splice(rndInt, 1);
                    rowctr++;
                    if (rowctr >= 4) rowctr = 1;
                    colctr++;
                    if (colctr >= 6) colctr = 1;
                }
                
                // functions.logger.info("tjson ::" + JSON.stringify(tjson));
                ticket.ticket = tjson;
                ticket.bogiecount = 0;
                ticket.uid = uid;
                functions.logger.info("ticket ::" + JSON.stringify(ticket));
                await db.collection("tickets").doc(gameid + "_" + uid).set(ticket);
            }
            else {
                ticket = tkt.data();
            }
        }
    }
    return ticket;

});


/**
 * Register Prize for the user.
 *    - Fetch current game id
 *    - Fetch User ticket for current tambola
 *    - Based on the PrizeId, get all answers from ticket
 *    - Validate that all answers are covered.
 *    - Also validate that the list of answer also contain the recently covered answer
 *    - Get answer index for recently covered answer
 *    - Post all validation, add data to tempprize collection - userid, prizeid, answer, answerindex
 * Param: (1) UserId
 *        (2) PrizeId - EF, FL, ML, LL, FH
 *        (3) AnswerIds - Valid only for EF (Early Five)
 */
exports.registerPrize = functions.region('asia-south1').https.onCall(async (data, context) => {

    console.log('INSIDE registerPrize');
        
    var db = admin.firestore();

    const userId = context.auth.uid;
    const uEmail = data.emailAddress;
    const uPhone = data.phoneNumber;
    let prizeIds = data.prizeid;
    let efCells = data.efCells;

    let gameid = null;
    let covAnswersArr = '';

    // STEP 1 : Fetch game details - GAMEID, COVEREDANSWERS including LATESTANSWER
    const currGame = await db.collection("settings").doc("currgame").get();
    if (currGame) {
        if (currGame.data()) {
            if (currGame.data().gameover === false) {
                let latestAnswer;
                let latestAnswerIndex;
            
                console.log("currGame data ::" + currGame);
                console.log("currGame data in JSON ::" + JSON.stringify(currGame.data()));
                gameid = currGame.data().gameid;
                console.log("gameid ::" + gameid);
                
                if (currGame.data().coveredAnswers !== undefined) {
                    covAnswersArr = currGame.data().coveredAnswers.split('#');
                }
                if (covAnswersArr.length > 0) {
                    latestAnswer = covAnswersArr[covAnswersArr.length - 2];
                    latestAnswerIndex = covAnswersArr.length - 2;
                    console.log("covAnswersArr ::" + covAnswersArr);
                    console.log("latestAnswerIndex ::" + latestAnswerIndex);
                
                    if (!gameid) {
                        // Throwing an HttpsError so that the client gets the error details.
                        throw new functions.https.HttpsError('failed-precondition', 'Not able to fetch gameid.');
                    }
                
                    // STEP 2 : Fetch user ticket for current game
                    const tkt = await db.collection("tickets").doc(gameid + "_" + userId).get();
                    if (tkt) {
                        if (tkt.data()) {
                            
                            let ticket = tkt.data();
                            let isBogie = false;
                            let isPrizeGiven = false;
                            let updateSuccess = false;
                            
                            console.log("ticket ::" + JSON.stringify(ticket));
                            let prizeArr = prizeIds.split('#');

                            prizeArr.forEach(async (prizeId) => {
                                let answerArr = [];
                                let validPrizeRequest = true;
                                let isLateResponse = false;

                                // STEP 3 : Based on PRIZEID, pick up corresponding cells to be validated and add values to answerArr
                                if (prizeId === 'FL') answerArr = [ ticket.ticket.c11, ticket.ticket.c12, ticket.ticket.c13, ticket.ticket.c14, ticket.ticket.c15 ];
                                else if (prizeId === 'ML') answerArr = [ ticket.ticket.c21, ticket.ticket.c22, ticket.ticket.c23, ticket.ticket.c24, ticket.ticket.c25 ];
                                else if (prizeId === 'LL') answerArr = [ ticket.ticket.c31, ticket.ticket.c32, ticket.ticket.c33, ticket.ticket.c34, ticket.ticket.c35 ];
                                
                                if (prizeId === 'EF') {
                                    try {
                                        // Split efCells and then set the answerArr likewise
                                        console.log("efCells ::" + efCells);
                                        let efCellIds = efCells.split('#');
                                        console.log("efCellIds ::" + efCellIds);
                                        console.log("ticket.ticket[efCellIds[0] ::" + ticket.ticket[efCellIds[0]]);
                                        answerArr.push(ticket.ticket[efCellIds[0]]);
                                        answerArr.push(ticket.ticket[efCellIds[1]]);
                                        answerArr.push(ticket.ticket[efCellIds[2]]);
                                        answerArr.push(ticket.ticket[efCellIds[3]]);
                                        answerArr.push(ticket.ticket[efCellIds[4]]);
                                    }
                                    catch (e) {
                                        validPrizeRequest = false;
                                    }
                                }
                                else if (prizeId === 'FH') {
                                    // answerArr contains all cells
                                    answerArr = [ 
                                        ticket.ticket.c11, ticket.ticket.c12, ticket.ticket.c13, ticket.ticket.c14, ticket.ticket.c15, 
                                        ticket.ticket.c21, ticket.ticket.c22, ticket.ticket.c23, ticket.ticket.c24, ticket.ticket.c25,
                                        ticket.ticket.c31, ticket.ticket.c32, ticket.ticket.c33, ticket.ticket.c34, ticket.ticket.c35
                                    ];
                                }
                                console.log("answerArr ::" + answerArr);
                                console.log("validPrizeRequest ::" + validPrizeRequest);
                        
                                if (answerArr.length > 0) {
                                    // STEP 4 : Check that all answers of the PRIZEID have been covered
                                    if (validPrizeRequest) {
                                        answerArr.forEach(element => {
                                            if (!covAnswersArr.includes(element)) validPrizeRequest = false;
                                        });
                                        console.log("After 1st loop, validPrizeRequest ::" + validPrizeRequest);
                            
                                        // STEP 5 : Also check that last answer is also part of prized cells
                                        if (validPrizeRequest) {
                                            if (!answerArr.includes(latestAnswer)) {
                                                validPrizeRequest = false;
                                                isLateResponse = true;
                                            }
                                        }
                                        console.log("After 2nd loop, validPrizeRequest ::" + validPrizeRequest);
                                    }
                        
                                    if (!validPrizeRequest) {
                                        // STEP 6.1 : If the request is NOT VALID i.e. not all user answers match covered answer, increase bogie count
                                        // For invalid request - increase bogie count
                                        if (!isLateResponse) isBogie = true;
                                    }
                                    else {
                                        isPrizeGiven = true;

                                        // STEP 6.2 : If everything is VALID, update PrizeId to TRUE. This doc is being used on TICKET as SPANSHOT to show which all prizes have been claimed.
                                        let updates = "{ \"" + prizeId + "\" : true }";
                                        console.log('UPDATING SNAPSHOT DATA :::' + updates);
                                        // Update prizes collection to mark which prize has been claimed
                                        await db.collection("prizes").doc("latest").set(JSON.parse(updates), { merge: true });
                            
                                        // STEP 6.3 : Set which user claimed what prize on which answer
                                        updates = "{ \"" + latestAnswerIndex + "_" + prizeId + "_" + uEmail + "\" : false }";
                                        // updates = "{ \"" + latestAnswerIndex + "_" + prizeId + "." + uEmail + "\" : firebase.firestore.FieldValue.arrayUnion(\"" + uEmail + "\") }";
                                        // updates = "{ \"" + latestAnswerIndex + "_" + prizeId + "." + uEmail + "\" : false ) }";
                                        console.log('UPDATING USER PRIZE DATA :::' + updates);
                                        await db.collection("prizes").doc(gameid).set(JSON.parse(updates), { merge: true });

                                        updateSuccess = true;

                                        if (prizeId === 'FH') {
                                            /* 
                                             * 22-Feb-2021 - This is commented since if two person gets 
                                             * a common answer for FH, the name of first user is registered 
                                             * and others are ignored. The gameover property will now be 
                                             * set from admnextques page. 
                                             * */
                                            // Set GameOver = true;
                                            // await db.collection("settings").doc("currgame").update({ gameover : true });
                                        }
                                    }
                                }
                            });
                            console.log('updateSuccess ::' + updateSuccess);

                            // This is to avoid incrementing bogie multiple times if multiple prizes are being claimed
                            if (isBogie  &&  !isPrizeGiven) {
                                // let updates = "{ \"bogiecount\" : FieldValue.increment(1) }";
                                let updates = { "bogiecount" : Firestore.FieldValue.increment(1) };
                                console.log('BOGIE :::' + updates);
                                await db.collection("tickets").doc(gameid + "_" + userId).update(updates);
                                return {
                                    bogie : true
                                };
                                /* .then((doc) => {
                                    console.log('Bogie count updated...');

                                    // Remove following two lines when adding it to Function
                                    bogieCount++;
                                    alert('It was a bogie. Please play with caution, you may not be allowed to continue playing if you bogie 3 times. Bogie count ::' + bogieCount);
                                    
                                    return {
                                        bogie : true
                                    };
                                }); */
                            }

                            console.log('updateSuccess ::' + updateSuccess);
                            if (updateSuccess) {
                                return {
                                    success : true
                                };
                            }
                        }
                    }
                }
                else {
                    let updates = { "bogiecount" : Firestore.FieldValue.increment(1) };
                    console.log('BOGIE :::' + updates);
                    await db.collection("tickets").doc(gameid + "_" + userId).update(updates);
                    return {
                        bogie : true
                    };
                }
            }
        }
    }

    return {
        noAction : true
    };

});
