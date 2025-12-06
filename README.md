# 🎯 SOL Predict Arena

> A real-time decentralized prediction game built on Solana where players compete to predict SOL price movements and earn rewards.

![Solana](https://img.shields.io/badge/Solana-Devnet-purple?logo=solana)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![Anchor](https://img.shields.io/badge/Anchor-0.29-orange)

## ✨ Features

### 🎮 Core Gameplay
- **Real-time Price Predictions** - Predict SOL price movements using live Pyth Network data
- **1v1 Arena Battles** - Compete head-to-head with other players in timed prediction duels
- **Skill-based Matchmaking** - Fair matchmaking based on player rating and win rate

### 🏆 Progression System
- **On-chain Player Profiles** - Permanent stats stored on Solana blockchain
- **Seasonal Leaderboards** - Compete for top ranks each season
- **NFT Badge System** - Earn unique achievement badges as NFTs
- **XP & Leveling** - Progress through ranks with experience points

### 🔐 Web3 Integration
- **Multi-wallet Support** - Phantom, Solflare, and Backpack wallet adapters
- **Smart Contract Backend** - Fully decentralized game logic on Solana
- **Real-time Oracle Data** - Pyth Network integration for accurate SOL/USD prices

## 🛠️ Tech Stack

### Frontend
- React 18.3 + TypeScript 5.4 + Vite 5.2
- @solana/wallet-adapter-react - Wallet connection
- @coral-xyz/anchor - Solana program interaction
- TanStack Query + Zustand - State management
- Socket.io Client - Real-time multiplayer

### Backend
- Node.js 20 + Express.js 4.18 + TypeScript
- Socket.io - WebSocket server
- Prisma ORM + PostgreSQL
- express-rate-limit - API protection

### Smart Contract
- Anchor 0.29 - Solana program framework
- Deployed on Devnet - Program ID: 4C2pbJcS8VnBQpENExend24VuWuLfv5BehvMFLVUrrqZ

## 🚀 Quick Start

### Prerequisites
- node >= 20.0.0
- pnpm >= 8.0.0
- Solana CLI >= 1.18.0

### Installation

1. Clone the repository
```bash
git clone https://github.com/xDzaky/SOL-PREDICT-ARENA.git
cd SOL-PREDICT-ARENA
```

2. Install dependencies
```bash
cd frontend && pnpm install
cd ../backend && pnpm install
```

3. Setup environment variables (see .env.example in each folder)

4. Run database migration
```bash
cd backend
npx prisma migrate deploy
```

5. Start development servers
```bash
# Terminal 1 - Backend
cd backend && pnpm run dev

# Terminal 2 - Frontend
cd frontend && pnpm run dev
```

Visit http://localhost:5173 🎉

## 📦 Project Structure

```
sol-predict-arena/
├── frontend/          # React frontend
├── backend/           # Express backend
├── programs/          # Solana smart contracts
└── .github/           # GitHub workflows
```

## 🎮 How to Play

1. Connect Wallet (Phantom/Solflare/Backpack)
2. Initialize your on-chain player profile
3. Join the matchmaking queue
4. Make predictions (UP or DOWN) on SOL price
5. Win to earn XP and climb the leaderboard

## 📝 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Detailed setup guide
- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Production deployment
- [SMART_CONTRACT_DEPLOYED.md](./SMART_CONTRACT_DEPLOYED.md) - Smart contract docs

## 🚢 Deployment

- Frontend: Vercel
- Backend: Railway
- Smart Contract: Solana Devnet

See [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) for deployment guide.

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Solana](https://solana.com) - High-performance blockchain
- [Anchor](https://anchor-lang.com) - Solana framework
- [Pyth Network](https://pyth.network) - Price oracle
- [Phantom Wallet](https://phantom.app) - Solana wallet

---

**Built with ❤️ on Solana**
