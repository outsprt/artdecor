document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('productContainer');
    if (!productContainer) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        displayError('Ошибка: ID товара не указан в URL.', 'Ошибка - ArtDecor Kostanay');
        return;
    }

    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`Не удалось загрузить products.json. Статус: ${response.status}`);
        }
        const products = await response.json();
        const product = products.find(p => p.id === productId);

        if (product) {
            // Update page metadata
            document.title = `${product.name} - ArtDecor Kostanay`;
            updateMetaTag('name', 'description', product.shortDescription || `Купить ${product.name} в ArtDecor Kostanay.`);
            
            updateMetaTag('property', 'og:title', `${product.name} - ArtDecor Kostanay`);
            updateMetaTag('property', 'og:description', product.shortDescription || `Высококачественный декор: ${product.name}`);
            if (product.mainImage) {
                try {
                    const imageUrl = new URL(product.mainImage, window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)).href;
                    updateMetaTag('property', 'og:image', imageUrl);
                } catch (e) {
                    console.warn("Не удалось создать абсолютный URL для og:image:", product.mainImage);
                    updateMetaTag('property', 'og:image', product.mainImage);
                }
            }
            updateMetaTag('property', 'og:url', window.location.href);
            updateMetaTag('property', 'og:type', 'product');

            // Fill breadcrumbs
            document.getElementById('breadcrumbProductName').textContent = product.name;
            const breadcrumbCategoryLi = document.getElementById('breadcrumbCategory');
            const breadcrumbCategoryTextElement = document.getElementById('breadcrumbCategoryText');
            
            if (product.category && breadcrumbCategoryLi && breadcrumbCategoryTextElement) {
                breadcrumbCategoryTextElement.textContent = product.category;
                breadcrumbCategoryLi.style.display = 'inline';
            }

            // Fill main product information
            document.getElementById('productName').textContent = product.name;
            document.getElementById('productPriceValue').textContent = product.price;
            document.getElementById('productPriceUnit').textContent = product.priceUnit || '';
            const shortDescElement = document.getElementById('productShortDescription');
            if (shortDescElement) {
                shortDescElement.textContent = '';
                const p = document.createElement('p');
                p.textContent = product.shortDescription || 'Описание скоро появится.';
                shortDescElement.appendChild(p);
            }

            // Fill gallery
            const mainProductImage = document.getElementById('mainProductImage');
            const thumbnailsContainer = document.getElementById('productThumbnails');
            thumbnailsContainer.textContent = '';

            mainProductImage.src = product.mainImage || 'https://via.placeholder.com/600x500.png?text=Фото+отсутствует';
            mainProductImage.alt = (product.imageAlts && product.imageAlts[0]) ? product.imageAlts[0] : `${product.name} - основное изображение`;
            mainProductImage.onerror = function() { this.src = 'https://via.placeholder.com/600x500.png?text=Ошибка+загрузки'; this.alt = 'Ошибка загрузки основного изображения'; };

            if (product.thumbnails && product.thumbnails.length > 0) {
                let firstThumbIsMain = product.mainImage && product.thumbnails[0] === product.mainImage;

                product.thumbnails.forEach((thumbUrl, index) => {
                    const img = document.createElement('img');
                    img.src = thumbUrl;
                    const altText = (product.imageAlts && product.imageAlts[index]) ? product.imageAlts[index] : `Миниатюра ${index + 1} для ${product.name}`;
                    img.alt = altText;
                    img.classList.add('thumbnail');
                    
                    if (index === 0 && (!product.mainImage || firstThumbIsMain)) { 
                        img.classList.add('active-thumbnail');
                        if (!product.mainImage) { 
                             mainProductImage.src = thumbUrl;
                             mainProductImage.alt = altText;
                        }
                    } else if (product.mainImage === thumbUrl) { 
                        img.classList.add('active-thumbnail');
                    }

                    img.onclick = () => changeMainImageJS(thumbUrl, img, altText);
                    img.onerror = function() { this.src = 'https://via.placeholder.com/100x80.png?text=Error'; this.alt = 'Ошибка загрузки миниатюры';};
                    thumbnailsContainer.appendChild(img);
                });
            }

            // 3D model download link
            const downloadLink = document.getElementById('downloadLink3D');
            if (downloadLink) {
                if (product.downloadLink3D && product.downloadLink3D.trim() !== "") {
                    downloadLink.href = product.downloadLink3D;
                    downloadLink.style.display = 'inline-flex';
                } else {
                    downloadLink.style.display = 'none';
                }
            }

            // Fill characteristics
            const characteristicsList = document.getElementById('characteristicsList');
            if (characteristicsList) {
                characteristicsList.textContent = '';
                if (product.characteristics && product.characteristics.length > 0) {
                    product.characteristics.forEach(char => {
                        const dt = document.createElement('dt');
                        dt.textContent = char.label;
                        const dd = document.createElement('dd');
                        dd.textContent = char.value;
                        characteristicsList.appendChild(dt);
                        characteristicsList.appendChild(dd);
                    });
                } else {
                    const p = document.createElement('p');
                    p.textContent = 'Характеристики не указаны.';
                    characteristicsList.appendChild(p);
                }
            }

            // Fill full description
            const fullDescriptionContainer = document.getElementById('productFullDescriptionContent');
            if (fullDescriptionContainer) {
                fullDescriptionContainer.textContent = '';
                if (product.fullDescription) {
                    setSanitizedHTML(fullDescriptionContainer, product.fullDescription);
                } else {
                    const p = document.createElement('p');
                    p.textContent = 'Подробное описание отсутствует.';
                    fullDescriptionContainer.appendChild(p);
                }
            }

            // WhatsApp buy button
            const buyWhatsAppBtn = document.getElementById('buyWhatsAppBtn');
            if (buyWhatsAppBtn) {
                const productNameForMsg = product.name || 'Выбранный товар';
                const productPriceForMsg = (product.price && product.priceUnit) ? `${product.price} ${product.priceUnit}` : ((product.price) ? product.price : 'Цена по запросу');
                
                const yourWhatsAppNumber = '77055285829';

                let messageText = `Здравствуйте, ArtDecor Kostanay!\n\nМеня интересует товар:\n*${productNameForMsg}*\nАртикул: ${product.id || 'не указан'}\nЦена: ${productPriceForMsg}\n\nСсылка на товар: ${window.location.href}\n\nХочу обсудить покупку.`;
                
                const encodedMessage = encodeURIComponent(messageText);
                const whatsAppLink = `https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`;
                
                buyWhatsAppBtn.href = whatsAppLink;
                buyWhatsAppBtn.target = '_blank'; 
                buyWhatsAppBtn.rel = 'noopener noreferrer'; 

                buyWhatsAppBtn.addEventListener('click', (e) => {
                });
            }

        } else {
            displayError(`Товар с ID "${productId}" не найден.`, "Товар не найден - ArtDecor Kostanay");
        }
    } catch (error) {
        console.error("Ошибка при загрузке или обработке данных товара:", error);
        displayError(`Произошла ошибка при загрузке информации о товаре. Пожалуйста, попробуйте позже.<br><span class="error-details">Детали: ${error.message}</span>`, "Ошибка загрузки - ArtDecor Kostanay");
    }
});

