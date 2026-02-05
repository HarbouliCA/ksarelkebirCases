# Hostinger File Manager - Click-by-Click Upload Guide

## QUICK REFERENCE: File Structure to Upload

```
public_html/
└── ksarapp/                    ← Create this folder
    ├── server.js              ← Copy from local
    ├── package.json           ← Copy from local
    ├── .env                   ← Create NEW with production values
    ├── public/                ← Create folder, copy all files
    │   ├── index.html
    │   ├── dashboard.html
    │   ├── people.html
    │   ├── history.html
    │   ├── css/
    │   ├── js/
    │   └── images/
    └── src/                   ← Create folder, copy all files
        ├── db/
        ├── routes/
        ├── middleware/
        └── utils/

```

---

## CLICK-BY-CLICK GUIDE

### STEP 1: Create Main Application Folder

1. **Open File Manager in Hostinger**
   - Login to Hostinger dashboard
   - Click "Manage" on your hosting account
   - Click "File Manager"

2. **Navigate to public_html**
   - You should see a folder list
   - Find and double-click `public_html` folder

3. **Create "ksarapp" folder**
   - Right-click in the empty space
   - Select "Create Folder"
   - Type name: `ksarapp`
   - Press Enter or click Create
   - Double-click to open the new folder

---

### STEP 2: Upload server.js and package.json

1. **Upload server.js**
   - Right-click in ksarapp folder
   - Click "Upload Files" or "Upload"
   - Select `server.js` from your local KsarApp folder
   - Click Open or Upload
   - Wait for upload to complete (✓ checkmark appears)

2. **Upload package.json**
   - Repeat same steps for `package.json`
   - Wait for upload to complete

3. **Upload package-lock.json**
   - Repeat same steps for `package-lock.json`

---

### STEP 3: Create and Upload .env File

1. **Create .env file**
   - Right-click in ksarapp folder
   - Select "Create File"
   - Type: `.env`
   - Click Create

2. **Edit .env file**
   - Right-click on `.env` file
   - Select "Edit" or double-click
   - Paste this content:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://username:password@hostname:5432/database_name
   JWT_SECRET=your-very-secure-random-secret-key-minimum-32-characters-long
   ```
   - Replace values with YOUR actual database credentials
   - Click "Save" or "Save Changes"

3. **Set Permissions**
   - Right-click on `.env` file
   - Select "Permissions"
   - Set to: `600` (read/write for owner only)
   - Click Save

---

### STEP 4: Create and Upload "public" Folder

1. **Create public folder**
   - Right-click in ksarapp folder
   - Select "Create Folder"
   - Type: `public`
   - Press Enter
   - Double-click to open it

2. **Upload HTML files**
   - Right-click in public folder
   - Click "Upload Files"
   - Select these files from your local public/ folder:
     - `index.html`
     - `dashboard.html`
     - `people.html`
     - `history.html`
   - Click Upload
   - Wait for all to complete

3. **Create and upload CSS subfolder**
   - Right-click in public folder → Create Folder → name: `css`
   - Double-click css folder
   - Upload all files from local public/css/:
     - `style.css`
   - Wait for completion

4. **Create and upload JS subfolder**
   - Go back to public folder (click back button)
   - Right-click → Create Folder → name: `js`
   - Double-click js folder
   - Upload all files from local public/js/:
     - `api.js`
     - `auth.js`
   - Wait for completion

5. **Create and upload Images subfolder** (optional if you have images)
   - Go back to public folder
   - Right-click → Create Folder → name: `images`
   - Double-click images folder
   - Upload any image files
   - Wait for completion

---

### STEP 5: Create and Upload "src" Folder

1. **Go back to ksarapp folder**
   - Click the back button or navigate up

2. **Create src folder**
   - Right-click in ksarapp folder
   - Select "Create Folder"
   - Type: `src`
   - Press Enter
   - Double-click to open it

3. **Create subfolders inside src**
   - Right-click → Create Folder → name: `db`
   - Right-click → Create Folder → name: `routes`
   - Right-click → Create Folder → name: `middleware`
   - Right-click → Create Folder → name: `utils`

4. **Upload database files (db folder)**
   - Double-click `db` folder
   - Upload from local src/db/:
     - `db.js`
     - `schema.sql`
   - Wait for completion
   - Click back

5. **Upload routes files (routes folder)**
   - Double-click `routes` folder
   - Upload all files from local src/routes/:
     - `auth.js`
     - `cases.js`
     - `users.js`
     - `people.js`
     - `aid-types.js`
     - `notes.js`
     - `case-history.js`
     - `case-aid-types.js`
   - Wait for completion
   - Click back

6. **Upload middleware files (middleware folder)**
   - Double-click `middleware` folder
   - Upload from local src/middleware/:
     - `auth.js`
     - `errorHandler.js`
   - Wait for completion
   - Click back

7. **Upload utils files (utils folder)** (if any)
   - Double-click `utils` folder
   - Upload any files from local src/utils/ if they exist
   - Click back twice to go to ksarapp folder

---

### STEP 6: Verify All Files Uploaded

Your ksarapp folder should now look like:

```
✓ server.js
✓ package.json
✓ package-lock.json
✓ .env
✓ public/
  ✓ index.html
  ✓ dashboard.html
  ✓ people.html
  ✓ history.html
  ✓ css/
    ✓ style.css
  ✓ js/
    ✓ api.js
    ✓ auth.js
  ✓ images/
