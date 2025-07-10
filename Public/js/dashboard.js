class Dashboard {
    constructor() {
        this.elements = {};
        this.state = {
            currentModal: null,
            isInitialized: false,
            userData: null
        };
        
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    init() {
        if (this.state.isInitialized) return;
        this.cacheElements();
        this.bindEvents();
        this.setupTranslations();
        this.setupComingSoonFeatures();
        this.setupNavigation();
        
        // Load user data
        this.loadUserData();
        
        this.enableCarouselMouseDrag('offers-carousel');
        this.enableCarouselMouseDrag('investment-carousel');
        
        this.state.isInitialized = true;
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            // Modals
            dailyModal: document.getElementById('dailyModal'),
            rechargeModal: document.getElementById('rechargeModal'),
            modalOverlay: document.getElementById('modalOverlay'),
            
            // Toasts and notifications
            comingSoonToast: document.getElementById('comingSoonToast'),
            comingSoonPopup: document.getElementById('comingSoonPopup'),
            toast: document.getElementById('toast'),
            
            // Navigation
            navItems: document.querySelectorAll('.nav-item'),
            
            // Coming soon elements
            comingSoonElements: document.querySelectorAll('.coming-soon'),
            investmentCarousel: document.getElementById('investment-carousel'),
            
            // User data elements
            totalPoints: document.querySelector('.text-xl.font-bold'), // First one (total points)
            valueDisplay: document.querySelectorAll('.text-xl.font-bold')[1], // Second one (value)
            cardPointsDisplay: document.querySelector('[data-i18n="cardPoints"]').nextElementSibling,
            scrollPointsDisplay: document.querySelector('[data-i18n="scrollPoints"]').nextElementSibling
        };
    }

    /**
     * Load user data from API
     */
    async loadUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }

            // Show loading state
            this.updatePointsDisplay(null, true);

            const response = await this.makeApiRequest('/api/auth/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.success) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(response.error || 'Failed to load user data');
            }

            this.state.userData = response.data;
            this.updatePointsDisplay(response.data);

        } catch (error) {
            this.updatePointsDisplay(null, false, 'Error loading data');
        }
    }

    /**
     * Update points display on the dashboard
     */
    updatePointsDisplay(userData, isLoading = false, errorMessage = null) {
        if (isLoading) {
            // Show loading state
            if (this.elements.totalPoints) this.elements.totalPoints.textContent = '...';
            if (this.elements.valueDisplay) this.elements.valueDisplay.textContent = '... L.E';
            if (this.elements.cardPointsDisplay) this.elements.cardPointsDisplay.textContent = '...';
            if (this.elements.scrollPointsDisplay) this.elements.scrollPointsDisplay.textContent = '...';
            return;
        }

        if (errorMessage) {
            // Show error state
            if (this.elements.totalPoints) this.elements.totalPoints.textContent = '0';
            if (this.elements.valueDisplay) this.elements.valueDisplay.textContent = '0 L.E';
            if (this.elements.cardPointsDisplay) this.elements.cardPointsDisplay.textContent = '0';
            if (this.elements.scrollPointsDisplay) this.elements.scrollPointsDisplay.textContent = '0';
            this.showToast(errorMessage);
            return;
        }

        if (!userData) return;

        // Get points from server
        const totalPoints = userData.points || 0;
        const cardPoints = userData.cardpoints || 0;
        const scrollPoints = userData.scrollpoints || 0;
        const value = this.calculateValue(totalPoints);

        // Update display
        if (this.elements.totalPoints) {
            this.elements.totalPoints.textContent = totalPoints.toLocaleString();
        }
        
        if (this.elements.valueDisplay) {
            this.elements.valueDisplay.textContent = `${value.toLocaleString()} L.E`;
        }
        
        if (this.elements.cardPointsDisplay) {
            this.elements.cardPointsDisplay.textContent = cardPoints.toLocaleString();
        }
        
        if (this.elements.scrollPointsDisplay) {
            this.elements.scrollPointsDisplay.textContent = Math.max(0, scrollPoints).toLocaleString();
        }

        // Add smooth animation
        this.animateCounters();
    }

    /**
     * Calculate card points from cards array
     */
    calculateCardPoints(cards) {
        return cards.reduce((total, card) => {
            return total + ((card.isCharged ? card.points : 0) || 0);
        }, 0);
    }

    /**
     * Calculate value from points (you can modify this conversion rate)
     */
    calculateValue(points) {
        const conversionRate = 0.0001; 
        return points * conversionRate;
    }

    /**
     * Animate counters for smooth effect
     */
    animateCounters() {
        const counters = [
            this.elements.totalPoints,
            this.elements.cardPointsDisplay,
            this.elements.scrollPointsDisplay
        ].filter(el => el);

        counters.forEach(counter => {
            if (counter) {
                counter.style.transform = 'scale(1.05)';
                counter.style.transition = 'transform 0.2s ease';
                
                setTimeout(() => {
                    counter.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    /**
     * Refresh user data
     */
    async refreshUserData() {
        await this.loadUserData();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Modal open buttons (data-modal attribute)
        document.querySelectorAll('[data-modal]').forEach(btn => {
            const modalType = btn.getAttribute('data-modal');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(modalType);
            });
        });

        // Modal close buttons (data-modal-close attribute)
        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            const modalType = btn.getAttribute('data-modal-close');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal(modalType);
            });
        });

        // Navigation buttons (data-navigate attribute)
        document.querySelectorAll('[data-navigate]').forEach(btn => {
            const href = btn.getAttribute('data-navigate');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = href;
            });
        });

        // Action buttons (data-action attribute)
        document.querySelectorAll('[data-action]').forEach(btn => {
            const action = btn.getAttribute('data-action');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this[action]) {
                    this[action]();
                }
            });
        });

        // Coming soon elements
        document.querySelectorAll('.coming-soon').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showComingSoonToast('comingSoonFeature');
            });
        });

        // Add refresh gesture for mobile
        this.setupPullToRefresh();
    }

    /**
     * Setup pull to refresh functionality
     */
    setupPullToRefresh() {
        let startY = 0;
        let isRefreshing = false;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (isRefreshing) return;
            
            const currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 150 && window.scrollY === 0) {
                isRefreshing = true;
                this.showToast('Refreshing...');
                this.refreshUserData().finally(() => {
                    isRefreshing = false;
                });
            }
        }, { passive: true });
    }

    /**
     * Setup translations
     */
    setupTranslations() {
        if (typeof translatePage === 'function') {
            translatePage();
        }
    }

    /**
     * Setup coming soon features
     */
    setupComingSoonFeatures() {
        // Add click handlers for all coming soon elements
        this.elements.comingSoonElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showComingSoonToast('comingSoonFeature');
            });
        });

        // Setup investment carousel coming soon
        if (this.elements.investmentCarousel) {
            const carouselItems = this.elements.investmentCarousel.querySelectorAll('div');
            carouselItems.forEach(element => {
                element.addEventListener('click', () => {
                    this.showComingSoonToast('comingSoonFeature');
                });
            });
        }
    }

    /**
     * Setup navigation with active states and touch feedback
     */
    setupNavigation() {
        if (!this.elements.navItems.length) return;

        const currentPath = window.location.pathname;

        this.elements.navItems.forEach(item => {
            // Set active state based on current page
            this.setActiveNavItem(item, currentPath);
            
            // Add touch feedback
            this.addTouchFeedback(item);
            
            // Add click feedback for non-coming-soon items
            this.addClickFeedback(item);
        });
    }

    /**
     * Set active navigation item
     */
    setActiveNavItem(item, currentPath) {
        const href = item.getAttribute('href');
        
        if (href === '#') {
            if (currentPath.endsWith('dashboard.html') || currentPath === '/') {
                item.classList.add('active');
            }
        } else if (href && currentPath.endsWith(href)) {
            item.classList.add('active');
        }
    }

    /**
     * Add touch feedback to navigation items
     */
    addTouchFeedback(item) {
        item.addEventListener('touchstart', () => {
            if (!item.classList.contains('active')) {
                item.style.transform = 'scale(0.95)';
            }
        }, { passive: true });

        item.addEventListener('touchend', () => {
            if (!item.classList.contains('active')) {
                item.style.transform = '';
            }
        });
    }

    /**
     * Add click feedback to navigation items
     */
    addClickFeedback(item) {
        if (!item.classList.contains('coming-soon')) {
            item.addEventListener('click', (e) => {
                if (!item.classList.contains('active')) {
                    // Remove active class from current active item
                    const currentActive = document.querySelector('.nav-item.active');
                    if (currentActive) {
                        currentActive.classList.remove('active');
                    }
                    // Add active class to clicked item
                    item.classList.add('active');
                }
            });
        }
    }

    /**
     * Open modal by type
     */
    openModal(type) {
        const modal = document.getElementById(type + 'Modal');
        if (!modal) return;

        this.state.currentModal = type;
        modal.classList.remove('hidden');
        
        // Add animation classes if needed
        requestAnimationFrame(() => {
            modal.classList.add('opacity-100');
        });
    }

    /**
     * Close modal by type
     */
    closeModal(type) {
        const modal = document.getElementById(type + 'Modal');
        if (!modal) return;

        modal.classList.add('hidden');
        this.state.currentModal = null;
    }

    /**
     * Close modal when clicking outside
     */
    closeOnClickOutside(event) {
        const modal = document.getElementById('modalBox');
        if (modal && !modal.contains(event.target)) {
            this.closeModal();
        }
    }

    /**
     * Show coming soon toast notification
     */
    showComingSoonToast(messageKey) {
        if (!this.elements.comingSoonToast) return;

        const span = this.elements.comingSoonToast.querySelector('span');
        
        // Use translation if available
        if (typeof translations !== 'undefined') {
            const currentLang = localStorage.getItem('language') || 'en';
            const message = translations[currentLang]?.[messageKey] || 'This feature is coming soon!';
            span.textContent = message;
        }

        this.elements.comingSoonToast.classList.remove('opacity-0', 'pointer-events-none');
        this.elements.comingSoonToast.classList.add('opacity-100');

        setTimeout(() => {
            this.elements.comingSoonToast.classList.remove('opacity-100');
            this.elements.comingSoonToast.classList.add('opacity-0', 'pointer-events-none');
        }, 2000);
    }

    /**
     * Show coming soon popup
     */
    showComingSoonPopup() {
        if (!this.elements.comingSoonPopup) return;

        this.elements.comingSoonPopup.classList.remove('opacity-0', 'pointer-events-none');
        this.elements.comingSoonPopup.classList.add('opacity-100');

        setTimeout(() => {
            this.elements.comingSoonPopup.classList.remove('opacity-100');
            this.elements.comingSoonPopup.classList.add('opacity-0', 'pointer-events-none');
        }, 2000);
    }

    /**
     * Show toast notification
     */
    showToast(message) {
        if (!this.elements.toast) return;

        this.elements.toast.textContent = message;
        this.elements.toast.classList.remove('opacity-0');
        this.elements.toast.classList.add('opacity-100');

        setTimeout(() => {
            this.elements.toast.classList.remove('opacity-100');
            this.elements.toast.classList.add('opacity-0');
        }, 2000);
    }

    /**
     * Copy card code to clipboard
     */
    async copyCardCode(cardCode = 'XXXX-XXXX-XXXX-XXXX') {
        try {
            await navigator.clipboard.writeText(cardCode);
            this.showToast('Copied to clipboard!');
            if (this.state.currentModal) {
                this.closeModal(this.state.currentModal);
            }
        } catch (error) {
            this.showToast('Failed to copy to clipboard');
        }
    }

    /**
     * Claim daily card
     */
    async claimDailyCard() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to claim your daily card');
                window.location.href = '/login.html';
                return;
            }

            const response = await this.makeApiRequest('/api/cards/daily', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.success) {
                if (response.status === 401) {
                    alert('Please login to claim your daily card');
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return;
                }
                alert(response.data?.message || 'Something went wrong');
                return;
            }

            const cardCode = response.data.card.code;
            await this.copyCardCode(cardCode);
            await this.refreshUserData();
            this.closeModal('daily');
            this.showToast('Daily card copied successfully!');

        } catch (error) {
            alert('An error occurred while claiming your card');
        }
    }

    /**
     * Process recharge
     */
    async processRecharge() {
        const modal = document.getElementById('rechargeModal');
        const input = modal.querySelector('input[type="text"]');
        const cardCode = input.value.trim();
        if (!cardCode) {
            this.showToast('Please enter a card code');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            this.showToast('Please login');
            window.location.href = '/login.html';
            return;
        }
        this.showToast('Processing...');
        const response = await this.makeApiRequest('/api/cards/recharge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cardCode })
        });
        if (response.success) {
            input.value = '';
            this.showToast('Card charged successfully!');
            await this.refreshUserData();
            this.closeModal('recharge');
        } else {
            input.value = '';
            this.showToast(response.error || 'Failed to charge card');
        }
    }

    /**
     * Enable ultra-smooth, professional mouse drag-to-scroll for carousels (desktop)
     * Adds momentum/inertia for a natural feel
     */
    enableCarouselMouseDrag(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;
        let isDown = false;
        let startX;
        let scrollLeft;
        let lastX;
        let velocity = 0;
        let momentumId;
        const friction = 0.95; // Lower = more friction
        const minVelocity = 0.5;

        const preventSelection = (e) => e.preventDefault();

        function stopMomentum() {
            if (momentumId) cancelAnimationFrame(momentumId);
            momentumId = null;
        }

        function momentumScroll() {
            if (Math.abs(velocity) > minVelocity) {
                carousel.scrollLeft -= velocity;
                velocity *= friction;
                momentumId = requestAnimationFrame(momentumScroll);
            } else {
                stopMomentum();
            }
        }

        carousel.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDown = true;
            carousel.classList.add('dragging');
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            lastX = e.pageX;
            velocity = 0;
            stopMomentum();
            document.body.style.userSelect = 'none';
            document.addEventListener('selectstart', preventSelection);
        });
        carousel.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                carousel.classList.remove('dragging');
                carousel.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('selectstart', preventSelection);
                momentumScroll();
            }
        });
        carousel.addEventListener('mouseup', (e) => {
            if (isDown) {
                isDown = false;
                carousel.classList.remove('dragging');
                carousel.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('selectstart', preventSelection);
                momentumScroll();
            }
        });
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 1.1;
            velocity = e.pageX - lastX;
            lastX = e.pageX;
            carousel.scrollLeft = scrollLeft - walk;
        });
        carousel.addEventListener('mouseenter', () => {
            carousel.style.cursor = 'grab';
        });
        carousel.addEventListener('mouseleave', () => {
            if (!isDown) carousel.style.cursor = '';
        });
    }

    /**
     * Make API request with error handling
     */
    async makeApiRequest(url, options = {}) {
        try {
            const response = await fetch(`http://localhost:5000${url}`, options);
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                return {
                    success: false,
                    status: response.status,
                    data: null,
                    error: 'Invalid JSON response'
                };
            }

            return {
                success: response.ok,
                status: response.status,
                data: data,
                error: response.ok ? null : data.message || 'Request failed'
            };

        } catch (error) {
            return {
                success: false,
                status: 0,
                data: null,
                error: error.message || 'Network error'
            };
        }
    }

    /**
     * Destroy the dashboard instance
     */
    destroy() {
        // Remove event listeners if needed
        this.state.isInitialized = false;
        this.elements = {};
        this.state = { currentModal: null, isInitialized: false, userData: null };
    }
}

