// const { triggerAsyncId } = require("async_hooks");

var db = firebase.firestore();
if (location.hostname === "localhost") { db.useEmulator("localhost", 8083); }
if (location.hostname.indexOf('192.168.1') >= 0) { db.useEmulator("localhost", 8083); }

var functions = firebase.app().functions('asia-south1');
if (location.hostname === "localhost") { functions.useEmulator("localhost", 5001); }

// HS 21-Dec-2021; Messaging not available on all browsers
var messaging;
try {
    messaging = typeof(firebase.messaging) === 'function' ? firebase.messaging() : null;
}
catch (e) {
    messaging = null;
}

// firebase.firestore.setLogLevel("debug");
var secondsInterval = 21;
let minBeforeTktAvailable = 15; // 60*24*365*2;
if (location.hostname === "localhost") { minBeforeTktAvailable = 60*24*365*2; }
let gameid;
let userEmail;
let userWon = false;
let uid;
const constVapidKey = 'BLmeZfIWsloraH9TUrVQ8H0m5sWtWhugxcSuj0SwRWYsuk74ZDjp91KR0erW_Aw5V5QR4k-e5MMgkY7P1bg1bX4';

/* ************************************************** */
/* ******************** CACHE *********************** */
/* ************************************************** */
function addToStorage(key, value) {
    sessionStorage.setItem(key, value);
}

function getFromStorage(key) {
    return sessionStorage.getItem(key);
}

function updateStorage(key, value) {
    addToStorage(key, value);
}

function clearStorage() {
    sessionStorage.clear();
}

function removeFromStorage(key) {
    sessionStorage.removeItem(key);
}

function addToLocalStorage(key, value) {
    let sikhitambola = {};
    if (localStorage.getItem('sikhitambola') != null) sikhitambola = JSON.parse(localStorage.getItem('sikhitambola'));
    sikhitambola[key] = value;
    localStorage.setItem('sikhitambola', JSON.stringify(sikhitambola));
}

function getFromLocalStorage(key) {
    let stJson = JSON.parse(localStorage.getItem('sikhitambola'));
    if (stJson == null) return null;
    return stJson[key];
}

/* ************************************************** */
/* ******************* LOGGING ********************** */
/* ************************************************** */
function logMessage(msg) {
	// console.log(msg);
}

/* ************************************************** */
/* ******************** LOGIN *********************** */
/* ************************************************** */
function checkLogin(auth, successFunction, failureFunction) {
    logMessage('Inside checkLogin');
    auth.onAuthStateChanged((user) => {
        if (user) {
            logMessage('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName + '; email ::' + user.email);
            $('#loggedInUser').text(user.displayName + ' (' + user.email + ')');
            uid = user.uid;
            userEmail = user.email;
            hideHeaderButtons(true, location.pathname.replace('.html', '').replace('/', ''));
            if (successFunction !== null  &&  successFunction !== undefined) successFunction(user);
        } else {
            logMessage('User is NULL');
            userEmail = 'hsastadia@gmail.com';
            hideHeaderButtons(false, location.pathname.replace('.html', '').replace('/', ''));
            if (failureFunction !== null  &&  failureFunction !== undefined) failureFunction(user);
        }
		// loadSharingButtons();
    });
}

function signout(e) {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        // window.location = ((redirectTo === null  ||  redirectTo ===undefined) ? '/questions.html' : redirectTo);
        window.location = '/questions.html';
    }).catch(function(error) {
        alert(error);
    });
}

noLogin = function(user) {
    window.location = '/login.html';
}

