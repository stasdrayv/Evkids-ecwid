window.addEventListener('load', () => {
    const storeId = 110895030, token = 'public_2EcX2hkWS7BudZaMDscNmnqqE55FE3e1';
    Ecwid.OnAPILoaded.add(() => Ecwid.OnPageLoaded.add(page => page.type === 'PRODUCT' && fetchProductData(page.productId)));

    const fetchProductData = id => {
        fetch(`https://app.ecwid.com/api/v3/${storeId}/products/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(product => setupOptions(product.options.map(opt => opt.name), product.combinations || []))
        .catch(console.error);
    };

    const setupOptions = (order, combinations) => {
        const selected = {};
        updateAvailability(order, combinations, selected);
        order.forEach((name, idx) => getOptionElements(name).forEach(el => {
            (el.querySelector('input') || el).addEventListener('change', () => {
                selected[name] = el.querySelector('input')?.value || el.value;
                Object.keys(selected).forEach((key, i) => i > idx && delete selected[key]);
                updateAvailability(order, combinations, selected);
            });
        }));
    };

    const updateAvailability = (order, combinations, selected) => {
        order.forEach(name => {
            const elements = getOptionElements(name);
            const filters = Object.fromEntries(Object.entries(selected).filter(([key]) => key !== name));
            const filtered = combinations.filter(c =>
                Object.entries(filters).every(([k, v]) => c.options.some(o => o.name === k && o.value === v))
            );
            elements.forEach(el => {
                const value = el.querySelector('input')?.value || el.value;
                const available = filtered.some(c =>
                    c.options.some(o => o.name === name && o.value === value) && c.quantity > 0 && c.inStock
                );
                el.classList.toggle('unavailable', !available);
            });
        });
    };

    const getOptionElements = name => [...document.querySelectorAll(
        `.details-product-option--${name.replace(/[!"#$%&'()*+,./:;<=>?@[\\]^`{|}~]/g, '\$&')} .form-control, 
         .details-product-option--${name.replace(/[!"#$%&'()*+,./:;<=>?@[\\]^`{|}~]/g, '\$&')} .form-control__select`
    )];

    // Добавляем стили динамически
    const style = document.createElement('style');
    style.textContent = `
        .ins-header__search-field::placeholder {
            color: #FF6F91;
            opacity: 0.8;
        }
        .ins-header__search-field {
            border: 1px solid #FF5A5F;
            border-radius: 8px;
            padding: 6px;
            width: 150px;
            height: 36px;
            color: #8B3A62;
            font-size: 14px;
        }
        .ins-header__search-button {
            background: none;
            border: none;
            cursor: pointer;
            margin-left: 8px;
            width: 28px;
            height: 28px;
            background-image: url('https://img.icons8.com/?size=100&id=HcIQmljj5Or3&format=png&color=FF5A5F');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
        .unavailable label {
            color: gray;
            text-decoration: line-through;
            cursor: not-allowed;
        }
        .unavailable input {
            background-color: #f0f0f0;
            border: 1px solid #d3d3d3;
            color: gray;
        }
        .unavailable .form-control__inline-label {
            background-color: #f9f9f9;
            opacity: 0.5;
        }
        .unavailable .form-control__radio {
            visibility: visible;
        }
        @media only screen and (max-width: 768px) {
            .unavailable label {
                text-decoration: line-through;
                color: gray;
            }
        }
    `;
    document.head.appendChild(style);
});
