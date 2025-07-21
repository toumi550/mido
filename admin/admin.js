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

    // Initialize image upload system
    setupImageUpload();

    // Order status filter
    document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);

    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle').addEventListener('click', toggleMobileMenu);

    // Nouvelles fonctionnalités - Event listeners
    setupNewFeatureListeners();
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
                // Si order.total est un nombre, l'utiliser directement
                // Si c'est une chaîne avec "DA", extraire le nombre
                const totalValue = typeof order.total === 'number' 
                    ? order.total 
                    : parseFloat(order.total.toString().replace(/[^\d]/g, ''));
                totalRevenue += totalValue || 0;
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
            .orderBy('createdAt', 'desc')
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
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : 'Date inconnue';
    
    div.innerHTML = `
        <div class="order-info">
            <h4>Commande #${order.orderNumber || orderId.substring(0, 8)}</h4>
            <p><strong>Client:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Téléphone:</strong> ${order.customerPhone || 'N/A'}</p>
            <p><strong>Total:</strong> ${order.total || '0'} DA</p>
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

        // Si aucun produit dans Firebase, ajouter les produits par défaut
        if (products.length === 0) {
            await initializeDefaultProducts();
            // Recharger après avoir ajouté les produits par défaut
            const newSnapshot = await firebase.firestore()
                .collection('products')
                .orderBy('createdAt', 'desc')
                .get();
            
            products = [];
            newSnapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
        }

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
            .orderBy('createdAt', 'desc')
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
    
    const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';
    
    tr.innerHTML = `
        <td><input type="checkbox" class="order-checkbox" data-order-id="${order.id}" onchange="toggleOrderSelection('${order.id}', this.checked)"></td>
        <td>#${order.orderNumber || order.id.substring(0, 8)}</td>
        <td>${order.customerName || 'N/A'}</td>
        <td>${order.customerPhone || 'N/A'}</td>
        <td>${order.wilaya || 'N/A'}</td>
        <td>${order.total || '0'} DA</td>
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
    const date = order.createdAt ? order.createdAt.toDate().toLocaleString('fr-FR') : 'N/A';
    
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
                <p><strong>Client:</strong> ${order.customerName || 'N/A'}</p>
                <p><strong>Téléphone:</strong> ${order.customerPhone || 'N/A'}</p>
                <p><strong>Adresse:</strong> ${order.customerAddress || 'N/A'}</p>
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

