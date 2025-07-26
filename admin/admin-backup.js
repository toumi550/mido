// PANNEAU ADMIN RANIA SHOP - VERSION PROPRE POUR CONNEXION
// ========================================================

// Variables globales
let currentUser = null;
let products = [];
let orders = [];

// Éléments DOM
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initialisation du panneau admin...');
    initializeAdmin();
});

function initializeAdmin() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase non chargé');
        return;
    }

    console.log('✅ Firebase détecté');

    // Authentification
    firebase.auth().onAuthStateChanged((user) => {
        console.log('🔐 État d\'authentification:', user ? 'Connecté' : 'Déconnecté');
        if (user) {
            console.log('👤 Utilisateur:', user.email);
            currentUser = user;
            showDashboard();
        } else {
            showLoginScreen();
        }
    });

    setupEventListeners();
    console.log('✅ Initialisation terminée');
}

function setupEventListeners() {
    console.log('🎯 Configuration des event listeners...');
    
    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Event listener login configuré');
    }

    // Navigation
    const menuItems = document.querySelectorAll('.menu-item');
    console.log('📋 Menu items trouvés:', menuItems.length);
    menuItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Event listener logout configuré');
    }

    console.log('✅ Event listeners configurés');
}

// ===== AUTHENTIFICATION =====
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Tentative de connexion...');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showLoginError('Veuillez remplir tous les champs');
        return;
    }

    try {
        console.log('📧 Email:', email);
        await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Connexion réussie');
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        let errorMessage = 'Erreur de connexion';

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Utilisateur non trouvé';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email invalide';
        }

        showLoginError(errorMessage);
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        console.log('✅ Déconnexion réussie');
    } catch (error) {
        console.error('❌ Erreur de déconnexion:', error);
    }
}

// ===== AFFICHAGE =====
function showLoginScreen() {
    console.log('🔐 Affichage écran de connexion');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
}

function showDashboard() {
    console.log('📊 Affichage dashboard');
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';

    const adminEmailElement = document.getElementById('adminEmail');
    if (adminEmailElement && currentUser) {
        adminEmailElement.textContent = currentUser.email;
        console.log('✅ Email admin affiché:', currentUser.email);
    }

    loadDashboardData();
}

function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 5000);
    }
}

// ===== NAVIGATION =====
function handleNavigation(e) {
    e.preventDefault();
    console.log('🧭 Navigation cliquée');
    
    const sectionName = e.target.getAttribute('data-section');
    console.log('📍 Section:', sectionName);
    if (!sectionName) return;

    // Mettre à jour menu actif
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');

    // Afficher section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('✅ Section affichée:', sectionName);
    }

    // Mettre à jour titre
    const titles = {
        dashboard: 'Dashboard',
        products: 'Gestion des Produits',
        orders: 'Gestion des Commandes',
        analytics: 'Statistiques',
        account: 'Mon Compte',
        settings: 'Paramètres'
    };

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && titles[sectionName]) {
        pageTitle.textContent = titles[sectionName];
        console.log('✅ Titre mis à jour:', titles[sectionName]);
    }

    loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
    console.log('📂 Chargement des données pour la section:', sectionName);
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            console.log('📦 Section produits - fonctionnalité à implémenter');
            break;
        case 'orders':
            console.log('🛒 Section commandes - fonctionnalité à implémenter');
            break;
        case 'analytics':
            console.log('📊 Section analytics - fonctionnalité à implémenter');
            break;
        case 'account':
            console.log('👤 Section compte - fonctionnalité à implémenter');
            break;
        case 'settings':
            console.log('⚙️ Section paramètres - fonctionnalité à implémenter');
            break;
    }
}

// ===== DASHBOARD =====
async function loadDashboardData() {
    console.log('📊 Chargement des données du dashboard...');
    
    try {
        // Charger produits
        console.log('📦 Chargement des produits...');
        const productsSnapshot = await firebase.firestore().collection('products').get();
        console.log('✅ Produits chargés:', productsSnapshot.size);

        // Charger commandes
        console.log('🛒 Chargement des commandes...');
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        console.log('✅ Commandes chargées:', ordersSnapshot.size);

        console.log('✅ Données du dashboard chargées avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du chargement du dashboard:', error);
    }
}

console.log('✅ Admin panel corrigé initialisé');