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
    
    // IMPORTANT: Charger les données du dashboard
    loadDashboardData();
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

// ===== FONCTIONS POUR CHARGER LES DONNÉES FIREBASE =====

// Fonction pour charger les données du dashboard
async function loadDashboardData() {
    console.log('📊 Chargement des données du dashboard...');
    
    try {
        // Charger le nombre de produits
        console.log('📦 Chargement des produits...');
        const productsSnapshot = await firebase.firestore().collection('products').get();
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = productsSnapshot.size;
            console.log('✅ Produits chargés:', productsSnapshot.size);
        }

        // Charger le nombre de commandes
        console.log('🛒 Chargement des commandes...');
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        const totalOrdersElement = document.getElementById('totalOrders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = ordersSnapshot.size;
            console.log('✅ Commandes chargées:', ordersSnapshot.size);
        }

        // Charger les commandes en attente
        console.log('⏳ Chargement des commandes en attente...');
        const pendingOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('status', '==', 'pending')
            .get();
        const pendingOrdersElement = document.getElementById('pendingOrders');
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = pendingOrdersSnapshot.size;
            console.log('✅ Commandes en attente:', pendingOrdersSnapshot.size);
        }

        // Calculer le chiffre d'affaires total
        console.log('💰 Calcul du chiffre d\'affaires...');
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
            console.log('✅ Chiffre d\'affaires calculé:', totalRevenue);
        }

        // Charger les commandes récentes
        await loadRecentOrders();

        console.log('✅ Données du dashboard chargées avec succès');

    } catch (error) {
        console.error('❌ Erreur lors du chargement du dashboard:', error);
        showError('Erreur lors du chargement des données: ' + error.message);
    }
}

// Fonction pour charger les commandes récentes
async function loadRecentOrders() {
    console.log('📋 Chargement des commandes récentes...');
    
    try {
        const recentOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const recentOrdersList = document.getElementById('recentOrdersList');
        if (!recentOrdersList) {
            console.error('❌ Élément recentOrdersList non trouvé');
            return;
        }

        recentOrdersList.innerHTML = '';

        if (recentOrdersSnapshot.empty) {
            recentOrdersList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune commande récente</p>';
            console.log('ℹ️ Aucune commande récente trouvée');
            return;
        }

        console.log('📝 Nombre de commandes récentes:', recentOrdersSnapshot.size);
        recentOrdersSnapshot.forEach(doc => {
            const order = doc.data();
            console.log('📄 Commande récente:', doc.id, order);
            const orderElement = createRecentOrderElement(order, doc.id);
            recentOrdersList.appendChild(orderElement);
        });

        console.log('✅ Commandes récentes chargées');

    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes récentes:', error);
        const recentOrdersList = document.getElementById('recentOrdersList');
        if (recentOrdersList) {
            recentOrdersList.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 20px;">Erreur lors du chargement des commandes récentes</p>';
        }
    }
}

// Fonction pour créer un élément de commande récente
function createRecentOrderElement(order, orderId) {
    const div = document.createElement('div');
    div.className = 'order-item';
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';
    
    const statusClass = order.status || 'pending';
    const statusText = getStatusText(order.status);
    
    div.innerHTML = `
        <div class="order-info">
            <h4>#${order.orderNumber || orderId.substring(0, 8)}</h4>
            <p><i class="fas fa-user"></i> ${order.customerName || 'N/A'}</p>
            <p><i class="fas fa-phone"></i> ${order.customerPhone || 'N/A'}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${order.wilaya || 'N/A'}</p>
            <p><i class="fas fa-clock"></i> ${date}</p>
        </div>
        <div class="order-summary">
            <div class="order-total">${order.total || '0'} DA</div>
            <div class="order-status">
                <span class="status-badge status-${statusClass}">${statusText}</span>
            </div>
            <button class="btn btn-sm btn-info" onclick="viewOrder('${orderId}')">
                <i class="fas fa-eye"></i> Voir
            </button>
        </div>
    `;
    
    return div;
}

// Fonction pour charger toutes les commandes
async function loadOrders() {
    console.log('🛒 Chargement de toutes les commandes...');
    
    try {
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        console.log('📊 Nombre total de commandes:', orders.length);
        displayOrders();

    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        showError('Erreur lors du chargement des commandes: ' + error.message);
    }
}

// Fonction pour afficher les commandes
function displayOrders() {
    console.log('📋 Affichage des commandes...');
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) {
        console.error('❌ Élément ordersTableBody non trouvé');
        return;
    }

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucune commande trouvée</td></tr>';
        console.log('ℹ️ Aucune commande à afficher');
        return;
    }

    console.log('📝 Affichage de', orders.length, 'commandes');
    orders.forEach((order, index) => {
        console.log(`📄 Commande ${index + 1}:`, order);
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

// Fonction pour créer une ligne de commande
function createOrderRow(order) {
    const tr = document.createElement('tr');
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';
    
    const statusClass = order.status || 'pending';
    const statusText = getStatusText(order.status);
    
    // Calculer le nombre d'articles
    const totalItems = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    
    // Ordre des colonnes: Checkbox, ID, Client, Wilaya, Total, Statut, Date, Actions
    tr.innerHTML = `
        <td><input type="checkbox" class="order-checkbox" data-order-id="${order.id}"></td>
        <td><strong>#${order.orderNumber || order.id.substring(0, 8)}</strong></td>
        <td>
            <div class="customer-info">
                <div><i class="fas fa-user"></i> ${order.customerName || 'N/A'}</div>
                <div><i class="fas fa-phone"></i> ${order.customerPhone || 'N/A'}</div>
            </div>
        </td>
        <td><i class="fas fa-map-marker-alt"></i> ${order.wilaya || 'N/A'}</td>
        <td>
            <div class="order-details">
                <div class="total-amount"><strong>${order.total || '0'} DA</strong></div>
                <small>${totalItems} article(s)</small>
            </div>
        </td>
        <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
        <td>
            <div class="date-info">
                <div>${date.split(' ')[0]}</div>
                <small>${date.split(' ')[1] || ''}</small>
            </div>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="viewOrder('${order.id}')" title="Voir détails">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editOrderStatus('${order.id}')" title="Modifier statut">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return tr;
}

// Fonctions utilitaires
function getStatusText(status) {
    const statuses = {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Terminée',
        cancelled: 'Annulée'
    };
    return statuses[status] || status;
}

// Fonctions exposées globalement
window.viewOrder = function(orderId) {
    console.log('👁️ Voir commande:', orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
        console.log('📄 Détails de la commande:', order);
        alert('Commande: ' + (order.customerName || 'N/A') + ' - ' + (order.total || '0') + ' DA');
    }
};

window.editOrderStatus = function(orderId) {
    console.log('✏️ Modifier statut commande:', orderId);
    alert('Fonctionnalité de modification du statut en développement');
};

window.deleteOrder = function(orderId) {
    console.log('🗑️ Supprimer commande:', orderId);
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        alert('Fonctionnalité de suppression en développement');
    }
};

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

    // Charger les données de la section
    loadSectionData(sectionName);
}

// Fonction pour charger les données selon la section
function loadSectionData(sectionName) {
    console.log('📂 Chargement des données pour la section:', sectionName);
    
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'products':
            console.log('📦 Section produits - fonctionnalité à implémenter');
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
        default:
            console.log('❓ Section inconnue:', sectionName);
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