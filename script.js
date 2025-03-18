window.addEventListener('load', () => {
    const storeId = 110895030, token = 'public_2EcX2hkWS7BudZaMDscNmnqqE55FE3e1';

    EcwidApp.init({
        app_id: "custom-app",
        autoloadedflag: true
    });

    Ecwid.OnPageLoaded.add(page => {
        if (page.type === 'PRODUCT') {
            fetchProductData(page.productId);
        }
    });

    const fetchProductData = id => {
        fetch(`https://app.ecwid.com/api/v3/${storeId}/products/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(product => setupOptions(product.options?.map(opt => opt.name) || [], product.combinations || []))
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
        `.details-product-option--${CSS.escape(name)} .form-control, 
         .details-product-option--${CSS.escape(name)} .form-control__select`
    )];
});
