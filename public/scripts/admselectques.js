const container = $('.container-fluid');
var table;
var nextGameDate;
let nextGameId;

/**
 * First method that initiates data fetch and UI creation
 */
function init() {
	/*
	* Param 1 - search text: It can be [] or ['guru'] or ['guru', 'teg'] etc. and it will return all rows that contain either of the strings in array
	* Param 2 - order by: if search text is present this is ignored.
	* Param 3 - limit: max number of rows returned. Please change this limit only if you are working on emulator
	* Param 4 - success method - the method that is called in this js file when data is fetched
	* Param 5 - failure method - the method that is called in this js file when data fetch resulted in failure
	*/
	getFSQuestionList(null, 'addedOn', null, successQListFetch, null);
}

function successQListFetch(querySnapshot) {
	console.log("inside successQListFetch :: ");
	let datajson = [];
	let rowArr = [];
	let innerjson = {};
	querySnapshot.forEach(function(doc) {
		rowArr = [];
		console.log(doc.id, " => ", doc.data());
		rowArr.push(doc.id);
		rowArr.push(doc.data().question);
		rowArr.push(doc.data().answer);
		rowArr.push(doc.data().status);
		rowArr.push(doc.data().addedOn.seconds);
		// datajson.push(rowArr);

		innerjson = {};
		innerjson['0']=doc.id;
		innerjson['1']=doc.data().question;
		innerjson['2']=doc.data().answer;
		innerjson['3']=doc.data().status;
		innerjson['4']=doc.data().addedOn.seconds;
		datajson.push(innerjson);
	});
	let datajson1 = { data : datajson };
	console.log(JSON.stringify(datajson1));
	$(document).ready(function() {
		var selected = [];

		table = $('#questionList').DataTable( {
			data: datajson,
			columns: [
				{ title: "Id" },
				{ title: "Question" },
				{ title: "Answer" },
				{ title: "Status" },
				{ title: "Added On" }
			],
			"lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]]
			
		} );

		$('#questionList tbody').on('click', 'tr', function () {
			$(this).toggleClass('selected');
			console.log(table.rows('.selected').data());
			$('#selectedCount').text(table.rows('.selected').data().length +' row(s) selected');
		} );
	} );

	

	console.log('Returning from successQListFetch');
}

/**
 * method to create a new question in "questions" collection
 */
function createQues() {
	var ques;
	var ans;
	var pques;
	var pans;
	var info;
	var status;
	var keywords;
	addToQuestionCollection(ques, ans, pques, pans, info, status, keywords, successCreateQues, failureCreateQues);
}
function successCreateQues(doc) {
	console.log('SuccessCreateQues :::');
	console.log(doc.id);
}
function failureCreateQues(error) {
	console.log('FailureCreateQues :::' + error);
}

/**
 * method to update a new question in "questions" collection
 */
function updateQues() {
	var quesDocId
	var ques;
	var ans;
	var pques;
	var pans;
	var info;
	var status;
	var keywords;
	updateQuestionInCollection(quesDocId, ques, ans, pques, pans, info, status, keywords, successUpdateQues, failureUpdateQues);
}
function successUpdateQues(doc) {
	console.log('SuccessUpdateQues :::');
	console.log(doc.id);
}
function failureUpdateQues(error) {
	console.log('FailureUpdateQues :::' + error);
}

function getNextGameDate() {
    console.log($('#inputNextGameYear').val());
    console.log($('#inputNextGameMonth').val());
    console.log($('#inputNextGameDate').val());
    nextGameDate 
		= new Date(
			$('#inputNextGameYear').val(), 
			(parseInt($('#inputNextGameMonth').val()) - 1), 
			$('#inputNextGameDate').val(),
			$('#inputNextGameHour').val(), 
            $('#inputNextGameMinute').val(), 
			0
		);
    console.log(nextGameDate);
	return nextGameDate;
}

function getNextGameId() {
    nextGameDate = getNextGameDate();
    console.log(nextGameDate);
    
    // var d = new Date();
    // d.setDate(d.getDate() + 10);
    return getCurrentGameFormattedDate(nextGameDate);
}

