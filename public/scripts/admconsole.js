// var db = firebase.firestore();
// var user = firebase.auth().currentUser;
// var functions = firebase.functions();
// let uid;
let nextGameDate;
let currGameId;



function getNextGameDate() {
    console.log($('#inputNextGameYear').val());
    console.log($('#inputNextGameMonth').val());
    console.log($('#inputNextGameDate').val());
    nextGameDate 
        = new Date(
            $('#inputNextGameYear').val(), 
            (parseInt($('#inputNextGameMonth').val()) - 1), 
            $('#inputNextGameDate').val(), 
            $('#inputNextGameHour').val(), 
            $('#inputNextGameMinute').val(), 
            0
        );
    console.log(nextGameDate);
    return nextGameDate;
}

function isNextGameDateInFuture() {
    console.log(getNextGameDate());
    console.log(new Date());
    if (getNextGameDate() < new Date()) {
        alert('Please set the Next Game date correctly');
        return false;
    }
    return true;
}


function getNextGameId() {
    nextGameDate = getNextGameDate();
    
    // var d = new Date();
    // d.setDate(d.getDate() + 10);
    return getCurrentGameFormattedDate(nextGameDate);
}

function getCurrentGameFormattedDate(dt) {
    return '' + dt.getFullYear() + '' + (appendLeadingZeroes(dt.getMonth()+1)) + '' + appendLeadingZeroes(dt.getDate());
}

// alert('Hi');


  


function resetCurrGameQuestions() {
    if (!isNextGameDateInFuture()) return;

	console.log('Inside setCurrGameQuestions');
    db.collection("gameques").doc("20201228").set({});
    let gameques = db.collection("gameques").doc("20201228");
    let quesList = {};
    db.collection("questions").get().then((querySnapshot) => {
        let ctr = 0;
        querySnapshot.forEach((doc) => {
            let qdoc = doc.data();

            let answer = qdoc.answer;
            quesList[answer] = qdoc;
        });
        console.log(quesList);
        gameques.update(quesList, { merge: true })
        .then(() => {
            $('#messageText').text('Current Game Questions are reset successfully.');
        });
    });
}


function createQuestions() {
    if (!isNextGameDateInFuture()) return;

    console.log('ques ::' + ques.length);
    var qjson = {};
    for (var i = 0; i < ques.length; i++) {
        var obj = ques[i];
        for (var key in obj){
            var attrName = key;
            var attrValue = obj[key];
            if (key == 'question') {
                qjson.question = attrValue;
                qjson.info = `https://gurduarablock33.wordpress.com/${attrValue.replaceAll(' ', '-')}`;
            }
            else if (key == 'answer') qjson.answer = attrValue;
            else if (key == 'keywords') qjson.keywords = attrValue;
        }
        qjson.addedOn = firebase.firestore.Timestamp.now();
        qjson.status = 'active';
        console.log(qjson);
    
        // Add to firestore
        var rowscreated = 0;
        var rowserror = 0;
        db.collection("questions").add(qjson)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            rowscreated++;
            $('#messageText').text('Records inserted: ' + rowscreated + '; Records Error: ' + rowserror + '; Total records: ' + ques.length);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
            rowserror++;
            $('#messageText').text('Records inserted: ' + rowscreated + '; Records Error: ' + rowserror + '; Total records: ' + ques.length);
        });
    }
}


function createGameQues() {
    if (!isNextGameDateInFuture()) return;

    currGameId = getNextGameId();

    db.collection("gameques").doc(currGameId).set({});
    let gameques = db.collection("gameques").doc(currGameId);
    let quesList = {};
    db.collection("questions").get().then((querySnapshot) => {
        let ctr = 0;
        querySnapshot.forEach((doc) => {
            let qdoc = doc.data();
            console.log(`${doc.id} => ${qdoc} => ${qdoc.question} => ${qdoc.answer}`);

            let answer = qdoc.answer;
            quesList[answer] = qdoc;

        });
        console.log(quesList);
        gameques.update(quesList, { merge: true })
        .then(() => {
            $('#messageText').text('Game questions created successfully');
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
            $('#messageText').text('Failed creating Game questions');
        });
    });

}

function createCurrGameSetting() {
    if (!isNextGameDateInFuture()) return;

    // console.log('currGameId :::' + currGameId);
    getGameQuestions(currGameId, successGameQuesFetch, null);
}

function successGameQuesFetch(doc) {
    var qList = doc; // .data();
    console.log(JSON.stringify(qList));
    var answers = '';
    Object.keys(qList).forEach((qdockey) => {
        console.log('qdockey ::' + qdockey);
        if (qdockey !== '_gameover') {
            answers += qdockey + '#';
        }
    });
    console.log('answers ::' + answers);
    db.collection("settings").doc("currgame").set({});
    let settigs = db.collection("settings").doc("currgame");
    var settjson = {};
    settjson.answers = answers.substring(0, answers.length-1);
    // var d = new Date();
    // d.setDate(d.getDate() + 10);
    var d = nextGameDate;
    settjson.gamedatetime = firebase.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0, 0));
    settjson.gameid = getNextGameId(d); // currGameId;
    gameid = getFromStorage('gameid');
    console.log('gameid ::' + gameid);
    settjson.prevgameid = gameid === undefined ? null : gameid;
    settjson.queschanged = firebase.firestore.Timestamp.now();
    settjson.gameover = false;
    settjson.coveredAnswers = null;
    console.log('settjson ::' + JSON.stringify(settjson));
    settigs.update(settjson, { merge: true }).then(() => {
        $('#messageText').text('Settings created successfully');
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        $('#messageText').text('Failed creating Settings');
    });
}

function createCurrGamePrizes() {
    if (!isNextGameDateInFuture()) return;

    let gameId = getNextGameId(nextGameDate);
    
    var settjson = {};
    settjson["76_EF_hsastadia@gmail.com"] = false;
    settjson["23_FL_test@test.test"] = false;
    settjson["17_ML_mrharpreets@gmail.com"] = false;
    settjson["63_LL_hsuk@hotmail.com"] = false;
    settjson["90_FH_bs@yahoo.co.uk"] = false;

    console.log('settjson ::' + JSON.stringify(settjson));
    db.collection("prizes").doc(gameId).set(settjson).then(() => {
        $('#messageText').text('Prizes created successfully');
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        $('#messageText').text('Failed creating Prizes');
    });
}

function setNextCurrGame() {
    console.log(getFromStorage('gameid'));
    gameid = getFromStorage('gameid');
    console.log(gameid);
    getNextGameId(nextGameDate);
}

$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActionsAdmin();
	$('#btnLogout').click(signout);
	$('#resetQues').click(resetCurrGameQuestions);
    $('#createQuestions').click(createQuestions);
    $('#createGameQues').click(createGameQues);
    $('#createCurrGameSetting').click(createCurrGameSetting);
    $('#setNextCurrGame').click(createCurrGameSetting);
    $('#createCurrGamePrizes').click(createCurrGamePrizes);
});

// setCurrGameQuestions();
/**
 * First method that initiates data fetch from Firestore / Cache
 */
function init() {
    // clearStorage();
    console.log(gameid);
    getFSSettingsData();
}
  
checkAdminLogin();
init();
