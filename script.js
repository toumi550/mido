// Global Variables
let cart = [];
let products = [];
let currentProduct = null;
let currentLanguage = 'ar';
let searchTimeout;

// Language translations
const translations = {
    ar: {
        home: 'الرئيسية',
        hair: 'شعر',
        makeup: 'مكياج',
        skincare: 'عناية',
        lenses: 'عدسات',
        clothing: 'ملابس',
        cart: 'السلة',
        heroTitle: 'رانيا شوب',
        heroSubtitle: 'بوتيك إلكتروني للجمال والأزياء',
        heroDescription: 'اكتشفي عالم الجمال والأناقة مع مجموعتنا المتنوعة من منتجات العناية والأزياء',
        shopNow: 'تسوقي الآن',
        ourProducts: 'منتجاتنا',
        chooseFromCollection: 'اختاري من مجموعتنا المتنوعة',
        all: 'الكل',
        quickView: 'عرض سريع',
        addToCart: 'إضافة للسلة',
        shoppingCart: 'سلة التسوق',
        emptyCart: 'سلة التسوق فارغة',
        subtotal: 'المجموع الفرعي:',
        delivery: 'التوصيل:',
        total: 'المجموع الكلي:',
        checkout: 'إتمام الطلب',
        fullName: 'الاسم الكامل *',
        phone: 'رقم الهاتف *',
        address: 'العنوان الكامل *',
        wilaya: 'الولاية *',
        selectWilaya: 'اختر الولاية',
        deliveryType: 'نوع التوصيل *',
        selectDeliveryType: 'اختر نوع التوصيل',
        homeDelivery: 'توصيل للمنزل',
        stopdesk: 'StopDesk',
        comments: 'ملاحظات (اختياري)',
        confirmOrder: 'تأكيد الطلب',
        orderSuccess: 'تم إرسال طلبك بنجاح!',
        contactSoon: 'سيتم التواصل معك قريباً لتأكيد الطلب',
        ok: 'حسناً',
        productAdded: 'تم إضافة المنتج للسلة!',
        currency: 'دج',
        searchPlaceholder: 'البحث عن المنتجات...',
        noResults: 'لا توجد نتائج',
        searchResults: 'نتائج البحث'
    },
    fr: {
        home: 'Accueil',
        hair: 'Cheveux',
        makeup: 'Maquillage',
        skincare: 'Soins',
        lenses: 'Lentilles',
        clothing: 'Vêtements',
        cart: 'Panier',
        heroTitle: 'Rania Shop',
        heroSubtitle: 'Boutique en ligne de beauté et mode',
        heroDescription: 'Découvrez le monde de la beauté et de l\'élégance avec notre collection variée de produits de soins et de mode',
        shopNow: 'Acheter maintenant',
        ourProducts: 'Nos Produits',
        chooseFromCollection: 'Choisissez parmi notre collection variée',
        all: 'Tous',
        quickView: 'Aperçu rapide',
        addToCart: 'Ajouter au panier',
        shoppingCart: 'Panier d\'achat',
        emptyCart: 'Le panier est vide',
        subtotal: 'Sous-total:',
        delivery: 'Livraison:',
        total: 'Total:',
        checkout: 'Commander',
        fullName: 'Nom complet *',
        phone: 'Numéro de téléphone *',
        address: 'Adresse complète *',
        wilaya: 'Wilaya *',
        selectWilaya: 'Choisir la wilaya',
        deliveryType: 'Type de livraison *',
        selectDeliveryType: 'Choisir le type de livraison',
        homeDelivery: 'Livraison à domicile',
        stopdesk: 'StopDesk',
        comments: 'Commentaires (optionnel)',
        confirmOrder: 'Confirmer la commande',
        orderSuccess: 'Votre commande a été envoyée avec succès!',
        contactSoon: 'Nous vous contacterons bientôt pour confirmer la commande',
        ok: 'OK',
        productAdded: 'Produit ajouté au panier!',
        currency: 'DA',
        searchPlaceholder: 'Rechercher des produits...',
        noResults: 'Aucun résultat trouvé',
        searchResults: 'Résultats de recherche'
    }
};

