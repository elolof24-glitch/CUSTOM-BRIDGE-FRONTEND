const connectBtn = document.getElementById("connectBtn");
const walletLabel = document.getElementById("walletLabel");
const walletDot = document.getElementById("walletDot");

const fromChainEl = document.getElementById("fromChain");
const toChainEl = document.getElementById("toChain");
const tokenEl = document.getElementById("token");
const amountEl = document.getElementById("amount");
const recipientEl = document.getElementById("recipient");

const quoteBtn = document.getElementById("quoteBtn");
const executeBtn = document.getElementById("executeBtn");
const quoteBox = document.getElementById("quoteBox");
const statusEl = document.getElementById("status");

let provider = null;
let signer = null;
let userAddress = null;

let chains = [];
let tokensByChain = {};
let currentQuote = null;

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatAmount(value, decimals = 6) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

function setWalletConnected(address) {
  walletLabel.textContent = shortAddress(address);
  walletDot.classList.remove("offline");
  walletDot.classList.add("online");
}

function setWalletDisconnected() {
  walletLabel.textContent = "Connect Wallet";
  walletDot.classList.remove("online");
  walletDot.classList.add("offline");
}

async function apiJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }
  return data;
}

function normalizeChains(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.chains)) return data.chains;
  return [];
}

function normalizeTokens(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tokens)) return data.tokens;
  return [];
}

function getChainName(chain) {
  return chain?.name || chain?.chainName || `Chain ${chain?.chainId ?? ""}`;
}

function getTokenSymbol(token) {
  return token?.symbol || token?.name || "Token";
}

function getTokenAddress(token) {
  return token?.address || token?.tokenAddress || token?.mainnetAddress || "";
}

function getTokenDecimals(token) {
  return Number(token?.decimals ?? 18);
}

function getTokenLogo(token) {
  return token?.logoURI || token?.logoUrl || token?.image || "";
}

function renderChainOptions() {
  const options = chains.map((chain) => {
    const chainId = chain.chainId ?? chain.id;
    const name = getChainName(chain);
    return `<option value="${chainId}">${name}</option>`;
  }).join("");

  fromChainEl.innerHTML = options;
  toChainEl.innerHTML = options;

  if (chains.length >= 2) {
    fromChainEl.value = String(chains[0].chainId ?? chains[0].id);
    toChainEl.value = String(chains[1].chainId ?? chains[1].id);
  } else if (chains.length === 1) {
    const only = String(chains[0].chainId ?? chains[0].id);
    fromChainEl.value = only;
    toChainEl.value = only;
  }
}

function renderTokenOptions(chainId) {
  const tokens = tokensByChain[String(chainId)] || [];
  tokenEl.innerHTML = tokens.map((token, i) => {
    const symbol = getTokenSymbol(token);
    const address = getTokenAddress(token);
    const logo = getTokenLogo(token);
    const display = logo ? `${symbol} • logo` : symbol;
    return `<option value="${address}" data-index="${i}">${display}</option>`;
  }).join("");

  updateActionState();
}

function selectedToken() {
  const chainId = fromChainEl.value;
  const tokens = tokensByChain[String(chainId)] || [];
  return tokens.find((t) => getTokenAddress(t) === tokenEl.value) || null;
}

async function loadChains() {
  setStatus("Loading supported chains...");
  const data = await apiJson("/api/chains");
  chains = normalizeChains(data);

  if (!chains.length) {
    throw new Error("No supported chains returned from API");
  }

  renderChainOptions();
  setStatus("");
}

async function loadTokens(chainId) {
  if (!chainId) return;
  if (tokensByChain[String(chainId)]) {
    renderTokenOptions(chainId);
    return;
  }

  setStatus("Loading tokens...");
  const data = await apiJson(`/api/tokens?chainId=${encodeURIComponent(chainId)}`);
  const tokens = normalizeTokens(data);

  tokensByChain[String(chainId)] = tokens;
  renderTokenOptions(chainId);
  setStatus("");
}

function updateActionState() {
  const hasFrom = !!fromChainEl.value;
  const hasTo = !!toChainEl.value;
  const hasToken = !!tokenEl.value;
  const amount = Number(amountEl.value);
  const validAmount = Number.isFinite(amount) && amount > 0;

  quoteBtn.disabled = !(hasFrom && hasTo && hasToken && validAmount);
}

