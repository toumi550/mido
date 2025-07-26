// PANNEAU ADMIN RANIA SHOP - VERSION COMPLÈTE CORRIGÉE
// =====================================================

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
        showError('Firebase non chargé');
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

    // Menu hamburger mobile
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        });
    }

    // Event listeners avec délai pour les éléments chargés dynamiquement
    setTimeout(() => {
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                console.log('🔄 Actualisation des analytics...');
                loadAnalytics();
            });
        }

        // Formulaires de paramètres
        const siteSettingsForm = document.getElementById('siteSettingsForm');
        if (siteSettingsForm) {
            siteSettingsForm.addEventListener('submit', handleSiteSettingsSubmit);
        }

        const socialSettingsForm = document.getElementById('socialSettingsForm');
        if (socialSettingsForm) {
            socialSettingsForm.addEventListener('submit', handleSocialSettingsSubmit);
        }

        // Event listeners pour la gestion des admins
        const addAdminBtn = document.getElementById('addAdminBtn');
        if (addAdminBtn) {
            addAdminBtn.addEventListener('click', showAddAdminModal);
        }

        const adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.addEventListener('submit', handleAdminFormSubmit);
        }

        // Event listener pour la modification d'email admin
        const changeEmailForm = document.getElementById('changeEmailForm');
        if (changeEmailForm) {
            changeEmailForm.addEventListener('submit', handleChangeEmailSubmit);
        }
    }, 1000);

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
        showError('Erreur de déconnexion');
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

function showError(message) {
    console.error('❌ Erreur:', message);
    alert('Erreur: ' + message);
}

function showSuccess(message) {
    console.log('✅ Succès:', message);
    alert('Succès: ' + message);
}

function showLoading() {
    console.log('⏳ Chargement...');
}

function hideLoading() {
    console.log('✅ Chargement terminé');
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
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'account':
            loadCurrentAdminEmail();
            break;
        case 'settings':
            loadSiteSettings();
            loadAdmins();
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
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = productsSnapshot.size;
        }
        console.log('✅ Produits chargés:', productsSnapshot.size);

        // Charger commandes
        console.log('🛒 Chargement des commandes...');
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        const totalOrdersElement = document.getElementById('totalOrders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = ordersSnapshot.size;
        }
        console.log('✅ Commandes chargées:', ordersSnapshot.size);

        // Commandes en attente
        console.log('⏳ Chargement des commandes en attente...');
        const pendingOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('status', '==', 'pending')
            .get();
        
        const pendingOrdersElement = document.getElementById('pendingOrders');
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = pendingOrdersSnapshot.size;
        }
        console.log('✅ Commandes en attente:', pendingOrdersSnapshot.size);

        // Chiffre d'affaires
        console.log('💰 Calcul du chiffre d\'affaires...');
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            if (order.status === 'completed' || order.status === 'delivered') {
                totalRevenue += order.total || 0;
            }
        });
        
        const totalRevenueElement = document.getElementById('totalRevenue');
        if (totalRevenueElement) {
            totalRevenueElement.textContent = totalRevenue;
        }
        console.log('✅ Chiffre d\'affaires calculé:', totalRevenue);

        // Charger commandes récentes
        console.log('📋 Chargement des commandes récentes...');
        const recentOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const recentOrdersList = document.getElementById('recentOrdersList');
        if (recentOrdersList) {
            recentOrdersList.innerHTML = '';
            
            if (recentOrdersSnapshot.empty) {
                recentOrdersList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune commande récente</p>';
                return;
            }

            console.log('📝 Nombre de commandes récentes:', recentOrdersSnapshot.size);
            recentOrdersSnapshot.forEach(doc => {
                const order = doc.data();
                console.log('📄 Commande récente:', doc.id, order);
                const orderElement = createRecentOrderElement(doc.id, order);
                recentOrdersList.appendChild(orderElement);
            });
        }
        console.log('✅ Commandes récentes chargées');

        console.log('✅ Données du dashboard chargées avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du chargement du dashboard:', error);
        showError('Erreur lors du chargement du dashboard');
    }
}

