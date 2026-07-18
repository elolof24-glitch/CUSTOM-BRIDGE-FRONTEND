const FALLBACK_LOGO =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18'%3E%3Ccircle cx='9' cy='9' r='9' fill='%235b8def'/%3E%3C/svg%3E";

let CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png" },
  { id: "arbitrum", name: "Arbitrum", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/arbitrum/info/logo.png" },
  { id: "base", name: "Base", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/base/info/logo.png" },
  { id: "optimism", name: "Optimism", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/optimism/info/logo.png" },
  { id: "polygon", name: "Polygon", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/polygon/info/logo.png" },
  { id: "avalanche", name: "Avalanche", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/avalanchec/info/logo.png" },
  { id: "solana", name: "Solana", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png" },
  { id: "arc", name: "Arc", logo: FALLBACK_LOGO, custom: true, noRoute: true },
  { id: "robinhood", name: "Robinhood Chain", logo: FALLBACK_LOGO, custom: true, noRoute: true }
];

const TOKENS_BY_CHAIN = {
  ethereum: [
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 },
    { symbol: "ETH", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png", price: 1840 },
    { symbol: "USDT", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png", price: 1.0 }
  ],
  arbitrum: [
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 },
    { symbol: "ETH", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png", price: 1840 },
    { symbol: "ARB", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/arbitrum/info/logo.png", price: 0.75 }
  ],
  base: [
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 },
    { symbol: "ETH", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png", price: 1840 }
  ],
  optimism: [
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 },
    { symbol: "OP", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/optimism/info/logo.png", price: 1.9 },
    { symbol: "ETH", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png", price: 1840 }
  ],
  polygon: [
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 },
    { symbol: "MATIC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/polygon/info/logo.png", price: 0.45 }
  ],
  avalanche: [
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 },
    { symbol: "AVAX", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/avalanchec/info/logo.png", price: 28 }
  ],
  solana: [
    { symbol: "SOL", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png", price: 75 },
    { symbol: "USDC", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png", price: 1.0 }
  ],
  arc: [],
  robinhood: [
    { symbol: "USDG", logo: FALLBACK_LOGO, price: 1.0 },
    { symbol: "ETH", logo: "https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png", price: 1840 }
  ]
};

function tokensFor(chain) {
  return TOKENS_BY_CHAIN[chain.id] || [];
}

let fromChain = CHAINS[0];
let toChain = CHAINS[2];
let currentToken = TOKENS_BY_CHAIN.ethereum[0];
let currentToToken = TOKENS_BY_CHAIN.base[0];

const fromDropdown = document.getElementById("fromDropdown");
const toDropdown = document.getElementById("toDropdown");
const tokenDropdown = document.getElementById("tokenDropdown");
const toTokenDropdown = document.getElementById("toTokenDropdown");

const amountEl = document.getElementById("amount");
const fromUsdEl = document.getElementById("fromUsd");
const sendSummaryEl = document.getElementById("sendSummary");
const statusEl = document.getElementById("status");

function safeLogo(url) {
  return url || FALLBACK_LOGO;
}

function setImg(id, url) {
  const img = document.getElementById(id);
  if (!img) return;
  img.onerror = function () {
    this.onerror = null;
    this.src = FALLBACK_LOGO;
  };
  img.src = safeLogo(url);
}

function renderDropdown(el, onPick) {
  el.innerHTML = CHAINS.map(c => `
    <div class="dropdown-item" data-id="${c.id}">
      <img src="${safeLogo(c.logo)}" onerror="this.onerror=null;this.src='${FALLBACK_LOGO}'" />
      <span>${c.name}</span>
      ${c.custom ? '<span class="custom-tag">custom</span>' : ""}
    </div>
  `).join("");

  el.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", () => {
      const chain = CHAINS.find(c => c.id === item.dataset.id);
      onPick(chain);
      el.classList.remove("show");
    });
  });
}

function refreshDropdowns() {
  renderDropdown(fromDropdown, setFromChain);
  renderDropdown(toDropdown, setToChain);
}

function setFromChain(chain) {
  fromChain = chain;
  setImg("fromChainLogo", chain.logo);
  document.getElementById("fromChainName").textContent = chain.name;

  const list = tokensFor(chain);
  currentToken = list[0] || { symbol: "-", logo: FALLBACK_LOGO, price: 0 };
  setImg("tokenLogo", currentToken.logo);
  document.getElementById("tokenName").textContent = currentToken.symbol;

  updateUsd();
  checkLiquidity();
}

function setToChain(chain) {
  toChain = chain;
  setImg("toChainLogo", chain.logo);
  document.getElementById("toChainName").textContent = chain.name;

  const list = tokensFor(chain);
  currentToToken = list[0] || { symbol: "-", logo: FALLBACK_LOGO, price: 0 };
  setImg("toTokenLogo", currentToToken.logo);
  document.getElementById("toTokenName").textContent = currentToToken.symbol;

  checkLiquidity();
  updateReceiveEstimate();
}

const ADD_TOKEN_ROW = (idPrefix) => `
  <div class="dropdown-addtoken">
    <input id="${idPrefix}CustomAddr" placeholder="Paste token contract address" />
    <button id="${idPrefix}CustomAddBtn">+ Add custom token</button>
  </div>
`;

function renderTokenDropdown() {
  const list = tokensFor(fromChain);
  const items = list.length
    ? list.map(t => `
      <div class="dropdown-item" data-symbol="${t.symbol}">
        <img src="${safeLogo(t.logo)}" onerror="this.onerror=null;this.src='${FALLBACK_LOGO}'" />
        <span>${t.symbol}</span>
      </div>
    `).join("")
    : `<div class="dropdown-item" style="cursor:default;color:#6c7488">No known tokens yet</div>`;

  tokenDropdown.innerHTML = items + ADD_TOKEN_ROW("from");

  tokenDropdown.querySelectorAll(".dropdown-item[data-symbol]").forEach(item => {
    item.addEventListener("click", () => {
      currentToken = list.find(t => t.symbol === item.dataset.symbol);
      setImg("tokenLogo", currentToken.logo);
      document.getElementById("tokenName").textContent = currentToken.symbol;
      updateUsd();
      tokenDropdown.classList.remove("show");
    });
  });

  const addBtn = document.getElementById("fromCustomAddBtn");
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const addr = document.getElementById("fromCustomAddr").value.trim();
      if (!addr || addr.length < 8) {
        alert("Paste a valid contract address");
        return;
      }
      const symbol = addr.slice(0, 4).toUpperCase() + "…" + addr.slice(-4);
      const newToken = { symbol, logo: FALLBACK_LOGO, price: 0, custom: true, address: addr };
      if (!TOKENS_BY_CHAIN[fromChain.id]) TOKENS_BY_CHAIN[fromChain.id] = [];
      TOKENS_BY_CHAIN[fromChain.id].push(newToken);
      currentToken = newToken;
      setImg("tokenLogo", newToken.logo);
      document.getElementById("tokenName").textContent = newToken.symbol;
      updateUsd();
      tokenDropdown.classList.remove("show");
    });
  }
}

function renderToTokenDropdown() {
  const list = tokensFor(toChain);
  const items = list.length
    ? list.map(t => `
      <div class="dropdown-item" data-symbol="${t.symbol}">
        <img src="${safeLogo(t.logo)}" onerror="this.onerror=null;this.src='${FALLBACK_LOGO}'" />
        <span>${t.symbol}</span>
      </div>
    `).join("")
    : `<div class="dropdown-item" style="cursor:default;color:#6c7488">No known tokens yet</div>`;

  toTokenDropdown.innerHTML = items + ADD_TOKEN_ROW("to");

  toTokenDropdown.querySelectorAll(".dropdown-item[data-symbol]").forEach(item => {
    item.addEventListener("click", () => {
      currentToToken = list.find(t => t.symbol === item.dataset.symbol);
      setImg("toTokenLogo", currentToToken.logo);
      document.getElementById("toTokenName").textContent = currentToToken.symbol;
      updateReceiveEstimate();
      toTokenDropdown.classList.remove("show");
    });
  });

  const addBtn = document.getElementById("toCustomAddBtn");
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const addr = document.getElementById("toCustomAddr").value.trim();
      if (!addr || addr.length < 8) {
        alert("Paste a valid contract address");
        return;
      }
      const symbol = addr.slice(0, 4).toUpperCase() + "…" + addr.slice(-4);
      const newToken = { symbol, logo: FALLBACK_LOGO, price: 0, custom: true, address: addr };
      if (!TOKENS_BY_CHAIN[toChain.id]) TOKENS_BY_CHAIN[toChain.id] = [];
      TOKENS_BY_CHAIN[toChain.id].push(newToken);
      currentToToken = newToken;
      setImg("toTokenLogo", newToken.logo);
      document.getElementById("toTokenName").textContent = newToken.symbol;
      updateReceiveEstimate();
      toTokenDropdown.classList.remove("show");
    });
  }
}

