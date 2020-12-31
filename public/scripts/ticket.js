var db = firebase.firestore();
var user = firebase.auth().currentUser;
var functions = firebase.app().functions('asia-south1');
let uid;
let uEmailAddress;
let uPhoneNumber;
let prizeDetails;
let prizeDetailsFromNextQues;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        logMessage('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
        uid = user.uid;
        uEmailAddress = user.email;
        uPhoneNumber = user.phoneNumber;
        generateTicket(null);
        // getCoveredQuestions();
        listenToQuestions();
        // getClaimedPrizes();
        listenToClaimedPrizes();
        // registerPrize();
    } 
    else {
        logMessage('User is NULL');
    }
});
  



// Read Data
const container = $('.container-fluid');
let qList = null;
let gameId;
let realTimeUpdateUnsubscribe;
let realTimePrizeUpdateUnsubscribe;
// let quesListCache; // Temp. Remove after testing
let bogieCount = 0;


function init() {
    if (sessionStorage.getItem('gameid') == null) {
        db.collection("settings").doc("currgame").get()
        .then((doc) => {
            sessionStorage.setItem('gameid', doc.data().gameid);
            sessionStorage.setItem('gamedatetime', doc.data().gamedatetime.seconds);
        });
    }
}


function getTicket() {
    init();
    gameId = sessionStorage.getItem('gameid');
    db.collection("tickets").doc(gameId + "_" + uid).get()
    .then((doc) => {
        return doc.data();
    })
    .catch((error) => {
        console.error("Error getting ticket: ", error);
    });
    return null;
}


function generateTicket(e) {
    // e.preventDefault();
    resetTicketStorage();

    init();
    logMessage( sessionStorage.getItem('gamedatetime') );
    let gameDateTime = new Date(sessionStorage.getItem('gamedatetime')*1000);
    var currDateTime = new Date();
    currDateTime.setMinutes( currDateTime.getMinutes() + 15 );
    currDateTime.setDate( currDateTime.getDate() + 15 ); // TODO: Uncomment after testing
    logMessage( currDateTime );
    logMessage( gameDateTime );
    if (currDateTime > gameDateTime) {

        gameId = sessionStorage.getItem('gameid');
        let tkt;
        console.log(gameId + "_" + uid);
        console.log(getFromStorage('ticket'));

        if (!getFromStorage('ticket')) {

            /* db.collection("tickets").doc(gameId + "_" + uid).get().then((doc) => {
                logMessage(doc.data()); // test
            }); */

            console.log('Picking ticket from firestore');
            tkt = db.collection("tickets").doc(gameId + "_" + uid).get()
            .then((doc) => {
                if (doc.data()) {
                    console.log('doc.data() is not null');
                    console.log(doc);
                    tkt = doc.data();
                    console.log(tkt);
                    return doc;
                }

                let createTkt = functions.httpsCallable('createTicketV2');
                console.log('Calling createTkt');
                return createTkt();
            })
            .then((doc) => {
                if (doc.data === 'function' && doc.data()) {
                    console.log('doc.data is a null');
                    console.log(doc);
                    tkt = doc.data();
                    console.log(doc);
                    return doc;
                }
                console.log('Returning data from firestore');
                return db.collection("tickets").doc(gameId + "_" + uid).get();
            })
            .then((doc) => {
                if (doc.data()) {
                    console.log(doc);
                    tkt = doc.data();
                    logMessage(doc);
                    logMessage('Adding ticket to storage');
                    // initTicketDataInStorage(tkt); // Not required since bogiecount can differ in each load.
                    // addToStorage('ticket', JSON.stringify(tkt));
                    loadTicket(tkt);
                    setBogieCount(tkt);
                    return tkt;
                }
            })
            .catch((e) => {
                console.error(e);
            });
        }
        else {
            // tkt = JSON.parse(getFromStorage('ticket'))
            console.log('Picked from Cache');
            tkt = getTicketFromStorage();
            loadTicket(tkt);
        }
        logMessage(tkt);
    }
    else {
        alert('The ticket would be available 15 minutes before the game.');
    }
}

function setBogieCount(tkt) {
    bogieCount = tkt.bogiecount;
    console.log('bogieCount ::' + bogieCount);
}

