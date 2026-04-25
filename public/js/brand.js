const API_BASE = "/api";
const FALLBACK_IMAGE = "images/no-image.png";

const params = new URLSearchParams(window.location.search);
const selectedBrand = decodeURIComponent(params.get("brand") || "");
const selectedCategory = decodeURIComponent(params.get("cat") || "");

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isProductActive(product) {
  return product?.aktif !== false;
}

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

async function getProducts() {
  const data = await apiGet(`${API_BASE}/products`);
  return data.filter(isProductActive);
}

async function getCategories() {
  return await apiGet(`${API_BASE}/categories`);
}

function initCategoryDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  const button = document.getElementById("categories-menu-btn");

  if (!dropdown || !button) return;

  button.addEventListener("click", (e) => {
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
  const categoriesMenu = document.getElementById("categories-menu");
  const footerCategories = document.getElementById("footerCategories");
  const popularBrands = document.getElementById("popularBrands");

  const categoryNames = categories.map(c => c.kategoriAdi).sort();
  const brands = [...new Set(products.map(p => p.aracMarkasi))].sort();

  categoriesMenu.innerHTML = categoryNames.map(c =>
    `<a href="category.html?cat=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`
  ).join("");

  footerCategories.innerHTML = categoriesMenu.innerHTML;

  popularBrands.innerHTML = brands.slice(0,6).map(b =>
    `<a href="brand.html?brand=${encodeURIComponent(b)}">${escapeHtml(b)}</a>`
  ).join("");
}

function fillSelect(selectEl, values, placeholder) {
  const unique = [...new Set(values.filter(Boolean))].sort();

  selectEl.innerHTML =
    `<option value="">${placeholder}</option>` +
    unique.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
}

function productCard(p) {
  const id = p._id;
  const stock = Number(p.urunStogu || 0);
  const img = p.urunGorselData || FALLBACK_IMAGE;

  return `
    <a class="card-link" href="product.html?id=${id}">
      <article class="search-result-card">
        <img src="${img}" onerror="this.src='${FALLBACK_IMAGE}'">
        <div class="card-body">
          <div class="name">${escapeHtml(p.urunAdi)}</div>
          <div class="brand">${escapeHtml(p.urunMarkasi)} • ${escapeHtml(p.urunModeli)}</div>
          <div class="meta">${escapeHtml(p.urunKategori)} • ${escapeHtml(p.urunYili)}</div>
          <div class="card-bottom">
            <div class="price">₺${Number(p.urunFiyati).toLocaleString("tr-TR")}</div>
            <span class="${stock>0?"badge-stock":"badge-stock badge-out"}">
              ${stock>0?`Stok: ${stock}`:"Stok yok"}
            </span>
          </div>
        </div>
      </article>
    </a>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  initCategoryDropdown();

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);

  buildMenus(categories, products);

  const title = document.getElementById("brand-title");
  const subtitle = document.getElementById("brand-subtitle");
  const grid = document.getElementById("brandCategoryGrid");
  const list = document.getElementById("productList");

  const searchInput = document.getElementById("searchInput");
  const brandFilter = document.getElementById("productBrandFilter");
  const modelFilter = document.getElementById("modelFilter");
  const yearFilter = document.getElementById("yearFilter");

  if (!selectedBrand) {
    list.innerHTML = "<div class='card'><div class='card-body'>Marka seçilmedi</div></div>";
    return;
  }

  title.textContent = selectedBrand;
  subtitle.textContent = `${selectedBrand} araçları için ürünler`;

  const brandProducts = products.filter(p =>
    normalize(p.aracMarkasi) === normalize(selectedBrand)
  );

  const categoryProducts = brandProducts.filter(p =>
    !selectedCategory || normalize(p.urunKategori) === normalize(selectedCategory)
  );

  // KATEGORİ KARTLARI
  const cats = [...new Set(brandProducts.map(p => p.urunKategori))];

  grid.innerHTML = cats.map(c => `
    <a class="brand-card" href="brand.html?brand=${selectedBrand}&cat=${c}">
      <div class="brand-title">${c}</div>
    </a>
  `).join("");

  // FILTER DOLDUR
  fillSelect(brandFilter, categoryProducts.map(p => p.urunMarkasi), "Ürün markası");
  fillSelect(modelFilter, categoryProducts.map(p => p.urunModeli), "Model");
  fillSelect(yearFilter, categoryProducts.map(p => p.urunYili), "Yıl");

  function render() {
    const search = normalize(searchInput.value);
    const pb = normalize(brandFilter.value);
    const model = normalize(modelFilter.value);
    const year = normalize(yearFilter.value);

    const filtered = categoryProducts.filter(p => {
      return (
        (!pb || normalize(p.urunMarkasi) === pb) &&
        (!model || normalize(p.urunModeli) === model) &&
        (!year || normalize(p.urunYili) === year) &&
        normalize([
          p.urunAdi,
          p.urunOEM,
          p.urunKodu,
          p.urunAciklama
        ].join(" ")).includes(search)
      );
    });

    if (!filtered.length) {
      list.innerHTML = "<div class='card'><div class='card-body'>Ürün bulunamadı</div></div>";
      return;
    }

    list.innerHTML = filtered.map(productCard).join("");
  }

  let timer;
  searchInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 250);
  });

  brandFilter.addEventListener("change", render);
  modelFilter.addEventListener("change", render);
  yearFilter.addEventListener("change", render);

  render();
});