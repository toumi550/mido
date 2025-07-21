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
    
    // NE PAS afficher d'erreur au chargement initial
    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
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
        case 'account':
            loadAccountData();
            break;
        case 'analytics':
            loadAnalytics();
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

        // Charger les commandes récentes
        await loadRecentOrders();

        console.log('✅ Données du dashboard chargées');

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
        if (!recentOrdersList) return;

        recentOrdersList.innerHTML = '';

        if (recentOrdersSnapshot.empty) {
            recentOrdersList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune commande récente</p>';
            return;
        }

        recentOrdersSnapshot.forEach(doc => {
            const order = doc.data();
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
    const purchasePrice = product.purchasePrice || 0;
    const salePrice = product.price || product.salePrice || 0;
    const stock = product.stock || 0;
    const category = product.category || 'N/A';
    
    // Calculer la marge
    const margin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice * 100).toFixed(1) : 0;
    const marginClass = margin > 30 ? 'high-margin' : margin > 15 ? 'medium-margin' : 'low-margin';
    
    // Image du produit
    const imageUrl = product.image || '../image/default-product.jpg';

    tr.innerHTML = `
        <td>
            <img src="${imageUrl}" alt="${nameFr}" class="product-image" onerror="this.src='../image/default-product.jpg'">
        </td>
        <td><strong>${nameAr}</strong></td>
        <td><strong>${nameFr}</strong></td>
        <td class="purchase-price">${purchasePrice.toLocaleString()} DA</td>
        <td class="sale-price">${salePrice.toLocaleString()} DA</td>
        <td class="margin ${marginClass}">
            <span class="margin-value">${margin}%</span>
            <small class="margin-amount">+${(salePrice - purchasePrice).toLocaleString()} DA</small>
        </td>
        <td class="stock-info">
            <span class="stock-count ${stock < 10 ? 'low-stock' : stock < 5 ? 'critical-stock' : ''}">${stock}</span>
            <small>unités</small>
        </td>
        <td><span class="category-badge">${getCategoryText(category)}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="viewProduct('${product.id}')" title="Voir détails">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editProduct('${product.id}')" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateStock('${product.id}')" title="Gérer stock">
                    <i class="fas fa-boxes"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
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
    const itemsCount = order.items ? order.items.length : 0;
    const totalItems = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    
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
        showOrderDetails(order);
    }
};

// Fonction pour afficher les détails d'une commande
function showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    
    if (!modal || !orderDetails) return;
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';
    
    const itemsHtml = order.items ? order.items.map(item => `
        <div class="order-item-detail">
            <div class="item-info">
                <strong>${item.name?.fr || item.name || 'N/A'}</strong>
                <span class="item-price">${item.price || 0} DA x ${item.quantity || 1}</span>
            </div>
            <div class="item-total">${(item.price || 0) * (item.quantity || 1)} DA</div>
        </div>
    `).join('') : '<p>Aucun article</p>';
    
    orderDetails.innerHTML = `
        <div class="order-header">
            <h4>Commande #${order.orderNumber || order.id?.substring(0, 8)}</h4>
            <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span>
        </div>
        
        <div class="order-customer">
            <h5><i class="fas fa-user"></i> Informations client</h5>
            <p><strong>Nom:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Téléphone:</strong> ${order.customerPhone || 'N/A'}</p>
            <p><strong>Adresse:</strong> ${order.customerAddress || 'N/A'}</p>
            <p><strong>Wilaya:</strong> ${order.wilaya || 'N/A'}</p>
            <p><strong>Type de livraison:</strong> ${order.deliveryType || 'N/A'}</p>
            ${order.customerComment ? `<p><strong>Commentaire:</strong> ${order.customerComment}</p>` : ''}
        </div>
        
        <div class="order-items">
            <h5><i class="fas fa-shopping-cart"></i> Articles commandés</h5>
            ${itemsHtml}
        </div>
        
        <div class="order-summary">
            <div class="summary-row">
                <span>Sous-total:</span>
                <span>${order.subtotal || 0} DA</span>
            </div>
            <div class="summary-row">
                <span>Frais de livraison:</span>
                <span>${order.deliveryPrice || 0} DA</span>
            </div>
            <div class="summary-row total">
                <span><strong>Total:</strong></span>
                <span><strong>${order.total || 0} DA</strong></span>
            </div>
        </div>
        
        <div class="order-meta">
            <p><strong>Date de commande:</strong> ${date}</p>
            <p><strong>ID de commande:</strong> ${order.id || 'N/A'}</p>
        </div>
        
        <div class="order-actions">
            <select id="orderStatusSelect" class="form-control">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En cours</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminée</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
            </select>
            <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}')">
                <i class="fas fa-save"></i> Mettre à jour le statut
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Fermer le modal
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
    
    // Fermer en cliquant à l'extérieur
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Fonction pour mettre à jour le statut d'une commande
window.updateOrderStatus = async function(orderId) {
    const statusSelect = document.getElementById('orderStatusSelect');
    if (!statusSelect) return;
    
    const newStatus = statusSelect.value;
    
    try {
        await firebase.firestore().collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showSuccess('Statut de la commande mis à jour avec succès');
        
        // Fermer le modal
        const modal = document.getElementById('orderModal');
        if (modal) modal.style.display = 'none';
        
        // Recharger les commandes
        loadOrders();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        showError('Erreur lors de la mise à jour du statut: ' + error.message);
    }
};

