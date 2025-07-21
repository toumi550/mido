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
    'أدرار': { home: 1400, stopdesk: 900 },
    'الأغواط': { home: 950, stopdesk: 600 },
    'أم البواقي': { home: 800, stopdesk: 450 },
    'باتنة': { home: 800, stopdesk: 450 },
    'بجاية': { home: 800, stopdesk: 450 },
    'بسكرة': { home: 950, stopdesk: 600 },
    'بشار': { home: 1100, stopdesk: 650 },
    'البليدة': { home: 400, stopdesk: 300 },
    'البويرة': { home: 750, stopdesk: 450 },
    'تمنراست': { home: 1600, stopdesk: 1050 },
    'تبسة': { home: 850, stopdesk: 450 },
    'تلمسان': { home: 850, stopdesk: 500 },
    'تيارت': { home: 800, stopdesk: 450 },
    'تيزي وزو': { home: 750, stopdesk: 450 },
    'الجلفة': { home: 950, stopdesk: 600 },
    'جيجل': { home: 800, stopdesk: 450 },
    'سطيف': { home: 750, stopdesk: 450 },
    'سعيدة': { home: 800, stopdesk: 500 },
    'سكيكدة': { home: 800, stopdesk: 450 },
    'سيدي بلعباس': { home: 800, stopdesk: 450 },
    'عنابة': { home: 800, stopdesk: 450 },
    'قالمة': { home: 800, stopdesk: 450 },
    'قسنطينة': { home: 800, stopdesk: 450 },
    'المدية': { home: 750, stopdesk: 450 },
    'مستغانم': { home: 800, stopdesk: 450 },
    'المسيلة': { home: 850, stopdesk: 500 },
    'معسكر': { home: 800, stopdesk: 450 },
    'ورقلة': { home: 950, stopdesk: 600 },
    'وهران': { home: 800, stopdesk: 450 },
    'البيض': { home: 1100, stopdesk: 600 },
    'إليزي': { home: 0, stopdesk: 0 },
    'برج بوعريريج': { home: 750, stopdesk: 450 },
    'بومرداس': { home: 750, stopdesk: 450 },
    'الطارف': { home: 800, stopdesk: 450 },
    'تندوف': { home: 0, stopdesk: 0 },
    'تيسمسيلت': { home: 800, stopdesk: 0 },
    'الوادي': { home: 950, stopdesk: 600 },
    'خنشلة': { home: 800, stopdesk: 0 },
    'سوق أهراس': { home: 800, stopdesk: 450 },
    'تيبازة': { home: 750, stopdesk: 450 },
    'ميلة': { home: 800, stopdesk: 450 },
    'عين الدفلى': { home: 750, stopdesk: 450 },
    'النعامة': { home: 1100, stopdesk: 600 },
    'عين تموشنت': { home: 800, stopdesk: 450 },
    'غرداية': { home: 950, stopdesk: 600 },
    'غليزان': { home: 800, stopdesk: 450 },
    'تيميمون': { home: 1400, stopdesk: 0 },
    'برج باجي مختار': { home: 0, stopdesk: 0 },
    'أولاد جلال': { home: 950, stopdesk: 600 },
    'بني عباس': { home: 1000, stopdesk: 0 },
    'عين صالح': { home: 1600, stopdesk: 0 },
    'عين قزام': { home: 1600, stopdesk: 0 },
    'تقرت': { home: 950, stopdesk: 600 },
    'جانت': { home: 0, stopdesk: 0 },
    'المغير': { home: 950, stopdesk: 0 },
    'الشلف': { home: 750, stopdesk: 450 }
};

// Sample Products Data with bilingual support
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
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load language preference
    const savedLanguage = localStorage.getItem('raniaShopLanguage') || 'ar';
    changeLanguage(savedLanguage);
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 2000);

    // Load products from Firebase or fallback to sample data
    loadProductsFromFirebase();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup sidebar auto-hide
    setupSidebarAutoHide();
    
    // Populate wilaya dropdown
    populateWilayaDropdown();
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
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
            console.log('No products in Firebase, using sample products');
        }

    } catch (error) {
        console.error('Error loading products from Firebase:', error);
        console.log('Keeping sample products as fallback');
        // Products already set to sampleProducts above
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

function setupEventListeners() {
    // Language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });

    // Search functionality
    setupSearchListeners();

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebarMenu.classList.toggle('active');
        });
    }

    // Product filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.getAttribute('data-filter');
            filterProducts(filter);
            
            // Clear search when filtering
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            hideSearchSuggestions();
        });
    });

    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            if (category && category !== 'all') {
                e.preventDefault();
                filterProducts(category);
                scrollToSection('products');
                
                // Clear search when using sidebar
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                hideSearchSuggestions();
            }
        });
    });

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmission);
    }
}

