// Firebase Configuration
// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase
const firebaseConfig = {
    // Vous devez remplacer ces valeurs par votre propre configuration Firebase
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Instructions pour obtenir votre configuration Firebase :
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Cliquez sur "Ajouter une application" et choisissez "Web"
// 4. Copiez la configuration et remplacez les valeurs ci-dessus
// 5. Activez Authentication et Firestore Database dans la console Firebase

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Erreur de configuration Firebase. Veuillez vérifier votre configuration.');
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;

// Firebase Auth configuration
auth.useDeviceLanguage(); // Use device language for auth UI

// Firestore settings
db.settings({
    timestampsInSnapshots: true
});

console.log('Firebase services initialized:', {
    auth: !!auth,
    firestore: !!db
});