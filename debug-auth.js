// Script de debug pour l'authentification
// À exécuter dans la console du navigateur (F12) sur le panneau admin

// 1. Tester la connexion Firebase
function testFirebaseConnection() {
    console.log('🔥 Test de connexion Firebase...');
    console.log('Firebase disponible:', typeof firebase !== 'undefined');
    console.log('Firebase Auth disponible:', !!(firebase && firebase.auth));
    console.log('Firebase Firestore disponible:', !!(firebase && firebase.firestore));
    
    if (firebase && firebase.auth) {
        console.log('Auth instance:', firebase.auth());
        console.log('Current user:', firebase.auth().currentUser);
    }
}

// 2. Lister tous les utilisateurs (ne fonctionne que côté admin)
async function listUsers() {
    try {
        console.log('📋 Tentative de listage des utilisateurs...');
        // Cette fonction ne marchera pas côté client, c'est normal
        console.log('⚠️ Cette fonction nécessite les droits admin Firebase');
        console.log('⚠️ Va dans Firebase Console > Authentication > Users pour voir les utilisateurs');
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// 3. Tester une connexion spécifique
async function testLogin(email, password) {
    try {
        console.log('🔐 Test de connexion avec:', email);
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Connexion réussie:', result.user.email);
        return result;
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message:', error.message);
        return null;
    }
}

// 4. Vérifier l'état actuel
function checkAuthState() {
    console.log('🔍 État d\'authentification actuel...');
    const user = firebase.auth().currentUser;
    if (user) {
        console.log('✅ Utilisateur connecté:', user.email);
        console.log('Email vérifié:', user.emailVerified);
        console.log('UID:', user.uid);
    } else {
        console.log('❌ Aucun utilisateur connecté');
    }
}

// Exécuter les tests
console.log('🚀 Scripts de debug chargés. Fonctions disponibles :');
console.log('- testFirebaseConnection()');
console.log('- testLogin(email, password)');
console.log('- checkAuthState()');
console.log('- listUsers()');

// Test automatique
testFirebaseConnection();
checkAuthState();