✓ src/
  ✓ db/
    ✓ db.js
    ✓ schema.sql
  ✓ routes/
    ✓ auth.js
    ✓ cases.js
    ✓ etc...
  ✓ middleware/
    ✓ auth.js
    ✓ errorHandler.js
  ✓ utils/
```

---

### STEP 7: Install Dependencies via SSH/Terminal

1. **Open Terminal** (in File Manager)
   - Look for "Terminal" button at top
   - Or go to Hosting → Terminal

2. **Navigate to app folder**
   ```bash
   cd public_html/ksarapp
   ```

3. **Install Node modules**
   ```bash
   npm install
   ```
   - Wait until you see: `added X packages in Y seconds`
   - This creates node_modules folder

4. **Verify installation**
   ```bash
   npm list express
   ```
   - Should show express version

---

### STEP 8: Set Up Node.js Application in Hostinger

1. **Go to Node.js Applications**
   - In Hostinger dashboard
   - Look for "Node.js Applications" or "Applications"

2. **Create New Application**
   - Click "+ Create Node.js Application"
   - Fill form:
     - **Application Name:** ksarapp
     - **Node.js Version:** 18.x or 20.x
     - **Application Root:** public_html/ksarapp
     - **Application Startup File:** server.js
     - **Application Port:** 3000
   - Click Create

3. **Wait for Configuration**
   - Status should change to "Running"
   - This may take 2-5 minutes

---

### STEP 9: Configure SSL & Domain

1. **Create Subdomain**
   - Go to Domains section
   - Click on sagafit.es
   - Click "Subdomains"
   - Click "Create Subdomain"
   - Fill:
     - **Name:** ksarapp
     - **Folder:** public_html/ksarapp
   - Click Create

2. **Enable SSL**
   - Go to SSL Certificates
   - Find ksarapp.sagafit.es
   - Enable/Install Free SSL certificate
   - Wait for it to activate (few minutes)

---

### STEP 10: Test the Application

1. **Wait 5-10 minutes** for DNS to propagate

2. **Open Browser**
   - Go to: `https://ksarapp.sagafit.es`
   - Should see login page

3. **Test Login**
   - Email: `admin@ksarapp.com`
   - Password: `admin123`
   - Click Login
   - Should see Dashboard

4. **Check Console for Errors**
   - In Hostinger dashboard
   - Node.js Applications → ksarapp → Logs
   - Should show "Server running at http://localhost:3000"
   - Should show "Database connected"

---

## COMMON ISSUES & FIXES

### 1. "Cannot find module 'express'"
**Fix:**
```bash
cd public_html/ksarapp
npm install
```

### 2. "Database connection failed"
**Fix:**
- Go back to Step 3
- Edit `.env` file
- Verify DATABASE_URL is correct
- Format should be: `postgresql://user:password@host:5432/dbname`

### 3. "Application won't start / Shows error 502"
**Fix:**
- Check Logs in Node.js Applications
- Verify all files uploaded correctly
- Run `npm install` again
- Restart application

### 4. "Port 3000 already in use"
**Fix:**
- In Node.js Applications
- Change Port to different number (3001, 3002, etc.)
- Restart application

### 5. "Cannot upload .env file"
**Fix:**
- Create empty file first
- Then edit it and paste content
- Or use SSH to create: `touch .env`

---

## SUCCESS CHECKLIST

- ✅ All files uploaded to public_html/ksarapp/
- ✅ .env file created with database credentials
- ✅ npm install completed successfully
- ✅ Node.js Application created and running
- ✅ Subdomain ksarapp.sagafit.es created
- ✅ SSL certificate enabled
- ✅ Application accessible at https://ksarapp.sagafit.es
- ✅ Login works with admin credentials
- ✅ Dashboard displays without errors
- ✅ No console errors (F12 to check)

---

## Next Steps After Successful Deployment

1. Change default admin password
2. Create new admin account for production
3. Configure email notifications (if available)
4. Set up regular database backups
5. Monitor application logs regularly
6. Update to latest Node.js version when available

---

**Questions? Check Hostinger's documentation:**
- https://support.hostinger.com/en/articles/4291548-how-to-deploy-a-nodejs-application
- https://support.hostinger.com/en/articles/4291549-postgresql-databases-in-shared-hosting
