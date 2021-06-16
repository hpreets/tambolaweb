/* // SERVER ID - BLmeZfIWsloraH9TUrVQ8H0m5sWtWhugxcSuj0SwRWYsuk74ZDjp91KR0erW_Aw5V5QR4k-e5MMgkY7P1bg1bX4
// CLIENT ID - cx8vIGPNl6bCsLzmlNkBxi:APA91bGokEqx-lNNNkrfGiu4GmjIzx8ZXpiGFQ6tKsOvOACL6xfFkHOc-hD8Pcjz1q6dpK4_0A5CRR13sa-0kr1cDpxxNTvFB0EVNlH31JO_92hVgUowkWkL9fAh8_89VSikIORxe8HF */

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyBncGdJvFEZPsz6UDodLlvB1LJM5swk-aA",
    authDomain: "sikhitambola.firebaseapp.com",
    databaseURL: "https://sikhitambola.firebaseio.com",
    projectId: "sikhitambola",
    storageBucket: "sikhitambola.appspot.com",
    messagingSenderId: "520012792742",
    appId: "1:520012792742:web:790a81900e73845bf98567"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
const constVapidKey = 'BLmeZfIWsloraH9TUrVQ8H0m5sWtWhugxcSuj0SwRWYsuk74ZDjp91KR0erW_Aw5V5QR4k-e5MMgkY7P1bg1bX4';
console.log('Inside firebase-messaging-sw.js');

messaging.getToken({ vapidKey: constVapidKey })
.then((currentToken) => {
  if (currentToken) {
    console.log(currentToken);
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
})
.catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});
  

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});


/*
console.log('Inside firebase-messaging-sw.js');
const OFFLINE_VERSION = 1;
const CACHE_NAME = "offline";

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/',
        '/questions.html',
        '/offline.html',
        '/styles/questions.css',
        '/scripts/init-firebase.js',
        '/scripts/storage.js',
        '/scripts/questions.js'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      console.log('response !== undefined == TRUE');
      return response;
    } else {
      console.log('response !== undefined == FALSE');
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();
        
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/offline.html');
      });
    }
  }));
}); */