// Delivery Prices Data
const deliveryPrices = {
    'الجزائر': { home: 500, stopdesk: 350 },
    'وهران': { home: 600, stopdesk: 400 },
    'قسنطينة': { home: 700, stopdesk: 500 },
    'عنابة': { home: 800, stopdesk: 600 },
    'باتنة': { home: 900, stopdesk: 700 },
    'سطيف': { home: 800, stopdesk: 600 },
    'سيدي بلعباس': { home: 700, stopdesk: 500 },
    'بسكرة': { home: 900, stopdesk: 700 },
    'تلمسان': { home: 700, stopdesk: 500 },
    'ورقلة': { home: 1000, stopdesk: 800 },
    'بجاية': { home: 700, stopdesk: 500 },
    'تيزي وزو': { home: 600, stopdesk: 400 },
    'الشلف': { home: 600, stopdesk: 400 },
    'جيجل': { home: 800, stopdesk: 600 },
    'مستغانم': { home: 700, stopdesk: 500 },
    'المدية': { home: 600, stopdesk: 400 },
    'معسكر': { home: 700, stopdesk: 500 },
    'البويرة': { home: 600, stopdesk: 400 },
    'تيارت': { home: 800, stopdesk: 600 },
    'بشار': { home: 1200, stopdesk: 1000 },
    'الأغواط': { home: 900, stopdesk: 700 },
    'غرداية': { home: 1000, stopdesk: 800 },
    'الوادي': { home: 1100, stopdesk: 900 },
    'سكيكدة': { home: 800, stopdesk: 600 },
    'خنشلة': { home: 1000, stopdesk: 800 },
    'سوق أهراس': { home: 900, stopdesk: 700 },
    'تبسة': { home: 1000, stopdesk: 800 },
    'أم البواقي': { home: 800, stopdesk: 600 },
    'برج بوعريريج': { home: 700, stopdesk: 500 },
    'الطارف': { home: 900, stopdesk: 700 },
    'تندوف': { home: 1600, stopdesk: 1400 },
    'الجلفة': { home: 800, stopdesk: 600 },
    'عين الدفلى': { home: 600, stopdesk: 400 },
    'النعامة': { home: 1000, stopdesk: 800 },
    'عين تموشنت': { home: 700, stopdesk: 500 },
    'غليزان': { home: 700, stopdesk: 500 },
    'تيسمسيلت': { home: 800, stopdesk: 600 },
    'ميلة': { home: 800, stopdesk: 600 },
    'عين البيضاء': { home: 900, stopdesk: 700 },
    'الباليدة': { home: 500, stopdesk: 350 },
    'رليزان': { home: 700, stopdesk: 500 },
    'تيبازة': { home: 500, stopdesk: 350 },
    'المسيلة': { home: 800, stopdesk: 600 },
    'أدرار': { home: 1400, stopdesk: 1200 },
    'الأبيض سيدي الشيخ': { home: 1000, stopdesk: 800 },
    'تمنراست': { home: 1600, stopdesk: 1400 },
    'إليزي': { home: 1600, stopdesk: 1400 }
};

