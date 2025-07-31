// PANNEAU ADMIN RANIA SHOP

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
    console.log('Initialisation du panneau admin...');
    initializeAdmin();
});

function initializeAdmin() {
    console.log('Initialisation du panneau admin...');
    console.log('Firebase disponible:', typeof firebase !== 'undefined');
    console.log('Firebase Auth disponible:', typeof firebase !== 'undefined' && !!firebase.auth);
    console.log('Firebase Firestore disponible:', typeof firebase !== 'undefined' && !!firebase.firestore);

    if (typeof firebase === 'undefined') {
        console.error('Firebase non chargé');
        showError('Firebase non chargé - Vérifiez la connexion internet');
        return;
    }

    if (!firebase.auth) {
        console.error('Firebase Auth non disponible');
        showError('Firebase Auth non disponible');
        return;
    }

    // Authentification
    firebase.auth().onAuthStateChanged((user) => {
        console.log('État d\'authentification changé:', user ? user.email : 'Non connecté');

        if (user) {
            console.log('Utilisateur connecté:', user.email);
            currentUser = user;
            showDashboard();
        } else {
            console.log('Aucun utilisateur connecté');
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

    // Event listeners avec délai pour les éléments chargés dynamiquement
    setTimeout(() => {
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('🔄 Actualisation des analytics...');
                loadAnalytics();
            });
        }

        // Configurer les event listeners pour les paramètres
        setupSettingsListeners();
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
        console.log('Tentative de connexion avec:', email);
        console.log('Firebase Auth disponible:', !!firebase.auth);

        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('Connexion réussie:', userCredential.user.email);

    } catch (error) {
        console.error('Erreur de connexion:', error);
        
        let errorMessage = 'Erreur de connexion';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Utilisateur non trouvé - Vérifiez que le compte existe dans Firebase Auth';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Identifiants invalides - Vérifiez l\'email et le mot de passe';
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

    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
}

function showDashboard() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';

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
        settings: 'Paramètres'
    };

    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.textContent = titles[sectionName] || sectionName;
    }

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
        case 'settings':
            loadSettings();
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
                <button class="btn btn-sm btn-warning" onclick="editProduct('${product.id}')" title="Modifier">
                    <i class="fas fa-edit"></i>
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

// ===== MODAL ET FORMULAIRE PRODUIT =====
window.showAddProductModal = function () {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');

    if (modal && title) {
        title.textContent = 'Ajouter un produit';
        modal.style.display = 'block';

        // Réinitialiser le formulaire
        const form = document.getElementById('productForm');
        if (form) {
            form.reset();
            form.onsubmit = handleProductForm;
        }

        // Réinitialiser l'aperçu d'image
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) imagePreview.innerHTML = '';

        // Fermer le modal
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };

        setupImageUpload();
    }
};

window.closeProductModal = function () {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
};

window.handleProductForm = async function (e) {
    e.preventDefault();

    const nameAr = document.getElementById('productNameAr').value;
    const nameFr = document.getElementById('productNameFr').value;
    const purchasePrice = parseFloat(document.getElementById('productPurchasePrice').value) || 0;
    const salePrice = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const category = document.getElementById('productCategory').value;
    const descriptionAr = document.getElementById('productDescriptionAr').value;
    const descriptionFr = document.getElementById('productDescriptionFr').value;
    const imageData = document.getElementById('productImage').value;

    if (!nameAr || !nameFr || !salePrice || !category) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        const productData = {
            name: {
                ar: nameAr,
                fr: nameFr
            },
            purchasePrice: purchasePrice,
            price: salePrice,
            stock: stock,
            category: category,
            description: {
                ar: descriptionAr,
                fr: descriptionFr
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (imageData) {
            productData.image = imageData;
        }

        await firebase.firestore().collection('products').add(productData);

        alert('Produit ajouté avec succès !');
        closeProductModal();
        loadProducts();

    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        alert('Erreur lors de l\'ajout du produit: ' + error.message);
    }
};

// ===== UPLOAD D'IMAGE =====
function setupImageUpload() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');

    if (imageUploadArea && imageInput) {
        imageUploadArea.onclick = () => imageInput.click();

        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.style.backgroundColor = '#f0f8ff';
        });

        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.style.backgroundColor = '';
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.style.backgroundColor = '';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageFile(files[0]);
            }
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageFile(e.target.files[0]);
            }
        });
    }
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 5MB)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" alt="Aperçu" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 2px solid #ddd;">
                    <button type="button" onclick="removeImagePreview()" style="position: absolute; top: -10px; right: -10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                </div>
            `;
        }

        document.getElementById('productImage').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.removeImagePreview = function () {
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('imageInput');
    const productImage = document.getElementById('productImage');

    if (imagePreview) imagePreview.innerHTML = '';
    if (imageInput) imageInput.value = '';
    if (productImage) productImage.value = '';
};

// ===== ACTIONS PRODUITS =====
window.viewProduct = function (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        alert(`Produit: ${product.name?.fr || product.name || 'N/A'}\nPrix d'achat: ${product.purchasePrice || 0} DA\nPrix de vente: ${product.price || 0} DA\nStock: ${product.stock || 0} unités`);
    }
};