function checkLiquidity() {
  const badge = document.getElementById("liqBadge");
  if (fromChain.id === toChain.id) {
    badge.className = "liq-badge none";
    badge.textContent = "● Pick two different chains";
  } else if (fromChain.noRoute || toChain.noRoute) {
    badge.className = "liq-badge none";
    badge.textContent = "● No route — chain not yet live on Across";
  } else {
    badge.className = "liq-badge good";
    badge.textContent = "● Liquidity OK";
  }
}

function sanitizeAmountInput() {
  let v = amountEl.value.replace(",", ".");
  v = v.replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  amountEl.value = v;
}

function updateUsd() {
  sanitizeAmountInput();
  const amt = parseFloat(amountEl.value || "0") || 0;
  const usd = (amt * (currentToken.price || 0)).toFixed(2);
  fromUsdEl.textContent = `≈ $${usd}`;
  sendSummaryEl.textContent = `${amt} ${currentToken.symbol} (~$${usd})`;
  updateReceiveEstimate();
}

const FEE_RATE = 0.0018;

function updateReceiveEstimate() {
  const amt = parseFloat(amountEl.value || "0") || 0;
  const sendUsd = amt * (currentToken.price || 0);
  const receiveUsd = sendUsd * (1 - FEE_RATE);
  const toPrice = (currentToToken && currentToToken.price) || 0;
  const receiveAmt = toPrice > 0 ? (receiveUsd / toPrice) : 0;

  document.getElementById("receiveAmount").textContent =
    toPrice > 0 ? receiveAmt.toFixed(6).replace(/0+$/, "").replace(/\.$/, "") : "-";
  document.getElementById("toUsd").textContent = `≈ $${receiveUsd.toFixed(2)}`;
}

