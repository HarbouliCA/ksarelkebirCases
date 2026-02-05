# Quick Start: Aiven + Vercel Deployment

**Your Setup:**
- Database: Aiven PostgreSQL (already configured) ✅
- Backend: Railway (Node.js server)
- Frontend: Vercel (static files)

---

## PHASE 1: Deploy Backend to Railway (5 minutes)

### Step 1: Go to Railway Dashboard
- Visit https://railway.app/dashboard
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose repository: **HarbouliCA/ksarelkebirCases**
- Click **"Deploy"**

### Step 2: Add Environment Variables
1. Click on **Node.js** service
2. Go to **"Variables"** tab
3. Add these variables:

```
DATABASE_URL=postgres://avnadmin:AVNS_ycOqIJy7HhutnlbHGSQ@ksardb-cmk-25.d.aivencloud.com:17327/defaultdb?sslmode=require
JWT_SECRET=your-secret-key-here (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=production
PORT=3000
```

4. Click **"Save"**

### Step 3: Wait for Deployment
- Status changes to **"Deployed"** ✅
- Check logs: Should show "✅ Database connected"

### Step 4: Get Your Backend URL
1. Click Node.js service
2. Go to **"Connect"**
3. Copy the **Public URL** 
   - Example: `https://ksarelkebircases-production-19fd.up.railway.app`
4. **Save this URL - you'll need it in Phase 2**

---

## PHASE 2: Update Frontend with Backend URL (2 minutes)

### Step 1: Edit public/js/api.js
In your local project, open `public/js/api.js`

**Your actual Railway URL:**
```javascript
return 'https://ksarelkebircases-production-19fd.up.railway.app/api';
```

This is already configured correctly! ✅

### Step 2: Commit and Push
```bash
cd C:\Users\alabe\OneDrive\Escritorio\KsarApp
git add public/js/api.js
git commit -m "Update backend URL for production"
git push origin main
```

---

## PHASE 3: Deploy Frontend to Vercel (3 minutes)

### Step 1: Go to Vercel
- Visit https://vercel.com
- Click **"Sign Up"** (or Login)
- Select **"Continue with GitHub"**

### Step 2: Authorize Vercel
- Click **"Authorize Vercel"**
- Install **"Vercel for GitHub"**
- Select your **ksarelkebirCases** repository

### Step 3: Import Project
1. After installation, Vercel dashboard shows your repo
2. Click **"Import"**

### Step 4: Configure (Keep Defaults)
- **Framework:** Other
- **Build Command:** (empty)
- **Output Directory:** public
- **Install Command:** (empty)

Click **"Deploy"** 

### Step 5: Wait & Get URL
- Vercel deploys (takes 1-2 minutes)
- You get a URL: `https://ksarelkebirCases.vercel.app`
- **This is your production frontend!**

---

## PHASE 4: Test It (2 minutes)

### Test 1: Can I see the login page?
```
https://ksarelkebirCases.vercel.app
```
✅ Should show login page

### Test 2: Can I login?
- Email: `admin@ksarapp.com`
- Password: `admin123`
- ✅ Should see Dashboard

### Test 3: Check API Connection
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click Login
4. Find API calls (should start with your Railway URL, not localhost)
5. ✅ Should show 200/201 responses

### Test 4: Try CRUD
- ✅ Add a person
- ✅ Create a case
- ✅ Mark case complete
- ✅ View history

---

## PHASE 5: Setup Custom Domain (Optional, 5 minutes)

### If you want: ksarapp.sagafit.es

1. **In Vercel:**
   - Project Settings → Domains
   - Add: `ksarapp.sagafit.es`
   - Copy the DNS info

2. **At your domain registrar:**
   - Add CNAME record pointing to Vercel
   - Wait 5-30 minutes for DNS

3. **Done!**
   - SSL auto-enables
   - Access at: `https://ksarapp.sagafit.es`

---

## WHAT HAPPENS NOW?

Every time you push to GitHub:
```bash
git push origin main
```

1. Railway auto-redeploys backend (1-2 min)
2. Vercel auto-redeploys frontend (1-2 min)
3. Your app updates live ✅

---

## QUICK REFERENCE

| Component | Where | URL |
|-----------|-------|-----|
| Frontend | Vercel | `https://ksarelkebirCases.vercel.app` |
| Backend | Railway | `https://ksarelkebircases-production-19fd.up.railway.app` |
| Database | Aiven | `postgres://avnadmin:...@ksardb-cmk-25...` |

---

## TROUBLESHOOTING

### "Blank page or API errors"
- Open DevTools (F12) → Console
- Look for error messages
- Usually: API URL is wrong in `public/js/api.js`
- Fix → Git push → Auto-redeploys

### "401 Unauthorized"
- Check JWT_SECRET in Railway Variables
- Must be same value as deployed

### "Can't connect to database"
- Verify DATABASE_URL in Railway Variables
- Check Aiven database is running

### "Railway build failed"
- Check Railway logs
- Usually: Missing environment variable
- Add it → Should auto-retry

---

## DONE! 🎉

Your app is now live in production:
- **Frontend:** Vercel (ksarelkebirCases.vercel.app)
- **Backend:** Railway (connects to Aiven database)
- **Auto-deploy:** Push code → Live update in 2 minutes

**Total setup time: ~15 minutes**

Any issues? Check the logs:
- **Vercel:** Dashboard → Deployments
- **Railway:** Dashboard → Logs
- **Browser:** F12 → Console & Network
