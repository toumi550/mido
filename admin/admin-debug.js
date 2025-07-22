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

// ===== FONCTIONS POUR LA GESTION DES PRODUITS =====

// Fonction pour afficher le modal d'ajout de produit
window.showAddProductModal = function() {
    console.log('➕ Ouverture du modal d\'ajout de produit');
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
    if (modal && title) {
        title.textContent = 'Ajouter un produit';
        modal.style.display = 'block';
        
        // Réinitialiser le formulaire
        const form = document.getElementById('productForm');
        if (form) form.reset();
        
        // Masquer le calcul de rentabilité
        const profitCalculation = document.getElementById('profitCalculation');
        if (profitCalculation) {
            profitCalculation.style.display = 'none';
        }
        
        // Configurer les event listeners pour le calcul automatique
        setupProfitCalculation();
        
        // Configurer l'upload d'image
        setupImageUpload();
        
        // Configurer le formulaire de produit
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.onsubmit = saveProduct;
            productForm.removeAttribute('data-product-id'); // Reset pour nouvel ajout
        }
        
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
};

// Fonction pour fermer le modal de produit
window.closeProductModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
};

// Fonction pour configurer le calcul automatique de rentabilité
function setupProfitCalculation() {
    console.log('🧮 Configuration du calcul de rentabilité...');
    
    const purchasePriceInput = document.getElementById('productPurchasePrice');
    const salePriceInput = document.getElementById('productPrice');
    
    if (purchasePriceInput && salePriceInput) {
        // Event listeners pour calculer en temps réel
        purchasePriceInput.addEventListener('input', calculateProfit);
        salePriceInput.addEventListener('input', calculateProfit);
        
        console.log('✅ Event listeners pour calcul de rentabilité configurés');
    }
}

// Fonction pour calculer la rentabilité
function calculateProfit() {
    console.log('🧮 Calcul de la rentabilité...');
    
    const purchasePrice = parseFloat(document.getElementById('productPurchasePrice').value) || 0;
    const salePrice = parseFloat(document.getElementById('productPrice').value) || 0;
    
    console.log('💰 Prix d\'achat:', purchasePrice, 'DA');
    console.log('💰 Prix de vente:', salePrice, 'DA');
    
    const profitCalculation = document.getElementById('profitCalculation');
    const profitMargin = document.getElementById('profitMargin');
    const profitPercentage = document.getElementById('profitPercentage');
    const profitStatus = document.getElementById('profitStatus');
    
    if (!profitCalculation || !profitMargin || !profitPercentage || !profitStatus) {
        console.error('❌ Éléments de calcul de rentabilité non trouvés');
        return;
    }
    
    // Si les deux prix sont saisis
    if (purchasePrice > 0 && salePrice > 0) {
        // Afficher la section de calcul
        profitCalculation.style.display = 'block';
        profitCalculation.classList.add('show');
        
        // Calculer la marge bénéficiaire
        const margin = salePrice - purchasePrice;
        const marginPercentage = (margin / purchasePrice * 100).toFixed(1);
        
        console.log('📊 Marge:', margin, 'DA');
        console.log('📊 Pourcentage:', marginPercentage, '%');
        
        // Mettre à jour l'affichage
        profitMargin.textContent = margin.toLocaleString() + ' DA';
        profitPercentage.textContent = marginPercentage + '%';
        
        // Déterminer le statut de rentabilité
        let status = '';
        let statusClass = '';
        
        if (margin < 0) {
            status = 'PERTE';
            statusClass = 'loss';
            profitPercentage.className = 'profit-percentage low';
        } else if (marginPercentage < 15) {
            status = 'FAIBLE';
            statusClass = 'low';
            profitPercentage.className = 'profit-percentage low';
        } else if (marginPercentage < 30) {
            status = 'CORRECTE';
            statusClass = 'good';
            profitPercentage.className = 'profit-percentage medium';
        } else {
            status = 'EXCELLENTE';
            statusClass = 'excellent';
            profitPercentage.className = 'profit-percentage high';
        }
        
        profitStatus.textContent = status;
        profitStatus.className = 'profit-status ' + statusClass;
        
        console.log('✅ Rentabilité calculée:', status);
        
    } else {
        // Masquer la section de calcul si les prix ne sont pas complets
        profitCalculation.style.display = 'none';
        console.log('ℹ️ Calcul masqué - prix incomplets');
    }
}

