// Add this at the beginning of your main.js or in a new script
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add('fade-in');
});

// --- PRELOADER ---
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.style.display = "none";
  }
});

// Fallback for preloader in case 'load' event doesn't fire as expected or takes too long
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        // Ensure preloader is hidden after DOM is ready, with a slight delay
        setTimeout(() => {
            preloader.style.display = "none";
        }, 500); // Hide after 0.5 seconds even if 'load' isn't fully complete
    }
});

// --- PRODUCT DATABASE ---
const products = [
  {
    id: 1,
    title: "Classic Tee",
    price: 29.99,
    description: "A timeless wardrobe staple. This classic tee is made from 100% premium cotton for a soft feel and comfortable fit. Perfect for any occasion.",
    colors: [
      {
        name: "Black",
        color: "#000000",
        image: "classic tee.jpg",
      },
      {
        name: "White",
        color: "#FFFFFF",
        image: "https://i.imgur.com/b4M3xI2.jpeg",
      },
    ],
    sizes: ["S", "M", "L"],
    category: "Men",
  },
  {
    id: 2,
    title: "Linen Shirt",
    price: 49.99,
    description: "Lightweight and breathable linen shirt, perfect for warm weather. A relaxed fit for ultimate comfort and style.",
    colors: [
      {
        name: "Blue",
        color: "#3B5998",
        image: "linen shirts.webp",
      },
    ],
    sizes: ["S", "M", "L"],
    category: "Men",
  },
  {
    id: 3,
    title: "Slim Chinos",
    price: 59.99,
    description: "Modern slim-fit chinos crafted from a comfortable stretch fabric. Versatile for both casual and smart occasions.",
    colors: [
      {
        name: "Beige",
        color: "#F5F5DC",
        image: "slim chinos.webp",
      },
    ],
    sizes: ["S", "M", "L"],
    category: "Men",
  },
  {
    id: 4,
    title: "Leather Belt",
    price: 39.99,
    description: "High-quality genuine leather belt with a sleek buckle. A versatile accessory to complete any outfit.",
    colors: [
      {
        name: "Brown",
        color: "#A52A2A",
        image: "leather.jpg",
      },
    ],
    sizes: ["One Size"],
    category: "Accessories",
  },
  {
    id: 5,
    title: "Crewneck Sweater",
    price: 64.99,
    description: "Cozy crewneck sweater made from a soft wool blend. Ideal for layering and staying warm in cooler temperatures.",
    colors: [
      {
        name: "Blue",
        color: "#4682B4",
        image: "crew.jpg",
      },
      {
        name: "Gray",
        color: "#808080",
        image: "https://i.imgur.com/sI44xI4.jpeg",
      },
    ],
    sizes: ["S", "M", "L"],
    category: "Men",
  },
];

// --- WISHLIST LOGIC ---
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

function toggleWishlist(productId, iconElement) {
  let wishlist = getWishlist();
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
    if (iconElement) iconElement.classList.remove("active");
  } else {
    wishlist.push(productId);
    if (iconElement) iconElement.classList.add("active");
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistIcons();
  // If on wishlist page, re-render
  if (document.getElementById('wishlist-grid')) {
    renderWishlistPage();
  }
}

function updateWishlistIcons() {
  const wishlist = getWishlist();
  document.querySelectorAll(".wishlist-icon, .wishlist-icon-single").forEach((icon) => {
    const productId = parseInt(icon.dataset.id || icon.closest('.product-card')?.querySelector('a')?.href.split('id=')[1]);
    if (productId && wishlist.includes(productId)) {
      icon.classList.add("active");
    } else {
      icon.classList.remove("active");
    }
  });
}

