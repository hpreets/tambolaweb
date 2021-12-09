const container = $('.quesDiv');
let qList = null;
let currGameSettings = null;




/**
 * Called when user is logged in
 */
successLogin = function() {
  logMessage('Inside successLogin');
};
/**
 * Called when user is NOT logged in
 */
failureLogin = function() {
  logMessage('Inside failureLogin');
};


/**
 * Creates each UI row while iterating through question list JSON
 * @param {*} ques - Question text
 * @param {*} answ - Answer text
 * @param {*} index - The counter
 * @param {*} container - Parent element to which this row is added
 */
function createQuestionRow(ques, answ, index, container, isNew, link /* newquesinfourl */) {
    let rowsno = index + 1 + '.';
    let rowquestion = ques;
    let rowanswer = answ;
    let counter = index + 1;
    if (isNew) rowanswer = rowanswer + ' <sup class="badge badge-secondary">New</sup>';

    let row = createNode('div');
    // let snodiv = createNode('div');
    let quesdiv = createNode('div');
    let answdiv = createNode('div');
    
    // $(snodiv).addClass('col-lg-1 col-sm-12');
    // $(quesdiv).addClass('col-lg-7 col-md-auto col-sm-12');
    $(quesdiv).addClass('col-lg-8 col-md-auto col-sm-12');
    $(answdiv).addClass('col-lg-4 col-sm-12 text-primary');
    // $(snodiv).html(rowsno);
    $(quesdiv).html(rowsno + ' ' + rowquestion);
    $(answdiv).html(' - ' + rowanswer);
    // row.append(snodiv, quesdiv, answdiv);
    row.append(quesdiv, answdiv);
    $(row).addClass('line row');
    
    container.append(row);

    if(counter % 10 == 0){
        let ad = createNode('div');
        if (link) {
            $(ad).html(`${link.text}, click <a href="${link.url}" target="_blank">here</a>`);
            $(ad).addClass('display-5').addClass('colored-closed-box').prop('style', `background-color: ${link.color};`);
        }
        else {
            $(ad).text('adv.');
            $(ad).addClass('display-3');
        }
        container.append(ad);
    }
}

/**
 * First method that initiates data fetch from Firestore / Cache
 */
function init() {
  // clearStorage();
  logMessage(gameid);
  getFSSettingsData(successCurrGameFetch, null);
}

/**
 * Called when Current Game Settings data is fetched from Firestore
 * @param {*} doc - JSON Data - current game settings
 */
function successCurrGameFetch(doc) {
    logMessage('INSIDE successCurrGameFetch');
    currGameSettings = doc.data();
    gameid = doc.data().gameid;

    let gDate = new Date(getFromStorage('gamedatetime')*1000);
    $('.gamedate').text( gDate.toDateString() + ' ' + gDate.toLocaleTimeString().replace(':00 ', ' ').replace(':00', '') + '' );
    // $('.gamedate').text( gDate );

    if (/* getFromStorage('gameid') != null  
            &&  doc.data().gameid == getFromStorage('gameid')  
            &&  doc.data().queschanged.seconds == getFromStorage('queschanged')
            && */  getFromStorage('qlist') != null
            ) {
        // Questions not changed, use the data from cache
        logMessage("Picking data from Cache");
        qList = JSON.parse(getFromStorage("qlist"));
        iterateQuestions(qList);

        spinnerVisible(false);
    }
    else {
        // Clear all storage including storage of ticket and other pages
        // clearStorage();
        // addSettingsToCache(doc);

        // Picking data from game questions - gameques/<gameid>/questions
        getFSCurrGameQuestions(gameid, successQuestionListFetch, null);
    }

    displaySubHeadingBar(true);
}


/**
 * Called when question list for current game is fetched from Firestore
 * @param {*} doc - JSON Data - question list
 */
function successQuestionListFetch(doc) {
  logMessage("Picked data from firestore ::");
  qList = doc.data();
  addToStorage("qlist", JSON.stringify(qList));
  qList = JSON.parse(getFromStorage("qlist"));
  iterateQuestions(qList);

  spinnerVisible(false);
}

