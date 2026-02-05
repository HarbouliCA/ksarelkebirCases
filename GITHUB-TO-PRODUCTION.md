# GitHub → Railway → Vercel Deployment

## Quick Summary
- ✅ Your code is on GitHub (HarbouliCA/ksarelkebirCases)
- 🔄 Railway will deploy backend from GitHub
- 🔄 Vercel will deploy frontend from GitHub
- ✅ Auto-deployments enabled (push = live update)

---

## STEP 1: Deploy Backend on Railway (From GitHub)

### 1.1 Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select: **HarbouliCA/ksarelkebirCases**
5. Click "Deploy"

### 1.2 Configure Environment Variables

Railway detected your GitHub repo. Now add variables:

1. In Railway dashboard → Your project
2. Click Node.js service (or create one if needed)
3. Go to **Variables** tab
4. Add these variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:woaeYGIoUjEqxNlALUqlJnTwPEUXjAYk@centerbeam.proxy.rlwy.net:16450/railway
JWT_SECRET=your-super-secret-key-change-this-to-something-random-32-chars-minimum
```

5. Click "Save"

### 1.3 Load Database Schema

The database is empty. You need to load the schema:

**Option A: Using Railway Query Editor (Recommended)**

1. In Railway dashboard → PostgreSQL service
2. Go to **Query** tab
3. Open [`src/db/schema.sql`](src/db/schema.sql) from your local project
4. Copy ALL the SQL content
5. Paste into Railway query editor
6. Click **Execute**
7. Wait for completion (should show "Query executed successfully")

**Option B: Using psql Command**

```bash
PGPASSWORD=woaeYGIoUjEqxNlALUqlJnTwPEUXjAYk psql \
  -h centerbeam.proxy.rlwy.net \
  -U postgres \
  -p 16450 \
  -d railway \
  -f src/db/schema.sql
```

### 1.4 Wait for Deployment

- In Railway, check service status
- Should show "Deployed" with a green checkmark
- Get your backend URL:
  - Click Node.js service
  - Go to **Connect**
  - Copy the URL (e.g., `https://ksarelkebirCases-production-xxx.up.railway.app`)
  - **Save this URL** - you'll need it next

---

## STEP 2: Update Frontend API URL

Your frontend needs to know where the backend is.

1. **Edit** [`public/js/api.js`](public/js/api.js)

2. **Find this line** (around line 1):
   ```javascript
   const API_BASE = 'http://localhost:3000/api';
   ```

3. **Change to your Railway URL:**
   ```javascript
   const API_BASE = 'https://your-railway-url.up.railway.app/api';
   ```

4. **Commit and push to GitHub:**
   ```bash
   git add public/js/api.js
   git commit -m "Update API URL for production"
   git push
   ```

---

## STEP 3: Deploy Frontend on Vercel (From GitHub)

### 3.1 Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel
5. Install **"Vercel for GitHub"** app
6. Select repository: **ksarelkebirCases**
7. Click **"Install"**

### 3.2 Import Project on Vercel

1. After installation, Vercel auto-detects your repo
2. Or go to https://vercel.com/dashboard and click **"Import Project"**
3. Select **ksarelkebirCases**
4. Click **"Import"**

### 3.3 Configure Vercel Deployment

**Build Settings:**
- **Framework Preset:** Other
- **Build Command:** Leave empty
- **Output Directory:** `public`
- **Install Command:** Leave empty

