
var db = firebase.firestore();
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
let gameid;

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
        gameques.update(quesList, { merge: true });
    });
}


$(function onDocReady() {
	console.log('Inside onDocReady');
	$('#btnLogout').click(signout);
	$('#resetQues').click(setCurrGameQuestions);
});

setCurrGameQuestions();