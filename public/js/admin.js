console.log("admin.js yüklendi");

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5002/api"
    : "https://nazem-oto.onrender.com/api";

const FALLBACK_IMAGE = "images/no-image.png";
const ADMIN_EMAIL = "admin@nazem.com";
const ADMIN_PASS = "12345";
const ADMIN_STORAGE_KEY = "adminLogged";

const state = {
  currentPage: "products",
  products: [],
  categories: [],
  selectedProductId: "",
};

const els = {
  emailField: document.getElementById("admin-email"),
  passField: document.getElementById("admin-pass"),
  loginBtn: document.getElementById("login-btn"),
  loginScreen: document.getElementById("login-screen"),
  dashboard: document.getElementById("dashboard"),
  errorMsg: document.getElementById("login-error"),
  logoutBtn: document.getElementById("logout-btn"),
  pageTitle: document.getElementById("page-title"),
  pageContent: document.getElementById("page-content"),
};

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPrice(value) {
  const num = Number(value) || 0;
  return `${num.toFixed(2)} TL`;
}

function calculateSalePrice(cost, margin) {
  const costNum = Number(cost) || 0;
  const marginNum = Number(margin) || 0;
  return costNum + (costNum * marginNum) / 100;
}

function getImageSrc(product) {
  return product?.urunGorselData || FALLBACK_IMAGE;
}

function isProductActive(product) {
  if (typeof product?.aktif === "boolean") return product.aktif;
  if (typeof product?.aktifMi === "boolean") return product.aktifMi;
  if (typeof product?.isActive === "boolean") return product.isActive;
  if (typeof product?.active === "boolean") return product.active;
  return true;
}

function showLogin() {
  els.dashboard.classList.add("hidden");
  els.dashboard.style.display = "none";
  els.loginScreen.classList.remove("hidden");
  els.loginScreen.style.display = "flex";
  els.emailField.value = "";
  els.passField.value = "";
  els.errorMsg.textContent = "";
}

function showDashboard() {
  els.loginScreen.classList.add("hidden");
  els.loginScreen.style.display = "none";
  els.dashboard.classList.remove("hidden");
  els.dashboard.style.display = "flex";
  els.errorMsg.textContent = "";
}

function setSidebarActive(page) {
  qsa(".sidebar nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `İstek başarısız: ${res.status}`);
  }

  return data;
}

async function fetchProducts() {
  const data = await apiRequest(`${API_BASE}/products`);
  state.products = Array.isArray(data) ? data : [];
  return state.products;
}

async function fetchProductById(productId) {
  return await apiRequest(`${API_BASE}/products/${productId}`);
}

async function fetchCategories() {
  const data = await apiRequest(`${API_BASE}/categories`);
  state.categories = Array.isArray(data) ? data : [];
  return state.categories;
}

