// Admin Panel JavaScript - Version Simplifiée et Fonctionnelle

// Variables globales
let currentUser = null;
let products = [];
let orders = [];

// Éléments DOM
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du panneau admin...');
    initializeAdmin();
});

function initializeAdmin() {
    // Vérifier si Firebase est chargé
    if (typeof firebase === 'undefined') {
        showError('Firebase n\'est pas chargé. Veuillez vérifier votre connexion internet.');
        return;
    }

    console.log('✅ Firebase détecté');

    // Écouter les changements d\'authentification
    firebase.auth().onAuthStateChanged((user) => {
        console.log('🔐 État d\'authentification:', user ? 'Connecté' : 'Déconnecté');
        if (user) {
            currentUser = user;
            showDashboard();
            loadDashboardData();
        } else {
            showLoginScreen();
        }
    });

    // Configurer les event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Menu de navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Déconnexion
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    console.log('✅ Event listeners configurés');
}

// Fonctions d'authentification
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔑 Tentative de connexion...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showLoginError('Veuillez remplir tous les champs');
        return;
    }
    
    try {
        showLoading('Connexion en cours...');
        console.log('📧 Email:', email);
        
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Connexion réussie:', userCredential.user.email);
        
        hideLoading();
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        hideLoading();
        showLoginError(getErrorMessage(error.code));
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        console.log('👋 Déconnexion réussie');
    } catch (error) {
        console.error('❌ Erreur de déconnexion:', error);
        showError('Erreur lors de la déconnexion: ' + error.message);
    }
}

// Fonctions d'affichage
function showLoginScreen() {
    console.log('📱 Affichage écran de connexion');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
    
    // Réinitialiser le formulaire
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (loginError) loginError.textContent = '';
}

function showDashboard() {
    console.log('📊 Affichage dashboard');
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';
    
    // Afficher l'email de l'admin
    const adminEmailElement = document.getElementById('adminEmail');
    if (adminEmailElement && currentUser) {
        adminEmailElement.textContent = currentUser.email;
    }
}

function showLoginError(message) {
    console.log('⚠️ Erreur de connexion:', message);
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
}

// Navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const sectionName = e.target.getAttribute('data-section');
    if (!sectionName) return;

    console.log('🧭 Navigation vers:', sectionName);

    // Mettre à jour le menu actif
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');

    // Afficher la section correspondante
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const sectionElement = document.getElementById(sectionName + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

    // Mettre à jour le titre de la page
    const titles = {
        dashboard: 'Dashboard',
        products: 'Gestion des Produits',
        orders: 'Gestion des Commandes',
        settings: 'Paramètres'
    };
    
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.textContent = titles[sectionName] || sectionName;
    }

    // Charger les données de la section
    loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Fonctions du dashboard
async function loadDashboardData() {
    console.log('📊 Chargement des données du dashboard...');
    
    try {
        // Charger le nombre de produits
        const productsSnapshot = await firebase.firestore().collection('products').get();
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = productsSnapshot.size;
        }

        // Charger le nombre de commandes
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        const totalOrdersElement = document.getElementById('totalOrders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = ordersSnapshot.size;
        }

        // Charger les commandes en attente
        const pendingOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('status', '==', 'pending')
            .get();
        const pendingOrdersElement = document.getElementById('pendingOrders');
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = pendingOrdersSnapshot.size;
        }

        // Calculer le chiffre d'affaires total
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            if (order.status === 'completed' && order.total) {
                const totalValue = typeof order.total === 'number' 
                    ? order.total 
                    : parseFloat(order.total.toString().replace(/[^\d]/g, ''));
                totalRevenue += totalValue || 0;
            }
        });
        
        const totalRevenueElement = document.getElementById('totalRevenue');
        if (totalRevenueElement) {
            totalRevenueElement.textContent = totalRevenue.toLocaleString() + ' DA';
        }

        console.log('✅ Données du dashboard chargées');

    } catch (error) {
        console.error('❌ Erreur lors du chargement du dashboard:', error);
        showError('Erreur lors du chargement des données: ' + error.message);
    }
}