// Helper function to update meta tags
function updateMetaTag(attributeName, attributeValue, content) {
    let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attributeValue);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

// Helper function to display errors
function displayError(message, pageTitle) {
    const productContainer = document.getElementById('productContainer');
    if (productContainer) {
        productContainer.textContent = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'error-container';
        wrapper.style.textAlign = 'center';
        wrapper.style.padding = 'var(--spacing-xxl)';
        wrapper.style.color = 'var(--muted-text-color)';

        const title = document.createElement('h1');
        title.style.color = 'var(--brand-color-gold)';
        title.style.marginBottom = 'var(--spacing-md)';
        title.textContent = 'Ошибка';

        const p = document.createElement('p');
        p.style.fontSize = '1.1rem';
        setSanitizedHTML(p, message);

        const link = document.createElement('a');
        link.href = 'catalog.html';
        link.className = 'btn btn-primary';
        link.style.marginTop = 'var(--spacing-lg)';
        link.textContent = 'Вернуться в каталог';

        wrapper.appendChild(title);
        wrapper.appendChild(p);
        wrapper.appendChild(link);

        productContainer.appendChild(wrapper);
    }
    if (pageTitle) {
        document.title = pageTitle;
    }
}

// Global function for changing main image
function changeMainImageJS(newSrc, thumbnailElement, altText) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = newSrc;
        mainImage.alt = altText;
        
        document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active-thumbnail'));
        if (thumbnailElement) {
            thumbnailElement.classList.add('active-thumbnail');
        }
    }
}
