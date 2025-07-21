// Admin Panel JavaScript - Version Debug pour diagnostiquer les problèmes

console.log('🔍 Démarrage du mode debug admin...');

// Variables globales
let currentUser = null;
let products = [];
let orders = [];

// Éléments DOM
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Fonction de diagnostic Firebase
function diagnoseFirebase() {
    console.log('🔍 Diagnostic Firebase...');
    
    // Vérifier si Firebase est chargé
    console.log('Firebase disponible:', typeof firebase !== 'undefined');
    
    if (typeof firebase !== 'undefined') {
        console.log('Firebase app:', !!firebase.app);
        console.log('Firebase auth:', !!firebase.auth);
        console.log('Firebase firestore:', !!firebase.firestore);
        
        try {
            const auth = firebase.auth();
            console.log('Auth instance:', !!auth);
            console.log('Auth currentUser:', auth.currentUser);
        } catch (error) {
            console.error('Erreur auth:', error);
        }
        
        try {
            const db = firebase.firestore();
            console.log('Firestore instance:', !!db);
        } catch (error) {
            console.error('Erreur firestore:', error);
        }
    }
}

// Initialisation avec diagnostic
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du panneau admin (mode debug)...');
    
    // Diagnostic immédiat
    diagnoseFirebase();
    
    // Attendre un peu puis réessayer
    setTimeout(() => {
        console.log('🔍 Second diagnostic après 2 secondes...');
        diagnoseFirebase();
        initializeAdmin();
    }, 2000);
});

function initializeAdmin() {
    console.log('🔧 Initialisation admin...');
    
    // Vérifier si Firebase est chargé
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase non disponible');
        showError('Firebase n\'est pas chargé. Veuillez actualiser la page.');
        return;
    }

    console.log('✅ Firebase détecté');

    try {
        // Test de connexion Firebase
        console.log('🧪 Test de connexion Firebase...');
        
        // Écouter les changements d'authentification avec gestion d'erreur
        firebase.auth().onAuthStateChanged((user) => {
            console.log('🔐 État d\'authentification:', user ? 'Connecté' : 'Déconnecté');
            if (user) {
                console.log('👤 Utilisateur:', user.email);
                currentUser = user;
                showDashboard();
            } else {
                console.log('👤 Aucun utilisateur connecté');
                showLoginScreen();
            }
        }, (error) => {
            console.error('❌ Erreur d\'authentification:', error);
            showLoginError('Erreur de connexion Firebase: ' + error.message);
        });

        // Configurer les event listeners
        setupEventListeners();
        
        console.log('✅ Initialisation terminée');
        
    } catch (error) {
        console.error('❌ Erreur d\'initialisation Firebase:', error);
        showError('Erreur d\'initialisation: ' + error.message);
    }
}

function setupEventListeners() {
    console.log('🎯 Configuration des event listeners...');
    
    // Formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Event listener login configuré');
    } else {
        console.error('❌ Formulaire de login non trouvé');
    }

    // Menu de navigation
    const menuItems = document.querySelectorAll('.menu-item');
    console.log('📋 Menu items trouvés:', menuItems.length);
    
    menuItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Déconnexion
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Event listener logout configuré');
    }

    console.log('✅ Event listeners configurés');
}