// Global functions for backward compatibility (if needed)
window.openModal = function(type) {
    if (window.dashboardInstance) {
        window.dashboardInstance.openModal(type);
    }
};

window.closeModal = function(type) {
    if (window.dashboardInstance) {
        window.dashboardInstance.closeModal(type);
    }
};

window.claimDailyCard = function() {
    if (window.dashboardInstance) {
        window.dashboardInstance.claimDailyCard();
    }
};

window.processRecharge = function() {
    if (window.dashboardInstance) {
        window.dashboardInstance.processRecharge();
    }
};

window.showComingSoon = function() {
    if (window.dashboardInstance) {
        window.dashboardInstance.showComingSoonPopup();
    }
};

window.refreshUserData = function() {
    if (window.dashboardInstance) {
        window.dashboardInstance.refreshUserData();
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardInstance = new Dashboard();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.dashboardInstance) {
            window.dashboardInstance = new Dashboard();
        }
    });
} else {
    window.dashboardInstance = new Dashboard();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardInstance) {
        window.dashboardInstance.destroy();
    }
});
function showToast(messageKey) {
    const toast = document.getElementById('toast');
    const currentLang = localStorage.getItem('language') || 'en';
    toast.textContent = translations[currentLang][messageKey];
    toast.classList.remove('opacity-0');
    setTimeout(() => toast.classList.add('opacity-0'), 3000);
}