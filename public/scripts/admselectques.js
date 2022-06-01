const container = $('.container-fluid');
var table;
var nextGameDate;
let nextGameId;
let currGameSettings;

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
	getPreviousGameQuesIds();
}

/**
 * Success method of getFSQuestionList
 * @param {*} querySnapshot - list of all questions from `questions` collection
 */
function successQListFetch(querySnapshot) {
	// console.log("inside successQListFetch :: ");
	let datajson = [];
	let rowArr = [];
	let innerjson = {};

	// Iterate through all questions and prepare object for jquery datatable plugin
	querySnapshot.forEach(function(doc) {
		rowArr = [];
		// console.log(doc.id, " => ", doc.data());
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
		innerjson['3']=doc.data().status == undefined ? '' : doc.data().status;
		innerjson['4']=doc.data().addedOn.seconds;
		innerjson['5']=doc.data().info == undefined ? '' : doc.data().info;
		datajson.push(innerjson);
	});
	let datajson1 = { data : datajson };
	// console.log(JSON.stringify(datajson1));

	// When HTML is all loaded ...
	$(document).ready(function() {
		var selected = [];

		// ... apply data to jquery datatable plugin for displaying data on UI.
		table = $('#questionList').DataTable( {
			data: datajson,
			columns: [
				{ title: "Id" },
				{ title: "Question" },
				{ title: "Answer" },
				{ title: "Status" },
				{ title: "Added On" },
				{ title: "Info URL" }
			],
			"lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]]
			
		} );

		// Track # of rows selected on the jquery datatable
		$('#questionList tbody').on('click', 'tr', function () {
			$(this).toggleClass('selected');
			// console.log(table.rows('.selected').data());
			$('#selectedCount').text(table.rows('.selected').data().length +' row(s) selected');
		} );
	} );
}

/**
 * @returns nextGame date based on the year, month, date, hour, minute Select fields
 */
function getNextGameDate() {
    nextGameDate 
		= new Date(
			$('#inputNextGameYear').val(), 
			(parseInt($('#inputNextGameMonth').val()) - 1), 
			$('#inputNextGameDate').val(),
			$('#inputNextGameHour').val(), 
            $('#inputNextGameMinute').val(), 
			0
		);
	return nextGameDate;
}

/**
 * 
 * @returns nextGameId based on the year, month, date component of nextGame date
 */
function getNextGameId() {
    nextGameDate = getNextGameDate();
    // console.log(nextGameDate);
    
    // var d = new Date();
    // d.setDate(d.getDate() + 10);
    return getCurrentGameFormattedDate(nextGameDate);
}
function getCurrentGameFormattedDate(dt) {
    return '' + dt.getFullYear() + '' + (appendLeadingZeroes(dt.getMonth()+1)) + '' + appendLeadingZeroes(dt.getDate());
}

/**
 * Validates if nextGame date is in future. If not, shows an alert.
 * @returns 
 */
function isNextGameDateInFuture() {
    // console.log(getNextGameDate());
    // console.log(new Date());
    if (getNextGameDate() < new Date()) {
        alert('Please set the Next Game date correctly');
        return false;
    }
    return true;
}

/**
 * Validates that 90 rows are selected in jquery datatable. If not, shows an alert.
 * @returns 
 */
function ninetyRowsSelected() {
	if (table.rows('.selected').data().length == 90) return true;
	alert('90 questions are not yet selected.');
	return false;
}

/**
 * Validation on `future next date` and `90 questions selected` on button click
 * @returns 
 */
function validateBeforeCreatingGame() {
	return (isNextGameDateInFuture()  &&  ninetyRowsSelected());
}
/**
 * Validation on `future next date` on button click. 
 * This method is used when creating gameques from previous gameques. 
 * Hence 90 question selection not required.
 * @returns 
 */
function validateBeforeCreatingGameFromPrev() {
	return (isNextGameDateInFuture());
}

/**
 * Creates gameques based on selected questions from datatable.
 * @returns 
 */
function createGameQues() {
	if (!validateBeforeCreatingGame()) return;

	// console.log(table.rows('.selected').data());
	// console.log(table.rows('.selected').data().length);
    nextGameId = getNextGameId();

	let quesList = {};
    db.collection("gameques").doc(nextGameId).set({});
    let gameques = db.collection("gameques").doc(nextGameId);
	for (var ctr=0; ctr < table.rows('.selected').data().length; ctr++) {
		let qdoc = {};
		qdoc.question = table.rows('.selected').data()[ctr]['1'];
		qdoc.answer = table.rows('.selected').data()[ctr]['2'];
		qdoc.info = table.rows('.selected').data()[ctr]['5'];
		quesList[qdoc.answer] = qdoc;
	}

	// console.log(JSON.stringify(quesList));
	gameques.update(quesList, { merge: true })
	.then(() => {
		$('#messageText').text('Game questions created successfully');
	})
	.catch(function(error) {
		console.error("Error adding document: ", error);
		$('#messageText').text('Failed creating Game questions');
	});
}

/**
 * Button click handler - Select all rows
 */
function selectAllRows() {
	$('#questionList tbody tr').addClass('selected');
	$('#selectedCount').text(table.rows('.selected').data().length +' row(s) selected');
}
/**
 * Button click handler - Clear selection of rows
 */
 function clearAllRows() {
	$('#questionList tbody tr').removeClass('selected');
	$('#selectedCount').text(table.rows('.selected').data().length +' row(s) selected');
}


/**
 * Create `currgame` Settings for gameques created from selected 90 questions. 
 * This method validates that 90 questions should be selected and that nextgame is in future.
 * @returns 
 */
 function createCurrGameSetting() {
	if (!validateBeforeCreatingGame()) return;
	getFSSettingsData(successFetchSettingsData, successFetchSettingsData); // For failure too call same function.
}

