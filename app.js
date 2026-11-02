const STORAGE_KEY = 'coffeeStampLoyaltyApp';

const defaultState = {
  shop: {
    name: 'Brew & Bloom',
    threshold: 8,
    accentColor: '#7b4b2a',
  },
  customers: [
    { id: crypto.randomUUID(), name: 'Jamie Smith', stamps: 5, freeCoffees: 0 },
    { id: crypto.randomUUID(), name: 'Rina Patel', stamps: 8, freeCoffees: 1 },
  ],
};

const elements = {
  shopNameDisplay: document.querySelector('#shopNameDisplay'),
  shopSettingsButton: document.querySelector('#shopSettingsButton'),
  shopForm: document.querySelector('#shopForm'),
  shopNameInput: document.querySelector('#shopNameInput'),
  thresholdInput: document.querySelector('#thresholdInput'),
  accentColorInput: document.querySelector('#accentColorInput'),
  customerForm: document.querySelector('#customerForm'),
  customerNameInput: document.querySelector('#customerNameInput'),
  customerList: document.querySelector('#customerList'),
  customerCountBadge: document.querySelector('#customerCountBadge'),
  shopPanel: document.querySelector('#shopPanel'),
  customerCardTemplate: document.querySelector('#customerCardTemplate'),
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);

    return {
      shop: {
        ...defaultState.shop,
        ...saved.shop,
      },
      customers: Array.isArray(saved.customers) ? saved.customers : defaultState.customers,
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getThreshold() {
  const threshold = Number(state.shop.threshold);
  return Number.isFinite(threshold) && threshold > 0 ? threshold : 8;
}

function formatCustomerStamps(customer) {
  const threshold = getThreshold();
  const stamps = Number(customer.stamps) || 0;
  const freeCount = Number(customer.freeCoffees) || 0;
  const remaining = stamps % threshold;
  const progress = Math.min((stamps / threshold) * 100, 100);

  return {
    freeCount,
    remaining,
    progress,
    threshold,
  };
}

function renderShop() {
  const { shop } = state;
  elements.shopNameDisplay.textContent = shop.name || 'Brew & Bloom';
  elements.shopNameInput.value = shop.name || '';
  elements.thresholdInput.value = String(getThreshold());
  elements.accentColorInput.value = shop.accentColor || '#7b4b2a';

  document.documentElement.style.setProperty('--primary', shop.accentColor || '#7b4b2a');
  document.documentElement.style.setProperty('--primary-dark', shadeColor(shop.accentColor || '#7b4b2a', -18));
  document.documentElement.style.setProperty('--primary-soft', hexToRgba(shop.accentColor || '#7b4b2a', 0.12));
}

function renderCustomers() {
  const threshold = getThreshold();

  elements.customerCountBadge.textContent = String(state.customers.length);

  if (!state.customers.length) {
    elements.customerList.innerHTML = `
      <div class="empty-state">
        No customers yet. Add the first customer and start stamping coffees.
      </div>
    `;
    return;
  }

  elements.customerList.innerHTML = '';

  state.customers.forEach((customer) => {
    const card = elements.customerCardTemplate.content.firstElementChild.cloneNode(true);
    const { freeCount, progress, remaining } = formatCustomerStamps(customer);
    const freeReady = remaining === 0 && Number(customer.stamps) >= threshold && threshold > 0;

    card.querySelector('.customer-name').textContent = customer.name;
    card.querySelector('.stamps-count').textContent = `${customer.stamps} / ${threshold}`;
    card.querySelector('.free-count').textContent = `${freeCount} free coffee${freeCount === 1 ? '' : 's'} earned`;
    card.querySelector('.progress-fill').style.width = `${Math.min(progress, 100)}%`;

    const statusPill = card.querySelector('.free-status');
    statusPill.textContent = freeReady ? 'Free coffee ready' : 'Collecting stamps';
    statusPill.classList.toggle('is-muted', !freeReady);

    const stampButton = card.querySelector('.stamp-button');
    stampButton.addEventListener('click', () => addStamp(customer.id));

    const removeButton = card.querySelector('.remove-button');
    removeButton.addEventListener('click', () => removeStamp(customer.id));

    elements.customerList.appendChild(card);
  });
}

function render() {
  renderShop();
  renderCustomers();
}

function addStamp(customerId) {
  const customer = state.customers.find((item) => item.id === customerId);
  if (!customer) return;

  const threshold = getThreshold();
  customer.stamps += 1;

  if (customer.stamps >= threshold) {
    customer.freeCoffees += 1;
    customer.stamps = customer.stamps - threshold;
  }

  saveState();
  render();
}

function removeStamp(customerId) {
  const customer = state.customers.find((item) => item.id === customerId);
  if (!customer) return;

  customer.stamps = Math.max(0, Number(customer.stamps) - 1);
  saveState();
  render();
}

function handleShopSubmit(event) {
  event.preventDefault();

  const trimmedName = elements.shopNameInput.value.trim();
  const nextThreshold = Number(elements.thresholdInput.value);
  const accentColor = elements.accentColorInput.value || '#7b4b2a';

  state.shop.name = trimmedName || 'Brew & Bloom';
  state.shop.threshold = Number.isFinite(nextThreshold) ? Math.max(2, Math.min(30, nextThreshold)) : 8;
  state.shop.accentColor = accentColor;

  saveState();
  render();
}

function handleCustomerSubmit(event) {
  event.preventDefault();

  const name = elements.customerNameInput.value.trim();
  if (!name) return;

  state.customers.push({
    id: crypto.randomUUID(),
    name,
    stamps: 0,
    freeCoffees: 0,
  });

  elements.customerNameInput.value = '';
  saveState();
  render();
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadeColor(hex, percent) {
  const normalized = hex.replace('#', '');
  const num = Number.parseInt(normalized, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.max(0, r + (r * percent) / 100));
  g = Math.min(255, Math.max(0, g + (g * percent) / 100));
  b = Math.min(255, Math.max(0, b + (b * percent) / 100));

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function toggleShopPanel() {
  const isHidden = elements.shopPanel.style.display === 'none';
  elements.shopPanel.style.display = isHidden ? 'block' : 'none';
}

elements.shopForm.addEventListener('submit', handleShopSubmit);
elements.customerForm.addEventListener('submit', handleCustomerSubmit);
elements.shopSettingsButton.addEventListener('click', toggleShopPanel);

render();