// Initialize default products if Firebase collection is empty
async function initializeDefaultProducts() {
    const defaultProducts = [
        {
            name: { ar: "شامبو مغذي للشعر", fr: "Shampooing nourrissant" },
            price: 2500,
            category: "hair",
            description: { ar: "شامبو مغذي ومرطب للشعر الجاف والتالف، يحتوي على زيوت طبيعية", fr: "Shampooing nourrissant et hydratant pour cheveux secs et abîmés, contient des huiles naturelles" },
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "أحمر شفاه مات", fr: "Rouge à lèvres mat" },
            price: 1800,
            category: "makeup",
            description: { ar: "أحمر شفاه بتركيبة مات طويلة الثبات، متوفر بألوان متعددة", fr: "Rouge à lèvres mat longue tenue, disponible en plusieurs couleurs" },
            image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "كريم مرطب للوجه", fr: "Crème hydratante visage" },
            price: 3200,
            category: "skincare",
            description: { ar: "كريم مرطب يومي للوجه، مناسب لجميع أنواع البشرة", fr: "Crème hydratante quotidienne pour le visage, convient à tous types de peau" },
            image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "عدسات ملونة زرقاء", fr: "Lentilles colorées bleues" },
            price: 4500,
            category: "lenses",
            description: { ar: "عدسات لاصقة ملونة باللون الأزرق، آمنة ومريحة", fr: "Lentilles de contact colorées bleues, sûres et confortables" },
            image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "فستان أنيق وردي", fr: "Robe élégante rose" },
            price: 8500,
            category: "clothing",
            description: { ar: "فستان أنيق ومريح، مناسب للمناسبات الخاصة", fr: "Robe élégante et confortable, parfaite pour les occasions spéciales" },
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "ماسكارا مقاومة للماء", fr: "Mascara waterproof" },
            price: 2200,
            category: "makeup",
            description: { ar: "ماسكارا مقاومة للماء تمنح الرموش كثافة وطولاً طبيعياً", fr: "Mascara waterproof qui donne volume et longueur naturelle aux cils" },
            image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "زيت الأرغان للشعر", fr: "Huile d'argan cheveux" },
            price: 3800,
            category: "hair",
            description: { ar: "زيت الأرغان الطبيعي لتغذية وترطيب الشعر", fr: "Huile d'argan naturelle pour nourrir et hydrater les cheveux" },
            image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            name: { ar: "سيروم فيتامين سي", fr: "Sérum vitamine C" },
            price: 4200,
            category: "skincare",
            description: { ar: "سيروم فيتامين سي لإشراق البشرة ومحاربة علامات التقدم في السن", fr: "Sérum vitamine C pour éclaircir la peau et lutter contre les signes de l'âge" },
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=300&fit=crop&crop=center",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];

    try {
        const batch = firebase.firestore().batch();
        defaultProducts.forEach(product => {
            const docRef = firebase.firestore().collection('products').doc();
            batch.set(docRef, product);
        });
        await batch.commit();
        console.log('Produits par défaut ajoutés avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'ajout des produits par défaut:', error);
    }
}

// Image upload functions
let currentImageFile = null;

function setupImageUpload() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');

    // Click to upload
    imageUploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // File input change
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });

    // Drag and drop
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('drag-over');
    });

    imageUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('drag-over');
    });

    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageFile(file);
            } else {
                showError('Veuillez sélectionner un fichier image valide');
            }
        }
    });
}

function handleImageFile(file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('La taille de l\'image ne doit pas dépasser 5MB');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Veuillez sélectionner un fichier image valide');
        return;
    }

    currentImageFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = `
            <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <p style="margin-top: 10px; color: #666; font-size: 14px;">${file.name}</p>
        `;
        
        // Update the hidden input with base64 data
        document.getElementById('productImage').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Utility Functions
function previewImage() {
    // This function is now handled by the new image upload system
    // Keeping it for backward compatibility
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
        'auth/user-not-found': 'Utilisateur non trouvé. Vérifiez votre email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-email': 'Format d\'email invalide.',
        'auth/user-disabled': 'Compte désactivé.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
        'auth/network-request-failed': 'Erreur de connexion réseau. Vérifiez votre connexion.',
        'auth/invalid-credential': 'Identifiants invalides.',
        'auth/configuration-not-found': 'Configuration Firebase manquante.'
    };
    
    return errorMessages[errorCode] || `Erreur: ${errorCode}`;
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

// ===== NOUVELLES FONCTIONNALITÉS AVANCÉES =====

// Variables globales pour les nouvelles fonctionnalités
let selectedOrders = new Set();
let analyticsData = {};

// ===== GESTION DES COMMANDES AVANCÉE =====

// Fonction pour supprimer une commande
async function deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
        return;
    }

    try {
        showLoading('Suppression en cours...');
        await firebase.firestore().collection('orders').doc(orderId).delete();
        showSuccess('Commande supprimée avec succès !');
        loadOrders(); // Recharger la liste
    } catch (error) {
        showError('Erreur lors de la suppression : ' + error.message);
    } finally {
        hideLoading();
    }
}