// Fonction pour gérer l'upload d'image
function setupImageUpload() {
    console.log('🖼️ Configuration de l\'upload d\'image...');
    
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!imageUploadArea || !imageInput || !imagePreview) {
        console.error('❌ Éléments d\'upload d\'image non trouvés');
        return;
    }
    
    // Clic sur la zone d'upload
    imageUploadArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    // Drag & Drop
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('drag-over');
    });
    
    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('drag-over');
    });
    
    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    // Sélection de fichier
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
    
    console.log('✅ Upload d\'image configuré');
}

// Fonction pour traiter le fichier image
function handleImageFile(file) {
    console.log('🖼️ Traitement du fichier image:', file.name);
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
    }
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximum : 5MB');
        return;
    }
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
        const imagePreview = document.getElementById('imagePreview');
        const imageInput = document.getElementById('productImage');
        
        if (imagePreview && imageInput) {
            imagePreview.innerHTML = `
                <img src="${e.target.result}" alt="Aperçu du produit" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <p>Image sélectionnée: ${file.name}</p>
            `;
            
            // Stocker l'image en base64 pour la sauvegarde
            imageInput.value = e.target.result;
            console.log('✅ Image préparée pour la sauvegarde');
        }
    };
    
    reader.readAsDataURL(file);
}

