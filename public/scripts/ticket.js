// TEST UNSUBSCRIBE
// CHECK IF THESE VARIABLES ARE REQUIRED


// var db = firebase.firestore();
// var user = firebase.auth().currentUser;
var functions = firebase.app().functions('asia-south1');
if (isLocalhost()) { functions.useEmulator("localhost", 5001); }

let uEmailAddress;
let uPhoneNumber;
let prizeDetails;
let prizeDetailsFromNextQues;

const container = $('.container-fluid');
let qList = null;
let gameId;
let realTimeUpdateUnsubscribe;
let realTimePrizeUpdateUnsubscribe;
// let quesListCache; // Temp. Remove after testing
let bogieCount = 0;


/**
 * Check whether user is authenticated and take action likewise.
 */
/* firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        logMessage('User is NOT NULL ::' + user.uid + "; displayname ::" + user.displayName);
        uid = user.uid;
        uEmailAddress = user.email;
        uPhoneNumber = user.phoneNumber;
        generateTicket(null);
        // getClaimedPrizes();
        listenToClaimedPrizes();
        // registerPrize();
        // getCoveredQuestions();
        listenToQuestions();
    } 
    else {
        logMessage('User is NULL');
    }
}); */
  
/**
 * Called when user is logged in
 */
successLogin = function(user) {
    uEmailAddress = user.email;
    uPhoneNumber = user.phoneNumber;
    generateTicket();
    listenToClaimedPrizes();
    listenToQuestions();
};




// Read Data

/**
 * Fetch currgame settings and set it in storage if not already present.
 * Called from generateTicket()
 */
function init() {
    if (getFromStorage('gameid') == null) {
        /* db.collection("settings").doc("currgame").get()
        .then((doc) => {
            sessionStorage.setItem('gameid', doc.data().gameid);
            sessionStorage.setItem('gamedatetime', doc.data().gamedatetime.seconds);
        }); */
        getFSSettingsData();
    }
}

/**
 * NOT USED CURRENTLY - PLEASE VALIDATE
 */
function getTicket() {
    init();
    gameId = sessionStorage.getItem('gameid');
    db.collection("tickets").doc(gameId + "_" + uid).get()
    .then((doc) => {
        return doc.data();
    })
    .catch((error) => {
        console.error("Error getting ticket: ", error);
    });
    return null;
}


/**
 * Called on page load if user is authenticated. This method checks in 
 * firestore if ticket is already generated. If not, it calls the 
 * cloud function to generate a ticket.
 */
function generateTicket() {
    resetTicketStorage();

    init();
    console.log( 'FROM STORAGE :: gamedatetime ::' + getFromStorage('gamedatetime') );
    let gameDateTime = new Date(getFromStorage('gamedatetime')*1000);
    var currDateTime = new Date();
    currDateTime.setMinutes( currDateTime.getMinutes() + 15 );
    console.log(isLocalhost());
    if (isLocalhost()) currDateTime.setDate( currDateTime.getDate() + 15 ); // TODO: Uncomment after testing
    logMessage( currDateTime );
    logMessage( gameDateTime );
    if (currDateTime > gameDateTime) {

        gameId = getFromStorage('gameid');
        let tkt;
        console.log(gameId + "_" + uid);
        console.log(getFromStorage('ticket'));

        if (!getFromStorage('ticket')) {
            console.log('Picking ticket from firestore');
            getFSUserTicket(gameId, uid, successFetchTicketFirstTime, null);
        }
        else {
            // tkt = JSON.parse(getFromStorage('ticket'))
            console.log('Picked from Cache');
            tkt = getTicketFromStorage();
            // loadTicket(tkt);
            processTicket(tkt, getFromStorage('bogieCount'));
        }
        logMessage(tkt);
    }
    else {
        alert('The ticket would be available 15 minutes before the game.');
    }
}

function successFetchTicketFirstTime(doc) {
    console.log('successFetchTicketFirstTime ::' + doc);
    if (doc.data()) {
        processTicket(doc.data(), getFromStorage('bogieCount'));
        return doc;
    }

    console.log('Calling createTkt');
    callCloudFunction('createTicketV2', null, successFunctionCreateTicket, null);
}

function successFunctionCreateTicket(retData) {
    console.log('successFunctionCreateTicket :: retData :: ' + JSON.stringify(retData.data));
    if (retData && retData.data) {
        processTicket(retData.data, retData.data.bogiecount);
        return retData;
    }
    console.log('Returning data from firestore');
}