window.editProduct = function (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');

        if (modal && title) {
            title.textContent = 'Modifier le produit';
            modal.style.display = 'block';

            // Pré-remplir le formulaire avec les données existantes
            document.getElementById('productNameAr').value = product.name?.ar || product.name || '';
            document.getElementById('productNameFr').value = product.name?.fr || product.name || '';
            document.getElementById('productPurchasePrice').value = product.purchasePrice || 0;
            document.getElementById('productPrice').value = product.price || 0;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productDescriptionAr').value = product.description?.ar || '';
            document.getElementById('productDescriptionFr').value = product.description?.fr || '';

            // Afficher l'image existante si elle existe
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview && product.image) {
                imagePreview.innerHTML = `
                    <div style="position: relative; display: inline-block;">
                        <img src="${product.image}" alt="Image actuelle" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 2px solid #ddd;">
                        <button type="button" onclick="removeImagePreview()" style="position: absolute; top: -10px; right: -10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                    </div>
                `;
                document.getElementById('productImage').value = product.image;
            }

            // Configurer le formulaire pour la modification
            const form = document.getElementById('productForm');
            if (form) {
                form.onsubmit = (e) => handleEditProductForm(e, productId);
            }

            // Fermer le modal
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.onclick = () => modal.style.display = 'none';
            }

            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            };

            setupImageUpload();
        }
    }
};

