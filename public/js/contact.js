const DEFAULT_CATEGORY_MAP = {
  "Fren ve Debriyaj": ["Balata", "Disk", "Debriyaj Seti", "Fren Hortumu"],
  "Motor ve Yağ Ürünleri": ["Yağ Filtresi", "Motor Yağı", "Triger Seti", "Conta"],
  "Elektrik ve Aydınlatma": ["Far", "Stop", "Ampul", "Sensör"],
  "Filtre ve Parçalar": ["Hava Filtresi", "Polen Filtresi", "Mazot Filtresi", "Yakıt Parçası"]
};

function getCategoryMap() {
  try {
    return JSON.parse(localStorage.getItem("categoryMap")) || DEFAULT_CATEGORY_MAP;
  } catch {
    return DEFAULT_CATEGORY_MAP;
  }
}

function buildMenus() {
  const categoriesMenu = document.getElementById("categories-menu");
  const footerCategories = document.getElementById("footerCategories");
  const categories = Object.keys(getCategoryMap()).sort((a, b) => a.localeCompare(b, "tr"));

  if (categoriesMenu) {
    categoriesMenu.innerHTML = categories
      .map((cat) => `<a href="category.html?cat=${encodeURIComponent(cat)}">${cat}</a>`)
      .join("");
  }

  if (footerCategories) {
    footerCategories.innerHTML = categories
      .map((cat) => `<a href="category.html?cat=${encodeURIComponent(cat)}">${cat}</a>`)
      .join("");
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

  const DEFAULT_CATEGORY_MAP = {
  "Fren ve Debriyaj": ["Balata", "Disk", "Debriyaj Seti", "Fren Hortumu"],
  "Motor ve Yağ Ürünleri": ["Yağ Filtresi", "Motor Yağı", "Triger Seti", "Conta"],
  "Elektrik ve Aydınlatma": ["Far", "Stop", "Ampul", "Sensör"],
  "Filtre ve Parçalar": ["Hava Filtresi", "Polen Filtresi", "Mazot Filtresi", "Yakıt Parçası"]
};

function getCategoryMap() {
  try {
    return JSON.parse(localStorage.getItem("categoryMap")) || DEFAULT_CATEGORY_MAP;
  } catch {
    return DEFAULT_CATEGORY_MAP;
  }
}

function buildMenus() {
  const categoriesMenu = document.getElementById("categories-menu");
  const footerCategories = document.getElementById("footerCategories");
  const categories = Object.keys(getCategoryMap()).sort((a, b) => a.localeCompare(b, "tr"));

  if (categoriesMenu) {
    categoriesMenu.innerHTML = categories
      .map((cat) => `<a href="category.html?cat=${encodeURIComponent(cat)}">${cat}</a>`)
      .join("");
  }

  if (footerCategories) {
    footerCategories.innerHTML = categories
      .map((cat) => `<a href="category.html?cat=${encodeURIComponent(cat)}">${cat}</a>`)
      .join("");
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

function initWhatsappForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const subject = document.getElementById("subject")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";

    if (!fullName || !phone || !message) {
      alert("Lütfen en az Ad Soyad, Telefon ve Mesaj alanlarını doldurun.");
      return;
    }

    const whatsappNumber = "905523104055";

    const whatsappMessage = 
`Merhaba, iletişim formu üzerinden size ulaşıyorum.

Ad Soyad: ${fullName}
Telefon: ${phone}
E-Posta: ${email || "-"}
Konu: ${subject || "-"}

Mesaj:
${message}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappUrl, "_blank");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildMenus();
  initCategoryDropdown();
  initWhatsappForm();
});
}

document.addEventListener("DOMContentLoaded", () => {
  buildMenus();
  initCategoryDropdown();
});

