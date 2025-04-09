// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav ul');
const faqQuestions = document.querySelectorAll('.faq-question');
const filterButtons = document.querySelectorAll('.filter-btn');
const testimonialSlides = document.querySelectorAll('.testimonial');
const prevButton = document.querySelector('.slider-prev');
const nextButton = document.querySelector('.slider-next');
const exitPopup = document.getElementById('exit-popup');
const closePopupBtn = document.querySelector('.close-btn');
const popupForm = document.getElementById('exit-popup-form');
const collectionContainer = document.getElementById('collection-container');
const ctaButtons = document.querySelectorAll('.cta-button, .nav-cta');
const pricingTabs = document.querySelectorAll('.pricing-tab');
const newsletterForm = document.getElementById('newsletter-form');
const header = document.querySelector('header');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('show');
    mobileMenuBtn.innerHTML = nav.classList.contains('show') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// FAQ Accordion
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const isActive = question.classList.contains('active');
        
        // Close all other items
        faqQuestions.forEach(q => {
            q.classList.remove('active');
            q.nextElementSibling.style.maxHeight = null;
        });
        
        // Open current if it was closed
        if (!isActive) {
            question.classList.add('active');
            const answer = question.nextElementSibling;
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// Collection Filtering
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter collections
        const filter = button.dataset.filter;
        loadCollections(filter);
    });
});

// Testimonial Slider
let currentSlide = 0;
const sliderDotsContainer = document.querySelector('.slider-dots');

// Create dots
testimonialSlides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showSlide(index));
    sliderDotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.slider-dot');

function showSlide(index) {
    testimonialSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
}

prevButton.addEventListener('click', () => {
    let newIndex = currentSlide - 1;
    if (newIndex < 0) newIndex = testimonialSlides.length - 1;
    showSlide(newIndex);
});

nextButton.addEventListener('click', () => {
    let newIndex = currentSlide + 1;
    if (newIndex >= testimonialSlides.length) newIndex = 0;
    showSlide(newIndex);
});

// Auto-rotate testimonials
setInterval(() => {
    let newIndex = currentSlide + 1;
    if (newIndex >= testimonialSlides.length) newIndex = 0;
    showSlide(newIndex);
}, 7000);

// Exit Intent Popup
let mouseY = 0;
let popupShown = false;

document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && e.clientY - mouseY <= 0 && !popupShown) {
        // Only show if not shown before (or based on your logic)
        if (!localStorage.getItem('popupShown')) {
            exitPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            popupShown = true;
        }
    }
});

document.addEventListener('mousemove', (e) => {
    mouseY = e.clientY;
});

closePopupBtn.addEventListener('click', () => {
    exitPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
    localStorage.setItem('popupShown', 'true');
});

popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    
    // Save to Firebase
    const subscribersRef = firebase.database().ref('subscribers');
    subscribersRef.push({
        email: email,
        source: 'exit_popup',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        exitPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        localStorage.setItem('popupShown', 'true');
        
        // Redirect to collections with discount parameter
        window.location.href = '#collections?discount=25';
    }).catch(error => {
        console.error('Error saving subscriber:', error);
        alert('There was an error. Please try again.');
    });
});

// Pricing Tabs
pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        pricingTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // In a real implementation, you would switch pricing plans here
    });
});

// Newsletter Subscription
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const consent = e.target.querySelector('input[type="checkbox"]').checked;
    
    if (!consent) {
        alert('Please agree to our privacy policy');
        return;
    }
    
    // Save to Firebase
    const subscribersRef = firebase.database().ref('subscribers');
    subscribersRef.push({
        email: email,
        source: 'newsletter',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        alert('Thank you for subscribing! You will receive our next newsletter soon.');
        e.target.reset();
    }).catch(error => {
        console.error('Error saving subscriber:', error);
        alert('There was an error. Please try again.');
    });
});

