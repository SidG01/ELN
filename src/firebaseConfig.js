const firebaseConfig = {
    apiKey: "AIzaSyC3BLs1uTT8-1R5m2FWHhdqieNybKooSqQ",
    authDomain: "dna-nanobots-eln.firebaseapp.com",
    projectId: "dna-nanobots-eln",
    storageBucket: "dna-nanobots-eln.firebasestorage.app",
    messagingSenderId: "477884001059",
    appId: "1:477884001059:web:07b16b169609615f38ba96",
    measurementId: "G-3VKH2T1E5N"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
window.firebase = firebase;