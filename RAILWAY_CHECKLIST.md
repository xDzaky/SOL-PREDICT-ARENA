# ✅ RAILWAY DEPLOYMENT CHECKLIST

## 🎯 Quick Reference

**Frontend URL:** https://sol-predict-arena.vercel.app/  
**Backend Repository:** https://github.com/xDzaky/SOL-PREDICT-ARENA  
**Backend Directory:** `backend/`

---

## 📋 COPY-PASTE READY - Environment Variables for Railway

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

⚠️ **NOTE:** `DATABASE_URL` akan otomatis di-inject oleh Railway PostgreSQL

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### 1. Login to Railway
- [ ] Go to https://railway.app/
- [ ] Click "Login with GitHub"
- [ ] Authorize Railway

### 2. Create New Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose repository: `xDzaky/SOL-PREDICT-ARENA`
- [ ] Click "Deploy Now"

### 3. Configure Service Settings
- [ ] Click on the deployed service
- [ ] Go to "Settings"
- [ ] Set **Root Directory:** `backend`
- [ ] Verify **Build Command:** (auto-detected from railway.json)
  ```
  pnpm install && npx prisma generate && npx prisma migrate deploy && pnpm run build
  ```
- [ ] Verify **Start Command:**
  ```
  node dist/index.js
  ```

### 4. Add PostgreSQL Database
- [ ] In project dashboard, click "+ New"
- [ ] Select "Database"
- [ ] Choose "Add PostgreSQL"
- [ ] Wait for database to provision (~30 seconds)
- [ ] DATABASE_URL will be automatically linked

### 5. Add Environment Variables
- [ ] Click on backend service
- [ ] Go to "Variables" tab
- [ ] Click "New Variable"
- [ ] **PASTE ALL** variables from section above (one by one or bulk)
- [ ] Verify each variable is set correctly
- [ ] **IMPORTANT:** Don't add DATABASE_URL (auto-injected by Railway)

### 6. Deploy
- [ ] Railway will auto-deploy after variables are set
- [ ] Monitor "Deployments" tab
- [ ] Wait for build to complete (~3-5 minutes)
- [ ] Check logs for errors

### 7. Generate Public Domain
- [ ] Go to "Settings" tab
- [ ] Scroll to "Domains" section
- [ ] Click "Generate Domain"
- [ ] Copy the generated URL (example: `sol-predict-arena-backend-production.up.railway.app`)
- [ ] **SAVE THIS URL** - you'll need it for step 9

### 8. Verify Backend Deployment
Test these endpoints:

- [ ] Root endpoint:
  ```bash
  curl https://your-backend-url.up.railway.app/
  ```
  Expected: `{"success":true,"message":"SOL Predict Arena API"...}`

- [ ] Health endpoint:
  ```bash
  curl https://your-backend-url.up.railway.app/api/health
  ```
  Expected: `{"status":"ok","timestamp":"..."}`

- [ ] Check logs in Railway dashboard
  Expected: `Server running on port 3001`

### 9. Update Frontend Environment Variable
- [ ] Go to https://vercel.com/
- [ ] Open your project: `sol-predict-arena`
- [ ] Go to "Settings" → "Environment Variables"
- [ ] Find `VITE_BACKEND_URL`
- [ ] Click "Edit"
- [ ] Change value to: `https://your-backend-url.up.railway.app`
- [ ] Click "Save"
- [ ] Go to "Deployments" tab
- [ ] Click "..." on latest deployment → "Redeploy"
- [ ] Check "Use existing Build Cache"
- [ ] Click "Redeploy"

### 10. Final Verification
- [ ] Visit frontend: https://sol-predict-arena.vercel.app/
- [ ] Open browser console (F12)
- [ ] Check for WebSocket connection
- [ ] Try connecting wallet
- [ ] Check network tab - API calls should go to Railway backend
- [ ] Test a prediction (if possible)

---

## 🔍 Troubleshooting

### Build Fails in Railway

**Check:**
1. Root directory is set to `backend`
2. All dependencies in package.json
3. Prisma schema is valid

**Fix:**
```bash
# Test locally first
cd backend
pnpm install
pnpm run build
```

### Database Connection Error

**Check:**
1. PostgreSQL service is running in Railway
2. DATABASE_URL is automatically set (don't add manually)
3. Prisma migrations ran successfully

**Fix:**
```bash
# In Railway, check "Deployments" logs for:
# "npx prisma migrate deploy"
# Should show: "Database is up to date"
```

### CORS Error in Frontend

**Check:**
1. `FRONTEND_URL` in Railway matches Vercel URL exactly
2. No trailing slash in URLs

**Fix:**
```
FRONTEND_URL=https://sol-predict-arena.vercel.app
(not https://sol-predict-arena.vercel.app/)
```

### Frontend Can't Connect to Backend

**Check:**
1. Railway backend URL is correct in Vercel
2. Backend is running (check Railway logs)
3. Domain is generated in Railway

**Fix:**
1. Regenerate domain in Railway Settings
2. Update VITE_BACKEND_URL in Vercel
3. Redeploy frontend

---

## ✅ Success Criteria

Your deployment is successful when:

- [x] Railway build completes without errors
- [x] Backend logs show "Server running on port 3001"
- [x] Database is connected (no Prisma errors in logs)
- [x] GET `https://backend-url.up.railway.app/` returns JSON
- [x] GET `https://backend-url.up.railway.app/api/health` returns `{"status":"ok"}`
- [x] Frontend loads at https://sol-predict-arena.vercel.app/
- [x] Browser console shows WebSocket connection
- [x] No CORS errors in browser console
- [x] Wallet connection works
- [x] API calls in Network tab point to Railway backend

---

## 🎉 DEPLOYMENT COMPLETE!

**Frontend:** https://sol-predict-arena.vercel.app/  
**Backend:** https://your-backend-url.up.railway.app/  
**Database:** PostgreSQL on Railway  
**Status:** LIVE ✅

---

## 📊 Expected Timeline

| Step | Time |
|------|------|
| Railway login & setup | 2 min |
| PostgreSQL provisioning | 1 min |
| Environment variables | 2 min |
| Build & deploy | 5 min |
| Verification | 2 min |
| Frontend update | 3 min |
| **TOTAL** | **~15 min** |

---

**Need help?** Check `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed instructions.
