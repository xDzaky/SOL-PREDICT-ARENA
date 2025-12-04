# SOL Predict Arena - Monorepo

This monorepo contains three main parts:

- `programs/sol_predict_arena` - Anchor smart contract
- `frontend/` - Vite + React + TypeScript frontend
- `backend/` - Express + Socket.io backend

## Quick start

1. Install dependencies (you need Node.js, Rust, Solana CLI, Anchor):

```bash
# Root (recommended to use pnpm)
pnpm install

# Anchor
cd programs/sol_predict_arena
pnpm install

# Frontend
cd ../frontend
pnpm install

# Backend
cd ../backend
pnpm install
```

2. Start backend

```bash
cd backend
pnpm dev
```

3. Start frontend

```bash
cd frontend
pnpm dev
```

4. Build and test Anchor (ensure Solana CLI configured)

```bash
cd programs/sol_predict_arena
pnpm build
pnpm test
```

## Structure
See `tech-specv2.md` for full technical spec.
