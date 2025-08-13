// Utility Functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
        this.setTheme(savedTheme);
        this.bindEvents();
    }

    setTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
        localStorage.setItem('portfolio-theme', theme);
        this.updateThemeIcon(theme);
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    bindEvents() {
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section');
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveLink();
    }

    bindEvents() {
        // Hamburger menu toggle
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });

        // Close mobile menu when link is clicked
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    this.scrollToSection(targetSection);
                }
                
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
            });
        });

        // Navbar scroll behavior
        let lastScrollTop = 0;
        window.addEventListener('scroll', debounce(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            
            // Update active link
            this.updateActiveLink();
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, 10));
    }

    scrollToSection(targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    updateActiveLink() {
        const scrollPosition = window.scrollY + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Typing Animation
class TypingAnimation {
    constructor(element, texts, typeSpeed = 100, deleteSpeed = 50, delayBetweenTexts = 2000) {
        this.element = element;
        this.texts = texts;
        this.typeSpeed = typeSpeed;
        this.deleteSpeed = deleteSpeed;
        this.delayBetweenTexts = delayBetweenTexts;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        this.type();
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }

        let typeSpeedCurrent = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            typeSpeedCurrent = this.delayBetweenTexts;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
        }

        setTimeout(() => this.type(), typeSpeedCurrent);
    }
}

// Intersection Observer for Animations
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Animate skill bars
                    if (entry.target.classList.contains('skill-bar')) {
                        this.animateSkillBar(entry.target);
                    }
                }
            });
        }, observerOptions);

        this.observeElements();
    }

    observeElements() {
        const elementsToObserve = [
            '.fade-in',
            '.slide-in-left',
            '.slide-in-right',
            '.skill-bar'
        ];

        elementsToObserve.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.observer.observe(element);
            });
        });
    }

    animateSkillBar(skillBar) {
        const skillFill = skillBar.querySelector('.skill-fill');
        const targetWidth = skillFill.getAttribute('data-width');
        
        setTimeout(() => {
            skillFill.style.width = targetWidth;
        }, 300);
    }
}

