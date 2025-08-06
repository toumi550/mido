// Firebase Configuration
// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase
const firebaseConfig = {
    // Configuration Firebase pour le projet original avec les données
    apiKey: "AIzaSyAammDyOIAra8S0I4kSTAbrJKOldPDYPA0",
    authDomain: "rania-shop.firebaseapp.com",
    projectId: "rania-shop",
    storageBucket: "rania-shop.firebasestorage.app",
    messagingSenderId: "79782603239",
    appId: "1:79782603239:web:1985a0885dd7fc3968b542"
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