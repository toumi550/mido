// Admin Panel JavaScript with Firebase Integration

// Global variables
let currentUser = null;
let products = [];
let orders = [];
let currentEditingProduct = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        showError('Firebase n\'est pas chargé. Veuillez vérifier votre connexion internet.');
        return;
    }

    // Setup authentication state listener
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showDashboard();
            loadDashboardData();
        } else {
            showLoginScreen();
        }
    });

    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Navigation menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);

    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Settings forms
    document.getElementById('siteSettingsForm').addEventListener('submit', handleSiteSettings);
    document.getElementById('socialSettingsForm').addEventListener('submit', handleSocialSettings);

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Image preview
    document.getElementById('productImage').addEventListener('input', previewImage);

    // Order status filter
    document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);

    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading('Connexion en cours...');
        await firebase.auth().signInWithEmailAndPassword(email, password);
        hideLoading();
    } catch (error) {
        hideLoading();
        showLoginError(getErrorMessage(error.code));
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        showLoginScreen();
    } catch (error) {
        showError('Erreur lors de la déconnexion: ' + error.message);
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    loginError.textContent = '';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    document.getElementById('adminEmail').textContent = currentUser.email;
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

// Navigation Functions
function handleNavigation(e) {
    e.preventDefault();
    
    const sectionName = e.target.getAttribute('data-section');
    if (!sectionName) return;

    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');

    // Show corresponding section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + 'Section').classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        products: 'Gestion des Produits',
        orders: 'Gestion des Commandes',
        settings: 'Paramètres'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName];

    // Load section data
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

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load products count
        const productsSnapshot = await firebase.firestore().collection('products').get();
        document.getElementById('totalProducts').textContent = productsSnapshot.size;

        // Load orders count
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        document.getElementById('totalOrders').textContent = ordersSnapshot.size;

        // Load pending orders count
        const pendingOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('status', '==', 'pending')
            .get();
        document.getElementById('pendingOrders').textContent = pendingOrdersSnapshot.size;

        // Calculate total revenue
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            if (order.status === 'completed' && order.total) {
                totalRevenue += parseFloat(order.total.replace(/[^\d]/g, ''));
            }
        });
        document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' DA';

        // Load recent orders
        loadRecentOrders();

    } catch (error) {
        showError('Erreur lors du chargement des données: ' + error.message);
    }
}

async function loadRecentOrders() {
    try {
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        const recentOrdersList = document.getElementById('recentOrdersList');
        recentOrdersList.innerHTML = '';

        if (ordersSnapshot.empty) {
            recentOrdersList.innerHTML = '<p>Aucune commande récente</p>';
            return;
        }

        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const orderElement = createRecentOrderElement(doc.id, order);
            recentOrdersList.appendChild(orderElement);
        });

    } catch (error) {
        showError('Erreur lors du chargement des commandes récentes: ' + error.message);
    }
}

function createRecentOrderElement(orderId, order) {
    const div = document.createElement('div');
    div.className = 'order-item';
    
    const date = order.timestamp ? order.timestamp.toDate().toLocaleDateString('fr-FR') : 'Date inconnue';
    
    div.innerHTML = `
        <div class="order-info">
            <h4>Commande #${orderId.substring(0, 8)}</h4>
            <p><strong>Client:</strong> ${order.name || 'N/A'}</p>
            <p><strong>Téléphone:</strong> ${order.phone || 'N/A'}</p>
            <p><strong>Total:</strong> ${order.total || '0 DA'}</p>
            <p><strong>Date:</strong> ${date}</p>
        </div>
        <div class="order-status">
            <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span>
        </div>
    `;
    
    return div;
}

// Products Functions
async function loadProducts() {
    try {
        showTableLoading('productsTableBody');
        
        const productsSnapshot = await firebase.firestore()
            .collection('products')
            .orderBy('createdAt', 'desc')
            .get();

        products = [];
        productsSnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        displayProducts();

    } catch (error) {
        showError('Erreur lors du chargement des produits: ' + error.message);
        document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="6">Erreur de chargement</td></tr>';
    }
}

