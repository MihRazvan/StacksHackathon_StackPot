# StackPot

![stackpot-banner](https://pulsarmoney.b-cdn.net/stacks/Screenshot%202025-10-16%20at%2000.04.15.png)

**StackPot** is a no-loss Bitcoin lottery on Stacks where users deposit STX, earn Bitcoin yields through staking, and compete for weekly prize pools—all while maintaining 100% principal safety.

[Demo Video](#) | [Prototype App]([#](https://stacks-hackathon-stack-pot-wv5o.vercel.app/)) | [Validation Document](./stackpot_validation.md)
---

## The Problem We Are Solving

Areas of improvement for the Stacks ecosystem:

1. **Lack of Engagement Narratives** – Stacks has lending, DEXs, and stablecoins, but lacks the "mini dApps" that drive ecosystem adoption (like Solana's pump.fun or Base's AI agents).
2. **Boring Yield Experience** – 70% of STX (~350M tokens, $525M) sits idle because traditional stacking is complex and unexciting.
3. **Missed Bitcoin Yields** – Users are leaving $42-63M/year in foregone Bitcoin rewards on the table due to friction and boredom.
4. **No Gamified DeFi** – Every successful chain has narrative-driven applications. Stacks needs its moment.

These challenges prevent Stacks from onboarding the next wave of DeFi users who crave excitement and simplicity.

---

## How We Solve It

StackPot transforms boring staking into an exciting, social experience with Bitcoin prizes:

1. **One-Click Deposits** – Deposit any amount of STX (no minimums) through our simple interface.
2. **Automatic Bitcoin Yields** – Funds are routed through StackingDAO to generate real Bitcoin yields via Proof of Transfer.
3. **Weekly Lottery Draws** – Bitcoin block hash randomness selects winners for accumulated prize pools.
4. **100% Principal Safety** – Withdraw your full deposit anytime—this is truly no-loss.
5. **Provably Fair** – No oracles, no manipulation—just Bitcoin's own hash power ensuring fairness.

![user-flow](https://pulsarmoney.b-cdn.net/stacks/Screenshot%202025-10-16%20at%2016.08.55.png)

---

## Why Now?

- **PoolTogether proves the model** – $300M TVL and 50K+ users validate prize-linked savings.
- **Bitcoin yields are aspirational** – Users want BTC, not stablecoins (cultural significance).
- **Nakamoto upgrade + sBTC** – Stacks ecosystem momentum is at an all-time high.
- **Gamification drives retention** – DeFi protocols with gamification see 3-5x higher engagement.

Now is the perfect moment to build the gateway application that onboards users to Stacks.

---

## Existing Solutions vs. StackPot

While PoolTogether pioneered no-loss lotteries, StackPot brings critical improvements:

| Feature                     | PoolTogether | Traditional Stacking | StackPot |
|-----------------------------|--------------|---------------------|----------|
| Bitcoin Prizes              | ❌ No (stablecoins) | ✅ Yes | ✅ Yes |
| Free Randomness             | ❌ No (Chainlink VRF ~$5-10/draw) | N/A | ✅ Yes (Bitcoin blocks) |
| Zero Principal Risk         | ✅ Yes | ✅ Yes | ✅ Yes |
| No Minimum Deposit          | ✅ Yes | ❌ No (often 100+ STX) | ✅ Yes |
| One-Click Setup             | ✅ Yes | ❌ No (complex) | ✅ Yes |
| Weighted Tickets (Coming)   | ❌ No | N/A | ✅ Yes |
| Team Mode (Coming)          | ❌ No | N/A | ✅ Yes |

**StackPot's unique advantages:**
- **Bitcoin-native** – Prizes in BTC, secured by Bitcoin block randomness
- **Cost-efficient** – No oracle fees = bigger prizes for users
- **StackingDAO integration** – Battle-tested infrastructure for yields
- **Simplified model** – Learned from PoolTogether's complexity issues

---

## Future Plans

### 🚀 Coming Soon (Post-Launch)

**Weighted Tickets**
- Early depositors earn more tickets over time
- Prevents last-second ticket sniping
- Rewards loyal community members

**Team Mode**
- Pool tickets with friends to increase collective odds
- Social competition drives viral growth
- Every winner brings their entire crew to Stacks

---

## 🏗️ How It Works (Technical)

### Architecture Overview

![stackpot-banner](https://pulsarmoney.b-cdn.net/stacks/Screenshot%202025-10-16%20at%2014.39.05.png)

## Tech Stack

**Frontend:**
- Next.js (React)
- Tailwind CSS
- Stacks.js / @stacks/connect
- Real-time WebSocket updates

**Smart Contracts:**
- Clarity (Stacks native language)
- StackingDAO integration
- Bitcoin block hash randomness

**Backend & Monitoring:**
- Real-time yield tracking
- Prize pool calculations
- Draw automation
- Liquidation risk monitoring (future)

---

## 📝 Smart Contracts

### Testnet Deployment

**Deployer Address:** `ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA`

#### 1. Pool Manager V3
```
ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.pool-manager-v3
```
Handles STX deposits, withdrawals, and participant tracking.

🔗 [View on Testnet Explorer](https://explorer.hiro.so/txid/ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.pool-manager-v3?chain=testnet)

#### 2. Prize Distributor V3
```
ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.prize-distributor-v3
```
Manages weekly draws using Bitcoin block hash randomness and prize distribution.

🔗 [View on Testnet Explorer](https://explorer.hiro.so/txid/ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.prize-distributor-v3?chain=testnet)

#### 3. Stacking Adapter V3
```
ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.stacking-adapter-v3
```
Routes deposits through StackingDAO for Bitcoin yield generation.

🔗 [View on Testnet Explorer](https://explorer.hiro.so/txid/ST1C1HJWSY1H5HW0TB9WZ4SMBA8MZHVY6S8VXY3BA.stacking-adapter-v3?chain=testnet)

---

### Mainnet Deployment (Coming Q1 2025)

**Deployer Address:** `TBD`

#### 1. Pool Manager
```
[Mainnet address TBD]
```
🔗 [View on Mainnet Explorer](#)

#### 2. Prize Distributor
```
[Mainnet address TBD]
```
🔗 [View on Mainnet Explorer](#)

#### 3. Stacking Adapter
```
[Mainnet address TBD]
```
🔗 [View on Mainnet Explorer](#)

---

## 📊 Validation Results

### Key User Feedback:

> "I was a PoolTogether depositor since their 2nd drawing. About 1.5 years ago I withdrew everything because every new version added too much complexity... Would definitely try out your protocol!"  
> — u/minorthreatmikey (Reddit, PoolTogether veteran)

> "This would be awesome! I've been thinking about building a stackingDAO pool for a game."  
> — u/TerribleeT (Reddit, active Stacker)

> "If this works like PoolTogether but with BTC prizes, I'm 100% in."  
> — User @defi_degen (Discord)

**Full validation report:** [Read stackpot_validation.md](./stackpot_validation.md)

---

### Key Components:

**1. Pool Manager**
- Manages user deposits and withdrawals
- Tracks participant balances and shares
- Calculates ticket allocation (1 STX = 1 ticket)
- Instant withdrawal (1% fee) or traditional (14-day wait)

**2. Stacking Adapter**
- Integrates with StackingDAO for yield generation
- Converts STX → stSTX for automatic Bitcoin rewards
- Tracks accumulated yields from stacking
- Demo mode for hackathon presentations

**3. Prize Distributor**
- Uses Bitcoin block hash (`burn-block-height` + `get-block-info?`) for randomness
- Weighted selection based on deposit size
- Weekly draws (configurable)
- Prize claiming system

### Security Features:

✅ **Non-custodial** – Users maintain control via smart contracts  
✅ **Provably fair** – Bitcoin block hashes can't be manipulated  
✅ **No oracles** – Eliminates third-party risk and costs  
✅ **Clarity security** – Decidable language prevents reentrancy attacks  
✅ **Auditable** – All transactions on-chain and verifiable  

---

## 🚀 Getting Started

### For Users

1. **Connect Wallet** – Use Hiro Wallet or Leather Wallet
2. **Deposit STX** – Any amount, no minimums
3. **Earn Tickets** – 1 STX deposited = 1 lottery ticket
4. **Wait for Draw** – Weekly draws every ~1,008 blocks (~1 week)
5. **Win Bitcoin** – Check if you won, claim your prize
6. **Withdraw Anytime** – 100% of your principal, always

**Documentation:**
- [Deployment Guide](./stackpot/DEPLOYMENT_README.md)
- [Contract Documentation](./stackpot/contracts/)
- [Frontend Setup](./frontend/README.md)

---

## 🎯 Market Opportunity

### Total Addressable Market (TAM)
- **350M STX idle** (~$525M at current prices)
- **70% of STX not actively stacked**
- **$42-63M/year** in foregone Bitcoin yields

### Target Market (Year 1)
- **1% of idle STX** = $5.25M TVL
- **500-1,000 users** (avg $5K-10K deposit)
- **$500+ weekly prizes** driving viral growth

### Growth Strategy
1. **Phase 1 (Launch)** – Onboard 50 early adopters from validation
2. **Phase 2 (Month 1-3)** – Community growth through winner announcements
3. **Phase 3 (Month 3-6)** – Viral expansion via team mode
4. **Phase 4 (Month 6-12)** – Cross-protocol integrations and partnerships

**Competitive Moat:**
- First mover in gamified savings on Stacks
- Bitcoin-native randomness (unique technical advantage)
- Network effects (bigger prizes attract more users)
- StackingDAO integration creates switching costs

---

## 📹 Media & Resources

- **Demo Video:** [Watch on YouTube](#)
- **Slide Deck:** [View Presentation](#)
- **Validation Report:** [Read Full Document](./stackpot_validation.md)
- **Technical Docs:** [Deployment Guide](./stackpot/DEPLOYMENT_README.md)
- **Pitch Deck:** [View Slides](#)

---

## 🤝 Contributing

We welcome contributions from the community! See our [Contributing Guide](./CONTRIBUTING.md) for details.

**Areas we need help:**
- Frontend development (React/Next.js)
- Clarity smart contract optimization
- Security auditing
- Community management
- Documentation

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🌟 Bounties & Tracks

**Stacks Hackathon Tracks:**
- ✅ **General Track** – Real-world DeFi utility
- ✅ **StackingDAO Integration** – Leverages proven stacking infrastructure
- ✅ **Bitcoin Innovation** – Uses Bitcoin block hashes for randomness
- ✅ **User Adoption** – Gateway application for ecosystem onboarding

---

## 📧 Contact

- **Twitter:** [@StackPotxyz](#)
- **Discord:** [Join our community](#)
- **Email:** hello@stackpot.xyz
- **Website:** [stackpot.xyz](#)

---

**Built with ♥ during Stacks Hackathon 2025**

*"What are you doing with your STX? Definitely StackPotting it!"*