/* ************************************************** */
/* ****************** COMMON UI ********************* */
/* ************************************************** */
function hideHeaderButtons(loggedIn, pageId) {
    if (!loggedIn) {
        $('#btnSignup').hide();
        $('#btnLogin').show(); $('#action_login').show();
        $('#btnTicketLi').hide(); $('#action_ticket').hide();
        $('#btnLogoutLi').hide();
        $('#btnMySettingsLi').hide(); $('#action_mysettings').hide();
        $('.loginInstruction').show();
    }
    else {
        $('#btnTicketLi').show(); $('#action_ticket').show();
        $('#btnLogoutLi').show();
        $('#btnMySettingsLi').show(); $('#action_mysettings').show();
        $('#btnSignup').hide();
        $('#btnLogin').hide(); $('#action_login').hide();
        logMessage(isAdmin());
        $('.loginInstruction').hide();
        if (isAdmin()) $('#btnAdminHome').show();
    }

    $('#btnHome').show();
    $('#btnWinners').show();
    if (pageId !== undefined) $('#action_'+pageId).hide();
    $('#importantActions').show();
}

function createNode(element) {
	return document.createElement(element);
}

function redirectTo(toUrl) {
    if ((toUrl == '/mysettings.html') && (uid != null)) {
        window.location = toUrl;
    }
    else {
        window.location = '/login.html';
    }
}

/**
 * Displays Sharing button on UI. Picks data from share.html; also sets the href for buttons
 */
function loadSharingButtons() {
    $('.sharewrapper').load('pagelets/share.html', function() {
        let currURL = $(location).attr('href');
		
		// If its winner page, and curr user won
		if (currURL.indexOf('winners.html') >= 0  &&  userEmail != null  &&  userWon) currURL += '?un='+userEmail; // HS 30-08-2022
        logMessage(currURL);
        $('.facebookshare').attr('href', 'https://facebook.com/sharer/sharer.php?u=' + currURL);
        $('.twittershare').attr('href', 'https://twitter.com/intent/tweet/?text=Learn about Sikh History in a fun way: Sikhi Tambola.&url=' + currURL);
        $('.linkedinshare').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&title=Learn about Sikh History in a fun way: Sikhi Tambola.&summary=Learn about Sikh History in a fun way: Sikhi Tambola.&url=' + currURL);
        $('.emailshare').attr('href', 'mailto:?subject=Learn about Sikh History in a fun way: Sikhi Tambola.&body=' + currURL);
        $('.whatsappshare').attr('href', 'whatsapp://send?text=Learn about Sikh History in a fun way: Sikhi Tambola. ' + currURL);
    });
}

function loadHeaderActions(success) {
    $('#headerActions').load('pagelets/headeraction.html', 
        function() {
            addHowToPlayDialog();
            $('#btnLogout').click(signout);
            $('#btnTicket').click(generateTicket);
            $('.lnkTicket').click(generateTicket);
            // $('#action_ticket').click(generateTicket);
            if (success !== undefined) success();
        }
    );
}

/**
 * Handler for Ticket button
 * @param {*} e - event
 */
function generateTicket(e) {
    e.preventDefault();
    logMessage( getFromStorage('gamedatetime') );
    let gameDateTime = new Date(getFromStorage('gamedatetime')*1000);
    var currDateTime = new Date();
    currDateTime.setMinutes( currDateTime.getMinutes() + minBeforeTktAvailable );
    if (isLocalhost()) currDateTime.setDate( currDateTime.getDate() + minBeforeTktAvailable ); // TODO: Uncomment after testing
    logMessage( currDateTime );
    logMessage( gameDateTime );
    if (currDateTime > gameDateTime) {
        if (uid != null  &&  uid != undefined) {
            // alert('Time for play');
            window.location = '/ticket.html';
        }
        else {
            window.location = '/login.html';
        }
    }
    else {
        alert('The ticket would be available ' + minBeforeTktAvailable + ' minutes before the game.');
    }
}

function appendLeadingZeroes(n){
    if(n <= 9){
        return "0" + n;
    }
    return n
}


