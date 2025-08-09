// Panneau d'administration Rania Shop

let currentUser = null;
let products = [];
let orders = [];

const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(initializeAdmin, 1500);
});

function initializeAdmin() {
    if (typeof firebase === 'undefined') {
        showError('Firebase non chargé');
        return;
    }

    if (!window.firebaseAuth) {
        showError('Firebase Auth non initialisé');
        return;
    }

    window.firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            if (user.email === 'raniia.shopp@gmail.com') {
                currentUser = user;
                showDashboard();
            } else {
                showLoginError('Seul le compte raniia.shopp@gmail.com est autorisé');
                window.firebaseAuth.signOut();
            }
        } else {
            showLoginScreen();
        }
    });

    setupEventListeners();
}

function setupEventListeners() {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showLoginError('Veuillez remplir tous les champs');
        return;
    }

    if (email !== 'raniia.shopp@gmail.com') {
        showLoginError('Seul le compte raniia.shopp@gmail.com est autorisé');
        return;
    }

    try {
        if (!window.firebaseAuth) {
            throw new Error('Firebase Auth non disponible');
        }

        const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);

    } catch (error) {

        let errorMessage = 'Erreur de connexion';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Compte non trouvé';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mot de passe incorrect';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Identifiants invalides';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email invalide';
        }
        showLoginError(errorMessage);
    }
}

async function handleLogout() {
    try {
        await window.firebaseAuth.signOut();
    } catch (error) {
        showError('Erreur de déconnexion');
    }
}

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

