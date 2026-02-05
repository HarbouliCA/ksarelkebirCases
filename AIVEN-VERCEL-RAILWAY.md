# Production Deployment Guide: Aiven + Railway + Vercel

## Overview

You already have everything you need:
- ✅ **Code on GitHub:** HarbouliCA/ksarelkebirCases
- ✅ **Database:** Aiven PostgreSQL (avnadmin user)
- 🔄 **Backend:** Will deploy to Railway (connects to Aiven)
- 🔄 **Frontend:** Will deploy to Vercel

**Architecture:**
```
GitHub (Code Source)
    ↓
┌─────────────────────────┬──────────────────────┐
│                         │                      │
Vercel (Frontend)     Railway (Backend)      
  Static Files         Node.js + Express         
https://...vercel.app   https://...railway.app   
                              ↓
                        Aiven PostgreSQL
                     (avnadmin@ksardb-cmk-25...)
```

---

## STEP 1: Prepare Code (Local)

### 1.1 Update API Configuration

Edit `public/js/api.js` to detect backend URL:

```javascript
// Detect backend URL based on environment
const getApiBase = () => {
  // Production: Vercel frontend calls Railway backend
  if (window.location.hostname.includes('vercel.app') || 
      window.location.hostname === 'ksarapp.sagafit.es') {
    return 'https://YOUR-RAILWAY-URL.up.railway.app/api';
  }
  // Development: localhost
  return 'http://localhost:3000/api';
};

const API_BASE = getApiBase();
```

**Note:** You'll replace `YOUR-RAILWAY-URL` after Railway deploys.

### 1.2 Update CORS in Backend

Edit `server.js` to allow Vercel and custom domain:

```javascript
// Around line 25, update CORS:
app.use(cors({
  origin: [
    'https://ksarelkebirCases.vercel.app',
    'https://ksarapp.sagafit.es',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 1.3 Prepare Production Environment

Create `.env.production` (for reference, not committed):

```
DATABASE_URL=postgres://avnadmin:AVNS_ycOqIJy7HhutnlbHGSQ@ksardb-cmk-25.d.aivencloud.com:17327/defaultdb?sslmode=require
JWT_SECRET=<generate-secure-random-key>
NODE_ENV=production
PORT=3000
```

**Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.4 Commit Changes

```bash
cd C:\Users\alabe\OneDrive\Escritorio\KsarApp
git add .
git commit -m "Prepare for production deployment - update CORS and API config"
git push origin main
```

---

## STEP 2: Deploy Backend to Railway

### 2.1 Connect Railway to GitHub

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: **HarbouliCA/ksarelkebirCases**
5. Click **"Deploy"**

### 2.2 Configure Environment Variables

Railway will auto-detect Node.js and create a service. Now add variables:

1. Click on the **Node.js service**
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgres://avnadmin:AVNS_ycOqIJy7HhutnlbHGSQ@ksardb-cmk-25.d.aivencloud.com:17327/defaultdb?sslmode=require` |
| `JWT_SECRET` | (Generate random 32-char secret) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

4. Click **"Save"**

### 2.3 Wait for Deployment

- Railway will build and deploy automatically
- Status should show **"Deployed"** ✅
- Check logs: Should show "✅ Database connected"

### 2.4 Get Backend URL

1. Click Node.js service
2. Go to **"Connect"** tab
3. Copy the **Public URL** (example: `https://ksarelkebirCases-production-abc123.up.railway.app`)
4. **Save this URL** - you'll need it next

---

## STEP 3: Update Frontend API URL

Now that Railway backend is deployed, update the frontend to use it.

### 3.1 Update public/js/api.js

Replace `YOUR-RAILWAY-URL` with your actual Railway URL from Step 2.4:

```javascript
const getApiBase = () => {
  // Production: Vercel frontend calls Railway backend
  if (window.location.hostname.includes('vercel.app') || 
      window.location.hostname === 'ksarapp.sagafit.es') {
    return 'https://ksarelkebirCases-production-abc123.up.railway.app/api';
  }
  // Development: localhost
  return 'http://localhost:3000/api';
};
```

### 3.2 Commit and Push

```bash
git add public/js/api.js
git commit -m "Update backend API URL to Railway production"
git push origin main
```

---

## STEP 4: Deploy Frontend to Vercel

### 4.1 Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel to access your repos
5. Install **"Vercel for GitHub"** app

### 4.2 Import Project

After installing, Vercel auto-detects your repo:

1. Go to Vercel dashboard
2. Should show **ksarelkebirCases** repo
3. Click **"Import"**

### 4.3 Configure Project

**Build Settings:**
- **Framework Preset:** Other
- **Build Command:** (leave empty)
- **Output Directory:** `public`
- **Install Command:** (leave empty)

Click **"Deploy"**

### 4.4 Wait for Deployment

