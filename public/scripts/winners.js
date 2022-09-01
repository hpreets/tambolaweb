const container = $('.winnerTable');
let winnerUn;
let winnerPrize = '';



/**
 * Create a UI row for each winner 
 * @param {*} winners - comma separate winner email addresses
 * @param {*} prizeId - prizeId like EF, FL, ML etc.
 * @param {*} prizeName - prize text to be displayed on UI
 * @param {*} container - parent element to which row to be added
 */
function createWinnerRow(winners, prizeId, prizeName, container) {
    logMessage('winners ::' + winners);
    let row = createNode('div');
    let prizeNameDiv = createNode('div');
    let winnerDiv = createNode('div');
    
	// Changed column width to 3/9 instead of 6/6 - HS 01-09-2022
    $(prizeNameDiv).addClass('col-lg-3 col-sm-12');
    $(winnerDiv).addClass('col-lg-9 col-md-auto col-sm-12');

    $(prizeNameDiv).html('<h6>' + prizeName + '</h6>'); // Made heading prominent - HS 01-09-2022
    $(winnerDiv).html(winners[prizeId].join('<br/><br/>')); // Used newline instead of comma - HS 01-09-2022
    row.append(prizeNameDiv, winnerDiv);
    $(row).addClass('line row');
	
	// Highlighed winning prize row - HS 31-08-2022
    if (winnerPrize.indexOf(prizeId) >= 0) $(row).addClass('winner-colored-closed-box');
    
    container.append(row);
}


/**
 * Called when prize data is fetched from firestore
 * @param {*} doc - JSON data - prize data
 */
function successPrizeDataFetch(doc) {
    logMessage("Picking data from firestore");
    wList = doc.data();
    let winners = iterateWinners(wList);
    logMessage(winners);
	
	// Show user's prizes first rather than default order
    /*createWinnerRow(winners, 'EF', 'Early Five', container);
    createWinnerRow(winners, 'FL', 'First Line', container);
    createWinnerRow(winners, 'ML', 'Middle Line', container);
    createWinnerRow(winners, 'LL', 'Last Line', container);
    createWinnerRow(winners, 'FH', 'Full House', container);*/

	createAllPrizesRow(winners);
    spinnerVisible(false); // Hide spinner once data is created
	
	if (userWon) loadSharingButtons(); // Update sharing buttons to include winner's email address
}

function createMyPrizesRow(winners) {
	if (winnerPrize.indexOf('EF') >= 0) createWinnerRow(winners, 'EF', 'Early Five', container);
    if (winnerPrize.indexOf('FL') >= 0) createWinnerRow(winners, 'FL', 'First Line', container);
    if (winnerPrize.indexOf('ML') >= 0) createWinnerRow(winners, 'ML', 'Middle Line', container);
    if (winnerPrize.indexOf('LL') >= 0) createWinnerRow(winners, 'LL', 'Last Line', container);
    if (winnerPrize.indexOf('FH') >= 0) createWinnerRow(winners, 'FH', 'Full House', container);
}

function createOtherPrizesRow(winners) {
	if (winnerPrize.indexOf('EF') < 0) createWinnerRow(winners, 'EF', 'Early Five', container);
    if (winnerPrize.indexOf('FL') < 0) createWinnerRow(winners, 'FL', 'First Line', container);
    if (winnerPrize.indexOf('ML') < 0) createWinnerRow(winners, 'ML', 'Middle Line', container);
    if (winnerPrize.indexOf('LL') < 0) createWinnerRow(winners, 'LL', 'Last Line', container);
    if (winnerPrize.indexOf('FH') < 0) createWinnerRow(winners, 'FH', 'Full House', container);
}

function createAllPrizesRow(winners) {
	createMyPrizesRow(winners);
	createOtherPrizesRow(winners);
}


/**
 * Method called when current game settings data is fetched from firestore.
 * @param {*} doc - JSON data - current settings data
 */
function successCurrGameFetch(doc) {
    gameid = doc.data().gameid;
    prevgameid = doc.data().prevgameid;
    if (prevgameid === null  ||  doc.data().gameover == true) prevgameid = gameid;
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
            let wdocTick = '';
            logMessage(wdoc);
			
			// HS 31-08-2022
			if (wdoc == true) {
				wdoc = '';
				wdocTick = ' <span class="badge badge-warning"><i class="fas fa-regular fa-circle-exclamation"></i> UPI Id not set </span> ';
			}
			else if (wdoc != false) {
				wdoc = ' <span class="badge badge-light">Transaction Ref: '+wdoc.split('_')[0]+'</span>' + ' <span class="badge badge-light"> Payment Date: '+wdoc.split('_')[1]+'</span>';
				wdocTick = '<span class="badge badge-success"><i class="fas fa-circle-check"></i> Paid</span> ';
			}
			else wdoc = '';


            winnerDet = wdockey.split('_');
            let emailAddress = retrieveEmail(winnerDet);
			if (emailAddress == winnerUn  ||  emailAddress == userEmail) winnerPrize += winnerDet[1] + '_';
            emailAddress = hideEmailAddress(emailAddress);
            if (winners[winnerDet[1]]) {
                winners[winnerDet[1]].push(wdocTick + emailAddress + wdoc);
            }
            else {
                winners[winnerDet[1]] = [ wdocTick + emailAddress + wdoc ];
            }
        });
    }

    return winners;
}

function hideEmailAddress(email) {
    if (userEmail == email) {
		$('#personalMsg').show(); // HS 31-08-2022
		userWon = true;
		showConfetti(); // HS 31-08-2022
		return 'You (' + email + ')';
	}
    if (winnerUn == email) return email;
    
    let emailChars = email.split('@')[0].split('');
    logMessage(emailChars);
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

// Picks up 'un' param from url
function getWinnerUsername() {
	let currURL = $(location).attr('href')
	let paramString = currURL.split('?')[1];
	let queryString = new URLSearchParams(paramString);
	for (let pair of queryString.entries()) {
		if (pair[0] == 'un') winnerUn = pair[1];
	}
}

$(function onDocReady() {
	logMessage('Inside onDocReady');
    addHTMLToPage();
    loadHeaderActions();
    loadSharingButtons();
    $('#btnLogout').click(signout);
    // navbar collapse functionality
    menuCollapse();
	getWinnerUsername(); // HS 31-08-2022
});


checkLogin(firebase.auth());
init();