function processTicket(ticketData, bCount) {
    console.log('doc.data() is not null ::' + ticketData);
    if (ticketData.ticket !== undefined) {
        console.log(JSON.stringify(ticketData));
        tkt = ticketData;
        console.log(tkt);
        initTicketDataInStorage(tkt); // Not required since bogiecount can differ in each load.
        // addToStorage('ticket', JSON.stringify(tkt));
        loadTicket(tkt);
        setBogieCount(bCount);
        return tkt;
    }
}

/**
 * Sets bogieCount variable based on bogiecount received from ticket from firestore.
 * This method is called from generateTicket(e)
 * @param {*} tkt - Ticket Json
 */
function setBogieCount(bcount) {
    bogieCount = bcount;
    console.log('bogieCount ::' + bogieCount);
    addToStorage('bogieCount', bogieCount);
}

/**
 * Generates UI for ticket. Also sets which entries have been selected 
 * already. It fetches "selected" data from localstorage.
 * @param {*} tdata - Ticket Json
 */
function loadTicket(tdata) {
    // logMessage(JSON.stringify(tdata));
    $('.tktcell11').text(tdata.ticket['c11']);
    $('.tktcell12').text(tdata.ticket['c12']);
    $('.tktcell13').text(tdata.ticket['c13']);
    $('.tktcell14').text(tdata.ticket['c14']);
    $('.tktcell15').text(tdata.ticket['c15']);
    $('.tktcell21').text(tdata.ticket['c21']);
    $('.tktcell22').text(tdata.ticket['c22']);
    $('.tktcell23').text(tdata.ticket['c23']);
    $('.tktcell24').text(tdata.ticket['c24']);
    $('.tktcell25').text(tdata.ticket['c25']);
    $('.tktcell31').text(tdata.ticket['c31']);
    $('.tktcell32').text(tdata.ticket['c32']);
    $('.tktcell33').text(tdata.ticket['c33']);
    $('.tktcell34').text(tdata.ticket['c34']);
    $('.tktcell35').text(tdata.ticket['c35']);

    let tdataSel = getSelectionDataFromStorage();
    console.log(tdataSel);
    if (tdataSel['tktcell11']) $('.tktcell11').addClass('green');
    if (tdataSel['tktcell12']) $('.tktcell12').addClass('green');
    if (tdataSel['tktcell13']) $('.tktcell13').addClass('green');
    if (tdataSel['tktcell14']) $('.tktcell14').addClass('green');
    if (tdataSel['tktcell15']) $('.tktcell15').addClass('green');
    if (tdataSel['tktcell21']) $('.tktcell21').addClass('green');
    if (tdataSel['tktcell22']) $('.tktcell22').addClass('green');
    if (tdataSel['tktcell23']) $('.tktcell23').addClass('green');
    if (tdataSel['tktcell24']) $('.tktcell24').addClass('green');
    if (tdataSel['tktcell25']) $('.tktcell25').addClass('green');
    if (tdataSel['tktcell31']) $('.tktcell31').addClass('green');
    if (tdataSel['tktcell32']) $('.tktcell32').addClass('green');
    if (tdataSel['tktcell33']) $('.tktcell33').addClass('green');
    if (tdataSel['tktcell34']) $('.tktcell34').addClass('green');
    if (tdataSel['tktcell35']) $('.tktcell35').addClass('green');
}