// Sample Products Data
const sampleProducts = [
    {
        id: 1,
        name: {
            ar: 'شامبو مغذي للشعر',
            fr: 'Shampooing nourrissant'
        },
        price: 2500,
        category: 'hair',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'شامبو مغذي ومرطب للشعر الجاف والتالف، يحتوي على زيوت طبيعية',
            fr: 'Shampooing nourrissant et hydratant pour cheveux secs et abîmés, contient des huiles naturelles'
        }
    },
    {
        id: 2,
        name: {
            ar: 'أحمر شفاه مات',
            fr: 'Rouge à lèvres mat'
        },
        price: 1800,
        category: 'makeup',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'أحمر شفاه بتركيبة مات طويلة الثبات، متوفر بألوان متعددة',
            fr: 'Rouge à lèvres mat longue tenue, disponible en plusieurs couleurs'
        }
    },
    {
        id: 3,
        name: {
            ar: 'كريم مرطب للوجه',
            fr: 'Crème hydratante visage'
        },
        price: 3200,
        category: 'skincare',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'كريم مرطب يومي للوجه، مناسب لجميع أنواع البشرة',
            fr: 'Crème hydratante quotidienne pour le visage, convient à tous types de peau'
        }
    },
    {
        id: 4,
        name: {
            ar: 'عدسات ملونة زرقاء',
            fr: 'Lentilles colorées bleues'
        },
        price: 4500,
        category: 'lenses',
        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'عدسات لاصقة ملونة باللون الأزرق، آمنة ومريحة',
            fr: 'Lentilles de contact colorées bleues, sûres et confortables'
        }
    },
    {
        id: 5,
        name: {
            ar: 'فستان أنيق وردي',
            fr: 'Robe élégante rose'
        },
        price: 8500,
        category: 'clothing',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'فستان أنيق ومريح، مناسب للمناسبات الخاصة',
            fr: 'Robe élégante et confortable, parfaite pour les occasions spéciales'
        }
    },
    {
        id: 6,
        name: {
            ar: 'ماسكارا مقاومة للماء',
            fr: 'Mascara waterproof'
        },
        price: 2200,
        category: 'makeup',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'ماسكارا مقاومة للماء تمنح الرموش كثافة وطولاً طبيعياً',
            fr: 'Mascara waterproof qui donne volume et longueur naturelle aux cils'
        }
    },
    {
        id: 7,
        name: {
            ar: 'زيت الأرغان للشعر',
            fr: 'Huile d\'argan cheveux'
        },
        price: 3800,
        category: 'hair',
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'زيت الأرغان الطبيعي لتغذية وترطيب الشعر',
            fr: 'Huile d\'argan naturelle pour nourrir et hydrater les cheveux'
        }
    },
    {
        id: 8,
        name: {
            ar: 'سيروم فيتامين سي',
            fr: 'Sérum vitamine C'
        },
        price: 4200,
        category: 'skincare',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=300&fit=crop&crop=center',
        description: {
            ar: 'سيروم فيتامين سي لإشراق البشرة ومحاربة علامات التقدم في السن',
            fr: 'Sérum vitamine C pour éclaircir la peau et lutter contre les signes de l\'âge'
        }
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Load language preference
    const savedLanguage = localStorage.getItem('raniaShopLanguage') || 'ar';
    changeLanguage(savedLanguage);

    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 2000);

    // Load products from Firebase or fallback to sample data
    loadProductsFromFirebase();

    // Setup event listeners
    setupEventListeners();

    // Setup sidebar auto-hide
    setupSidebarAutoHide();

    // Load cart from localStorage
    loadCartFromStorage();

    // Setup smooth scrolling
    setupSmoothScrolling();

    // Populate wilaya dropdown
    populateWilayaDropdown();
}

function hideLoadingScreen() {
    try {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('Loading screen hidden');
            }, 500);
        }
    } catch (error) {
        console.error('Error hiding loading screen:', error);
    }
}

// Load products from Firebase
async function loadProductsFromFirebase() {
    // Always start with sample products to ensure site works
    products = [...sampleProducts];
    displayProducts(products);
    console.log('Sample products loaded as fallback');

    try {
        // Check if Firebase is available
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.log('Firebase not available, keeping sample products');
            return;
        }

        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to load from Firebase
        const productsSnapshot = await firebase.firestore()
            .collection('products')
            .orderBy('createdAt', 'desc')
            .get();

        if (!productsSnapshot.empty) {
            products = [];
            productsSnapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            displayProducts(products);
            console.log(`Loaded ${products.length} products from Firebase`);

            // Setup real-time listener for product updates
            setupProductsListener();
        } else {
            console.log('No products in Firebase, initializing with default products');
            await initializeFirebaseWithDefaultProducts();
            // Try loading again after initialization
            const newSnapshot = await firebase.firestore()
                .collection('products')
                .orderBy('createdAt', 'desc')
                .get();

            if (!newSnapshot.empty) {
                products = [];
                newSnapshot.forEach(doc => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                displayProducts(products);
                setupProductsListener();
                console.log(`Initialized and loaded ${products.length} products from Firebase`);
            }
        }

    } catch (error) {
        console.error('Error loading products from Firebase:', error);
        console.log('Keeping sample products as fallback');
        // Products already set to sampleProducts above
    }
}

