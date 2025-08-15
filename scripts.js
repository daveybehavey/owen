// 🟨 Sample Data for Beats, Kits, Sounds
const beats = [
  { id: 'beat1', name: 'Smooth Beat', price: 10 },
  { id: 'beat2', name: 'Hard Hit', price: 15 }
];

const kits = [
  { id: 'kit1', name: 'Trap Kit', price: 12 },
  { id: 'kit2', name: 'Lo-Fi Kit', price: 8 }
];

const sounds = [
  { id: 'sound1', name: 'Ambient Pack', price: 5 },
  { id: 'sound2', name: 'FX Bundle', price: 7 }
];

// 🛒 Cart: initialize from localStorage (IMPORTANT)
// This preserves previous sessions and becomes our source of truth.
let cart = JSON.parse(localStorage.getItem('ocMusicCart')) || [];

// 🧠 Render Items to Grid
function renderItems(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.id = item.id;
    div.dataset.name = item.name;
    div.dataset.price = item.price;
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>$${item.price}</p>
      <button class="add-to-cart">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

// 💾 Helper: persist cart immediately after changes
function saveCart() {
  localStorage.setItem('ocMusicCart', JSON.stringify(cart));
}

// ➕ Add to Cart Handler (immediate persist so modal shows latest)
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-to-cart')) {
    const itemEl = e.target.closest('.item');
    const id = itemEl.dataset.id;
    const name = itemEl.dataset.name;
    const price = parseFloat(itemEl.dataset.price);

    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }

    saveCart(); // ← persist now
    alert(`${name} added to cart!`);
  }
});

// 🛍️ Render sections + homepage-only features
document.addEventListener('DOMContentLoaded', () => {
  // If we're on the home page (shop grids exist) render products
  if (document.getElementById('beats')) {
    renderItems(beats, 'beats');
    renderItems(kits, 'kits');
    renderItems(sounds, 'sounds');

    // 🛒 Cart modal logic (home page only)
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');

    function renderCartInModal() {
      cartItemsContainer.innerHTML = '';
      if (!cart.length) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        if (cartSubtotal) cartSubtotal.textContent = '0.00';
        return;
      }
      const list = document.createElement('ul');
      let subtotal = 0;
      cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} x ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`;
        list.appendChild(li);
        subtotal += item.price * item.quantity;
      });
      cartItemsContainer.appendChild(list);
      if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
    }

    if (openCartBtn && cartModal) {
      openCartBtn.addEventListener('click', () => {
        renderCartInModal();              // ← show latest state
        cartModal.classList.remove('hidden');
      });
    }
    if (closeCartBtn && cartModal) {
      closeCartBtn.addEventListener('click', () => {
        cartModal.classList.add('hidden');
      });
    }

    // 🔝 Smooth scroll to top on logo click (index.html only)
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // 🧾 Checkout Page Display
  if (window.location.pathname.includes('checkout.html')) {
    const cartData = JSON.parse(localStorage.getItem('ocMusicCart')) || [];
    const container = document.getElementById('cart-contents');

    if (!container) return;

    if (!cartData.length) {
      container.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      const list = document.createElement('ul');
      let total = 0;

      cartData.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} x ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`;
        list.appendChild(li);
        total += item.price * item.quantity;
      });

      const totalEl = document.createElement('p');
      totalEl.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;

      container.appendChild(list);
      container.appendChild(totalEl);
    }
  }
});

// (Optional safety) still keep beforeunload, but it’s redundant now:
// window.addEventListener('beforeunload', saveCart);
