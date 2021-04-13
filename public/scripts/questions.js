const container = $('.quesDiv');
let qList = null;
let currGameSettings = null;



/**
 * Called when user is logged in
 */
successLogin = function() {
  logMessage('Inside successLogin');
};
/**
 * Called when user is NOT logged in
 */
failureLogin = function() {
  logMessage('Inside failureLogin');
};


/**
 * Creates each UI row while iterating through question list JSON
 * @param {*} ques - Question text
 * @param {*} answ - Answer text
 * @param {*} index - The counter
 * @param {*} container - Parent element to which this row is added
 */
function createQuestionRow(ques, answ, index, container, isNew) {
    let rowsno = index + 1 + '.';
    let rowquestion = ques;
    let rowanswer = answ;
    let counter = index + 1;
    if (isNew) rowanswer = rowanswer + ' <sup class="badge badge-secondary">New</sup>';

    let row = createNode('div');
    // let snodiv = createNode('div');
    let quesdiv = createNode('div');
    let answdiv = createNode('div');
    
    // $(snodiv).addClass('col-lg-1 col-sm-12');
    // $(quesdiv).addClass('col-lg-7 col-md-auto col-sm-12');
    $(quesdiv).addClass('col-lg-8 col-md-auto col-sm-12');
    $(answdiv).addClass('col-lg-4 col-sm-12 text-primary');
    // $(snodiv).html(rowsno);
    $(quesdiv).html(rowsno + ' ' + rowquestion);
    $(answdiv).html(' - ' + rowanswer);
    // row.append(snodiv, quesdiv, answdiv);
    row.append(quesdiv, answdiv);
    $(row).addClass('line row');
    
    container.append(row);

    if(counter % 10 == 0){
        let ad = createNode('div');
        $(ad).text('adv.');
        $(ad).addClass('display-3');
        container.append(ad);
    }
}

/**
 * First method that initiates data fetch from Firestore / Cache
 */
function init() {
  // clearStorage();
  logMessage(gameid);
  getFSSettingsData(successCurrGameFetch, null);
}

/**
 * Called when Current Game Settings data is fetched from Firestore
 * @param {*} doc - JSON Data - current game settings
 */
function successCurrGameFetch(doc) {
    logMessage('INSIDE successCurrGameFetch');
    currGameSettings = doc.data();
    gameid = doc.data().gameid;

    if (/* getFromStorage('gameid') != null  
            &&  doc.data().gameid == getFromStorage('gameid')  
            &&  doc.data().queschanged.seconds == getFromStorage('queschanged')
            && */  getFromStorage('qlist') != null
            ) {
        // Questions not changed, use the data from cache
        logMessage("Picking data from Cache");
        qList = JSON.parse(getFromStorage("qlist"));
        iterateQuestions(qList);
    }
    else {
        // Clear all storage including storage of ticket and other pages
        // clearStorage();
        // addSettingsToCache(doc);

        // Picking data from game questions - gameques/<gameid>/questions
        getFSCurrGameQuestions(gameid, successQuestionListFetch, null);
    }

    let gDate = new Date(getFromStorage('gamedatetime')*1000);
    $('.gamedate').text( gDate.toDateString() + ' ' + gDate.toLocaleTimeString() + '' );
    // $('.gamedate').text( gDate );
    logMessage('HIDING SPINNER');
    $('#spinnerModal').modal('hide');
    displaySubHeadingBar(true);
}


/**
 * Called when question list for current game is fetched from Firestore
 * @param {*} doc - JSON Data - question list
 */
function successQuestionListFetch(doc) {
  logMessage("Picked data from firestore ::");
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
            // logMessage('qdockey ::' + qdockey + '; qdoc ::' + qdoc);
            createQuestionRow(qdoc.question, qdoc.answer, index, container, qdoc.new);
            index++
        }
    });
}

function displaySubHeadingBar(checkButtonsToo) {
    let gameDateTime = new Date(getFromStorage('gamedatetime')*1000);
    var currDateTime = new Date();
    currDateTime.setMinutes( currDateTime.getMinutes() + 15 );
    // if (isLocalhost()) currDateTime.setDate( currDateTime.getDate() + 15 ); // TODO: Uncomment after testing
    logMessage( 'displaySubHeadingBar :: currDateTime ::' + currDateTime );
    logMessage( 'displaySubHeadingBar :: gameDateTime ::' + gameDateTime );
    logMessage( 'displaySubHeadingBar :: currGameSettings.gameover ::' + currGameSettings.gameover );
    if (currDateTime > gameDateTime  &&  currGameSettings.gameover == false) {
        logMessage(currDateTime + ' > ' + gameDateTime);
        $('.subheadingbar').css('display', 'flex');
        if (checkButtonsToo) {
            if (uid != null  &&  uid != undefined) {
                $('.shlnkTicket').css('display', 'flex');
                $('.shLnkLogin').css('display', 'none');
            }
            else {
                $('.shLnkLogin').css('display', 'flex');
                $('.shlnkTicket').css('display', 'none');
            }
        }
    }
}

/**
 * On page load function
 */
$(function onDocReady() {
	logMessage('Inside onDocReady');
    // $('#spinnerModal').modal('show');
    loadHeaderActions();
    loadSharingButtons();
    // displaySubHeadingBar(false);
    // checkLogin(firebase.auth(), successLogin, failureLogin);
});

function checkDisplaySubHeadingBar() {
    logMessage('Inside checkDisplaySubHeadingBar');
    displaySubHeadingBar(true);
    logMessage('Going out of checkDisplaySubHeadingBar');
}

checkLogin(firebase.auth(), successLogin, failureLogin);
init();

var subheader = null;
if (subheader == null) subheader = setInterval(checkDisplaySubHeadingBar, 60000);

