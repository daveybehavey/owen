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

// 🛒 Cart: initialize from localStorage (source of truth)
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

// 💾 Persist cart
function saveCart() {
  localStorage.setItem('ocMusicCart', JSON.stringify(cart));
}

// ➕ Add to Cart
document.addEventListener('click', function (e) {
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
    saveCart();
    showToast(`${name} added to cart!`, { type: 'success' });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // 🛍️ Home page: render products & wire modal
  if (document.getElementById('beats')) {
    renderItems(beats, 'beats');
    renderItems(kits, 'kits');
    renderItems(sounds, 'sounds');

    // Modal refs
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');

    // 🔄 Render cart inside modal (with remove & qty controls)
    function renderCartInModal() {
      if (!cartItemsContainer) return;
      cartItemsContainer.innerHTML = '';

      if (!cart.length) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        if (cartSubtotal) cartSubtotal.textContent = '0.00';
        return;
      }

      const list = document.createElement('ul');
      list.className = 'cart-list';

      cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-row';
        li.innerHTML = `
          <div class="cart-info">
            <div class="cart-name">${item.name}</div>
            <div class="cart-price">$${item.price.toFixed(2)}</div>
          </div>

          <div class="qty-controls" data-id="${item.id}">
            <button class="icon-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease ${item.name}">−</button>
            <span class="qty" aria-live="polite">${item.quantity}</span>
            <button class="icon-btn" data-action="inc" data-id="${item.id}" aria-label="Increase ${item.name}">+</button>
          </div>

          <div class="line-total">$${(item.price * item.quantity).toFixed(2)}</div>

          <button class="icon-btn remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button>
        `;
        list.appendChild(li);
      });

      cartItemsContainer.appendChild(list);

      const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
    }

    // ♻️ Handle clicks in modal (inc/dec/remove) via delegation
    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', (e) => {
        const action = e.target?.dataset?.action;
        const id = e.target?.dataset?.id;
        if (!action || !id) return;

        const idx = cart.findIndex(i => i.id === id);
        if (idx === -1) return;

        if (action === 'inc') {
          cart[idx].quantity++;
        } else if (action === 'dec') {
          cart[idx].quantity--;
          if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        } else if (action === 'remove') {
          cart.splice(idx, 1);
        }

        saveCart();
        renderCartInModal();
      });
    }

    // Open/close modal
    if (openCartBtn && cartModal) {
      openCartBtn.addEventListener('click', () => {
        renderCartInModal();
        cartModal.classList.remove('hidden');
      });
    }
    if (closeCartBtn && cartModal) {
      closeCartBtn.addEventListener('click', () => {
        cartModal.classList.add('hidden');
      });
    }

    // 🔝 Smooth scroll to top (home only)
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // 🧾 Checkout page rendering (read-only list)
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

// 🔔 Lightweight toast / snackbar
function showToast(message, opts = {}) {
  const { type = 'info', duration = 2500 } = opts;

  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast__msg">${message}</span>
    <button class="toast__close" aria-label="Dismiss">×</button>
  `;

  toast.addEventListener('click', (e) => {
    if (e.target.classList.contains('toast__close') || e.currentTarget === e.target) {
      hideToast(toast);
    }
  });

  container.appendChild(toast);
  void toast.offsetWidth; // ensure animation
  toast.classList.add('toast--in');

  const hideTimer = setTimeout(() => hideToast(toast), duration);

  function hideToast(el) {
    clearTimeout(hideTimer);
    el.classList.remove('toast--in');
    el.classList.add('toast--out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  // Optional: keep newest 4
  const toasts = container.querySelectorAll('.toast');
  if (toasts.length > 4) {
    [...toasts].slice(0, toasts.length - 4).forEach(t => t.dispatchEvent(new Event('click')));
  }
}
