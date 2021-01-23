
var db = firebase.firestore();
var user = firebase.auth().currentUser;
var functions = firebase.functions();
let uid;
// alert('Hi');

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
        $('#loggedInUser').text(user.displayName);
        uid = user.uid;
		hideButtons(true);
		init();
    } else {
        console.log('User is NULL');
        hideButtons(false);
    }
  });
  

  /*
async function createTodoEntry(entryName) {
	console.log('Inside createTodoEntry ...');
	// event.preventDefault();
	if (entryName == undefined ||  entryName == null) entryName = "My todo at " + new Date();
	const todo = { name: entryName, description: "Hello world!" };
	await API.graphql(graphqlOperation(createTodo, {input: todo}));
}

async function pickNextQues() {
	let uncoveredButtons = $('.uncovered');
	console.log(uncoveredButtons.length);
	let nextQuesBtn = uncoveredButtons[Math.floor(Math.random() * uncoveredButtons.length)];
	if (nextQuesBtn !== undefined) {
		console.log(nextQuesBtn);
		console.log(nextQuesBtn.innerHTML);
		console.log(nextQuesBtn.attributes['data-question'].value);
		// console.log(nextQuesBtn.data('question'));
		$(nextQuesBtn).addClass('active');
		$(nextQuesBtn).removeClass('uncovered');

		await postData(
			'https://kt702dv0v5.execute-api.ap-south-1.amazonaws.com/Dev/setnextques', 
			{ "key": nextQuesBtn.innerHTML }
		)
		.then(data => {
			console.log(data); // JSON data parsed by `data.json()` call
		});

		// Creation too has to be handled from app only. Directly creating record in DDB does not update here.
		createTodoEntry(nextQuesBtn.attributes['data-question'].value);

	}
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
	console.log('Inside postData - ' + JSON.stringify(data));
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
		'Content-Type': 'application/json'
		// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return response.json(); // parses JSON response into native JavaScript objects
}

*/

function createNode(element) {
	return document.createElement(element);
}

function createAnswerButton(ques, answ, coveredCtr) {
	// console.log(answ);

	let btn = createNode('button');
	$(btn).addClass('btn btn-success col-lg-1');
	if (coveredCtr >= 0) $(btn).addClass('active');
	else $(btn).addClass('uncovered');
	$(btn).attr('data-question', ques);
	$(btn).on("click", pickNextQuesFromBtn);
	$(btn).html(answ);
		
	return btn;
}



// Read Data
const container = $('.container-fluid');
let qList = null;
let gameid;
let answerCtr = 0;
let coveredAnswersArr = [];
let coveredAnswersStr = '';

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



$(function onDocReady() {
	console.log('Inside onDocReady');
	$('#btnLogout').click(signout);
	$('#btnNextQues').click(pickNextQues);
});

// document.onload = function() {
//     console.log('ON LOAD');
//     // $('.btnTicket').click();
//     $('.btnLogout').click(signout);
// }

function pickNextQuesFromBtn() {
	processNextQues(this);
}

function pickNextQues() {
	let uncoveredButtons = $('.uncovered');
	console.log(uncoveredButtons.length);
	let nextQuesBtn = uncoveredButtons[Math.floor(Math.random() * uncoveredButtons.length)];
	processNextQues(nextQuesBtn);
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
			
		});

	});
}
