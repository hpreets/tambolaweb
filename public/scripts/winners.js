const container = $('.container-fluid');




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
    if (prevgameid === null) prevgameid = gameid;
    getFSPrizeDetail(prevgameid, successPrizeDataFetch, null);
}

/**
 * First method that initiates data fetch and UI creation
 */
function init() {
    getFSSettingsData(successCurrGameFetch, null);
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
            console.log(wdoc);
            if (wdoc != false) wdoc = ' <sup class="badge badge-secondary">Transaction Ref: '+wdoc.split('_')[0]+'</sup>' + ' <sup class="badge badge-secondary"> Payment Date: '+wdoc.split('_')[1]+'</sup>'; else wdoc = '';
            winnerDet = wdockey.split('_');
            let emailAddress = retrieveEmail(winnerDet);
            emailAddress = hideEmailAddress(emailAddress);
            if (winners[winnerDet[1]]) {
                winners[winnerDet[1]].push(emailAddress + wdoc);
            }
            else {
                winners[winnerDet[1]] = [ emailAddress + wdoc ];
            }
        });
    }

    return winners;
}

function hideEmailAddress(email) {
    if (userEmail == email) return 'You (' + email + ')';
    
    let emailChars = email.split('@')[0].split('');
    console.log(emailChars);
    var emailRet = '';
    for (var i = 0; i < emailChars.length; i++) {
        if (i % 2 != 0) emailRet += '*';
        else emailRet += emailChars[i];
    }
    return emailRet + '@' + email.split('@')[1];
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

$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActions();
    loadSharingButtons();
    $('#btnLogout').click(signout);
});


checkLogin(firebase.auth());
init();

