// Script pour forcer la bonne configuration Firebase
// À exécuter dans la console du navigateur

console.log('🔧 Diagnostic Firebase...');

// Vérifier la configuration actuelle
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase chargé');
    console.log('📋 Configuration actuelle:', firebase.app().options);
    
    // Vérifier si c'est la bonne API key
    const currentApiKey = firebase.app().options.apiKey;
    const correctApiKey = 'AIzaSyCMHnyFo55VTydqqNJ29x1O0NrUOzQ2dj8';
    
    if (currentApiKey === correctApiKey) {
        console.log('✅ API Key correcte');
    } else {
        console.log('❌ Mauvaise API Key!');
        console.log('Actuelle:', currentApiKey);
        console.log('Attendue:', correctApiKey);
    }
    
    // Vérifier le projet ID
    const currentProjectId = firebase.app().options.projectId;
    const correctProjectId = 'rania-shop-1fc2e';
    
    if (currentProjectId === correctProjectId) {
        console.log('✅ Project ID correct');
    } else {
        console.log('❌ Mauvais Project ID!');
        console.log('Actuel:', currentProjectId);
        console.log('Attendu:', correctProjectId);
    }
    
} else {
    console.log('❌ Firebase non chargé');
}

// Fonction pour tester la connexion avec le bon email
async function testCorrectLogin() {
    const email = 'rania.shop@gmail.com'; // Email correct
    const password = prompt('Entrez le mot de passe pour rania.shop@gmail.com:');
    
    if (!password) return;
    
    try {
        console.log('🔐 Test de connexion avec:', email);
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Connexion réussie!', result.user.email);
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        console.log('Code d\'erreur:', error.code);
        console.log('Message:', error.message);
    }
}

// Fonction pour vider le cache
function clearCache() {
    console.log('🧹 Nettoyage du cache...');
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Cache nettoyé. Rechargez la page.');
}

console.log('📋 Fonctions disponibles:');
console.log('- testCorrectLogin() : Tester la connexion avec le bon email');
console.log('- clearCache() : Vider le cache du navigateur');