**Environment Variables (optional):**
- Leave blank for now (frontend doesn't need them)

Click **"Deploy"**

### 3.4 Wait for Deployment

- Vercel builds and deploys automatically
- You'll get a URL like: `https://ksarelkebirCases.vercel.app`
- **Test it:** Open the URL in browser
  - Should see login page
  - Try login with: `admin@ksarapp.com` / `admin123`

---

## STEP 4: Set Custom Domain (Optional)

### For Vercel Frontend

1. In Vercel dashboard → Project Settings
2. Go to **Domains**
3. Add domain: `ksarapp.sagafit.es`
4. Update DNS at your domain registrar:
   - Point to Vercel's nameservers (instructions provided)
5. SSL certificate auto-installs

---

## TESTING CHECKLIST

### Test Backend (Railway)

```bash
curl https://your-railway-url.up.railway.app/api/health
```

Should return: `{"status":"ok"}`

### Test Frontend (Vercel)

1. Open browser: `https://ksarelkebirCases.vercel.app`
2. Login with: `admin@ksarapp.com` / `admin123`
3. Should see Dashboard with data

### Test API Connection

1. Login on Vercel URL
2. Open DevTools (F12)
3. Go to **Network** tab
4. Check that API calls go to Railway URL (not localhost)

---

## AUTO-DEPLOYMENTS ENABLED

**From now on:**

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

3. **Railway** auto-redeploys backend (1-2 min)
4. **Vercel** auto-redeploys frontend (1-2 min)

---

## IMPORTANT: Update CORS in Backend

So frontend can call backend from different domain:

1. **Edit** [`server.js`](server.js)
2. **Find the CORS setup** (around line 10-15)
3. **Add Vercel domain to allowed origins:**

```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'https://ksarelkebirCases.vercel.app',
    'https://ksarapp.sagafit.es',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
```

4. **Commit and push:**
   ```bash
   git add server.js
   git commit -m "Allow Vercel domain for CORS"
   git push
   ```

---

## TROUBLESHOOTING

### Railway shows "Build failed"
- Check logs in Railway dashboard
- Common: Missing environment variables
- Solution: Add DATABASE_URL and JWT_SECRET to Variables

### Frontend loads but shows blank page
- Open DevTools (F12) → Console
- Check for errors (usually CORS or 404)
- Verify API URL in `public/js/api.js` matches Railway URL
- Make sure CORS is configured in `server.js`

### "Cannot connect to database"
- Verify DATABASE_URL in Railway Variables is correct
- Make sure database schema is loaded (run schema.sql)
- Check PostgreSQL service status in Railway

### Vercel deployment fails
- Check Vercel build logs
- Common: Missing files or syntax errors
- Push fixes to GitHub, Vercel auto-retries

---

## FINAL CHECKLIST

- ✅ Code pushed to GitHub
- ✅ Railway connected to GitHub repo
- ✅ PostgreSQL database schema loaded
- ✅ Railway environment variables set
- ✅ Backend deployed on Railway (green status)
- ✅ Frontend API URL updated to Railway
- ✅ Changes pushed to GitHub
- ✅ CORS configured in server.js
- ✅ Vercel connected to GitHub repo
- ✅ Vercel deployment complete
- ✅ Frontend accessible at Vercel URL
- ✅ Login works with admin credentials
- ✅ API calls go to Railway backend
- ✅ Auto-deployments enabled on both platforms

---

## YOUR DEPLOYMENT URLS

**Frontend (Vercel):**
- Development: `https://ksarelkebirCases.vercel.app`
- Custom domain: `https://ksarapp.sagafit.es` (after DNS setup)

**Backend (Railway):**
- `https://ksarelkebirCases-production-xxx.up.railway.app`

**Database (Railway PostgreSQL):**
- Connection: `postgresql://postgres:...@centerbeam.proxy.rlwy.net:16450/railway`

---

## COST

- **Railway (Backend + DB):** Free first month ($5 credits), then ~$5-10/month
- **Vercel (Frontend):** Free tier (unlimited for this project)
- **Total:** $0-10/month

---

## NEXT STEPS

1. Complete database schema load (Step 1.3)
2. Update API URL (Step 2)
3. Deploy to Vercel (Step 3)
4. Test everything (Testing section)
5. Add custom domain (Step 4, optional)
6. Update CORS in server.js
7. Monitor deployments

Everything is automated after this - just push to GitHub!