// Fonction pour supprimer plusieurs commandes
async function deleteSelectedOrders() {
    if (selectedOrders.size === 0) {
        showError('Aucune commande sélectionnée');
        return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrders.size} commande(s) ? Cette action est irréversible.`)) {
        return;
    }

    try {
        showLoading('Suppression en cours...');
        const batch = firebase.firestore().batch();
        
        selectedOrders.forEach(orderId => {
            const orderRef = firebase.firestore().collection('orders').doc(orderId);
            batch.delete(orderRef);
        });

        await batch.commit();
        showSuccess(`${selectedOrders.size} commande(s) supprimée(s) avec succès !`);
        selectedOrders.clear();
        updateDeleteButton();
        loadOrders();
    } catch (error) {
        showError('Erreur lors de la suppression : ' + error.message);
    } finally {
        hideLoading();
    }
}

// Fonction pour sélectionner/désélectionner toutes les commandes
function toggleSelectAllOrders() {
    const checkboxes = document.querySelectorAll('.order-checkbox');
    const selectAllBtn = document.getElementById('selectAllOrders');
    
    if (selectedOrders.size === checkboxes.length) {
        // Tout désélectionner
        selectedOrders.clear();
        checkboxes.forEach(cb => cb.checked = false);
        selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> Tout sélectionner';
    } else {
        // Tout sélectionner
        selectedOrders.clear();
        checkboxes.forEach(cb => {
            cb.checked = true;
            selectedOrders.add(cb.dataset.orderId);
        });
        selectAllBtn.innerHTML = '<i class="fas fa-square"></i> Tout désélectionner';
    }
    
    updateDeleteButton();
}

// Fonction pour gérer la sélection d'une commande
function toggleOrderSelection(orderId, checked) {
    if (checked) {
        selectedOrders.add(orderId);
    } else {
        selectedOrders.delete(orderId);
    }
    updateDeleteButton();
    updateSelectAllButton();
}

// Mettre à jour le bouton de suppression
function updateDeleteButton() {
    const deleteBtn = document.getElementById('deleteSelectedOrders');
    deleteBtn.disabled = selectedOrders.size === 0;
    deleteBtn.textContent = selectedOrders.size > 0 
        ? `Supprimer (${selectedOrders.size})` 
        : 'Supprimer sélectionnées';
}

// Mettre à jour le bouton "Tout sélectionner"
function updateSelectAllButton() {
    const checkboxes = document.querySelectorAll('.order-checkbox');
    const selectAllBtn = document.getElementById('selectAllOrders');
    
    if (selectedOrders.size === checkboxes.length && checkboxes.length > 0) {
        selectAllBtn.innerHTML = '<i class="fas fa-square"></i> Tout désélectionner';
    } else {
        selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> Tout sélectionner';
    }
}

// ===== GESTION DU COMPTE ADMIN =====

// Changer le mot de passe
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showError('Les nouveaux mots de passe ne correspondent pas');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    try {
        showLoading('Changement du mot de passe...');
        
        // Ré-authentifier l'utilisateur
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        await currentUser.reauthenticateWithCredential(credential);
        
        // Changer le mot de passe
        await currentUser.updatePassword(newPassword);
        
        showSuccess('Mot de passe changé avec succès !');
        document.getElementById('changePasswordForm').reset();
        
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            showError('Mot de passe actuel incorrect');
        } else {
            showError('Erreur lors du changement de mot de passe : ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// Changer l'email admin
async function handleChangeEmail(e) {
    e.preventDefault();
    
    const newEmail = document.getElementById('newEmail').value;
    const password = document.getElementById('passwordConfirm').value;
    
    try {
        showLoading('Changement de l\'email...');
        
        // Ré-authentifier l'utilisateur
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            password
        );
        
        await currentUser.reauthenticateWithCredential(credential);
        
        // Changer l'email
        await currentUser.updateEmail(newEmail);
        
        showSuccess('Email changé avec succès !');
        document.getElementById('currentEmail').value = newEmail;
        document.getElementById('adminEmail').textContent = newEmail;
        document.getElementById('changeEmailForm').reset();
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError('Cet email est déjà utilisé');
        } else if (error.code === 'auth/wrong-password') {
            showError('Mot de passe incorrect');
        } else {
            showError('Erreur lors du changement d\'email : ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// Ajouter un nouvel administrateur
async function handleAddAdmin(e) {
    e.preventDefault();
    
    const email = document.getElementById('newAdminEmail').value;
    const password = document.getElementById('newAdminPassword').value;
    
    try {
        showLoading('Création du compte administrateur...');
        
        // Créer le nouvel utilisateur
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // Ajouter à la collection des admins
        await firebase.firestore().collection('admins').doc(userCredential.user.uid).set({
            email: email,
            role: 'admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.email
        });
        
        showSuccess('Administrateur ajouté avec succès !');
        document.getElementById('addAdminForm').reset();
        loadAdminUsers();
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError('Cet email est déjà utilisé');
        } else {
            showError('Erreur lors de la création : ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// Charger la liste des administrateurs
async function loadAdminUsers() {
    try {
        const adminsSnapshot = await firebase.firestore().collection('admins').get();
        const adminsList = document.getElementById('adminUsersList');
        
        adminsList.innerHTML = '';
        
        adminsSnapshot.forEach(doc => {
            const admin = doc.data();
            const adminElement = document.createElement('div');
            adminElement.className = 'admin-user-item';
            adminElement.innerHTML = `
                <div class="admin-info">
                    <i class="fas fa-user-shield"></i>
                    <span>${admin.email}</span>
                    <small>Créé le ${admin.createdAt ? admin.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A'}</small>
                </div>
                <div class="admin-actions">
                    ${admin.email !== currentUser.email ? 
                        `<button class="btn btn-danger btn-sm" onclick="removeAdmin('${doc.id}', '${admin.email}')">
                            <i class="fas fa-trash"></i>
                        </button>` : 
                        '<span class="current-user">Vous</span>'
                    }
                </div>
            `;
            adminsList.appendChild(adminElement);
        });
        
    } catch (error) {
        showError('Erreur lors du chargement des administrateurs : ' + error.message);
    }
}

// Supprimer un administrateur
async function removeAdmin(adminId, email) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur ${email} ?`)) {
        return;
    }
    
    try {
        showLoading('Suppression en cours...');
        await firebase.firestore().collection('admins').doc(adminId).delete();
        showSuccess('Administrateur supprimé avec succès !');
        loadAdminUsers();
    } catch (error) {
        showError('Erreur lors de la suppression : ' + error.message);
    } finally {
        hideLoading();
    }
}

