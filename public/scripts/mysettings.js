function successLogin(user) {
    $('#currDisplayName').text(user.displayName);
    $('#inputDisplayName').val(user.displayName);
    getFSUserDetail(setUserDetailOnUI);
}

function setUserDetailOnUI(doc) {
    if (doc.data() != null) {
        if (doc.data().lang == 'punj') $('#langPunj').prop('checked', true);
        else if (doc.data().lang == 'en') $('#langEng').prop('checked', true);
        $('#inputUPI').val(doc.data().upi);
        $('#inputIFSC').val(doc.data().ifsc);
        $('#inputBankAccount').val(doc.data().accNumber);
    }
    if (doc.data() != undefined  &&  doc.data().emailUnsub != undefined  &&  doc.data().emailUnsub == true) {
        $('#emailNotSubscribed').show();
    }
    else {
        $('#emailSubscribed').show();
    }
}

function saveDisplayName() {
    var user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: $('#inputDisplayName').val(),
    }).then(function() {
        $('#currDisplayName').text($('#inputDisplayName').val());
        $('#msgSaveDisplayName').addClass('text-success')
        $('#msgSaveDisplayName').text('Display Name saved successfully');
        $('#toastSaveDisplayName').toast('show');
    }).catch(function(error) {
        $('#msgSaveDisplayName').addClass('text-danger')
        $('#msgSaveDisplayName').text('Error while saving. Please try again later. Err::' + JSON.stringify(error));
        $('#toastSaveDisplayName').toast('show');
    });
}

function savePaymentInfo() {
    logMessage(userEmail);
    var lng = $('#langPunj').prop('checked') == true ? 'punj' : 'en';
    let inputJson = {
        upi: $('#inputUPI').val(),
        // ifsc: $('#inputIFSC').val(),
        // accNumber: $('#inputBankAccount').val(),
        uid: uid,
        lang: lng
    };
    logMessage(inputJson);
    saveMerge(
        'users', 
        userEmail, 
        inputJson, 
        function(doc) {
            $('#msgSavePaymentInfo').addClass('text-success')
            $('#msgSavePaymentInfo').text('Data saved successfully');
            $('#toastSavePaymentInfo').toast('show');
        }, 
        function(doc) {
            $('#msgSavePaymentInfo').addClass('text-danger')
            $('#msgSavePaymentInfo').text('Error while saving. Please try again later. Err::' + JSON.stringify(error));
            $('#toastSavePaymentInfo').toast('show');
        }
    );
}

function saveLanguage() {
    
}

function emailUnsubscribe() {
    doEmailUnsubscribe(true);
}
function emailSubscribe() {
    doEmailUnsubscribe(false);
}

function doEmailUnsubscribe(isUnsub) {
    let inputJson = {
        emailUnsub: isUnsub,
        uid: uid
    };
    saveMerge(
        'users', 
        userEmail, 
        inputJson, 
        function(doc) {
            let msgText = 'Unsubscribed from email successfully';
            if (!isUnsub) {
                msgText = 'Subscribed to emails successfully'
            }
            showToast(
                '#toastNotif', 
                '#msgNotif', 
                'text-success', 
                msgText);

            if (isUnsub) {
                $('#emailNotSubscribed').show();
                $('#emailSubscribed').hide();
            }
            else {
                $('#emailNotSubscribed').hide();
                $('#emailSubscribed').show();
            }
        }, 
        function(doc) {
            showToast(
                '#toastNotif', 
                '#msgNotif', 
                'text-danger', 
                'Error while saving. Please try again later. Err::' + JSON.stringify(error));
        }
    );
}


function showToast(toastId, toastMsgId, toastClass, toastText) {
    $(toastMsgId).addClass(toastClass)
    $(toastMsgId).text(toastText);
    $(toastId).toast('show');
}

/**
 * Method called when current game settings data is fetched from firestore.
 * @param {*} doc - JSON data - current settings data
 */
function successCurrGameFetch(doc) {
    if (doc.data() !== undefined) {
        
    }
}

/**
 * First method that initiates data fetch and UI creation
 */
function init() {
    getFSSettingsData(successCurrGameFetch, null);    
}


$(function onDocReady() {
	logMessage('Inside onDocReady');
    addHTMLToPage();
    loadHeaderActions();
    loadSharingButtons();
    $('#btnLogout').click(signout);
    $('#btnSaveDisplayName').click(saveDisplayName);
    $('#btnSavePayment').click(savePaymentInfo);
    $('#btnEmailUnsubscribe').click(emailUnsubscribe);
    $('#btnEmailSubscribe').click(emailSubscribe);
});



checkLogin(firebase.auth(), successLogin, noLogin);
init();
// setCurrGameQuestions();