function displayBanner(doc) {
    // console.log('Inside displayBanner');
    // code for banner
    let startDate = doc.data().bannerStartDateTime;
    let currentDate = new Date().getTime();
    let endDate = doc.data().bannerEndDateTime;
    // console.log(startDate);
    // console.log(endDate);

    if (startDate == undefined) startDate = 1; else startDate = startDate.seconds * 1000;
    if (endDate == undefined) endDate = currentDate + 1000; else endDate = endDate.seconds * 1000;
    // console.log(doc.data().bannerText);
    // console.log(startDate);
    // console.log(currentDate);
    // console.log(endDate);

    if (doc.data().bannerText != undefined && currentDate > startDate && currentDate < endDate) {
        $('.banner').show();
        // $('.banner').html('Latest Updates!&ensp; <a href="login.html" class="btn btn-light">Go to Updates</a>');
        $('.banner').html(doc.data().bannerText);

        // bootstrap themes for banner - primary, secondary, success, danger, warning, info, light, dark and white
        let bannerTheme = doc.data().bannerTheme; // 'success';
        // console.log(doc.data().bannerTheme);
        if (bannerTheme === undefined) bannerTheme = 'success';
        $('.banner').addClass('bg-' + bannerTheme);
        $('.banner').css('color', 'white');

    } else {
        $('.banner').hide();
    }

}