function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
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
    const image = product.image || '';

    tr.innerHTML = `
        <td>
            ${image ? `<img src="${image}" alt="${nameAr}" class="product-image">` : '<div class="product-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image"></i></div>'}
        </td>
        <td>${nameAr}</td>
        <td>${nameFr}</td>
        <td>${price} DA</td>
        <td>${getCategoryText(category)}</td>
        <td>
            <button class="btn btn-sm btn-warning" onclick="editProduct('${product.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

function showAddProductModal() {
    currentEditingProduct = null;
    document.getElementById('productModalTitle').textContent = 'Ajouter un produit';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('productModal').style.display = 'block';
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentEditingProduct = product;
    document.getElementById('productModalTitle').textContent = 'Modifier le produit';
    
    // Fill form with product data
    document.getElementById('productNameAr').value = product.name?.ar || product.name || '';
    document.getElementById('productNameFr').value = product.name?.fr || product.name || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productDescriptionAr').value = product.description?.ar || product.description || '';
    document.getElementById('productDescriptionFr').value = product.description?.fr || product.description || '';
    document.getElementById('productImage').value = product.image || '';
    
    // Show image preview
    if (product.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${product.image}" alt="Preview">`;
    }
    
    document.getElementById('productModal').style.display = 'block';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: {
            ar: document.getElementById('productNameAr').value,
            fr: document.getElementById('productNameFr').value
        },
        price: parseInt(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        description: {
            ar: document.getElementById('productDescriptionAr').value,
            fr: document.getElementById('productDescriptionFr').value
        },
        image: document.getElementById('productImage').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentEditingProduct) {
            // Update existing product
            await firebase.firestore()
                .collection('products')
                .doc(currentEditingProduct.id)
                .update(productData);
            showSuccess('Produit modifié avec succès!');
        } else {
            // Add new product
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebase.firestore()
                .collection('products')
                .add(productData);
            showSuccess('Produit ajouté avec succès!');
        }
        
        closeProductModal();
        loadProducts();
        
    } catch (error) {
        showError('Erreur lors de la sauvegarde: ' + error.message);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
        await firebase.firestore()
            .collection('products')
            .doc(productId)
            .delete();
        showSuccess('Produit supprimé avec succès!');
        loadProducts();
    } catch (error) {
        showError('Erreur lors de la suppression: ' + error.message);
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentEditingProduct = null;
}

// Orders Functions
async function loadOrders() {
    try {
        showTableLoading('ordersTableBody');
        
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('timestamp', 'desc')
            .get();

        orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        displayOrders();

    } catch (error) {
        showError('Erreur lors du chargement des commandes: ' + error.message);
        document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="8">Erreur de chargement</td></tr>';
    }
}

function displayOrders(filteredOrders = null) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    const ordersToShow = filteredOrders || orders;

    if (ordersToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Aucune commande trouvée</td></tr>';
        return;
    }

    ordersToShow.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

function createOrderRow(order) {
    const tr = document.createElement('tr');
    
    const date = order.timestamp ? order.timestamp.toDate().toLocaleDateString('fr-FR') : 'N/A';
    
    tr.innerHTML = `
        <td>#${order.id.substring(0, 8)}</td>
        <td>${order.name || 'N/A'}</td>
        <td>${order.phone || 'N/A'}</td>
        <td>${order.wilaya || 'N/A'}</td>
        <td>${order.total || '0 DA'}</td>
        <td><span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span></td>
        <td>${date}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="viewOrder('${order.id}')">
                <i class="fas fa-eye"></i>
            </button>
            <select onchange="updateOrderStatus('${order.id}', this.value)" class="btn btn-sm">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En cours</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminée</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
            </select>
        </td>
    `;
    
    return tr;
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await firebase.firestore()
            .collection('orders')
            .doc(orderId)
            .update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        showSuccess('Statut de la commande mis à jour!');
        loadOrders();
    } catch (error) {
        showError('Erreur lors de la mise à jour: ' + error.message);
    }
}

