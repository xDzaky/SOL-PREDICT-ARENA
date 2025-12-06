# 🚂 RAILWAY DEPLOYMENT GUIDE - BACKEND

## 📋 Prerequisites

1. ✅ Frontend deployed: https://sol-predict-arena.vercel.app/
2. ✅ PostgreSQL database ready (Supabase or Railway PostgreSQL)
3. ✅ Backend code ready in `/backend` directory

---

## 🚀 DEPLOY BACKEND TO RAILWAY

### Step 1: Create Railway Account

1. Go to: https://railway.app/
2. Sign in with GitHub
3. Authorize Railway to access your repository

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `xDzaky/SOL-PREDICT-ARENA`
4. Railway will auto-detect the repository

---

### Step 3: Configure Service

1. **Service Name:** `sol-predict-arena-backend`
2. **Root Directory:** `backend`
3. **Build Command:** (Auto-detected from package.json)
   ```
   pnpm install && pnpm run build
   ```
4. **Start Command:**
   ```
   node dist/index.js
   ```

---

### Step 4: Add PostgreSQL Database

**Option A: Use Railway PostgreSQL (Recommended)**

1. In your project, click **"New Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create database and provide `DATABASE_URL`

**Option B: Use Supabase**

1. Go to https://supabase.com/
2. Create new project
3. Get connection string from: Settings → Database → Connection string
4. Use the connection pooling URL (port 6543)

---

### Step 5: Set Environment Variables

Click **"Variables"** tab and add:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://sol-predict-arena.vercel.app

# Database - Railway PostgreSQL (auto-provided)
# DATABASE_URL=${{Postgres.DATABASE_URL}}

# Or if using Supabase:
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Pyth Network Configuration
PYTH_HERMES_URL=https://hermes.pyth.network
PYTH_SOL_PRICE_FEED_ID=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d

# Program Configuration
PROGRAM_ID=4C2pbJcS8VnBQpENExend24VuWuLfv5BehvMFLVUrrqZ

# JWT Authentication (generate a secure secret)
JWT_SECRET=<GENERATE_SECURE_SECRET_HERE>
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### Step 6: Run Database Migration

Once environment variables are set:

1. In Railway dashboard, go to **"Settings"** → **"Service"**
2. Add **"Build Command"**:
   ```bash
   pnpm install && npx prisma migrate deploy && pnpm run build
   ```

Or run manually via Railway CLI:
```bash
railway login
railway link
railway run npx prisma migrate deploy
```

---

### Step 7: Deploy

1. Railway will auto-deploy when you push to GitHub
2. Or click **"Deploy"** button in dashboard
3. Wait for build to complete (~3-5 minutes)

---

### Step 8: Get Backend URL

1. After deployment, click on your service
2. Go to **"Settings"** → **"Domains"**
3. Click **"Generate Domain"**
4. Railway will provide URL like: `https://sol-predict-arena-backend-production.up.railway.app`

---

### Step 9: Update Frontend Environment Variable

1. Go to Vercel dashboard: https://vercel.com/
2. Go to your project → **"Settings"** → **"Environment Variables"**
3. Update `VITE_BACKEND_URL`:
   ```
   VITE_BACKEND_URL=https://your-backend-url.up.railway.app
   ```
4. Redeploy frontend (Vercel → Deployments → Redeploy)

---

## 📁 Backend File Structure

Ensure these files exist:

```
backend/
├── package.json          ✅ (with build script)
├── tsconfig.json         ✅
├── prisma/
│   ├── schema.prisma     ✅
│   └── migrations/       ✅
└── src/
    └── index.ts          ✅
```

---

## 🔍 Verify Deployment

### Check Health Endpoint

```bash
curl https://your-backend-url.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-06T12:00:00.000Z"}
```

### Check Logs

1. In Railway dashboard, click **"View Logs"**
2. Should see:
   ```
   ✅ Server running on port 3001
   ✅ Database connected
   ✅ Socket.io initialized
   ```

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- Root directory is set to `backend`
- All dependencies in package.json
- TypeScript compiles locally: `pnpm run build`

**Fix:**
```bash
cd backend
pnpm install
pnpm run build
# Should complete without errors
```

### Database Connection Error

**Check:**
- DATABASE_URL is set correctly
- Prisma migrations deployed
- Database is accessible

**Fix:**
```bash
railway run npx prisma migrate deploy
railway run npx prisma db push
```

### CORS Error

**Check backend/src/index.ts:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**Update FRONTEND_URL:**
```bash
FRONTEND_URL=https://sol-predict-arena.vercel.app
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Database connected and migrated
- [ ] Health endpoint returns 200 OK
- [ ] WebSocket connection works
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Logs show no errors

---

## 🎯 Quick Deploy Commands

```bash
# Login to Railway
railway login

# Link to project
railway link

# Deploy manually
railway up

# View logs
railway logs

# Run database migration
railway run npx prisma migrate deploy

# Check status
railway status
```

---

## 📊 Expected Build Output

```
✅ Cloning repository
✅ Installing dependencies (pnpm install)
✅ Running Prisma migrations
✅ Building TypeScript (tsc)
✅ Starting server (node dist/index.js)
✅ Server listening on port 3001
✅ Deployment successful
```

---

## 🔗 Final URLs

**Frontend:** https://sol-predict-arena.vercel.app/  
**Backend:** https://your-backend-url.up.railway.app  

---

**Ready to deploy! 🚀**
