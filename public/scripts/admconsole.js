// var db = firebase.firestore();
var user = firebase.auth().currentUser;
var functions = firebase.functions();
let uid;


function appendLeadingZeroes(n){
    if(n <= 9){
        return "0" + n;
    }
    return n
}

function getCurrentGameId() {
    var d = new Date();
    d.setDate(d.getDate() + 10);
    return '' + d.getFullYear() + '' + (appendLeadingZeroes(d.getMonth()+1)) + '' + appendLeadingZeroes(d.getDate());
}

let currGameId = getCurrentGameId();
// alert('Hi');

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
        $('#loggedInUser').text(user.displayName);
        uid = user.uid;
		hideButtons(true);
    } else {
        console.log('User is NULL');
        hideButtons(false);
    }
  });
  


// Read Data
// let gameid;

function hideButtons(loggedIn) {
    if (!loggedIn) {
        $('#btnSignup').hide();
        $('#btnLogin').show();
        $('#btnTicket').hide();
        $('#btnLogout').hide();
    }
    else {
        $('#btnTicket').show();
        $('#btnLogout').show();
        $('#btnSignup').hide();
        $('#btnLogin').hide();
    }
}


function signout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = '/questions.html';
    }).catch(function(error) {
        // An error happened.
    });
}


function setCurrGameQuestions() {
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
    console.log('ques ::' + ques.length);
    var qjson = {};
    for (var i = 0; i < ques.length; i++) {
        var obj = ques[i];
        for (var key in obj){
            var attrName = key;
            var attrValue = obj[key];
            if (key == 'question') qjson.question = attrValue;
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
    getFSCurrGameQuestions(currGameId, successGameQuesFetch, null);
}

function successGameQuesFetch(doc) {
    var qList = doc.data();
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
    var d = new Date();
    d.setDate(d.getDate() + 10);
    settjson.gamedatetime = firebase.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 11, 0, 0, 0));
    settjson.gameid = currGameId;
    settjson.prevgameid = null;
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

$(function onDocReady() {
	console.log('Inside onDocReady');
	$('#btnLogout').click(signout);
	$('#resetQues').click(setCurrGameQuestions);
    $('#createQuestions').click(createQuestions);
    $('#createGameQues').click(createGameQues);
    $('#createCurrGameSetting').click(createCurrGameSetting);
});

// setCurrGameQuestions();