async function createCategory(categoryData) {
  return await apiRequest(`${API_BASE}/categories`, {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

async function updateCategory(categoryId, categoryData) {
  return await apiRequest(`${API_BASE}/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
}

async function removeCategory(categoryId) {
  return await apiRequest(`${API_BASE}/categories/${categoryId}`, {
    method: "DELETE",
  });
}

async function createProduct(productData) {
  return await apiRequest(`${API_BASE}/products`, {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

async function updateProduct(productId, productData) {
  return await apiRequest(`${API_BASE}/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

async function removeProduct(productId) {
  return await apiRequest(`${API_BASE}/products/${productId}`, {
    method: "DELETE",
  });
}

async function ensureBootstrapData() {
  await Promise.all([fetchProducts(), fetchCategories()]);
}

function getCategoryByName(name) {
  return state.categories.find((c) => c.kategoriAdi === name);
}

function fillSelect(selectEl, values, placeholder, selectedValue = "") {
  if (!selectEl) return;

  const uniqueSorted = [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "tr"),
  );

  selectEl.innerHTML =
    `<option value="">${placeholder}</option>` +
    uniqueSorted
      .map((value) => {
        const selected =
          String(value) === String(selectedValue) ? "selected" : "";
        return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(value)}</option>`;
      })
      .join("");
}

async function populateCategorySelect(
  selectEl,
  includePlaceholder = true,
  selectedValue = "",
  placeholderText = "Kategori seçin",
) {
  if (!selectEl) return;

  if (!state.categories.length) {
    await fetchCategories();
  }

  selectEl.innerHTML = "";

  if (includePlaceholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholderText;
    selectEl.appendChild(opt);
  }

  [...state.categories]
    .sort((a, b) =>
      String(a.kategoriAdi).localeCompare(String(b.kategoriAdi), "tr"),
    )
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = category.kategoriAdi;
      option.textContent = category.kategoriAdi;
      if (category.kategoriAdi === selectedValue) option.selected = true;
      selectEl.appendChild(option);
    });
}

async function populateSubCategories(
  categorySelect,
  subCategorySelect,
  selectedSubCategory = "",
) {
  if (!subCategorySelect) return;

  const selectedCategory = categorySelect?.value || "";
  subCategorySelect.innerHTML = "";

  if (!selectedCategory) {
    subCategorySelect.innerHTML =
      '<option value="">Önce kategori seçin</option>';
    return;
  }

  if (!state.categories.length) {
    await fetchCategories();
  }

  const found = getCategoryByName(selectedCategory);
  const subCategories = found?.altKategoriler || [];

  subCategorySelect.innerHTML =
    '<option value="">Alt kategori seçin</option>' +
    subCategories
      .map((sub) => {
        const selected = sub === selectedSubCategory ? "selected" : "";
        return `<option value="${escapeHtml(sub)}" ${selected}>${escapeHtml(sub)}</option>`;
      })
      .join("");
}

function validateProductPayload(product) {
  if (!product.urunKategori) return "Kategori seçin.";
  if (!product.urunAdi) return "Ürün adı zorunlu.";
  if (!product.aracMarkasi) return "Araç markası seçin.";
  if (product.urunFiyati <= 0) return "Geçerli fiyat girin.";
  if (product.urunStogu < 0) return "Stok negatif olamaz.";
  if (Number(product.alisFiyati) < 0) return "Alış fiyatı negatif olamaz.";
  if (Number(product.karMarji) < 0) return "Kar marjı negatif olamaz.";
  return "";
}

function buildProductPayload(prefix = "", baseImageData = "") {
  const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

  const get = (id) =>
    document.getElementById(`${prefix}${id}`) ||
    document.getElementById(`${prefix}${lowerFirst(id)}`) ||
    document.getElementById(lowerFirst(id)) ||
    document.getElementById(id);

  const val = (id) => get(id)?.value?.trim() || "";
  const num = (id) => Number(val(id)) || 0;

  return {
    slug: slugify(val("UrunAdi")),
    urunKategori: val("UrunKategori"),
    urunAltKategori: val("UrunAltKategori"),
    urunAdi: val("UrunAdi"),
    aracMarkasi: val("AracMarkasi"),
    urunBarkodu: val("UrunBarkodu"),
    urunOEM: val("UrunOEM"),
    urunKodu: val("UrunKodu"),
    urunMarkasi: val("UrunMarkasi"),
    urunModeli: val("UrunModeli"),
    urunYili: val("UrunYili"),
    urunAciklama: val("UrunAciklama"),
    urunFiyati: num("UrunFiyati"),
    urunStogu: num("UrunStogu"),
    aktif: val("UrunAktif") === "true",
    alisFiyati: num("AlisFiyati"),
    karMarji: num("KarMarji"),
    urunGorselData: baseImageData || "",
  };
}

function createOverlay(innerHtml) {
  const overlay = document.createElement("div");
  overlay.className = "detail-overlay";
  overlay.innerHTML = innerHtml;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  return overlay;
}

async function openProductDetail(productId) {
  let product;

  try {
    product = await fetchProductById(productId);
  } catch (error) {
    alert("Ürün detayı alınamadı.");
    return;
  }

  if (!product) return;

  const imageSrc = getImageSrc(product);

  const overlay = createOverlay(`
    <div class="detail-window">
      <div class="detail-topbar">
        <div>
          <div class="mini">Ürün Detay Görünümü</div>
          <strong>${escapeHtml(product.urunAdi || "Ürün")}</strong>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" id="printDetailBtn">Yazdır</button>
          <button class="btn btn-primary" id="closeDetailBtn">Kapat</button>
        </div>
      </div>

      <div class="detail-body">
        <div class="detail-hero">
          <div class="detail-image-box">
            <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(product.urunAdi || "Ürün görseli")}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
          </div>

          <div class="detail-summary">
            <h2>${escapeHtml(product.urunAdi || "-")}</h2>
            <div class="detail-meta">
              <span class="pill">${escapeHtml(product.urunKategori || "Kategori yok")}</span>
              <span class="pill">${escapeHtml(product.urunAltKategori || "Alt kategori yok")}</span>
              <span class="pill">Araç: ${escapeHtml(product.aracMarkasi || "-")}</span>
              <span class="pill">Stok: ${escapeHtml(product.urunStogu ?? "0")}</span>
              <span class="pill">${isProductActive(product) ? "Aktif" : "Pasif"}</span>
            </div>
            <div class="price">${formatPrice(product.urunFiyati)}</div>

            <div class="kv">
              <div class="k">Araç Markası</div>
              <div class="v">${escapeHtml(product.aracMarkasi || "-")}</div>
            </div>
            <div class="kv">
              <div class="k">Ürün Markası / Model</div>
              <div class="v">${escapeHtml(product.urunMarkasi || "-")} / ${escapeHtml(product.urunModeli || "-")}</div>
            </div>
            <div class="kv">
              <div class="k">Yıl</div>
              <div class="v">${escapeHtml(product.urunYili || "-")}</div>
            </div>
            <div class="kv">
              <div class="k">Ürün Kodu / Barkod / OEM</div>
              <div class="v">${escapeHtml(product.urunKodu || "-")} / ${escapeHtml(product.urunBarkodu || "-")} / ${escapeHtml(product.urunOEM || "-")}</div>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-grid-card">
            <h2>Temel Bilgiler</h2>
            <div class="kv"><div class="k">Kategori</div><div class="v">${escapeHtml(product.urunKategori || "-")}</div></div>
            <div class="kv"><div class="k">Alt Kategori</div><div class="v">${escapeHtml(product.urunAltKategori || "-")}</div></div>
            <div class="kv"><div class="k">Araç Markası</div><div class="v">${escapeHtml(product.aracMarkasi || "-")}</div></div>
            <div class="kv"><div class="k">Ürün Adı</div><div class="v">${escapeHtml(product.urunAdi || "-")}</div></div>
            <div class="kv"><div class="k">Ürün Kodu</div><div class="v">${escapeHtml(product.urunKodu || "-")}</div></div>
          </div>

          <div class="detail-grid-card">
            <h2>Teknik Bilgiler</h2>
            <div class="kv"><div class="k">Barkod</div><div class="v">${escapeHtml(product.urunBarkodu || "-")}</div></div>
            <div class="kv"><div class="k">OEM Kodu</div><div class="v">${escapeHtml(product.urunOEM || "-")}</div></div>
            <div class="kv"><div class="k">Ürün Markası</div><div class="v">${escapeHtml(product.urunMarkasi || "-")}</div></div>
            <div class="kv"><div class="k">Model</div><div class="v">${escapeHtml(product.urunModeli || "-")}</div></div>
            <div class="kv"><div class="k">Yıl</div><div class="v">${escapeHtml(product.urunYili || "-")}</div></div>
          </div>

          <div class="detail-grid-card">
            <h2>Ticari Bilgiler</h2>
            <div class="kv"><div class="k">Alış Fiyatı</div><div class="v">${formatPrice(product.alisFiyati)}</div></div>
            <div class="kv"><div class="k">Kar Marjı</div><div class="v">%${Number(product.karMarji || 0).toFixed(2)}</div></div>
            <div class="kv"><div class="k">Satış Fiyatı</div><div class="v">${formatPrice(product.urunFiyati)}</div></div>
            <div class="kv"><div class="k">Stok</div><div class="v">${escapeHtml(product.urunStogu ?? "0")}</div></div>
          </div>
        </div>

        <div class="detail-grid-card">
          <h2>Açıklama</h2>
          <div class="description-box">${escapeHtml(product.urunAciklama || "Açıklama girilmemiş.")}</div>
        </div>
      </div>
    </div>
  `);

  qs("#closeDetailBtn", overlay)?.addEventListener("click", () =>
    overlay.remove(),
  );
  qs("#printDetailBtn", overlay)?.addEventListener("click", () =>
    window.print(),
  );
}

async function openCategoryEditor(categoryId) {
  if (!state.categories.length) await fetchCategories();

  const category = state.categories.find(
    (c) => String(c._id) === String(categoryId),
  );

  if (!category) {
    alert("Kategori bulunamadı.");
    return;
  }

  const overlay = createOverlay(`
    <div class="detail-window">
      <div class="detail-topbar">
        <div>
          <div class="mini">Kategori Düzenleme</div>
          <strong>${escapeHtml(category.kategoriAdi)}</strong>
        </div>
        <div class="actions">
          <button class="btn btn-primary" id="closeCategoryEditorBtn">Kapat</button>
        </div>
      </div>

      <div class="detail-body">
        <div class="detail-grid-card">
          <h2>Kategori Bilgileri</h2>
          <div class="form-grid">
            <div class="field">
              <label for="editCategoryName">Kategori Adı</label>
              <input type="text" id="editCategoryName" value="${escapeHtml(category.kategoriAdi)}">
            </div>

            <div class="field">
              <label for="editCategoryNewSub">Yeni Alt Kategori</label>
              <input type="text" id="editCategoryNewSub" placeholder="Yeni alt kategori">
            </div>

            <div class="field full">
              <label for="editCategorySubs">Alt Kategoriler</label>
              <textarea id="editCategorySubs" placeholder="Her satıra bir alt kategori yazın">${escapeHtml((category.altKategoriler || []).join("\n"))}</textarea>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" id="appendSubBtn">Alt Kategori Ekle</button>
            <button class="btn btn-primary" id="saveCategoryEditBtn">Kaydet</button>
          </div>
          <div id="categoryEditMessage" class="success-message"></div>
        </div>
      </div>
    </div>
  `);

  const closeBtn = qs("#closeCategoryEditorBtn", overlay);
  const appendBtn = qs("#appendSubBtn", overlay);
  const saveBtn = qs("#saveCategoryEditBtn", overlay);
  const nameInput = qs("#editCategoryName", overlay);
  const newSubInput = qs("#editCategoryNewSub", overlay);
  const subsArea = qs("#editCategorySubs", overlay);
  const msg = qs("#categoryEditMessage", overlay);

  closeBtn?.addEventListener("click", () => overlay.remove());

  appendBtn?.addEventListener("click", () => {
    const newSub = newSubInput.value.trim();
    if (!newSub) {
      msg.textContent = "Alt kategori adı gir.";
      return;
    }

    const lines = subsArea.value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    if (!lines.includes(newSub)) {
      lines.push(newSub);
    }

    subsArea.value = lines.join("\n");
    newSubInput.value = "";
    msg.textContent = "Alt kategori listeye eklendi.";
  });

  saveBtn?.addEventListener("click", async () => {
    const newName = nameInput.value.trim();
    const subLines = [
      ...new Set(
        subsArea.value
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, "tr"));

    if (!newName) {
      msg.textContent = "Kategori adı boş olamaz.";
      return;
    }

    try {
      await updateCategory(categoryId, {
        kategoriAdi: newName,
        altKategoriler: subLines,
      });

      msg.textContent = "Kategori güncellendi.";
      await fetchCategories();
      setTimeout(async () => {
        overlay.remove();
        await renderPage("categories");
      }, 350);
    } catch (error) {
      console.error("Kategori güncelleme hatası:", error);
      msg.textContent = "Kategori güncellenemedi.";
    }
  });
}

function getProductsTemplate() {
  return document.getElementById("products-template")?.innerHTML || "";
}

function getProductPanelTemplate() {
  return document.getElementById("product-panel-template")?.innerHTML || "";
}

function getCategoriesTemplate() {
  return document.getElementById("categories-template")?.innerHTML || "";
}

function getBannersTemplate() {
  return document.getElementById("banners-template")?.innerHTML || "";
}

async function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody");
  const filterCategory = document.getElementById("filterCategory");
  const searchProduct = document.getElementById("searchProduct");

  if (!tbody) return;

  await fetchProducts();

  const selectedCategory = filterCategory?.value.trim().toLowerCase() || "";
  const searchTerm = searchProduct?.value.trim().toLowerCase() || "";

  const filtered = state.products.filter((product) => {
    const categoryMatch =
      !selectedCategory ||
      String(product.urunKategori || "")
        .trim()
        .toLowerCase() === selectedCategory;

    const searchPool = [
      product.urunAdi,
      product.aracMarkasi,
      product.urunOEM,
      product.urunBarkodu,
      product.urunKodu,
      product.urunMarkasi,
      product.urunModeli,
      product.urunAltKategori,
    ]
      .join(" ")
      .toLowerCase();

    return categoryMatch && (!searchTerm || searchPool.includes(searchTerm));
  });

  if (!filtered.length) {
    tbody.innerHTML =
      '<tr><td colspan="11" class="mini">Eşleşen ürün bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((product) => {
      const productId = product._id || product.id || "";
      return `
        <tr>
          <td>
            <a href="#" class="product-link open-product-detail" data-id="${escapeHtml(productId)}"><strong>${escapeHtml(product.urunAdi || "-")}</strong></a>
            <div class="mini">${escapeHtml(product.urunOEM || "-")}</div>
          </td>
          <td>
            <div>${escapeHtml(product.urunKategori || "-")}</div>
            <div class="mini">${escapeHtml(product.urunAltKategori || "-")}</div>
          </td>
          <td>
            <div>${escapeHtml(product.urunKodu || "-")}</div>
            <div class="mini">${escapeHtml(product.urunBarkodu || "-")}</div>
          </td>
          <td>
            <div><strong>${escapeHtml(product.aracMarkasi || "-")}</strong></div>
            <div class="mini">${escapeHtml(product.urunMarkasi || "-")} • ${escapeHtml(product.urunModeli || "-")}</div>
          </td>
          <td>${escapeHtml(product.urunYili || "-")}</td>
          <td>${escapeHtml(product.urunStogu ?? "0")}</td>
          <td>
            <span class="${isProductActive(product) ? "badge-stock" : "badge-out"}">
              ${isProductActive(product) ? "Aktif" : "Pasif"}
            </span>
          </td>
          <td>${formatPrice(product.alisFiyati)}</td>
          <td>%${Number(product.karMarji || 0).toFixed(2)}</td>
          <td>${formatPrice(product.urunFiyati)}</td>
          <td>
            <div class="actions">
              <button type="button" class="btn btn-secondary btn-mini open-product-detail" data-id="${escapeHtml(productId)}">👁 Gör</button>
              <button type="button" class="btn btn-primary btn-mini quick-edit-btn" data-id="${escapeHtml(productId)}">⟳ Düzenle</button>
              <button type="button" class="btn btn-danger btn-mini quick-delete-btn" data-id="${escapeHtml(productId)}" data-name="${escapeHtml(product.urunAdi || "Ürün")}">🗑 Sil</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  qsa(".open-product-detail", tbody).forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await openProductDetail(e.currentTarget.dataset.id);
    });
  });

  qsa(".quick-edit-btn", tbody).forEach((btn) => {
    btn.addEventListener("click", async () => {
      await renderPage("product-panel", btn.dataset.id);
    });
  });

  qsa(".quick-delete-btn", tbody).forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      const productName = btn.dataset.name || "Ürün";

      if (!confirm(`"${productName}" silinecek. Emin misin?`)) return;

      try {
        await removeProduct(productId);
        await renderProductsTable();
        alert("Ürün silindi.");
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Ürün silinemedi.");
      }
    });
  });
}

