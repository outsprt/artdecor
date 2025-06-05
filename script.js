document.addEventListener('DOMContentLoaded', () => {
    console.log('ArtDecor Kostanay Global script loaded!');

    // --- Mobile menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.classList.toggle('is-active');
            mainMenu.classList.toggle('is-active');
        });
    }

    // --- Update current year in footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Smooth scroll to anchors (only on homepage) ---
    if (document.body.classList.contains('home-page')) {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([data-bs-toggle])'); 
        
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const hrefAttribute = this.getAttribute('href');
                try {
                    const targetElement = document.querySelector(hrefAttribute);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });

                        // Close mobile menu if open
                        if (mainMenu && mainMenu.classList.contains('is-active')) {
                            menuToggle.setAttribute('aria-expanded', 'false');
                            menuToggle.classList.remove('is-active');
                            mainMenu.classList.remove('is-active');
                        }
                    }
                } catch (error) {
                    console.warn(`Smooth scroll: Invalid selector - ${hrefAttribute}`, error);
                }
            });
        });
    }

    // --- Contact form handling (only on homepage) ---
    if (document.body.classList.contains('home-page')) {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const messageInput = document.getElementById('message');
                const submitButton = this.querySelector('button[type="submit"]');

                // Simple validation
                if (nameInput.value.trim() === '') {
                    alert('Пожалуйста, введите ваше имя.');
                    nameInput.focus();
                    return;
                }

                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput.value.trim() === '' || !emailPattern.test(emailInput.value.trim())) {
                    alert('Пожалуйста, введите корректный Email.');
                    emailInput.focus();
                    return;
                }

                if (messageInput.value.trim() === '') {
                    alert('Пожалуйста, введите ваше сообщение.');
                    messageInput.focus();
                    return;
                }

                // Simulate sending
                submitButton.disabled = true;
                submitButton.textContent = 'Отправка...';

                setTimeout(() => {
                    alert('Спасибо! Ваше сообщение "отправлено" (в режиме прототипа). Мы свяжемся с вами в ближайшее время.');
                    contactForm.reset();
                    submitButton.disabled = false;
                    submitButton.textContent = 'Отправить сообщение';
                }, 1000);
            });
        }
    }

    // --- Lightbox2 settings (if loaded) ---
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
          'resizeDuration': 300,
          'fadeDuration': 400,
          'wrapAround': true,
          'albumLabel': "Изображение %1 из %2",
          'disableScrolling': true
        });
    }
});
