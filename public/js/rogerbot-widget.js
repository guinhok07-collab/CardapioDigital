import { loadMenuData } from "./data-loader.js";

const WA_FALLBACK = "5511999999999";
const WA_HELP_TEXT =
  "Olá! Estou no cardápio digital e gostaria de uma ajuda com o pedido. 😊";

const BOT_HTML = `
  <div class="roger-bot roger-bot--tiny" aria-hidden="true">
    <div class="roger-bot-antenna"></div>
    <div class="roger-bot-head">
      <span class="roger-bot-eyes"><span></span><span></span></span>
      <span class="roger-bot-mouth"></span>
    </div>
    <div class="roger-bot-badge">R</div>
  </div>
`;

function appendExchange(root, userText, botText) {
  const body = root.querySelector("[data-rogerbot-messages]");
  if (!body) return;
  const u = document.createElement("p");
  u.className = "rogerbot-bubble rogerbot-bubble--user";
  u.textContent = userText;
  body.appendChild(u);
  const b = document.createElement("p");
  b.className = "rogerbot-bubble rogerbot-bubble--bot";
  b.textContent = botText;
  body.appendChild(b);
  body.scrollTop = body.scrollHeight;
}

export function mountRogerbotWidget() {
  if (document.getElementById("rogerbot-widget")) return;

  const wrap = document.createElement("div");
  wrap.id = "rogerbot-widget";
  wrap.className = "rogerbot-widget";
  wrap.innerHTML = `
    <div class="rogerbot-widget-backdrop hidden" data-rogerbot-backdrop tabindex="-1"></div>
    <div class="rogerbot-widget-panel hidden" id="rogerbot-panel" role="dialog" aria-modal="true" aria-labelledby="rogerbot-title" hidden>
      <div class="rogerbot-widget-panel-inner">
        <header class="rogerbot-widget-header">
          <div class="rogerbot-widget-header-bot" aria-hidden="true">${BOT_HTML}</div>
          <div class="rogerbot-widget-header-text">
            <h2 id="rogerbot-title" class="rogerbot-widget-title">Rogerbot</h2>
            <p class="rogerbot-widget-sub">Assistente do cardápio</p>
          </div>
          <button type="button" class="rogerbot-widget-close" data-rogerbot-close aria-label="Fechar painel">×</button>
        </header>
        <div class="rogerbot-widget-messages" data-rogerbot-messages>
          <p class="rogerbot-bubble rogerbot-bubble--bot">Oi! Sou o Rogerbot — posso te guiar no cardápio, no carrinho ou te passar pro WhatsApp da equipe.</p>
        </div>
        <div class="rogerbot-widget-chips" data-rogerbot-chips></div>
      </div>
    </div>
    <button type="button" class="rogerbot-widget-launch" aria-expanded="false" aria-controls="rogerbot-panel" aria-label="Abrir Rogerbot — ajuda com o cardápio" title="Rogerbot — ajuda com o cardápio">
      ${BOT_HTML}
    </button>
  `;

  document.body.appendChild(wrap);

  const panel = wrap.querySelector("#rogerbot-panel");
  const backdrop = wrap.querySelector("[data-rogerbot-backdrop]");
  const launch = wrap.querySelector(".rogerbot-widget-launch");
  const chips = wrap.querySelector("[data-rogerbot-chips]");

  let waDigits = WA_FALLBACK;
  let address = "";

  const setOpen = (open) => {
    panel.classList.toggle("hidden", !open);
    backdrop.classList.toggle("hidden", !open);
    panel.hidden = !open;
    launch.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("rogerbot-open", open);
    if (open) {
      wrap.querySelector("[data-rogerbot-close]")?.focus();
    }
  };

  launch.addEventListener("click", () => setOpen(panel.classList.contains("hidden")));
  backdrop.addEventListener("click", () => setOpen(false));
  wrap.querySelectorAll("[data-rogerbot-close]").forEach((el) => {
    el.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.classList.contains("hidden")) {
      setOpen(false);
      launch.focus();
    }
  });

  function buildChips() {
    const waUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(WA_HELP_TEXT)}`;
    chips.innerHTML = `
      <button type="button" class="rogerbot-chip" data-q="cardapio">📋 O que tem no cardápio?</button>
      <button type="button" class="rogerbot-chip" data-q="endereco">📍 Qual o endereço da loja?</button>
      <button type="button" class="rogerbot-chip" data-q="pedido">🛒 Como faço meu pedido?</button>
      <a href="index.html#cardapio" class="rogerbot-chip rogerbot-chip--link">Abrir categorias</a>
      <a href="carrinho.html" class="rogerbot-chip rogerbot-chip--link">Ver carrinho</a>
      <a href="${waUrl}" class="rogerbot-chip rogerbot-chip--wa" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
    `;

    chips.querySelectorAll("[data-q]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = btn.getAttribute("data-q");
        if (q === "cardapio") {
          appendExchange(
            wrap,
            "O que tem no cardápio?",
            "Na página inicial você vê todas as categorias: burgers, pastelaria, pizza, doces e bebidas. É só tocar em uma pra ver os itens e preços."
          );
        } else if (q === "endereco") {
          const addr =
            address.trim() ||
            "O endereço aparece no rodapé da página inicial assim que o cardápio carrega.";
          appendExchange(wrap, "Qual o endereço da loja?", addr);
        } else if (q === "pedido") {
          appendExchange(
            wrap,
            "Como faço meu pedido?",
            "Escolhe os itens, adiciona ao carrinho, revisa no carrinho e envia pelo WhatsApp com seus dados. Se tiver dúvida em algum ingrediente, chama a gente aqui pelo botão verde."
          );
        }
      });
    });
  }

  loadMenuData()
    .then((data) => {
      const store = data.store || {};
      waDigits = String(store.whatsapp || "")
        .replace(/\D/g, "")
        .trim() || WA_FALLBACK;
      address = String(store.address || "").trim();
      buildChips();
    })
    .catch(() => {
      buildChips();
    });
}

mountRogerbotWidget();