function spinnerVisible(isVisible) {
    if (isVisible) {
        // $('#spinnerModal').modal('show');
        $('.spinner').show();
    }
    else {
        logMessage('HIDING SPINNER');
        // $('#spinnerModal').modal('hide');
        $('.spinner').hide();
    }
}

/**
 * Iterate JSON data to create UI
 * @param {*} qList - JSON data from Firestore or Cache
 */
function iterateQuestions(qList) {
    let index = 0;
    let linkIndex = 0;
    Object.keys(qList).forEach((qdockey) => {
        let qdoc = qList[qdockey];
        if (qdockey !== '_gameover') {
            // logMessage('qdockey ::' + qdockey + '; qdoc ::' + qdoc);
            // console.log(currGameSettings.links);
            createQuestionRow(qdoc.question, qdoc.answer, index, container, qdoc.new, currGameSettings.links ? currGameSettings.links[linkIndex] : currGameSettings.links /* newquesinfourl */);
            index++
            if (index % 10 === 0) {
                linkIndex++;
                if (currGameSettings.links && currGameSettings.links.length <= linkIndex) linkIndex = 0;
            }
        }
    });
}

function displaySubHeadingBar(checkButtonsToo) {
    let gameDateTime = new Date(getFromStorage('gamedatetime')*1000);
    var currDateTime = new Date();
    currDateTime.setMinutes( currDateTime.getMinutes() + 15 );
    // if (isLocalhost()) currDateTime.setDate( currDateTime.getDate() + 1500 ); // TODO: Uncomment after testing
    logMessage( 'displaySubHeadingBar :: currDateTime ::' + currDateTime );
    logMessage( 'displaySubHeadingBar :: gameDateTime ::' + gameDateTime );
    logMessage( 'displaySubHeadingBar :: currGameSettings.gameover ::' + currGameSettings.gameover );
    if (currDateTime > gameDateTime  &&  currGameSettings.gameover == false) {
        logMessage(currDateTime + ' > ' + gameDateTime);
        $('.subheadingbar').css('display', 'flex');
        if (checkButtonsToo) {
            if (uid != null  &&  uid != undefined) {
                $('.shlnkTicket').css('display', 'flex');
                $('.shLnkLogin').css('display', 'none');
            }
            else {
                $('.shLnkLogin').css('display', 'flex');
                $('.shlnkTicket').css('display', 'none');
            }
        }
    }
}

function toggleHowToPlay() {
    if (getFromLocalStorage('howToPlay') === '0') {
        $('#howToPlayDiv').hide(1000);
    }
    else {
        $('#howToPlayDiv').show();
        document.getElementById("howToPlayHelpArea").innerHTML += addHowToPlay(true, false);
        $('#btnHowToPlay').click(handleBtnHowToPlay);
    }
}

function handleBtnHowToPlay(e) {
    // console.log('Inside handleBtnHowToPlay');
    e.preventDefault();
    addToLocalStorage('howToPlay', '0');
    // console.log(getFromLocalStorage('howToPlay'));
    toggleHowToPlay();
}

/**
 * Notification: Conditional showing of Notification permission button.
 */
