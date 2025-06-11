(function (global) {
    'use strict';

    function sanitizeHTML(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString;

        const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span'];
        const allowedAttrs = {
            'a': ['href', 'title', 'target', 'rel'],
            'span': ['class']
        };

        const sanitizeNode = (node) => {
            const children = Array.from(node.childNodes);
            children.forEach(child => sanitizeNode(child));

            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();
                if (!allowedTags.includes(tag)) {
                    const fragment = document.createDocumentFragment();
                    while (node.firstChild) {
                        fragment.appendChild(node.firstChild);
                    }
                    node.parentNode.replaceChild(fragment, node);
                } else {
                    [...node.attributes].forEach(attr => {
                        const allowed = allowedAttrs[tag] || [];
                        if (!allowed.includes(attr.name.toLowerCase())) {
                            node.removeAttribute(attr.name);
                        }
                    });
                }
            }
        };

        sanitizeNode(template.content);
        return template.innerHTML;
    }

    global.sanitizeHTML = sanitizeHTML;
})(window);
