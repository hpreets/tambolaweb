const firebaseConfig = {
    apiKey: "AIzaSyBncGdJvFEZPsz6UDodLlvB1LJM5swk-aA",
    authDomain: "sikhitambola.firebaseapp.com",
    databaseURL: "https://sikhitambola.firebaseio.com",
    projectId: "sikhitambola",
    storageBucket: "sikhitambola.appspot.com",
    messagingSenderId: "520012792742",
    appId: "1:520012792742:web:790a81900e73845bf98567",
	measurementId: "G-4K4F0EMPSG"
  };

// Initialize Firebase
const stApp = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(stApp);