function handleNavigation(e) {
    e.preventDefault();

    const sectionName = e.target.getAttribute('data-section');
    if (!sectionName) return;

    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const sectionElement = document.getElementById(sectionName + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

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

async function loadDashboardData() {
    try {
        if (!window.firebaseDB) {
            return;
        }

        const productsSnapshot = await window.firebaseDB.collection('products').get();
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = productsSnapshot.size;
        }

        const ordersSnapshot = await window.firebaseDB.collection('orders').get();
        const totalOrdersElement = document.getElementById('totalOrders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = ordersSnapshot.size;
        }

        const pendingOrdersSnapshot = await window.firebaseDB
            .collection('orders')
            .where('status', '==', 'pending')
            .get();
        const pendingOrdersElement = document.getElementById('pendingOrders');
        if (pendingOrdersElement) {
            pendingOrdersElement.textContent = pendingOrdersSnapshot.size;
        }

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

    } catch (error) {
    }
}

async function loadProducts() {
    try {
        if (!window.firebaseDB) {
            return;
        }

        let productsSnapshot;
        try {
            productsSnapshot = await window.firebaseDB
                .collection('products')
                .orderBy('createdAt', 'desc')
                .get();
        } catch (error) {
            productsSnapshot = await window.firebaseDB
                .collection('products')
                .get();
        }

        products = [];
        productsSnapshot.forEach(doc => {
            const productData = { id: doc.id, ...doc.data() };
            products.push(productData);
        });

        displayProducts();

    } catch (error) {
    }
}

function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Aucun produit - Commencez par ajouter vos premiers produits !</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

function createProductRow(product) {
    const tr = document.createElement('tr');

    // Gérer différentes structures de nom
    let name = 'Produit sans nom';
    if (product.name) {
        if (typeof product.name === 'object') {
            name = product.name.fr || product.name.ar || product.name.en || 'Produit sans nom';
        } else {
            name = product.name;
        }
    }

    const price = product.price || product.salePrice || 0;
    const stock = product.stock || 0;
    const category = product.category || 'Non catégorisé';
    const imageUrl = product.image || product.imageUrl || '../image/default-product.jpg';

    tr.innerHTML = `
        <td>
            <img src="${imageUrl}" alt="${name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" onerror="this.src='../image/default-product.jpg'">
        </td>
        <td><strong>${name}</strong></td>
        <td>${price.toLocaleString()} DA</td>
        <td>
            <span style="color: ${stock < 5 ? 'red' : stock < 10 ? 'orange' : 'green'}">${stock}</span>
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
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return tr;
}

async function loadOrders() {
    try {
        if (!window.firebaseDB) {
            return;
        }

        const ordersSnapshot = await window.firebaseDB
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        displayOrders();

    } catch (error) {
    }
}

function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Aucune commande pour le moment</td></tr>';
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
        shipped: 'Expédiée',
        completed: 'Terminée'
    };
    return statuses[status] || 'En attente';
}

function getCategoryText(category) {
    const categories = {
        hair: 'Cheveux',
        makeup: 'Maquillage',
        skincare: 'Soins',
        lenses: 'Lentilles',
        clothing: 'Vêtements',
        accessories: 'Accessoires',
        perfume: 'Parfums'
    };
    return categories[category] || category;
}

function loadSettings() {
    loadSiteSettings();
    setupSettingsListeners();
}

async function loadAnalytics() {
    try {
        if (!window.firebaseDB) {
            return;
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisMonthOrders = await window.firebaseDB
            .collection('orders')
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth))
            .get();

        let thisMonthRevenue = 0;
        thisMonthOrders.forEach(doc => {
            const order = doc.data();
            if (order.status === 'completed' && order.total) {
                thisMonthRevenue += parseFloat(order.total) || 0;
            }
        });

        const outOfStockProducts = await window.firebaseDB
            .collection('products')
            .where('stock', '<=', 0)
            .get();

        const monthlyOrdersEl = document.getElementById('monthlyOrders');
        const monthlyRevenueEl = document.getElementById('monthlyRevenue');
        const outOfStockEl = document.getElementById('outOfStock');

        if (monthlyOrdersEl) monthlyOrdersEl.textContent = thisMonthOrders.size;
        if (monthlyRevenueEl) monthlyRevenueEl.textContent = thisMonthRevenue.toLocaleString() + ' DA';
        if (outOfStockEl) outOfStockEl.textContent = outOfStockProducts.size;

    } catch (error) {
    }
}

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
        setupProfitCalculation();
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
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.email
        };

        if (imageData) {
            productData.image = imageData;
        }

        await window.firebaseDB.collection('products').add(productData);

        alert('✅ Produit ajouté avec succès !');
        closeProductModal();
        loadProducts();
        loadDashboardData();

    } catch (error) {

        alert('❌ Erreur lors de l\'ajout du produit: ' + error.message);
    }
};

window.viewProduct = function (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        alert(`Produit: ${product.name?.fr || product.name || 'N/A'}\nPrix: ${product.price || 0} DA\nStock: ${product.stock || 0} unités`);
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

            // Pré-remplir le formulaire
            document.getElementById('productNameAr').value = product.name?.ar || product.name || '';
            document.getElementById('productNameFr').value = product.name?.fr || product.name || '';
            document.getElementById('productPurchasePrice').value = product.purchasePrice || 0;
            document.getElementById('productPrice').value = product.price || 0;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productDescriptionAr').value = product.description?.ar || '';
            document.getElementById('productDescriptionFr').value = product.description?.fr || '';

            // Afficher l'image existante
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

            // Configurer pour modification
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
            setupProfitCalculation();
        }
    }
};

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
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        };

        if (imageData) {
            productData.image = imageData;
        }

        await window.firebaseDB.collection('products').doc(productId).update(productData);

        alert('✅ Produit modifié avec succès !');
        closeProductModal();
        loadProducts();
        loadDashboardData();

    } catch (error) {

        alert('❌ Erreur lors de la modification: ' + error.message);
    }
};

window.deleteProduct = async function (productId) {
    const product = products.find(p => p.id === productId);

    if (product && confirm(`Supprimer le produit "${product.name?.fr || product.name || 'ce produit'}" ?\n\nCette action est irréversible.`)) {
        try {
            await window.firebaseDB.collection('products').doc(productId).delete();
            alert('✅ Produit supprimé avec succès');
            loadProducts();
        } catch (error) {
            alert('❌ Erreur lors de la suppression: ' + error.message);
        }
    }
};

window.viewOrder = function (orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Commande #${order.orderNumber || orderId.substring(0, 8)}\n\nClient: ${order.customerName || 'N/A'}\nTotal: ${order.total || '0'} DA\nStatut: ${getStatusText(order.status)}`);
    }
};

window.updateOrderStatus = function (orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Créer le modal de statut
    showStatusModal(orderId, order);
};

