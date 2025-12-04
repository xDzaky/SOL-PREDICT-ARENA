# 🔑 Environment Variables Setup Guide

This guide shows you how to obtain all the API keys and URLs needed for SOL Predict Arena.

---

## 1. FRONTEND_URL
**Current Value:** `http://localhost:5173`

**What it is:** Your frontend application URL.

**How to get:**
- ✅ **Local Development:** Use `http://localhost:5173` (Vite default port)
- ✅ **Production:** After deploying to Vercel, use your deployment URL
  - Example: `https://sol-predict-arena.vercel.app`

**No setup needed for local dev!**

---

## 2. DATABASE_URL
**Current Value:** `postgresql://user:pass@localhost:5432/solpredict`

**What it is:** PostgreSQL database connection string.

### Option A: Local PostgreSQL (Free)

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from: https://www.postgresql.org/download/windows/
   ```

2. **Create database:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE solpredict;
   CREATE USER solana WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE solpredict TO solana;
   \q
   ```

3. **Your DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://solana:yourpassword@localhost:5432/solpredict
   ```

### Option B: Supabase (Free tier - RECOMMENDED)

1. **Sign up:** https://supabase.com/
2. **Create new project:**
   - Click "New Project"
   - Choose organization
   - Enter project name: "sol-predict-arena"
   - Generate database password (save it!)
   - Choose region (closest to you)
   - Click "Create new project"

3. **Get connection string:**
   - Go to Project Settings → Database
   - Under "Connection string" section
   - Copy "URI" (not "Connection pooling")
   - Example: `postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

4. **Update .env:**
   ```
   DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

**Free tier limits:** 500MB database, unlimited API requests

### Option C: Railway (Free tier)

1. **Sign up:** https://railway.app/
2. **New Project → Add PostgreSQL**
3. **Copy "DATABASE_URL" from Variables tab**

---

## 3. REDIS_URL (Optional - for production)
**Current Value:** `redis://localhost:6379`

**What it is:** Redis cache for session management and matchmaking queue.

**Note:** Redis is OPTIONAL for MVP. You can skip this initially!

### Option A: Local Redis (Free)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

**Your REDIS_URL:** `redis://localhost:6379`

### Option B: Upstash Redis (Free tier - RECOMMENDED)

1. **Sign up:** https://upstash.com/
2. **Create database:**
   - Click "Create Database"
   - Name: "sol-predict-arena"
   - Type: Regional
   - Region: Choose closest to you
   - Click "Create"

3. **Get connection URL:**
   - Go to your database
   - Copy "REDIS_URL" (starts with `rediss://`)
   - Example: `rediss://default:[password]@us1-moral-crane-12345.upstash.io:6379`

4. **Update .env:**
   ```
   REDIS_URL=rediss://default:[password]@[your-instance].upstash.io:6379
   ```

**Free tier limits:** 10,000 commands/day

---

## 4. SOLANA_RPC_URL
**Current Value:** `https://api.devnet.solana.com`

**What it is:** Solana RPC endpoint for blockchain interactions.

### For Development (Devnet)

**Option A: Public RPC (Free but rate-limited)**
```
SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Limits:** ~100 requests/second, may be slow

### For Production or Better Performance

**Option B: Helius (RECOMMENDED - Free tier available)**

1. **Sign up:** https://www.helius.dev/
2. **Create API Key:**
   - Go to Dashboard
   - Click "Create new API key"
   - Name: "SOL Predict Arena"
   - Click "Create"

3. **Get your RPC URL:**
   - Devnet: `https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY`
   - Mainnet: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`

4. **Update .env:**
   ```
   SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
   ```

**Free tier limits:** 100,000 requests/day (plenty for development!)

**Option C: QuickNode (Free tier)**

1. **Sign up:** https://www.quicknode.com/
2. **Create endpoint:**
   - Select "Solana"
   - Select network: "Devnet" or "Mainnet"
   - Free plan: 25 req/sec
3. **Copy HTTP Provider URL**
4. **Update .env:**
   ```
   SOLANA_RPC_URL=https://[your-endpoint].solana-devnet.quiknode.pro/[token]/
   ```

**Option D: Alchemy (Free tier)**

1. **Sign up:** https://www.alchemy.com/
2. **Create app:**
   - Chain: Solana
   - Network: Devnet
3. **Copy HTTP URL**

---

## 5. PROGRAM_ID
**Current Value:** `YourProgramID` (placeholder)

**What it is:** Your deployed Solana program's public key.

**How to get:**

1. **Build your Anchor program first:**
   ```bash
   cd programs/sol_predict_arena
   anchor build
   ```

2. **Get the Program ID:**
   ```bash
   solana address -k target/deploy/sol_predict_arena-keypair.json
   ```

3. **Copy the output (44-character base58 string):**
   ```
   Example: 7xPnKXN8K8tP9vC2mQ1wR5sL4fY3dH6nJ9bV8cX2kM1p
   ```

4. **Update these files:**
   
   **File 1: `Anchor.toml`**
   ```toml
   [programs.devnet]
   sol_predict_arena = "7xPnKXN8K8tP9vC2mQ1wR5sL4fY3dH6nJ9bV8cX2kM1p"
   ```
   
   **File 2: `programs/sol_predict_arena/src/lib.rs`**
   ```rust
   declare_id!("7xPnKXN8K8tP9vC2mQ1wR5sL4fY3dH6nJ9bV8cX2kM1p");
   ```
   
   **File 3: `backend/.env`**
   ```
   PROGRAM_ID=7xPnKXN8K8tP9vC2mQ1wR5sL4fY3dH6nJ9bV8cX2kM1p
   ```