function checkforPrizeAndClaim() {
    let tdataSel = getSelectionDataFromStorage();
    console.log(tdataSel);
    let prizeIds = '';
    let retStr = '';
    let selectedCount = 0;
    let selectedCountFL = 0;
    let selectedCountML = 0;
    let selectedCountLL = 0;

    Object.keys(tdataSel).forEach((qdoc) => {
        if (tdataSel[qdoc]) {

            let selectedCell = qdoc.replace('tktcell', 'c');
            if (retStr.length > 0) retStr = retStr + '#' + selectedCell;
            else retStr = selectedCell;

            selectedCount++;
            if (selectedCell.search('c1') == 0) selectedCountFL++;
            if (selectedCell.search('c2') == 0) selectedCountML++;
            if (selectedCell.search('c3') == 0) selectedCountLL++;
        }
    });
    console.log('retStr :: ' + retStr);
    console.log('selectedCount ::' + selectedCount);
    console.log('selectedCountFL ::' + selectedCountFL);
    console.log('selectedCountML ::' + selectedCountML);
    console.log('selectedCountLL ::' + selectedCountLL);
    console.log(prizeDetailsFromNextQues == undefined);
    console.log((prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.EF != true)));

    if (selectedCount == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.EF != true  /* && EF not already claimed */))) {
        console.log('Claim for EF');
        prizeIds = 'EF';
    }
    else if (selectedCountFL == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (selectedCountML == 5  &&  selectedCountLL == 5  &&  prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.FH != true))) {
        console.log('Claim for FULL HOUSE');
        if (prizeIds.length > 0) prizeIds += '#FH'; else prizeIds += 'FH';
        retStr = '';
    }
    if (selectedCountFL == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.FL != true  /* && FL not already claimed */))) {
        console.log('Claim for FL');
        if (prizeIds.length > 0) prizeIds += '#FL'; 
        else {
            prizeIds += 'FL';
            retStr = '';
        }
    }
    else if (selectedCountML == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.ML != true  /* && ML not already claimed */))) {
        console.log('Claim for ML');
        if (prizeIds.length > 0) prizeIds += '#ML'; 
        else {
            prizeIds += 'ML';
            retStr = '';
        }
    }
    else if (selectedCountLL == 5  &&  (prizeDetailsFromNextQues == undefined  ||  (prizeDetailsFromNextQues != undefined  &&  prizeDetailsFromNextQues.LL != true /* && LL not already claimed */))) {
        console.log('Claim for LL');
        if (prizeIds.length > 0) prizeIds += '#LL'; 
        else {
            prizeIds += 'LL';
            retStr = '';
        }
    }

    if (prizeIds !== '') {
        let prizeRet = registerPrize(prizeIds, retStr);
        console.log('prizeRet ::' + prizeRet);
        // console.log('prizeRet.bogie ::' + prizeRet.bogie);
        /* if (prizeRet != undefined  &&  prizeRet.bogie == true) {
            alert('It was a bogie. Please play with caution, you may not be allowed to continue playing if you bogie 3 times.');
            bogieCount++;
        } */
    }

        // return retStr;
    // if (tdataSel['tktcell11']) $('.tktcell11').addClass('green');
    // if (tdataSel['tktcell12']) $('.tktcell12').addClass('green');
}
    

// document.onload = function() {
//     logMessage('ON LOAD');
//     // $('.btnTicket').click();
//     $('.btnLogout').click(signout);
// }


function updateSelectionDataInStorage(cellId) {
    let selData = getSelectionDataFromStorage();
    selData[cellId] = !selData[cellId];
    addSelectionDataToStorage(selData);
}

function initTicketDataInStorage(data) {
	logMessage('storeTicketInCache');
	logMessage(data);
	addTicketToStorage(data);
	/* let ticketSel = { 
		"tktcell11": false,
		"tktcell12": false,
		"tktcell13": false,
		"tktcell14": false,
		"tktcell15": false,
		"tktcell21": false,
		"tktcell22": false,
		"tktcell23": false,
		"tktcell24": false,
		"tktcell25": false,
		"tktcell31": false,
		"tktcell32": false,
		"tktcell33": false,
		"tktcell34": false,
		"tktcell35": false
	};
	addSelectionDataToStorage(ticketSel); */
}

function addTicketToStorage(data) {
    // addToStorage("ticket", JSON.stringify(data));
}

function getTicketFromStorage() {
    console.log(getFromStorage('ticket'));
    return JSON.parse(getFromStorage('ticket'));
}

function addSelectionDataToStorage(ticketSel) {
    addToStorage("ticketSel", JSON.stringify(ticketSel));
}

function getSelectionDataFromStorage() {
    logMessage(getFromStorage("ticketSel"));
    console.log(getFromStorage("ticketSel"));
    let sel = getFromStorage("ticketSel");
    if (!sel) sel = "{}";
	return JSON.parse(sel);
}

function resetTicketStorage() {
    // removeFromStorage('ticket');
    // removeFromStorage('ticketSel');
}