function loadTicket(tdata) {
    // logMessage(JSON.stringify(tdata));
    $('.tktcell11').text(tdata.ticket['c11']);
    $('.tktcell12').text(tdata.ticket['c12']);
    $('.tktcell13').text(tdata.ticket['c13']);
    $('.tktcell14').text(tdata.ticket['c14']);
    $('.tktcell15').text(tdata.ticket['c15']);
    $('.tktcell21').text(tdata.ticket['c21']);
    $('.tktcell22').text(tdata.ticket['c22']);
    $('.tktcell23').text(tdata.ticket['c23']);
    $('.tktcell24').text(tdata.ticket['c24']);
    $('.tktcell25').text(tdata.ticket['c25']);
    $('.tktcell31').text(tdata.ticket['c31']);
    $('.tktcell32').text(tdata.ticket['c32']);
    $('.tktcell33').text(tdata.ticket['c33']);
    $('.tktcell34').text(tdata.ticket['c34']);
    $('.tktcell35').text(tdata.ticket['c35']);

    let tdataSel = getSelectionDataFromStorage();
    console.log(tdataSel);
    if (tdataSel['tktcell11']) $('.tktcell11').addClass('green');
    if (tdataSel['tktcell12']) $('.tktcell12').addClass('green');
    if (tdataSel['tktcell13']) $('.tktcell13').addClass('green');
    if (tdataSel['tktcell14']) $('.tktcell14').addClass('green');
    if (tdataSel['tktcell15']) $('.tktcell15').addClass('green');
    if (tdataSel['tktcell21']) $('.tktcell21').addClass('green');
    if (tdataSel['tktcell22']) $('.tktcell22').addClass('green');
    if (tdataSel['tktcell23']) $('.tktcell23').addClass('green');
    if (tdataSel['tktcell24']) $('.tktcell24').addClass('green');
    if (tdataSel['tktcell25']) $('.tktcell25').addClass('green');
    if (tdataSel['tktcell31']) $('.tktcell31').addClass('green');
    if (tdataSel['tktcell32']) $('.tktcell32').addClass('green');
    if (tdataSel['tktcell33']) $('.tktcell33').addClass('green');
    if (tdataSel['tktcell34']) $('.tktcell34').addClass('green');
    if (tdataSel['tktcell35']) $('.tktcell35').addClass('green');
}

/**
 * On Load functionality. Handles
 *  (1) OnClick for ticket cells
 */
$(function onDocReady() {
    logMessage('Inside onDocReady');

    $('.ticket').on('click', function(){
        $(this).toggleClass('green');
        var classList = $(this).attr("class");
        var classArr = classList.split(/\s+/);
        $.each(classArr, function(index, value) {
            logMessage('' + index + '---' + value);
            if (value.includes('tktcell')) {
                updateSelectionDataInStorage(value);
            }
        });
        checkforPrizeAndClaim();
    });

    /* $('.language').on('click', function() {
        logMessage('Inside language click');
        updateUIOnQuestions(quesListCache);
    }); */
});

