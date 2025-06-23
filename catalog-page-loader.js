document.addEventListener('DOMContentLoaded', async () => {
    const categoryFiltersContainer = document.getElementById('catalogCategoryFilters');
    const productGrid = document.getElementById('catalogProductGrid');
    const catalogMessage = document.getElementById('catalogMessage');

    let allProducts = [];

    // Function to display message
    const showMessage = (message) => {
        if (catalogMessage) {
            catalogMessage.style.display = 'block';
            catalogMessage.textContent = message;
        }
        if (productGrid) productGrid.textContent = '';
    };

    // Function to display products
    const displayProducts = (productsToDisplay) => {
        if (!productGrid || !catalogMessage) return;
        
        productGrid.textContent = '';
        catalogMessage.style.display = 'none';

        if (productsToDisplay.length === 0) {
            showMessage('Товары в данной категории отсутствуют или не найдены.');
            return;
        }

        productsToDisplay.forEach(product => {
            const card = document.createElement('a');
            card.href = `product.html?id=${product.id}`;
            card.className = 'catalog-card product-card-item';

            const imageSrc = product.mainImage || 'https://via.placeholder.com/400x300.png?text=ArtDecor';
            const imageAlt = (product.imageAlts && product.imageAlts[0]) ? product.imageAlts[0] : `Изображение ${product.name}`;

            let priceDisplay = product.price ? `${product.price} ${product.priceUnit || ''}`.trim() : 'Цена по запросу';

            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = imageAlt;
            img.className = 'catalog-card-image';

            const content = document.createElement('div');
            content.className = 'catalog-card-content';

            const title = document.createElement('h3');
            title.className = 'catalog-card-title';
            title.textContent = product.name;

            const price = document.createElement('p');
            price.className = 'product-card-price';
            price.textContent = priceDisplay;

            const linkSpan = document.createElement('span');
            linkSpan.className = 'catalog-card-link';
            linkSpan.textContent = 'Подробнее ';
            const arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.textContent = '→';
            linkSpan.appendChild(arrow);

            content.appendChild(title);
            content.appendChild(price);
            content.appendChild(linkSpan);

            card.appendChild(img);
            card.appendChild(content);

            const imgElement = img;
            imgElement.onerror = function() {
                this.src = 'https://via.placeholder.com/400x300.png?text=Image+Error';
                this.alt = 'Ошибка загрузки изображения товара';
            };

            productGrid.appendChild(card);
        });
    };

    // Function to create and display category filters
    const displayCategoryFilters = (products) => {
        if (!categoryFiltersContainer) return;
        categoryFiltersContainer.textContent = '';

        const categories = ['Все категории', ...new Set(products.map(p => p.category).filter(Boolean))];

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-filter-btn';
            button.textContent = category;
            button.dataset.category = category;

            button.addEventListener('click', () => {
                document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                if (category === 'Все категории') {
                    displayProducts(allProducts);
                    const currentUrl = new URL(window.location);
                    currentUrl.searchParams.delete('category');
                    window.history.pushState({path:currentUrl.href}, '', currentUrl.href);
                } else {
                    const filteredProducts = allProducts.filter(p => p.category === category);
                    displayProducts(filteredProducts);
                    const currentUrl = new URL(window.location);
                    currentUrl.searchParams.set('category', category);
                    window.history.pushState({path:currentUrl.href}, '', currentUrl.href);
                }
            });
            categoryFiltersContainer.appendChild(button);
        });
    };

    // Main loading logic
    try {
        if (catalogMessage) {
            catalogMessage.style.display = 'block';
            catalogMessage.textContent = 'Загрузка товаров...';
        }

        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`Ошибка загрузки products.json: ${response.status}`);
        }
        allProducts = await response.json();

        if (allProducts.length === 0) {
            showMessage('Каталог товаров пуст.');
            return;
        }

        displayCategoryFilters(allProducts);

        // Check URL parameter for initial filtering
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');

        if (categoryFromUrl) {
            const targetButton = categoryFiltersContainer.querySelector(`button[data-category="${categoryFromUrl}"]`);
            if (targetButton) {
                targetButton.click();
            } else {
                const allCategoriesButton = categoryFiltersContainer.querySelector('button[data-category="Все категории"]');
                if(allCategoriesButton) allCategoriesButton.classList.add('active');
                displayProducts(allProducts);
            }
        } else {
            const allCategoriesButton = categoryFiltersContainer.querySelector('button[data-category="Все категории"]');
            if(allCategoriesButton) allCategoriesButton.classList.add('active');
            displayProducts(allProducts);
        }

    } catch (error) {
        console.error('Ошибка при загрузке каталога:', error);
        showMessage(`Не удалось загрузить каталог товаров. ${error.message}`);
    }
});
