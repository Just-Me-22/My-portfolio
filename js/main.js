/**
 * Main JavaScript file for portfolio website
 */

// ==================== DOM Elements ====================

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const statsLoading = document.getElementById('statsLoading');
const statsGrid = document.getElementById('statsGrid');

// ==================== Menu Toggle ====================

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ==================== Smooth Scroll ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ==================== Intersection Observer for Scroll Animations ====================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe scroll animate elements
document.querySelectorAll('.scroll-animate, .grid-item, .list-item').forEach(el => {
    observer.observe(el);
});

// ==================== GitHub Statistics ====================

async function loadGitHubStats() {
    try {
        // Fetch user profile
        const profile = await window.GitHubAPI.fetchUserProfile();
        if (!profile) {
            statsLoading.innerHTML = '<p>Unable to load GitHub data. Please try again later.</p>';
            return;
        }

        // Fetch repositories
        const repos = await window.GitHubAPI.fetchRepositories();
        if (!repos || repos.length === 0) {
            statsLoading.innerHTML = '<p>Unable to load repositories.</p>';
            return;
        }

        // Fetch events
        const events = await window.GitHubAPI.fetchRecentEvents();

        // Calculate statistics
        const totalStars = window.GitHubAPI.calculateTotalStars(repos);
        const totalContributions = window.GitHubAPI.countContributions(events);
        const languages = window.GitHubAPI.aggregateLanguages(repos);
        const featuredRepos = window.GitHubAPI.getFeaturedRepositories(repos);

        // Update DOM
        updateStatsDisplay(profile, totalStars, totalContributions);

        // Render charts and repository cards
        setTimeout(() => {
            window.ChartRenderer.createLanguageChart(languages);
            window.ChartRenderer.createLanguageList(languages);
            window.ChartRenderer.createRepositoryCards(featuredRepos);

            // Add scroll animation to new elements
            document.querySelectorAll('.list-item, .grid-item').forEach(el => {
                observer.observe(el);
            });
        }, 300);

        // Hide loading, show stats
        statsLoading.style.display = 'none';
        statsGrid.style.display = 'grid';

    } catch (error) {
        console.error('Error loading GitHub stats:', error);
        statsLoading.innerHTML = '<p>Error loading GitHub statistics. Please check back later.</p>';
    }
}

function updateStatsDisplay(profile, totalStars, totalContributions) {
    const reposCount = document.getElementById('reposCount');
    const starsCount = document.getElementById('starsCount');
    const followersCount = document.getElementById('followersCount');
    const contributionsCount = document.getElementById('contributionsCount');

    if (reposCount) {
        animateCounter(reposCount, profile.public_repos);
    }
    if (starsCount) {
        animateCounter(starsCount, totalStars);
    }
    if (followersCount) {
        animateCounter(followersCount, profile.followers);
    }
    if (contributionsCount) {
        animateCounter(contributionsCount, totalContributions);
    }
}

function animateCounter(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);

        element.textContent = window.GitHubAPI.formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

// ==================== Contact Form ====================

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate form
        if (!name || !email || !message) {
            showFormError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            showFormError('Please enter a valid email address');
            return;
        }

        // Create mailto link
        const subject = encodeURIComponent(`New message from ${name}`);
        const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
        const mailtoLink = `mailto:kkosik8@proton.me?subject=${subject}&body=${body}`;

        // Show success message
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = '✓ Message prepared';
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = '#10b981';

        // Open mail client
        window.location.href = mailtoLink;

        // Reset form after a delay
        setTimeout(() => {
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
        }, 2000);
    });
}

function showFormError(message) {
    const formNote = contactForm.querySelector('.form-note');
    const errorDiv = document.createElement('p');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    errorDiv.style.marginTop = '1rem';

    // Remove existing error
    const existingError = contactForm.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }

    contactForm.appendChild(errorDiv);

    // Remove error after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== Page Load ====================

document.addEventListener('DOMContentLoaded', () => {
    // Load GitHub statistics
    loadGitHubStats();

    // Add animation classes to elements
    addAnimationClasses();

    // Setup scroll animations
    setupScrollAnimations();

    // Setup mouse tracking glow effect for hero name
    setupMouseTrackingGlow();
});

function addAnimationClasses() {
    const hero = document.querySelector('.hero');
    const sections = document.querySelectorAll('section:not(.hero)');

    if (hero) {
        hero.style.animation = 'fadeIn 0.8s ease-out';
    }

    sections.forEach((section, index) => {
        const items = section.querySelectorAll('.stat-card, .project-card, .about-text');
        items.forEach((item, itemIndex) => {
            item.classList.add('scroll-animate');
        });
    });
}

function setupScrollAnimations() {
    // Observe all scroll-animate elements
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

// ==================== Mouse Tracking Glow Effect ====================

function setupMouseTrackingGlow() {
    const accentElement = document.querySelector('.accent');
    if (!accentElement) return;

    document.addEventListener('mousemove', (e) => {
        const rect = accentElement.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate distance from mouse to element
        const distance = Math.sqrt(
            Math.pow(mouseX - elementCenterX, 2) + Math.pow(mouseY - elementCenterY, 2)
        );

        // Calculate glow intensity based on distance (max effect within 300px)
        const maxDistance = 300;
        const intensity = Math.max(0, 1 - distance / maxDistance);

        // Update glow effect
        const baseGlow = 'rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)';
        const enhancedGlow = `rgba(59, 130, 246, ${0.3 + intensity * 0.4}), 0 0 ${20 + intensity * 30}px rgba(139, 92, 246, ${0.2 + intensity * 0.4})`;

        accentElement.style.textShadow = `0 0 ${20 + intensity * 30}px ${enhancedGlow}`;
    });
}

// ==================== Error Handling ====================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ==================== Performance Optimization ====================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==================== Console Message ====================

console.log('%c Portfolio loaded successfully!', 'color: #3b82f6; font-size: 14px; font-weight: bold;');
console.log('%c Check out the GitHub stats and featured projects above!', 'color: #6b7280; font-size: 12px;');