function checkforPrizeAndClaim() {
    let tdataSel = getSelectionDataFromStorage();
    console.log(tdataSel);
    let prizeIds = '';
    let retStr = '';
    let selectedCount = 0;
    let selectedCountFL = 0;
    let selectedCountML = 0;
    let selectedCountLL = 0;

        Object.keys(tdataSel).forEach((qdoc) => {
            if (tdataSel[qdoc]) {

                let selectedCell = qdoc.replace('tktcell', 'c');
                if (retStr.length > 0) retStr = retStr + '#' + selectedCell;
                else retStr = selectedCell;

                selectedCount++;
                if (selectedCell.search('c1') == 0) selectedCountFL++;
                if (selectedCell.search('c2') == 0) selectedCountML++;
                if (selectedCell.search('c3') == 0) selectedCountLL++;
            }
        });
        console.log('retStr :: ' + retStr);
        console.log('selectedCount ::' + selectedCount);
        console.log('selectedCountFL ::' + selectedCountFL);
        console.log('selectedCountML ::' + selectedCountML);
        console.log('selectedCountLL ::' + selectedCountLL);
        console.log(prizeDetailsFromNextQues == undefined);
        console.log((prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.EF != true)));

        if (selectedCount == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.EF != true  /* && EF not already claimed */))) {
            console.log('Claim for EF');
            prizeIds = 'EF';
        }
        else if (selectedCountFL == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (selectedCountML == 5  &&  selectedCountLL == 5  &&  prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.FH != true))) {
            console.log('Claim for FULL HOUSE');
            if (prizeIds.length > 0) prizeIds += '#FH'; else prizeIds += 'FH';
            retStr = '';
        }
        if (selectedCountFL == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.FL != true  /* && FL not already claimed */))) {
            console.log('Claim for FL');
            if (prizeIds.length > 0) prizeIds += '#FL'; 
            else {
                prizeIds += 'FL';
                retStr = '';
            }
        }
        else if (selectedCountML == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.ML != true  /* && ML not already claimed */))) {
            console.log('Claim for ML');
            if (prizeIds.length > 0) prizeIds += '#ML'; 
            else {
                prizeIds += 'ML';
                retStr = '';
            }
        }
        else if (selectedCountLL == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.LL != true /* && LL not already claimed */))) {
            console.log('Claim for LL');
            if (prizeIds.length > 0) prizeIds += '#LL'; 
            else {
                prizeIds += 'LL';
                retStr = '';
            }
        }

        if (prizeIds !== '') {
            let prizeRet = registerPrize(prizeIds, retStr);
            console.log('prizeRet ::' + prizeRet);
            // console.log('prizeRet.bogie ::' + prizeRet.bogie);
            /* if (prizeRet != undefined  &&  prizeRet.bogie == true) {
                alert('It was a bogie. Please play with caution, you may not be allowed to continue playing if you bogie 3 times.');
                bogieCount++;
            } */
        }

        // return retStr;
    // if (tdataSel['tktcell11']) $('.tktcell11').addClass('green');
    // if (tdataSel['tktcell12']) $('.tktcell12').addClass('green');
}
    

// document.onload = function() {
//     logMessage('ON LOAD');
//     // $('.btnTicket').click();
//     $('.btnLogout').click(signout);
// }


function updateSelectionDataInStorage(cellId) {
    let selData = getSelectionDataFromStorage();
    selData[cellId] = !selData[cellId];
    addSelectionDataToStorage(selData);
}

function initTicketDataInStorage(data) {
	logMessage('storeTicketInCache');
	logMessage(data);
	addTicketToStorage(data);
	/* let ticketSel = { 
		"tktcell11": false,
		"tktcell12": false,
		"tktcell13": false,
		"tktcell14": false,
		"tktcell15": false,
		"tktcell21": false,
		"tktcell22": false,
		"tktcell23": false,
		"tktcell24": false,
		"tktcell25": false,
		"tktcell31": false,
		"tktcell32": false,
		"tktcell33": false,
		"tktcell34": false,
		"tktcell35": false
	};
	addSelectionDataToStorage(ticketSel); */
}

function addTicketToStorage(data) {
    addToStorage("ticket", JSON.stringify(data));
}

function getTicketFromStorage() {
    console.log(getFromStorage('ticket'));
    return JSON.parse(getFromStorage('ticket'));
}

function addSelectionDataToStorage(ticketSel) {
    addToStorage("ticketSel", JSON.stringify(ticketSel));
}

function getSelectionDataFromStorage() {
    logMessage(getFromStorage("ticketSel"));
    console.log(getFromStorage("ticketSel"));
    let sel = getFromStorage("ticketSel");
    if (!sel) sel = "{}";
	return JSON.parse(sel);
}

function resetTicketStorage() {
    removeFromStorage('ticket');
    // removeFromStorage('ticketSel');
}

function getCoveredQuestions() {
    tkt = db.collection("gameques").doc(gameId).get()
    .then((doc) => {
        if (doc.data()) {
            logMessage(doc.data());
            // quesListCache = doc.data();
            updateUIOnQuestions(doc.data());
        }
    });
}