function createRecentOrderElement(orderId, order) {
    const div = document.createElement('div');
    div.className = 'order-item';

    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';
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
                <span class="status-badge status-${order.status || 'pending'}">${statusText}</span>
            </div>
            <button class="btn btn-sm btn-info" onclick="viewOrder('${orderId}')">
                <i class="fas fa-eye"></i> Voir
            </button>
        </div>
    `;

    return div;
}

// ===== GESTION DES PRODUITS =====
async function loadProducts() {
    console.log('📦 Chargement des produits...');
    
    try {
        const db = firebase.firestore();
        const productsSnapshot = await db.collection('products').get();
        
        products = [];
        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        console.log('✅ Produits chargés:', products.length);
        displayProducts();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des produits:', error);
        showError('Erreur lors du chargement des produits');
    }
}

function displayProducts() {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Aucun produit trouvé</td></tr>';
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
    const purchasePrice = product.purchasePrice || 0;
    const salePrice = product.price || product.salePrice || 0;
    const stock = product.stock || 0;
    const category = product.category || 'N/A';

    const margin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice * 100).toFixed(1) : 0;
    const marginClass = margin > 30 ? 'high-margin' : margin > 15 ? 'medium-margin' : 'low-margin';

    const imageUrl = product.image || '../image/default-product.jpg';

    tr.innerHTML = `
        <td>
            <img src="${imageUrl}" alt="${nameFr}" class="product-image" onerror="this.src='../image/default-product.jpg'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        </td>
        <td>${nameAr}</td>
        <td>${nameFr}</td>
        <td>${purchasePrice} DA</td>
        <td>${salePrice} DA</td>
        <td class="${marginClass}">${margin}%</td>
        <td class="${stock < 10 ? 'low-stock' : ''}">${stock}</td>
        <td>${category}</td>
        <td>
            <button onclick="editProduct('${product.id}')" class="btn btn-sm btn-warning" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="manageStock('${product.id}')" class="btn btn-sm btn-info" title="Gérer stock">
                <i class="fas fa-boxes"></i>
            </button>
            <button onclick="deleteProduct('${product.id}')" class="btn btn-sm btn-danger" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    return tr;
}

// ===== GESTION DES COMMANDES =====
async function loadOrders() {
    console.log('🛒 Chargement de toutes les commandes...');
    
    try {
        const db = firebase.firestore();
        const ordersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
        
        orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        console.log('📊 Nombre total de commandes:', orders.length);
        displayOrders();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        showError('Erreur lors du chargement des commandes');
    }
}