function showStatusModal(orderId, order) {
    // Créer le modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Changer le statut de la commande</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="order-info" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Commande #${order.orderNumber || orderId.substring(0, 8)}</strong><br>
                    Client: ${order.customerName || 'N/A'}<br>
                    Total: ${order.total || '0'} DA<br>
                    Statut actuel: <span class="status-badge status-${order.status || 'pending'}">${getStatusText(order.status)}</span>
                </div>
                <div class="status-buttons">
                    <button class="status-btn pending ${order.status === 'pending' ? 'active' : ''}" onclick="changeOrderStatus('${orderId}', 'pending')">
                        <i class="fas fa-clock"></i> En attente
                    </button>
                    <button class="status-btn confirmed ${order.status === 'confirmed' ? 'active' : ''}" onclick="changeOrderStatus('${orderId}', 'confirmed')">
                        <i class="fas fa-check"></i> Confirmée
                    </button>
                    <button class="status-btn shipped ${order.status === 'shipped' ? 'active' : ''}" onclick="changeOrderStatus('${orderId}', 'shipped')">
                        <i class="fas fa-truck"></i> Expédiée
                    </button>
                    <button class="status-btn completed ${order.status === 'completed' ? 'active' : ''}" onclick="changeOrderStatus('${orderId}', 'completed')">
                        <i class="fas fa-check-circle"></i> Terminée
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fermer en cliquant à l'extérieur
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

window.changeOrderStatus = async function (orderId, newStatus) {
    try {
        await window.firebaseDB.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.email
        });

        // Fermer le modal
        document.querySelector('.modal')?.remove();

        // Recharger les données
        loadOrders();
        loadDashboardData();

        // Notification de succès
        showNotification(`✅ Statut mis à jour: ${getStatusText(newStatus)}`, 'success');

    } catch (error) {

        showNotification('❌ Erreur lors de la mise à jour du statut', 'error');
    }
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

window.deleteOrder = async function (orderId) {
    const order = orders.find(o => o.id === orderId);

    if (order && confirm(`Supprimer la commande #${order.orderNumber || orderId.substring(0, 8)} ?\n\nCette action est irréversible.`)) {
        try {
            await window.firebaseDB.collection('orders').doc(orderId).delete();
            alert('✅ Commande supprimée avec succès');
            loadOrders();
            loadDashboardData();
        } catch (error) {
            alert('❌ Erreur lors de la suppression: ' + error.message);
        }
    }
};



