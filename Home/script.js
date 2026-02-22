// === 1. Loader Logic ===
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 1000);
});

// === 2. Scroll Animations (Reveal) ===
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 150;

    revealElements.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger once on load
revealOnScroll();

// === 3. Header Scroll Effect & Back To Top ===
const header = document.getElementById('header');
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
        backToTopBtn.classList.add('active');
    } else {
        header.classList.remove('scrolled');
        backToTopBtn.classList.remove('active');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// === 4. Cart Logic ===
// Product data (initial client-side copy; will be refreshed from backend when available)
let products = [
    {
        id: 1,
        name: "عباية ملكية سوداء",
        price: 450,
        img: "https://picsum.photos/seed/hijab11/400/500"
    },
    {
        id: 2,
        name: "فستان ناعم بيج",
        price: 320,
        img: "https://picsum.photos/seed/dress22/400/500"
    },
    {
        id: 3,
        name: "معطف كلاسيكي رمادي",
        price: 580,
        img: "https://picsum.photos/seed/coat33/400/500"
    },
    {
        id: 4,
        name: "طقم حجاب مطرز",
        price: 150000,
        img: "https://picsum.photos/seed/scarf44/400/500"
    }
];

// Try to load products from backend API (if server is running)
fetch('/api/products')
    .then(res => {
        if (!res.ok) throw new Error('no backend');
        return res.json();
    })
    .then(data => {
        if (Array.isArray(data) && data.length) {
            products = data;
            console.log('Products loaded from backend', products);
        }
    })
    .catch(() => {
        console.log('Backend not available; using client-side product data');
    });

// Load cart from localStorage
function loadCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart counter
function updateCartCounter() {
    const cart = loadCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.querySelector('.cart-count');
    counter.innerText = totalItems;
    // Animation for counter
    counter.style.transform = "scale(1.5)";
    setTimeout(() => counter.style.transform = "scale(1)", 200);
}

function addToCart(productName) {
    const product = products.find(p => p.name === productName);
    if (!product) return;

    let cart = loadCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    updateCartCounter();

    const toast = document.getElementById('toast');
    toast.innerHTML = `<strong>${productName}</strong><br>تمت الإضافة للسلة`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);

    // Send to backend cart API (best-effort; doesn't block UX)
    if (product && product.id) {
        fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id, quantity: 1 })
        }).then(r => r.json()).then(res => {
            console.log('Server cart updated', res);
        }).catch(() => {
            // silent fail if backend not running
        });
    }
}

// Initialize cart counter on load
window.addEventListener('load', updateCartCounter);

// Update cart counter on window focus to sync across tabs
window.addEventListener('focus', updateCartCounter);

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

const form = document.getElementById('uploadForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const res = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            console.log(data.imageUrl);
        } catch (err) {
            console.warn('Upload failed (backend may be down)', err);
        }
    });
}

// === 5. Image cycling for product cards ===
function cycleImage(card, direction = 1) {
    if (!card) return;
    const img = card.querySelector('.product-image');
    if (!img) return;

    let images = [];
    try {
        images = JSON.parse(img.getAttribute('data-images') || '[]');
    } catch (e) {
        return;
    }
    if (!images.length) return;

    let current = parseInt(img.getAttribute('data-current') || '0', 10);
    current = (current + direction + images.length) % images.length;

    // simple fade while swapping and preload next image for smoothness
    img.style.transition = 'opacity 180ms ease';
    img.style.opacity = '0';
    const nextSrc = images[current];
    const tmp = new Image();
    tmp.src = nextSrc;
    tmp.onload = () => {
        setTimeout(() => {
            img.src = nextSrc;
            img.setAttribute('data-current', String(current));
            img.style.opacity = '1';
        }, 160);
    };
    tmp.onerror = () => {
        // fallback: still swap to avoid blocking
        setTimeout(() => {
            img.src = nextSrc;
            img.setAttribute('data-current', String(current));
            img.style.opacity = '1';
        }, 160);
    };
}

function initImageCyclers() {
    document.querySelectorAll('.img-cycle-btn').forEach(btn => {
        // avoid attaching multiple listeners
        if (btn.dataset._inited) return;
        btn.dataset._inited = '1';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const dir = btn.classList.contains('prev') ? -1 : 1;
            cycleImage(card, dir);
        });
    });
}

// Initialize immediately (script is loaded at end of body) and also on DOMContentLoaded
try { initImageCyclers(); } catch (e) {}
window.addEventListener('DOMContentLoaded', initImageCyclers);
window.addEventListener('load', initImageCyclers);