function displayOrders() {
    console.log('📋 Affichage des commandes...');
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Aucune commande trouvée</td></tr>';
        return;
    }

    console.log('📝 Affichage de', orders.length, 'commandes');
    orders.forEach((order, index) => {
        console.log(`📄 Commande ${index + 1}:`, order);
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

function createOrderRow(order) {
    const tr = document.createElement('tr');
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';
    const statusText = getStatusText(order.status);

    tr.innerHTML = `
        <td>
            <input type="checkbox" class="order-checkbox" value="${order.id}">
        </td>
        <td>#${order.orderNumber || order.id.substring(0, 8)}</td>
        <td>${order.customerName || 'N/A'}</td>
        <td>${order.wilaya || 'N/A'}</td>
        <td>${order.total || '0'} DA</td>
        <td>
            <span class="status-badge status-${order.status || 'pending'}">${statusText}</span>
        </td>
        <td>${date}</td>
        <td>
            <button onclick="viewOrder('${order.id}')" class="btn btn-sm btn-info" title="Voir détails">
                <i class="fas fa-eye"></i>
            </button>
            <button onclick="updateOrderStatus('${order.id}')" class="btn btn-sm btn-warning" title="Modifier statut">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteOrder('${order.id}')" class="btn btn-sm btn-danger" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    return tr;
}

// ===== ANALYTICS =====
async function loadAnalytics() {
    console.log('📊 Chargement des analytics...');
    
    try {
        const db = firebase.firestore();
        const ordersSnapshot = await db.collection('orders').get();
        
        console.log('📊', ordersSnapshot.size, 'commandes chargées pour analytics');
        
        // Ici vous pouvez ajouter la logique pour les analytics
        console.log('✅ Analytics chargées avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des analytics:', error);
        showError('Erreur lors du chargement des analytics');
    }
}

// ===== GESTION DES PARAMÈTRES =====
async function loadSiteSettings() {
    console.log('⚙️ Chargement des paramètres du site...');
    
    try {
        const db = firebase.firestore();
        
        // Charger les paramètres généraux
        const siteDoc = await db.collection('settings').doc('site').get();
        if (siteDoc.exists) {
            const siteData = siteDoc.data();
            
            // Pré-remplir le formulaire
            const siteNameInput = document.getElementById('siteName');
            const contactEmailInput = document.getElementById('contactEmail');
            const contactPhoneInput = document.getElementById('contactPhone');
            
            if (siteNameInput) siteNameInput.value = siteData.siteName || '';
            if (contactEmailInput) contactEmailInput.value = siteData.contactEmail || '';
            if (contactPhoneInput) contactPhoneInput.value = siteData.contactPhone || '';
        }
        
        // Charger les paramètres sociaux
        const socialDoc = await db.collection('settings').doc('social').get();
        if (socialDoc.exists) {
            const socialData = socialDoc.data();
            
            const facebookInput = document.getElementById('facebookUrl');
            const instagramInput = document.getElementById('instagramUrl');
            const whatsappInput = document.getElementById('whatsappNumber');
            const tiktokInput = document.getElementById('tiktokUrl');
            
            if (facebookInput) facebookInput.value = socialData.facebookUrl || '';
            if (instagramInput) instagramInput.value = socialData.instagramUrl || '';
            if (whatsappInput) whatsappInput.value = socialData.whatsappNumber || '';
            if (tiktokInput) tiktokInput.value = socialData.tiktokUrl || '';
        }
        
        console.log('✅ Paramètres du site chargés');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
        showError('Erreur lors du chargement des paramètres');
    }
}

async function handleSiteSettingsSubmit(e) {
    e.preventDefault();
    
    const siteData = {
        siteName: document.getElementById('siteName').value.trim(),
        contactEmail: document.getElementById('contactEmail').value.trim(),
        contactPhone: document.getElementById('contactPhone').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        const db = firebase.firestore();
        await db.collection('settings').doc('site').set(siteData, { merge: true });
        
        showSuccess('Paramètres du site sauvegardés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showError('Erreur lors de la sauvegarde des paramètres');
    }
}

async function handleSocialSettingsSubmit(e) {
    e.preventDefault();
    
    const socialData = {
        facebookUrl: document.getElementById('facebookUrl').value.trim(),
        instagramUrl: document.getElementById('instagramUrl').value.trim(),
        whatsappNumber: document.getElementById('whatsappNumber').value.trim(),
        tiktokUrl: document.getElementById('tiktokUrl').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        const db = firebase.firestore();
        await db.collection('settings').doc('social').set(socialData, { merge: true });
        
        showSuccess('Paramètres des réseaux sociaux sauvegardés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showError('Erreur lors de la sauvegarde des paramètres sociaux');
    }
}

// ===== FONCTIONS UTILITAIRES =====
function getStatusText(status) {
    const statusMap = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'processing': 'En traitement',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
    };
    return statusMap[status] || 'Inconnu';
}

// Exposer les fonctions au scope global
window.viewOrder = function(orderId) {
    console.log('👁️ Voir commande:', orderId);
    alert('Fonctionnalité à implémenter: Voir commande ' + orderId);
};

window.updateOrderStatus = function(orderId) {
    console.log('✏️ Modifier statut commande:', orderId);
    alert('Fonctionnalité à implémenter: Modifier statut commande ' + orderId);
};

window.deleteOrder = function(orderId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        console.log('🗑️ Supprimer commande:', orderId);
        alert('Fonctionnalité à implémenter: Supprimer commande ' + orderId);
    }
};

window.editProduct = function(productId) {
    console.log('✏️ Modifier produit:', productId);
    alert('Fonctionnalité à implémenter: Modifier produit ' + productId);
};

window.manageStock = function(productId) {
    console.log('📦 Gérer stock:', productId);
    alert('Fonctionnalité à implémenter: Gérer stock ' + productId);
};

window.deleteProduct = function(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        console.log('🗑️ Supprimer produit:', productId);
        alert('Fonctionnalité à implémenter: Supprimer produit ' + productId);
    }
};

console.log('✅ Admin panel complet initialisé');/
/ ===== GESTION DES ADMINISTRATEURS =====

// Charger la liste des administrateurs
async function loadAdmins() {
    console.log('👥 Chargement des administrateurs...');
    
    try {
        const db = firebase.firestore();
        const adminsSnapshot = await db.collection('admins').get();
        
        const adminsList = document.getElementById('adminsList');
        if (!adminsList) return;
        
        adminsList.innerHTML = '';
        
        if (adminsSnapshot.empty) {
            adminsList.innerHTML = '<p>Aucun administrateur trouvé.</p>';
            return;
        }
        
        adminsSnapshot.forEach(doc => {
            const admin = doc.data();
            const adminRow = createAdminRow(doc.id, admin);
            adminsList.appendChild(adminRow);
        });
        
        console.log('✅ Administrateurs chargés:', adminsSnapshot.size);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des administrateurs:', error);
        showError('Erreur lors du chargement des administrateurs');
    }
}

// Créer une ligne d'administrateur
function createAdminRow(adminId, admin) {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
        <div class="admin-info">
            <strong>${admin.email}</strong>
            <span class="admin-role">${admin.role || 'Admin'}</span>
            <span class="admin-status ${admin.active ? 'active' : 'inactive'}">
                ${admin.active ? 'Actif' : 'Inactif'}
            </span>
        </div>
        <div class="admin-actions">
            <button onclick="editAdmin('${adminId}')" class="btn-edit" title="Modifier">
                ✏️
            </button>
            <button onclick="deleteAdmin('${adminId}')" class="btn-delete" title="Supprimer">
                🗑️
            </button>
        </div>
    `;
    return row;
}

// Afficher le modal d'ajout d'administrateur
function showAddAdminModal() {
    const modal = document.getElementById('adminModal');
    const form = document.getElementById('adminForm');
    const title = document.getElementById('adminModalTitle');
    
    if (modal && form && title) {
        title.textContent = 'Ajouter un Administrateur';
        form.reset();
        form.dataset.mode = 'add';
        modal.style.display = 'block';
    }
}

// Modifier un administrateur
async function editAdmin(adminId) {
    console.log('✏️ Modification admin:', adminId);
    
    try {
        const db = firebase.firestore();
        const adminDoc = await db.collection('admins').doc(adminId).get();
        
        if (!adminDoc.exists) {
            showError('Administrateur non trouvé');
            return;
        }
        
        const admin = adminDoc.data();
        const modal = document.getElementById('adminModal');
        const form = document.getElementById('adminForm');
        const title = document.getElementById('adminModalTitle');
        
        if (modal && form && title) {
            title.textContent = 'Modifier l\'Administrateur';
            
            // Pré-remplir le formulaire
            document.getElementById('adminEmail').value = admin.email || '';
            document.getElementById('adminRole').value = admin.role || 'admin';
            document.getElementById('adminActive').checked = admin.active !== false;
            
            form.dataset.mode = 'edit';
            form.dataset.adminId = adminId;
            modal.style.display = 'block';
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'admin:', error);
        showError('Erreur lors du chargement de l\'administrateur');
    }
}

// Supprimer un administrateur
async function deleteAdmin(adminId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
        return;
    }
    
    console.log('🗑️ Suppression admin:', adminId);
    
    try {
        const db = firebase.firestore();
        await db.collection('admins').doc(adminId).delete();
        
        showSuccess('Administrateur supprimé avec succès');
        loadAdmins(); // Recharger la liste
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        showError('Erreur lors de la suppression de l\'administrateur');
    }
}

// Gérer la soumission du formulaire admin
async function handleAdminFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const mode = form.dataset.mode;
    const adminId = form.dataset.adminId;
    
    const adminData = {
        email: document.getElementById('adminEmail').value.trim(),
        role: document.getElementById('adminRole').value,
        active: document.getElementById('adminActive').checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (!adminData.email) {
        showError('L\'email est obligatoire');
        return;
    }
    
    try {
        const db = firebase.firestore();
        
        if (mode === 'add') {
            // Vérifier si l'email existe déjà
            const existingAdmin = await db.collection('admins')
                .where('email', '==', adminData.email)
                .get();
                
            if (!existingAdmin.empty) {
                showError('Cet email est déjà utilisé par un autre administrateur');
                return;
            }
            
            adminData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('admins').add(adminData);
            showSuccess('Administrateur ajouté avec succès');
            
        } else if (mode === 'edit') {
            await db.collection('admins').doc(adminId).update(adminData);
            showSuccess('Administrateur modifié avec succès');
        }
        
        // Fermer le modal et recharger la liste
        document.getElementById('adminModal').style.display = 'none';
        loadAdmins();
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showError('Erreur lors de la sauvegarde de l\'administrateur');
    }
}

// Fermer le modal admin
function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== MODIFICATION EMAIL ADMIN =====

// Charger l'email actuel de l'admin connecté
function loadCurrentAdminEmail() {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        const currentEmailInput = document.getElementById('currentEmail');
        if (currentEmailInput) {
            currentEmailInput.value = currentUser.email;
        }
    }
}