// Fonction pour modifier le statut d'une commande
window.editOrderStatus = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showOrderDetails(order);
    }
};

// Fonction pour supprimer une commande
window.deleteOrder = async function(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        return;
    }
    
    try {
        await firebase.firestore().collection('orders').doc(orderId).delete();
        showSuccess('Commande supprimée avec succès');
        loadOrders();
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showError('Erreur lors de la suppression: ' + error.message);
    }
};

// Fonction pour charger les données du compte
function loadAccountData() {
    console.log('👤 Chargement des données du compte...');
    
    const currentEmailInput = document.getElementById('currentEmail');
    if (currentEmailInput && currentUser) {
        currentEmailInput.value = currentUser.email;
    }
    
    // Charger la liste des administrateurs
    loadAdminUsers();
}

// Fonction pour charger la liste des administrateurs
async function loadAdminUsers() {
    try {
        const adminsList = document.getElementById('adminUsersList');
        if (!adminsList) return;
        
        // Pour l'instant, afficher seulement l'utilisateur actuel
        // Dans une vraie application, vous auriez une collection 'admins'
        adminsList.innerHTML = `
            <div class="admin-user-item">
                <div class="admin-info">
                    <i class="fas fa-user-shield"></i>
                    <div>
                        <strong>${currentUser?.email || 'N/A'}</strong>
                        <small>Administrateur principal</small>
                    </div>
                </div>
                <span class="current-user">Vous</span>
            </div>
        `;
        
    } catch (error) {
        console.error('Erreur lors du chargement des admins:', error);
    }
}

// Fonction pour charger les analytics
async function loadAnalytics() {
    console.log('📊 Chargement des analytics...');
    
    try {
        // Charger les données des commandes pour les analytics
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        
        const analyticsOrders = [];
        ordersSnapshot.forEach(doc => {
            analyticsOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // Calculer les statistiques mensuelles
        calculateMonthlyStats(analyticsOrders);
        
        // Charger les produits les plus vendus
        loadTopProducts(analyticsOrders);
        
        // Charger les statistiques par wilaya
        loadWilayaStats(analyticsOrders);
        
        console.log('✅ Analytics chargées');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des analytics:', error);
        showError('Erreur lors du chargement des analytics: ' + error.message);
    }
}

// Fonction pour calculer les statistiques mensuelles
function calculateMonthlyStats(orders) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = order.createdAt.toDate();
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
        const total = typeof order.total === 'number' ? order.total : parseFloat(order.total?.toString().replace(/[^\d]/g, '') || '0');
        return sum + total;
    }, 0);
    
    // Mettre à jour l'affichage
    const monthlyOrdersElement = document.getElementById('monthlyOrders');
    const monthlyRevenueElement = document.getElementById('monthlyRevenue');
    const growthRateElement = document.getElementById('growthRate');
    
    if (monthlyOrdersElement) monthlyOrdersElement.textContent = monthlyOrders.length;
    if (monthlyRevenueElement) monthlyRevenueElement.textContent = monthlyRevenue.toLocaleString() + ' DA';
    if (growthRateElement) growthRateElement.textContent = '+' + Math.floor(Math.random() * 20) + '%'; // Simulation
}

// Fonction pour charger les produits les plus vendus
function loadTopProducts(orders) {
    const productSales = {};
    
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const productId = item.id || item.name;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: item.name?.fr || item.name || 'Produit inconnu',
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[productId].quantity += item.quantity || 1;
                productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
            });
        }
    });
    
    // Trier par quantité vendue
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    if (topProductsList) {
        if (topProducts.length === 0) {
            topProductsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune donnée de vente disponible</p>';
        } else {
            topProductsList.innerHTML = topProducts.map(([id, product], index) => `
                <div class="top-product-item">
                    <div class="product-rank">${index + 1}</div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-stats">
                            <span>${product.quantity} vendus</span>
                            <span>${product.revenue.toLocaleString()} DA</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Fonction pour charger les statistiques par wilaya
function loadWilayaStats(orders) {
    const wilayaStats = {};
    
    orders.forEach(order => {
        const wilaya = order.wilaya || 'Non spécifiée';
        if (!wilayaStats[wilaya]) {
            wilayaStats[wilaya] = {
                orders: 0,
                revenue: 0
            };
        }
        wilayaStats[wilaya].orders++;
        const total = typeof order.total === 'number' ? order.total : parseFloat(order.total?.toString().replace(/[^\d]/g, '') || '0');
        wilayaStats[wilaya].revenue += total;
    });
    
    // Trier par nombre de commandes
    const sortedWilayas = Object.entries(wilayaStats)
        .sort(([,a], [,b]) => b.orders - a.orders)
        .slice(0, 10);
    
    const wilayaStatsList = document.getElementById('wilayaStatsList');
    if (wilayaStatsList) {
        if (sortedWilayas.length === 0) {
            wilayaStatsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune donnée de wilaya disponible</p>';
        } else {
            wilayaStatsList.innerHTML = sortedWilayas.map(([wilaya, stats]) => `
                <div class="wilaya-stat-item">
                    <div class="wilaya-name">${wilaya}</div>
                    <div class="wilaya-stats">
                        <div class="orders-count">${stats.orders} commandes</div>
                        <div class="revenue">${stats.revenue.toLocaleString()} DA</div>
                    </div>
                </div>
            `).join('');
        }
    }
}

console.log('✅ Admin panel complet initialisé');