// Script temporaire pour créer l'utilisateur admin
// À exécuter dans la console du navigateur sur le panneau admin

async function createAdminUser() {
    try {
        console.log('🔥 Création de l\'utilisateur admin...');
        
        // Créer l'utilisateur avec Firebase Admin (nécessite les droits)
        const email = 'rania.shop@gmail.com';
        const password = 'RaniaShop2025!'; // Change ce mot de passe
        
        console.log('Email:', email);
        console.log('Mot de passe:', password);
        
        // Tu dois créer cet utilisateur manuellement dans Firebase Console
        console.log('⚠️ Va dans Firebase Console > Authentication > Users');
        console.log('⚠️ Clique sur "Ajouter un utilisateur"');
        console.log('⚠️ Utilise l\'email:', email);
        console.log('⚠️ Utilise un mot de passe sécurisé');
        console.log('⚠️ Assure-toi que l\'email est vérifié');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// Appeler la fonction
createAdminUser();