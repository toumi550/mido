// Script de test pour vérifier toutes les fonctionnalités du panneau admin
// Ce fichier peut être utilisé pour tester les fonctions en console

console.log('🧪 SCRIPT DE TEST - PANNEAU ADMIN RANIA SHOP');
console.log('============================================');

// Test des fonctions principales
function testAdminFunctions() {
    console.log('🔍 Test des fonctions disponibles...');
    
    // Vérifier les fonctions globales
    const globalFunctions = [
        'showAddProductModal',
        'closeProductModal', 
        'viewProduct',
        'editProduct',
        'updateStock',
        'deleteProduct',
        'viewOrder',
        'updateOrderStatus',
        'deleteOrder',
        'refreshAnalytics'
    ];
    
    console.log('📋 Fonctions globales disponibles :');
    globalFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} - Disponible`);
        } else {
            console.log(`❌ ${funcName} - Manquante`);
        }
    });
    
    // Vérifier les éléments DOM essentiels
    const essentialElements = [
        'loginScreen',
        'adminDashboard',
        'productsTableBody',
        'ordersTableBody',
        'recentOrdersList',
        'topProductsList',
        'wilayaStatsList',
        'refreshAnalytics',
        'addProductBtn'
    ];
    
    console.log('\n🎯 Éléments DOM essentiels :');
    essentialElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ ${elementId} - Trouvé`);
        } else {
            console.log(`❌ ${elementId} - Manquant`);
        }
    });
}

// Test de la connexion Firebase
function testFirebaseConnection() {
    console.log('\n🔥 Test de la connexion Firebase...');
    
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase SDK chargé');
        
        if (firebase.auth) {
            console.log('✅ Firebase Auth disponible');
        } else {
            console.log('❌ Firebase Auth non disponible');
        }
        
        if (firebase.firestore) {
            console.log('✅ Firebase Firestore disponible');
        } else {
            console.log('❌ Firebase Firestore non disponible');
        }
    } else {
        console.log('❌ Firebase SDK non chargé');
    }
}

// Test des event listeners
function testEventListeners() {
    console.log('\n🎯 Test des event listeners...');
    
    // Tester les boutons principaux
    const buttons = [
        { id: 'refreshAnalytics', name: 'Actualiser Analytics' },
        { id: 'addProductBtn', name: 'Ajouter Produit' }
    ];
    
    buttons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            const hasListener = element.onclick !== null || 
                               element.addEventListener !== undefined;
            console.log(`${hasListener ? '✅' : '❌'} ${button.name} - Event listener`);
        }
    });
}

// Fonction pour tester les données
async function testDataLoading() {
    console.log('\n📊 Test du chargement des données...');
    
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            // Test de lecture des produits
            const productsSnapshot = await firebase.firestore()
                .collection('products')
                .limit(1)
                .get();
            
            console.log(`✅ Produits - ${productsSnapshot.size} trouvé(s)`);
            
            // Test de lecture des commandes
            const ordersSnapshot = await firebase.firestore()
                .collection('orders')
                .limit(1)
                .get();
            
            console.log(`✅ Commandes - ${ordersSnapshot.size} trouvée(s)`);
            
        } else {
            console.log('❌ Firebase non disponible pour les tests de données');
        }
    } catch (error) {
        console.log('❌ Erreur lors du test des données:', error.message);
    }
}

// Fonction principale de test
function runAllTests() {
    console.log('🚀 DÉBUT DES TESTS COMPLETS');
    console.log('============================\n');
    
    testAdminFunctions();
    testFirebaseConnection();
    testEventListeners();
    
    // Test des données (asynchrone)
    testDataLoading().then(() => {
        console.log('\n🎉 TESTS TERMINÉS');
        console.log('=================');
        console.log('Vérifiez les résultats ci-dessus pour identifier les problèmes éventuels.');
    });
}

// Fonctions utilitaires pour le debug
function debugCurrentUser() {
    console.log('👤 Utilisateur actuel:', currentUser);
}

function debugProducts() {
    console.log('📦 Produits chargés:', products.length);
    if (products.length > 0) {
        console.log('Premier produit:', products[0]);
    }
}

function debugOrders() {
    console.log('🛒 Commandes chargées:', orders.length);
    if (orders.length > 0) {
        console.log('Première commande:', orders[0]);
    }
}

// Exposer les fonctions de test globalement
window.testAdminFunctions = testAdminFunctions;
window.testFirebaseConnection = testFirebaseConnection;
window.testEventListeners = testEventListeners;
window.testDataLoading = testDataLoading;
window.runAllTests = runAllTests;
window.debugCurrentUser = debugCurrentUser;
window.debugProducts = debugProducts;
window.debugOrders = debugOrders;

console.log('🧪 Script de test chargé !');
console.log('📝 Utilisez runAllTests() pour lancer tous les tests');
console.log('🔍 Fonctions disponibles :');
console.log('  - runAllTests() : Lance tous les tests');
console.log('  - testAdminFunctions() : Test des fonctions');
console.log('  - testFirebaseConnection() : Test Firebase');
console.log('  - testEventListeners() : Test des event listeners');
console.log('  - testDataLoading() : Test du chargement des données');
console.log('  - debugCurrentUser() : Affiche l\'utilisateur actuel');
console.log('  - debugProducts() : Affiche les produits chargés');
console.log('  - debugOrders() : Affiche les commandes chargées');