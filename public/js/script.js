const API_BASE = "/api";
const FALLBACK_IMAGE = "images/no-image.png";

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

function slugify(text) {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function heroSliderInit() {
  const heroSlider = document.getElementById("hero-slider");
  if (!heroSlider) return;

  const slides = heroSlider.querySelectorAll(".slide");
  const dotsContainer = document.getElementById("hero-dots");
  const prevBtn = heroSlider.querySelector(".prev");
  const nextBtn = heroSlider.querySelector(".next");
  const slidesWrap = heroSlider.querySelector(".slides");

  let index = 0;
  let interval = null;

  if (!slides.length || !dotsContainer || !slidesWrap) return;

  dotsContainer.innerHTML = "";

  function showSlide(i) {
    index = i;
    slides.forEach((s) => s.classList.remove("active"));
    dotsContainer
      .querySelectorAll("span")
      .forEach((d) => d.classList.remove("active"));

    slides[index]?.classList.add("active");
    dotsContainer.querySelectorAll("span")[index]?.classList.add("active");
    slidesWrap.style.transform = `translateX(-${100 * index}%)`;
  }

  function startAutoSlide() {
    clearInterval(interval);
    interval = setInterval(() => {
      index = (index + 1) % slides.length;
      showSlide(index);
    }, 4000);
  }

  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      showSlide(i);
      startAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });

  prevBtn?.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
    startAutoSlide();
  });

  nextBtn?.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
    startAutoSlide();
  });

  showSlide(0);
  startAutoSlide();
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

function fillFilterSelect(selectId, values, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const uniqueSorted = [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "tr"),
  );

  select.innerHTML =
    `<option value="">${placeholder}</option>` +
    uniqueSorted
      .map(
        (value) =>
          `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`,
      )
      .join("");
}

