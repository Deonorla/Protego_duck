# 🦆 Protego Duck — Threat Server (DuckChain + ChainGPT)

A Next.js frontend + threat-server integration for Protego.ai, refactored to run on DuckChain 🦆 and powered by ChainGPT / ElizaOS threat detection. This repo provides the UI routes and local API proxies that call the Duck MCP-like threat engine (the Duck MCP Engine / ChainGPT threat server).

## 🚀 Quick Start (dev)

```bash
# 1. Install deps
npm install

# 2. Create .env.local (see env section below)

# 3. Run dev server
npm run dev
# open http://localhost:3000
```

The Next.js app exposes API routes that proxy to your DuckChain/ChainGPT threat engine (local or remote).

## 🧩 What changed (Duckified)

- `SEI_MCP_*` → `DUCK_MCP_*` (env vars / route paths)
- MCP validation references → ChainGPT validations
- GOAT executor → DuckExec
- Branding + logging updated to DuckChain + duck emojis 🦆

If you previously had routes under `/api/sei-mcp/*`, rename to `/api/duck-mcp/*` (or keep an alias route that forwards).

## ⚙️ Environment Variables

Create `./.env.local` with:

```bash
# Duck MCP server (ChainGPT threat server / Duck MCP Engine)
DUCK_MCP_SERVER_URL=http://localhost:4001
DUCK_MCP_API_KEY=your_duck_mcp_api_key_here

# Optional: DuckChain RPC & explorer
DUCKCHAIN_RPC_URL=https://rpc.duckchain.io
DUCKCHAIN_EXPLORER=https://explorer.duckchain.io

# App
NEXT_PUBLIC_APP_NAME=Protego Duck
```

Your Next.js API routes will use `process.env.DUCK_MCP_SERVER_URL` and `process.env.DUCK_MCP_API_KEY`.

## 🔌 Frontend API Routes (default)

Place/rename these under `src/app/api/duck-mcp/`:

- **POST** `/api/duck-mcp/analyze-contract`  
  → forwards `{ contractAddress }` to `POST ${DUCK_MCP_SERVER_URL}/api/analyze-contract` (ChainGPT analysis)

- **GET** `/api/duck-mcp/social-alerts`  
  → forwards to `GET ${DUCK_MCP_SERVER_URL}/api/social-alerts` (DuckAlerts feed)

- **POST** `/api/duck-mcp/social-monitor`  
  → forwards `{ platforms, keywords, groupIds }` to `POST ${DUCK_MCP_SERVER_URL}/api/social-monitor` (start watchers)

- **GET** `/api/duck-mcp/threats`  
  → forwards to `GET ${DUCK_MCP_SERVER_URL}/api/threats` (aggregated threats)

These proxies add `Authorization: Bearer ${DUCK_MCP_API_KEY}` by default.

## 🧪 Local testing (curl)

Assuming frontend runs on port 3000:

```bash
# Analyze contract
curl -X POST http://localhost:3000/api/duck-mcp/analyze-contract \
  -H "Content-Type: application/json" \
  -d '{"contractAddress":"0x123..."}'

# Social alerts
curl http://localhost:3000/api/duck-mcp/social-alerts

# Start social monitor
curl -X POST http://localhost:3000/api/duck-mcp/social-monitor \
  -H "Content-Type: application/json" \
  -d '{"platforms":["telegram"],"keywords":["duck","rugpull"]}'

# Get threats
curl http://localhost:3000/api/duck-mcp/threats
```

If you don't have a live Duck MCP/ChainGPT backend yet, mock the downstream responses in the Next.js route handlers for quick UI testing.

## 🛠️ Integrating with the Duck MCP / ChainGPT Server

Your DuckChain threat engine should expose the endpoints matched above. Recommended response shapes:

### Analyze contract

```json
{
  "contract": "0xabc...",
  "riskScore": 78,
  "findings": ["unverified-source", "high-liquidity-concentration"],
  "recommendation": "REVIEW"
}
```

### Social alerts

```json
[
  {
    "id": "a1",
    "type": "rumor",
    "message": "token-XYZ pump detected",
    "timestamp": "2025-08-31T..."
  }
]
```

### Threats

```json
[
  {
    "id": "t1",
    "category": "flash_loan",
    "protocol": "DuckSwap",
    "riskLevel": "high"
  }
]
```

Make sure to add Authorization checks on the Duck MCP server using `DUCK_MCP_API_KEY`.

## 📦 Deployment

- Deploy the Next.js app to Vercel, Netlify, or your preferred host.
- Deploy the ChainGPT / Duck MCP server on an EC2 / EKS / Fargate instance or local machine for the hackathon.
- Use secure secrets for `DUCK_MCP_API_KEY` in production.

## 🔐 Security & Token Gating (hackathon tips)

- Gate premium analysis endpoints behind `$DUCK` staking or DAT ownership (DuckChain token gating).
- Log ChainGPT decisions on-chain for provenance (small events that point to archived details).
- Rate-limit unauthenticated analyses and require `DUCK_MCP_API_KEY` for automation.

## 💡 Where to go next

- Add token-gated routes: only return full `analysis.findings` if caller owns a DAT or has staked `$DUCK`.
- Hook ChainGPT outputs to ElizaOS agents for suggested defensive actions (alert users, suggest rebalances).
- Mint threat datasets as DAT NFTs so contributors earn `$DUCK` for high-quality signals.

## 🐣 Community & Resources

- **DuckChain docs**: https://duckchain.io
- **ChainGPT docs**: https://chaingpt.org
- **ElizaOS**: https://elizaos.ai

## 🤝 Contributing

PRs, bug reports, and duck-themed memes welcome 🦆. Please open issues/PRs on the repo and tag `hackathon` for any changes intended for the DuckChain submission.