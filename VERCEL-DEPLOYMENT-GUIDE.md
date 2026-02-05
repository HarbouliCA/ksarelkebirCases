# Vercel Deployment Guide for KsarApp

## Overview

Vercel is optimized for frontend deployment but can host full-stack applications. For KsarApp, we'll use:
- **Frontend**: Deployed on Vercel (HTML, CSS, JavaScript)
- **Backend + Database**: Deployed on Railway or Render (Node.js + PostgreSQL)

This approach gives you:
- ✅ Automatic deployments from GitHub
- ✅ Free SSL/HTTPS
- ✅ Global CDN for frontend
- ✅ Environment variables management
- ✅ Easy scaling

---

## PART 1: Prepare Your Repository for Vercel

### Step 1: Create GitHub Repository

1. **Go to GitHub** (https://github.com)
   - Login to your account
   - Click "+" icon (top right)
   - Select "New repository"

2. **Create repository**
   - **Repository name:** ksarapp
   - **Description:** Social aid case management system
   - **Visibility:** Private (recommended) or Public
   - **Initialize with:** None (we'll push existing code)
   - Click "Create repository"

3. **Get the repository URL**
   - Copy the HTTPS URL shown
   - Format: `https://github.com/yourusername/ksarapp.git`

### Step 2: Push Your Code to GitHub

1. **Open Terminal in your project folder**
   ```bash
   cd C:\Users\alabe\OneDrive\Escritorio\KsarApp
   ```

2. **Initialize git if not already done**
   ```bash
   git init
   ```

3. **Add all files**
   ```bash
   git add .
   ```

4. **Create initial commit**
   ```bash
   git commit -m "Initial KsarApp deployment"
   ```

5. **Add remote repository**
   ```bash
   git remote add origin https://github.com/yourusername/ksarapp.git
   ```

6. **Push to GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## PART 2: Deploy Backend + Database on Railway

### Why Railway?
- Simple PostgreSQL hosting
- Easy Node.js deployment
- Good free tier ($5/month credits)
- Direct GitHub integration

### Step 1: Set Up Railway Account

1. **Go to Railway** (https://railway.app)
   - Click "Start Free"
   - Login with GitHub or create account
   - Authorize Railway to access your GitHub

### Step 2: Create PostgreSQL Database

1. **In Railway dashboard**
   - Click "+ New Project"
   - Select "Provision PostgreSQL"
   - Wait for database to initialize (1-2 minutes)

2. **Get Database URL**
   - In Railway dashboard, find your PostgreSQL service
   - Click on it
   - Go to "Connect"
   - Copy the "Database URL" (starts with `postgresql://`)
   - Keep this safe - you'll need it

### Step 3: Load Database Schema

**Use Railway Web Console (Recommended):**

1. **In Railway dashboard**
   - Click on PostgreSQL service
   - Go to "Query" tab (top menu)

2. **In your local editor**
   - Open `src/db/schema.sql`
   - Select all (Ctrl+A)
   - Copy

3. **In Railway Query tab**
   - Paste the SQL code
   - Click "Execute"
   - Wait for "Queries executed successfully" message

4. **Verify tables created**
   - Go to "Data" tab in Railway
   - You should see tables: users, people, cases, aid_types, case_aid_types, notes, case_history, activity_logs

### Step 4: Deploy Node.js Backend

1. **In Railway dashboard**
   - Click "+ New Service"
   - Select "GitHub Repo"
   - Find your ksarapp repository
   - Click "Deploy"

2. **Configure Environment Variables**
   - In Railway, find your Node.js service
   - Go to "Variables"
   - Click "+ Add Variable"
   - Add these:

   ```
   NODE_ENV=production
   DATABASE_URL=[paste your PostgreSQL URL from above]
   JWT_SECRET=your-secret-key-minimum-32-characters-long-change-this
   PORT=3000
   ```

3. **Set Entry Point** (if needed)
   - Go to "Deploy" tab
   - Set "Start Command" to: `npm start`
   - Set "Build Command" to: `npm install` (if not auto-detected)

4. **Get Backend URL**
   - In Railway dashboard
   - Node.js service → "Connect"
   - Copy the public URL (e.g., `https://ksarapp-production-xxxx.up.railway.app`)
   - Save this URL - you'll need it for frontend

5. **Wait for Deployment**
   - Status should show "Deployed"
   - Check logs for "Server running" message

---

## PART 3: Deploy Frontend on Vercel

### Step 1: Update Frontend API URL

Before deploying, update your frontend to use the Railway backend URL.

1. **Edit `public/js/api.js`**
   - Find the line that sets the API base URL
   - Change from `http://localhost:3000` to your Railway backend URL
   
   Example:
   ```javascript
   const API_BASE = 'https://ksarapp-production-xxxx.up.railway.app/api';
   ```

2. **Commit and push changes**
   ```bash
   git add public/js/api.js
   git commit -m "Update API URL for production"
   git push
   ```

### Step 2: Create vercel.json Configuration

1. **In project root, create `vercel.json`**
   ```json
   {
     "buildCommand": "echo 'Frontend only'",
     "outputDirectory": "public",
     "env": {
       "REACT_APP_API_URL": "@react_app_api_url"
     },
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/$1"
       },
       {
         "src": "/.*",
         "status": 404,
         "dest": "/index.html"
       }
     ]
   }
   ```

2. **Commit and push**
   ```bash
   git add vercel.json
   git commit -m "Add Vercel configuration"
   git push
   ```

### Step 3: Deploy to Vercel

1. **Go to Vercel** (https://vercel.com)
   - Click "Sign Up"
   - Select "Continue with GitHub"
   - Authorize Vercel
   - Install Vercel for GitHub app on your repository

2. **Import Project**
   - Vercel automatically detects new repositories
   - Or click "Import Project"
   - Select your ksarapp repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** "Other" (custom frontend)
   - **Build Command:** Leave blank or `echo 'No build needed'`
   - **Output Directory:** `public`
   - **Install Command:** Leave blank
   - Click "Deploy"

4. **Wait for Deployment**
   - Vercel builds and deploys automatically
   - You'll get a URL like: `https://ksarapp.vercel.app`
   - Check "Deployments" tab for status

### Step 4: Get Your Vercel URL

1. **After deployment completes**
   - Vercel shows your production URL
   - Format: `https://your-project.vercel.app`
   - Save this URL

### Step 5: Configure Custom Domain (Optional)

1. **In Vercel dashboard**
   - Go to Settings
   - Click "Domains"
   - Add your domain: `ksarapp.sagafit.es`
   - Follow DNS setup instructions
   - Wait for DNS propagation (5-30 minutes)

---

## PART 4: Enable Auto-Deployments

### Automatic Deployment from GitHub

1. **In Vercel Dashboard**
   - Settings → Git
   - Should show "GitHub" is connected
   - "Deploy on Push" is enabled by default

2. **From now on:**
   - Push changes to GitHub: `git push`
   - Vercel automatically deploys within 1-2 minutes
   - No manual upload needed

---

## FULL DEPLOYMENT CHECKLIST

- ✅ GitHub repository created with code
- ✅ Railway PostgreSQL database created
- ✅ Database schema loaded into Railway
- ✅ Railway Node.js service deployed
- ✅ Backend accessible at Railway URL
- ✅ Frontend API URL updated to point to Railway backend
- ✅ Vercel project created and deployed
- ✅ Frontend accessible at Vercel URL
- ✅ Login works with correct backend
- ✅ Dashboard loads with data from database
- ✅ Custom domain configured (optional)
- ✅ Auto-deployments enabled

---

## TESTING YOUR DEPLOYMENT

### Test Backend (Railway)

1. **Open Terminal**
   ```bash
   curl https://your-railway-url/api/health
   ```

2. **Should return:**
   ```json
   {"status": "ok"}
   ```

### Test Frontend (Vercel)

1. **Open Browser**
   - Go to `https://your-vercel-url.vercel.app`
   - Should see login page

2. **Test Login**
   - Email: `admin@ksarapp.com`
   - Password: `admin123`
   - Should see Dashboard with data

### Test API Connection

1. **In browser (Vercel URL)**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try to login
   - Check Network tab for API calls
   - Should show calls to Railway backend URL

---

## ENVIRONMENT VARIABLES

### Railway Backend (.env)

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-very-secure-random-key-minimum-32-chars
```

**Set these in Railway dashboard:**
- Service → Variables
- Add each one individually

### Vercel Frontend (optional - only if needed)

```
REACT_APP_API_URL=https://your-railway-backend.up.railway.app
```

**Set these in Vercel dashboard:**
- Settings → Environment Variables
- Add variables
- Redeploy after adding

---

## COMMON ISSUES & SOLUTIONS

### 1. "CORS Error: No 'Access-Control-Allow-Origin'"

**Problem:** Frontend can't connect to backend

**Solution:**
- Update `server.js` to allow Vercel domain:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://ksarapp.vercel.app', 'https://ksarapp.sagafit.es', 'http://localhost:3000'],
  credentials: true
}));
```
- Push to GitHub
- Railway auto-redeploys

### 2. "Database connection failed"

**Problem:** Backend can't connect to Railway database

**Solution:**
- Go to Railway PostgreSQL service
- Copy fresh DATABASE_URL
- Update in Railway Node.js service Variables
- Restart the service

### 3. "Build failing on Vercel"

**Problem:** Deployment error

**Solution:**
- In Vercel dashboard → Deployments
- Click failed deployment
- Check "Build Logs" for error message
- Fix the issue locally
- Push to GitHub to retry

### 4. "Frontend loads but shows blank page"

**Problem:** API calls failing silently

**Solution:**
- Open DevTools (F12) → Console
- Check for errors
- Verify API URL in `public/js/api.js` is correct
- Update and push to GitHub

### 5. "Vercel deploys but Railway doesn't"

**Solution:**
- Railway doesn't auto-redeploy from GitHub
- Option 1: Manually click "Redeploy" in Railway
- Option 2: Set up webhook (Railway → Settings → Webhooks)
- Option 3: Use Railway CLI to trigger deploys

---

## COST BREAKDOWN

### Railway (Backend + Database)
- First $5/month free
- Then pay as you go
- Database: ~$1-5/month depending on usage
- Estimate: **Free or $5-10/month**

### Vercel (Frontend)
- **Free tier** (perfect for KsarApp)
- Unlimited deployments
- Unlimited bandwidth
- Custom domain free

### Total Estimated Cost
- **$0-10/month** (first month free with Railway credits)

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Change Admin Password**
   ```bash
   # In your app, go to admin settings
   ```

2. **Create Team Accounts**
   - Login as admin
   - Create user accounts for team members
   - Assign roles/permissions

3. **Set Up Email Notifications**
   - Update `server.js` email config
   - Add SendGrid or similar
   - Push to GitHub for automatic redeploy

4. **Monitor Application**
   - Railway dashboard: Check logs regularly
   - Vercel dashboard: Check deployment status
   - Both services: Enable email alerts

5. **Backup Database**
   - In Railway: Enable automatic backups
   - Or use pg_dump periodically

6. **Set Up Custom Domain**
   - Point DNS to Vercel
   - Get SSL certificate (automatic)
   - Test at https://ksarapp.sagafit.es

---

## DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│              Your Users                              │
└────────────────┬──────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼─────┐     ┌───▼────────┐
    │  Vercel  │     │  Vercel    │
    │ Frontend │     │   CDN      │
    │ (Static) │     │ (Global)   │
    └────┬─────┘     └───────────┘
         │
         │ API Calls
         │
    ┌────▼──────────────────────────┐
    │      Railway Backend           │
    │  (Node.js/Express)            │
    │  ksarapp-production-xxxx.up... │
    └────┬──────────────────────────┘
         │
         │ SQL Queries
         │
    ┌────▼──────────────────────────┐
    │    Railway PostgreSQL          │
    │      Database                  │
    │  (Automatic Backups)           │
    └───────────────────────────────┘
```

---

## USEFUL COMMANDS

### Local Development
```bash
# Start server locally
npm start

# Push changes to GitHub
git add .
git commit -m "Description of changes"
git push

# Check git status
git status

# View recent commits
git log --oneline -5
```

### Railway Commands (if using Railway CLI)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up

# View logs
railway logs

# Set environment variable
railway variables set DATABASE_URL "postgresql://..."
```

---

## REFERENCES

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Express.js Docs:** https://expressjs.com

---

## Summary

Your KsarApp deployment:
1. Code hosted on **GitHub** (version control)
2. Backend running on **Railway** (Node.js + PostgreSQL)
3. Frontend deployed on **Vercel** (Static files + CDN)
4. Auto-deployments enabled (push → automatic update)
5. Global HTTPS/SSL included
6. Custom domain ready (ksarapp.sagafit.es)

**Total setup time: 30-45 minutes**
**Monthly cost: Free-$10 (first month free)**