// ===== STATISTIQUES AVANCÉES =====

// Charger les statistiques avancées
async function loadAdvancedAnalytics() {
    try {
        showLoading('Chargement des statistiques...');
        
        const timeRange = parseInt(document.getElementById('analyticsTimeRange').value);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        
        // Charger les commandes dans la période
        const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('createdAt', '>=', startDate)
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        // Calculer les statistiques
        calculateAnalytics(orders, timeRange);
        
    } catch (error) {
        showError('Erreur lors du chargement des statistiques : ' + error.message);
    } finally {
        hideLoading();
    }
}

// Calculer les statistiques
function calculateAnalytics(orders, timeRange) {
    // Statistiques mensuelles
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyOrders = orders.filter(order => {
        const orderDate = order.createdAt.toDate();
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
        const total = typeof order.total === 'number' ? order.total : parseFloat(order.total.toString().replace(/[^\d]/g, ''));
        return sum + (total || 0);
    }, 0);
    
    // Mettre à jour l'affichage
    document.getElementById('monthlyOrders').textContent = monthlyOrders.length;
    document.getElementById('monthlyRevenue').textContent = monthlyRevenue + ' DA';
    
    // Calculer la croissance (comparaison avec le mois précédent)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthOrders = orders.filter(order => {
        const orderDate = order.createdAt.toDate();
        return orderDate.getMonth() === lastMonth.getMonth() && orderDate.getFullYear() === lastMonth.getFullYear();
    });
    
    const growth = lastMonthOrders.length > 0 
        ? ((monthlyOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100).toFixed(1)
        : 0;
    
    document.getElementById('growthRate').textContent = `${growth > 0 ? '+' : ''}${growth}%`;
    document.getElementById('growthRate').className = `stat-value ${growth >= 0 ? 'positive' : 'negative'}`;
    
    // Produits les plus vendus
    calculateTopProducts(orders);
    
    // Statistiques par wilaya
    calculateWilayaStats(orders);
    
    // Graphique des ventes (simulation simple)
    drawSalesChart(orders, timeRange);
}

