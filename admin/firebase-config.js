// Firebase Configuration - RANIA SHOP
// Compte administrateur: raniia.shopp@gmail.com

const firebaseConfig = {
    apiKey: "AIzaSyCMHnyFo55VTydqqNJ29x1O0NrUOzQ2dj8",
    authDomain: "rania-shop-1fc2e.firebaseapp.com",
    projectId: "rania-shop-1fc2e",
    storageBucket: "rania-shop-1fc2e.firebasestorage.app",
    messagingSenderId: "738134910408",
    appId: "1:738134910408:web:ca1dbcfa1d06ff18ad0cfd"
};

try {
    console.log('🔥 Initialisation Firebase...');
    
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK non chargé');
    }
    
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialisé avec succès');
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    window.firebaseAuth = auth;
    window.firebaseDB = db;
    
    console.log('✅ Services Firebase prêts');
    console.log('📧 Compte admin: raniia.shopp@gmail.com');
    
} catch (error) {
    console.error('❌ Erreur Firebase:', error);
    alert('Erreur Firebase: ' + error.message);
}