// Fonctions des produits
async function loadProducts() {
    console.log('📦 Chargement des produits...');
    
    try {
        const productsSnapshot = await firebase.firestore()
            .collection('products')
            .orderBy('createdAt', 'desc')
            .get();

        products = [];
        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        displayProducts();
        console.log('✅ Produits chargés:', products.length);

    } catch (error) {
        console.error('❌ Erreur lors du chargement des produits:', error);
        showError('Erreur lors du chargement des produits: ' + error.message);
    }
}

function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucun produit trouvé</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

function createProductRow(product) {
    const tr = document.createElement('tr');
    
    const nameAr = product.name?.ar || product.name || 'N/A';
    const nameFr = product.name?.fr || product.name || 'N/A';
    const price = product.price || 0;
    const category = product.category || 'N/A';

    tr.innerHTML = `
        <td>${nameAr}</td>
        <td>${nameFr}</td>
        <td>${price} DA</td>
        <td>${getCategoryText(category)}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="viewProduct('${product.id}')">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// Fonctions des commandes
async function loadOrders() {
    console.log('🛒 Chargement des commandes...');
    
    try {
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        displayOrders();
        console.log('✅ Commandes chargées:', orders.length);

    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        showError('Erreur lors du chargement des commandes: ' + error.message);
    }
}

function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucune commande trouvée</td></tr>';
        return;
    }

    orders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

function createOrderRow(order) {
    const tr = document.createElement('tr');
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';
    
    tr.innerHTML = `
        <td>#${order.orderNumber || order.id.substring(0, 8)}</td>
        <td>${order.customerName || 'N/A'}</td>
        <td>${order.customerPhone || 'N/A'}</td>
        <td>${order.wilaya || 'N/A'}</td>
        <td>${order.total || '0'} DA</td>
        <td><span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span></td>
        <td>${date}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="viewOrder('${order.id}')">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// Fonctions des paramètres
function loadSettings() {
    console.log('⚙️ Chargement des paramètres...');
    // Implémentation basique des paramètres
}

// Fonctions utilitaires
function getCategoryText(category) {
    const categories = {
        hair: 'Cheveux',
        makeup: 'Maquillage',
        skincare: 'Soins',
        lenses: 'Lentilles',
        clothing: 'Vêtements'
    };
    return categories[category] || category;
}

function getStatusText(status) {
    const statuses = {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Terminée',
        cancelled: 'Annulée'
    };
    return statuses[status] || status;
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'Utilisateur non trouvé. Vérifiez votre email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-email': 'Format d\'email invalide.',
        'auth/user-disabled': 'Compte désactivé.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet.',
        'auth/invalid-credential': 'Identifiants invalides.'
    };
    return errorMessages[errorCode] || 'Erreur de connexion. Vérifiez vos identifiants.';
}

// Fonctions d'affichage des messages
function showError(message) {
    console.error('❌', message);
    alert('Erreur: ' + message);
}

function showSuccess(message) {
    console.log('✅', message);
    alert('Succès: ' + message);
}

function showLoading(message) {
    console.log('⏳', message);
    // Implémentation basique du loading
}

function hideLoading() {
    console.log('✅ Loading terminé');
    // Implémentation basique du loading
}

// Fonctions exposées globalement
window.viewProduct = function(productId) {
    console.log('👁️ Voir produit:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        alert('Produit: ' + (product.name?.fr || product.name || 'N/A'));
    }
};

window.viewOrder = function(orderId) {
    console.log('👁️ Voir commande:', orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert('Commande: ' + (order.customerName || 'N/A') + ' - ' + (order.total || '0') + ' DA');
    }
};

console.log('✅ Admin panel simplifié initialisé');