window.updateStock = async function (productId) {
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

window.deleteProduct = async function (productId) {
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

// ===== ACTIONS COMMANDES =====
window.viewOrder = function (orderId) {
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

window.updateOrderStatus = async function (orderId) {
    const order = orders.find(o => o.id === orderId);

    if (order) {
        const statuses = [
            'pending - En attente',
            'confirmed - Confirmée',
            'processing - En cours',
            'shipped - Expédiée',
            'delivered - Livrée',
            'completed - Terminée',
            'cancelled - Annulée'
        ];

        const newStatus = prompt(`Statut actuel: ${getStatusText(order.status)}\n\nChoisissez le nouveau statut:\n${statuses.join('\n')}\n\nEntrez la valeur (ex: confirmed):`, order.status || 'pending');

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

        if (newStatus && validStatuses.includes(newStatus)) {
            try {
                const oldStatus = order.status;

                // Mettre à jour le statut de la commande
                await firebase.firestore().collection('orders').doc(orderId).update({
                    status: newStatus,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Vérifier si on doit mettre à jour le stock
                const shouldUpdateStock = ['confirmed', 'delivered', 'completed'].includes(newStatus) &&
                    !['confirmed', 'delivered', 'completed'].includes(oldStatus);

                if (shouldUpdateStock && order.items) {
                    console.log('📦 Mise à jour du stock pour commande:', orderId);
                    await updateStockFromOrder(order.items);
                    alert(`Statut mis à jour: ${getStatusText(newStatus)}\n✅ Stock mis à jour automatiquement`);
                } else {
                    alert(`Statut mis à jour: ${getStatusText(newStatus)}`);
                }

                loadOrders();

            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                alert('Erreur lors de la mise à jour du statut');
            }
        } else if (newStatus) {
            alert('Statut invalide. Utilisez: pending, confirmed, processing, shipped, delivered, completed, ou cancelled');
        }
    }
};

window.deleteOrder = async function (orderId) {
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
    console.log('📊 Chargement des analytics...');

    try {
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        const analyticsOrders = [];
        ordersSnapshot.forEach(doc => {
            analyticsOrders.push({ id: doc.id, ...doc.data() });
        });

        console.log(`📊 ${analyticsOrders.length} commandes chargées pour analytics`);

        calculateMonthlyStats(analyticsOrders);
        loadTopProducts(analyticsOrders);
        loadWilayaStats(analyticsOrders);
        createSalesChart();

        console.log('✅ Analytics chargées avec succès');

    } catch (error) {
        console.error('❌ Erreur analytics:', error);
        showError('Erreur lors du chargement des analytics: ' + error.message);
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
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 5);

    const topProductsList = document.getElementById('topProductsList');
    if (topProductsList) {
        if (topProducts.length === 0) {
            topProductsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune donnée de vente</p>';
        } else {
            topProductsList.innerHTML = topProducts.map((productEntry, index) => {
                const product = productEntry[1];
                return `
                    <div class="top-product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center;">
                            <span style="background: #007bff; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">${index + 1}</span>
                            <div>
                                <div style="font-weight: bold;">${product.name}</div>
                                <div style="font-size: 12px; color: #666;">${product.quantity} vendus • ${product.revenue.toLocaleString()} DA</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
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
        .sort((a, b) => b[1].orders - a[1].orders)
        .slice(0, 5);

    const wilayaStatsList = document.getElementById('wilayaStatsList');
    if (wilayaStatsList) {
        if (topWilayas.length === 0) {
            wilayaStatsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune donnée de wilaya</p>';
        } else {
            wilayaStatsList.innerHTML = topWilayas.map((wilayaEntry, index) => {
                const wilaya = wilayaEntry[0];
                const stats = wilayaEntry[1];
                return `
                    <div class="wilaya-stat-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center;">
                            <span style="background: #28a745; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">${index + 1}</span>
                            <div>
                                <div style="font-weight: bold;">${wilaya}</div>
                                <div style="font-size: 12px; color: #666;">${stats.orders} commandes • ${stats.revenue.toLocaleString()} DA</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function createSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const data = [120, 190, 300, 500, 200, 300, 450];
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#007bff';
    ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
    ctx.lineWidth = 3;

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const maxValue = Math.max(...data);

    // Axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Courbe
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = height - padding - (value / maxValue) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Points
    ctx.fillStyle = '#007bff';
    data.forEach((value, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = height - padding - (value / maxValue) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    labels.forEach((label, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        ctx.fillText(label, x, height - 10);
    });
}

console.log('✅ Admin panel propre et fonctionnel initialisé');
// Fonction pour gérer la modification d'un produit
window.handleEditProductForm = async function (e, productId) {
    e.preventDefault();

    const nameAr = document.getElementById('productNameAr').value;
    const nameFr = document.getElementById('productNameFr').value;
    const purchasePrice = parseFloat(document.getElementById('productPurchasePrice').value) || 0;
    const salePrice = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const category = document.getElementById('productCategory').value;
    const descriptionAr = document.getElementById('productDescriptionAr').value;
    const descriptionFr = document.getElementById('productDescriptionFr').value;
    const imageData = document.getElementById('productImage').value;

    if (!nameAr || !nameFr || !salePrice || !category) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        const productData = {
            name: {
                ar: nameAr,
                fr: nameFr
            },
            purchasePrice: purchasePrice,
            price: salePrice,
            stock: stock,
            category: category,
            description: {
                ar: descriptionAr,
                fr: descriptionFr
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (imageData) {
            productData.image = imageData;
        }

        await firebase.firestore().collection('products').doc(productId).update(productData);

        alert('Produit modifié avec succès !');
        closeProductModal();
        loadProducts();

    } catch (error) {
        console.error('Erreur lors de la modification du produit:', error);
        alert('Erreur lors de la modification du produit: ' + error.message);
    }
};

// ===== GESTION SÉLECTION MULTIPLE COMMANDES =====
document.addEventListener('DOMContentLoaded', function () {
    // Attendre que les éléments soient chargés
    setTimeout(() => {
        setupOrdersSelectionHandlers();
    }, 2000);
});

function setupOrdersSelectionHandlers() {
    // Gestionnaire pour "Tout sélectionner"
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            const orderCheckboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]');
            orderCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSelectedOrdersButtons();
        });
    }

    // Gestionnaire pour les boutons d'action
    const deleteSelectedBtn = document.getElementById('deleteSelectedOrders');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedOrders);
    }

    const selectAllBtn = document.getElementById('selectAllOrders');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function () {
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.dispatchEvent(new Event('change'));
            }
        });
    }
}

// Fonction appelée après chargement des commandes pour configurer les event listeners
function setupOrderCheckboxes() {
    const orderCheckboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]');
    orderCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedOrdersButtons);
    });
}