// --- CART LOGIC ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function addToCart(productId, quantity, size, color) {
  let cart = getCart();

  // Check if item with same ID, size, and color already exists
  const existingItemIndex = cart.findIndex(
    (item) => item.productId === productId && item.size === size && item.color === color
  );

  if (existingItemIndex > -1) {
    // If exists, update quantity
    cart[existingItemIndex].quantity += quantity;
  } else {
    // If not, add new item
    const cartItem = {
      // Use product ID, size, and color as a unique identifier for the line item
      id: `${productId}-${size}-${color}`, // More robust unique ID
      productId,
      quantity,
      size,
      color,
    };
    cart.push(cartItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  showCartAlert("Item added to cart!", "success"); // Call the new alert function
}

function updateCartBadge() {
  const cart = getCart();
  const badge = document.querySelector(".cart-badge");
  if (badge) {
    // Badge now shows the number of unique line items
    badge.textContent = cart.length;
  }
}

// Function to display a Bootstrap alert
function showCartAlert(message, type) {
    const alertPlaceholder = document.getElementById('cart-alert-placeholder');
    if (!alertPlaceholder) return; // Exit if no placeholder on the page

    // Clear existing alerts to prevent multiple alerts stacking up too much
    alertPlaceholder.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
        `   <div>${message}</div>`,
        `   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
        `</div>`
    ].join('');

    alertPlaceholder.append(wrapper);

    // Automatically close the alert after 3 seconds
    setTimeout(() => {
        const alertElement = wrapper.querySelector('.alert');
        if (alertElement) {
            // Use Bootstrap's Alert instance to properly close and remove from DOM
            const bsAlert = bootstrap.Alert.getInstance(alertElement) || new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, 3000);
}


function removeFromCart(cartItemId) {
  let cart = getCart();
  const initialLength = cart.length;
  cart = cart.filter((item) => item.id !== cartItemId);
  if (cart.length < initialLength) { // Only update if an item was actually removed
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartPage(); // Re-render the cart
    updateCartBadge();
  } else {
    console.warn(`Attempted to remove item with ID: ${cartItemId}, but it was not found in the cart.`);
  }
}

// --- DYNAMIC CONTENT RENDERING ---

// Create a single product card
function createProductCard(product) {
  const wishlisted = isWishlisted(product.id);
  return `
    <div class="col-md-4 col-lg-3 mb-4">
      <div class="product-card">
        <i class="fas fa-heart wishlist-icon ${
          wishlisted ? "active" : ""
        }" data-id="${product.id}"></i>
        <a href="product.html?id=${product.id}">
          <img src="${product.colors[0].image}" alt="${
    product.title
  }" class="img-fluid" />
          <div class="product-card-body p-3">
            <h5 class="product-title">${product.title}</h5>
            <p class="product-price">$${product.price.toFixed(2)}</p>
          </div>
        </a>
      </div>
    </div>
  `;
}

// Render the entire Cart Page
function renderCartPage() {
  const cart = getCart();
  const container = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  if (!container || !subtotalEl || !totalEl) return; // Guard clause

  if (cart.length === 0) {
    container.innerHTML = `<p>Your cart is empty. <a href="products.html">Start shopping!</a></p>`;
    subtotalEl.innerHTML = `<span>Subtotal</span><span>$0.00</span>`;
    totalEl.innerHTML = `<span>Total</span><span>$0.00</span>`;
    // Disable checkout button if cart is empty
    const checkoutBtn = document.querySelector('a.btn-dark[href="checkout.html"]');
    if (checkoutBtn) {
        checkoutBtn.classList.add('disabled');
        checkoutBtn.setAttribute('aria-disabled', 'true');
    }
    return;
  }

  let subtotal = 0;
  container.innerHTML = ""; // Clear existing items

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
      // Note: Make sure the item.id is correctly passed to removeFromCart
      container.innerHTML += `
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div class="d-flex flex-row align-items-center">
                <div><img src="${
                  product.colors.find((c) => c.name === item.color)?.image ||
                  product.colors[0].image
                }" class="cart-item-img"></div>
                <div class="ms-3">
                  <h5>${product.title}</h5>
                  <p class="small mb-0">Color: ${item.color}, Size: ${
        item.size
      }</p>
                </div>
              </div>
              <div class="d-flex flex-row align-items-center">
                <div style="width: 50px;"><h5 class="fw-normal mb-0">${
                  item.quantity
                }</h5></div>
                <div style="width: 80px;"><h5 class="mb-0">$${(
                  product.price * item.quantity
                ).toFixed(2)}</h5></div>
                <a href="#!" style="color: #cecece;" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></a>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  });

  subtotalEl.innerHTML = `<span>Subtotal</span><span>$${subtotal.toFixed(
    2
  )}</span>`;
  totalEl.innerHTML = `<span>Total</span><span>$${subtotal.toFixed(2)}</span>`;

  // Enable checkout button if cart is not empty
  const checkoutBtn = document.querySelector('a.btn-dark[href="checkout.html"]');
  if (checkoutBtn) {
      checkoutBtn.classList.remove('disabled');
      checkoutBtn.removeAttribute('aria-disabled');
  }
}