document.getElementById("fromChainPill").addEventListener("click", (e) => {
  e.stopPropagation();
  toDropdown.classList.remove("show");
  tokenDropdown.classList.remove("show");
  toTokenDropdown.classList.remove("show");
  fromDropdown.classList.toggle("show");
});

document.getElementById("toChainPill").addEventListener("click", (e) => {
  e.stopPropagation();
  fromDropdown.classList.remove("show");
  tokenDropdown.classList.remove("show");
  toTokenDropdown.classList.remove("show");
  toDropdown.classList.toggle("show");
});

document.getElementById("tokenPill").addEventListener("click", (e) => {
  e.stopPropagation();
  fromDropdown.classList.remove("show");
  toDropdown.classList.remove("show");
  toTokenDropdown.classList.remove("show");
  renderTokenDropdown();
  tokenDropdown.classList.toggle("show");
});

document.getElementById("toTokenPill").addEventListener("click", (e) => {
  e.stopPropagation();
  fromDropdown.classList.remove("show");
  toDropdown.classList.remove("show");
  tokenDropdown.classList.remove("show");
  renderToTokenDropdown();
  toTokenDropdown.classList.toggle("show");
});

document.addEventListener("click", () => {
  fromDropdown.classList.remove("show");
  toDropdown.classList.remove("show");
  tokenDropdown.classList.remove("show");
  toTokenDropdown.classList.remove("show");
});