5. **Rebuild and deploy:**
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```

**Note:** Program ID changes if you redeploy to a new keypair!

---

## 6. PROGRAM_KEYPAIR_PATH
**Current Value:** `./keypair.json`

**What it is:** Path to your program's keypair file (for signing transactions).

**How to set:**

1. **After deploying, the keypair is at:**
   ```
   programs/sol_predict_arena/target/deploy/sol_predict_arena-keypair.json
   ```

2. **Option A: Copy to backend folder (RECOMMENDED):**
   ```bash
   cp programs/sol_predict_arena/target/deploy/sol_predict_arena-keypair.json backend/keypair.json
   ```
   
   **Update .env:**
   ```
   PROGRAM_KEYPAIR_PATH=./keypair.json
   ```

3. **Option B: Use absolute path:**
   ```
   PROGRAM_KEYPAIR_PATH=/home/dzaky/Desktop/Hackathon/indie-fun/sol-predict-arena/programs/sol_predict_arena/target/deploy/sol_predict_arena-keypair.json
   ```

**⚠️ SECURITY WARNING:**
- **NEVER commit keypair.json to Git!**
- Add to `.gitignore`:
  ```bash
  echo "keypair.json" >> backend/.gitignore
  echo "*.json" >> backend/.gitignore
  ```

---

## 7. JWT_SECRET
**Current Value:** `your-secret-key` (placeholder)

**What it is:** Secret key for signing JWT tokens (authentication).

**How to generate:**

### Option A: Using Node.js (RECOMMENDED)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output example:**
```
a3f7c9d2e1b4f8a6c5e9d3b7f1a8c4e2d6f9b3a7e5c1d8f4a2b6e9c3d7f1a5
```

### Option B: Using OpenSSL
```bash
openssl rand -hex 32
```

### Option C: Online Generator
Visit: https://www.random.org/strings/
- Generate 64 characters
- Character set: Hex
- Click "Get Strings"

**Update .env:**
```
JWT_SECRET=a3f7c9d2e1b4f8a6c5e9d3b7f1a8c4e2d6f9b3a7e5c1d8f4a2b6e9c3d7f1a5
```

**⚠️ SECURITY:**
- Use different secrets for dev and production
- NEVER commit to Git
- Change if compromised

---

## 📋 Complete .env Example (Ready to Use)

Create `backend/.env` file:

```bash
# Frontend
FRONTEND_URL=http://localhost:5173

# Database (Supabase example)
DATABASE_URL=postgresql://postgres.abcdefgh:MyPassword123@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Redis (Optional - skip for MVP)
# REDIS_URL=rediss://default:password@us1-moral-crane-12345.upstash.io:6379

# Solana (Helius example)
SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=abc123-def456-ghi789

# Program (After deployment)
PROGRAM_ID=7xPnKXN8K8tP9vC2mQ1wR5sL4fY3dH6nJ9bV8cX2kM1p
PROGRAM_KEYPAIR_PATH=./keypair.json

# JWT (Generated)
JWT_SECRET=a3f7c9d2e1b4f8a6c5e9d3b7f1a8c4e2d6f9b3a7e5c1d8f4a2b6e9c3d7f1a5

# Optional
PORT=3000
NODE_ENV=development
```

---

## 🚀 Quick Setup Checklist

### Minimum Required (MVP):
- [x] **FRONTEND_URL** - Use default `http://localhost:5173`
- [x] **DATABASE_URL** - Sign up for Supabase (free)
- [ ] **SOLANA_RPC_URL** - Sign up for Helius (free)
- [ ] **PROGRAM_ID** - Deploy Anchor program first
- [ ] **PROGRAM_KEYPAIR_PATH** - Copy after deployment
- [x] **JWT_SECRET** - Generate random string

### Optional (Can skip initially):
- [ ] REDIS_URL - Only needed for production scale
- [ ] PORT - Use default 3000
- [ ] NODE_ENV - Defaults to development

---

## 🎯 Recommended Services (All Free Tiers)

| Service | Purpose | Free Tier | Link |
|---------|---------|-----------|------|
| **Supabase** | PostgreSQL Database | 500MB, unlimited API | https://supabase.com |
| **Helius** | Solana RPC | 100k req/day | https://helius.dev |
| **Upstash** | Redis Cache (optional) | 10k commands/day | https://upstash.com |
| **Vercel** | Frontend Hosting | Unlimited | https://vercel.com |
| **Railway** | Backend Hosting | $5 free credit/month | https://railway.app |

---

## 🆘 Troubleshooting

### "Connection refused" errors
- Check if PostgreSQL/Redis is running locally
- Verify connection strings are correct
- Test connection: `psql $DATABASE_URL`

### "Invalid API key" errors
- Double-check API key copied correctly (no spaces)
- Ensure API key is activated in dashboard
- Try regenerating the key

### "Program not found" errors
- Make sure you've deployed the program: `anchor deploy`
- Verify PROGRAM_ID matches deployed program
- Check you're on correct network (devnet vs mainnet)

---

## 📚 Additional Resources

- **Solana Docs:** https://docs.solana.com
- **Anchor Book:** https://book.anchor-lang.com
- **Helius API Docs:** https://docs.helius.dev
- **Supabase Docs:** https://supabase.com/docs

---

**Need help?** Check the Discord communities:
- Solana: https://discord.gg/solana
- Anchor: https://discord.gg/PDeRXyVURd
- Solciety: https://discord.gg/MPGxwf879s

**Good luck building! 🚀**