// Calculer les produits les plus vendus
function calculateTopProducts(orders) {
    const productStats = {};
    
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const productName = typeof item.name === 'object' ? item.name.fr || item.name.ar : item.name;
                if (!productStats[productName]) {
                    productStats[productName] = { quantity: 0, revenue: 0 };
                }
                productStats[productName].quantity += item.quantity;
                productStats[productName].revenue += item.price * item.quantity;
            });
        }
    });
    
    // Trier par quantité vendue
    const sortedProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 5);
    
    const topProductsList = document.getElementById('topProductsList');
    topProductsList.innerHTML = '';
    
    sortedProducts.forEach(([name, stats], index) => {
        const productElement = document.createElement('div');
        productElement.className = 'top-product-item';
        productElement.innerHTML = `
            <div class="product-rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${name}</div>
                <div class="product-stats">
                    <span>${stats.quantity} vendus</span>
                    <span>${stats.revenue} DA</span>
                </div>
            </div>
        `;
        topProductsList.appendChild(productElement);
    });
}

// Calculer les statistiques par wilaya
function calculateWilayaStats(orders) {
    const wilayaStats = {};
    
    orders.forEach(order => {
        const wilaya = order.wilaya || 'Non spécifié';
        if (!wilayaStats[wilaya]) {
            wilayaStats[wilaya] = { count: 0, revenue: 0 };
        }
        wilayaStats[wilaya].count++;
        
        const total = typeof order.total === 'number' ? order.total : parseFloat(order.total.toString().replace(/[^\d]/g, ''));
        wilayaStats[wilaya].revenue += total || 0;
    });
    
    // Trier par nombre de commandes
    const sortedWilayas = Object.entries(wilayaStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10);
    
    const wilayaStatsList = document.getElementById('wilayaStatsList');
    wilayaStatsList.innerHTML = '';
    
    sortedWilayas.forEach(([wilaya, stats]) => {
        const wilayaElement = document.createElement('div');
        wilayaElement.className = 'wilaya-stat-item';
        wilayaElement.innerHTML = `
            <div class="wilaya-name">${wilaya}</div>
            <div class="wilaya-stats">
                <span class="orders-count">${stats.count} commandes</span>
                <span class="revenue">${stats.revenue} DA</span>
            </div>
        `;
        wilayaStatsList.appendChild(wilayaElement);
    });
}