// Gérer la modification d'email admin
async function handleChangeEmailSubmit(e) {
    e.preventDefault();
    
    const currentEmail = document.getElementById('currentEmail').value.trim();
    const newEmail = document.getElementById('newEmail').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentEmail || !newEmail || !confirmPassword) {
        showError('Tous les champs sont obligatoires');
        return;
    }
    
    if (currentEmail === newEmail) {
        showError('Le nouvel email doit être différent de l\'email actuel');
        return;
    }
    
    try {
        showLoading();
        
        const user = firebase.auth().currentUser;
        if (!user) {
            showError('Utilisateur non connecté');
            return;
        }
        
        // Vérifier le mot de passe actuel
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            confirmPassword
        );
        
        // Ré-authentifier l'utilisateur
        await user.reauthenticateWithCredential(credential);
        
        // Mettre à jour l'email
        await user.updateEmail(newEmail);
        
        // Mettre à jour dans la collection admins si elle existe
        const db = firebase.firestore();
        const adminQuery = await db.collection('admins')
            .where('email', '==', currentEmail)
            .get();
            
        if (!adminQuery.empty) {
            const adminDoc = adminQuery.docs[0];
            await adminDoc.ref.update({
                email: newEmail,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        hideLoading();
        showSuccess('Email modifié avec succès ! Vous allez être déconnecté.');
        
        // Réinitialiser le formulaire
        document.getElementById('changeEmailForm').reset();
        
        // Déconnecter l'utilisateur après 2 secondes
        setTimeout(() => {
            firebase.auth().signOut();
        }, 2000);
        
    } catch (error) {
        hideLoading();
        console.error('❌ Erreur lors de la modification de l\'email:', error);
        
        let errorMessage = 'Erreur lors de la modification de l\'email';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect';
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Cet email est déjà utilisé';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Format d\'email invalide';
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Veuillez vous reconnecter et réessayer';
        }
        
        showError(errorMessage);
    }
}

// Exposer les fonctions au scope global
window.editAdmin = editAdmin;
window.deleteAdmin = deleteAdmin;
window.closeAdminModal = closeAdminModal;

console.log('✅ Fonctions de gestion des paramètres et admins ajoutées');