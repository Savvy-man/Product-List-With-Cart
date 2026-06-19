
const fallbackData = [
  { "image": { "desktop": "https://unsplash.com" }, "name": "Waffle with Berries", "category": "Waffle", "price": 6.50 },
  { "image": { "desktop": "https://unsplash.com" }, "name": "Vanilla Bean Crème Brûlée", "category": "Crème Brûlée", "price": 7.00 },
  { "image": { "desktop": "https://unsplash.com" }, "name": "Macaron Mix Trio", "category": "Macaron", "price": 8.00 },
  { "image": { "desktop": "https://unsplash.com" }, "name": "Classic Tiramisu", "category": "Tiramisu", "price": 5.50 }
];

let productsData = [];
let cart = {};

function loadCache() {
  const cached = localStorage.getItem("fm_cart_state");
  if (cached) {
    try { 
      cart = JSON.parse(cached); 
    } catch(e) { 
      cart = {}; 
    }
  }
}

function saveCache() {
  localStorage.setItem("fm_cart_state", JSON.stringify(cart));
}

const fetchData = async () => {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("JSON Missing");
    productsData = await response.json();
  } catch (error) {
    console.warn("data.json not loaded, falling back to local fallback data.");
    productsData = fallbackData;
  }
  
  loadCache();
  renderProducts();
  updateCartUI();
};

function renderProducts() {
  const publicDiv = document.getElementById("public");
  if (!publicDiv) return;
  publicDiv.innerHTML = "";

  productsData.forEach((product, i) => {
    const qty = cart[i] || 0;
    const inCartClass = qty > 0 ? "in-cart" : "";
    
    const productDiv = document.createElement("div");
    productDiv.className = "edit29";
    productDiv.innerHTML = `
      <div class="box1 ${inCartClass}">
        <img class="pic1" src="${product.image.desktop}" alt="${product.name}">
        <button class="butt1" onclick="addToCart(${i})">
          Add to cart
        </button>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">-</button>
          <span style="font-weight:bold;">${qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
      <p>${product.category}</p>
      <h4>${product.name}</h4>
      <p><span style="color:orangered; font-weight:bold;">$${product.price.toFixed(2)}</span></p>
    `;
    publicDiv.appendChild(productDiv);
  });
}

function addToCart(index) {
  cart[index] = 1;
  saveCache();
  renderProducts();
  updateCartUI();
}

function changeQty(index, delta) {
  if (cart[index] !== undefined) {
    cart[index] += delta;
    if (cart[index] <= 0) {
      delete cart[index];
    }
  }
  saveCache();
  renderProducts();
  updateCartUI();
}

function removeFromCart(index) {
  delete cart[index];
  saveCache();
  renderProducts();
  updateCartUI();
}

function updateCartUI() {
  const cartList = document.getElementById("cart-items-list");
  const cartCountSpan = document.getElementById("cartItemCount");
  const cartTotalSpan = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  
  if (!cartList) return;

  const keys = Object.keys(cart);
  let totalItems = 0;
  let grandTotal = 0;

  if (keys.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty-state">
        <img src="./assets/images/illustration-empty-cart.svg" onerror="this.style.display='none'" alt="Empty" />
        <p>Your added items will appear here</p>
      </div>
    `;
    if (cartCountSpan) cartCountSpan.textContent = "0";
    if (cartTotalSpan) cartTotalSpan.textContent = "$0.00";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  cartList.innerHTML = "";
  
  keys.forEach(key => {
    const index = parseInt(key);
    const product = productsData[index];
    const qty = cart[key];
    if (!product) return;

    totalItems += qty;
    const lineTotal = product.price * qty;
    grandTotal += lineTotal;

    const itemRow = document.createElement("div");
    itemRow.className = "cart-item";
    itemRow.innerHTML = `
      <div class="cart-item-details">
        <h5>${product.name}</h5>
        <div class="cart-item-meta">
          <span class="cart-item-qty">${qty}x</span>
          <span class="cart-item-price">@ $${product.price.toFixed(2)}</span>
          <span class="cart-item-total">$${lineTotal.toFixed(2)}</span>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">&times;</button>
    `;
    cartList.appendChild(itemRow);
  });

  if (cartCountSpan) cartCountSpan.textContent = totalItems;
  if (cartTotalSpan) cartTotalSpan.textContent = `$${grandTotal.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const modalItems = document.getElementById("modalItems");
  const modalTotal = document.getElementById("modalTotal");
  const overlay = document.getElementById("modalOverlay");
  
  let totalCash = 0;
  modalItems.innerHTML = Object.keys(cart).map(key => {
    const item = productsData[key];
    const qty = cart[key];
    const cost = item.price * qty;
    totalCash += cost;
    return `
      <div class="modal-item-row">
        <span><strong>${qty}x</strong> ${item.name}</span>
        <span>$${cost.toFixed(2)}</span>
      </div>
    `;
  }).join("");

  modalTotal.textContent = `$${totalCash.toFixed(2)}`;
  overlay.style.display = "flex";
});

document.getElementById("modalNewOrder").addEventListener("click", () => {
  cart = {};
  saveCache();
  document.getElementById("modalOverlay").style.display = "none";
  renderProducts();
  updateCartUI();
});

window.addEventListener("DOMContentLoaded", fetchData);