// Upload d'image
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

    // Compression automatique de l'image
    compressImage(file, (compressedDataUrl) => {
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${compressedDataUrl}" alt="Aperçu" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 2px solid #ddd;">
                    <button type="button" onclick="removeImagePreview()" style="position: absolute; top: -10px; right: -10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                </div>
            `;
        }

        document.getElementById('productImage').value = compressedDataUrl;
    });
}

// Fonction de compression d'image
function compressImage(file, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
        // Calculer les nouvelles dimensions (max 800px)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression (qualité 0.7)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedDataUrl);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
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

// ===== CALCUL DE RENTABILITÉ =====
function setupProfitCalculation() {
    const purchasePriceInput = document.getElementById('productPurchasePrice');
    const salePriceInput = document.getElementById('productPrice');
    const profitCalculation = document.getElementById('profitCalculation');

    if (purchasePriceInput && salePriceInput && profitCalculation) {
        const updateProfitCalculation = () => {
            const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
            const salePrice = parseFloat(salePriceInput.value) || 0;
            const profit = salePrice - purchasePrice;
            const profitPercentage = purchasePrice > 0 ? ((profit / purchasePrice) * 100) : 0;

            const profitMargin = document.getElementById('profitMargin');
            const profitPercentageEl = document.getElementById('profitPercentage');
            const profitStatus = document.getElementById('profitStatus');

            if (profitMargin) profitMargin.textContent = `${profit.toFixed(2)} DA`;
            if (profitPercentageEl) profitPercentageEl.textContent = `${profitPercentage.toFixed(1)}%`;

            if (profitStatus) {
                if (profit > 0) {
                    profitStatus.textContent = 'Rentable';
                    profitStatus.style.color = '#27ae60';
                } else if (profit === 0) {
                    profitStatus.textContent = 'Équilibré';
                    profitStatus.style.color = '#f39c12';
                } else {
                    profitStatus.textContent = 'Perte';
                    profitStatus.style.color = '#e74c3c';
                }
            }

            if (purchasePrice > 0 || salePrice > 0) {
                profitCalculation.style.display = 'block';
            } else {
                profitCalculation.style.display = 'none';
            }
        };

        purchasePriceInput.addEventListener('input', updateProfitCalculation);
        salePriceInput.addEventListener('input', updateProfitCalculation);
    }
}

// Fonction de compression d'image
function compressImage(file, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
        // Calculer les nouvelles dimensions (max 800px)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression (qualité 0.7)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedDataUrl);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
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

// ===== CALCUL DE RENTABILITÉ =====
function setupProfitCalculation() {
    const purchasePriceInput = document.getElementById('productPurchasePrice');
    const salePriceInput = document.getElementById('productPrice');
    const profitCalculation = document.getElementById('profitCalculation');

    if (purchasePriceInput && salePriceInput && profitCalculation) {
        const updateProfitCalculation = () => {
            const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
            const salePrice = parseFloat(salePriceInput.value) || 0;

            if (purchasePrice > 0 && salePrice > 0) {
                const margin = salePrice - purchasePrice;
                const percentage = ((margin / purchasePrice) * 100).toFixed(1);

                document.getElementById('profitMargin').textContent = margin.toLocaleString() + ' DA';
                document.getElementById('profitPercentage').textContent = percentage + '%';

                const statusElement = document.getElementById('profitStatus');
                if (percentage > 30) {
                    statusElement.textContent = 'Excellente';
                    statusElement.style.color = '#27ae60';
                } else if (percentage > 15) {
                    statusElement.textContent = 'Bonne';
                    statusElement.style.color = '#f39c12';
                } else if (percentage > 0) {
                    statusElement.textContent = 'Faible';
                    statusElement.style.color = '#e74c3c';
                } else {
                    statusElement.textContent = 'Perte';
                    statusElement.style.color = '#c0392b';
                }

                profitCalculation.style.display = 'block';
            } else {
                profitCalculation.style.display = 'none';
            }
        };

        purchasePriceInput.addEventListener('input', updateProfitCalculation);
        salePriceInput.addEventListener('input', updateProfitCalculation);

        updateProfitCalculation();
    }
}

// Fonctions d'export
window.exportOrdersCSV = function () {
    if (orders.length === 0) {
        alert('Aucune commande à exporter');
        return;
    }

    const headers = ['ID', 'Numéro', 'Client', 'Email', 'Téléphone', 'Wilaya', 'Adresse', 'Total', 'Statut', 'Date'];
    const csvContent = [
        headers.join(','),
        ...orders.map(order => [
            order.id,
            order.orderNumber || '',
            order.customerName || '',
            order.customerEmail || '',
            order.customerPhone || '',
            order.wilaya || '',
            order.customerAddress || '',
            order.total || 0,
            getStatusText(order.status),
            order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : ''
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, 'commandes_rania_shop.csv');
    alert('✅ Export des commandes terminé !');
};

window.exportProductsCSV = function () {
    if (products.length === 0) {
        alert('Aucun produit à exporter');
        return;
    }

    const headers = ['ID', 'Nom (AR)', 'Nom (FR)', 'Prix d\'achat', 'Prix de vente', 'Marge', 'Stock', 'Catégorie'];
    const csvContent = [
        headers.join(','),
        ...products.map(product => {
            const purchasePrice = product.purchasePrice || 0;
            const salePrice = product.price || 0;
            const margin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice * 100).toFixed(1) : 0;

            return [
                product.id,
                product.name?.ar || product.name || '',
                product.name?.fr || product.name || '',
                purchasePrice,
                salePrice,
                margin + '%',
                product.stock || 0,
                getCategoryText(product.category)
            ].map(field => `"${field}"`).join(',');
        })
    ].join('\n');

    downloadCSV(csvContent, 'produits_rania_shop.csv');
    alert('✅ Export des produits terminé !');
};

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Gestion des paramètres
function loadSettings() {
    loadSiteSettings();
    setupSettingsListeners();
}

async function loadSiteSettings() {
    try {
        // Charger les paramètres généraux
        const settingsDoc = await window.firebaseDB.collection('settings').doc('general').get();
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            if (settings.siteName) document.getElementById('siteName').value = settings.siteName;
            if (settings.contactEmail) document.getElementById('contactEmail').value = settings.contactEmail;
            if (settings.contactPhone) document.getElementById('contactPhone').value = settings.contactPhone;
        }

        // Charger les paramètres des réseaux sociaux
        const socialDoc = await window.firebaseDB.collection('settings').doc('social').get();
        if (socialDoc.exists) {
            const social = socialDoc.data();
            if (social.facebookUrl) document.getElementById('facebookUrl').value = social.facebookUrl;
            if (social.instagramUrl) document.getElementById('instagramUrl').value = social.instagramUrl;
            if (social.whatsappNumber) document.getElementById('whatsappNumber').value = social.whatsappNumber;
            if (social.tiktokUrl) document.getElementById('tiktokUrl').value = social.tiktokUrl;
        }

    } catch (error) {
    }
}

function setupSettingsListeners() {
    const siteSettingsForm = document.getElementById('siteSettingsForm');
    if (siteSettingsForm) {
        siteSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const settings = {
                siteName: document.getElementById('siteName').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            };

            try {
                await window.firebaseDB.collection('settings').doc('general').set(settings, { merge: true });
                showNotification('✅ Paramètres généraux sauvegardés et synchronisés avec le site', 'success');

            } catch (error) {

                showNotification('❌ Erreur lors de la sauvegarde: ' + error.message, 'error');
            }
        });
    }

    const socialSettingsForm = document.getElementById('socialSettingsForm');
    if (socialSettingsForm) {
        socialSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const socialSettings = {
                facebookUrl: document.getElementById('facebookUrl').value,
                instagramUrl: document.getElementById('instagramUrl').value,
                whatsappNumber: document.getElementById('whatsappNumber').value,
                tiktokUrl: document.getElementById('tiktokUrl').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            };

            try {
                await window.firebaseDB.collection('settings').doc('social').set(socialSettings, { merge: true });
                showNotification('✅ Paramètres des réseaux sociaux sauvegardés et synchronisés', 'success');

            } catch (error) {

                showNotification('❌ Erreur lors de la sauvegarde: ' + error.message, 'error');
            }
        });
    }
}

// Gestion en lot
window.selectAllOrders = function () {
    const checkboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const deleteButton = document.getElementById('deleteSelectedOrders');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    if (deleteButton) {
        deleteButton.disabled = !selectAllCheckbox.checked;
    }
};

window.deleteSelectedOrders = async function () {
    const selectedCheckboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);

    if (selectedIds.length === 0) {
        alert('Aucune commande sélectionnée');
        return;
    }

    if (confirm(`Supprimer ${selectedIds.length} commande(s) sélectionnée(s) ?\n\nCette action est irréversible.`)) {
        try {
            const batch = window.firebaseDB.batch();

            selectedIds.forEach(orderId => {
                const orderRef = window.firebaseDB.collection('orders').doc(orderId);
                batch.delete(orderRef);
            });

            await batch.commit();
            alert(`✅ ${selectedIds.length} commande(s) supprimée(s) avec succès`);
            loadOrders();
            loadDashboardData();

        } catch (error) {

            alert('❌ Erreur lors de la suppression: ' + error.message);
        }
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', selectAllOrders);
        }

        const deleteSelectedBtn = document.getElementById('deleteSelectedOrders');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', deleteSelectedOrders);
        }

        const exportOrdersBtn = document.getElementById('exportOrdersCSV');
        if (exportOrdersBtn) {
            exportOrdersBtn.addEventListener('click', exportOrdersCSV);
        }

        const exportProductsBtn = document.getElementById('exportProductsCSV');
        if (exportProductsBtn) {
            exportProductsBtn.addEventListener('click', exportProductsCSV);
        }

        const refreshAnalyticsBtn = document.getElementById('refreshAnalytics');
        if (refreshAnalyticsBtn) {
            refreshAnalyticsBtn.addEventListener('click', function (e) {
                e.preventDefault();

                loadAnalytics();
            });
        }

        document.addEventListener('change', function (e) {
            if (e.target.matches('#ordersTableBody input[type="checkbox"]')) {
                const deleteButton = document.getElementById('deleteSelectedOrders');
                const checkedBoxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]:checked');

                if (deleteButton) {
                    deleteButton.disabled = checkedBoxes.length === 0;
                }
            }
        });

    }, 2000);
});

