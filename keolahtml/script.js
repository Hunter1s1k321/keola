// ========== SPLASH SCREEN & MUSIC PLAYER CONTROL ==========

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const splashScreen = document.getElementById('splashScreen');
let isMusicPlaying = true;
let splashScreenClosed = false;

// Initialize music button to show as playing
updateMusicButton();

// Ensure music is unmuted
bgMusic.muted = false;
bgMusic.volume = 0.5;
bgMusic.currentTime = 0;

console.log('Audio element:', bgMusic);
console.log('Audio volume:', bgMusic.volume);
console.log('Audio muted:', bgMusic.muted);

// Handle splash screen closure and music start
const closeSplashAndPlayMusic = () => {
    if (splashScreenClosed) return;
    
    splashScreenClosed = true;
    console.log('Closing splash screen and starting music');
    
    // Add hide animation
    splashScreen.classList.add('hide');
    
    // Play music after splash animation
    setTimeout(() => {
        bgMusic.muted = false;
        bgMusic.volume = 0.5;
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Music playing successfully');
                    isMusicPlaying = true;
                    updateMusicButton();
                })
                .catch((error) => {
                    console.error('Error playing music:', error);
                    isMusicPlaying = false;
                    updateMusicButton();
                });
        }
    }, 300);
    
    // Remove splash screen from DOM after animation
    setTimeout(() => {
        splashScreen.remove();
    }, 1000);
};

// Listen for any user interaction on splash screen
splashScreen.addEventListener('click', closeSplashAndPlayMusic);
document.addEventListener('keydown', closeSplashAndPlayMusic, { once: true });
document.addEventListener('touchstart', closeSplashAndPlayMusic, { once: true });

// Music toggle button
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
    } else {
        bgMusic.muted = false;
        bgMusic.volume = 0.5;
        bgMusic.play();
        isMusicPlaying = true;
    }
    updateMusicButton();
});

function updateMusicButton() {
    if (isMusicPlaying) {
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        musicToggle.classList.remove('muted');
    } else {
        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        musicToggle.classList.add('muted');
    }
}

// ========== VIDEO PARALLAX EFFECT ==========

const heroVideo = document.querySelector('.hero-video');
const heroVideoWrapper = document.querySelector('.hero-video-wrapper');

window.addEventListener('scroll', () => {
    if (heroVideo && window.scrollY < window.innerHeight * 1.5) {
        const scrollProgress = window.scrollY / window.innerHeight;
        heroVideo.style.transform = `translateY(${scrollProgress * 50}px) scale(${1 + scrollProgress * 0.1})`;
    }
});

// ========== NAVIGATION & SCROLL BEHAVIOR ==========

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(255, 182, 217, 0.25)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.7)';
        navbar.style.boxShadow = '0 4px 30px rgba(255, 182, 217, 0.15)';
    }
});

// ========== PARALLAX EFFECT ==========

// Parallax on mouse move for particles
document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.02;

    particles.forEach((particle, index) => {
        const depth = (index + 1) * 0.5;
        particle.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
    });
});

// Parallax scroll effect on hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const heroImages = document.querySelector('.hero-images');
    
    if (hero && window.scrollY < window.innerHeight) {
        const offset = window.scrollY * 0.5;
        hero.style.transform = `translateY(${offset}px)`;
        
        if (heroImages) {
            heroImages.style.opacity = 1 - (window.scrollY / window.innerHeight) * 0.3;
        }
    }
});

// ========== GALLERY ITEMS ANIMATION ==========

// Intersection Observer untuk fade-in gallery items
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, observerOptions);

document.querySelectorAll('.gallery-item').forEach((item) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px) scale(0.95)';
    observer.observe(item);
});

// ========== GALLERY HOVER EFFECTS ==========

// Gallery item 3D hover effect
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * 5;
        const rotateY = ((x - centerX) / centerX) * -5;
        
        item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// ========== QUOTE SECTION ANIMATION ==========

// Quote section animation on scroll
const quoteSection = document.querySelector('.quote-section');
if (quoteSection) {
    const quoteObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const quoteText = entry.target.querySelector('.quote-text');
                const quoteHighlight = entry.target.querySelector('.quote-highlight');
                const quoteSign = entry.target.querySelector('.quote-sign');
                
                if (quoteText) quoteText.style.animation = 'slideInUp 1s ease-out 0s forwards';
                if (quoteHighlight) quoteHighlight.style.animation = 'slideInUp 1s ease-out 0.3s forwards';
                if (quoteSign) quoteSign.style.animation = 'slideInUp 1s ease-out 0.6s forwards';
            }
        });
    }, { threshold: 0.3 });
    
    quoteObserver.observe(quoteSection);
}

// ========== BUTTON INTERACTIONS ==========

// CTA Button click animation
const ctaBtn = document.querySelector('.cta-btn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        }, 100);
    });
    
    // Button ripple effect
    ctaBtn.addEventListener('mouseenter', function() {
        this.style.overflow = 'visible';
    });
}

// Contact Button similar hover
const contactBtn = document.querySelector('.contact-btn');
if (contactBtn) {
    contactBtn.addEventListener('click', function() {
        alert('💕 Thank you for reaching out!');
    });
}

// ========== SECTION FADE-IN ON SCROLL ==========

// Fade-in sections
document.querySelectorAll('section').forEach(section => {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, { threshold: 0.1 });
    
    sectionObserver.observe(section);
});

// ========== CURSOR GLOW EFFECT ==========

// Custom cursor glow effect
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
cursorGlow.style.cssText = `
    position: fixed;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 182, 217, 0.8), transparent);
    pointer-events: none;
    z-index: 999;
    display: none;
    box-shadow: 0 0 20px rgba(255, 182, 217, 0.6);
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX - 15 + 'px';
    cursorGlow.style.top = e.clientY - 15 + 'px';
    cursorGlow.style.display = 'block';
});

document.addEventListener('mouseleave', () => {
    cursorGlow.style.display = 'none';
});

// ========== MOUSE TRAIL EFFECT ==========

// Mouse trail particles
const trailParticles = [];
const maxTrailParticles = 15;

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.8) { // Only create particle 20% of the time
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 998;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, rgba(255, 182, 217, 0.8), transparent);
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255, 182, 217, 0.6);
            animation: trailFade 1s ease-out forwards;
        `;
        document.body.appendChild(particle);
        trailParticles.push(particle);
        
        if (trailParticles.length > maxTrailParticles) {
            trailParticles[0].remove();
            trailParticles.shift();
        }
    }
});

// Add trail fade animation
const style = document.createElement('style');
style.textContent = `
    @keyframes trailFade {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(style);

// ========== SCROLL PROGRESS INDICATOR ==========

// Scroll progress bar
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--dark-pink), var(--primary-pink));
    z-index: 1001;
    transition: width 0.3s ease;
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// ========== INTERSECTION OBSERVER FOR LAZY LOADING ==========

// Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
}, { rootMargin: '50px' });

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// ========== ERROR HANDLING ==========

// Prevent console errors on missing images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.backgroundColor = '#FFB6D9';
        this.style.opacity = '0.5';
        this.alt = 'Image not found';
    });
});

// ========== INITIALIZATION LOG ==========

console.log('%c✨ Keola Website Loaded Successfully! ✨', 'color: #FF69B4; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px rgba(255, 105, 180, 0.5);');
console.log('%cEnjoy the immersive experience! 💕', 'color: #FFB6D9; font-size: 14px;');
