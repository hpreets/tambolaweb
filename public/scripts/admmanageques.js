const quesListContainer = $('.quesList');
let quesList = null;



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
	getFSQuestionList(null, 'addedOn', 500, successQListFetch, null);
}

function successQListFetch(querySnapshot) {
	console.log("inside successQListFetch :: ");
  let index = 0;
  $(quesListContainer).html('');
  $('.spin-me').css('display', 'none');
	querySnapshot.forEach(function(doc) {
		console.log(doc.id, " => ", doc.data());
    let qdoc = doc.data();
    console.log('doc id', doc.id);
    createQuesListRow(
      qdoc.question,
      qdoc.pquestion,
      qdoc.answer,
      qdoc.panswer,
      qdoc.keywords,
      qdoc.info,
      qdoc.status,
      qdoc.addedOn,
      doc.id,
      index,
      quesListContainer
    );
    index++;
	});

  // Edit button functionality
  $('.edit').click(function(){
    console.log('edit modal opened');

    $('.editQuesId').html($(this.parentNode.parentNode)[0].children[9].innerHTML);
    $('#qinengE').val($(this.parentNode.parentNode)[0].children[1].innerHTML);
    $('#ainengE').val($(this.parentNode.parentNode)[0].children[3].innerHTML);
    $('#qinpunjE').val($(this.parentNode.parentNode)[0].children[2].innerHTML);
    $('#ainpunjE').val($(this.parentNode.parentNode)[0].children[4].innerHTML);
    $('#infoE').val($(this.parentNode.parentNode)[0].children[6].innerHTML);

    $(this.parentNode.parentNode)[0].children[7].innerHTML === 'active' ?
    $('#activeE').prop('checked', true) :
    $('#draftE').prop('checked', true);

    $('#keywordsE').val($(this.parentNode.parentNode)[0].children[5].innerHTML);
    $('#editAQuestionModal').modal('show');
  });

  // Update question functionality
  function successUpdateQues() {
    console.log('SuccessUpdateQues :::');
    // console.log(doc.id);
    history.go(0);
  }
  function failureUpdateQues(error) {
    console.log('FailureUpdateQues :::' + error);
  }

  $('.editQuesSubmitButton').click(function(){
    var quesDocId = $(this.parentNode.parentNode.parentNode.parentNode.parentNode)[0].children[0].children[0].children[0].innerHTML.toString();
    var ques = $('#qinengE').val();
    var ans = $('#ainengE').val();
    var pques = $('#qinpunjE').val();
    var pans = $('#ainpunjE').val();
    var info = $('#infoE').val();
    var status = $('input[name="statusE"]:checked').val();
    var keywords = $('#keywordsE').val().split(', ');
    updateQuestionInCollection(quesDocId, ques, ans, pques, pans, info, status, keywords, successUpdateQues, failureUpdateQues);
  });

  // Delete Button Functionality
  function successDeleteQues() {
    console.log('SuccessDeleteQues :::');
    // console.log(doc.id);
    history.go(0);
  }
  function failureDeleteQues(error) {
    console.log('FailureDeleteQues :::' + error);
  }

  $('.delete').click(function() {
    let qDocId = $(this.parentNode.parentNode)[0].children[9].innerHTML;
    deleteQuestion(qDocId, successDeleteQues, failureDeleteQues);
  });
  console.log("QUERY SNAPSHOT SIZE", querySnapshot.size);
	console.log('Returning from successQListFetch');
}

/**
 * Creates each UI row while iterating through question list JSON
 * @param {*} queseng - Question in English
 * @param {*} quespunj - Question in Punjabi
 * @param {*} answeng - Answer in English
 * @param {*} answpunj - Answer in Punjabi
 * @param {*} keywords - Keywords
 * @param {*} info - Additional Info
 * @param {*} status - Status
 * @param {*} addedOn - Added On
 * @param {*} quesid - Question ID
 * @param {*} index - The counter
 * @param {*} container - Parent element to which this row is added
 */