// Project Modal Management
class ProjectModalManager {
    constructor() {
        this.modal = document.getElementById('modal-overlay');
        this.modalContent = document.getElementById('modal-content');
        this.projects = this.getProjectData();
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(projectId) {
        const project = this.projects[projectId];
        if (!project) return;

        this.modalContent.innerHTML = this.generateModalContent(project);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    generateModalContent(project) {
        return `
            <div class="project-modal">
                <img src="${project.image}" alt="${project.title}" class="modal-image">
                <div class="modal-body">
                    <h2>${project.title}</h2>
                    <p class="project-description">${project.fullDescription}</p>
                    
                    <div class="project-details">
                        <div class="detail-section">
                            <h3>Technologies Used</h3>
                            <div class="tech-tags">
                                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Key Features</h3>
                            <ul class="feature-list">
                                ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Challenges & Solutions</h3>
                            <p>${project.challenges}</p>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <a href="${project.liveUrl}" class="btn btn-primary" target="_blank">
                            <i class="fas fa-external-link-alt"></i>
                            View Live Site
                        </a>
                        <a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">
                            <i class="fab fa-github"></i>
                            View Code
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    getProjectData() {
        return {
            1: {
                title: "E-Commerce Platform",
                image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
                fullDescription: "A comprehensive e-commerce solution built with modern web technologies. This platform provides a seamless shopping experience with advanced filtering, real-time inventory management, and secure payment processing.",
                technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API", "JWT", "Redux"],
                features: [
                    "User authentication and authorization",
                    "Product catalog with advanced search and filtering",
                    "Shopping cart and wishlist functionality",
                    "Secure payment integration with Stripe",
                    "Order tracking and history",
                    "Admin dashboard for inventory management",
                    "Responsive design for all devices"
                ],
                challenges: "The main challenge was implementing a scalable inventory system that could handle high traffic during sales events. I solved this by implementing Redis caching and optimizing database queries, resulting in 60% faster page load times.",
                liveUrl: "#",
                githubUrl: "#"
            },
            2: {
                title: "Task Management App",
                image: "https://images.pexels.com/photos/574073/pexels-photo-574073.jpeg?auto=compress&cs=tinysrgb&w=800",
                fullDescription: "A collaborative task management application designed for teams. Features real-time updates, drag-and-drop functionality, and comprehensive project tracking capabilities.",
                technologies: ["Vue.js", "Firebase", "Vuex", "CSS Grid", "PWA", "Web Sockets"],
                features: [
                    "Real-time collaboration with live updates",
                    "Drag and drop task organization",
                    "Project timeline and milestone tracking",
                    "Team member assignment and notifications",
                    "File attachment and commenting system",
                    "Progressive Web App capabilities",
                    "Offline functionality with sync"
                ],
                challenges: "Implementing real-time collaboration without conflicts was challenging. I used Firebase's real-time database with conflict resolution algorithms and optimistic updates to ensure smooth user experience.",
                liveUrl: "#",
                githubUrl: "#"
            },
            3: {
                title: "Weather Dashboard",
                image: "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=800",
                fullDescription: "An interactive weather dashboard providing detailed forecasts, weather maps, and location-based insights. Features beautiful data visualizations and personalized weather alerts.",
                technologies: ["JavaScript", "Chart.js", "OpenWeather API", "Mapbox API", "CSS3", "Local Storage"],
                features: [
                    "5-day weather forecast with hourly details",
                    "Interactive weather maps",
                    "Location-based automatic updates",
                    "Weather alerts and notifications",
                    "Historical weather data visualization",
                    "Favorite locations management",
                    "Dark/light theme support"
                ],
                challenges: "Handling multiple API calls efficiently and creating smooth animations for weather transitions. I implemented a caching strategy and used CSS transforms for performance-optimized animations.",
                liveUrl: "https://weather-dashboard.alexrodriguez.dev",
                githubUrl: "https://github.com/alexrodriguez/weather-dashboard"
            },
            4: {
                title: "Creative Portfolio",
                image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800",
                fullDescription: "An interactive portfolio website for a digital agency featuring smooth animations, modern design, and optimized performance. Built with vanilla JavaScript and advanced CSS techniques.",
                technologies: ["HTML5", "CSS3", "JavaScript", "GSAP", "Intersection Observer", "Sass", "Webpack", "Lighthouse"],
                features: [
                    "Smooth scroll animations",
                    "Interactive project showcases",
                    "Dynamic content loading",
                    "Advanced image optimization and WebP support",
                    "Performance-optimized images",
                    "Accessibility compliance (WCAG 2.1 AA)",
                    "SEO-friendly structure",
                    "Google Analytics and conversion tracking",
                    "Cross-browser compatibility",
                    "Progressive enhancement approach",
                    "Mobile-first responsive design"
                ],
                challenges: "Creating smooth 60fps animations across all devices while maintaining accessibility was challenging. I used GSAP with hardware acceleration, implemented intersection observers for performance, and added reduced motion support. The site achieved a 98 Lighthouse performance score.",
                liveUrl: "https://creative-agency.alexrodriguez.dev",
                githubUrl: "https://github.com/alexrodriguez/creative-portfolio"
            }
        };
    }
}

// Form Management
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Input validation on blur
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        if (this.validateForm(data)) {
            this.submitForm(data);
        }
    }

    validateForm(data) {
        let isValid = true;
        const fields = ['name', 'email', 'subject', 'message'];

        fields.forEach(field => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(input);

        // Validation rules
        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'subject':
                if (value.length < 5) {
                    errorMessage = 'Subject must be at least 5 characters long';
                }
                break;
            case 'message':
                if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters long';
                }
                break;
        }

        if (errorMessage) {
            this.showFieldError(input, errorMessage);
            return false;
        }

        return true;
    }

    showFieldError(input, message) {
        input.style.borderColor = 'var(--error)';
        
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error)';
        errorElement.style.fontSize = 'var(--font-size-sm)';
        errorElement.style.marginTop = 'var(--space-1)';
        errorElement.style.display = 'block';

        input.parentNode.appendChild(errorElement);
    }

    clearFieldError(input) {
        input.style.borderColor = '';
        const errorElement = input.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async submitForm(data) {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success feedback
            this.showSuccessMessage();
            this.form.reset();
            
        } catch (error) {
            this.showErrorMessage();
        } finally {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'form-message success';
        message.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
        message.style.cssText = `
            background: var(--success);
            color: white;
            padding: var(--space-4);
            border-radius: var(--border-radius);
            margin-top: var(--space-4);
            display: flex;
            align-items: center;
            gap: var(--space-2);
        `;
        
        this.form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    showErrorMessage() {
        const message = document.createElement('div');
        message.className = 'form-message error';
        message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sorry, there was an error sending your message. Please try again.';
        message.style.cssText = `
            background: var(--error);
            color: white;
            padding: var(--space-4);
            border-radius: var(--border-radius);
            margin-top: var(--space-4);
            display: flex;
            align-items: center;
            gap: var(--space-2);
        `;
        
        this.form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new ThemeManager();
    new NavigationManager();
    new AnimationObserver();
    new ContactFormManager();
    const modalManager = new ProjectModalManager();

    // Initialize typing animation
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        new TypingAnimation(typingElement, [
            'Full Stack Developer',
            'UI/UX Designer',
            'Creative Problem Solver',
            'Tech Enthusiast'
        ]);
    }

    // Add animation classes to elements
    const fadeElements = document.querySelectorAll('.about-text, .project-card, .skill-category, .contact-info');
    fadeElements.forEach(element => element.classList.add('fade-in'));

    const slideLeftElements = document.querySelectorAll('.about-text');
    slideLeftElements.forEach(element => element.classList.add('slide-in-left'));

    const slideRightElements = document.querySelectorAll('.about-skills');
    slideRightElements.forEach(element => element.classList.add('slide-in-right'));

    // Global functions for modal (needed for onclick handlers)
    window.openProjectModal = (projectId) => {
        modalManager.openModal(projectId);
    };

    window.closeProjectModal = () => {
        modalManager.closeModal();
    };

    // Add some dynamic styles for modal
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .project-modal {
            display: flex;
            flex-direction: column;
            gap: var(--space-6);
        }
        
        .modal-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: var(--border-radius);
        }
        
        .modal-body h2 {
            color: var(--primary);
            margin-bottom: var(--space-4);
        }
        
        .project-description {
            font-size: var(--font-size-lg);
            line-height: 1.7;
            color: var(--gray-600);
            margin-bottom: var(--space-6);
        }
        
        .dark-theme .project-description {
            color: var(--gray-400);
        }
        
        .detail-section {
            margin-bottom: var(--space-6);
        }
        
        .detail-section h3 {
            color: var(--secondary);
            margin-bottom: var(--space-3);
        }
        
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-2);
        }
        
        .tech-tag {
            background: var(--primary);
            color: white;
            padding: var(--space-1) var(--space-3);
            border-radius: var(--border-radius-full);
            font-size: var(--font-size-sm);
        }
        
        .feature-list {
            margin: 0;
            padding-left: var(--space-5);
        }
        
        .feature-list li {
            margin-bottom: var(--space-2);
            color: var(--gray-600);
        }
        
        .dark-theme .feature-list li {
            color: var(--gray-400);
        }
        
        .modal-actions {
            display: flex;
            gap: var(--space-4);
            justify-content: center;
            margin-top: var(--space-6);
        }
        
        @media (max-width: 768px) {
            .modal-actions {
                flex-direction: column;
            }
            
            .modal-actions .btn {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(modalStyles);

    // Performance optimization: Lazy load images
    const images = document.querySelectorAll('img[src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.addEventListener('load', () => {
                    img.style.transition = 'opacity 0.3s';
                    img.style.opacity = '1';
                });
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add smooth page transitions
    window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.98)';
        document.body.style.transition = 'all 0.3s ease';
    });

    // Add custom cursor effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-item');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            document.body.style.cursor = 'pointer';
        });
        
        element.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'default';
        });
    });
});

// Performance monitoring
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Log performance metrics
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        }
    });
}