- Vercel builds and deploys
- You'll get a URL: `https://ksarelkebirCases.vercel.app`
- **Test it:** Open URL in browser
  - Should see login page
  - Try: `admin@ksarapp.com` / `admin123`

---

## STEP 5: Test Everything

### 5.1 Test Frontend Load

```
https://ksarelkebirCases.vercel.app
```

✅ Should show login page

### 5.2 Test Login

- Email: `admin@ksarapp.com`
- Password: `admin123`
- Click Login
- ✅ Should see Dashboard

### 5.3 Test API Connection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Login again
4. Find API calls (should start with Railway URL, not localhost)
5. ✅ Should see successful responses

### 5.4 Test CRUD Operations

- ✅ Add new person
- ✅ Create new case
- ✅ View dashboard
- ✅ Navigate to History
- ✅ Mark case as complete

---

## STEP 6: Setup Custom Domain (Optional)

### 6.1 Add Domain to Vercel

1. Go to Vercel dashboard → **Project Settings**
2. Go to **"Domains"**
3. Add: `ksarapp.sagafit.es`
4. Follow DNS instructions

### 6.2 Update DNS

At your domain registrar (GoDaddy, Namecheap, etc.):
- Point `ksarapp` subdomain to Vercel nameservers
- Wait 5-30 minutes for propagation

### 6.3 Enable SSL

- Vercel auto-enables free SSL
- Should be active once DNS propagates

---

## MONITORING & MAINTENANCE

### Check Backend Logs

Railway dashboard → Node.js service → **Logs**

Should show:
```
✅ Database connected
Server running at http://localhost:3000
```

### Check Frontend Deployments

Vercel dashboard → **Deployments** tab

Shows all deployments and rollback option.

### Database Access

Connect directly to Aiven:
```bash
psql "postgres://avnadmin:AVNS_ycOqIJy7HhutnlbHGSQ@ksardb-cmk-25.d.aivencloud.com:17327/defaultdb?sslmode=require"
```

---

## AUTO-DEPLOYMENTS

From now on, whenever you push to GitHub:

1. **GitHub** receives your code
2. **Railway** auto-redeploys backend (1-2 min)
3. **Vercel** auto-redeploys frontend (1-2 min)
4. Live app updates automatically ✅

---

## TROUBLESHOOTING

### Frontend blank page / API errors
- Check DevTools Console (F12)
- Verify API URL in `public/js/api.js` matches Railway URL
- Check Railway logs for backend errors

### 401 Unauthorized errors
- Verify JWT_SECRET in Railway Variables
- Check if token is properly stored/sent

### Database connection failed
- Verify DATABASE_URL in Railway Variables is correct
- Ensure Aiven database is running
- Check if schema is loaded in Aiven database

### CORS errors
- Verify Vercel domain is in CORS allowed origins in server.js
- If added, push to GitHub for Railway to redeploy

### Railway deployment failed
- Check logs in Railway dashboard
- Common: Missing environment variables
- Push fixes to GitHub to retry

---

## FINAL DEPLOYMENT CHECKLIST

- ✅ Code pushed to GitHub
- ✅ Railway connected to GitHub repo
- ✅ Railway environment variables set (DATABASE_URL, JWT_SECRET)
- ✅ Railway backend deployed successfully
- ✅ Railway backend URL obtained
- ✅ Frontend API URL updated to Railway URL
- ✅ Frontend changes pushed to GitHub
- ✅ Server.js CORS updated with Vercel domain
- ✅ Backend changes pushed to GitHub
- ✅ Vercel connected to GitHub repo
- ✅ Vercel frontend deployed successfully
- ✅ Frontend accessible and loading
- ✅ Login works
- ✅ Dashboard displays data from backend
- ✅ API Network tab shows calls to Railway (not localhost)
- ✅ Case management operations work
- ✅ Auto-deployments enabled

---

## YOUR PRODUCTION URLs

**Frontend:**
- Dev: `https://ksarelkebirCases.vercel.app`
- Custom: `https://ksarapp.sagafit.es` (after DNS setup)

**Backend:**
- `https://ksarelkebirCases-production-xxx.up.railway.app`

**Database:**
- `postgres://avnadmin:...@ksardb-cmk-25.d.aivencloud.com:17327/defaultdb`

---

## COST

- **Aiven PostgreSQL:** Already paid / included ✅
- **Railway (Backend):** Free tier or ~$5-7/month
- **Vercel (Frontend):** Free tier ✅
- **Custom Domain:** Your domain cost

**Total: Free or ~$5-7/month**

---

## NEXT STEPS

1. ✅ Update `public/js/api.js` with API base function
2. ✅ Update CORS in `server.js`
3. ✅ Git push changes
4. ✅ Deploy backend to Railway
5. ✅ Get Railway URL
6. ✅ Update `public/js/api.js` with Railway URL
7. ✅ Git push
8. ✅ Deploy frontend to Vercel
9. ✅ Test everything
10. ✅ (Optional) Setup custom domain
