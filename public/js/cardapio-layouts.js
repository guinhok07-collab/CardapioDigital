import { addItem, formatMoney } from "./cart.js";

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

export function setBodyLayoutClass(layout) {
  const main = document.getElementById("cardapio-main");
  ["layout-poster-burger", "layout-poster-pastel", "layout-combo-wood"].forEach((c) => {
    document.body.classList.remove(c);
    main?.classList.remove(c);
  });
  if (!layout || layout === "default") return;
  const map = {
    "poster-burger": "layout-poster-burger",
    "poster-pastel": "layout-poster-pastel",
    "combo-wood": "layout-combo-wood",
  };
  const cls = map[layout];
  if (cls) {
    document.body.classList.add(cls);
    main?.classList.add(cls);
  }
}


function formatPhoneDisplay(waDigits) {
  const d = String(waDigits || "").replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55"))
    return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length >= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return d || "";
}

function bindAdd(btn, item, catId, catTitle, sectionTitle, onToast) {
  const displayName = sectionTitle ? `${sectionTitle} — ${item.name}` : item.name;
  btn.addEventListener("click", () => {
    addItem({
      catId,
      catTitle,
      item: { id: item.id, name: displayName, price: item.price },
    });
    onToast("Adicionado ao carrinho");
  });
}

/** Combos — fundo madeira, grade 2×2, faixas laranja */
export function renderComboWood(root, cat, catId, catTitle, store, onToast) {
  root.className = "combo-wood-root";
  root.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "combo-wood";

  const head = document.createElement("header");
  head.className = "combo-wood-head";
  head.innerHTML = `
    <div class="combo-wood-head-text">
      <h2 class="combo-wood-combos">COMBOS</h2>
      <p class="combo-wood-sub"><span class="combo-wood-de">de</span> Lanches</p>
    </div>
    <div class="combo-wood-head-photo" role="img" aria-label="Lanche e refrigerante"></div>
  `;

  const grid = document.createElement("div");
  grid.className = "combo-wood-grid";

  (cat.sections || []).forEach((sec) => {
    const st = (sec.title || "").trim();
    const sub = (sec.subtitle || "").trim();
    const box = document.createElement("section");
    box.className = "combo-wood-panel";
    box.innerHTML = `
      <div class="combo-wood-panel-bar">
        <span class="combo-wood-panel-title">${escapeHtml(st)}</span>
        ${sub ? `<span class="combo-wood-panel-sub">${escapeHtml(sub)}</span>` : ""}
      </div>
      <div class="combo-wood-panel-body"></div>
    `;
    const body = box.querySelector(".combo-wood-panel-body");
    (sec.items || []).forEach((item) => {
      const row = document.createElement("div");
      row.className = "combo-wood-item";
      row.innerHTML = `
        <div class="combo-wood-item-top">
          <span class="combo-wood-item-name">${escapeHtml(item.name)}</span>
          <span class="combo-wood-item-price">${formatMoney(item.price)}</span>
        </div>
        <p class="combo-wood-item-desc">${escapeHtml(item.description || "")}</p>
        <button type="button" class="combo-wood-add">Adicionar</button>
      `;
      bindAdd(row.querySelector(".combo-wood-add"), item, catId, catTitle, st, onToast);
      body.appendChild(row);
    });
    grid.appendChild(box);
  });

  const foot = document.createElement("footer");
  foot.className = "combo-wood-foot";
  const wa = formatPhoneDisplay(store.whatsapp);
  const addr = escapeHtml((store.address || "").replace(/^Av\.?/i, "AV. "));
  foot.innerHTML = `
    <div class="combo-wood-foot-block">
      <span class="combo-wood-foot-ico" aria-hidden="true">🛵</span>
      <div>
        <p class="combo-wood-foot-label">PEÇA PELO DELIVERY</p>
        <p class="combo-wood-foot-phone">${escapeHtml(wa)}</p>
      </div>
    </div>
    <div class="combo-wood-foot-block combo-wood-foot-block--addr">
      <span class="combo-wood-foot-ico" aria-hidden="true">📍</span>
      <p class="combo-wood-foot-addr">${addr}</p>
    </div>
  `;

  wrap.appendChild(head);
  wrap.appendChild(grid);
  wrap.appendChild(foot);
  root.appendChild(wrap);
}

/** Pastelaria — preto + amarelo, líderes de pontos */
export function renderPosterPastel(root, cat, catId, catTitle, store, onToast) {
  root.className = "pastel-poster-root";
  root.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "pastel-poster";

  const inner = document.createElement("div");
  inner.className = "pastel-poster-inner";

  const left = document.createElement("div");
  left.className = "pastel-poster-left";

  const h = document.createElement("h2");
  h.className = "pastel-poster-h1";
  h.textContent = "PASTEL";
  left.appendChild(h);

  (cat.sections || []).forEach((sec) => {
    const st = (sec.title || "").trim();
    const sub = (sec.subtitle || "").trim();
    const isAdic = /adicional/i.test(st);
    const box = document.createElement("section");
    box.className = "pastel-poster-sec";
    const tag = document.createElement("div");
    tag.className = `pastel-poster-tag ${isAdic ? "pastel-poster-tag--yellow" : "pastel-poster-tag--white"}`;
    tag.textContent = st.toUpperCase();
    box.appendChild(tag);
    if (sub) {
      const ps = document.createElement("p");
      ps.className = "pastel-poster-sec-sub";
      ps.textContent = sub;
      box.appendChild(ps);
    }
    const list = document.createElement("div");
    list.className = "pastel-poster-list";
    (sec.items || []).forEach((item) => {
      const row = document.createElement("div");
      row.className = "pastel-poster-row";
      const priceTxt = `RS ${Number(item.price).toFixed(2).replace(".", ",")}`;
      row.innerHTML = `
        <div class="pastel-poster-row-line">
          <span class="pastel-poster-name">${escapeHtml(item.name)}</span>
          <span class="pastel-poster-dots" aria-hidden="true"></span>
          <span class="pastel-poster-price">${priceTxt}</span>
        </div>
        <button type="button" class="pastel-poster-add">+</button>
      `;
      const addBtn = row.querySelector(".pastel-poster-add");
      addBtn.setAttribute("aria-label", `Adicionar ${item.name || "item"}`);
      bindAdd(addBtn, item, catId, catTitle, st, onToast);
      list.appendChild(row);
    });
    box.appendChild(list);
    left.appendChild(box);
  });

  const right = document.createElement("div");
  right.className = "pastel-poster-right";
  right.setAttribute("aria-hidden", "true");
  right.innerHTML = `<div class="pastel-poster-right-bg"></div><div class="pastel-poster-right-plate"></div>`;

  inner.appendChild(left);
  inner.appendChild(right);
  wrap.appendChild(inner);
  root.appendChild(wrap);
}