// Search Functions
function setupSearchListeners() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch(e.target.value);
        }, 300);
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            showSearchSuggestions(searchInput.value);
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });
}

function handleSearch(query) {
    if (!query.trim()) {
        displayProducts(products);
        hideSearchSuggestions();
        return;
    }

    const filteredProducts = searchProducts(query);
    displayProducts(filteredProducts);
    showSearchSuggestions(query);
}

function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();
    
    return products.filter(product => {
        const productName = typeof product.name === 'object' 
            ? product.name[currentLanguage].toLowerCase() 
            : product.name.toLowerCase();
        
        const productDescription = typeof product.description === 'object' 
            ? product.description[currentLanguage].toLowerCase() 
            : product.description.toLowerCase();

        return productName.includes(searchTerm) || 
               productDescription.includes(searchTerm) ||
               product.category.includes(searchTerm);
    });
}

function showSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer || !query.trim()) {
        hideSearchSuggestions();
        return;
    }

    const filteredProducts = searchProducts(query);
    const t = translations[currentLanguage];

    if (filteredProducts.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="suggestion-item">
                <i class="fas fa-search"></i>
                ${t.noResults}
            </div>
        `;
    } else {
        suggestionsContainer.innerHTML = filteredProducts.slice(0, 5).map(product => {
            const productName = typeof product.name === 'object' 
                ? product.name[currentLanguage] 
                : product.name;
            
            return `
                <div class="suggestion-item" onclick="selectProduct(${product.id})">
                    <i class="fas fa-search"></i>
                    ${productName} - ${product.price} ${t.currency}
                </div>
            `;
        }).join('');
    }

    suggestionsContainer.classList.add('show');
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('show');
    }
}

function selectProduct(productId) {
    hideSearchSuggestions();
    openProductModal(productId);
}

function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Add animation to product cards
    const cards = productsGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('slide-up');
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    const t = translations[currentLanguage];
    const productName = typeof product.name === 'object' ? product.name[currentLanguage] : product.name;
    const productDescription = typeof product.description === 'object' ? product.description[currentLanguage] : product.description;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${productName}">
            <div class="product-overlay">
                <button class="quick-view-btn" onclick="openProductModal(${product.id})">
                    ${t.quickView}
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${productName}</h3>
            <p class="product-price">${product.price} ${t.currency}</p>
            <p class="product-description">${productDescription}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i>
                ${t.addToCart}
            </button>
        </div>
    `;
    return card;
}

function filterProducts(category) {
    let filteredProducts;
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    displayProducts(filteredProducts);
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
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
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');

    if (!cartItems || !cartSummary) return;

    const t = translations[currentLanguage];

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>${t.emptyCart}</p>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }

    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Get translated product name
        const itemName = typeof item.name === 'object' ? item.name[currentLanguage] : item.name;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${itemName}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${itemName}</div>
                <div class="cart-item-price">${item.price} ${t.currency}</div>
            </div>
            <div class="cart-item-controls">
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" 
                           onchange="updateCartQuantity(${item.id}, parseInt(this.value))" min="1">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update summary
    const subtotalElement = document.getElementById('subtotal');
    const totalPriceElement = document.getElementById('totalPrice');

    if (subtotalElement) subtotalElement.textContent = `${subtotal} ${t.currency}`;
    if (totalPriceElement) totalPriceElement.textContent = `${subtotal} ${t.currency}`;

    cartSummary.style.display = 'block';
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.style.display = 'inline-block';
        cartCount.classList.add('bounce');
        setTimeout(() => cartCount.classList.remove('bounce'), 500);
    } else {
        cartCount.style.display = 'none';
    }
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    const t = translations[currentLanguage];

    const modalMainImage = document.getElementById('modalMainImage');
    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductDescription = document.getElementById('modalProductDescription');
    const modalQuantity = document.getElementById('modalQuantity');

    // Get translated product info
    const productName = typeof product.name === 'object' ? product.name[currentLanguage] : product.name;
    const productDescription = typeof product.description === 'object' ? product.description[currentLanguage] : product.description;

    if (modalMainImage) modalMainImage.src = product.image;
    if (modalProductName) modalProductName.textContent = productName;
    if (modalProductPrice) modalProductPrice.textContent = `${product.price} ${t.currency}`;
    if (modalProductDescription) modalProductDescription.textContent = productDescription;
    if (modalQuantity) modalQuantity.value = 1;

    const productModal = document.getElementById('productModal');
    if (productModal) productModal.style.display = 'block';
}

