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