// Dessiner un graphique simple des ventes
function drawSalesChart(orders, timeRange) {
    const canvas = document.getElementById('salesChart');
    const ctx = canvas.getContext('2d');
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grouper les commandes par jour
    const dailyStats = {};
    const today = new Date();
    
    // Initialiser tous les jours avec 0
    for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyStats[dateKey] = 0;
    }
    
    // Compter les commandes par jour
    orders.forEach(order => {
        const orderDate = order.createdAt.toDate();
        const dateKey = orderDate.toISOString().split('T')[0];
        if (dailyStats.hasOwnProperty(dateKey)) {
            const total = typeof order.total === 'number' ? order.total : parseFloat(order.total.toString().replace(/[^\d]/g, ''));
            dailyStats[dateKey] += total || 0;
        }
    });
    
    // Dessiner le graphique
    const values = Object.values(dailyStats);
    const maxValue = Math.max(...values, 1);
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    values.forEach((value, index) => {
        const x = padding + (index * chartWidth) / (values.length - 1);
        const y = padding + chartHeight - (value * chartHeight) / maxValue;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Ajouter des points
    ctx.fillStyle = '#e91e63';
    values.forEach((value, index) => {
        const x = padding + (index * chartWidth) / (values.length - 1);
        const y = padding + chartHeight - (value * chartHeight) / maxValue;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// ===== EXPORT DES DONNÉES =====

// Exporter les commandes en CSV
function exportOrdersCSV() {
    try {
        const csvContent = generateOrdersCSV();
        downloadCSV(csvContent, 'commandes_' + new Date().toISOString().split('T')[0] + '.csv');
        showSuccess('Export des commandes terminé !');
    } catch (error) {
        showError('Erreur lors de l\'export : ' + error.message);
    }
}

// Générer le CSV des commandes
function generateOrdersCSV() {
    const headers = ['ID', 'Numéro', 'Client', 'Téléphone', 'Adresse', 'Wilaya', 'Type livraison', 'Total', 'Statut', 'Date', 'Commentaire'];
    let csvContent = headers.join(',') + '\n';
    
    orders.forEach(order => {
        const row = [
            order.id,
            order.orderNumber || '',
            '"' + (order.customerName || '').replace(/"/g, '""') + '"',
            order.customerPhone || '',
            '"' + (order.customerAddress || '').replace(/"/g, '""') + '"',
            order.wilaya || '',
            order.deliveryType || '',
            order.total || 0,
            order.status || '',
            order.createdAt ? order.createdAt.toDate().toLocaleDateString('fr-FR') : '',
            '"' + (order.customerComment || '').replace(/"/g, '""') + '"'
        ];
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

// Exporter les produits en CSV
async function exportProductsCSV() {
    try {
        showLoading('Export en cours...');
        const csvContent = await generateProductsCSV();
        downloadCSV(csvContent, 'produits_' + new Date().toISOString().split('T')[0] + '.csv');
        showSuccess('Export des produits terminé !');
    } catch (error) {
        showError('Erreur lors de l\'export : ' + error.message);
    } finally {
        hideLoading();
    }
}

// Générer le CSV des produits
async function generateProductsCSV() {
    const productsSnapshot = await firebase.firestore().collection('products').get();
    const headers = ['ID', 'Nom (AR)', 'Nom (FR)', 'Prix', 'Catégorie', 'Description (AR)', 'Description (FR)', 'Image'];
    let csvContent = headers.join(',') + '\n';
    
    productsSnapshot.forEach(doc => {
        const product = doc.data();
        const row = [
            doc.id,
            '"' + (product.name?.ar || '').replace(/"/g, '""') + '"',
            '"' + (product.name?.fr || '').replace(/"/g, '""') + '"',
            product.price || 0,
            product.category || '',
            '"' + (product.description?.ar || '').replace(/"/g, '""') + '"',
            '"' + (product.description?.fr || '').replace(/"/g, '""') + '"',
            product.image || ''
        ];
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

// Télécharger un fichier CSV
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

// Exporter un rapport complet
function exportAnalyticsReport() {
    try {
        const reportContent = generateAnalyticsReport();
        downloadCSV(reportContent, 'rapport_analytics_' + new Date().toISOString().split('T')[0] + '.csv');
        showSuccess('Rapport d\'analyse exporté !');
    } catch (error) {
        showError('Erreur lors de l\'export : ' + error.message);
    }
}

// Générer le rapport d'analyse
function generateAnalyticsReport() {
    const timeRange = document.getElementById('analyticsTimeRange').value;
    const monthlyOrders = document.getElementById('monthlyOrders').textContent;
    const monthlyRevenue = document.getElementById('monthlyRevenue').textContent;
    const growthRate = document.getElementById('growthRate').textContent;
    
    let reportContent = 'RAPPORT D\'ANALYSE - RANIA SHOP\n';
    reportContent += '=====================================\n';
    reportContent += `Période: ${timeRange} derniers jours\n`;
    reportContent += `Date du rapport: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    reportContent += 'STATISTIQUES GÉNÉRALES\n';
    reportContent += '----------------------\n';
    reportContent += `Commandes ce mois,${monthlyOrders}\n`;
    reportContent += `Revenus ce mois,${monthlyRevenue}\n`;
    reportContent += `Taux de croissance,${growthRate}\n\n`;
    
    return reportContent;
}

// Exposer les nouvelles fonctions au scope global
window.deleteOrder = deleteOrder;
window.deleteSelectedOrders = deleteSelectedOrders;
window.toggleSelectAllOrders = toggleSelectAllOrders;
window.toggleOrderSelection = toggleOrderSelection;
window.removeAdmin = removeAdmin;
window.loadAdvancedAnalytics = loadAdvancedAnalytics;
window.exportOrdersCSV = exportOrdersCSV;
window.exportProductsCSV = exportProductsCSV;
window.exportAnalyticsReport = exportAnalyticsReport;/
/ Fonction pour configurer les event listeners des nouvelles fonctionnalités
function setupNewFeatureListeners() {
    // Gestion des commandes - Sélection
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAllOrders);
    }

    const selectAllBtn = document.getElementById('selectAllOrders');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAllOrders);
    }

    const deleteSelectedBtn = document.getElementById('deleteSelectedOrders');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedOrders);
    }

    const exportOrdersBtn = document.getElementById('exportOrders');
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', exportOrdersCSV);
    }

    // Gestion du compte admin
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }

    const changeEmailForm = document.getElementById('changeEmailForm');
    if (changeEmailForm) {
        changeEmailForm.addEventListener('submit', handleChangeEmail);
    }

    const addAdminForm = document.getElementById('addAdminForm');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', handleAddAdmin);
    }

    // Statistiques avancées
    const refreshAnalyticsBtn = document.getElementById('refreshAnalytics');
    if (refreshAnalyticsBtn) {
        refreshAnalyticsBtn.addEventListener('click', loadAdvancedAnalytics);
    }

    const analyticsTimeRange = document.getElementById('analyticsTimeRange');
    if (analyticsTimeRange) {
        analyticsTimeRange.addEventListener('change', loadAdvancedAnalytics);
    }

    // Export des données
    const exportOrdersCSVBtn = document.getElementById('exportOrdersCSV');
    if (exportOrdersCSVBtn) {
        exportOrdersCSVBtn.addEventListener('click', exportOrdersCSV);
    }

    const exportProductsCSVBtn = document.getElementById('exportProductsCSV');
    if (exportProductsCSVBtn) {
        exportProductsCSVBtn.addEventListener('click', exportProductsCSV);
    }

    const exportAnalyticsBtn = document.getElementById('exportAnalyticsReport');
    if (exportAnalyticsBtn) {
        exportAnalyticsBtn.addEventListener('click', exportAnalyticsReport);
    }
}

// Fonction pour charger les données spécifiques à chaque section
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
            loadAdvancedAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Fonction pour charger les données du compte
function loadAccountData() {
    // Charger l'email actuel
    const currentEmailInput = document.getElementById('currentEmail');
    if (currentEmailInput && currentUser) {
        currentEmailInput.value = currentUser.email;
    }

    // Charger la liste des administrateurs
    loadAdminUsers();
}

// Mettre à jour la fonction handleNavigation pour inclure les nouvelles sections
const originalHandleNavigation = handleNavigation;
handleNavigation = function(e) {
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
    
    const sectionElement = document.getElementById(sectionName + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        products: 'Gestion des Produits',
        orders: 'Gestion des Commandes',
        account: 'Mon Compte',
        analytics: 'Statistiques Avancées',
        settings: 'Paramètres'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || sectionName;

    // Load section data
    loadSectionData(sectionName);
};

console.log('✅ Nouvelles fonctionnalités admin chargées avec succès !');