function addToCartFromModal() {
    if (!currentProduct) return;
    
    const modalQuantity = document.getElementById('modalQuantity');
    const quantity = modalQuantity ? parseInt(modalQuantity.value) : 1;
    addToCart(currentProduct.id, quantity);
    closeModal();
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('modalQuantity');
    if (!quantityInput) return;
    
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(1, currentValue + change);
    quantityInput.value = newValue;
}

function showCheckoutForm() {
    if (cart.length === 0) return;
    
    updateCheckoutSummary();
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) checkoutModal.style.display = 'block';
}

function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const t = translations[currentLanguage];

    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (checkoutSubtotal) checkoutSubtotal.textContent = `${subtotal} ${t.currency}`;
    if (checkoutTotal) checkoutTotal.textContent = `${subtotal} ${t.currency}`;
}

function calculateDelivery() {
    const wilayaSelect = document.getElementById('wilaya');
    const deliveryTypeSelect = document.getElementById('deliveryType');

    if (!wilayaSelect || !deliveryTypeSelect) return;

    const wilaya = wilayaSelect.value;
    const deliveryType = deliveryTypeSelect.value;
    const t = translations[currentLanguage];

    const checkoutDelivery = document.getElementById('checkoutDelivery');
    const deliveryPrice = document.getElementById('deliveryPrice');

    if (!wilaya || !deliveryType) {
        if (checkoutDelivery) checkoutDelivery.textContent = `0 ${t.currency}`;
        updateCheckoutTotal(0);
        return;
    }

    const price = deliveryPrices[wilaya] ? deliveryPrices[wilaya][deliveryType] : 0;

    if (checkoutDelivery) checkoutDelivery.textContent = `${price} ${t.currency}`;
    if (deliveryPrice) deliveryPrice.textContent = `${price} ${t.currency}`;

    updateCheckoutTotal(price);
}

function updateCheckoutTotal(deliveryPrice) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryPrice;
    const t = translations[currentLanguage];

    const checkoutTotal = document.getElementById('checkoutTotal');
    const totalPrice = document.getElementById('totalPrice');

    if (checkoutTotal) checkoutTotal.textContent = `${total} ${t.currency}`;
    if (totalPrice) totalPrice.textContent = `${total} ${t.currency}`;
}

function populateWilayaDropdown() {
    const wilayaSelect = document.getElementById('wilaya');
    if (!wilayaSelect) return;
    
    const wilayas = Object.keys(deliveryPrices).sort();
    
    wilayas.forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        wilayaSelect.appendChild(option);
    });
}

function handleCheckoutSubmission(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('customerName')?.value,
        phone: document.getElementById('customerPhone')?.value,
        address: document.getElementById('customerAddress')?.value,
        wilaya: document.getElementById('wilaya')?.value,
        deliveryType: document.getElementById('deliveryType')?.value,
        comment: document.getElementById('customerComment')?.value,
        cart: cart,
        total: document.getElementById('checkoutTotal')?.textContent
    };

    console.log('Order submitted:', formData);
    
    // Show success modal
    closeModal();
    const successModal = document.getElementById('successModal');
    if (successModal) successModal.style.display = 'block';
    
    // Clear cart
    cart = [];
    updateCartDisplay();
    updateCartCount();
    saveCartToStorage();
}

function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) successModal.style.display = 'none';
    scrollToSection('home');
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 120; // Account for search bar height
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

function showAddToCartAnimation() {
    const message = document.createElement('div');
    message.textContent = translations[currentLanguage].productAdded;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        z-index: 3000;
        font-weight: 600;
        animation: fadeInOut 2s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (document.body.contains(message)) {
            document.body.removeChild(message);
        }
    }, 2000);
}

function saveCartToStorage() {
    localStorage.setItem('raniaShopCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('raniaShopCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
            updateCartCount();
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            cart = [];
        }
    }
}

// Language Functions
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update HTML direction and lang attribute
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Update all translatable elements
    updateTranslations();
    
    // Save language preference
    localStorage.setItem('raniaShopLanguage', lang);
}

