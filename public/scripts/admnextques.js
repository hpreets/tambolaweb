
var db = firebase.firestore();
var user = firebase.auth().currentUser;
var functions = firebase.functions();
// let uid;

// Read Data
const container = $('.container-fluid');
let qList = null;
// let gameid; // Already declared in storage.js
let answerCtr = 0;
let coveredAnswersArr = [];
let coveredAnswersStr = '';

var count = secondsInterval;
var counter = null;
let prizeDetails;
let allPrizesWon = false;

// Harpreet 2022-09-19
let winners = {};

// alert('Hi');

/* firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
        $('#loggedInUser').text(user.displayName);
        uid = user.uid;
		hideButtons(true);
		init();
		listenToClaimedPrizes();
    } else {
        console.log('User is NULL');
        hideButtons(false);
    }
}); */


function createNode(element) {
	return document.createElement(element);
}

function createAnswerButton(ques, answ, coveredCtr) {

	let btn = createNode('button');
	$(btn).addClass('btn btn-success col-sm-1');
	if (coveredCtr >= 0) $(btn).addClass('active');
	else $(btn).addClass('uncovered');
	$(btn).attr('data-question', ques);
	$(btn).on("click", pickNextQuesFromBtn);
	$(btn).html(answ);
	
	return btn;
}


function init() {
    db.collection("settings").doc("currgame").get()
    .then((doc) => {
		gameid = doc.data().gameid;
		// gameid = "20201228";
		
		// Picking data from game questions - gameques/<gameid>/questions
		db.collection("gameques").doc(gameid).get()
		.then((doc) => {
			console.log("Picking data from firestore");
			console.log(doc.data());
			// console.log(JSON.stringify(doc.data()));
			// qList = doc.data().questions;
			// console.log(JSON.stringify(doc.data().questions[89]));
			iterateQuestions(doc.data());

			console.log('Setting Covered Answer :: coveredAnswersArr :: ' + coveredAnswersArr);
			setCoveredAns(coveredAnswersArr);
		});

    });
}

function setCoveredAns(covQues) {
	if (covQues.length > 0) {
		console.log(covQues);
		covQues.sort((a, b) => {
			let fa = a.coveredIndex,
				fb = b.coveredIndex;
		
			if (fa < fb) {
				return -1;
			}
			if (fa > fb) {
				return 1;
			}
			return 0;
		});

		covQues.forEach((ques) => {
			coveredAnswersStr = coveredAnswersStr + ques.answer + '#';
		});
		console.log('coveredAnswersStr ::' + coveredAnswersStr);

	}
}

function iterateQuestions(qList) {
	let index = 0;
	
	let ctr = 0;
	let rowCtr = 1;
	let row = createNode('div');
	
    Object.keys(qList).forEach((qdoc) => {

		// console.log(qList[qdoc]);
		let ques = qList[qdoc];
		// Add gutter to the left
		if (ctr == 0) {
			row = createNode('div');
			$(row).addClass('line row');

			let border = createNode('span');
			$(border).addClass('col-lg-1');
			$(border).html(rowCtr);
			row.append(border);
			ctr++;
			rowCtr++;
		}

		// Add Answer Button
		if (ques.coveredIndex != null  &&  answerCtr < ques.coveredIndex) answerCtr = ques.coveredIndex;
		row.append(createAnswerButton(ques.question, ques.answer, ques.coveredIndex));

		if (ques.coveredIndex != null  &&  ques.coveredIndex >= 0) coveredAnswersArr.push(ques);
		ctr++;

		// Add gutter to the right
		if (ctr == 11) {
			let border = createNode('span');
			$(border).addClass('col-lg-1');
			row.append(border);
			ctr++;
		}

		// Add button row and reset
		if (ctr == 12) {
			container.append(row);
			ctr = 0;
		}

        index++
    });
}


function hideButtons(loggedIn) {
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


function signout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = '/questions.html';
    }).catch(function(error) {
        // An error happened.
    });
}


function pickNextQuesFromBtn() {
	processNextQues(this);
}


function pickNextQues() {
	if (!allPrizesWon  &&  $('.uncovered').length > 0) {
		let uncoveredButtons = $('.uncovered');
		console.log(uncoveredButtons.length);
		let nextQuesBtn = uncoveredButtons[Math.floor(Math.random() * uncoveredButtons.length)];
		processNextQues(nextQuesBtn);
	}
	else {
		// Update the Latest Prize data and set GameOver = true;
		// This will be used by the Ticket screen to stop taking any further inputs.
		db.collection("gameques").doc(gameid).update({ _gameover : true });

		/*
		 * Since gameover cannot be set from the function registerPrize since 
		 * there can be multiple users with common last answer. So we are 
		 * setting gameover property here.
		 */
		db.collection("settings").doc("currgame").update({ gameover : true });
		stopTimer();
	}
}


function processNextQues(nextQuesBtn) {
	if (nextQuesBtn !== undefined) {
		console.log(nextQuesBtn);
		console.log(nextQuesBtn.innerHTML);
		console.log(nextQuesBtn.attributes['data-question'].value);
		// console.log(nextQuesBtn.data('question'));
		$(nextQuesBtn).addClass('active');
		$(nextQuesBtn).removeClass('uncovered');

		updateCoveredIndex(nextQuesBtn.innerHTML);
	}
}


