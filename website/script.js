/* =============================================
   PTRZ — Apple-Style Portfolio Scripts
   ============================================= */

(function () {
    'use strict';

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animations within the same section
                    const parent = entry.target.closest('.section, .hero');
                    const siblings = parent
                        ? Array.from(parent.querySelectorAll('.reveal'))
                        : [];
                    const siblingIndex = siblings.indexOf(entry.target);
                    const delay = siblingIndex * 80;

                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);

                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // --- Mobile Navigation ---
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            menuOpen = !menuOpen;
            mobileMenu.classList.toggle('active', menuOpen);
            navToggle.classList.toggle('active', menuOpen);
            document.body.style.overflow = menuOpen ? 'hidden' : '';
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                menuOpen = false;
                mobileMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Navbar Background on Scroll ---
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener(
        'scroll',
        () => {
            const scrollY = window.scrollY;

            if (scrollY > 60) {
                nav.style.background = 'rgba(251, 251, 253, 0.88)';
            } else {
                nav.style.background = 'rgba(251, 251, 253, 0.72)';
            }

            lastScroll = scrollY;
        },
        { passive: true }
    );

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 60;
                const top =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Wird gesendet...';
            btn.disabled = true;

            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                btn.textContent = 'Gesendet!';
                btn.style.background = '#30d158';
                contactForm.reset();

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2500);
            }, 1000);
        });
    }

    // --- Parallax-like effect on hero ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.innerWidth > 768) {
        window.addEventListener(
            'scroll',
            () => {
                const scrollY = window.scrollY;
                const opacity = Math.max(0, 1 - scrollY / 600);
                const translateY = scrollY * 0.3;
                heroContent.style.opacity = opacity;
                heroContent.style.transform = `translateY(${translateY}px)`;
            },
            { passive: true }
        );
    }
})();
