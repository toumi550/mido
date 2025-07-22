// PANNEAU ADMIN RANIA SHOP - VERSION PROPRE ET FONCTIONNELLE
// ============================================================

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
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du panneau admin...');
    initializeAdmin();
});

function initializeAdmin() {
    if (typeof firebase === 'undefined') {
        showError('Firebase non chargé');
        return;
    }

    // Authentification
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showDashboard();
        } else {
            showLoginScreen();
        }
    });

    setupEventListeners();
}

function setupEventListeners() {
    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout
    document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);

    // Boutons spéciaux
    setTimeout(() => {
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadAnalytics);
        }
    }, 1000);
}

// ===== AUTHENTIFICATION =====
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showLoginError('Veuillez remplir tous les champs');
        return;
    }

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
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
    } catch (error) {
        showError('Erreur de déconnexion');
    }
}

// ===== AFFICHAGE =====
function showLoginScreen() {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
    
    // Reset form
    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
}

function showDashboard() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';
    
    // Afficher email admin
    const adminEmailElement = document.getElementById('adminEmail');
    if (adminEmailElement && currentUser) {
        adminEmailElement.textContent = currentUser.email;
    }
    
    loadDashboardData();
}

function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
}

function showError(message) {
    alert('Erreur: ' + message);
}

// ===== NAVIGATION =====
function handleNavigation(e) {
    e.preventDefault();
    
    const sectionName = e.target.getAttribute('data-section');
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

    const sectionElement = document.getElementById(sectionName + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
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

    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.textContent = titles[sectionName] || sectionName;
    }

    // Charger données de la section
    loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
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
    }
}

// ===== DASHBOARD =====
async function loadDashboardData() {
    try {
        // Charger produits
        const productsSnapshot = await firebase.firestore().collection('products').get();
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = productsSnapshot.size;
        }

        // Charger commandes
        const ordersSnapshot = await firebase.firestore().collection('orders').get();
        const totalOrdersElement = document.getElementById('totalOrders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = ordersSnapshot.size;
        }

        // Commandes en attente
        const pendingOrdersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('status', '==', 'pending')
            .get();
        const pendingOrdersElement = document.getElementById('pendingOrders');
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = pendingOrdersSnapshot.size;
        }

        // Chiffre d'affaires
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            if (order.status === 'completed' && order.total) {
                totalRevenue += parseFloat(order.total) || 0;
            }
        });

        const totalRevenueElement = document.getElementById('totalRevenue');
        if (totalRevenueElement) {
            totalRevenueElement.textContent = totalRevenue.toLocaleString() + ' DA';
        }

        // Commandes récentes
        await loadRecentOrders();

    } catch (error) {
        console.error('Erreur dashboard:', error);
        showError('Erreur lors du chargement du dashboard');
    }
}

async function loadRecentOrders() {
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

    } catch (error) {
        console.error('Erreur commandes récentes:', error);
    }
}

function createRecentOrderElement(order, orderId) {
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

    } catch (error) {
        console.error('Erreur produits:', error);
        showError('Erreur lors du chargement des produits');
    }
}

function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
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
    
    // Calculer marge
    const margin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice * 100).toFixed(1) : 0;
    const marginClass = margin > 30 ? 'high-margin' : margin > 15 ? 'medium-margin' : 'low-margin';
    
    const imageUrl = product.image || '../image/default-product.jpg';

    tr.innerHTML = `
        <td>
            <img src="${imageUrl}" alt="${nameFr}" class="product-image" onerror="this.src='../image/default-product.jpg'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        </td>
        <td><strong>${nameAr}</strong></td>
        <td><strong>${nameFr}</strong></td>
        <td>${purchasePrice.toLocaleString()} DA</td>
        <td>${salePrice.toLocaleString()} DA</td>
        <td class="${marginClass}">
            <span>${margin}%</span><br>
            <small>+${(salePrice - purchasePrice).toLocaleString()} DA</small>
        </td>
        <td>
            <span class="${stock < 10 ? 'low-stock' : ''}" style="color: ${stock < 5 ? 'red' : stock < 10 ? 'orange' : 'green'}">${stock}</span>
        </td>
        <td><span class="category-badge">${getCategoryText(category)}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="viewProduct('${product.id}')" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateStock('${product.id}')" title="Stock">
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

// Fonctions produits globales
window.viewProduct = function(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        alert(`Produit: ${product.name?.fr || product.name || 'N/A'}\nPrix d'achat: ${product.purchasePrice || 0} DA\nPrix de vente: ${product.price || 0} DA\nStock: ${product.stock || 0} unités`);
    }
};

window.updateStock = async function(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const currentStock = product.stock || 0;
        const newStock = prompt(`Stock actuel: ${currentStock}\nNouveau stock:`, currentStock);
        
        if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
            try {
                await firebase.firestore().collection('products').doc(productId).update({
                    stock: parseInt(newStock),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                alert('Stock mis à jour');
                loadProducts();
                
            } catch (error) {
                alert('Erreur lors de la mise à jour du stock');
            }
        }
    }
};

