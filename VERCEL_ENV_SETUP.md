# Vercel Environment Variables Setup

## Problem Fixed
- ✅ Simplified `vercel.json` configuration
- ✅ Added explicit Vite build settings
- ✅ Removed problematic CSP headers
- ✅ Fixed SPA routing configuration

## Required: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/
2. Select your project: **sol-predict-arena**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Production Environment Variables

Add these variables for **Production** environment:

```env
VITE_BACKEND_URL=https://sol-predict-arena-backend-production.up.railway.app
VITE_WS_URL=wss://sol-predict-arena-backend-production.up.railway.app
VITE_ENABLE_DEBUG=false
```

### Step 3: Add Preview/Development Environment Variables (Optional)

For **Preview** and **Development** environments (optional, for testing):

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_ENABLE_DEBUG=true
```

### Step 4: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **3 dots** menu (⋯)
4. Select **Redeploy**
5. Check **Use existing Build Cache** (optional)
6. Click **Redeploy**

## Verification

Once deployed, check:

1. **Visit:** https://sol-predict-arena.vercel.app/
2. **Open Browser Console** (F12)
3. **Check Network tab:**
   - Should see requests to Railway backend
   - WebSocket connection should be established
   - No 404 errors

4. **Check Application:**
   - Wallet button should work
   - No console errors
   - All components should load

## What Changed

### Before:
```json
// Complex vercel.json with CSP headers
{
  "version": 2,
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", ... }
      ]
    }
  ]
}
```

### After:
```json
// Simplified vercel.json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Vite Config Enhanced:
```typescript
export default defineConfig({
  plugins: [react()],
  base: "/",  // ← Added
  build: {    // ← Added
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false
  }
});
```

## Common Issues

### Issue: Still getting 404
**Solution:** 
- Clear Vercel build cache
- Redeploy without cache
- Check if environment variables are set for Production

### Issue: Can't connect to backend
**Solution:**
- Verify environment variables are correct
- Check Railway backend is running
- Check browser console for CORS errors

### Issue: WebSocket not connecting
**Solution:**
- Ensure `VITE_WS_URL` uses `wss://` (not `ws://`)
- Check Railway backend allows WebSocket connections
- Verify firewall/network settings

## Git Commit
Fixes committed in: `010753c`
