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
		// doc.data() is never undefined for query doc snapshots
		console.log(doc.id, " => ", doc.data());
	});
	console.log('Returning from successQListFetch');
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
