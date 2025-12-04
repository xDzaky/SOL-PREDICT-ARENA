# 🎮 SOL Predict Arena

> **Real-time PvP prediction battles on Solana** - Compete, predict, win on-chain glory!

[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.30.1-blue)](https://anchor-lang.com)
[![React](https://img.shields.io/badge/React-18.3-cyan)](https://react.dev)

## 📁 Project Structure

This monorepo contains three main components:

```
sol-predict-arena/
├── programs/sol_predict_arena/  # 🦀 Anchor smart contract (Rust)
├── frontend/                     # ⚛️  Vite + React + TypeScript
├── backend/                      # 🚀 Express + Socket.io + Prisma
├── deploy.sh                     # 🔧 Automated deployment script
└── start.sh                      # 🎬 Development server launcher
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- ✅ **Rust 1.79.0** (required for Anchor)
- ✅ **Solana CLI 1.18.22+**
- ✅ **Anchor CLI 0.30.1**
- ✅ **Node.js 20+**
- ✅ **pnpm** (package manager)

> 📚 **Need to install these?** See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

---

## 🎯 One-Command Deployment

### 1️⃣ Deploy Smart Contract to Devnet

```bash
./deploy.sh
```

This automated script will:
- ✅ Build the Anchor program
- ✅ Extract the Program ID
- ✅ Update all config files automatically
- ✅ Deploy to Solana devnet
- ✅ Show deployment summary

**Expected output:**
```
🎉 DEPLOYMENT COMPLETE!
==========================================
Program ID: <YOUR_PROGRAM_ID>
Cluster:    devnet
Wallet:     <YOUR_WALLET_ADDRESS>
```

---

### 2️⃣ Start Development Servers

```bash
./start.sh
```

This will start:
- 🎨 **Frontend** on `http://localhost:5173`
- 🔌 **Backend** on `http://localhost:3000`

Press `Ctrl+C` to stop all servers.

---

## 🛠️ Manual Setup (Advanced)

### Step 1: Build Anchor Program

```bash
anchor build
```

### Step 2: Get Program ID

```bash
solana address -k target/deploy/sol_predict_arena-keypair.json
```

### Step 3: Update Configuration

Update Program ID in:
- `Anchor.toml` → `[programs.devnet]`
- `programs/sol_predict_arena/src/lib.rs` → `declare_id!(...)`
- `backend/.env` → `PROGRAM_ID=...`

### Step 4: Deploy

```bash
anchor build  # Rebuild with new Program ID
anchor deploy --provider.cluster devnet
```

### Step 5: Install Dependencies

```bash
# Frontend
cd frontend && pnpm install

# Backend
cd backend && pnpm install
```

### Step 6: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

---

## Structure
See `tech-specv2.md` for full technical spec.
