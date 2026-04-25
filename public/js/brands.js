const API_BASE = "/api";
const FALLBACK_IMAGE = "images/no-image.png";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API hata: ${res.status}`);
  return res.json();
}

function isActive(p) {
  return p?.aktif !== false;
}

async function loadData() {
  try {
    const [products, categories] = await Promise.all([
      apiGet(`${API_BASE}/products`),
      apiGet(`${API_BASE}/categories`)
    ]);

    return {
      products: (products || []).filter(isActive),
      categories: categories || []
    };
  } catch (err) {
    console.error("Veri alınamadı:", err);
    return { products: [], categories: [] };
  }
}

function initDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  const btn = document.getElementById("categories-menu-btn");

  if (!dropdown || !btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}

function buildMenus(categories, products) {
  const menu = document.getElementById("categories-menu");
  const footer = document.getElementById("footerCategories");
  const popular = document.getElementById("popularBrands");

  const cats = categories
    .map(c => c.kategoriAdi)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "tr"));

  const brands = [...new Set(
    products.map(p => p.aracMarkasi).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "tr"));

  const catHTML = cats.map(c =>
    `<a href="category.html?cat=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`
  ).join("");

  if (menu) menu.innerHTML = catHTML;
  if (footer) footer.innerHTML = catHTML;

  if (popular) {
    popular.innerHTML = brands.slice(0,6).map(b =>
      `<a href="brand.html?brand=${encodeURIComponent(b)}">${escapeHtml(b)}</a>`
    ).join("");
  }
}

function renderBrands(products) {
  const grid = document.getElementById("brandsGrid");
  if (!grid) return;

  const brands = [...new Set(
    products.map(p => p.aracMarkasi).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "tr"));

  if (!brands.length) {
    grid.innerHTML = `
      <div class="card">
        <div class="card-body">Henüz araç markası bulunmuyor.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = brands.map((brand, i) => `
    <a class="brand-card" href="brand.html?brand=${encodeURIComponent(brand)}">
      <div class="brand-logo-box">
        <img 
          src="https://picsum.photos/seed/brand-${i}/120/120" 
          alt="${escapeHtml(brand)}"
          onerror="this.src='${FALLBACK_IMAGE}'"
        >
      </div>
      <div class="brand-title">${escapeHtml(brand)}</div>
    </a>
  `).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  initDropdown();

  const { products, categories } = await loadData();

  buildMenus(categories, products);
  renderBrands(products);
});