function updateTranslations() {
    const t = translations[currentLanguage];

    // Update search placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
    }

    // Update elements with data attributes
    document.querySelectorAll('[data-ar][data-fr]').forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });

    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') btn.textContent = t.all;
        else if (filter === 'hair') btn.textContent = t.hair;
        else if (filter === 'makeup') btn.textContent = t.makeup;
        else if (filter === 'skincare') btn.textContent = t.skincare;
        else if (filter === 'lenses') btn.textContent = t.lenses;
        else if (filter === 'clothing') btn.textContent = t.clothing;
    });

    // Update section titles
    const sectionTitle = document.querySelector('#products .section-title');
    if (sectionTitle) sectionTitle.textContent = t.ourProducts;

    const sectionSubtitle = document.querySelector('#products .section-subtitle');
    if (sectionSubtitle) sectionSubtitle.textContent = t.chooseFromCollection;

    // Update cart section
    const cartSectionTitle = document.querySelector('#cart .section-title');
    if (cartSectionTitle) cartSectionTitle.textContent = t.shoppingCart;

    // Update cart summary labels
    updateCartSummaryLabels(t);

    // Update form labels
    updateFormLabels(t);

    // Update modal buttons
    updateModalButtons(t);

    // Refresh product display to update translations
    displayProducts(products);

    // Update cart display to refresh translations
    updateCartDisplay();
}

function updateCartSummaryLabels(t) {
    // Update cart summary labels
    const summaryItems = document.querySelectorAll('.summary-item');
    summaryItems.forEach(item => {
        const spans = item.querySelectorAll('span');
        if (spans.length >= 2) {
            const labelText = spans[0].textContent;
            if (labelText.includes('المجموع الفرعي') || labelText.includes('Sous-total')) {
                spans[0].textContent = t.subtotal;
            } else if (labelText.includes('التوصيل') || labelText.includes('Livraison')) {
                spans[0].textContent = t.delivery;
            } else if (labelText.includes('المجموع الكلي') || labelText.includes('Total')) {
                spans[0].textContent = t.total;
            }
        }
    });

    // Update checkout button
    const checkoutBtn = document.querySelector('.checkout-btn span');
    if (checkoutBtn) checkoutBtn.textContent = t.checkout;
}

function updateFormLabels(t) {
    // Checkout form labels
    const labels = {
        'customerName': t.fullName,
        'customerPhone': t.phone,
        'customerAddress': t.address,
        'wilaya': t.wilaya,
        'deliveryType': t.deliveryType,
        'customerComment': t.comments
    };
    
    Object.keys(labels).forEach(id => {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.textContent = labels[id];
    });
    
    // Update select options
    const wilayaSelect = document.getElementById('wilaya');
    if (wilayaSelect && wilayaSelect.options[0]) {
        wilayaSelect.options[0].textContent = t.selectWilaya;
    }
    
    const deliverySelect = document.getElementById('deliveryType');
    if (deliverySelect) {
        if (deliverySelect.options[0]) deliverySelect.options[0].textContent = t.selectDeliveryType;
        if (deliverySelect.options[1]) deliverySelect.options[1].textContent = t.homeDelivery;
        if (deliverySelect.options[2]) deliverySelect.options[2].textContent = t.stopdesk;
    }
    
    // Update submit button
    const submitBtn = document.querySelector('.submit-order-btn');
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fas fa-check"></i> ${t.confirmOrder}`;
    }
    
    // Update success modal
    const successTitle = document.querySelector('#successModal h3');
    if (successTitle) successTitle.textContent = t.orderSuccess;
    
    const successText = document.querySelector('#successModal p');
    if (successText) successText.textContent = t.contactSoon;
    
    const successBtn = document.querySelector('.success-btn');
    if (successBtn) successBtn.textContent = t.ok;
}

function updateModalButtons(t) {
    // Update modal add to cart button
    const modalAddBtn = document.querySelector('.add-to-cart-btn');
    if (modalAddBtn) {
        modalAddBtn.innerHTML = `<i class="fas fa-cart-plus"></i> ${t.addToCart}`;
    }
}

// Auto-hide sidebar when footer is visible
function setupSidebarAutoHide() {
    const sidebar = document.querySelector('.sidebar-menu');
    const footer = document.querySelector('.footer');
    
    if (!sidebar || !footer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Footer is visible, hide sidebar
                sidebar.classList.add('hide-on-footer');
            } else {
                // Footer is not visible, show sidebar
                sidebar.classList.remove('hide-on-footer');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '100px 0px 0px 0px'
    });

    observer.observe(footer);
}

// Add CSS for fadeInOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
});