function checkOrientation() {
    var currMode = "";
    let orientation = window.orientation;
    if (orientation === undefined) orientation = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
    switch(orientation) {

        case 0:
        case 'portrait-secondary':
        case 'portrait-primary':
        currMode = "portrait";
        break;

        case -90:
        case 90:
        case 180:
        case 'landscape-primary':
        case 'landscape-secondary':
        case '':
        currMode = "landscape";
        break;

        case undefined:
            if (window.innerWidth < window.innerHeight) {
                currMode = 'portrait';
            }
            else {
                currMode = 'landscape';
            }
            break;
   }
//    console.log('checkOrientation ::' + currMode);
   return currMode;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addHowToPlayDialog() {
    // console.log(document.getElementById("dialogs"));
    document.getElementById("dialogs").innerHTML += addHowToPlay(false, true);
    $('#btnHowToPlay').click(() => { $('#howToPlayDialogModal').modal('show'); });
}
function addHowToPlay(showHeaderText, forDialog) {
    let htmlId = 'howToPlay';
    let dialogTitleText = 'How to Play';
    let dialogIdSuffix = 'Dialog';
    let headerText = ``;
    let gotItButton = `
        <button class="btn btn-primary btn-sm" type="button" id="btnHowToPlay" data-toggle="howtoplay" data-target="#howtoplay" aria-expanded="true" aria-controls="howtoplayExample">
            Got it, don't show again.
        </button>
        <br><div class="small-text">You can always refer back to it using "How To Play" from the top-right Menu.</div></br>`;
    
    if (showHeaderText) headerText = `
        <div class="d-flex justify-content-between">
            <h2>How to play:</h2>
        </div>`;
    
    if (!forDialog) dialogIdSuffix = '';
    if (forDialog) gotItButton = '';
    let htmlDialogId = htmlId + dialogIdSuffix;

    let varHowToPlayTextHTML = `
    <div class="howtoplay" id="`+ htmlDialogId + `Div" style="padding-bottom: 25px;">
        ` + headerText + `
        <ul class="collapse show" id="instructions-info`+ htmlDialogId + `">
            <li>Every month we play Sikh Tambola game where rather than showing 15 numbers on the <a class="lnkTicket" href="#">tambola ticket</a>, we show 15 answers on it. </li>
            <li>Every user gets a <b>FREE ticket</b> for each game; no payment required.</li>
            <li>Instead of announcing numbers as happens in normal Tambola, here, we display a question randomly from the below list, one by one. </li>
            <li>If your <a class="lnkTicket" href="#">ticket</a> has the answer to the current question, you tap on answer to select it. </li>
            <li>As soon as you get 5 answers correctly tapped, you win Early Five prize.</li>
            <li>Similarly, you win First Line, Middle Line or Last Line when all answers from your respective lines are selected correctly.</li>
            <li>Finally, when all answers from your ticket are selected correctly, you win Full House. The winners of the game are shown on the <a href="winners.html">winners page</a>. Details of various cash prizes are also mentioned on the <a href="winners.html">winners page</a>.</li>
            <li><b><u>So, all in all - Play without paying; Get paid on winning.</u></b></li>
        </ul>
        <div class="loginInstruction">
            <u><b>Important</b></u>: To be able to generate a <a class="lnkTicket" href="#">ticket</a>, you need to be logged in. We highly recommend that you <a href="login.html">login now</a> itself in order to avoid last minute hassle while generating the <a class="lnkTicket" href="#">ticket</a>.
        </div>
        ` + gotItButton + `
    </div>
    `;

    let varHowToPlayDialogHTML = ``;
    if (!forDialog) varHowToPlayDialogHTML = varHowToPlayTextHTML;
    else {
        varHowToPlayDialogHTML = `  <!-- Rotate Screen Modal -->
        <div class="modal fade" id="` + htmlDialogId + `Modal" tabindex="-1" role="dialog" aria-labelledby="` + htmlDialogId + `ModalTitle" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="` + htmlDialogId + `ModalTitle">` + dialogTitleText + `</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body row">
                <div class="col-12">
                <span class="list-group" id="` + htmlDialogId + `Text">
                    ` + varHowToPlayTextHTML + `
                </span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
            </div>
        </div>
        </div>
        `;
    }

    return varHowToPlayDialogHTML;
}

function generateImportantActions() {
    let actionHtml = `
        <div class="row">
            <div class="col hide" id="action_login">
                <a class="btn btn-primary btn-circular" href="login.html" role="button"><i class="fas fa-user-plus"></i></a>
                <div class="button-info">Login</div>
            </div>
            <div class="col hide" id="action_questions">
                <a class="btn btn-primary btn-circular" href="questions.html" role="button"><i class="fas fa-list-ol"></i></a>
                <div class="button-info">Questions</div>
            </div>
            <div class="col lnkTicket" id="action_ticket">
                <a class="btn btn-primary btn-circular" href="#" role="button"><i class="fas fa-ticket-alt"></i></a>
                <div class="button-info">Ticket</div>
            </div>
            <div class="col" id="action_winners">
                <a class="btn btn-primary btn-circular" href="winners.html" role="button"><i class="fas fa-trophy"></i></a>
                <div class="button-info">Winners</div>
            </div>
            <div class="col" id="action_mysettings">
                <a class="btn btn-primary btn-circular" href="mysettings.html" role="button"><i class="fas fa-user-cog"></i></a>
                <div class="button-info">My Settings</div>
            </div>
        </div>`;
    document.getElementById("importantActions").innerHTML += actionHtml;
}

function addHTMLToPage() {
    generateImportantActions();
}

// navbar collapse functionality
function menuCollapse(){
    $(document).click(
        function (event) {
            var target = $(event.target);
            var _mobileMenuOpen = $(".navbar-collapse").hasClass("show");
            if (_mobileMenuOpen === true && !target.hasClass("navbar-toggler")) {
                $("button.navbar-toggler").click();
            }
        }
    );
}

function sortJson(jsn, sortOn) {
	if (jsn.length > 0) {
		jsn.sort((a, b) => {
			let fa = a[sortOn], fb = b[sortOn];

			// Take care of number sorting for numbers - HS 30-08-2022
			if (!isNaN(fa)) fa = ('0000'+fa).slice(-4); 
			if (!isNaN(fb)) fb = ('0000'+fb).slice(-4);

            var retVal = 0;
            
			if (fa > fb) {
				retVal = 1;
			}
			if (fa < fb) {
				retVal = -1;
			}
            return retVal;
		});
    }
    return jsn;
}

function createJsonArr(qList) {
    var retJson = [];
    Object.keys(qList).forEach((qdockey) => {
        let qdoc = qList[qdockey];
        retJson.push(qdoc);
    });
    return retJson;
}

function spinnerVisible(isVisible) {
    if (isVisible) {
        $('.spinner').show();
    }
    else {
        $('.spinner').hide();
    }
}

function showConfetti() {
	confetti({
	  particleCount: 150,
	  spread: 70,
	  origin: { y: 0.6 }
	});
	
	setTimeout(() => {
	  confetti.reset();
	}, 7000);
}


/* ************************************************** */
/* ****************** FIRESTORE ********************* */
/* ************************************************** */
function getFirestoreDataColl(collName, where, order, limit, success, failure) {
    let collData = db.collection(collName);
    if (where !== null) collData = collData.where('keywords', 'array-contains-any', where);
    else if (order !== null) collData = collData.orderBy(order);
    if (limit !== null) collData = collData.limit(limit);
    logMessage(collData);
    collData.get()
    .then((querySnapshot) => {
        logMessage('Calling collection success');
        if (success !== null  &&  success !== undefined) success(querySnapshot);
    })
    .catch((error) => {
        logMessage(error);
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
}

function getFSQuestionList(where, order, limit, success, failure) {
    getFirestoreDataColl("questions", where, order, limit, success, failure);
}


function getFirestoreData(collName, docName, success, failure) {
    db.collection(collName).doc(docName).get()
    .then((doc) => {
        if (success !== null  &&  success !== undefined) success(doc);
    })
    .catch((error) => {
        if (jQuery.isFunction(failure)  &&  failure !== null  &&  failure !== undefined) failure(error);
    });
}

function addSettingsToCache(doc) {
    if (doc !== undefined && doc.data() !== undefined  &&  doc.data() !== null) {
        logMessage('INSIDE addSettingsToCache');
        addToStorage('gameid', doc.data().gameid);
        if (doc.data().queschanged !== undefined) addToStorage('queschanged', doc.data().queschanged.seconds);
        if (doc.data().gamedatetime !== undefined) addToStorage('gamedatetime', doc.data().gamedatetime.seconds);
        logMessage('INSIDE addSettingsToCache ::' + doc.data().gameid);
        logMessage('INSIDE addSettingsToCache ::' + getFromStorage('gameid'));
    }
    else {
        logMessage('INSIDE addSettingsToCache :: doc.data() IS UNDEFINED');
    }
}

function getFSSettingsData(success, failure) {
    getFirestoreData("settings", "currgame", 
        function(doc) {
            if (getFromStorage('gameid') != null  
            &&  doc.data().gameid == getFromStorage('gameid')  
            &&  doc.data().queschanged.seconds == getFromStorage('queschanged')
            ) {
                //
            }
            else clearStorage();
            
            addSettingsToCache(doc);
            if (success !== undefined) success(doc);
            displayBanner(doc);
        }, 
        function (err) {
            logMessage(err);
            if (jQuery.isFunction(failure)  &&  failure !== undefined) failure(err);
        }
    );
}

function getFSCurrGameQuestions(gameId, success, failure) {
    getFirestoreData("gameques", gameId, success, failure);
}

function getFSPrizeDetail(gameId, success, failure) {
    getFirestoreData("prizes", gameId, success, failure);
}

function getFSPrizeDetailLatest(success, failure) {
    getFirestoreData("prizes", "latest", success, failure);
}

function getFSUserTicket(gameId, uid, success, failure) {
    getFirestoreData("tickets", gameId + "_" + uid, success, failure);
}

function getFSUserDetail(success, failure) {
    getFirestoreData("users", userEmail, success, failure);
}

function listenToFirestoreData(collName, docName, success, failure) {
    return db.collection(collName).doc(docName)
    .onSnapshot((doc) => {
        logMessage('Calling success');
        success(doc);
    }, (error) => {
        logMessage('Calling failure');
        failure(error);
    });
}

function listenToFSQuestions(gameId, success, failure) {
    return listenToFirestoreData("gameques", gameId, success, failure);
}

function listenToLatestPrize(success, failure) {
    return listenToFirestoreData("prizes", "latest", success, failure);
}

function createQuestionJSON(ques, ans, pques, pans, info, status, keywords) {
    let qjson = {};
    qjson.question = ques;
    qjson.answer = ans;
    qjson.info = info;
    qjson.pquestion = pques;
    qjson.panswer = pans;
    qjson.status = status;
    qjson.keywords = keywords;
    qjson.addedOn = firebase.firestore.Timestamp.now();
    return qjson;
}
function addToQuestionColl(data, success, failure) {
    db.collection("questions").add(data)
    .then(function(doc) {
        logMessage("Document written with ID: ", doc.id);
        if (success !== null  &&  success !== undefined) success(doc);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
}
function addToQuestionCollection(ques, ans, pques, pans, info, status, keywords, success, failure) {
    let qjson = createQuestionJSON(ques, ans, pques, pans, info, status, keywords);
    addToQuestionColl(qjson, success, failure);
}
function updateQuestionInCollection(qdocId, ques, ans, pques, pans, info, status, keywords, success, failure) {
    let qjson = createQuestionJSON(ques, ans, pques, pans, info, status, keywords);
    updateQuestionInColl(qdocId, qjson, success, failure);
}
function updateQuestionInColl(qDocId, data, success, failure) {
    db.collection("questions").doc(qDocId).update(data)
    .then(function(doc) {
        logMessage("Document written with ID: ", qDocId);
        if (success !== null  &&  success !== undefined) success(doc);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
}

function saveMerge(collName, docName, docJSON, success, failure) {
    db.collection(collName).doc(docName).set(docJSON, { merge: true })
    .then(function(doc) {
        logMessage("saveMerge :: Document written with ID: ", doc);
        if (success !== null  &&  success !== undefined) success(doc);
    })
    .catch(function(error) {
        console.error("saveMerge :: Error adding document: ", error);
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
}

function deleteRec(collName, docName, success, failure) {
    db.collection(collName).doc(docName).delete()
    .then((doc) => {
        logMessage("Document successfully deleted!");
        if (success !== null  &&  success !== undefined) success(doc);
    }).catch((error) => {
        console.error("Error removing document: ", error);
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
}

function deleteQuestion(docName, success, failure) {
    deleteRec("questions", docName, success, failure);
}


/* function addUserNotifToken(tokenMonth, data, success, failure) {
    db.collection("tokens").doc(tokenMonth).set(data, {merge: true })
    .then(function(doc) {
        // logMessage("Document written with ID: ", doc.id);
        if (success !== null  &&  success !== undefined) success(doc);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
} */


/* ************************************************** */
/* ****************** FUNCTION ********************** */
/* ************************************************** */
function callCloudFunction(functionName, params, success, failure) {
    logMessage('Inside callCloudFunction ' + functionName);
    var addMessage = functions.httpsCallable(functionName);
    addMessage(params)
    .then((result) => {
        logMessage('Inside callCloudFunction success');
        if (success !== undefined) success(result);
    })
    .catch((e) => {
        logMessage('Inside callCloudFunction failure');
        console.error(e);
        if (failure !== undefined) failure(e);
    });
}


/* ************************************************** */
/* ****************** MESSAGING ********************* */
/* ************************************************** */

/**
 * Has notification access been granted?
 * @returns true only when Notification.permission is neither denied nor default
 */
function isNotificationAccessGranted() {
    // console.log('Notification.permission', Notification.permission);
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
        console.log('Notification access NOT granted');
        return false;
    }
    console.log('Notification access IS granted');
    return true;
}


/**
 * Has user responded on notification access
 * @returns 
 */
function isNotificationAccessResponded() {
    if (Notification.permission === 'default') {
        return false;
    }
    return true;
}


/**
 * Saves client token to firebase and subscribes it to reminder channel
 * @param {*} token user token used for notification subscription. Makes a call to firebase function.
 * @param {*} isEnabled enable notification
 * @param {*} success function on successful subscription
 * @param {*} failure function on failure of subscription
 */
function setClientTokenSubscription(token, isEnabled, success, failure) {
    // console.log('Inside setClientTokenSubscription');
    let tokenSavedKey = 'tokenSavedOn';
    let saveTokenAgainAfter = 7*24*60*60*1000;
    // console.log('getFromStorage(tokenSaved)', getFromLocalStorage(tokenSavedKey), Date.now());
    if (!getFromLocalStorage(tokenSavedKey)  ||  getFromLocalStorage(tokenSavedKey) < Date.now()) {
        // console.log('Calling cloud function');
        callCloudFunction('subscribeToNotification', { 
            clienttoken : token,
            tokenSubscribed: isEnabled
        }, 
        function() {
            addToLocalStorage(tokenSavedKey, Date.now() + (saveTokenAgainAfter));
            // console.log('getFromStorage(tokenSaved)', getFromLocalStorage(tokenSavedKey));
            if (success !== undefined) success();
        }, 
        failure);
    }
}


/**
 * If token is allowed and available, it makes a call to Firebase function to store token and subscribe it for notification.
 * @param {*} success Success function when token is subscribed
 * @param {*} failure Failure function when token fails to subscribe
 */
function getNotificationPermission(success, failure) {
    if (messaging != null) {
        messaging.getToken({ vapidKey: constVapidKey })
        .then((currentToken) => {
            if (currentToken) {
                console.log(currentToken);
                setClientTokenSubscription(currentToken, true, success, failure);
            } else {
                // Show permission request UI
                console.log('No registration token available. Request permission to generate one.');
                if (failure !== undefined) failure();
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
            if (failure !== undefined) failure();
        });
    }
}


/**
 * Displays notification while browser is still open
 * @param {*} titleText notification title text
 * @param {*} bodyText notification body text
 * @param {*} imgUrl notification icon
 * @param {*} clickUrl url to open on notification click
 * @param {*} isVibrate virbrate on notification
 * @param {*} autoCloseAfterSec auto close after how many seconds
 */
function createAndShowNotification(titleText, bodyText, imgUrl, clickUrl, isVibrate, autoCloseAfterSec) {
    // var notification = new Notification("Hi there!");
    let notification = new Notification(titleText, {
        body: bodyText,
        icon: imgUrl,
        vibrate: isVibrate
    });

    // close the notification after 10 seconds
    if (autoCloseAfterSec != undefined) {
        setTimeout(() => {
            notification.close();
        }, autoCloseAfterSec * 1000);
    }

    // navigate to a URL
    notification.onclick = function() {
        window.location = clickUrl;
    };
}


/**
 * Listen to notification foreground message; while browser is open.
 */
function trackOnMessageReceived() {
    if (messaging != null) {
        messaging.onMessage((payload) => {
            console.log('Message received. ', payload);
            createAndShowNotification(payload.notification.title, payload.notification.body, 'https://sikhitambola.web.app/img/apple-touch-icon.png', 'https://sikhitambola.web.app/', true);
        });
    }
}


/* ************************************************** */
/* ****************** ADMIN UI ********************** */
/* ************************************************** */

isLocalhost = function() {
    return location.hostname === "localhost";
};

isAdmin = function() {
    if (isLocalhost() || uid == '2CcF64X5WzgS50UB8ZMw5RjHP1o1' ||  uid == 'j2ZOUSePSJOKWdgqxjoOQeBwGNY2') {
        return true;
    }
    return false;
};

/**
 * Called when user is logged in
 */
 successAdminLogin = function() {
    logMessage('Inside successLogin');
    if (!isAdmin()) {
        failureAdminLogin();
    }
    /* if (uid == '2CcF64X5WzgS50UB8ZMw5RjHP1o1' ||  uid == 'j2ZOUSePSJOKWdgqxjoOQeBwGNY2') {
        // Allow
    }
    else {
        failureAdminLogin();
    } */
};
/**
 * Called when user is NOT logged in
 */
failureAdminLogin = function() {
    logMessage('Inside failureLogin');
    window.location = '/questions.html';
};

checkAdminLogin = function() {
    checkLogin(firebase.auth(), successAdminLogin, failureAdminLogin);
}

function loadHeaderActionsAdmin(success) {
    $('#headerActions').load('pagelets/headeractionadmin.html', 
        function() {
            $('#btnLogout').click(signout);
            if (success !== undefined) success();
        }
    );
}
