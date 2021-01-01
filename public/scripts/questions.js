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
  

function createNode(element) {
	return document.createElement(element);
}

function createQuestionRow(ques, answ, index, container) {
    // let ques = `${question['Question']}`;
    // let answ = `${question['Answer']}`;
    let rowsno = index + 1 + '.';
    let rowquestion = ques;
    let rowanswer = answ;
    let counter = index + 1;

    let row = createNode('div');
    let snodiv = createNode('div');
    let quesdiv = createNode('div');
    let answdiv = createNode('div');
    // console.log(`${question['Question']}`);
    // let row = container.append('div');
    
    $(snodiv).addClass('col-lg-1 col-sm-12');
    $(quesdiv).addClass('col-lg-7 col-md-auto col-sm-12');
    $(answdiv).addClass('col-lg-4 col-sm-12');
    $(snodiv).html(rowsno);
    $(quesdiv).html(rowquestion);
    $(answdiv).html(rowanswer);
    // console.log(snodiv);
    // console.log(answdiv);
    row.append(snodiv, quesdiv, answdiv);
    // row.append(quesdiv);
    // row.append(answdiv);
    $(row).addClass('line row');
    
    container.append(row);

    if(counter % 10 == 0){
        let ad = createNode('div');
        $(ad).text('advertisement');
        $(ad).addClass('display-3');
        container.append(ad);
    }
}



// Read Data
const container = $('.container-fluid');
let qList = null;
let gameid;

function init() {
    // sessionStorage.clear();
    // clearStorage();
    db.collection("settings").doc("currgame").get()
    .then((doc) => {
        gameid = doc.data().gameid;
        if (getFromStorage('gameid') != null  
                &&  doc.data().gameid == getFromStorage('gameid')  
                &&  doc.data().queschanged.seconds == getFromStorage('queschanged')) {
            // Questions not changed, use the data from cache
            console.log("Picking data from Cache");
            qList = JSON.parse(getFromStorage("qlist"));
            iterateQuestions(qList);
        }
        else {
            // Clear all storage includeing storate of ticket and other pages
            clearStorage();

            // Picking data from game questions - gameques/<gameid>/questions
            db.collection("gameques").doc(gameid).get()
            .then((doc) => {
                console.log("Picking data from firestore");
                qList = doc.data();
                addToStorage("qlist", JSON.stringify(qList));
                qList = JSON.parse(getFromStorage("qlist"));
                iterateQuestions(qList);
            });
        }
        addToStorage('gameid', doc.data().gameid);
        addToStorage('queschanged', doc.data().queschanged.seconds);
        addToStorage('gamedatetime', doc.data().gamedatetime.seconds);

        $('.gamedate').text( new Date(doc.data().gamedatetime.seconds*1000) );
    });
}

function iterateQuestions(qList) {
    let index = 0;
    // var answers = '';
    Object.keys(qList).forEach((qdockey) => {
        let qdoc = qList[qdockey];
        // if (answers.length > 0) answers += '#';
        // console.log(`${qdoc} => ${qdoc.question} => ${qdoc.answer}`);
        createQuestionRow(qdoc.question, qdoc.answer, index, container);
        // answers += qdoc.answer;
        index++
    });
    // console.log(answers);
}


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

init();

function signout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = '/questions.html';
    }).catch(function(error) {
        // An error happened.
    });
}

function getTicket() {
    let gameId = getFromStorage('gameid');
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
    e.preventDefault();
    console.log( getFromStorage('gamedatetime') );
    let gameDateTime = new Date(getFromStorage('gamedatetime')*1000);
    var currDateTime = new Date();
    currDateTime.setMinutes( currDateTime.getMinutes() + 15 );
    currDateTime.setDate( currDateTime.getDate() + 15 ); // TODO: Uncomment after testing
    console.log( currDateTime );
    console.log( gameDateTime );
    if (currDateTime > gameDateTime) {
        // alert('Time for play');
        window.location = '/ticket.html';
    }
    else {
        alert('The ticket would be available 15 minutes before the game.');
    }
}

$(function onDocReady() {
	console.log('Inside onDocReady');
    $('#btnLogout').click(signout);
    $('#btnTicket').click(generateTicket);

    $('.sharewrapper').load('pagelets/share.html', function() {
        let currURL = $(location).attr('href');
        console.log(currURL);
        $('.facebookshare').attr('href', 'https://facebook.com/sharer/sharer.php?u=' + currURL);
        $('.twittershare').attr('href', 'https://twitter.com/intent/tweet/?text=Learn about Sikh History in a fun way: Sikh History Tambola.&url=' + currURL);
        $('.linkedinshare').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&title=Learn about Sikh History in a fun way: Sikh History Tambola.&summary=Learn about Sikh History in a fun way: Sikh History Tambola.&url=' + currURL);
        $('.emailshare').attr('href', 'mailto:?subject=Learn about Sikh History in a fun way: Sikh History Tambola.&body=' + currURL);
        $('.whatsappshare').attr('href', 'whatsapp://send?text=Learn about Sikh History in a fun way: Sikh History Tambola. ' + currURL);
    });
    


    /* $('.facebookshare').attr('href', 'https://facebook.com/sharer/sharer.php?u=' + currURL);
    $('.twittershare').attr('href', 'https://twitter.com/intent/tweet/?text=Learn about Sikh History in a fun way: Sikh History Tambola.&url=' + currURL);
    $('.linkedinshare').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&title=Learn about Sikh History in a fun way: Sikh History Tambola.&summary=Learn about Sikh History in a fun way: Sikh History Tambola.&url=' + currURL);
    $('.emailshare').attr('href', 'mailto:?subject=Learn about Sikh History in a fun way: Sikh History Tambola.&body=' + currURL);
    $('.whatsappshare').attr('href', 'whatsapp://send?text=Learn about Sikh History in a fun way: Sikh History Tambola. ' + currURL); */
});

// document.onload = function() {
//     console.log('ON LOAD');
//     // $('.btnTicket').click();
//     $('.btnLogout').click(signout);
// }