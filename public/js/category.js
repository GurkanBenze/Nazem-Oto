const API_BASE = "/api";
const FALLBACK_IMAGE = "images/no-image.png";

const params = new URLSearchParams(window.location.search);
const selectedCategory = decodeURIComponent(params.get("cat") || "");

const title = document.getElementById("cat-title");
const productList = document.getElementById("productList");
const brandFilter = document.getElementById("brandFilter");
const modelFilter = document.getElementById("modelFilter");
const searchInput = document.getElementById("searchInput");

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

async function apiGet(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`İstek başarısız: ${response.status}`);
  }

  return response.json();
}

function isProductActive(product) {
  if (typeof product.aktifMi === "boolean") return product.aktifMi;
  if (typeof product.aktif === "boolean") return product.aktif;
  if (typeof product.isActive === "boolean") return product.isActive;
  if (typeof product.active === "boolean") return product.active;
  return true;
}

function getImageSrc(product) {
  return product?.urunGorselData || product?.urunGorsel || FALLBACK_IMAGE;
}

async function getProducts() {
  try {
    const data = await apiGet(`${API_BASE}/products`);
    return Array.isArray(data) ? data.filter(isProductActive) : [];
  } catch (error) {
    console.error("Ürünler alınamadı:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const data = await apiGet(`${API_BASE}/categories`);
    return Array.isArray(data) ? data.filter((c) => c?.kategoriAdi) : [];
  } catch (error) {
    console.error("Kategoriler alınamadı:", error);
    return [];
  }
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

  const categoryNames = categories
    .map((c) => c.kategoriAdi)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "tr"));

  const vehicleBrands = [
    ...new Set(products.map((p) => p.aracMarkasi).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "tr"));

  const categoryLinks = categoryNames
    .map(
      (cat) =>
        `<a href="category.html?cat=${encodeURIComponent(cat)}">${escapeHtml(cat)}</a>`,
    )
    .join("");

  if (categoriesMenu) {
    categoriesMenu.innerHTML = categoryLinks;
  }

  if (footerCategories) {
    footerCategories.innerHTML = categoryLinks;
  }

  if (popularBrands) {
    popularBrands.innerHTML = vehicleBrands
      .slice(0, 6)
      .map(
        (brand) =>
          `<a href="brand.html?brand=${encodeURIComponent(brand)}">${escapeHtml(brand)}</a>`,
      )
      .join("");
  }
}

function fillSelect(selectEl, values, placeholder) {
  if (!selectEl) return;

  const uniqueSorted = [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "tr"),
  );

  selectEl.innerHTML =
    `<option value="">${placeholder}</option>` +
    uniqueSorted
      .map(
        (value) =>
          `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`,
      )
      .join("");
}

function renderMessage(message) {
  if (!productList) return;

  productList.innerHTML = `
    <div class="card">
      <div class="card-body">${escapeHtml(message)}</div>
    </div>
  `;
}

function productCardTemplate(product) {
  const productId = product._id || product.id;
  if (!productId) return "";

  const stock = Number(product.urunStogu || 0);
  const imageSrc = getImageSrc(product);

  return `
    <a class="card-link" href="product.html?id=${encodeURIComponent(productId)}">
      <article class="search-result-card">
        <img
          src="${escapeHtml(imageSrc)}"
          alt="${escapeHtml(product.urunAdi || "Ürün görseli")}"
          onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
        >
        <div class="card-body">
          <div class="name">${escapeHtml(product.urunAdi || "-")}</div>
          <div class="brand">${escapeHtml(product.aracMarkasi || "-")} • ${escapeHtml(product.urunModeli || "-")}</div>
          <div class="meta">${escapeHtml(product.urunAltKategori || "-")} • ${escapeHtml(product.urunYili || "-")}</div>
          <div class="card-bottom">
            <div class="price">₺${Number(product.urunFiyati || 0).toLocaleString("tr-TR")}</div>
            <span class="${stock > 0 ? "badge-stock" : "badge-stock badge-out"}">
              ${stock > 0 ? `Stok: ${stock}` : "Stokta yok"}
            </span>
          </div>
        </div>
      </article>
    </a>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  initCategoryDropdown();

  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  buildMenus(categories, allProducts);

  if (title && selectedCategory) {
    title.textContent = selectedCategory;
  }

  if (!selectedCategory) {
    if (title) title.textContent = "Kategori";
    renderMessage("Kategori seçilmedi.");
    return;
  }

  const categoryProducts = allProducts.filter(
    (p) => normalize(p.urunKategori) === normalize(selectedCategory),
  );

  if (!categoryProducts.length) {
    renderMessage("Bu kategoriye ait ürün bulunamadı.");
    return;
  }

  fillSelect(
    brandFilter,
    categoryProducts.map((p) => p.aracMarkasi),
    "Tüm Markalar",
  );

  fillSelect(
    modelFilter,
    categoryProducts.map((p) => p.urunModeli),
    "Tüm Modeller",
  );

  function render() {
    const search = normalize(searchInput?.value || "");
    const brand = normalize(brandFilter?.value || "");
    const model = normalize(modelFilter?.value || "");

    const filtered = categoryProducts.filter((p) => {
      const searchPool = normalize(
        [
          p.urunAdi,
          p.urunAciklama,
          p.urunOEM,
          p.urunKodu,
          p.urunBarkodu,
          p.aracMarkasi,
          p.urunMarkasi,
          p.urunModeli,
          p.urunKategori,
          p.urunAltKategori,
          p.urunYili,
          p.uyumluAraclar,
        ].join(" "),
      );

      return (
        (!brand || normalize(p.aracMarkasi) === brand) &&
        (!model || normalize(p.urunModeli) === model) &&
        (!search || searchPool.includes(search))
      );
    });

    if (!productList) return;

    if (!filtered.length) {
      renderMessage("Bu filtrelere uygun ürün bulunamadı.");
      return;
    }

    productList.innerHTML = filtered.map(productCardTemplate).join("");
  }

  let searchTimer;

  searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 250);
  });

  brandFilter?.addEventListener("change", render);
  modelFilter?.addEventListener("change", render);

  render();
});