/**
 * Create `currgame` Settings for gameques created from previous gameques. 
 * This method removes the validation of selecting 90 questions.
 * @returns 
 */
function createCurrGameSettingFromPrev() {
	if (!validateBeforeCreatingGameFromPrev()) return;
	getFSSettingsData(successFetchSettingsData, successFetchSettingsData); // For failure too call same function.
}

/**
 * Success (& failure) method for createCurrGameSetting & createCurrGameSettingFromPrev
 * @param {*} doc - currgame settings doc
 */
function successFetchSettingsData(doc) {
	currGameSettings = doc.data();
	// console.log('this.currGameSettings ::' + JSON.stringify(currGameSettings));
	getFSCurrGameQuestions(getNextGameId(), successGameQuesFetch);
}

/**
 * Success method for getFSCurrGameQuestions
 * @param {*} doc - gameques doc based on getNextGameId()
 */
function successGameQuesFetch(doc) {
    var qList = doc.data();

	var answers = '';
    Object.keys(qList).forEach((qdockey) => {
        if (qdockey !== '_gameover') {
            answers += qdockey + '#';
        }
    });

	db.collection("settings").doc("currgame").set({});
    let settigs = db.collection("settings").doc("currgame");
    var settjson = {};
    settjson.answers = answers.substring(0, answers.length-1);

    var d = nextGameDate;
	settjson.gamedatetime = firebase.firestore.Timestamp.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0, 0));

	settjson.gameid = getNextGameId();
    gameid = getFromStorage('gameid');

	settjson.prevgameid = gameid === undefined ? null : gameid;
    settjson.queschanged = firebase.firestore.Timestamp.now();
    settjson.gameover = false;
    settjson.coveredAnswers = null;

	// Reuse properties from existing currgame
	try {
		if (currGameSettings.links) settjson.links = currGameSettings.links; // Reuse 'links' properties
	}
	catch (ex) {
		console.error('Error while setting existing properties from currgame', ex);
	}

    // Update currgame settings
    settigs.update(settjson, { merge: true }).then(() => {
        $('#messageText').text('Settings created successfully');
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        $('#messageText').text('Failed creating Settings');
    });

	// Reset latest entry in prizes collection
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

/**
 * Retrieve list of all previous gameques ids. This is used to display entries in Select input.
 */
function getPreviousGameQuesIds() {
	getFirestoreDataColl('gameques', null, null, null, successGetPrevGameQuesIds, failureGetPrevGameQuesIds);
}

/**
 * Success method for retrieving all gameques ids. Populates Select input field.
 * @param {*} gameIds - list of all gameques ids
 */
function successGetPrevGameQuesIds(gameIds) {
	console.log('successGetPrevGameQuesIds');
	var sel = $('#prevGameQuesSelect');
	gameIds.forEach(function(doc) {
		console.log(doc.id);
		console.log(JSON.stringify(doc.id));
		sel.append($("<option>").attr('value',doc.id).text(doc.id));
	});
}
function failureGetPrevGameQuesIds(err) {
	console.log('failureGetPrevGameQuesIds');
	console.log(JSON.stringify(err));
}

/**
 * Creates a new gameques doc based on the select previous gameques (Select input field)
 */
function setPrevGameAsCurrGame() {
	console.log($('#prevGameQuesSelect').val());
	getFirestoreData('gameques', $('#prevGameQuesSelect').val(), successGetPrevGameQues, failureGetPrevGameQues);
}
/**
 * 
 * @param {*} doc - previous gameques doc based on selected gameques id
 */
function successGetPrevGameQues(doc) {
	// Retrieve next game id
	nextGameId = getNextGameId();
	console.log('nextGameId ::' + nextGameId);

	// Iterate through prev gameques doc and create new gameques doc
	let quesList = {};
	Object.keys(doc.data()).forEach((qdockey) => {
		let qdocPrev = doc.data()[qdockey];
		let qdoc = {};
		qdoc.question = qdocPrev.question;
		qdoc.answer = qdocPrev.answer;
		qdoc.info = qdocPrev.info;
		if (qdocPrev.new) qdoc.new = qdocPrev.new;
		quesList[qdoc.answer] = qdoc;
	});
	console.log(quesList);
	console.log(JSON.stringify(quesList));

	// Create a new entry in gameques based on nextGameId
	db.collection("gameques").doc(nextGameId).set({});
	let gameques = db.collection("gameques").doc(nextGameId);

	// Set new gameques doc for the newly created gameques record
	gameques.update(quesList, { merge: true })
	.then(() => {
		$('#messageText').text('Game questions created successfully');
	})
	.catch(function(error) {
		console.error("Error adding document: ", error);
		$('#messageText').text('Failed creating Game questions');
	});
}
function failureGetPrevGameQues(err) {
	console.log('failureGetPrevGameQues');
	console.log(JSON.stringify(err));
}

/**
 * On document load
 */
$(function onDocReady() {
	// console.log('Inside onDocReady');
    loadHeaderActionsAdmin();
    loadSharingButtons();
    $('#btnLogout').click(signout);
    $('#createGameQues').click(createGameQues);
    $('#setNextCurrGame').click(createCurrGameSetting);
    $('#setNextCurrGameFromPrev').click(createCurrGameSettingFromPrev);
	
    $('#selectAll').click(selectAllRows);
    $('#clearAll').click(clearAllRows);
	$('#setPrevGameAsCurrGame').click(setPrevGameAsCurrGame);
});


checkAdminLogin();
init();
// setCurrGameQuestions();
