var db = firebase.firestore();
if (location.hostname === "localhost") { db.useEmulator("localhost", 8082); }
// firebase.firestore.setLogLevel("debug");
var secondsInterval = 21;
let gameid;
let userEmail;
let uid;

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
            $('#loggedInUser').text(user.displayName);
            uid = user.uid;
            userEmail = user.email;
            hideHeaderButtons(true);
            if (successFunction !== null  &&  successFunction !== undefined) successFunction(user);
        } else {
            logMessage('User is NULL');
            hideHeaderButtons(false);
            if (failureFunction !== null  &&  failureFunction !== undefined) failureFunction(user);
        }
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
function hideHeaderButtons(loggedIn) {
    if (!loggedIn) {
        $('#btnSignup').hide();
        $('#btnLogin').show();
        $('#btnTicketLi').hide();
        $('#btnLogoutLi').hide();
        $('#btnMySettingsLi').hide();
        $('.loginInstruction').show();
    }
    else {
        $('#btnTicketLi').show();
        $('#btnLogoutLi').show();
        $('#btnMySettingsLi').show();
        $('#btnSignup').hide();
        $('#btnLogin').hide();
        logMessage(isAdmin());
        $('.loginInstruction').hide();
        if (isAdmin()) $('#btnAdminHome').show();
    }
    $('#btnHome').show();
    $('#btnWinners').show();
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
            $('#btnLogout').click(signout);
            $('#btnTicket').click(generateTicket);
            $('.lnkTicket').click(generateTicket);
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
    currDateTime.setMinutes( currDateTime.getMinutes() + 15 );
    if (isLocalhost()) currDateTime.setDate( currDateTime.getDate() + 15 ); // TODO: Uncomment after testing
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
        alert('The ticket would be available 15 minutes before the game.');
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
        logMessage('Calling success');
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
    db.collection(collName).doc(docName).set(docJSON)
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

/* ************************************************** */
/* ****************** FUNCTION ********************** */
/* ************************************************** */
function callCloudFunction(functionName, params, success, failure) {
    var addMessage = functions.httpsCallable(functionName);
    addMessage(params)
    .then((result) => {
        if (success !== undefined) success(result);
    })
    .catch((e) => {
        console.error(e);
        if (failure !== undefined) failure(e);
    });
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

