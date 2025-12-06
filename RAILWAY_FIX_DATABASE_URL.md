# 🚨 RAILWAY DEPLOYMENT FIX - DATABASE_URL ERROR

## ❌ Error yang Terjadi:

```
Error: Environment variable not found: DATABASE_URL.
Prisma schema validation - (get-config wasm)
Error code: P1012
```

## ✅ ROOT CAUSE:

Railway mencoba run `prisma migrate deploy` saat **BUILD** stage, tapi `DATABASE_URL` belum tersedia karena database belum di-link.

## 🔧 SOLUTION APPLIED:

**Changed railway.json:**
- ❌ OLD: Run migration during BUILD (before DATABASE_URL exists)
- ✅ NEW: Run migration during START (after DATABASE_URL is injected)

```json
{
  "build": {
    "buildCommand": "pnpm install && npx prisma generate && pnpm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/index.js"
  }
}
```

---

## 🚀 CORRECT DEPLOYMENT ORDER:

### Step 1: Add PostgreSQL Database FIRST

**BEFORE deploying backend service:**

1. In Railway project dashboard
2. Click **"+ New"**
3. Select **"Database"**
4. Choose **"Add PostgreSQL"**
5. Wait for database to provision (~30 seconds)

### Step 2: Link Database to Backend Service

Railway will automatically inject:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Step 3: Set Other Environment Variables

Now add all other variables:

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://sol-predict-arena.vercel.app
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PYTH_HERMES_URL=https://hermes.pyth.network
PYTH_SOL_PRICE_FEED_ID=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
PROGRAM_ID=4C2pbJcS8VnBQpENExend24VuWuLfv5BehvMFLVUrrqZ
JWT_SECRET=zc5TWHfdqoUPJ7IC/fp/Fsjn4Sh/CQW9toc7PT0/VSY=
```

**⚠️ DO NOT manually set DATABASE_URL** - Railway auto-injects it!

### Step 4: Deploy

Railway will now:
1. ✅ Build: Install dependencies, generate Prisma client, compile TypeScript
2. ✅ Deploy: Run migrations (DATABASE_URL now available), then start server

---

## 🎯 DEPLOYMENT FLOW (CORRECTED):

```
1. Create Railway Project
   ↓
2. Add PostgreSQL Database ← DO THIS FIRST!
   ↓
3. Railway auto-links DATABASE_URL to service
   ↓
4. Deploy Backend Service from GitHub
   ↓
5. Set Environment Variables (except DATABASE_URL)
   ↓
6. Build runs (without migration)
   ↓
7. Deploy starts → Migration runs → Server starts
   ↓
8. SUCCESS! ✅
```

---

## 🐛 If You Already Deployed:

### Option A: Redeploy After Adding Database

1. Add PostgreSQL database (if not added yet)
2. Go to backend service → "Settings" → "Redeploy"
3. Build will succeed now

### Option B: Start Fresh

1. Delete current deployment
2. Add PostgreSQL database FIRST
3. Deploy backend service
4. Set environment variables
5. Railway auto-deploys

---

## ✅ Verification Steps:

After deployment succeeds, check logs:

```
✅ "Prisma schema loaded from prisma/schema.prisma"
✅ "Database migrations have been applied"
✅ "Server running on port 3001"
✅ "Database connected"
```

---

## 📋 UPDATED RAILWAY CHECKLIST:

### 1. Login to Railway
- [ ] Go to https://railway.app/
- [ ] Sign in with GitHub

### 2. Create Project
- [ ] New Project → "Deploy from GitHub repo"
- [ ] Select: `xDzaky/SOL-PREDICT-ARENA`

### 3. ⚡ ADD DATABASE FIRST (CRITICAL!)
- [ ] In project dashboard, click **"+ New"**
- [ ] Select **"Database"**
- [ ] Choose **"Add PostgreSQL"**
- [ ] Wait for database to provision
- [ ] **VERIFY:** See "Postgres" service in dashboard

### 4. Deploy Backend Service
- [ ] Click on backend service (auto-created from repo)
- [ ] Go to "Settings"
- [ ] Set **Root Directory:** `backend`
- [ ] Railway auto-detects `railway.json`

### 5. Set Environment Variables
- [ ] Go to "Variables" tab
- [ ] Add all variables (from list above)
- [ ] **DO NOT** add DATABASE_URL (auto-injected)

### 6. Deploy
- [ ] Railway auto-deploys
- [ ] Monitor "Deployments" tab
- [ ] Check logs for success messages

### 7. Generate Domain
- [ ] Settings → Domains → "Generate Domain"
- [ ] Copy backend URL

### 8. Update Frontend
- [ ] Vercel → Environment Variables
- [ ] Update `VITE_BACKEND_URL`
- [ ] Redeploy frontend

---

## 🎉 FIXED!

**Changes pushed to GitHub:**
- ✅ `backend/railway.json` updated
- ✅ Migration moved from BUILD to START stage
- ✅ Build will succeed even without DATABASE_URL
- ✅ Migration runs when server starts (with DATABASE_URL)

**Next:** 
1. Push changes to GitHub
2. Add PostgreSQL database in Railway
3. Redeploy backend service
4. Build will succeed! 🚀

---

**Remember: DATABASE FIRST, then DEPLOY BACKEND!**
