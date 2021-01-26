const container = $('.container-fluid');


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
	getFSQuestionList(['bahadar', 'teg'], 'addedOn', 5, successQListFetch, null);
}

function successQListFetch(querySnapshot) {
	console.log("inside successQListFetch :: ");
	querySnapshot.forEach(function(doc) {
		console.log(doc.id, " => ", doc.data());
	});
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

$(function onDocReady() {
	console.log('Inside onDocReady');
    loadHeaderActions();
    loadSharingButtons();
    $('#btnLogout').click(signout);
});


checkLogin(firebase.auth());
init();
// setCurrGameQuestions();
