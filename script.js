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