function getCoveredQuestions() {
    getFSCurrGameQuestions(gameId, successGetCoveredQuestions, null);
    /* tkt = db.collection("gameques").doc(gameId).get()
    .then((doc) => {
        if (doc.data()) {
            logMessage(doc.data());
            // quesListCache = doc.data();
            updateUIOnQuestions(doc.data());
        }
    }); */
}

function successGetCoveredQuestions(doc) {
    if (doc.data()) {
        logMessage(doc.data());
        // quesListCache = doc.data();
        updateUIOnQuestions(doc.data());
    }
}


function listenToQuestions() {
    realTimeUpdateUnsubscribe = listenToFSQuestions(gameId, successListenToQuestions, failureListenToQuestions);
}

function failureListenToQuestions(error) {
    console.log("failureListenToQuestions :: Error ::", error);
}

function successListenToQuestions(doc) {
    logMessage("successListenToQuestions :: Current data ::", doc.data());
    prizeDetailsFromNextQues = prizeDetails;
    if (doc.data() != undefined) updateUIOnQuestions(doc.data());
    updateUIOnPrizesToRed();
}

function updateUIOnQuestions(qList) {
    if (qList._gameover == true) {
        alert('Game is over; \'Full House\' won. Please join us again for the next game.');
        clearInterval(counter);
    }

    let covQues = [];
    // let qList = doc.data();
    Object.keys(qList).forEach((qdoc) => {
        if (qdoc != '_gameover') { // Indicator of whether game is in progress or is over.
            let ques = qList[qdoc];
            if (ques.coveredIndex != null) {
                logMessage(ques);
                covQues.push(ques);
            }
        }
    });
    if (covQues.length > 0) {
        
        logMessage(covQues);
        covQues.sort((a, b) => {
            let fa = a.coveredIndex,
                fb = b.coveredIndex;
        
            if (fa < fb) {
                return 1;
            }
            if (fa > fb) {
                return -1;
            }
            return 0;
        });
        logMessage(covQues);
        logMessage(covQues[0].question);
        $('#question').text(covQues[0].question);
        console.log(prizeDetailsFromNextQues);
        if (prizeDetailsFromNextQues == undefined  ||  !prizeDetailsFromNextQues.FH) {
            $('#question').css('background', '#8aff80');
            animateHTML($('#question'), '#8aff80', '#b3d9ff', 1000);
            count = secondsInterval; // Set the timer
        }
        else {
            count = 0; // Set the timer
        }
        addQuestionsToModalDialog(covQues);

        if (counter == null) counter = setInterval(timer, 1000);
    }
    else {
        $('#question').text('');
    }
}

/**
 * To animate when a new question is displayed. This is a generic method 
 * and can be used to animate background of any div.
 * @param {*} htmlNode - The node whoe background has to be animated.
 * @param {*} color1 - color 1
 * @param {*} color2 - color 2
 * @param {*} timeout - time in ms for switching between two colors.
 */
function animateHTML(htmlNode, color1, color2, timeout) {
    setTimeout(function() {
        htmlNode.css('background', color1);
        setTimeout(function() {
            htmlNode.css('background', color2);
            setTimeout(function() {
                htmlNode.css('background', color1);
                setTimeout(function() {
                    htmlNode.css('background', color2);
                    setTimeout(function() {
                        htmlNode.css('background', color1);
                        setTimeout(function() {
                            htmlNode.css('background', color2);
                        }, timeout);
                    }, timeout);
                }, timeout);
            }, timeout);
        }, timeout);
    }, timeout);
}

function addQuestionsToModalDialog(covQues) {
    logMessage('Inside addQuestionsToModalDialog ::' + covQues);
    const ul = $('#questionList');
    ul.empty();
    let qIdx = covQues.length;
    covQues.forEach((ques) => {
        let li = createNode('li');
        $(li).addClass('list-group-item');
        $(li).html((qIdx) + '. ' + ques.question);
        logMessage(ques.question);
        ul.append(li);
        qIdx--;
    });
}


function getClaimedPrizes() {
    getFSPrizeDetailLatest(successGetClaimedPrizes);
    /* tkt = db.collection("prizes").doc("latest").get()
    .then((doc) => {
        if (doc.data()) {
            logMessage(doc.data());
            updateUIOnPrizes(doc.data());
        }
    }); */
}

function successGetClaimedPrizes(doc) {
    if (doc.data()) {
        logMessage(doc.data());
        updateUIOnPrizes(doc.data());
    }
}

