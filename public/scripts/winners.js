// var db = firebase.firestore();
// var user = firebase.auth().currentUser;
// var functions = firebase.functions();
// let uid;
// alert('Hi');

const container = $('.container-fluid');
// let qList = null;
let gameid;

/* firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
        $('#loggedInUser').text(user.displayName);
        uid = user.uid;
        hideButtons(true);
    } else {
        console.log('User is NULL');
        hideButtons(false);
    }
}); */
  

/* function createNode(element) {
	return document.createElement(element);
} */

/**
 * Create a UI row for each winner 
 * @param {*} winners - comma separate winner email addresses
 * @param {*} prizeId - prizeId like EF, FL, ML etc.
 * @param {*} prizeName - prize text to be displayed on UI
 * @param {*} container - parent element to which row to be added
 */
function createWinnerRow(winners, prizeId, prizeName, container) {
    console.log('winners ::' + winners);
    let row = createNode('div');
    let prizeNameDiv = createNode('div');
    let winnerDiv = createNode('div');
    
    $(prizeNameDiv).addClass('col-lg-6 col-sm-12');
    $(winnerDiv).addClass('col-lg-6 col-md-auto col-sm-12');

    $(prizeNameDiv).html(prizeName);
    $(winnerDiv).html(winners[prizeId].join(', '));
    row.append(prizeNameDiv, winnerDiv);
    $(row).addClass('line row');
    
    container.append(row);
}


/**
 * Called when prize data is fetched from firestore
 * @param {*} doc - JSON data - prize data
 */
function successPrizeDataFetch(doc) {
    console.log("Picking data from firestore");
    wList = doc.data();
    let winners = iterateWinners(wList);
    console.log(winners);
    createWinnerRow(winners, 'EF', 'Early Five', container);
    createWinnerRow(winners, 'FL', 'First Line', container);
    createWinnerRow(winners, 'ML', 'Middle Line', container);
    createWinnerRow(winners, 'LL', 'Last Line', container);
    createWinnerRow(winners, 'FH', 'Full House', container);
}

/**
 * Method called when current game settings data is fetched from firestore.
 * @param {*} doc - JSON data - current settings data
 */
function successCurrGameFetch(doc) {
    gameid = doc.data().gameid;
    prevgameid = doc.data().prevgameid;
    getFSPrizeDetail(prevgameid, successPrizeDataFetch, null);
    /* db.collection("prizes").doc(prevgameid).get()
    .then((doc) => {
        console.log("Picking data from firestore");
        wList = doc.data();
        let winners = iterateWinners(wList);
        console.log(winners);
        createWinnerRow(winners, 'EF', 'Early Five', container);
        createWinnerRow(winners, 'FL', 'First Line', container);
        createWinnerRow(winners, 'ML', 'Middle Line', container);
        createWinnerRow(winners, 'LL', 'Last Line', container);
        createWinnerRow(winners, 'FH', 'Full House', container);
    }); */
}

/**
 * First method that initiates data fetch and UI creation
 */
function init() {
    // sessionStorage.clear();
    // clearStorage();
    getFSSettingsData(successCurrGameFetch, null);
    /* db.collection("settings").doc("currgame").get()
    .then((doc) => {
        gameid = doc.data().gameid;
        prevgameid = doc.data().prevgameid;
        db.collection("prizes").doc(prevgameid).get()
        .then((doc) => {
            console.log("Picking data from firestore");
            wList = doc.data();
            let winners = iterateWinners(wList);
            console.log(winners);
            createWinnerRow(winners, 'EF', 'Early Five', container);
            createWinnerRow(winners, 'FL', 'First Line', container);
            createWinnerRow(winners, 'ML', 'Middle Line', container);
            createWinnerRow(winners, 'LL', 'Last Line', container);
            createWinnerRow(winners, 'FH', 'Full House', container);
        });
    }); */
}

/**
 * Iterate through winners data and create UI
 * @param {*} wList - JSON data - winner data
 */
function iterateWinners(wList) {
    let winners = {};
    if (wList) {
        Object.keys(wList).forEach((wdockey) => {
            let wdoc = wList[wdockey];
            winnerDet = wdockey.split('_');
            let emailAddress = retrieveEmail(winnerDet);
            if (winners[winnerDet[1]]) {
                winners[winnerDet[1]].push(emailAddress);
            }
            else {
                winners[winnerDet[1]] = [ emailAddress ];
            }
        });
    }

    return winners;
}

/**
 * Retrieve winner email address from JSON key
 * @param {*} winnerDet - JSON data - winner data key
 */
function retrieveEmail(winnerDet) {
    let retVal = '';
    for (var i=2; i<winnerDet.length; i++) {
        retVal += retVal != '' ? '_'+winnerDet[i] : winnerDet[i];
    }
    return retVal;
}

/* function hideButtons(loggedIn) {
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
} */


/* function signout() {
    redirectTo('/questions.html');
} */


$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActions();
    loadSharingButtons();
    $('#btnLogout').click(signout);
});

// document.onload = function() {
//     console.log('ON LOAD');
//     // $('.btnTicket').click();
//     $('.btnLogout').click(signout);
// }


/* function setCurrGameQuestions() {
    db.collection("gameques").doc("20201228").set({});
    let gameques = db.collection("gameques").doc("20201228");
    let quesList = {};
    db.collection("questions").get().then((querySnapshot) => {
        let ctr = 0;
        querySnapshot.forEach((doc) => {
            let qdoc = doc.data();
            // console.log(`${doc.id} => ${qdoc} => ${qdoc.question} => ${qdoc.answer}`);

            let answer = qdoc.answer;
            quesList[answer] = qdoc;
            

        });
        console.log(quesList);
        gameques.update(quesList, { merge: true });
    });
} */

checkLogin(firebase.auth());
init();
// setCurrGameQuestions();