function filterOrders() {
    const filterValue = document.getElementById('orderStatusFilter').value;
    
    if (filterValue === 'all') {
        displayOrders();
    } else {
        const filteredOrders = orders.filter(order => order.status === filterValue);
        displayOrders(filteredOrders);
    }
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const orderDetails = document.getElementById('orderDetails');
    const date = order.timestamp ? order.timestamp.toDate().toLocaleString('fr-FR') : 'N/A';
    
    let cartItemsHtml = '';
    if (order.cart && Array.isArray(order.cart)) {
        cartItemsHtml = order.cart.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                <span>${item.name?.ar || item.name || 'Produit'}</span>
                <span>x${item.quantity || 1}</span>
                <span>${item.price || 0} DA</span>
            </div>
        `).join('');
    }

    orderDetails.innerHTML = `
        <div class="order-details">
            <h4>Commande #${order.id.substring(0, 8)}</h4>
            <div style="margin: 20px 0;">
                <p><strong>Client:</strong> ${order.name || 'N/A'}</p>
                <p><strong>Téléphone:</strong> ${order.phone || 'N/A'}</p>
                <p><strong>Adresse:</strong> ${order.address || 'N/A'}</p>
                <p><strong>Wilaya:</strong> ${order.wilaya || 'N/A'}</p>
                <p><strong>Type de livraison:</strong> ${order.deliveryType === 'home' ? 'Domicile' : 'StopDesk'}</p>
                <p><strong>Statut:</strong> <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span></p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Total:</strong> ${order.total || '0 DA'}</p>
            </div>
            <div>
                <h5>Produits commandés:</h5>
                <div style="border: 1px solid #eee; border-radius: 5px; margin-top: 10px;">
                    ${cartItemsHtml || '<p style="padding: 20px; text-align: center;">Aucun produit</p>'}
                </div>
            </div>
            ${order.comment ? `<div style="margin-top: 20px;"><strong>Commentaire:</strong><p style="background: #f8f9fa; padding: 10px; border-radius: 5px;">${order.comment}</p></div>` : ''}
        </div>
    `;
    
    document.getElementById('orderModal').style.display = 'block';
}

// Settings Functions
async function loadSettings() {
    try {
        const settingsDoc = await firebase.firestore()
            .collection('settings')
            .doc('site')
            .get();

        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            
            // Load site settings
            document.getElementById('siteName').value = settings.siteName || 'RANIA SHOP';
            document.getElementById('contactEmail').value = settings.contactEmail || 'contact@raniashop.dz';
            document.getElementById('contactPhone').value = settings.contactPhone || '+213 XXX XXX XXX';
            
            // Load social settings
            document.getElementById('facebookUrl').value = settings.facebookUrl || 'https://www.facebook.com/raniashop';
            document.getElementById('instagramUrl').value = settings.instagramUrl || 'https://www.instagram.com/raniashop';
            document.getElementById('whatsappNumber').value = settings.whatsappNumber || '+213XXXXXXXXX';
            document.getElementById('tiktokUrl').value = settings.tiktokUrl || 'https://www.tiktok.com/@raniashop';
        }
    } catch (error) {
        showError('Erreur lors du chargement des paramètres: ' + error.message);
    }
}

async function handleSiteSettings(e) {
    e.preventDefault();
    
    const settings = {
        siteName: document.getElementById('siteName').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await firebase.firestore()
            .collection('settings')
            .doc('site')
            .set(settings, { merge: true });
        showSuccess('Paramètres du site sauvegardés!');
    } catch (error) {
        showError('Erreur lors de la sauvegarde: ' + error.message);
    }
}

async function handleSocialSettings(e) {
    e.preventDefault();
    
    const settings = {
        facebookUrl: document.getElementById('facebookUrl').value,
        instagramUrl: document.getElementById('instagramUrl').value,
        whatsappNumber: document.getElementById('whatsappNumber').value,
        tiktokUrl: document.getElementById('tiktokUrl').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await firebase.firestore()
            .collection('settings')
            .doc('site')
            .set(settings, { merge: true });
        showSuccess('Paramètres des réseaux sociaux sauvegardés!');
    } catch (error) {
        showError('Erreur lors de la sauvegarde: ' + error.message);
    }
}

// Utility Functions
function previewImage() {
    const imageUrl = document.getElementById('productImage').value;
    const preview = document.getElementById('imagePreview');
    
    if (imageUrl) {
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" onerror="this.style.display='none'">`;
    } else {
        preview.innerHTML = '';
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function toggleMobileMenu() {
    document.querySelector('.admin-sidebar').classList.toggle('active');
}

function showTableLoading(tableBodyId) {
    document.getElementById(tableBodyId).innerHTML = `
        <tr>
            <td colspan="8" class="loading">
                <i class="fas fa-spinner"></i> Chargement...
            </td>
        </tr>
    `;
}

function showLoading(message = 'Chargement...') {
    // You can implement a loading overlay here
    console.log(message);
}

function hideLoading() {
    // Hide loading overlay
    console.log('Loading hidden');
}

function showSuccess(message) {
    // Create and show success alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    document.body.appendChild(alert);
    
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 3000);
}

function showError(message) {
    // Create and show error alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    document.body.appendChild(alert);
    
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 5000);
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'Utilisateur non trouvé',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/invalid-email': 'Email invalide',
        'auth/user-disabled': 'Compte désactivé',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/network-request-failed': 'Erreur de connexion réseau'
    };
    
    return errorMessages[errorCode] || 'Erreur de connexion';
}

function getStatusText(status) {
    const statusTexts = {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Terminée',
        cancelled: 'Annulée'
    };
    
    return statusTexts[status] || 'En attente';
}

function getCategoryText(category) {
    const categoryTexts = {
        hair: 'Cheveux',
        makeup: 'Maquillage',
        skincare: 'Soins',
        lenses: 'Lentilles',
        clothing: 'Vêtements'
    };
    
    return categoryTexts[category] || category;
}

// Listen for real-time updates
function setupRealtimeListeners() {
    // Listen for product changes
    firebase.firestore().collection('products').onSnapshot((snapshot) => {
        if (document.getElementById('productsSection').classList.contains('active')) {
            loadProducts();
        }
    });

    // Listen for order changes
    firebase.firestore().collection('orders').onSnapshot((snapshot) => {
        if (document.getElementById('ordersSection').classList.contains('active')) {
            loadOrders();
        }
        if (document.getElementById('dashboardSection').classList.contains('active')) {
            loadDashboardData();
        }
    });
}

// Initialize real-time listeners when authenticated
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        setupRealtimeListeners();
    }
});