// Initialize Firebase with default products
async function initializeFirebaseWithDefaultProducts() {
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
        console.log('Default products initialized in Firebase');
    } catch (error) {
        console.error('Error initializing default products:', error);
    }
}

// Setup real-time listener for products
function setupProductsListener() {
    try {
        firebase.firestore().collection('products').onSnapshot((snapshot) => {
            products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            displayProducts(products);
            console.log('Products updated in real-time');
        }, (error) => {
            console.error('Error in products listener:', error);
        });
    } catch (error) {
        console.error('Error setting up products listener:', error);
    }
}

// Display products
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    if (!productsToShow || productsToShow.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products available</p>';
        return;
    }

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Add animation to product cards
    const cards = productsGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Create product card
function createProductCard(product) {
    const t = translations[currentLanguage];
    const productName = typeof product.name === 'object' ? product.name[currentLanguage] : product.name;
    const productDescription = typeof product.description === 'object' ? product.description[currentLanguage] : product.description;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${productName}" loading="lazy">
            <div class="product-overlay">
                <button class="btn-quick-view" onclick="openProductModal('${product.id}')">
                    <i class="fas fa-eye"></i>
                    ${t.quickView}
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${productName}</h3>
            <p class="product-description">${productDescription}</p>
            <div class="product-price">${product.price} ${t.currency}</div>
            <button class="btn-add-to-cart" onclick="addToCart('${product.id}')">
                <i class="fas fa-shopping-cart"></i>
                ${t.addToCart}
            </button>
        </div>
    `;
    return card;
}

// Add to cart function
function addToCart(productId, quantity = 1) {
    // Convert productId to string for Firebase compatibility
    const id = String(productId);
    const product = products.find(p => String(p.id) === id);

    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const existingItem = cart.find(item => String(item.id) === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();

    // Show success animation
    showAddToCartAnimation();

    // Show success message
    const t = translations[currentLanguage];
    const productName = typeof product.name === 'object' ? product.name[currentLanguage] : product.name;
    showNotification(`${productName} ${t.productAdded}`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Open product modal
function openProductModal(productId) {
    // Convert productId to string for Firebase compatibility
    const id = String(productId);
    const product = products.find(p => String(p.id) === id);

    if (!product) {
        console.error('Product not found for modal:', productId);
        return;
    }

    currentProduct = product;
    const modal = document.getElementById('productModal');
    if (!modal) return;

    const t = translations[currentLanguage];

    // Get translated product details
    const productName = typeof product.name === 'object' ? product.name[currentLanguage] : product.name;
    const productDescription = typeof product.description === 'object' ? product.description[currentLanguage] : product.description;

    const modalImage = document.getElementById('modalProductImage');
    const modalName = document.getElementById('modalProductName');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalDescription = document.getElementById('modalProductDescription');

    if (modalImage) modalImage.src = product.image;
    if (modalName) modalName.textContent = productName;
    if (modalPrice) modalPrice.textContent = `${product.price} ${t.currency}`;
    if (modalDescription) modalDescription.textContent = productDescription;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const t = translations[currentLanguage];

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">${t.emptyCart}</p>`;
        if (cartSubtotal) cartSubtotal.textContent = `0 ${t.currency}`;
        return;
    }

    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemName = typeof item.name === 'object' ? item.name[currentLanguage] : item.name;
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${itemName}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${itemName}</h4>
                <div class="cart-item-price">${item.price} ${t.currency}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-total">${itemTotal} ${t.currency}</div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    if (cartSubtotal) cartSubtotal.textContent = `${subtotal} ${t.currency}`;
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Remove from cart
function removeFromCart(productId) {
    const id = String(productId);
    cart = cart.filter(item => String(item.id) !== id);
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
}

// Update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    const id = String(productId);
    const item = cart.find(item => String(item.id) === id);

    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            updateCartCount();
            saveCartToStorage();
        }
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('raniaShopCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('raniaShopCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
        updateCartCount();
    }
}

// Toggle cart
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
    }
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('raniaShopLanguage', lang);

    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Update language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update all translatable elements
    updateTranslations();

    // Refresh products display
    displayProducts(products);

    // Update cart display
    updateCartDisplay();
}

