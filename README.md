# Custom Across Bridge Frontend

A minimal, standalone bridge UI built on Across Protocol's official public Swap API.
It has no hardcoded contract or chain addresses — everything (chains, tokens, quotes, calldata)
comes live from `app.across.to/api`, so it automatically supports whatever chains Across has
officially enabled. When Across adds a new chain, it just appears in the dropdown — no code changes needed.

## How it works

1. `server.js` is a tiny Express proxy that holds your Across API key server-side (never exposed to the browser)
   and forwards requests to `/swap/chains`, `/swap/tokens`, `/swap/approval`, `/deposit/status`.
2. `public/index.html` + `app.js` is the frontend: connect wallet (MetaMask via ethers.js), pick chains/token/amount,
   get a live quote, execute approvals + the bridge tx, then poll fill status.

## Setup

1. Get an API key + Integrator ID: https://docs.across.to (dashboard link in "Get your API key")
2. `cp .env.example .env` and fill in `ACROSS_API_KEY` and `ACROSS_INTEGRATOR_ID`
3. `npm install`
4. `npm start`
5. Open `http://localhost:8787`

## Notes

- Uses `tradeType: minOutput` per Across's recommended default.
- Chain/token lists are always fetched live — never hardcode addresses, the API is the source of truth.
- Deposit status is polled via `/deposit/status`; swap in a websocket/toast system if you want push updates.
- To go live on a chain, wait until it appears in `/swap/chains` — that's Across's own signal that liquidity,
  relayers, and adapters are confirmed live. This UI will just pick it up automatically at that point.