function listenToClaimedPrizes() {
    realTimePrizeUpdateUnsubscribe = listenToLatestPrize(successListenToClaimedPrizes);
    /* db.collection("prizes").doc("latest")
    .onSnapshot(function(doc) {
        logMessage("Current data: ", doc.data());
        updateUIOnPrizes(doc.data());
    }); */

    /* setTimeout(function() {
        realTimeUpdateUnsubscribe();
    }, 5000); */
}

function successListenToClaimedPrizes(doc) {
    logMessage("Current data: ", doc.data());
    updateUIOnPrizes(doc.data());
}

function updateUIOnPrizes(pList) {
    console.log("updateUIOnPrizes ::: pList :::" + pList);
    prizeDetails = pList;
    if (pList) {
        Object.keys(pList).forEach((pdoc) => {
            let prize = pList[pdoc];
            console.log("updateUIOnPrizes ::: pdoc :::" + pdoc);
            console.log("updateUIOnPrizes ::: prize :::" + prize);
            if (prize === true) {
                // $('.prize' + pdoc).css('background', 'red');
                $('.prize' + pdoc).removeClass('backgroundgreen');
                $('.prize' + pdoc).addClass('backgroundorange');
            }
        });
        if (pList.FH == true  
                &&  pList.EF == true  
                &&  pList.FL == true  
                &&  pList.ML == true  
                &&  pList.LL == true
                &&  pList._gameover == false) {
            alert('Game is over; \'Full House\' won. If you too have the winning answer in your ticket, please mark it to register your win too. Thanks for playing.');
        }

    }
}

function changeBackgroundColor(item) {
    if (item.hasClass('backgroundorange')) {
        item.removeClass('backgroundorange');
        item.addClass('backgroundred');
    }
}

function updateUIOnPrizesToRed() {
    changeBackgroundColor($('.prizeEF'));
    changeBackgroundColor($('.prizeFL'));
    changeBackgroundColor($('.prizeML'));
    changeBackgroundColor($('.prizeLL'));
    changeBackgroundColor($('.prizeFH'));
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
    realTimeUpdateUnsubscribe();
    realTimePrizeUpdateUnsubscribe();
}


function getMarkedAnswersInString() {
    let tdataSel = getSelectionDataFromStorage();
    console.log(tdataSel);
    let retStr = '';
    Object.keys(tdataSel).forEach((qdoc) => {
        if (tdataSel[qdoc]) {
            if (retStr.length > 0) retStr = retStr + '#' + qdoc.replace('tktcell', 'c');
            else retStr = qdoc.replace('tktcell', 'c');
        }
    });
    console.log(retStr);
    return retStr;
}



function registerPrize(prizeIds, efCells) {
    var addMessage = functions.httpsCallable('registerPrize');
    addMessage({ 
        emailAddress : uEmailAddress,
        phoneNumber : uPhoneNumber,
        prizeid : prizeIds,
        efCells : efCells,
    })
    .then((result) => {
        // Read result of the Cloud Function.
        console.log('AFTER REGISTERPRIZE Cloud Function Call :: result.data :: ' + JSON.stringify(result.data));
        if (result.data != undefined &&  result.data.bogie == true) {
            alert('It was a bogie. Please play with caution, you may not be allowed to continue playing if you bogie 3 times.');
            bogieCount++;
            addToStorage('bogieCount', bogieCount);
        }
    });
}

/**
 * On Load functionality. Handles
 *  (1) OnClick for ticket cells
 */
$(function onDocReady() {
    logMessage('Inside onDocReady');

    $('.ticket').on('click', function(){
        $(this).toggleClass('green');
        var classList = $(this).attr("class");
        var classArr = classList.split(/\s+/);
        $.each(classArr, function(index, value) {
            logMessage('' + index + '---' + value);
            if (value.includes('tktcell')) {
                updateSelectionDataInStorage(value);
            }
        });
        checkforPrizeAndClaim();
    });

    /* $('.language').on('click', function() {
        logMessage('Inside language click');
        updateUIOnQuestions(quesListCache);
    }); */
});


var count = 0;
var counter = null; // setInterval(timer, 1000);

function timer(){	
	if(count <= 0){
		// Nothing
    }
    else {
        count = count-1;
    }
	$('.timer').html(count);
}


window.addEventListener('beforeunload', onPageUnload);
checkLogin(firebase.auth(), successLogin, noLogin);