function renderCheckoutPage() {
    const cart = getCart();
    const summaryContainer = document.getElementById('checkout-order-summary');
    const cartCount = document.getElementById('checkout-cart-count');

    if(!summaryContainer || !cartCount) return; // Guard clause

    cartCount.textContent = cart.length;
    let total = 0;

    summaryContainer.innerHTML = '';
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if(product) {
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            summaryContainer.innerHTML += `
                <li class="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <h6 class="my-0">${product.title}</h6>
                        <small class="text-muted">Qty: ${item.quantity}</small>
                    </div>
                    <span class="text-muted">$${itemTotal.toFixed(2)}</span>
                </li>
            `;
        }
    });

    summaryContainer.innerHTML += `
        <li class="list-group-item d-flex justify-content-between">
            <span>Total (USD)</span>
            <strong>$${total.toFixed(2)}</strong>
        </li>
    `;
}

// Render the Wishlist Page
function renderWishlistPage() {
  const wishlist = getWishlist();
  const grid = document.getElementById("wishlist-grid");
  if (!grid) return; // Guard clause

  if (wishlist.length === 0) {
    grid.innerHTML = `<p class="col-12">Your wishlist is empty. <a href="products.html">Explore products!</a></p>`;
    return;
  }
  grid.innerHTML = "";
  wishlist.forEach((productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      grid.innerHTML += createProductCard(product);
    }
  });
}

// --- INITIALIZE & EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  updateWishlistIcons();

  // Add event listeners for all wishlist icons on the page
  document.body.addEventListener("click", (e) => {
    // Handle product card wishlist icons
    if (e.target.matches(".wishlist-icon")) {
      const productId = parseInt(e.target.dataset.id);
      toggleWishlist(productId, e.target);
    }
    // Handle single product page wishlist icon
    if (e.target.matches(".wishlist-icon-single")) {
        const productId = parseInt(e.target.closest('#product-wishlist-icon').dataset.productId); // Get product ID from parent div
        if (productId) {
            toggleWishlist(productId, e.target);
        }
    }
  });

  // Populate best sellers on the homepage
  const bestSellersContainer = document.querySelector(
    "#best-sellers-section .row"
  );
  if (bestSellersContainer) {
    const bestSellers = products.slice(0, 4);
    bestSellers.forEach((product) => {
      bestSellersContainer.innerHTML += createProductCard(product);
    });
    updateWishlistIcons();
  }

  // Populate all products on the products page
  const productGrid = document.getElementById("product-grid");
  if (productGrid) {
    products.forEach((product) => {
      productGrid.innerHTML += createProductCard(product);
    });
    updateWishlistIcons();
  }

    // Call render functions for specific pages if their elements exist
    if (document.getElementById('cart-items-container')) {
        renderCartPage();
    }
    if (document.getElementById('wishlist-grid')) {
        renderWishlistPage();
    }
    if (document.getElementById('checkout-order-summary')) {
        renderCheckoutPage();
        // Add event listener for payment method selection on checkout page
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        const creditCardForm = document.getElementById('credit-card-form');

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'credit') {
                    creditCardForm.style.display = 'block';
                } else {
                    creditCardForm.style.display = 'none';
                }
            });
        });
        // Ensure initial state is correct (credit card form visible if default, hidden otherwise)
        const defaultPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (defaultPaymentMethod && defaultPaymentMethod.value !== 'credit') {
            creditCardForm.style.display = 'none';
        }
    }
});