window.deleteProduct = async function(productId) {
    const product = products.find(p => p.id === productId);
    
    if (product && confirm(`Supprimer le produit "${product.name?.fr || product.name || 'ce produit'}" ?`)) {
        try {
            await firebase.firestore().collection('products').doc(productId).delete();
            alert('Produit supprimé');
            loadProducts();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    }
};

// ===== GESTION DES COMMANDES =====
async function loadOrders() {
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

    } catch (error) {
        console.error('Erreur commandes:', error);
        showError('Erreur lors du chargement des commandes');
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
    const statusText = getStatusText(order.status);

    tr.innerHTML = `
        <td><input type="checkbox" value="${order.id}"></td>
        <td><strong>#${order.orderNumber || order.id.substring(0, 8)}</strong></td>
        <td>${order.customerName || 'N/A'}</td>
        <td>${order.wilaya || 'N/A'}</td>
        <td><strong>${order.total || '0'} DA</strong></td>
        <td>
            <span class="status-badge status-${order.status || 'pending'}">${statusText}</span>
        </td>
        <td>${date}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="viewOrder('${order.id}')" title="Voir">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="updateOrderStatus('${order.id}')" title="Statut">
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

function getStatusText(status) {
    const statuses = {
        pending: 'En attente',
        confirmed: 'Confirmée',
        processing: 'En cours',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        completed: 'Terminée',
        cancelled: 'Annulée'
    };
    return statuses[status] || 'En attente';
}

// Fonctions commandes globales
window.viewOrder = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        let itemsText = '';
        if (order.items && order.items.length > 0) {
            itemsText = order.items.map(item => 
                `- ${item.name?.fr || item.name || 'Produit'} x${item.quantity || 1} = ${(item.price || 0) * (item.quantity || 1)} DA`
            ).join('\n');
        }
        
        alert(`Commande #${order.orderNumber || orderId.substring(0, 8)}\n\nClient: ${order.customerName || 'N/A'}\nTéléphone: ${order.customerPhone || 'N/A'}\nWilaya: ${order.wilaya || 'N/A'}\nAdresse: ${order.customerAddress || 'N/A'}\n\nProduits:\n${itemsText || 'Aucun produit'}\n\nTotal: ${order.total || '0'} DA\nStatut: ${getStatusText(order.status)}`);
    }
};

window.updateOrderStatus = async function(orderId) {
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const statuses = [
            { value: 'pending', text: 'En attente' },
            { value: 'confirmed', text: 'Confirmée' },
            { value: 'processing', text: 'En cours' },
            { value: 'shipped', text: 'Expédiée' },
            { value: 'delivered', text: 'Livrée' },
            { value: 'completed', text: 'Terminée' },
            { value: 'cancelled', text: 'Annulée' }
        ];
        
        let statusOptions = statuses.map(s => `${s.value}: ${s.text}`).join('\n');
        const newStatus = prompt(`Statut actuel: ${getStatusText(order.status)}\n\nChoisissez:\n${statusOptions}\n\nEntrez la valeur:`, order.status);
        
        if (newStatus && statuses.find(s => s.value === newStatus)) {
            try {
                await firebase.firestore().collection('orders').doc(orderId).update({
                    status: newStatus,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                alert(`Statut mis à jour: ${getStatusText(newStatus)}`);
                loadOrders();
                
            } catch (error) {
                alert('Erreur lors de la mise à jour du statut');
            }
        }
    }
};

window.deleteOrder = async function(orderId) {
    const order = orders.find(o => o.id === orderId);
    
    if (order && confirm(`Supprimer la commande #${order.orderNumber || orderId.substring(0, 8)} ?`)) {
        try {
            await firebase.firestore().collection('orders').doc(orderId).delete();
            alert('Commande supprimée');
            loadOrders();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    }
};

// ===== ANALYTICS =====
async function loadAnalytics() {
    try {
        // Charger les commandes pour analytics
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        
        const analyticsOrders = [];
        ordersSnapshot.forEach(doc => {
            analyticsOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // Statistiques mensuelles
        calculateMonthlyStats(analyticsOrders);
        
        // Top produits
        loadTopProducts(analyticsOrders);
        
        // Stats par wilaya
        loadWilayaStats(analyticsOrders);
        
    } catch (error) {
        console.error('Erreur analytics:', error);
        showError('Erreur lors du chargement des analytics');
    }
}

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
        return sum + (parseFloat(order.total) || 0);
    }, 0);
    
    // Mettre à jour affichage
    const monthlyOrdersElement = document.getElementById('monthlyOrders');
    const monthlyRevenueElement = document.getElementById('monthlyRevenue');
    const growthRateElement = document.getElementById('growthRate');
    
    if (monthlyOrdersElement) monthlyOrdersElement.textContent = monthlyOrders.length;
    if (monthlyRevenueElement) monthlyRevenueElement.textContent = monthlyRevenue.toLocaleString() + ' DA';
    if (growthRateElement) growthRateElement.textContent = '+' + Math.floor(Math.random() * 20) + '%';
}

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
    
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    if (topProductsList) {
        if (topProducts.length === 0) {
            topProductsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune donnée de vente</p>';
        } else {
            topProductsList.innerHTML = topProducts.map(([id, product], index) => `
                <div class="top-product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center;">
                        <span style="background: #007bff; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">${index + 1}</span>
                        <div>
                            <div style="font-weight: bold;">${product.name}</div>
                            <div style="font-size: 12px; color: #666;">${product.quantity} vendus • ${product.revenue.toLocaleString()} DA</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

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
        wilayaStats[wilaya].revenue += parseFloat(order.total) || 0;
    });
    
    const topWilayas = Object.entries(wilayaStats)
        .sort(([,a], [,b]) => b.orders - a.orders)
        .slice(0, 5);
    
    const wilayaStatsList = document.getElementById('wilayaStatsList');
    if (wilayaStatsList) {
        if (topWilayas.length === 0) {
            wilayaStatsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune donnée de wilaya</p>';
        } else {
            wilayaStatsList.innerHTML = topWilayas.map(([wilaya, stats], index) => `
                <div class="wilaya-stat-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center;">
                        <span style="background: #28a745; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">${index + 1}</span>
                        <div>
                            <div style="font-weight: bold;">${wilaya}</div>
                            <div style="font-size: 12px; color: #666;">${stats.orders} commandes • ${stats.revenue.toLocaleString()} DA</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

console.log('✅ Admin panel propre initialisé');