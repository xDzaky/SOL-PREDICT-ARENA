# 🚀 DEPLOYMENT CHECKLIST - SOL PREDICT ARENA

## ✅ PRE-DEPLOYMENT COMPLETED

### Code Quality
- [x] All TypeScript errors fixed (21 errors → 0 errors)
- [x] Lint passing with 0 warnings
- [x] Build successful (910 kB bundle)
- [x] React Hooks rules compliance
- [x] No `any` types in critical code

### Configuration Files
- [x] `vercel.json` created at repo root
- [x] `tsconfig.app.json` updated (moduleResolution: bundler)
- [x] `.gitignore` protecting secrets
- [x] Database migration ready

---

## 📋 DEPLOYMENT STEPS

### STEP 1: Prepare Environment Variables

#### Frontend (Vercel) - Production
```bash
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=4C2pbJcS8VnBQpENExend24VuWuLfv5BehvMFLVUrrqZ
VITE_BACKEND_URL=<RAILWAY_URL_HERE>
VITE_PYTH_PROGRAM_ID=FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH
VITE_PYTH_SOL_USD_FEED=J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_ADMIN_WALLET=Gd5tZAwnTixjSgTTZ8o791qZjGa5qaG81dHhP2Yzr3eg
```

#### Backend (Railway) - Production
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=<VERCEL_URL_HERE>
DATABASE_URL=<SUPABASE_CONNECTION_STRING>
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PYTH_HERMES_URL=https://hermes.pyth.network
PYTH_SOL_PRICE_FEED_ID=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
PROGRAM_ID=4C2pbJcS8VnBQpENExend24VuWuLfv5BehvMFLVUrrqZ
JWT_SECRET=<GENERATE_SECURE_SECRET>
```

---

### STEP 2: Deploy Backend to Railway

```bash
# 1. Login to Railway
railway login

# 2. Initialize project
cd backend
railway init

# 3. Add PostgreSQL database
railway add

# 4. Set environment variables (via dashboard or CLI)
railway variables set NODE_ENV=production
railway variables set PORT=3001
# ... add all other vars

# 5. Run database migration
railway run prisma migrate deploy

# 6. Deploy
railway up

# 7. Get deployment URL
railway domain
# Example: https://sol-predict-arena-backend-production.up.railway.app
```

---

### STEP 3: Update Frontend with Backend URL

```bash
# Update in Vercel dashboard:
VITE_BACKEND_URL=https://sol-predict-arena-backend-production.up.railway.app
```

---

### STEP 4: Deploy Frontend to Vercel

#### Option A: Via CLI
```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Login
vercel login

# 3. Link project
cd frontend
vercel link

# 4. Set all environment variables
vercel env add VITE_SOLANA_NETWORK production
vercel env add VITE_SOLANA_RPC_URL production
vercel env add VITE_PROGRAM_ID production
vercel env add VITE_BACKEND_URL production
# ... add all other vars

# 5. Deploy to production
vercel --prod
```

#### Option B: Via GitHub (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "fix: resolve all TypeScript errors, ready for deployment"
git push origin main

# 2. Import repository in Vercel dashboard
# - Go to vercel.com → Import Project
# - Select GitHub repo: xDzaky/SOL-PREDICT-ARENA
# - Root Directory: frontend
# - Framework Preset: Vite
# - Build Command: pnpm run build
# - Output Directory: dist

# 3. Add environment variables in dashboard

# 4. Deploy
```

---

### STEP 5: Update Backend CORS with Frontend URL

```bash
# In Railway dashboard, update:
FRONTEND_URL=https://sol-predict-arena.vercel.app
```

---

### STEP 6: Post-Deployment Verification

#### Backend Health Check
```bash
curl https://your-backend-url.railway.app/health
# Expected: {"status":"ok","timestamp":...}
```

#### Frontend Checks
1. Open production URL
2. Test wallet connection (Phantom/Solflare)
3. Check DevTools → Network → WebSocket connection
4. Try initializing player profile
5. Check if Solana transactions work

#### Database Check
```bash
railway run prisma studio
# Verify tables created
```

---

## 🔥 KNOWN ISSUES & FIXES

### Issue: Large Bundle Size (910 kB)
**Impact:** Slower initial load
**Fix (Post-Launch):**
```javascript
// vite.config.ts - Add manual chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'wallet-adapter': ['@solana/wallet-adapter-react', '@solana/wallet-adapter-wallets'],
        'solana': ['@solana/web3.js', '@coral-xyz/anchor'],
        'vendor': ['react', 'react-dom', 'zustand']
      }
    }
  }
}
```

### Issue: Console Warnings
**Impact:** None (dev only)
**Fix:** Warnings about crypto/stream modules are safe to ignore for browser build

---

## 📊 BUILD OUTPUT SUMMARY

```
✅ Build: SUCCESS (40.56s)
📦 Total Bundle: 910.44 kB (276.83 kB gzipped)
⚡ Main Chunk: 910 kB
📁 Output: frontend/dist/
🔒 TypeScript: 0 errors
✨ Lint: 0 warnings
```

---

## 🎯 DEPLOYMENT TIMELINE

- **Backend Deployment:** ~10 minutes
- **Frontend Deployment:** ~5 minutes
- **Testing & Verification:** ~10 minutes
- **Total:** ~25 minutes

---

## ✅ FINAL PRE-DEPLOYMENT CHECKLIST

### Code
- [x] TypeScript build passes
- [x] No lint errors
- [x] All tests pass (if applicable)
- [x] Git clean (no uncommitted changes recommended)

### Configuration
- [x] `vercel.json` in repo root
- [x] Environment variables documented
- [x] Database schema ready
- [x] CORS configured

### Security
- [x] No secrets in code
- [x] `.env` files in `.gitignore`
- [x] Rate limiting active
- [x] Security headers configured

### Ready to Deploy?
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] Database connection string ready
- [x] Solana program deployed on devnet
- [ ] Backend deployed to Railway (DO THIS FIRST)
- [ ] Frontend deployed to Vercel (DO THIS SECOND)

---

## 🚨 DEPLOYMENT ORDER (IMPORTANT!)

1. ✅ Deploy Backend FIRST
2. ✅ Get Backend URL
3. ✅ Set Frontend env var with Backend URL
4. ✅ Deploy Frontend
5. ✅ Update Backend CORS with Frontend URL
6. ✅ Test everything

---

## 📞 SUPPORT

If deployment fails:
1. Check Railway logs: `railway logs`
2. Check Vercel logs: Dashboard → Deployments → View logs
3. Verify environment variables are set correctly
4. Check CORS configuration
5. Verify database connection string

---

**READY TO DEPLOY!** 🚀

Backend sudah running di port 3000 locally.
Frontend build SUCCESS.
Semua TypeScript errors FIXED.

**Next Command:**
```bash
cd backend
railway login
railway init
```
