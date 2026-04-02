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
  u.textContent = String(userText ?? "").trim();
  body.appendChild(u);
  const b = document.createElement("p");
  b.className = "rogerbot-bubble rogerbot-bubble--bot";
  b.textContent = String(botText ?? "").trim();
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
    <div
      class="rogerbot-widget-panel hidden"
      id="rogerbot-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rogerbot-title"
      hidden
    >
      <div class="rogerbot-widget-panel-inner">
        <header class="rogerbot-widget-header">
          <div class="rogerbot-widget-header-bot" aria-hidden="true">${BOT_HTML}</div>
          <div class="rogerbot-widget-header-text">
            <h2 id="rogerbot-title" class="rogerbot-widget-title">Roger</h2>
            <p class="rogerbot-widget-sub">Assistente virtual</p>
          </div>
          <button type="button" class="rogerbot-widget-close" data-rogerbot-close aria-label="Fechar painel">×</button>
        </header>
        <div class="rogerbot-widget-messages" data-rogerbot-messages>
          <p class="rogerbot-bubble rogerbot-bubble--bot">Olá! Ótima escolha. 😊 Eu sou o Roger, seu assistente virtual. Como posso te ajudar?</p>
        </div>
        <div class="rogerbot-widget-chips" data-rogerbot-chips></div>
        <form class="rogerbot-widget-input-row" id="rogerbot-input-form">
          <input
            id="rogerbot-input"
            class="rogerbot-widget-input"
            type="text"
            inputmode="text"
            autocomplete="off"
            placeholder="Digite sua dúvida…"
            aria-label="Digite sua dúvida"
          />
          <button class="rogerbot-widget-send" type="submit" aria-label="Enviar mensagem">➤</button>
        </form>
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
  const inputForm = wrap.querySelector("#rogerbot-input-form");
  const input = wrap.querySelector("#rogerbot-input");

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

  function botAnswerByText(text) {
    const q = String(text || "").toLowerCase();
    const addr = address.trim() || "O endereço aparece no rodapé da página inicial assim que o cardápio carregar.";

    if (q.includes("endereço") || q.includes("endereco") || q.includes("onde") || q.includes("local") || q.includes("rua")) {
      return addr;
    }

    if (q.includes("pedido") || q.includes("carrinho") || q.includes("comprar") || q.includes("enviar") || q.includes("whatsapp")) {
      return "Escolhe os itens, adiciona ao carrinho, preenche seus dados no carrinho e envia o pedido pelo WhatsApp. Se quiser, toque em “Ver carrinho” agora.";
    }

    if (q.includes("cardapio") || q.includes("cardápio") || q.includes("menu") || q.includes("categoria") || q.includes("tem") || q.includes("o que")) {
      return "Na página inicial você encontra: Burgers, Pastelaria, Pizza, Doces e Bebidas. Toque em uma categoria para ver os itens e preços.";
    }

    return "Entendi! Para resolver mais rápido, toque em “Falar no WhatsApp” e chama a equipe com seu pedido.";
  }

  inputForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = String(input?.value || "").trim();
    if (!val) return;
    if (input) input.value = "";

    // Resposta bot + bolhas
    const botText = botAnswerByText(val);
    appendExchange(wrap, val, botText);
  });

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