function updateCoveredIndex(answer) {
	answerCtr++;
	let updates = "{ \"" + answer + ".coveredIndex\" : " + answerCtr + " }";
	console.log(updates);
	// To update age and favorite color:
	db.collection("gameques").doc(gameid).update(JSON.parse(updates))
	.then(function() {
		console.log("Document successfully updated!");

		updates = "{ \"coveredAnswers\" : \"" + coveredAnswersStr + answer + "#" + "\" }";
		db.collection("settings").doc("currgame").update(JSON.parse(updates))
		.then(function() {
			coveredAnswersStr += answer + "#";
			console.log("Document 2 successfully updated! :: coveredAnswersStr ::" + coveredAnswersStr);

			count = secondsInterval;
		});

	});
}


function timer(){
	count = count-1;
	console.log(count);
	if(count == 0) {
		pickNextQues();
	}
	/* if(count == -20) {
		db.collection("gameques").doc(gameid).update({ _gameover : true });
		stopTimer();
	} */
	$('.timer').html(count);
}

function startTimer() {
	counter = setInterval(timer, 1000);

	/**
	 * This will start the timer at client side too indicating that 
	 * game is starting in next X seconds.
	 */
	console.log('About to initiate a game.');
	if (counter !== undefined && counter !== null) { // Set this value only the first time.
		db.collection("gameques").doc(gameid).update({ _gameover : false })
		.then((doc) => {
			console.log('GAME INITIATED.');
		})
		.catch((error) => {
			console.log(error);
		});
		
	}

}


function stopTimer() {
	clearInterval(counter);
}


function listenToClaimedPrizes() {
    realTimePrizeUpdateUnsubscribe = listenToLatestPrize(successListenToClaimedPrizes);
}

function successListenToClaimedPrizes(doc) {
    logMessage("Current data: ", doc.data());
	prizeDetails = doc.data();
	if (prizeDetails !== undefined
		&&  prizeDetails.FH == true  
		&&  prizeDetails.EF == true  
		&&  prizeDetails.FL == true  
		&&  prizeDetails.ML == true  
		&&  prizeDetails.LL == true) {
			allPrizesWon = true;
			// addWinningQuestions();
	}
}


function addWinningQuestions() {
	console.log('Inside addWinningQuestions');
	getFSSettingsData(successCurrGameFetch, genericFailFn);
}
function successCurrGameFetch(doc) {
	console.log('Inside successCurrGameFetch');
	gameid = doc.data().gameid;
    prevgameid = doc.data().prevgameid;
    if (prevgameid === null  ||  doc.data().gameover == true) prevgameid = gameid;

	console.log('gameid :: ' + gameid);
	console.log('prevgameid :: ' + prevgameid);
	// prevgameid = gameid = '20220924';
    getFSPrizeDetail(gameid, successPrizeDataFetch, null);

	// TODO: Add all questions to prize entry
	// Fetch curr settings
	// Fetch prizes for gameid
	// Fetch gameques for gameid
	// Create winning entries in prizes for gameid
	
}
function successPrizeDataFetch(doc) {
	console.log('Inside successPrizeDataFetch');
    wList = doc.data();
    iterateWinners(wList);
	console.log(winners);

	// gameid = '20220924';
	clearStorage(); // clear it so that it doesn't pick from storage
	getGameQuestions(gameid, successFn, failureFn); // Or use getCurrGameQuestions if gameid is unknown
}
function iterateWinners(wList) {
    if (wList) {
        Object.keys(wList).forEach((wdockey) => {
            winnerDet = wdockey.split('_');
			winners[parseInt(winnerDet[0]) + 1] = winnerDet[1];
        });
    }
}
function successFn(doc) {
	console.log('Inside successFn');
	let qList = doc;
	console.log(qList);
	if (typeof doc.data === "function") {
		qList = doc.data();
		console.log(JSON.stringify(qList));
	}
	console.log("successFn ::" + qList);
	
	Object.keys(qList).forEach((qKey) => {
		let ques = qList[qKey];
		if (winners[ques.coveredIndex]) {
			let prize = winners[ques.coveredIndex];
			console.log(prize + ' :: ' + ques.question + ' :: ' + ques.answer);
			
			let updates = {};
			updates[prize] = ques;
			console.log(updates);
			saveMerge("prizes", gameid, updates, genericSuccessFn, genericFailFn);
		}
	});
}
function genericSuccessFn(doc) {
	console.log('Inside genericSuccessFn');
}


function failureFn(doc) { 
	console.log(doc); 
}


function onPageUnload() {
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('Page Unloading');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    logMessage('*****************************************');
    realTimePrizeUpdateUnsubscribe();
}


/* TODO: */
/* CREATE A BUTTON CLICKING ON WHICH WILL START THE COUNTER */
/* LISTEN TO PRIZE LIST TO SEE IF 'FH' HAS B BEEN WON. IF YES, STOP THE COUNTER */
$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActionsAdmin();
	// $('#btnLogout').click(signout);
	$('#btnNextQues').click(pickNextQues);
	$('#startTimer').click(startTimer);
	$('#stopTimer').click(stopTimer);
	$('#btnAddWinningQuestions').click(addWinningQuestions);
});

window.addEventListener('beforeunload', onPageUnload);
checkAdminLogin();


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
		init();
		listenToClaimedPrizes();
    }
});