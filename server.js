const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ACROSS_API = "https://app.across.to/api";
const ACROSS_API_KEY = process.env.ACROSS_API_KEY;
const ACROSS_INTEGRATOR_ID = process.env.ACROSS_INTEGRATOR_ID || "0x0000";

if (!ACROSS_API_KEY) {
  console.warn("WARNING: ACROSS_API_KEY is not set. Set it in Railway > Variables.");
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function acrossHeaders() {
  return {
    "Authorization": `Bearer ${ACROSS_API_KEY}`,
    "Content-Type": "application/json"
  };
}

// Supported chains
app.get("/api/chains", async (req, res) => {
  try {
    const r = await fetch(`${ACROSS_API}/swap/chains?integratorId=${ACROSS_INTEGRATOR_ID}`, {
      headers: acrossHeaders()
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supported tokens for a given chain
app.get("/api/tokens", async (req, res) => {
  try {
    const { chainId } = req.query;
    const r = await fetch(`${ACROSS_API}/swap/tokens?chainId=${chainId}&integratorId=${ACROSS_INTEGRATOR_ID}`, {
      headers: acrossHeaders()
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a live swap approval/quote (fees, output amount, calldata)
app.get("/api/quote", async (req, res) => {
  try {
    const {
      originChainId,
      destinationChainId,
      inputToken,
      outputToken,
      amount,
      depositor,
      recipient
    } = req.query;

    const params = new URLSearchParams({
      originChainId,
      destinationChainId,
      inputToken,
      outputToken,
      amount,
      depositor: depositor || "",
      recipient: recipient || "",
      integratorId: ACROSS_INTEGRATOR_ID
    });

    const r = await fetch(`${ACROSS_API}/swap/approval?${params.toString()}`, {
      headers: acrossHeaders()
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data.message || "Across API error", details: data });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track a deposit's fill status
app.get("/api/deposit-status", async (req, res) => {
  try {
    const { depositId, originChainId } = req.query;
    const params = new URLSearchParams({ depositId, originChainId });
    const r = await fetch(`${ACROSS_API}/deposit/status?${params.toString()}`, {
      headers: acrossHeaders()
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USD prices from CoinGecko (kept server-side, avoids CORS)
app.get("/api/prices", async (req, res) => {
  try {
    const { ids } = req.query;
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bridge server running on port ${PORT}`);
});
