const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5002/api"
    : "https://nazem-oto.onrender.com/api";

const WHATSAPP_PHONE = "905523104055";
const PLACEHOLDER_IMAGE = "images/no-image.png";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(value) {
  const number = Number(value || 0);
  return `${number.toLocaleString("tr-TR")} TL`;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function normalizeStock(value) {
  const stock = Number(value ?? 0);
  return Number.isNaN(stock) ? 0 : stock;
}

function getImageSrc(product) {
  return product.urunGorselData || product.urunGorsel || PLACEHOLDER_IMAGE;
}

function isProductActive(product) {
  if (typeof product.aktifMi === "boolean") return product.aktifMi;
  if (typeof product.aktif === "boolean") return product.aktif;
  if (typeof product.isActive === "boolean") return product.isActive;
  if (typeof product.active === "boolean") return product.active;
  return true;
}

function createWhatsappLink(product) {
  const messageLines = [
    "Merhaba, bu ürün hakkında bilgi almak istiyorum.",
    "",
    `Ürün: ${product.urunAdi || "-"}`,
    `Ürün Kodu: ${product.urunKodu || "-"}`,
    `OEM: ${product.urunOEM || "-"}`,
    `Barkod: ${product.urunBarkodu || "-"}`,
    `Fiyat: ${formatPrice(product.urunFiyati)}`,
  ];

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}

function renderState(html) {
  const page = document.getElementById("detailPage");
  page.innerHTML = html;
}

async function fetchProductById(id) {
  const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Ürün alınamadı. Status: ${response.status}`);
  }

  const data = await response.json();
  return data?.data || data?.product || data;
}

function renderProductDetail(product) {
  const stock = normalizeStock(product.urunStogu);
  const stockText = stock > 0 ? `Stok: ${stock}` : "Stokta yok";
  const stockClass = stock > 0 ? "in-stock" : "out-of-stock";
  const imageSrc = getImageSrc(product);

  renderState(`
    <section class="detail-hero">
      <div class="card image-box">
        <img
          src="${escapeHtml(imageSrc)}"
          alt="${escapeHtml(product.urunAdi || "Ürün görseli")}"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'"
        />
      </div>

      <div class="card summary">
        <h1>${escapeHtml(product.urunAdi || "-")}</h1>

        <div class="badges">
          <span class="badge">${escapeHtml(product.urunKategori || "Kategori")}</span>
          <span class="badge">${escapeHtml(product.urunAltKategori || "Alt kategori")}</span>
          <span class="badge ${stockClass}">${stockText}</span>
        </div>

        <div class="price">₺${Number(product.urunFiyati || 0).toLocaleString("tr-TR")}</div>

        <div class="kv">
          <div class="k">Marka / Model</div>
          <div class="v">${escapeHtml(product.urunMarkasi || "-")} / ${escapeHtml(product.urunModeli || "-")}</div>
        </div>

        <div class="kv">
          <div class="k">Yıl</div>
          <div class="v">${escapeHtml(product.urunYili || "-")}</div>
        </div>

        <div class="kv">
          <div class="k">Ürün Kodu</div>
          <div class="v">${escapeHtml(product.urunKodu || "-")}</div>
        </div>

        <div class="kv">
          <div class="k">Barkod / OEM</div>
          <div class="v">${escapeHtml(product.urunBarkodu || "-")} / ${escapeHtml(product.urunOEM || "-")}</div>
        </div>

        <div class="actions">
          <a
            class="primary-btn whatsapp-btn"
            href="${createWhatsappLink(product)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ile Sor
          </a>

          <a class="secondary-btn" href="index.html">
            Ürünlere Dön
          </a>
        </div>
      </div>
    </section>

    <section class="detail-grid">
      <div class="card">
        <h2>Temel Bilgiler</h2>
        <div class="kv"><div class="k">Kategori</div><div class="v">${escapeHtml(product.urunKategori || "-")}</div></div>
        <div class="kv"><div class="k">Alt Kategori</div><div class="v">${escapeHtml(product.urunAltKategori || "-")}</div></div>
        <div class="kv"><div class="k">Ürün Adı</div><div class="v">${escapeHtml(product.urunAdi || "-")}</div></div>
        <div class="kv"><div class="k">Ürün Kodu</div><div class="v">${escapeHtml(product.urunKodu || "-")}</div></div>
      </div>

      <div class="card">
        <h2>Teknik Bilgiler</h2>
        <div class="kv"><div class="k">Barkod</div><div class="v">${escapeHtml(product.urunBarkodu || "-")}</div></div>
        <div class="kv"><div class="k">OEM Kodu</div><div class="v">${escapeHtml(product.urunOEM || "-")}</div></div>
        <div class="kv"><div class="k">Marka</div><div class="v">${escapeHtml(product.urunMarkasi || "-")}</div></div>
        <div class="kv"><div class="k">Model</div><div class="v">${escapeHtml(product.urunModeli || "-")}</div></div>
        <div class="kv"><div class="k">Yıl</div><div class="v">${escapeHtml(product.urunYili || "-")}</div></div>
        <div class="kv"><div class="k">Uyumlu Araçlar</div><div class="v">${escapeHtml(product.uyumluAraclar || "-")}</div></div>
      </div>

      <div class="card">
        <h2>Ticari Bilgiler</h2>
        <div class="kv"><div class="k">Satış Fiyatı</div><div class="v">${formatPrice(product.urunFiyati)}</div></div>
        <div class="kv"><div class="k">Stok</div><div class="v">${stock}</div></div>
      </div>
    </section>

    <section class="card description-card">
      <h2>Açıklama</h2>
      <div class="description">${escapeHtml(product.urunAciklama || "Açıklama girilmemiş.")}</div>
    </section>
  `);
}

async function initProductPage() {
  const id = getQueryParam("id");

  if (!id) {
    renderState(`
      <div class="card">
        <h2>Geçersiz ürün bağlantısı</h2>
        <p>Ürün kimliği bulunamadı.</p>
      </div>
    `);
    return;
  }

  renderState(`
    <div class="card">
      <h2>Yükleniyor...</h2>
      <p>Ürün bilgileri getiriliyor.</p>
    </div>
  `);

  try {
    const product = await fetchProductById(id);

    if (!product) {
      renderState(`
        <div class="card">
          <h2>Ürün bulunamadı</h2>
          <p>İlgili ürün kaydı bulunamadı.</p>
        </div>
      `);
      return;
    }

    if (!isProductActive(product)) {
      renderState(`
        <div class="card">
          <h2>Ürün görüntülenemiyor</h2>
          <p>Bu ürün şu anda aktif değil.</p>
        </div>
      `);
      return;
    }

    renderProductDetail(product);
  } catch (error) {
    console.error("Ürün detay hatası:", error);

    renderState(`
      <div class="card">
        <h2>Bir hata oluştu</h2>
        <p>Ürün bilgileri alınırken sorun oluştu. Lütfen tekrar deneyin.</p>
      </div>
    `);
  }
}

document.addEventListener("DOMContentLoaded", initProductPage);