[fromDropdown, toDropdown, tokenDropdown, toTokenDropdown].forEach(d => {
  d.addEventListener("click", (e) => e.stopPropagation());
});

document.getElementById("flipBtn").addEventListener("click", () => {
  const oldFrom = fromChain;
  const oldTo = toChain;
  const oldFromToken = currentToken;
  const oldToToken = currentToToken;

  setFromChain(oldTo);
  setToChain(oldFrom);

  currentToken = oldToToken || tokensFor(fromChain)[0] || { symbol: "-", logo: FALLBACK_LOGO, price: 0 };
  currentToToken = oldFromToken || tokensFor(toChain)[0] || { symbol: "-", logo: FALLBACK_LOGO, price: 0 };

  setImg("tokenLogo", currentToken.logo);
  document.getElementById("tokenName").textContent = currentToken.symbol;
  setImg("toTokenLogo", currentToToken.logo);
  document.getElementById("toTokenName").textContent = currentToToken.symbol;

  updateUsd();
  updateReceiveEstimate();
});

amountEl.addEventListener("input", updateUsd);

document.getElementById("confirmBtn").addEventListener("click", () => {
  const sender = document.getElementById("senderAddr").value.trim();
  const receiver = document.getElementById("receiverAddr").value.trim();

  if (!sender || !receiver) {
    statusEl.style.color = "#f0616b";
    statusEl.textContent = "Enter both sender and receiver addresses first.";
    return;
  }

  if (fromChain.id === toChain.id) {
    statusEl.style.color = "#f0616b";
    statusEl.textContent = "Pick two different chains.";
    return;
  }

  if (fromChain.noRoute || toChain.noRoute) {
    statusEl.style.color = "#f0616b";
    statusEl.textContent = "This route is not live on Across yet.";
    return;
  }

  statusEl.style.color = "#7d859a";
  statusEl.textContent = `Would bridge ${amountEl.value} ${currentToken.symbol} from ${fromChain.name} (${sender.slice(0,6)}...) to ${toChain.name} (${receiver.slice(0,6)}...)`;
});

document.getElementById("addChainLink").addEventListener("click", () => {
  document.getElementById("addChainModal").classList.add("show");
});

document.getElementById("ccCancel").addEventListener("click", () => {
  document.getElementById("addChainModal").classList.remove("show");
});

document.getElementById("ccAdd").addEventListener("click", () => {
  const name = document.getElementById("ccName").value.trim();
  const id = document.getElementById("ccId").value.trim();
  const rpc = document.getElementById("ccRpc").value.trim();

  if (!name || !id || !rpc) {
    alert("Fill all fields");
    return;
  }

  const chainId = "custom-" + id;
  const newChain = {
    id: chainId,
    name,
    chainIdNum: id,
    rpc,
    logo: FALLBACK_LOGO,
    custom: true,
    noRoute: true
  };

  CHAINS.push(newChain);
  TOKENS_BY_CHAIN[chainId] = [];
  refreshDropdowns();
  setToChain(newChain);

  document.getElementById("addChainModal").classList.remove("show");
  document.getElementById("ccName").value = "";
  document.getElementById("ccId").value = "";
  document.getElementById("ccRpc").value = "";
});

setFromChain(CHAINS[0]);
setToChain(CHAINS[2]);
refreshDropdowns();
setImg("tokenLogo", currentToken.logo);
document.getElementById("tokenName").textContent = currentToken.symbol;
setImg("toTokenLogo", currentToToken.logo);
document.getElementById("toTokenName").textContent = currentToToken.symbol;
updateUsd();
updateReceiveEstimate();
