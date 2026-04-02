const STORAGE_KEY = "cardapio_cart_v1";

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch (e) {
    return [];
  }
}

function writeRaw(lines) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  try {
    window.dispatchEvent(new CustomEvent("cardapio-cart-updated"));
  } catch (e) {}
}

function lineKey(catId, itemId) {
  return `${catId}::${itemId}`;
}

export function getLines() {
  return readRaw();
}

export function getItemCount() {
  return readRaw().reduce((s, L) => s + (L.qty || 0), 0);
}

export function getSubtotal() {
  return readRaw().reduce(
    (s, L) => s + (Number(L.price) || 0) * (L.qty || 0),
    0
  );
}

export function addItem({ catId, catTitle, item }) {
  const lines = readRaw();
  const key = lineKey(catId, item.id);
  const i = lines.findIndex((L) => L.key === key);
  if (i >= 0) lines[i].qty = (lines[i].qty || 0) + 1;
  else
    lines.push({
      key,
      catId,
      catTitle: catTitle || "",
      itemId: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      qty: 1,
    });
  writeRaw(lines);
}

export function setQty(key, qty) {
  const q = Math.max(0, parseInt(String(qty), 10) || 0);
  let lines = readRaw();
  const i = lines.findIndex((L) => L.key === key);
  if (i < 0) return;
  if (q === 0) lines.splice(i, 1);
  else lines[i].qty = q;
  writeRaw(lines);
}

export function removeLine(key) {
  writeRaw(readRaw().filter((L) => L.key !== key));
}

export function clearCart() {
  writeRaw([]);
}

export function formatMoney(n) {
  return Number(n).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatOrderMode(mode) {
  if (mode === "local") return "Comer agora (no local)";
  if (mode === "takeaway") return "Para levar (retirada)";
  if (mode === "delivery") return "Entrega";
  return String(mode || "-");
}

/** Número único por envio (data + hora + ms + aleatório). */
export function generateOrderNumber() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const timePart = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  const rnd = Math.floor(10 + Math.random() * 89);
  return `${datePart}-${timePart}${ms}-${rnd}`;
}

/** Evita que * do usuário quebre negrito no WhatsApp */
function waSafe(s) {
  return String(s == null ? "" : s).replace(/\*/g, "·");
}

function sectionTitle(emoji, label) {
  return `\n*━━ ${emoji} ${label} ━━*\n`;
}

export function buildWhatsappText({ name, store, lines, customer, orderNumber }) {
  const storeName = waSafe(name || "Point do Roger");
  const ord = waSafe(orderNumber || "—");
  const list = lines || [];
  const waLines = list
    .map((L, i) => {
      const sub = (Number(L.price) || 0) * (L.qty || 0);
      const n = i + 1;
      return `*${n}) ${L.qty}x ${waSafe(L.name)} — ${formatMoney(sub)}*`;
    })
    .join("\n");
  const total = list.reduce(
    (s, L) => s + (Number(L.price) || 0) * (L.qty || 0),
    0
  );

  let t = "";
  t += `*🧾 PEDIDO #${ord}*\n`;
  t += `*${storeName}*\n`;

  t += sectionTitle("👤", "CLIENTE");
  t += `*Nome:* ${waSafe(customer.name)}\n`;
  t += `*Telefone:* ${waSafe(customer.phone)}\n`;
  t += `*Tipo: ${formatOrderMode(customer.orderMode)}*\n`;

  const st = (customer.street || "").trim();
  const num = (customer.number || "").trim();
  const neigh = (customer.neighborhood || "").trim();
  const hasAddr = !!(st || num || neigh);
  const isDelivery = customer.orderMode === "delivery";

  if (isDelivery || hasAddr) {
    t += sectionTitle("📍", isDelivery ? "ENTREGA" : "ENDEREÇO / REF.");
    t += `*Rua:* ${waSafe(st) || "—"}\n`;
    t += `*Nº:* ${waSafe(num) || "—"}\n`;
    t += `*Bairro:* ${waSafe(neigh) || "—"}\n`;
  }

  t += sectionTitle("🛒", "ITENS DO PEDIDO");
  t += waLines || "*_(nenhum item)_*";
  t += `\n\n*💰 TOTAL:* *${formatMoney(total)}*`;

  t += sectionTitle("💳", "PAGAMENTO");
  const pay = customer.payment || "";
  t += `*${waSafe(pay) || "—"}*\n`;
  if (pay === "PIX" && (store.pixKey || "").trim()) {
    t += `*Chave PIX:* ${String(store.pixKey).trim()}\n`;
    t += `_Envie o comprovante neste chat após pagar._\n`;
  }
  if (pay === "Cartão online") {
    t += `_Cliente usa o link de cartão; confirme o recebimento._\n`;
  }

  const notes = (customer.notes || "").trim();
  t += sectionTitle("📝", "OBSERVAÇÕES");
  if (notes) {
    t += `*${waSafe(notes)}*\n`;
  } else {
    t += `_Nenhuma observação._\n`;
  }

  t += `\n*#${ord}* _← use este número para localizar o pedido_\n`;
  return t;
}

export function openWhatsappOrder({ whatsappDigits, text }) {
  const wa =
    String(whatsappDigits || "").replace(/\D/g, "") || "5511999999999";
  window.open(
    `https://wa.me/${wa}?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer"
  );
}