// Fonction pour sauvegarder un produit
window.saveProduct = async function(e) {
    e.preventDefault();
    console.log('💾 Sauvegarde du produit...');
    
    const nameAr = document.getElementById('productNameAr').value;
    const nameFr = document.getElementById('productNameFr').value;
    const purchasePrice = parseFloat(document.getElementById('productPurchasePrice').value) || 0;
    const salePrice = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const category = document.getElementById('productCategory').value;
    const descriptionAr = document.getElementById('productDescriptionAr').value;
    const descriptionFr = document.getElementById('productDescriptionFr').value;
    const image = document.getElementById('productImage').value;
    
    if (!nameAr || !nameFr || !purchasePrice || !salePrice || !category) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Vérifier si c'est une modification ou un ajout
    const form = document.getElementById('productForm');
    const productId = form ? form.getAttribute('data-product-id') : null;
    const isEdit = !!productId;
    
    const productData = {
        name: {
            ar: nameAr,
            fr: nameFr
        },
        purchasePrice: purchasePrice,
        price: salePrice, // Prix de vente pour compatibilité avec le site principal
        salePrice: salePrice,
        stock: stock,
        category: category,
        description: {
            ar: descriptionAr,
            fr: descriptionFr
        },
        image: image || '', // Image en base64 ou URL
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Ajouter createdAt seulement pour les nouveaux produits
    if (!isEdit) {
        productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    console.log('📦 Données du produit:', productData);
    console.log('🔄 Mode:', isEdit ? 'Modification' : 'Ajout');
    
    try {
        let docRef;
        
        if (isEdit) {
            // Mise à jour du produit existant
            await firebase.firestore().collection('products').doc(productId).update(productData);
            console.log('✅ Produit mis à jour avec ID:', productId);
            alert('Produit modifié avec succès !');
        } else {
            // Ajout d'un nouveau produit
            docRef = await firebase.firestore().collection('products').add(productData);
            console.log('✅ Produit sauvegardé avec ID:', docRef.id);
            alert('Produit ajouté avec succès !');
        }
        
        closeProductModal();
        
        // Recharger les produits
        loadProducts();
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
};

// Fonction pour charger tous les produits
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

        console.log('📊 Nombre total de produits:', products.length);
        displayProducts();

    } catch (error) {
        console.error('❌ Erreur lors du chargement des produits:', error);
        showError('Erreur lors du chargement des produits: ' + error.message);
    }
}

// Fonction pour afficher les produits
function displayProducts() {
    console.log('📋 Affichage des produits...');
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) {
        console.error('❌ Élément productsTableBody non trouvé');
        return;
    }

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Aucun produit trouvé</td></tr>';
        console.log('ℹ️ Aucun produit à afficher');
        return;
    }

    console.log('📝 Affichage de', products.length, 'produits');
    products.forEach((product, index) => {
        console.log(`📦 Produit ${index + 1}:`, product);
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

// Fonction pour créer une ligne de produit
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

// Fonction pour obtenir le texte de la catégorie
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

// Fonction pour voir un produit
window.viewProduct = function(productId) {
    console.log('👁️ Voir produit:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        console.log('📦 Détails du produit:', product);
        alert(`Produit: ${product.name?.fr || product.name || 'N/A'}\nPrix d'achat: ${product.purchasePrice || 0} DA\nPrix de vente: ${product.price || 0} DA\nStock: ${product.stock || 0} unités`);
    }
};

// Fonction pour modifier un produit
window.editProduct = function(productId) {
    console.log('✏️ Modifier produit:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        showAddProductModal();
        
        // Remplir le formulaire avec les données du produit
        const title = document.getElementById('productModalTitle');
        if (title) title.textContent = 'Modifier le produit';
        
        // Remplir tous les champs
        const nameAr = document.getElementById('productNameAr');
        const nameFr = document.getElementById('productNameFr');
        const purchasePrice = document.getElementById('productPurchasePrice');
        const salePrice = document.getElementById('productPrice');
        const stock = document.getElementById('productStock');
        const category = document.getElementById('productCategory');
        const descriptionAr = document.getElementById('productDescriptionAr');
        const descriptionFr = document.getElementById('productDescriptionFr');
        
        if (nameAr) nameAr.value = product.name?.ar || product.name || '';
        if (nameFr) nameFr.value = product.name?.fr || product.name || '';
        if (purchasePrice) purchasePrice.value = product.purchasePrice || 0;
        if (salePrice) salePrice.value = product.price || product.salePrice || 0;
        if (stock) stock.value = product.stock || 0;
        if (category) category.value = product.category || '';
        if (descriptionAr) descriptionAr.value = product.description?.ar || '';
        if (descriptionFr) descriptionFr.value = product.description?.fr || '';
        
        // Afficher l'image si elle existe
        if (product.image) {
            const imagePreview = document.getElementById('imagePreview');
            const imageInput = document.getElementById('productImage');
            if (imagePreview && imageInput) {
                imagePreview.innerHTML = `
                    <img src="${product.image}" alt="Image actuelle" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                    <p>Image actuelle</p>
                `;
                imageInput.value = product.image;
            }
        }
        
        // Stocker l'ID du produit pour la mise à jour
        const form = document.getElementById('productForm');
        if (form) {
            form.setAttribute('data-product-id', productId);
        }
        
        // Calculer la rentabilité
        calculateProfit();
        
        console.log('✅ Formulaire rempli pour modification');
    }
};

// Fonction pour mettre à jour le stock
window.updateStock = async function(productId) {
    console.log('📦 Gérer stock:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        const currentStock = product.stock || 0;
        const newStock = prompt(`Stock actuel: ${currentStock} unités\nNouveau stock pour "${product.name?.fr || product.name || 'ce produit'}":`, currentStock);
        
        if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
            try {
                await firebase.firestore().collection('products').doc(productId).update({
                    stock: parseInt(newStock),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log('✅ Stock mis à jour:', newStock);
                alert(`Stock mis à jour: ${newStock} unités`);
                
                // Recharger les produits pour afficher la mise à jour
                loadProducts();
                
            } catch (error) {
                console.error('❌ Erreur lors de la mise à jour du stock:', error);
                alert('Erreur lors de la mise à jour du stock: ' + error.message);
            }
        }
    }
};

// Fonction pour supprimer un produit
window.deleteProduct = async function(productId) {
    console.log('🗑️ Supprimer produit:', productId);
    const product = products.find(p => p.id === productId);
    
    if (product && confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name?.fr || product.name || 'ce produit'}" ?`)) {
        try {
            await firebase.firestore().collection('products').doc(productId).delete();
            console.log('✅ Produit supprimé');
            alert('Produit supprimé avec succès');
            
            // Recharger les produits
            loadProducts();
            
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression: ' + error.message);
        }
    }
};e,
        price: salePrice, // Prix de vente pour compatibilité avec le site principal
        salePrice: salePrice,
        stock: stock,
        category: category,
        description: {
            ar: descriptionAr,
            fr: descriptionFr
        },
        image: image || '', // Image en base64 ou URL
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('📦 Données du produit:', productData);
    
    try {
        const docRef = await firebase.firestore().collection('products').add(productData);
        console.log('✅ Produit sauvegardé avec ID:', docRef.id);
        
        alert('Produit ajouté avec succès !');
        closeProductModal();
        
        // Recharger les produits
        loadProducts();
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
};

// Fonction pour charger tous les produits
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

        console.log('📊 Nombre total de produits:', products.length);
        displayProducts();

    } catch (error) {
        console.error('❌ Erreur lors du chargement des produits:', error);
        showError('Erreur lors du chargement des produits: ' + error.message);
    }
}