function listenToQuestions() {
    realTimeUpdateUnsubscribe = db.collection("gameques").doc(gameId)
    .onSnapshot(function(doc) {
        logMessage("Current data: ", doc.data());
        prizeDetailsFromNextQues = prizeDetails;
        updateUIOnQuestions(doc.data());
    });

    /* setTimeout(function() {
        realTimeUpdateUnsubscribe();
    }, 5000); */
}

function updateUIOnQuestions(qList) {
    let covQues = [];
    // let qList = doc.data();
    Object.keys(qList).forEach((qdoc) => {
        let ques = qList[qdoc];
        if (ques.coveredIndex != null) {
            logMessage(ques);
            covQues.push(ques);
        }
    });
    if (covQues.length > 0) {
        
        logMessage(covQues);
        covQues.sort((a, b) => {
            let fa = a.coveredIndex,
                fb = b.coveredIndex;
        
            if (fa < fb) {
                return 1;
            }
            if (fa > fb) {
                return -1;
            }
            return 0;
        });
        logMessage(covQues);
        logMessage(covQues[0].question);
        $('#question').text(covQues[0].question);
        if (prizeDetailsFromNextQues != undefined  &&  !prizeDetailsFromNextQues.FH) {
            $('#question').css('background', 'red');
            animateHTML($('#question'), 'red', '#b3d9ff', 1000);
        }
        addQuestionsToModalDialog(covQues);
    }
    else {
        $('#question').text('');
    }
}

function animateHTML(htmlNode, color1, color2, timeout) {
    setTimeout(function() {
        htmlNode.css('background', color1);
        setTimeout(function() {
            htmlNode.css('background', color2);
            setTimeout(function() {
                htmlNode.css('background', color1);
                setTimeout(function() {
                    htmlNode.css('background', color2);
                    setTimeout(function() {
                        htmlNode.css('background', color1);
                        setTimeout(function() {
                            htmlNode.css('background', color2);
                        }, timeout);
                    }, timeout);
                }, timeout);
            }, timeout);
        }, timeout);
    }, timeout);
}

function addQuestionsToModalDialog(covQues) {
    logMessage('Inside addQuestionsToModalDialog ::' + covQues);
    const ul = $('#questionList');
    ul.empty();
    let qIdx = covQues.length;
    covQues.forEach((ques) => {
        let li = createNode('li');
        $(li).addClass('list-group-item');
        $(li).html((qIdx) + '. ' + ques.question);
        logMessage(ques.question);
        ul.append(li);
        qIdx--;
    });
}


function getClaimedPrizes() {
    tkt = db.collection("prizes").doc("latest").get()
    .then((doc) => {
        if (doc.data()) {
            logMessage(doc.data());
            updateUIOnPrizes(doc.data());
        }
    });
}

function listenToClaimedPrizes() {
    realTimePrizeUpdateUnsubscribe = db.collection("prizes").doc("latest")
    .onSnapshot(function(doc) {
        logMessage("Current data: ", doc.data());
        updateUIOnPrizes(doc.data());
    });

    /* setTimeout(function() {
        realTimeUpdateUnsubscribe();
    }, 5000); */
}

function updateUIOnPrizes(pList) {
    console.log("updateUIOnPrizes ::: pList :::" + pList);
    prizeDetails = pList;
    if (pList) {
        Object.keys(pList).forEach((pdoc) => {
            let prize = pList[pdoc];
            console.log("updateUIOnPrizes ::: pdoc :::" + pdoc);
            console.log("updateUIOnPrizes ::: prize :::" + prize);
            if (prize === true) {
                $('.prize' + pdoc).css('background', 'red');
            }
        });
        if (pList.FH == true) alert('Game is over. Thanks for playing.');
    }
}


function onPageUnload() {
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('Page Unloading');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    realTimeUpdateUnsubscribe();
    realTimePrizeUpdateUnsubscribe();
}

// $('.question').on("unload", onPageUnload);

window.addEventListener('beforeunload', onPageUnload);

function getMarkedAnswersInString() {
    let tdataSel = getSelectionDataFromStorage();
    console.log(tdataSel);
    let retStr = '';
    Object.keys(tdataSel).forEach((qdoc) => {
        if (tdataSel[qdoc]) {
            if (retStr.length > 0) retStr = retStr + '#' + qdoc.replace('tktcell', 'c');
            else retStr = qdoc.replace('tktcell', 'c');
        }
    });
    console.log(retStr);
    return retStr;
    // if (tdataSel['tktcell11']) $('.tktcell11').addClass('green');
    // if (tdataSel['tktcell12']) $('.tktcell12').addClass('green');
}