function isNextGameDateInFuture() {
    console.log(getNextGameDate());
    console.log(new Date());
    if (getNextGameDate() < new Date()) {
        alert('Please set the Next Game date correctly');
        return false;
    }
    return true;
}

function getCurrentGameFormattedDate(dt) {
    return '' + dt.getFullYear() + '' + (appendLeadingZeroes(dt.getMonth()+1)) + '' + appendLeadingZeroes(dt.getDate());
}

function ninetyRowsSelected() {
	if (table.rows('.selected').data().length == 90) return true;
	alert('90 questions are not yet selected.');
	return false;
}

function validateBeforeCreatingGame() {
	return (isNextGameDateInFuture()  &&  ninetyRowsSelected());
}

function createGameQues() {
	if (!validateBeforeCreatingGame()) return;

	console.log(table.rows('.selected').data());
	console.log(table.rows('.selected').data().length);
    nextGameId = getNextGameId();

	let quesList = {};
    db.collection("gameques").doc(nextGameId).set({});
    let gameques = db.collection("gameques").doc(nextGameId);
	for (var ctr=0; ctr < table.rows('.selected').data().length; ctr++) {
		let qdoc = {};
		qdoc.question = table.rows('.selected').data()[ctr]['1'];
		qdoc.answer = table.rows('.selected').data()[ctr]['2'];
		quesList[qdoc.answer] = qdoc;
	}

	console.log(quesList);
	gameques.update(quesList, { merge: true })
	.then(() => {
		$('#messageText').text('Game questions created successfully');
	})
	.catch(function(error) {
		console.error("Error adding document: ", error);
		$('#messageText').text('Failed creating Game questions');
	});
}

function selectAllRows() {
	$('#questionList tbody tr').addClass('selected');
	$('#selectedCount').text(table.rows('.selected').data().length +' row(s) selected');
}
function clearAllRows() {
	$('#questionList tbody tr').removeClass('selected');
	$('#selectedCount').text(table.rows('.selected').data().length +' row(s) selected');
}


function createCurrGameSetting() {
	if (!validateBeforeCreatingGame()) return;
	getFSSettingsData(successFetchSettingsData, successFetchSettingsData); // For failure too call same function.
}

function successFetchSettingsData() {
	getFSCurrGameQuestions(getNextGameId(), successGameQuesFetch);
}

function successGameQuesFetch(doc) {
    var qList = doc.data();
    console.log(JSON.stringify(qList));
    var answers = '';
    Object.keys(qList).forEach((qdockey) => {
        console.log('qdockey ::' + qdockey);
        if (qdockey !== '_gameover') {
            answers += qdockey + '#';
        }
    });
    console.log('answers ::' + answers);
    db.collection("settings").doc("currgame").set({});
    let settigs = db.collection("settings").doc("currgame");
    var settjson = {};
    settjson.answers = answers.substring(0, answers.length-1);

    var d = nextGameDate;
	settjson.gamedatetime = firebase.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0, 0));
	console.log(getNextGameId());
    settjson.gameid = getNextGameId();
    gameid = getFromStorage('gameid');
    console.log('gameid ::' + gameid);
    settjson.prevgameid = gameid === undefined ? null : gameid;
    settjson.queschanged = firebase.firestore.Timestamp.now();
    settjson.gameover = false;
    settjson.coveredAnswers = null;
    console.log('settjson ::' + JSON.stringify(settjson));
    settigs.update(settjson, { merge: true }).then(() => {
        $('#messageText').text('Settings created successfully');
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        $('#messageText').text('Failed creating Settings');
    });

	console.log('Starting to reset Prizes');
	db.collection("prizes").doc("latest").set({})
	.then(() => {
        $('#messageText').text('Prizes reset completed successfully');
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        $('#messageText').text('Failed resetting prizes');
    });
}


$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActionsAdmin();
    loadSharingButtons();
    $('#btnLogout').click(signout);
    $('#createGameQues').click(createGameQues);
    $('#setNextCurrGame').click(createCurrGameSetting);
    $('#setNextCurrGame').click(createCurrGameSetting);
    $('#selectAll').click(selectAllRows);
    $('#clearAll').click(clearAllRows);
});


checkAdminLogin();
init();
// setCurrGameQuestions();