// Fonction pour afficher les produits
function displayProducts() {
    console.log('📋 Affichage des produits...');
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) {
        console.error('❌ Élément productsTableBody non trouvé');
        return;
    }

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Aucun produit trouvé</td></tr>';
        console.log('ℹ️ Aucun produit à afficher');
        return;
    }

    console.log('📝 Affichage de', products.length, 'produits');
    products.forEach((product, index) => {
        console.log(`📦 Produit ${index + 1}:`, product);
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

// Fonction pour créer une ligne de produit
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

// Fonction pour obtenir le texte de la catégorie
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

// Fonction pour voir un produit
window.viewProduct = function(productId) {
    console.log('👁️ Voir produit:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        console.log('📦 Détails du produit:', product);
        alert(`Produit: ${product.name?.fr || product.name || 'N/A'}\nPrix d'achat: ${product.purchasePrice || 0} DA\nPrix de vente: ${product.price || 0} DA\nStock: ${product.stock || 0} unités`);
    }
};

// Fonction pour modifier un produit
window.editProduct = function(productId) {
    console.log('✏️ Modifier produit:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        showAddProductModal();
        
        // Remplir le formulaire avec les données du produit
        const title = document.getElementById('productModalTitle');
        if (title) title.textContent = 'Modifier le produit';
        
        // Remplir tous les champs
        const nameAr = document.getElementById('productNameAr');
        const nameFr = document.getElementById('productNameFr');
        const purchasePrice = document.getElementById('productPurchasePrice');
        const salePrice = document.getElementById('productPrice');
        const stock = document.getElementById('productStock');
        const category = document.getElementById('productCategory');
        const descriptionAr = document.getElementById('productDescriptionAr');
        const descriptionFr = document.getElementById('productDescriptionFr');
        
        if (nameAr) nameAr.value = product.name?.ar || product.name || '';
        if (nameFr) nameFr.value = product.name?.fr || product.name || '';
        if (purchasePrice) purchasePrice.value = product.purchasePrice || 0;
        if (salePrice) salePrice.value = product.price || product.salePrice || 0;
        if (stock) stock.value = product.stock || 0;
        if (category) category.value = product.category || '';
        if (descriptionAr) descriptionAr.value = product.description?.ar || '';
        if (descriptionFr) descriptionFr.value = product.description?.fr || '';
        
        // Afficher l'image si elle existe
        if (product.image) {
            const imagePreview = document.getElementById('imagePreview');
            const imageInput = document.getElementById('productImage');
            if (imagePreview && imageInput) {
                imagePreview.innerHTML = `
                    <img src="${product.image}" alt="Image actuelle" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                    <p>Image actuelle</p>
                `;
                imageInput.value = product.image;
            }
        }
        
        // Stocker l'ID du produit pour la mise à jour
        const form = document.getElementById('productForm');
        if (form) {
            form.setAttribute('data-product-id', productId);
        }
        
        // Calculer la rentabilité
        calculateProfit();
        
        console.log('✅ Formulaire rempli pour modification');
    }
};

// Fonction pour mettre à jour le stock
window.updateStock = async function(productId) {
    console.log('📦 Gérer stock:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        const currentStock = product.stock || 0;
        const newStock = prompt(`Stock actuel: ${currentStock} unités\nNouveau stock pour "${product.name?.fr || product.name || 'ce produit'}":`, currentStock);
        
        if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
            try {
                await firebase.firestore().collection('products').doc(productId).update({
                    stock: parseInt(newStock),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log('✅ Stock mis à jour:', newStock);
                alert(`Stock mis à jour: ${newStock} unités`);
                
                // Recharger les produits pour afficher la mise à jour
                loadProducts();
                
            } catch (error) {
                console.error('❌ Erreur lors de la mise à jour du stock:', error);
                alert('Erreur lors de la mise à jour du stock: ' + error.message);
            }
        }
    }
};

// Fonction pour supprimer un produit
window.deleteProduct = async function(productId) {
    console.log('🗑️ Supprimer produit:', productId);
    const product = products.find(p => p.id === productId);
    
    if (product && confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name?.fr || product.name || 'ce produit'}" ?`)) {
        try {
            await firebase.firestore().collection('products').doc(productId).delete();
            console.log('✅ Produit supprimé');
            alert('Produit supprimé avec succès');
            
            // Recharger les produits
            loadProducts();
            
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression: ' + error.message);
        }
    }
};

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