const container = $('.container-fluid');
let qList = null;
let gameid;


/**
 * Called when user is logged in
 */
successLogin = function() {
    console.log('Inside successLogin');
};
/**
 * Called when user is NOT logged in
 */
failureLogin = function() {
    console.log('Inside failureLogin');
};


/**
 * Creates each UI row while iterating through question list JSON
 * @param {*} ques - Question text
 * @param {*} answ - Answer text
 * @param {*} index - The counter
 * @param {*} container - Parent element to which this row is added
 */
function createQuestionRow(ques, answ, index, container) {
    let rowsno = index + 1 + '.';
    let rowquestion = ques;
    let rowanswer = answ;
    let counter = index + 1;

    let row = createNode('div');
    let snodiv = createNode('div');
    let quesdiv = createNode('div');
    let answdiv = createNode('div');
    
    $(snodiv).addClass('col-lg-1 col-sm-12');
    $(quesdiv).addClass('col-lg-7 col-md-auto col-sm-12');
    $(answdiv).addClass('col-lg-4 col-sm-12');
    $(snodiv).html(rowsno);
    $(quesdiv).html(rowquestion);
    $(answdiv).html(rowanswer);
    row.append(snodiv, quesdiv, answdiv);
    $(row).addClass('line row');
    
    container.append(row);

    if(counter % 10 == 0){
        let ad = createNode('div');
        $(ad).text('advertisement');
        $(ad).addClass('display-3');
        container.append(ad);
    }
}



/**
 * First method that initiates data fetch from Firestore / Cache
 */
function init() {
    // clearStorage();
    getFSSettingsData(successCurrGameFetch, null);
}

/**
 * Called when Current Game Settings data is fetched from Firestore
 * @param {*} doc - JSON Data - current game settings
 */
function successCurrGameFetch(doc) {
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
        // Clear all storage including storage of ticket and other pages
        clearStorage();

        // Picking data from game questions - gameques/<gameid>/questions
        getFSCurrGameQuestions(gameid, successQuestionListFetch, null);
    }
    addToStorage('gameid', doc.data().gameid);
    addToStorage('queschanged', doc.data().queschanged.seconds);
    addToStorage('gamedatetime', doc.data().gamedatetime.seconds);

    $('.gamedate').text( new Date(doc.data().gamedatetime.seconds*1000) );
}

/**
 * Called when question list for current game is fetched from Firestore
 * @param {*} doc - JSON Data - question list
 */
function successQuestionListFetch(doc) {
    console.log("Picked data from firestore");
    qList = doc.data();
    addToStorage("qlist", JSON.stringify(qList));
    qList = JSON.parse(getFromStorage("qlist"));
    iterateQuestions(qList);
}

/**
 * Iterate JSON data to create UI
 * @param {*} qList - JSON data from Firestore or Cache
 */
function iterateQuestions(qList) {
    let index = 0;
    Object.keys(qList).forEach((qdockey) => {
        let qdoc = qList[qdockey];
        createQuestionRow(qdoc.question, qdoc.answer, index, container);
        index++
    });
}

/**
 * Handler for Signout button
 */
/* function signout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = '/questions.html';
    }).catch(function(error) {
        // An error happened.
    });
} */

/* function getTicket() {
    let gameId = getFromStorage('gameid');
    db.collection("tickets").doc(gameId + "_" + uid).get()
    .then((doc) => {
        return doc.data();
    })
    .catch((error) => {
        console.error("Error getting ticket: ", error);
    });
    return null;
} */


/**
 * Handler for Ticket button
 * @param {*} e - event
 */
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


/**
 * On page load function
 */
$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActions();
    loadSharingButtons();
    $('#btnLogout').click(signout);
    $('#btnTicket').click(generateTicket);
});

checkLogin(firebase.auth(), successLogin, failureLogin);
init();