function priceShort(n) {
  return `R$${Math.round(Number(n))}`;
}

function appendBurgerSection(container, sec, catId, catTitle, onToast, burgerStyle) {
  const st = (sec.title || "").trim();
  const sub = (sec.subtitle || "").trim();
  const secEl = document.createElement("section");
  secEl.className = "burger-poster-sec";
  const h3 = document.createElement("h3");
  h3.className = burgerStyle
    ? "burger-poster-sec-title"
    : "burger-poster-sec-title burger-poster-sec-title--orange";
  h3.textContent = st.toUpperCase();
  secEl.appendChild(h3);
  if (sub) {
    const ps = document.createElement("p");
    ps.className = "burger-poster-sec-sub";
    ps.textContent = sub;
    secEl.appendChild(ps);
  }
  (sec.items || []).forEach((item) => {
    if (burgerStyle) {
      const row = document.createElement("div");
      row.className = "burger-poster-burger-row";
      row.innerHTML = `
        <div class="burger-poster-burger-text">
          <span class="burger-poster-item-name">${escapeHtml(item.name)}</span>
          <span class="burger-poster-item-desc">${escapeHtml(item.description || "")}</span>
        </div>
        <div class="burger-poster-price-ring"><span>${priceShort(item.price)}</span></div>
        <button type="button" class="burger-poster-add">+</button>
      `;
      const ba = row.querySelector(".burger-poster-add");
      ba.setAttribute("aria-label", `Adicionar ${item.name || "item"}`);
      bindAdd(ba, item, catId, catTitle, st, onToast);
      secEl.appendChild(row);
    } else {
      const row = document.createElement("div");
      row.className = "burger-poster-simple-row";
      row.innerHTML = `
        <span class="burger-poster-simple-name">${escapeHtml(item.name)}</span>
        <span class="burger-poster-simple-price">${priceShort(item.price)}</span>
        <button type="button" class="burger-poster-add-mini" aria-label="Adicionar">+</button>
      `;
      bindAdd(row.querySelector(".burger-poster-add-mini"), item, catId, catTitle, st, onToast);
      secEl.appendChild(row);
    }
  });
  container.appendChild(secEl);
}

/** Menu burgers — preto + laranja, duas colunas */
export function renderPosterBurger(root, cat, catId, catTitle, store, onToast) {
  root.className = "burger-poster-root";
  root.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "burger-poster";

  const header = document.createElement("header");
  header.className = "burger-poster-header";
  header.innerHTML = `
    <div class="burger-poster-brand">
      <span class="burger-poster-menu">MENU</span>
      <span class="burger-poster-line"></span>
      <span class="burger-poster-burguers">BURGUERS</span>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "burger-poster-grid";

  const left = document.createElement("div");
  left.className = "burger-poster-col burger-poster-col--left";

  const right = document.createElement("div");
  right.className = "burger-poster-col burger-poster-col--right";

  const photos = document.createElement("div");
  photos.className = "burger-poster-photos";
  photos.innerHTML = `
    <div class="burger-poster-circle burger-poster-circle--a"></div>
    <div class="burger-poster-circle burger-poster-circle--b"></div>
  `;
  right.appendChild(photos);

  const sections = cat.sections || [];
  sections
    .filter((s) => s.column !== "right")
    .forEach((sec) => appendBurgerSection(left, sec, catId, catTitle, onToast, true));
  sections
    .filter((s) => s.column === "right")
    .forEach((sec) => appendBurgerSection(right, sec, catId, catTitle, onToast, false));

  grid.appendChild(left);
  grid.appendChild(right);

  const foot = document.createElement("footer");
  foot.className = "burger-poster-foot";
  const wa = formatPhoneDisplay(store.whatsapp);
  foot.innerHTML = `
    <div class="burger-poster-foot-item">
      <span aria-hidden="true">🛵</span>
      <div><strong>DELIVERY</strong><br/>${escapeHtml(wa)}</div>
    </div>
    <div class="burger-poster-foot-item burger-poster-foot-item--addr">
      <span aria-hidden="true">📍</span>
      <div>AV. DOMINGOS BATISTA DE LIMA, 598 — JD GUANABARA</div>
    </div>
  `;

  wrap.appendChild(header);
  wrap.appendChild(grid);
  wrap.appendChild(foot);
  root.appendChild(wrap);
}