function setProductsFormMode(editing, productId = "") {
  const form = document.getElementById("product-form");
  const banner = document.getElementById("editModeBanner");
  const title = document.getElementById("productsFormTitle");
  const submitBtn = document.getElementById("productSubmitBtn");

  if (!form || !banner || !title || !submitBtn) return;

  form.dataset.editingId = editing ? productId : "";

  if (editing) {
    banner.classList.remove("hidden");
    title.textContent = "Ürün Güncelle";
    submitBtn.textContent = "Ürünü Güncelle";
  } else {
    banner.classList.add("hidden");
    title.textContent = "Ürün Ekle";
    submitBtn.textContent = "Ürünü Kaydet";
  }
}

function fillProductsForm(product) {
  const form = document.getElementById("product-form");
  if (!form || !product) return;

  const urunKategori = document.getElementById("urunKategori");
  const urunAltKategori = document.getElementById("urunAltKategori");
  const gorselOnizleme = document.getElementById("gorselOnizleme");

  setProductsFormMode(true, product._id || product.id || "");

  document.getElementById("urunAdi").value = product.urunAdi || "";
  document.getElementById("urunAktif").value = String(isProductActive(product));
  document.getElementById("aracMarkasi").value = product.aracMarkasi || "";
  document.getElementById("urunBarkodu").value = product.urunBarkodu || "";
  document.getElementById("urunOEM").value = product.urunOEM || "";
  document.getElementById("urunKodu").value = product.urunKodu || "";
  document.getElementById("urunMarkasi").value = product.urunMarkasi || "";
  document.getElementById("urunModeli").value = product.urunModeli || "";
  document.getElementById("urunYili").value = product.urunYili || "";
  document.getElementById("urunAciklama").value = product.urunAciklama || "";
  document.getElementById("urunFiyati").value = Number(
    product.urunFiyati || 0,
  ).toFixed(2);
  document.getElementById("urunStogu").value = product.urunStogu ?? 0;
  document.getElementById("alisFiyati").value = Number(
    product.alisFiyati || 0,
  ).toFixed(2);
  document.getElementById("karMarji").value = Number(
    product.karMarji || 0,
  ).toFixed(2);

  urunKategori.value = product.urunKategori || "";
  populateSubCategories(
    urunKategori,
    urunAltKategori,
    product.urunAltKategori || "",
  );

  form.dataset.currentImageData = product.urunGorselData || "";

  if (product.urunGorselData) {
    gorselOnizleme.src = product.urunGorselData;
    gorselOnizleme.style.display = "block";
  } else {
    gorselOnizleme.src = "";
    gorselOnizleme.style.display = "none";
  }

  document.getElementById("hesaplananSatis").textContent = formatPrice(
    calculateSalePrice(product.alisFiyati, product.karMarji),
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function mountProductsPage(editProductId = "") {
  els.pageContent.innerHTML = getProductsTemplate();

  const form = document.getElementById("product-form");
  const urunKategori = document.getElementById("urunKategori");
  const urunAltKategori = document.getElementById("urunAltKategori");
  const gorselInput = document.getElementById("urunGorseli");
  const gorselOnizleme = document.getElementById("gorselOnizleme");
  const alisFiyati = document.getElementById("alisFiyati");
  const karMarji = document.getElementById("karMarji");
  const hesaplananSatis = document.getElementById("hesaplananSatis");
  const urunFiyati = document.getElementById("urunFiyati");
  const hesaplaBtn = document.getElementById("hesaplaBtn");
  const fiyataYazBtn = document.getElementById("fiyataYazBtn");
  const saveMessage = document.getElementById("saveMessage");
  const filterCategory = document.getElementById("filterCategory");
  const searchProduct = document.getElementById("searchProduct");

  await ensureBootstrapData();
  await populateCategorySelect(urunKategori, true, "", "Kategori seçin");
  fillSelect(
    filterCategory,
    state.categories.map((c) => c.kategoriAdi),
    "Tüm kategoriler",
  );

  function updateCalculation() {
    const sale = calculateSalePrice(alisFiyati.value, karMarji.value);
    hesaplananSatis.textContent = formatPrice(sale);
    return sale;
  }

  setProductsFormMode(false);

  urunKategori.addEventListener("change", async () => {
    await populateSubCategories(urunKategori, urunAltKategori);
  });

  filterCategory.addEventListener("change", renderProductsTable);
  searchProduct.addEventListener("input", renderProductsTable);

  hesaplaBtn.addEventListener("click", updateCalculation);
  alisFiyati.addEventListener("input", updateCalculation);
  karMarji.addEventListener("input", updateCalculation);

  fiyataYazBtn.addEventListener("click", () => {
    urunFiyati.value = updateCalculation().toFixed(2);
  });

  gorselInput.addEventListener("change", () => {
    const file = gorselInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      form.dataset.currentImageData = event.target.result;
      gorselOnizleme.src = event.target.result;
      gorselOnizleme.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("reset", () => {
    setTimeout(async () => {
      form.dataset.currentImageData = "";
      setProductsFormMode(false);
      saveMessage.textContent = "";
      gorselOnizleme.src = "";
      gorselOnizleme.style.display = "none";
      hesaplananSatis.textContent = "0.00 TL";
      await populateSubCategories(urunKategori, urunAltKategori);
    }, 0);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveMessage.textContent = "";

    const editingId = form.dataset.editingId || "";

    const payload = buildProductPayload(
      "",
      form.dataset.currentImageData || "",
    );

    const validationError = validateProductPayload(payload);

    if (validationError) {
      saveMessage.textContent = validationError;
      return;
    }

    try {
      if (editingId) {
        const base = await fetchProductById(editingId).catch(() => null);
        payload.urunGorselData =
          form.dataset.currentImageData || base?.urunGorselData || "";

        await updateProduct(editingId, payload);

        saveMessage.textContent = "Ürün başarıyla güncellendi ✔";
      } else {
        await createProduct(payload);

        saveMessage.textContent = "Ürün başarıyla kaydedildi ✔";
      }

      saveMessage.style.display = "block";
      saveMessage.style.color = "#00ffae";
      saveMessage.style.background = "rgba(0, 255, 174, 0.12)";
      saveMessage.style.border = "1px solid rgba(0, 255, 174, 0.35)";
      saveMessage.style.padding = "10px 12px";
      saveMessage.style.borderRadius = "8px";
      saveMessage.style.marginTop = "10px";
      saveMessage.style.fontWeight = "700";

      await ensureBootstrapData();
      fillSelect(
        filterCategory,
        state.categories.map((c) => c.kategoriAdi),
        "Tüm kategoriler",
      );
      await renderProductsTable();

      setTimeout(() => {
        form.reset();
        saveMessage.textContent = "";
        saveMessage.style.display = "none";
      }, 2500);
    } catch (error) {
      console.error("Ürün kayıt hatası:", error);
      saveMessage.textContent = "İşlem sırasında hata oluştu.";
    }
  });

  await renderProductsTable();
  await populateSubCategories(urunKategori, urunAltKategori);
  updateCalculation();

  if (editProductId) {
    try {
      const product = await fetchProductById(editProductId);
      if (product) {
        fillProductsForm(product);
      }
    } catch (error) {
      console.error("Ürün alınamadı:", error);
    }
  }
}

async function renderPanelProductList(selectedId = "") {
  const list = document.getElementById("panelProductList");
  const searchInput = document.getElementById("panelSearchProduct");
  const filterCategory = document.getElementById("panelFilterCategory");

  if (!list) return;

  await fetchProducts();

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
  const categoryTerm = (filterCategory?.value || "").trim().toLowerCase();

  const products = state.products.filter((p) => {
    const categoryMatch =
      !categoryTerm ||
      String(p.urunKategori || "").toLowerCase() === categoryTerm;

    const searchPool = [
      p.urunAdi,
      p.aracMarkasi,
      p.urunOEM,
      p.urunKodu,
      p.urunBarkodu,
      p.urunMarkasi,
      p.urunModeli,
    ]
      .join(" ")
      .toLowerCase();

    return categoryMatch && (!searchTerm || searchPool.includes(searchTerm));
  });

  if (!products.length) {
    list.innerHTML = '<div class="mini">Ürün bulunamadı.</div>';
    return;
  }

  list.innerHTML = products
    .map((p) => {
      const activeClass = String(p._id) === String(selectedId) ? "active" : "";
      return `
        <div class="product-list-item ${activeClass}" data-id="${escapeHtml(p._id)}">
          <strong>${escapeHtml(p.urunAdi || "-")}</strong>
          <div class="mini">${escapeHtml(p.aracMarkasi || "-")} • ${escapeHtml(p.urunKategori || "-")} / ${escapeHtml(p.urunAltKategori || "-")}</div>
          <div class="mini">Stok: ${escapeHtml(p.urunStogu ?? "0")} • ${formatPrice(p.urunFiyati)}</div>
        </div>
      `;
    })
    .join("");

  qsa(".product-list-item", list).forEach((item) => {
    item.addEventListener("click", async () => {
      await renderPage("product-panel", item.dataset.id);
    });
  });
}

function fillPanelForm(product) {
  const form = document.getElementById("panel-product-form");
  if (!form || !product) return;

  const kategori = document.getElementById("panelUrunKategori");
  const altKategori = document.getElementById("panelUrunAltKategori");
  const img = document.getElementById("panelGorselOnizleme");

  form.dataset.editingId = product._id || product.id || "";
  form.dataset.currentImageData = product.urunGorselData || "";

  document.getElementById("panelUrunAktif").value = String(
    isProductActive(product),
  );
  document.getElementById("panelUrunAdi").value = product.urunAdi || "";
  document.getElementById("panelAracMarkasi").value = product.aracMarkasi || "";
  document.getElementById("panelUrunBarkodu").value = product.urunBarkodu || "";
  document.getElementById("panelUrunOEM").value = product.urunOEM || "";
  document.getElementById("panelUrunKodu").value = product.urunKodu || "";
  document.getElementById("panelUrunMarkasi").value = product.urunMarkasi || "";
  document.getElementById("panelUrunModeli").value = product.urunModeli || "";
  document.getElementById("panelUrunYili").value = product.urunYili || "";
  document.getElementById("panelUrunAciklama").value =
    product.urunAciklama || "";
  document.getElementById("panelUrunFiyati").value = Number(
    product.urunFiyati || 0,
  ).toFixed(2);
  document.getElementById("panelUrunStogu").value = product.urunStogu ?? 0;
  document.getElementById("panelAlisFiyati").value = Number(
    product.alisFiyati || 0,
  ).toFixed(2);
  document.getElementById("panelKarMarji").value = Number(
    product.karMarji || 0,
  ).toFixed(2);
  document.getElementById("panelFormTitle").textContent =
    "Ürün Güncelle: " + (product.urunAdi || "-");

  kategori.value = product.urunKategori || "";
  populateSubCategories(kategori, altKategori, product.urunAltKategori || "");

  if (product.urunGorselData) {
    img.src = product.urunGorselData;
    img.style.display = "block";
  } else {
    img.src = "";
    img.style.display = "none";
  }

  document.getElementById("panelHesaplananSatis").textContent = formatPrice(
    calculateSalePrice(product.alisFiyati, product.karMarji),
  );
}

async function mountProductPanel(selectedProductId = "") {
  els.pageContent.innerHTML = getProductPanelTemplate();

  const form = document.getElementById("panel-product-form");
  const kategori = document.getElementById("panelUrunKategori");
  const altKategori = document.getElementById("panelUrunAltKategori");
  const imgInput = document.getElementById("panelUrunGorseli");
  const imgPreview = document.getElementById("panelGorselOnizleme");
  const saveMsg = document.getElementById("panelSaveMessage");
  const deleteBtn = document.getElementById("panelDeleteBtn");
  const searchInput = document.getElementById("panelSearchProduct");
  const filterCategory = document.getElementById("panelFilterCategory");
  const panelAlis = document.getElementById("panelAlisFiyati");
  const panelMarj = document.getElementById("panelKarMarji");
  const panelResult = document.getElementById("panelHesaplananSatis");
  const hesaplaBtn = document.getElementById("panelHesaplaBtn");
  const fiyataYazBtn = document.getElementById("panelFiyataYazBtn");

  await ensureBootstrapData();
  await populateCategorySelect(kategori, true, "", "Kategori seçin");
  fillSelect(
    filterCategory,
    state.categories.map((c) => c.kategoriAdi),
    "Tüm kategoriler",
  );

  function updateCalc() {
    const sale = calculateSalePrice(panelAlis.value, panelMarj.value);
    panelResult.textContent = formatPrice(sale);
    return sale;
  }

  kategori.addEventListener("change", async () => {
    await populateSubCategories(kategori, altKategori);
  });

  searchInput.addEventListener("input", () =>
    renderPanelProductList(form.dataset.editingId || selectedProductId || ""),
  );

  filterCategory.addEventListener("change", () =>
    renderPanelProductList(form.dataset.editingId || selectedProductId || ""),
  );

  hesaplaBtn.addEventListener("click", updateCalc);
  panelAlis.addEventListener("input", updateCalc);
  panelMarj.addEventListener("input", updateCalc);

  fiyataYazBtn.addEventListener("click", () => {
    document.getElementById("panelUrunFiyati").value = updateCalc().toFixed(2);
  });

  imgInput.addEventListener("change", () => {
    const file = imgInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      form.dataset.currentImageData = e.target.result;
      imgPreview.src = e.target.result;
      imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveMsg.textContent = "";

    const productId = form.dataset.editingId || "";
    if (!productId) {
      saveMsg.textContent = "Lütfen önce soldan bir ürün seç.";
      return;
    }

    const base = await fetchProductById(productId).catch(() => null);
    if (!base) {
      saveMsg.textContent = "Lütfen önce soldan bir ürün seç.";
      return;
    }

    const payload = buildProductPayload(
      "panel",
      form.dataset.currentImageData || base?.urunGorselData || "",
    );

    const validationError = validateProductPayload(payload);

    if (validationError) {
      saveMsg.textContent = validationError;
      return;
    }

    try {
      await updateProduct(productId, payload);
      saveMsg.textContent = "Ürün güncellendi.";
      await ensureBootstrapData();
      await renderPanelProductList(productId);
    } catch (error) {
      console.error("Panel güncelleme hatası:", error);
      saveMsg.textContent = "Güncelleme sırasında hata oluştu.";
    }
  });

  deleteBtn.addEventListener("click", async () => {
    const productId = form.dataset.editingId || "";
    if (!productId) {
      saveMsg.textContent = "Silmek için önce bir ürün seç.";
      return;
    }

    const product = state.products.find(
      (p) => String(p._id) === String(productId),
    );
    const productName = product?.urunAdi || "Ürün";

    if (!confirm(`"${productName}" silinsin mi?`)) return;

    try {
      await removeProduct(productId);
      saveMsg.textContent = "Ürün silindi.";
      await renderPage("product-panel");
    } catch (error) {
      console.error("Panel silme hatası:", error);
      saveMsg.textContent = "Silme sırasında hata oluştu.";
    }
  });

  await renderPanelProductList(selectedProductId);
  updateCalc();

  let currentProduct = null;

  if (selectedProductId) {
    currentProduct = state.products.find(
      (p) => String(p._id) === String(selectedProductId),
    );
  }

  if (!currentProduct && state.products.length > 0) {
    currentProduct = state.products[0];
  }

  if (currentProduct) {
    form.dataset.editingId = currentProduct._id;
    fillPanelForm(currentProduct);
    await renderPanelProductList(currentProduct._id);
  } else {
    form.dataset.editingId = "";
    saveMsg.textContent = "Henüz kayıtlı ürün yok.";
  }
}

async function renderCategoryTable() {
  const tbody = document.getElementById("categoryTableBody");
  if (!tbody) return;

  await fetchCategories();

  if (!state.categories.length) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="mini">Kategori yok.</td></tr>';
    return;
  }

  tbody.innerHTML = state.categories
    .sort((a, b) =>
      String(a.kategoriAdi).localeCompare(String(b.kategoriAdi), "tr"),
    )
    .map((category) => {
      const subs = category.altKategoriler || [];

      return `
        <tr>
          <td><strong>${escapeHtml(category.kategoriAdi)}</strong></td>
          <td>
            ${
              subs.length
                ? subs
                    .map((s) => `<span class="pill">${escapeHtml(s)}</span>`)
                    .join(" ")
                : '<span class="mini">Alt kategori yok</span>'
            }
          </td>
          <td>
            <div class="category-row-actions">
              <button type="button" class="btn btn-primary btn-mini edit-category-btn" data-id="${escapeHtml(category._id)}">Düzenle</button>
              <button type="button" class="btn btn-danger btn-mini delete-category-btn" data-id="${escapeHtml(category._id)}" data-name="${escapeHtml(category.kategoriAdi)}">Sil</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  qsa(".edit-category-btn", tbody).forEach((btn) => {
    btn.addEventListener("click", () => openCategoryEditor(btn.dataset.id));
  });

  qsa(".delete-category-btn", tbody).forEach((btn) => {
    btn.addEventListener("click", async () => {
      const categoryName = btn.dataset.name || "Kategori";
      if (!confirm(`"${categoryName}" silinsin mi?`)) return;

      try {
        await removeCategory(btn.dataset.id);
        await fetchCategories();
        await renderCategoryTable();

        const existingCategorySelect = document.getElementById(
          "existingCategorySelect",
        );
        if (existingCategorySelect) {
          await populateCategorySelect(
            existingCategorySelect,
            true,
            "",
            "Kategori seçin",
          );
        }

        alert("Kategori silindi.");
      } catch (error) {
        console.error("Kategori silme hatası:", error);
        alert("Kategori silinemedi.");
      }
    });
  });
}

async function mountCategoriesPage() {
  els.pageContent.innerHTML = getCategoriesTemplate();

  const newCategoryName = document.getElementById("newCategoryName");
  const newSubCategoryName = document.getElementById("newSubCategoryName");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const addSubCategoryBtn = document.getElementById("addSubCategoryBtn");
  const existingCategorySelect = document.getElementById(
    "existingCategorySelect",
  );
  const categoryMessage = document.getElementById("categoryMessage");

  await ensureBootstrapData();
  await populateCategorySelect(
    existingCategorySelect,
    true,
    "",
    "Kategori seçin",
  );
  await renderCategoryTable();

  addCategoryBtn.addEventListener("click", async () => {
    const category = newCategoryName.value.trim();

    if (!category) {
      categoryMessage.textContent = "Lütfen kategori adı girin.";
      return;
    }

    if (
      state.categories.some(
        (c) => c.kategoriAdi.toLowerCase() === category.toLowerCase(),
      )
    ) {
      categoryMessage.textContent = "Bu kategori zaten mevcut.";
      return;
    }

    try {
      await createCategory({
        kategoriAdi: category,
        altKategoriler: [],
      });

      categoryMessage.textContent = "Kategori eklendi.";
      newCategoryName.value = "";

      await ensureBootstrapData();
      await populateCategorySelect(
        existingCategorySelect,
        true,
        "",
        "Kategori seçin",
      );
      await renderCategoryTable();
    } catch (error) {
      console.error("Kategori ekleme hatası:", error);
      categoryMessage.textContent = "Kategori eklenemedi.";
    }
  });

  addSubCategoryBtn.addEventListener("click", async () => {
    const selectedCategory = existingCategorySelect.value.trim();
    const subCategory = newSubCategoryName.value.trim();

    if (!selectedCategory) {
      categoryMessage.textContent = "Lütfen önce kategori seçin.";
      return;
    }

    if (!subCategory) {
      categoryMessage.textContent = "Lütfen alt kategori adı girin.";
      return;
    }

    const found = getCategoryByName(selectedCategory);
    if (!found) {
      categoryMessage.textContent = "Kategori bulunamadı.";
      return;
    }

    const list = found.altKategoriler || [];
    if (list.some((v) => v.toLowerCase() === subCategory.toLowerCase())) {
      categoryMessage.textContent = "Bu alt kategori zaten mevcut.";
      return;
    }

    try {
      await updateCategory(found._id, {
        kategoriAdi: found.kategoriAdi,
        altKategoriler: [...list, subCategory].sort((a, b) =>
          a.localeCompare(b, "tr"),
        ),
      });

      categoryMessage.textContent = "Alt kategori eklendi.";
      newSubCategoryName.value = "";

      await ensureBootstrapData();
      await populateCategorySelect(
        existingCategorySelect,
        true,
        found.kategoriAdi,
        "Kategori seçin",
      );
      await renderCategoryTable();
    } catch (error) {
      console.error("Alt kategori ekleme hatası:", error);
      categoryMessage.textContent = "Alt kategori eklenemedi.";
    }
  });
}

async function renderPage(page, payload = "") {
  state.currentPage = page;
  state.selectedProductId = payload || "";
  setSidebarActive(page);

  switch (page) {
    case "products":
      els.pageTitle.textContent = "Ürün Yönetimi";
      await mountProductsPage(payload);
      break;
    case "product-panel":
      els.pageTitle.textContent = "Ürün Paneli";
      await mountProductPanel(payload);
      break;
    case "categories":
      els.pageTitle.textContent = "Kategori Yönetimi";
      await mountCategoriesPage();
      break;
    case "banners":
      els.pageTitle.textContent = "Banner Yönetimi";
      els.pageContent.innerHTML = getBannersTemplate();
      break;
    default:
      els.pageTitle.textContent = "Panel";
      els.pageContent.innerHTML = `
        <div class="info-box">
          <h2>Panel hazır</h2>
          <p>Sol menüden bir modül seçin.</p>
          <p class="muted">Demo giriş bilgisi: ${ADMIN_EMAIL} / ${ADMIN_PASS}</p>
        </div>
      `;
  }
}

async function handleLogin() {
  const email = els.emailField.value.trim();
  const pass = els.passField.value.trim();

  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
    showDashboard();
    await renderPage("products");
  } else {
    els.errorMsg.textContent = "Hatalı e-posta ya da şifre.";
  }
}

function bindGlobalEvents() {
  els.loginBtn?.addEventListener("click", handleLogin);

  els.passField?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  });

  els.logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    showLogin();
  });

  qsa(".sidebar nav button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await renderPage(btn.dataset.page);
    });
  });
}

async function initAdmin() {
  bindGlobalEvents();

  if (localStorage.getItem(ADMIN_STORAGE_KEY) === "true") {
    showDashboard();
    await renderPage("products");
  } else {
    showLogin();
  }
}

document.addEventListener("DOMContentLoaded", initAdmin);