// Fonctions d'authentification avec debug
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔑 Tentative de connexion...');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('📧 Email saisi:', email);
    console.log('🔒 Mot de passe saisi:', password ? 'Oui' : 'Non');
    
    if (!email || !password) {
        console.log('❌ Champs manquants');
        showLoginError('Veuillez remplir tous les champs');
        return;
    }
    
    // Vérifier la connexion Firebase avant de tenter la connexion
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase non initialisé');
        showLoginError('Erreur: Firebase non initialisé. Veuillez actualiser la page.');
        return;
    }
    
    try {
        console.log('⏳ Début de la connexion...');
        showLoading('Connexion en cours...');
        
        console.log('🔥 Firebase Auth disponible:', !!firebase.auth());
        
        // Test de connectivité réseau
        console.log('🌐 Test de connectivité...');
        
        // Ajouter un timeout pour éviter les blocages
        const loginPromise = firebase.auth().signInWithEmailAndPassword(email, password);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de connexion')), 15000)
        );
        
        console.log('🚀 Envoi de la requête de connexion...');
        const userCredential = await Promise.race([loginPromise, timeoutPromise]);
        
        console.log('✅ Connexion réussie:', userCredential.user.email);
        console.log('👤 UID:', userCredential.user.uid);
        
        hideLoading();
        
    } catch (error) {
        console.error('❌ Erreur de connexion complète:', error);
        console.error('❌ Code d\'erreur:', error.code);
        console.error('❌ Message d\'erreur:', error.message);
        
        hideLoading();
        
        // Messages d'erreur plus spécifiques
        let errorMessage = '';
        
        if (error.message === 'Timeout de connexion') {
            errorMessage = 'Timeout de connexion. Vérifiez votre connexion internet et réessayez.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Trop de tentatives. Attendez quelques minutes avant de réessayer.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Utilisateur non trouvé. Vérifiez votre email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Format d\'email invalide.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Compte désactivé.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Identifiants invalides.';
        } else {
            errorMessage = 'Erreur de connexion: ' + error.message;
        }
        
        console.log('📝 Message d\'erreur affiché:', errorMessage);
        showLoginError(errorMessage);
    }
}

async function handleLogout() {
    console.log('👋 Tentative de déconnexion...');
    try {
        await firebase.auth().signOut();
        console.log('✅ Déconnexion réussie');
    } catch (error) {
        console.error('❌ Erreur de déconnexion:', error);
        showError('Erreur lors de la déconnexion: ' + error.message);
    }
}

// Fonctions d'affichage avec debug
function showLoginScreen() {
    console.log('📱 Affichage écran de connexion');
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        console.log('✅ Écran de connexion affiché');
    } else {
        console.error('❌ Élément loginScreen non trouvé');
    }
    
    if (adminDashboard) {
        adminDashboard.style.display = 'none';
        console.log('✅ Dashboard masqué');
    }
    
    // Réinitialiser le formulaire
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    // NE PAS afficher d'erreur au chargement initial
    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
}

function showDashboard() {
    console.log('📊 Affichage dashboard');
    if (loginScreen) {
        loginScreen.style.display = 'none';
        console.log('✅ Écran de connexion masqué');
    }
    
    if (adminDashboard) {
        adminDashboard.style.display = 'flex';
        console.log('✅ Dashboard affiché');
    } else {
        console.error('❌ Élément adminDashboard non trouvé');
    }
    
    // Afficher l'email de l'admin
    const adminEmailElement = document.getElementById('adminEmail');
    if (adminEmailElement && currentUser) {
        adminEmailElement.textContent = currentUser.email;
        console.log('✅ Email admin affiché:', currentUser.email);
    }
}

function showLoginError(message) {
    console.log('⚠️ Erreur de connexion:', message);
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        console.log('✅ Message d\'erreur affiché');
    } else {
        console.error('❌ Élément loginError non trouvé');
    }
}

// Navigation basique
function handleNavigation(e) {
    e.preventDefault();
    console.log('🧭 Navigation cliquée');
    
    const sectionName = e.target.getAttribute('data-section');
    console.log('📍 Section:', sectionName);
    
    if (!sectionName) return;

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
        console.log('✅ Section affichée:', sectionName);
    } else {
        console.error('❌ Section non trouvée:', sectionName + 'Section');
    }

    // Mettre à jour le titre de la page
    const titles = {
        dashboard: 'Dashboard',
        products: 'Gestion des Produits',
        orders: 'Gestion des Commandes',
        account: 'Mon Compte',
        analytics: 'Statistiques',
        settings: 'Paramètres'
    };
    
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.textContent = titles[sectionName] || sectionName;
        console.log('✅ Titre mis à jour:', titles[sectionName] || sectionName);
    }
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

console.log('✅ Admin panel debug initialisé');