function registerPrize(prizeIds, efCells) {

    var addMessage = functions.httpsCallable('registerPrize');
    addMessage({ 
        emailAddress : uEmailAddress,
        phoneNumber : uPhoneNumber,
        prizeid : prizeIds,
        efCells : efCells,
    })
    .then((result) => {
        // Read result of the Cloud Function.
        console.log('AFTER REGISTERPRIZE Cloud Function Call :: result.data :: ' + JSON.stringify(result.data));
        if (result.data != undefined &&  result.data.bogie == true) {
            alert('It was a bogie. Please play with caution, you may not be allowed to continue playing if you bogie 3 times.');
            bogieCount++;
        }
    });

    /* console.log('INSIDE registerPrize');
    
    // var db = admin.firestore();
  
    const userId = uid; // '2CcF64X5WzgS50UB8ZMw5RjHP1o1'; // context.auth.uid;
    const uEmail = uEmailAddress;
    const uPhone = uPhoneNumber;
    // let prizeIds = 'EF'; // data.prizeid;
    // let efCells = getMarkedAnswersInString(); // data.efCells;
  
    let gameid = null;
    let covAnswersArr = null;
  
    // STEP 1 : Fetch game details - GAMEID, COVEREDANSWERS including LATESTANSWER
    db.collection("settings").doc("currgame").get().then((currGame) => {
        if (currGame.data()) {
            let latestAnswer;
            let latestAnswerIndex;
        
            console.log("currGame data ::" + currGame);
            console.log("currGame data in JSON ::" + JSON.stringify(currGame.data()));
            gameid = currGame.data().gameid;
            console.log("gameid ::" + gameid);
            covAnswersArr = currGame.data().coveredAnswers.split('#');
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
                db.collection("tickets").doc(gameid + "_" + userId).get().then((tkt) => {
                    if (tkt.data()) {
                        
                        let ticket = tkt.data();
                        let isBogie = false;
                        let isPrizeGiven = false;
                        
                        console.log("ticket ::" + JSON.stringify(ticket));
                        let prizeArr = prizeIds.split('#');

                        prizeArr.forEach((prizeId) => {
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
                                    db.collection("prizes").doc("latest").set(JSON.parse(updates), { merge: true });
                        
                                    // STEP 6.3 : Set which user claimed what prize on which answer
                                    updates = "{ \"" + latestAnswerIndex + "_" + prizeId + "_" + uEmail + "\" : false }";
                                    // updates = "{ \"" + latestAnswerIndex + "_" + prizeId + "." + uEmail + "\" : firebase.firestore.FieldValue.arrayUnion(\"" + uEmail + "\") }";
                                    // updates = "{ \"" + latestAnswerIndex + "_" + prizeId + "." + uEmail + "\" : false ) }";
                                    console.log('UPDATING USER PRIZE DATA :::' + updates);
                                    db.collection("prizes").doc(gameid).set(JSON.parse(updates), { merge: true });

                                    return {
                                        success : true
                                    };
                                }
                            }
                        });

                        // This is to avoid incrementing bogie multiple times if multiple prizes are being claimed
                        if (isBogie  &&  !isPrizeGiven) {
                            // let updates = "{ \"bogiecount\" : FieldValue.increment(1) }";
                            let updates = { "bogiecount" : firebase.firestore.FieldValue.increment(1) };
                            console.log('BOGIE :::' + updates);
                            db.collection("tickets").doc(gameid + "_" + userId).update(updates)
                            .then((doc) => {
                                console.log('Bogie count updated...');

                                // Remove following two lines when adding it to Function
                                bogieCount++;
                                alert('It was a bogie. Please play with caution, you may not be allowed to continue playing if you bogie 3 times. Bogie count ::' + bogieCount);
                                
                                return {
                                    bogie : true
                                };
                            });
                        }
                    }
                });
            }
        }
    });

    return {
        noAction : true
    }; */
}