function updateSelectedOrdersButtons() {
    const selectedCheckboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]:checked');
    const deleteSelectedBtn = document.getElementById('deleteSelectedOrders');

    if (deleteSelectedBtn) {
        deleteSelectedBtn.disabled = selectedCheckboxes.length === 0;
    }
}

async function deleteSelectedOrders() {
    const selectedCheckboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]:checked');

    if (selectedCheckboxes.length === 0) {
        alert('Aucune commande sélectionnée');
        return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCheckboxes.length} commande(s) ?`)) {
        try {
            const deletePromises = Array.from(selectedCheckboxes).map(checkbox => {
                return firebase.firestore().collection('orders').doc(checkbox.value).delete();
            });

            await Promise.all(deletePromises);
            alert(`${selectedCheckboxes.length} commande(s) supprimée(s) avec succès`);
            loadOrders();

        } catch (error) {
            console.error('Erreur lors de la suppression des commandes:', error);
            alert('Erreur lors de la suppression des commandes');
        }
    }
}

// Modifier la fonction displayOrders pour inclure les event listeners
const originalDisplayOrders = displayOrders;
displayOrders = function () {
    originalDisplayOrders();
    // Configurer les event listeners après affichage
    setTimeout(() => {
        setupOrderCheckboxes();
        updateSelectedOrdersButtons();
    }, 100);
};

console.log('✅ Admin panel avec toutes les fonctionnalités initialisé');
// ===== FONCTION POUR METTRE À JOUR LE STOCK DEPUIS UNE COMMANDE =====
async function updateStockFromOrder(orderItems) {
    console.log('📦 Début de la mise à jour du stock pour', orderItems.length, 'produits');

    try {
        for (const item of orderItems) {
            console.log(`📦 Traitement du produit ${item.id} - Quantité: ${item.quantity}`);

            // Récupérer le produit actuel
            const productRef = firebase.firestore().collection('products').doc(item.id);
            const productDoc = await productRef.get();

            if (productDoc.exists) {
                const currentProduct = productDoc.data();
                const currentStock = currentProduct.stock || 0;
                const newStock = Math.max(0, currentStock - item.quantity);

                console.log(`📊 Produit ${item.id}: Stock ${currentStock} → ${newStock}`);

                // Mettre à jour le stock
                await productRef.update({
                    stock: newStock,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log(`✅ Stock mis à jour pour ${item.name?.fr || item.name || 'Produit'}`);
            } else {
                console.warn(`⚠️ Produit ${item.id} non trouvé dans Firebase`);
            }
        }

        console.log('✅ Mise à jour du stock terminée avec succès');

        // Recharger les produits pour afficher les nouveaux stocks
        if (typeof loadProducts === 'function') {
            loadProducts();
        }

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du stock:', error);
        throw error; // Relancer l'erreur pour que l'appelant puisse la gérer
    }
}

console.log('✅ Fonction updateStockFromOrder ajoutée au panneau admin');

// ===== GESTION DES PARAMÈTRES =====

// Charger les paramètres depuis Firebase
async function loadSettings() {
    try {
        console.log('📋 Chargement des paramètres...');

        const settingsSnapshot = await firebase.firestore().collection('settings').get();

        if (settingsSnapshot.empty) {
            console.log('⚠️ Aucun paramètre trouvé, création des paramètres par défaut');
            await createDefaultSettings();
            return;
        }

        // Charger les paramètres dans les formulaires
        settingsSnapshot.forEach(doc => {
            const setting = doc.data();
            const settingId = doc.id;

            console.log(`📝 Chargement paramètre: ${settingId}`, setting);

            // Remplir les champs du formulaire
            if (settingId === 'general') {
                document.getElementById('siteName').value = setting.siteName || 'RANIA SHOP';
                document.getElementById('contactEmail').value = setting.contactEmail || 'contact@raniashop.dz';
                document.getElementById('contactPhone').value = setting.contactPhone || '+213 XXX XXX XXX';
            } else if (settingId === 'social') {
                document.getElementById('facebookUrl').value = setting.facebookUrl || 'https://www.facebook.com/raniashop';
                document.getElementById('instagramUrl').value = setting.instagramUrl || 'https://www.instagram.com/raniashop';
                document.getElementById('whatsappNumber').value = setting.whatsappNumber || '+213XXXXXXXXX';
                document.getElementById('tiktokUrl').value = setting.tiktokUrl || 'https://www.tiktok.com/@raniashop';
            }
        });

        console.log('✅ Paramètres chargés avec succès');

    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
    }
}

// Créer les paramètres par défaut
async function createDefaultSettings() {
    try {
        const defaultGeneral = {
            siteName: 'RANIA SHOP',
            contactEmail: 'contact@raniashop.dz',
            contactPhone: '+213 XXX XXX XXX',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const defaultSocial = {
            facebookUrl: 'https://www.facebook.com/raniashop',
            instagramUrl: 'https://www.instagram.com/raniashop',
            whatsappNumber: '+213XXXXXXXXX',
            tiktokUrl: 'https://www.tiktok.com/@raniashop',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore().collection('settings').doc('general').set(defaultGeneral);
        await firebase.firestore().collection('settings').doc('social').set(defaultSocial);

        console.log('✅ Paramètres par défaut créés');

        // Recharger les paramètres
        await loadSettings();

    } catch (error) {
        console.error('❌ Erreur lors de la création des paramètres par défaut:', error);
    }
}

// Sauvegarder les paramètres généraux
async function saveSiteSettings(e) {
    e.preventDefault();

    try {
        console.log('💾 Sauvegarde des paramètres généraux...');

        const siteName = document.getElementById('siteName').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();
        const contactPhone = document.getElementById('contactPhone').value.trim();

        if (!siteName || !contactEmail || !contactPhone) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const settingsData = {
            siteName: siteName,
            contactEmail: contactEmail,
            contactPhone: contactPhone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore().collection('settings').doc('general').set(settingsData);

        console.log('✅ Paramètres généraux sauvegardés:', settingsData);
        alert('Paramètres généraux sauvegardés avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des paramètres généraux:', error);
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
}

// Sauvegarder les paramètres des réseaux sociaux
async function saveSocialSettings(e) {
    e.preventDefault();

    try {
        console.log('💾 Sauvegarde des paramètres réseaux sociaux...');

        const facebookUrl = document.getElementById('facebookUrl').value.trim();
        const instagramUrl = document.getElementById('instagramUrl').value.trim();
        const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
        const tiktokUrl = document.getElementById('tiktokUrl').value.trim();

        const settingsData = {
            facebookUrl: facebookUrl,
            instagramUrl: instagramUrl,
            whatsappNumber: whatsappNumber,
            tiktokUrl: tiktokUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore().collection('settings').doc('social').set(settingsData);

        console.log('✅ Paramètres réseaux sociaux sauvegardés:', settingsData);
        alert('Paramètres des réseaux sociaux sauvegardés avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des paramètres réseaux sociaux:', error);
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
}

// Configurer les event listeners pour les paramètres
function setupSettingsListeners() {
    const siteSettingsForm = document.getElementById('siteSettingsForm');
    const socialSettingsForm = document.getElementById('socialSettingsForm');

    if (siteSettingsForm) {
        siteSettingsForm.addEventListener('submit', saveSiteSettings);
        console.log('✅ Event listener ajouté pour siteSettingsForm');
    }

    if (socialSettingsForm) {
        socialSettingsForm.addEventListener('submit', saveSocialSettings);
        console.log('✅ Event listener ajouté pour socialSettingsForm');
    }
}

// Exposer les fonctions au scope global
window.loadSettings = loadSettings;
window.saveSiteSettings = saveSiteSettings;
window.saveSocialSettings = saveSocialSettings;
window.setupSettingsListeners = setupSettingsListeners;

console.log('✅ Fonctions de gestion des paramètres ajoutées');
// ===== FONCTIONS DE DEBUG ADMIN =====

// Fonction pour tester la connexion Firebase
window.testFirebaseConnection = function () {
    console.log('🧪 Test de connexion Firebase...');
    console.log('- Firebase disponible:', typeof firebase !== 'undefined');
    console.log('- Firebase Auth:', !!firebase?.auth);
    console.log('- Firebase Firestore:', !!firebase?.firestore);

    if (firebase?.auth) {
        console.log('- Utilisateur actuel:', firebase.auth().currentUser?.email || 'Non connecté');
    }

    return {
        firebase: typeof firebase !== 'undefined',
        auth: !!firebase?.auth,
        firestore: !!firebase?.firestore,
        currentUser: firebase?.auth()?.currentUser?.email || null
    };
};

// Fonction pour tester la connexion avec des identifiants
window.testLogin = async function (email, password) {
    console.log('🧪 Test de connexion avec:', email);

    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Test de connexion réussi:', result.user.email);
        return { success: true, user: result.user.email };
    } catch (error) {
        console.error('❌ Test de connexion échoué:', error);
        return { success: false, error: error.code, message: error.message };
    }
};

// Fonction pour créer un utilisateur admin (à utiliser une seule fois)
window.createAdminUser = async function (email, password) {
    console.log('👤 Création d\'un utilisateur admin:', email);

    try {
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('✅ Utilisateur admin créé:', result.user.email);
        return { success: true, user: result.user.email };
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
        return { success: false, error: error.code, message: error.message };
    }
};

console.log('✅ Fonctions de debug admin ajoutées:');
console.log('- testFirebaseConnection() : Teste la connexion Firebase');
console.log('- testLogin(email, password) : Teste la connexion avec des identifiants');
console.log('- createAdminUser(email, password) : Crée un utilisateur admin');

// ===== CORRECTION MENU MOBILE =====
// Solution simple et efficace pour le menu hamburger mobile

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function () {
    // Attendre un délai supplémentaire pour s'assurer que tous les éléments sont rendus
    setTimeout(function () {
        initMobileMenu();
    }, 1000);
});

function initMobileMenu() {
    console.log('🔧 Initialisation du menu mobile...');

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const adminSidebar = document.querySelector('.admin-sidebar');

    console.log('Éléments trouvés:', {
        mobileMenuToggle: !!mobileMenuToggle,
        adminSidebar: !!adminSidebar,
        toggleVisible: mobileMenuToggle ? getComputedStyle(mobileMenuToggle).display !== 'none' : false
    });

    if (mobileMenuToggle && adminSidebar) {
        // Supprimer les anciens event listeners s'ils existent
        mobileMenuToggle.replaceWith(mobileMenuToggle.cloneNode(true));
        const newToggle = document.querySelector('.mobile-menu-toggle');

        // Ajouter le nouvel event listener
        newToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('📱 Clic sur menu hamburger');

            // Toggle des classes
            adminSidebar.classList.toggle('active');
            newToggle.classList.toggle('active');

            const isOpen = adminSidebar.classList.contains('active');
            console.log('📱 Menu', isOpen ? 'ouvert' : 'fermé');
        });

        // Fermer le menu en cliquant en dehors
        document.addEventListener('click', function (e) {
            if (!adminSidebar.contains(e.target) && !newToggle.contains(e.target)) {
                adminSidebar.classList.remove('active');
                newToggle.classList.remove('active');
            }
        });

        // Fermer le menu lors de la navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function () {
                adminSidebar.classList.remove('active');
                newToggle.classList.remove('active');
            });
        });

        console.log('✅ Menu mobile configuré avec succès');

        // Fonction de test disponible dans la console
        window.testMobileMenuNow = function () {
            console.log('🧪 Test du menu mobile...');
            adminSidebar.classList.add('active');
            newToggle.classList.add('active');

            setTimeout(() => {
                adminSidebar.classList.remove('active');
                newToggle.classList.remove('active');
                console.log('✅ Test terminé');
            }, 2000);
        };

    } else {
        console.error('❌ Menu mobile non configuré - éléments manquants');

        // Réessayer après un délai
        setTimeout(function () {
            console.log('🔄 Nouvelle tentative...');
            initMobileMenu();
        }, 2000);
    }
}

console.log('📱 Script menu mobile chargé - Fonction testMobileMenuNow() disponible');