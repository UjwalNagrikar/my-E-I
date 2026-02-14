// Create animated particles
const particlesContainer = document.getElementById('particles');

function createParticles() {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Smooth scrolling for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // Close mobile menu if open
                document.getElementById('navLinks').classList.remove('active');
            }
        });
    });
}

// Animate stats counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.textContent.includes('%') ? '' : '+');
        }
    };

    updateCounter();
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate stats when visible
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    document.querySelectorAll('.stat-number').forEach(el => {
        observer.observe(el);
    });
}

// Header scroll effect
function initHeaderScroll() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        
        if (window.scrollY > 100) {
            header.style.background = 'rgba(15, 23, 42, 0.98)';
            header.style.boxShadow = '0 5px 30px rgba(0,0,0,0.3)';
        } else {
            header.style.background = 'rgba(15, 23, 42, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    });
}

// Form validation
function initFormValidation() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            if (!name || !email || !message) {
                e.preventDefault();
                alert('Please fill in all required fields.');
                return false;
            }
            
            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                e.preventDefault();
                alert('Please enter a valid email address.');
                return false;
            }
        });
        
        // Real-time input validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#e2e8f0';
                }
            });
            
            input.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(239, 68, 68)') {
                    this.style.borderColor = '#e2e8f0';
                }
            });
        });
    }
}

// Active navigation link on scroll
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
}

// Close mobile menu when clicking outside
function initClickOutside() {
    document.addEventListener('click', function(e) {
        const nav = document.querySelector('nav');
        const navLinks = document.getElementById('navLinks');
        const mobileToggle = document.querySelector('.mobile-toggle');
        
        if (!nav.contains(e.target) && !mobileToggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// Parallax effect for hero section
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });
}

// Add loading animation
function initPageLoad() {
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Stagger animation for elements
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.transitionDelay = `${index * 0.1}s`;
            }, 100);
        });
    });
}

// ==========================================
// FLASH MESSAGES SYSTEM - FIXED VERSION
// ==========================================

function showFlashMessage(message, type = 'success') {
    // Get or create container
    let container = document.getElementById('flashMessages');
    if (!container) {
        console.warn('Flash messages container not found! Creating one...');
        container = document.createElement('div');
        container.id = 'flashMessages';
        container.className = 'flash-messages-container';
        document.body.appendChild(container);
    }
    
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message ${type}`;
    
    // Choose icon based on type
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'info') icon = 'ℹ';
    
    flashDiv.innerHTML = `
        <div class="flash-icon">${icon}</div>
        <div class="flash-content">${message}</div>
        <button class="flash-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(flashDiv);
    console.log('✅ Flash message displayed:', type, message);
    
    // Auto remove after 5 seconds with fade effect
    setTimeout(() => {
        if (flashDiv.parentElement) {
            flashDiv.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => flashDiv.remove(), 500);
        }
    }, 5000);
}

// Check for flash messages from URL parameters
function checkFlashMessages() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const error = urlParams.get('error');
        
        if (success) {
            const message = decodeURIComponent(success);
            console.log('🎉 Success message detected:', message);
            // Small delay to ensure DOM is ready
            setTimeout(() => showFlashMessage(message, 'success'), 100);
            // Clean URL without reloading page
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        
        if (error) {
            const message = decodeURIComponent(error);
            console.log('❌ Error message detected:', message);
            // Small delay to ensure DOM is ready
            setTimeout(() => showFlashMessage(message, 'error'), 100);
            // Clean URL without reloading page
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    } catch (e) {
        console.error('Error checking flash messages:', e);
    }
}

// Initialize all functions
function init() {
    createParticles();
    initSmoothScroll();
    initScrollAnimations();
    initHeaderScroll();
    initFormValidation();
    initActiveNavigation();
    initClickOutside();
    initParallax();
    initPageLoad();
    
    // IMPORTANT: Check for flash messages after a short delay
    setTimeout(checkFlashMessages, 50);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for external use if needed
window.toggleMenu = toggleMenu;
window.showFlashMessage = showFlashMessage;