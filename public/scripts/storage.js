var db = firebase.firestore();

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
    console.log('Inside checkLogin');
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
            $('#loggedInUser').text(user.displayName);
            uid = user.uid;
            hideHeaderButtons(true);
            if (successFunction !== null  &&  successFunction !== undefined) successFunction();
        } else {
            console.log('User is NULL');
            hideHeaderButtons(false);
            if (failureFunction !== null  &&  failureFunction !== undefined) failureFunction();
        }
    });
}

function signout(redirectTo) {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = ((redirectTo === null  ||  redirectTo ===undefined) ? '/questions.html' : redirectTo);
    }).catch(function(error) {
        // An error happened.
    });
}

/* ************************************************** */
/* ****************** COMMON UI ********************* */
/* ************************************************** */
function hideHeaderButtons(loggedIn) {
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

function createNode(element) {
	return document.createElement(element);
}

/**
 * Displays Sharing button on UI. Picks data from share.html; also sets the href for buttons
 */
function loadSharingButtons() {
    $('.sharewrapper').load('pagelets/share.html', function() {
        let currURL = $(location).attr('href');
        console.log(currURL);
        $('.facebookshare').attr('href', 'https://facebook.com/sharer/sharer.php?u=' + currURL);
        $('.twittershare').attr('href', 'https://twitter.com/intent/tweet/?text=Learn about Sikh History in a fun way: Sikh History Tambola.&url=' + currURL);
        $('.linkedinshare').attr('href', 'https://www.linkedin.com/shareArticle?mini=true&title=Learn about Sikh History in a fun way: Sikh History Tambola.&summary=Learn about Sikh History in a fun way: Sikh History Tambola.&url=' + currURL);
        $('.emailshare').attr('href', 'mailto:?subject=Learn about Sikh History in a fun way: Sikh History Tambola.&body=' + currURL);
        $('.whatsappshare').attr('href', 'whatsapp://send?text=Learn about Sikh History in a fun way: Sikh History Tambola. ' + currURL);
    });
}

function loadHeaderActions(success) {
    $('#headerActions').load('pagelets/headeraction.html', success);
}


/* ************************************************** */
/* ****************** FIRESTORE ********************* */
/* ************************************************** */
function getFirestoreData(collName, docName, success, failure) {
    db.collection(collName).doc(docName).get()
    .then((doc) => {
        console.log('Calling success');
        success(doc);
    })
    .catch((error) => {
        if (failure !== null  &&  failure !== undefined) failure(error);
    });
}

function getFSSettingsData(success, failure) {
    getFirestoreData("settings", "currgame", success, failure);
}

function getFSCurrGameQuestions(gameId, success, failure) {
    getFirestoreData("gameques", gameId, success, failure);
}

function getFSPrizeDetail(gameId, success, failure) {
    getFirestoreData("prizes", gameId, success, failure);
}