function createQuesListRow(queseng, quespunj, answeng, answpunj, keywords, info, status, addedOn, quesid, index, container) {
  let rowsno = index + 1 + '.';
  let rowqueseng = queseng;
  let rowquespunj = quespunj;
  let rowansweng = answeng;
  let rowanswpunj = answpunj;
  let rowkeywords = keywords.join(', ');
  let rowinfo = info;
  let rowstatus = status;
  let rowaddedon = addedOn.toDate().toDateString();
  let rowquesid = quesid;

  let qrow = createNode('div');
  let snodiv = createNode('div');
  let quesengdiv = createNode('div');
  let quespunjdiv = createNode('div');
  let answengdiv = createNode('div');
  let answpunjdiv = createNode('div');
  let keywordsdiv = createNode('div');
  let infodiv = createNode('div');
  let statusdiv = createNode('div');
  let addedondiv = createNode('div');
  let quesiddiv = createNode('div');
  let buttonsdiv = createNode('div');
  let editbutton = createNode('button');
  let deletebutton = createNode('button');
  
  $(snodiv).addClass('col-lg-1 col-sm-12');
  $(quesengdiv).addClass('col-lg-1 col-sm-12');
  $(quespunjdiv).addClass('col-lg-1 col-sm-12');
  $(answengdiv).addClass('col-lg-1 col-sm-12');
  $(answpunjdiv).addClass('col-lg-1 col-sm-12');
  $(keywordsdiv).addClass('col-lg-2 col-sm-12 keywords');
  $(infodiv).addClass('col-lg-1 col-sm-12');
  $(statusdiv).addClass('col-lg-1 col-sm-12');
  $(addedondiv).addClass('col-lg-1 col-sm-12');
  $(quesiddiv).addClass('col-lg-1 col-sm-12 d-flex align-items-end');
  $(buttonsdiv).addClass('col-lg-1 col-sm-12');
  $(editbutton).addClass('btn btn-warning edit d-lg-block');
  $(deletebutton).addClass('btn btn-danger delete d-lg-block');

  $(snodiv).html(rowsno);
  $(quesengdiv).html(rowqueseng);
  $(quespunjdiv).html(rowquespunj);
  $(answengdiv).html(rowansweng);
  $(answpunjdiv).html(rowanswpunj);
  $(keywordsdiv).html(rowkeywords);
  $(infodiv).html(rowinfo);
  $(statusdiv).html(rowstatus);
  $(addedondiv).html(rowaddedon);
  $(quesiddiv).html(rowquesid);
  $(editbutton).html('Edit');
  $(deletebutton).html('Delete');

  buttonsdiv.append(editbutton, deletebutton);
  qrow.append(snodiv, quesengdiv, quespunjdiv, answengdiv, answpunjdiv, keywordsdiv, infodiv, statusdiv, addedondiv, quesiddiv, buttonsdiv);
  $(qrow).addClass('row line');
  
  container.append(qrow);
}

/**
 * method to create a new question in "questions" collection
 */
function successCreateQues(doc) {
	console.log('SuccessCreateQues :::');
	console.log(doc.id);
  history.go(0);
}
function failureCreateQues(error) {
	console.log('FailureCreateQues :::' + error);
}
function createQues() {
	var ques = $('#qineng').val();
	var ans = $('#aineng').val();
	var pques = $('#qinpunj').val();
	var pans = $('#ainpunj').val();
	var info = $('#info').val();
	var status = $('input[name="status"]:checked').val();
	var keywords = $('#keywords').val().split(', ');
	addToQuestionCollection(ques, ans, pques, pans, info, status, keywords, successCreateQues, failureCreateQues);
}
$(document).ready(function(){
  $('.addQuesSubmitButton').click(function(){
    createQues();
  });
});

/**
 * code to search through keywords and show relevent questions
 */
function searchKeywords() {
  $('.spin-me').css('display', 'block');
  let search = $('#search').val().toLowerCase().split(' ');
  getFSQuestionList(search, 'addedOn', 500, successQListFetch, null);
}
$(document).ready(function(){
  $('.go').click(function(){
    searchKeywords();
  });
});

/**
 * code to clear search bar and show all questions
 */
function clearSearch() {
  $('.spin-me').css('display', 'block');
  $('#search').val('');
  getFSQuestionList(null, 'addedOn', 500, successQListFetch, null);
}
$(document).ready(function(){
  $('.clear').click(function(){
    clearSearch();
  });
});

/**
 * method to update a new question in "questions" collection
 */
// function successUpdateQues(doc) {
// 	console.log('SuccessUpdateQues :::');
// 	console.log(doc.id);
//   history.go(0);
// }
// function failureUpdateQues(error) {
// 	console.log('FailureUpdateQues :::' + error);
// }
// function updateQues() {

//   var quesDocId = $(this.parentNode.parentNode)[0].children[9].innerHTML;
//   console.log('inside update ques', $(this.parentNode.parentNode)[0].children[9].innerHTML);
// 	// var quesDocId = $('.editQuesId').val();
// 	var ques = $('#qinengE').val();
//   var ans = $('#ainengE').val();
//   var pques = $('#qinpunjE').val();
//   var pans = $('#ainpunjE').val();
//   var info = $('#infoE').val();
//   var status = $('input[name="statusE"]:checked').val();
//   var keywords = $('#keywordsE').val().split(', ');
// 	updateQuestionInCollection(quesDocId, ques, ans, pques, pans, info, status, keywords, successUpdateQues, failureUpdateQues);
// }

// $(document).ready(function(){
//   $('.editQuesSubmitButton').click(function(){
//     var quesDocId = $(this.parentNode.parentNode)[0].children[9].innerHTML;
//     console.log('inside update ques', $(this.parentNode.parentNode)[0].children[9].innerHTML);
//     // var quesDocId = $('.editQuesId').val();
//     var ques = $('#qinengE').val();
//     var ans = $('#ainengE').val();
//     var pques = $('#qinpunjE').val();
//     var pans = $('#ainpunjE').val();
//     var info = $('#infoE').val();
//     var status = $('input[name="statusE"]:checked').val();
//     var keywords = $('#keywordsE').val().split(', ');
//     updateQuestionInCollection(quesDocId, ques, ans, pques, pans, info, status, keywords, successUpdateQues, failureUpdateQues);
//   });
// });

$(function onDocReady() {
	console.log('Inside onDocReady');
  loadHeaderActionsAdmin();
  // loadSharingButtons();
  $('#btnLogout').click(signout);
});


checkAdminLogin();
init();
// setCurrGameQuestions();