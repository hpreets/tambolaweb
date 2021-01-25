// var db = firebase.firestore();
var user = firebase.auth().currentUser;
var functions = firebase.functions();
let uid;
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
    console.log('ques ::' + ques);
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
        db.collection("questions").add(qjson)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }
    
}


$(function onDocReady() {
	console.log('Inside onDocReady');
	$('#btnLogout').click(signout);
	$('#resetQues').click(setCurrGameQuestions);
	$('#createQuestions').click(createQuestions);
});

// setCurrGameQuestions();