function quoteSummaryHtml(quote, token) {
  const outAmount =
    quote?.quote?.minOutputAmount ??
    quote?.minOutputAmount ??
    quote?.expectedOutputAmount ??
    null;

  const fees =
    quote?.fees?.total ??
    quote?.fees?.totalRelayFee?.amount ??
    quote?.totalFee ??
    null;

  const fillTime =
    quote?.expectedFillTime ??
    quote?.estimatedFillTimeSec ??
    null;

  const symbol = getTokenSymbol(token);
  const decimals = getTokenDecimals(token);

  let formattedOut = "-";
  if (outAmount != null) {
    try {
      formattedOut = ethers.formatUnits(BigInt(outAmount), decimals);
    } catch {
      formattedOut = String(outAmount);
    }
  }

  return `
    <div><strong>Token:</strong> ${symbol}</div>
    <div><strong>Min received:</strong> ${formatAmount(formattedOut, 6)} ${symbol}</div>
    <div><strong>Estimated fill:</strong> ${fillTime ? `${fillTime}s` : "-"}</div>
    <div><strong>Fees:</strong> ${fees ?? "-"}</div>
  `;
}

async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No wallet found. Install MetaMask or another EVM wallet.");
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  setWalletConnected(userAddress);

  if (!recipientEl.value) {
    recipientEl.value = userAddress;
  }

  setStatus("Wallet connected");
}

async function getQuote() {
  const token = selectedToken();
  if (!token) throw new Error("Select a token");

  const originChainId = fromChainEl.value;
  const destinationChainId = toChainEl.value;
  const inputToken = getTokenAddress(token);
  const outputToken = getTokenAddress(token);
  const decimals = getTokenDecimals(token);
  const amountRaw = ethers.parseUnits(amountEl.value, decimals).toString();
  const recipient = recipientEl.value || userAddress || "";

  setStatus("Fetching quote...");
  quoteBtn.disabled = true;
  executeBtn.disabled = true;
  executeBtn.classList.add("hidden");

  const params = new URLSearchParams({
    originChainId,
    destinationChainId,
    inputToken,
    outputToken,
    amount: amountRaw,
    depositor: userAddress || "",
    recipient
  });

  const quote = await apiJson(`/api/quote?${params.toString()}`);
  currentQuote = quote;

  quoteBox.innerHTML = quoteSummaryHtml(quote, token);
  quoteBox.classList.remove("hidden");
  executeBtn.classList.remove("hidden");
  executeBtn.disabled = !userAddress;

  setStatus("Quote ready");
  updateActionState();
}

async function executeBridge() {
  if (!currentQuote) throw new Error("Get a quote first");
  if (!signer) throw new Error("Connect wallet first");

  const approvalTxns = currentQuote.approvalTxns || currentQuote?.quote?.approvalTxns || [];
  const swapTx = currentQuote.swapTx || currentQuote?.quote?.swapTx;

  if (!swapTx) {
    throw new Error("No executable swap transaction returned");
  }

  setStatus("Sending approvals...");
  executeBtn.disabled = true;

  for (const approval of approvalTxns) {
    const tx = await signer.sendTransaction({
      to: approval.to,
      data: approval.data,
      value: approval.value ? BigInt(approval.value) : 0n
    });
    await tx.wait();
  }

  setStatus("Sending bridge transaction...");
  const tx = await signer.sendTransaction({
    to: swapTx.to,
    data: swapTx.data,
    value: swapTx.value ? BigInt(swapTx.value) : 0n
  });

  quoteBox.innerHTML += `<div><strong>Submitted:</strong> ${tx.hash}</div>`;
  setStatus("Bridge submitted");
  executeBtn.disabled = false;
}

connectBtn.addEventListener("click", async () => {
  try {
    await connectWallet();
  } catch (err) {
    setStatus(err.message);
  }
});

fromChainEl.addEventListener("change", async () => {
  try {
    await loadTokens(fromChainEl.value);
    updateActionState();
  } catch (err) {
    setStatus(err.message);
  }
});

toChainEl.addEventListener("change", updateActionState);
tokenEl.addEventListener("change", updateActionState);
amountEl.addEventListener("input", updateActionState);

quoteBtn.addEventListener("click", async () => {
  try {
    await getQuote();
  } catch (err) {
    setStatus(err.message);
    quoteBtn.disabled = false;
  }
});

executeBtn.addEventListener("click", async () => {
  try {
    await executeBridge();
  } catch (err) {
    setStatus(err.message);
    executeBtn.disabled = false;
  }
});

async function init() {
  try {
    setWalletDisconnected();
    await loadChains();
    await loadTokens(fromChainEl.value);
    updateActionState();
  } catch (err) {
    setStatus(err.message);
  }
}

init();
