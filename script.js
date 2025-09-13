
    
        document.addEventListener('DOMContentLoaded', () => {
            // --- DOM Elements ---
            const productGrid = document.getElementById('product-grid');
            const loader = document.getElementById('loader');
            const errorMessage = document.getElementById('error-message');
            const searchInput = document.getElementById('search-input');
            const cartButton = document.getElementById('cart-button');
            const closeCartButton = document.getElementById('close-cart-button');
            const cartSidebar = document.getElementById('cart-sidebar');
            const overlay = document.getElementById('overlay');
            const cartCountElement = document.getElementById('cart-count');
            const cartItemsContainer = document.getElementById('cart-items');
            const emptyCartMessage = document.getElementById('empty-cart-message');
            const cartSubtotalElement = document.getElementById('cart-subtotal');

            // --- State ---
            let allProducts = [];
            let cart = []; // { id, title, price, image, quantity }

            // --- API URL ---
            const API_URL = 'https://fakestoreapi.com/products';

            // --- Functions ---

            /**
             * Fetches products from the API and renders them.
             */
            async function fetchProducts() {
                try {
                    loader.style.display = 'block';
                    errorMessage.style.display = 'none';
                    productGrid.innerHTML = '';

                    const response = await fetch(API_URL);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const products = await response.json();
                    allProducts = products;
                    renderProducts(allProducts);
                } catch (error) {
                    console.error("Failed to fetch products:", error);
                    errorMessage.style.display = 'block';
                } finally {
                    loader.style.display = 'none';
                }
            }

            /**
             * Renders an array of products to the grid.
             * @param {Array} productsToRender - The array of product objects to display.
             */
            function renderProducts(productsToRender) {
                productGrid.innerHTML = '';
                if (productsToRender.length === 0) {
                    productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
                    return;
                }

                productsToRender.forEach(product => {
                    const productCard = `
                        <div class="group relative bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
                            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                                <img src="${product.image}" alt="${product.title}" class="h-64 w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300">
                            </div>
                            <div class="p-4 flex flex-col flex-grow">
                                <h3 class="text-sm font-medium text-gray-700 truncate">${product.title}</h3>
                                <p class="mt-1 text-sm text-gray-500 capitalize">${product.category}</p>
                                <div class="flex-grow"></div>
                                <div class="flex items-center justify-between mt-4">
                                    <p class="text-lg font-semibold text-gray-900">$${product.price.toFixed(2)}</p>
                                    <button data-product-id="${product.id}" class="add-to-cart-btn inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    productGrid.insertAdjacentHTML('beforeend', productCard);
                });
            }
            
            /**
             * Filters products based on the search input value.
             */
            function handleSearch() {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredProducts = allProducts.filter(product =>
                    product.title.toLowerCase().includes(searchTerm)
                );
                renderProducts(filteredProducts);
            }

            /**
             * Toggles the visibility of the cart sidebar.
             */
            function toggleCart() {
                cartSidebar.classList.toggle('cart-closed');
                cartSidebar.classList.toggle('cart-open');
                overlay.classList.toggle('hidden');
            }

            /**
             * Adds a product to the cart or increments its quantity.
             * @param {number} productId - The ID of the product to add.
             */
            function addToCart(productId) {
                const productToAdd = allProducts.find(p => p.id === productId);
                if (!productToAdd) return;

                const existingCartItem = cart.find(item => item.id === productId);

                if (existingCartItem) {
                    existingCartItem.quantity++;
                } else {
                    cart.push({
                        id: productToAdd.id,
                        title: productToAdd.title,
                        price: productToAdd.price,
                        image: productToAdd.image,
                        quantity: 1
                    });
                }
                updateCartUI();
            }
            
             /**
             * Removes an item completely from the cart.
             * @param {number} productId - The ID of the product to remove.
             */
            function removeFromCart(productId) {
                cart = cart.filter(item => item.id !== productId);
                updateCartUI();
            }

            /**
             * Updates the quantity of a cart item.
             * @param {number} productId - The ID of the product to update.
             * @param {number} newQuantity - The new quantity for the item.
             */
            function updateCartQuantity(productId, newQuantity) {
                 const cartItem = cart.find(item => item.id === productId);
                 if (cartItem) {
                     if (newQuantity > 0) {
                         cartItem.quantity = newQuantity;
                     } else {
                         removeFromCart(productId);
                     }
                 }
                 updateCartUI();
            }
            
            /**
             * Updates the entire cart UI (count, items, subtotal).
             */
            function updateCartUI() {
                // Update cart count bubble
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCountElement.textContent = totalItems;
                
                // Render cart items
                cartItemsContainer.innerHTML = '';
                if(cart.length === 0) {
                    cartItemsContainer.appendChild(emptyCartMessage);
                    emptyCartMessage.style.display = 'block';
                } else {
                     emptyCartMessage.style.display = 'none';
                    cart.forEach(item => {
                        const cartItemElement = `
                            <div class="flex items-start space-x-4">
                                <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-contain border rounded-md">
                                <div class="flex-1">
                                    <h4 class="text-sm font-medium text-gray-800 truncate">${item.title}</h4>
                                    <p class="text-sm text-gray-500">$${item.price.toFixed(2)}</p>
                                    <div class="flex items-center mt-2">
                                        <input type="number" min="1" value="${item.quantity}" data-product-id="${item.id}" class="quantity-input w-16 text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <button data-product-id="${item.id}" class="remove-from-cart-btn ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <p class="text-sm font-semibold text-gray-800">$${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        `;
                        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemElement);
                    });
                }
                
                // Update subtotal
                const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            }

            // --- Event Listeners ---

            // Search input
            searchInput.addEventListener('input', handleSearch);
            
            // Open/close cart
            cartButton.addEventListener('click', toggleCart);
            closeCartButton.addEventListener('click', toggleCart);
            overlay.addEventListener('click', toggleCart);

            // Add to cart (using event delegation)
            productGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) {
                    const productId = parseInt(e.target.dataset.productId);
                    addToCart(productId);
                }
            });
            
            // Handle actions within the cart (remove, quantity change)
            cartItemsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-from-cart-btn')) {
                    const productId = parseInt(e.target.dataset.productId);
                    removeFromCart(productId);
                }
            });

            cartItemsContainer.addEventListener('change', (e) => {
                if (e.target.classList.contains('quantity-input')) {
                    const productId = parseInt(e.target.dataset.productId);
                    const newQuantity = parseInt(e.target.value);
                    updateCartQuantity(productId, newQuantity);
                }
            });


            // --- Initial Load ---
            fetchProducts();
            updateCartUI(); // Initial UI update for cart
        });
    