// Load Collections from Firebase
function loadCollections(filter = 'all') {
    collectionContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    const collectionsRef = firebase.database().ref('collections');
    
    collectionsRef.once('value').then(snapshot => {
        const collections = snapshot.val();
        collectionContainer.innerHTML = '';
        
        Object.keys(collections).forEach(key => {
            const collection = collections[key];
            
            // Apply filter
            if (filter === 'all' || collection.category === filter) {
                const collectionCard = document.createElement('div');
                collectionCard.className = 'collection-card';
                collectionCard.dataset.category = collection.category;
                
                collectionCard.innerHTML = `
                    <div class="collection-image">
                        <img src="${collection.image}" alt="${collection.title}">
                        ${collection.badge ? `<span class="collection-badge">${collection.badge}</span>` : ''}
                    </div>
                    <div class="collection-info">
                        <span class="collection-category">${collection.category}</span>
                        <h3 class="collection-title">${collection.title}</h3>
                        <p class="collection-description">${collection.description}</p>
                        <div class="collection-stats">
                            <div class="collection-stat">
                                <i class="fas fa-star"></i>
                                <span>${collection.rating}</span>
                            </div>
                            <div class="collection-stat">
                                <i class="fas fa-download"></i>
                                <span>${collection.downloads}+</span>
                            </div>
                            <div class="collection-stat">
                                <i class="fas fa-file-alt"></i>
                                <span>${collection.promptCount} prompts</span>
                            </div>
                        </div>
                        <div class="collection-price">
                            ${collection.originalPrice ? `<span class="original-price">$${collection.originalPrice}</span>` : ''}
                            <span class="price">$${collection.price}</span>
                            <button class="cta-button buy-now" data-id="${key}">Buy Now</button>
                        </div>
                    </div>
                `;
                
                collectionContainer.appendChild(collectionCard);
            }
        });
        
        // Add event listeners to buy buttons
        document.querySelectorAll('.buy-now').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.target.dataset.id;
                startCheckout(collectionId);
            });
        });
        
        // If no collections match the filter
        if (collectionContainer.children.length === 0) {
            collectionContainer.innerHTML = '<p class="no-results">No collections found in this category. Check back soon!</p>';
        }
        
        // Apply discount if present in URL
        const urlParams = new URLSearchParams(window.location.search);
        const discount = urlParams.get('discount');
        if (discount) {
            document.querySelectorAll('.price').forEach(priceEl => {
                const originalPrice = parseFloat(priceEl.textContent.replace('$', ''));
                const discountedPrice = originalPrice * (1 - discount/100);
                priceEl.textContent = `$${discountedPrice.toFixed(2)}`;
                
                // Add original price if not already present
                if (!priceEl.previousElementSibling.classList.contains('original-price')) {
                    const originalPriceEl = document.createElement('span');
                    originalPriceEl.className = 'original-price';
                    originalPriceEl.textContent = `$${originalPrice.toFixed(2)}`;
                    priceEl.parentNode.insertBefore(originalPriceEl, priceEl);
                }
            });
        }
    }).catch(error => {
        console.error('Error loading collections:', error);
        collectionContainer.innerHTML = '<p class="error">Error loading collections. Please try again later.</p>';
    });
}

// Start Checkout Process
function startCheckout(collectionId) {
    // Track the checkout initiation
    if (typeof firebase !== 'undefined' && firebase.analytics) {
        firebase.analytics().logEvent('begin_checkout', {
            collection_id: collectionId
        });
    }
    
    // Redirect to checkout page with the collection ID
    window.location.href = `checkout/checkout.html?id=${collectionId}`;
}

// Header Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Initialize Firebase and load all collections when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase (config is in firebase-config.js)
    if (typeof firebase !== 'undefined') {
        firebase.analytics();
        
        // Load collections
        loadCollections();
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('show');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update URL without page reload
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    location.hash = targetId;
                }
            }
        });
    });
    
    // Initialize header state
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
});