function bindCategorySliders() {
  document.querySelectorAll(".category-section").forEach((section) => {
    const track = section.querySelector(".slider-track");
    const prev = section.querySelector(".prev");
    const next = section.querySelector(".next");
    if (!track) return;

    if (track.children.length <= 1) {
      if (prev) prev.style.display = "none";
      if (next) next.style.display = "none";
      return;
    }
    let offset = 0;
    const cardWidth = 166;
    const visible =
      window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 4;
    const maxOffset = Math.max(
      0,
      (track.children.length - visible) * cardWidth,
    );

    next?.addEventListener("click", () => {
      offset += cardWidth * visible;
      if (offset > maxOffset) offset = 0;
      track.style.transform = `translateX(-${offset}px)`;
    });

    prev?.addEventListener("click", () => {
      offset -= cardWidth * visible;
      if (offset < 0) offset = maxOffset;
      track.style.transform = `translateX(-${offset}px)`;
    });
  });
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
        />
        <div class="card-body">
          <div class="name">${escapeHtml(product.urunAdi || "-")}</div>
          <div class="brand">${escapeHtml(product.aracMarkasi || "-")} • ${escapeHtml(product.urunModeli || "-")}</div>
          <div class="meta">${escapeHtml(product.urunKategori || "-")} / ${escapeHtml(product.urunAltKategori || "-")}</div>
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

function isSearchActive() {
  return (
    (document.getElementById("searchInput")?.value.trim() || "") !== "" ||
    (document.getElementById("filterCategory")?.value || "") !== "" ||
    (document.getElementById("filterBrand")?.value || "") !== "" ||
    (document.getElementById("filterModel")?.value || "") !== "" ||
    (document.getElementById("filterYear")?.value || "") !== "" ||
    document.getElementById("stockOnly")?.checked ||
    false
  );
}

function filterProducts(products) {
  const search = normalize(document.getElementById("searchInput")?.value || "");
  const category = normalize(
    document.getElementById("filterCategory")?.value || "",
  );
  const vehicleBrand = normalize(
    document.getElementById("filterBrand")?.value || "",
  );
  const model = normalize(document.getElementById("filterModel")?.value || "");
  const year = normalize(document.getElementById("filterYear")?.value || "");
  const stockOnly = document.getElementById("stockOnly")?.checked || false;

  return products.filter((p) => {
    const pool = normalize(
      [
        p.urunAdi,
        p.aracMarkasi,
        p.urunKategori,
        p.urunAltKategori,
        p.urunMarkasi,
        p.urunModeli,
        p.urunYili,
        p.urunOEM,
        p.urunBarkodu,
        p.urunKodu,
        p.urunAciklama,
        p.uyumluAraclar,
      ].join(" "),
    );

    return (
      (!search || pool.includes(search)) &&
      (!category || normalize(p.urunKategori) === category) &&
      (!vehicleBrand || normalize(p.aracMarkasi) === vehicleBrand) &&
      (!model || normalize(p.urunModeli) === model) &&
      (!year || normalize(p.urunYili) === year) &&
      (!stockOnly || Number(p.urunStogu || 0) > 0)
    );
  });
}

function renderSearchResults(results) {
  const section = document.getElementById("resultsSection");
  const container = document.getElementById("searchResults");
  const count = document.getElementById("resultCount");
  if (!section || !container || !count) return;

  if (!isSearchActive()) {
    section.style.display = "none";
    container.innerHTML = "";
    count.textContent = "";
    return;
  }

  section.style.display = "block";
  count.textContent = `${results.length} ürün`;

  if (!results.length) {
    container.innerHTML =
      '<div class="card"><div class="card-body">Aramanıza uygun ürün bulunamadı.</div></div>';
    return;
  }

  container.innerHTML = results.map(productCardTemplate).join("");
}

function buildMenus(categories) {
  const categoriesMenu = document.getElementById("categories-menu");
  const footerCategories = document.getElementById("footerCategories");

  if (categoriesMenu) {
    categoriesMenu.innerHTML = categories
      .map(
        (cat) =>
          `<a href="category.html?cat=${encodeURIComponent(cat.kategoriAdi)}">${escapeHtml(cat.kategoriAdi)}</a>`,
      )
      .join("");
  }

  if (footerCategories) {
    footerCategories.innerHTML = categories
      .map(
        (cat) =>
          `<a href="category.html?cat=${encodeURIComponent(cat.kategoriAdi)}">${escapeHtml(cat.kategoriAdi)}</a>`,
      )
      .join("");
  }
}

function buildFilters(products, categories) {
  fillFilterSelect(
    "filterCategory",
    categories.map((c) => c.kategoriAdi),
    "Tüm kategoriler",
  );

  fillFilterSelect(
    "filterBrand",
    products.map((p) => p.aracMarkasi),
    "Tüm araç markaları",
  );

  fillFilterSelect(
    "filterModel",
    products.map((p) => p.urunModeli),
    "Tüm modeller",
  );

  fillFilterSelect(
    "filterYear",
    products.map((p) => p.urunYili),
    "Tüm yıllar",
  );
}

function renderCategorySections(products, categories) {
  const area = document.getElementById("category-area");
  if (!area) return;

  const validCategories = categories.filter(
    (category) => category?.kategoriAdi,
  );

  area.innerHTML = validCategories
    .map((category, index) => {
      const categoryName = category.kategoriAdi;

      const categoryProducts = products
        .filter((p) => normalize(p.urunKategori) === normalize(categoryName))
        .slice(0, 8);

      const cards = categoryProducts
        .map((p) => {
          const imageSrc = getImageSrc(p);

          return `
            <a class="card-link product-card" href="category.html?cat=${encodeURIComponent(categoryName)}">
              <img
                src="${escapeHtml(imageSrc)}"
                alt="${escapeHtml(p.urunAdi || "Ürün görseli")}"
                onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
              />
              <div class="card-body">
                <div class="name">${escapeHtml(p.urunAdi || "-")}</div>
                <div class="brand">${escapeHtml(p.aracMarkasi || "-")} • ${escapeHtml(p.urunModeli || "-")}</div>
                <div class="meta">${escapeHtml(p.urunAltKategori || "-")} • ${escapeHtml(p.urunYili || "-")}</div>
                <div class="card-bottom">
                  <div class="price">₺${Number(p.urunFiyati || 0).toLocaleString("tr-TR")}</div>
                  <span class="badge-stock">Tümünü Gör →</span>
                </div>
              </div>
            </a>
          `;
        })
        .join("");

      return `
        <section class="category-section" id="category-${slugify(categoryName)}">
          <div class="section-head">
            <h2>
              <a class="category-link-title" href="category.html?cat=${encodeURIComponent(categoryName)}">
                ${escapeHtml(categoryName)}
              </a>
            </h2>
            <span class="section-sub">${categoryProducts.length} öne çıkan ürün</span>
          </div>
          <div class="slider-container">
            <button class="slider-btn prev" type="button">‹</button>
            <div class="slider-track" id="slider-${index}">
              ${cards || '<div class="card"><div class="card-body">Bu kategoride ürün bulunamadı.</div></div>'}
            </div>
            <button class="slider-btn next" type="button">›</button>
          </div>
        </section>
      `;
    })
    .join("");

  bindCategorySliders();
}

function bindFilters(products) {
  [
    "searchInput",
    "filterCategory",
    "filterBrand",
    "filterModel",
    "filterYear",
    "stockOnly",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const eventName = id === "searchInput" ? "input" : "change";
    el.addEventListener(eventName, () => {
      const filtered = filterProducts(products);
      renderSearchResults(filtered);
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initCategoryDropdown();
  heroSliderInit();

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  buildMenus(categories);
  buildFilters(products, categories);
  bindFilters(products);
  renderCategorySections(products, categories);
  renderSearchResults([]);
});
