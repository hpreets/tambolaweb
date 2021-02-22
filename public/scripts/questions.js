const container = $('.container-fluid');
let qList = null;



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
    console.log(gameid);
    getFSSettingsData(successCurrGameFetch, null);
}

/**
 * Called when Current Game Settings data is fetched from Firestore
 * @param {*} doc - JSON Data - current game settings
 */
function successCurrGameFetch(doc) {
    console.log('INSIDE successCurrGameFetch');
    gameid = doc.data().gameid;

    if (getFromStorage('gameid') != null  
            &&  doc.data().gameid == getFromStorage('gameid')  
            &&  doc.data().queschanged.seconds == getFromStorage('queschanged')
            &&  getFromStorage('qlist') != null
            ) {
        // Questions not changed, use the data from cache
        console.log("Picking data from Cache");
        qList = JSON.parse(getFromStorage("qlist"));
        iterateQuestions(qList);
    }
    else {
        // Clear all storage including storage of ticket and other pages
        clearStorage();
        addSettingsToCache(doc);

        // Picking data from game questions - gameques/<gameid>/questions
        getFSCurrGameQuestions(gameid, successQuestionListFetch, null);
    }

    $('.gamedate').text( new Date(getFromStorage('gamedatetime')*1000) );
}


/**
 * Called when question list for current game is fetched from Firestore
 * @param {*} doc - JSON Data - question list
 */
function successQuestionListFetch(doc) {
    console.log("Picked data from firestore ::");
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
        if (qdockey !== '_gameover') {
            console.log('qdockey ::' + qdockey + '; qdoc ::' + qdoc);
            createQuestionRow(qdoc.question, qdoc.answer, index, container);
            index++
        }
    });
}


/**
 * On page load function
 */
$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActions();
    loadSharingButtons();
});

checkLogin(firebase.auth(), successLogin, failureLogin);
init();