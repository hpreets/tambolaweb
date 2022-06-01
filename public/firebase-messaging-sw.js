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
  const notificationTitle = payload.notification.title; // 'Background Message Title FB-SW';
  const notificationOptions = {
    body: payload.notification.body, // 'Background Message body. FB-SW',
    icon: 'https://sikhitambola.web.app/img/apple-touch-icon.png',
    // image: 'https://sikhitambola.web.app/img/apple-touch-icon.png',
    badge: 'https://sikhitambola.web.app/img/logo_transparent.png',
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
    ],
    tag: 'tag-reminder',
    // renotify: true,
    vibrate: [200, 100, 200, 100, 200, 100, 200] */
  };

  e.waitUntil(
    self.registration.showNotification(notificationTitle,
    notificationOptions)
  );
});


self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${JSON.stringify(event)}"`);
  console.log(`[Service Worker] Push had this data: "${JSON.stringify(event.data)}"`);
  console.log(`[Service Worker] Push had this notification: "${JSON.stringify(event.notification)}"`);
  /* console.log(`[Service Worker] Push had this data: "${event.data.text()}"`); */

  /* let title = event.notification.title;
  let body = event.notification.body;
  if (title == null) {
    title = event.data.text();
    body = 'Don\'t forget to play';
  } */

  let title = 'Sikhi Tambola';
  let body = 'Don\'t forget to play';

  var data = {};
  if (event.data) {
    data = event.data.json();
  }
  title = data.title || title;
  body = data.message || body;

  const options = {
    body: body,
    icon: 'img/apple-touch-icon.png',
    badge: 'img/logo_transparent.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});


//Code for adding event on click of notification
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  let url = 'https://sikhitambola.web.app';
  if (!event.action) {
    // Was a normal notification click
    console.log('Notification Click.');
  }
  else {

    /* switch (event.action) {
      case 'question-action':
        url = 'https://sikhitambola.web.app'
        break;
      case 'winner-action':
        url = 'https://sikhitambola.web.app/winners.html'
        break;
    } */
  }

  event.notification.close(); 
  event.waitUntil(clients.openWindow(url));


  /* event.waitUntil(
    clients.matchAll({type: 'window'})
    .then( 
      windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          
          // If so, just focus it.
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }
    )
  ); */
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