// Update translations
function updateTranslations() {
    const t = translations[currentLanguage];

    // Update navigation
    const navItems = document.querySelectorAll('[data-translate]');
    navItems.forEach(item => {
        const key = item.dataset.translate;
        if (t[key]) {
            item.textContent = t[key];
        }
    });

    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    const shopNowBtn = document.querySelector('.shop-now-btn');

    if (heroTitle) heroTitle.textContent = t.heroTitle;
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    if (heroDescription) heroDescription.textContent = t.heroDescription;
    if (shopNowBtn) shopNowBtn.textContent = t.shopNow;

    // Update section titles
    const sectionTitle = document.querySelector('#products .section-title');
    const sectionSubtitle = document.querySelector('#products .section-subtitle');

    if (sectionTitle) sectionTitle.textContent = t.ourProducts;
    if (sectionSubtitle) sectionSubtitle.textContent = t.chooseFromCollection;

    // Update search placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Language switchers
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            changeLanguage(lang);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e.target.value);
            }, 300);
        });
    }

    // Category filters
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            filterByCategory(category);
        });
    });

    // Cart toggle
    const cartToggle = document.getElementById('cartToggle');
    if (cartToggle) {
        cartToggle.addEventListener('click', toggleCart);
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmission);
    }
}

// Handle search
function handleSearch(query) {
    if (!query.trim()) {
        displayProducts(products);
        return;
    }

    const filteredProducts = searchProducts(query);
    displayProducts(filteredProducts);
}

// Search products
function searchProducts(query) {
    if (!query.trim()) return products;

    const searchTerm = query.toLowerCase().trim();

    return products.filter(product => {
        const productName = typeof product.name === 'object' ? product.name[currentLanguage] : product.name;
        const productDescription = typeof product.description === 'object' ? product.description[currentLanguage] : product.description;

        return productName.toLowerCase().includes(searchTerm) ||
            productDescription.toLowerCase().includes(searchTerm);
    });
}

// Filter by category
function filterByCategory(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }

    // Update active filter
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.classList.toggle('active', filter.dataset.category === category);
    });
}

// Show add to cart animation
function showAddToCartAnimation() {
    // Simple animation - you can enhance this
    const cartIcon = document.getElementById('cartToggle');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
}

// Setup sidebar auto-hide
function setupSidebarAutoHide() {
    const sidebar = document.querySelector('.sidebar-menu');
    const footer = document.querySelector('footer');

    if (!sidebar || !footer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                sidebar.classList.add('hide-on-footer');
            } else {
                sidebar.classList.remove('hide-on-footer');
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(footer);
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 120;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 120;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Populate wilaya dropdown
function populateWilayaDropdown() {
    const wilayaSelect = document.getElementById('wilaya');
    if (!wilayaSelect) return;

    // Clear existing options except the first one
    wilayaSelect.innerHTML = '<option value="">اختر الولاية</option>';

    // Add all wilayas
    Object.keys(deliveryPrices).forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        wilayaSelect.appendChild(option);
    });
}

// Handle checkout submission
function handleCheckoutSubmission(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const orderData = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        wilaya: formData.get('wilaya'),
        deliveryType: formData.get('deliveryType'),
        comments: formData.get('comments'),
        items: cart,
        total: calculateTotal(),
        timestamp: new Date().toISOString()
    };

    // Save order to Firebase if available
    saveOrderToFirebase(orderData);

    // Show success message
    showOrderSuccess();

    // Clear cart
    cart = [];
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
}

// Save order to Firebase
async function saveOrderToFirebase(orderData) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            await firebase.firestore().collection('orders').add(orderData);
            console.log('Order saved to Firebase');
        }
    } catch (error) {
        console.error('Error saving order to Firebase:', error);
    }
}

// Show order success
function showOrderSuccess() {
    const t = translations[currentLanguage];
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        alert(t.orderSuccess + ' ' + t.contactSoon);
    }
}

// Calculate total
function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const wilaya = document.getElementById('wilaya')?.value;
    const deliveryType = document.getElementById('deliveryType')?.value;

    let deliveryPrice = 0;
    if (wilaya && deliveryType && deliveryPrices[wilaya]) {
        deliveryPrice = deliveryPrices[wilaya][deliveryType] || 0;
    }

    return subtotal + deliveryPrice;
}