function displayNotifyLink() {

    try {
        if ('Notification' in window && navigator.serviceWorker) {
            console.log('isNotificationAccessResponded()', isNotificationAccessResponded());
            console.log('isNotificationAccessGranted()', isNotificationAccessGranted());
            if (!isNotificationAccessResponded()) {
                $('#allowNotifyLink').show();
            }
            else if (isNotificationAccessGranted()) {
                // If it has already been granted, save details again, in case there is a change.
                getNotificationPermission();
                trackOnMessageReceived();
            }
            /* else {
                $('#allowNotifyLink').show();
            } */
        }
        else {
            $('#allowNotifyLink').show();
        }

        $('#allowNotifyLink').on('click', function() {
            if ('Notification' in window && navigator.serviceWorker) {
                $('#allowNotifyLink').hide();
                getNotificationPermission();
                trackOnMessageReceived();
            }
            else {
                alert('Your browser does not support notifications. Please open SikhiTambola in Chrome browser (or other supported browser) and try again.');
            }
        });
    }
    catch (ex) {
        // alert('Your browser does not support notifications. Please open SikhiTambola in Chrome browser (or other supported browser) and try again.');
        console.log(ex);
    }
    
    // if (isNotificationAccessGranted()) {
    /* if ((getFromLocalStorage('allowNotif') === '1')) {
        $('#allowNotifyLink').hide();
        if (!isNotificationAccessGranted()) {
            getNotificationPermission(function() {
                addToLocalStorage('allowNotif', '1');
                // displayNotifyLink();
            });
        }
        /-* else {
            addToLocalStorage('allowNotif', '0');
            displayNotifyLink();
        } *-/
    }
    else {
        $('#allowNotifyLink').show(300);
        $('#allowNotifyLink').on('click', function() {
            if ('Notification' in window && navigator.serviceWorker) {
                $('#allowNotifyLink').hide();
                getNotificationPermission(function() {
                    addToLocalStorage('allowNotif', '1');
                    // displayNotifyLink();
                });
            }
            else {
                alert('Your browser does not support notifications. Please open Sikhi Tambola in Chrome browser and try again.');
            }
        });
    } */
}


/**
 * Notification: Conditional showing of Notification permission button.
 */
function handleshowNotificationClick() {
    $('#showNotification').on('click', () => {
        if ('Notification' in window && navigator.serviceWorker) {
            const notificationTitle = 'payload.notification.title'; // 'Background Message Title FB-SW';
            const notificationOptions = {
                body: 'payload.notification.body', // 'Background Message body. FB-SW',
                icon: 'img/apple-touch-icon.png',
                // image: 'https://sikhitambola.web.app/img/apple-touch-icon.png',
                badge: 'img/logo_transparent.png',
                // click_action: 'https://sikhitambola.web.app/',
                // requireInteraction: true,
                /* actions: [
                {
                    action: 'question-action',
                    title: 'Questions'
                },
                {
                    action: 'winner-action',
                    title: 'Winners'
                }
                ], */
                // tag: 'tag-reminder',
                // renotify: true,
                // vibrate: [200, 100, 200, 100, 200, 100, 200]
                // data: {
                //     options: {
                //     action: 'default',
                //     close: true,
                //     notificationCloseEvent: false,
                //     url: 'https://sikhitambola.web.app/',
                //     }
                // }
            };

            let notification = new Notification(notificationTitle, notificationOptions);
            // navigate to a URL
            notification.onclick = function() {
                window.location = 'http://localhost:5000/';
            };
        }
        else {
            alert('Your browser does not support notifications. Please open Sikhi Tambola in Chrome browser and try again.');
        }

        /* Notification.showNotification(notificationTitle,
            notificationOptions); */
    });
}

//******************* go to top button functionality**************************** */
function gototop() {
  $(window).scroll(function () {
    if ($(this).scrollTop() > 800) {
      $('#back-to-top').fadeIn();
    } else {
      $('#back-to-top').fadeOut();
    }
  });
  // scroll body to 0px on click
  $('#back-to-top').click(function () {
    $('body,html').animate({
      scrollTop: 0
    }, 400);
    return false;
  });
}

// $(document).ready(function(){
	
// });

/**
 * On page load function
 */
$(function onDocReady() {
	logMessage('Inside onDocReady');
    addHTMLToPage();
    loadHeaderActions();
    loadSharingButtons();
    
    sleep(2000).then(displayNotifyLink); // Notifications: Taking permission to send notifications.
    toggleHowToPlay();
    handleshowNotificationClick();

    // navbar collapse functionality
    menuCollapse();

    // go to top functionality
    gototop();
});

function checkDisplaySubHeadingBar() {
    logMessage('Inside checkDisplaySubHeadingBar');
    displaySubHeadingBar(true);
    logMessage('Going out of checkDisplaySubHeadingBar');
}

checkLogin(firebase.auth(), successLogin, failureLogin);
init();

var subheader = null;
if (subheader == null) subheader = setInterval(checkDisplaySubHeadingBar, 60000);

spinnerVisible(true);
