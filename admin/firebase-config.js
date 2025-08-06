// Firebase Configuration
// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase
const firebaseConfig = {
    // Configuration Firebase pour le nouveau projet rania-shop-1fc2e
    apiKey: "AIzaSyCMHnyFo55VTydqqNJ29x1O0NrUOzQ2dj8",
    authDomain: "rania-shop-1fc2e.firebaseapp.com",
    projectId: "rania-shop-1fc2e",
    storageBucket: "rania-shop-1fc2e.firebasestorage.app",
    messagingSenderId: "1051956451",
    appId: "1:1051956451:web:b8f8f8f8f8f8f8f8f8f8f8"
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

// Add error handling for auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.email);
    } else {
        console.log('User signed out');
    }
});

console.log('Firebase services initialized:', {
    auth: !!auth,
    firestore: !!db
});