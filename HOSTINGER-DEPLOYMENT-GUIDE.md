# KsarApp Deployment Guide - Hostinger

## IMPORTANT: Prerequisites

Before uploading to Hostinger, ensure you have:
1. **Hostinger Account** with Node.js support enabled
2. **Database** - PostgreSQL set up (Hostinger or external)
3. **FTP/SSH Access** to your Hostinger account
4. **Domain** - sagafit.es with subdomain ksarapp configured

---

## Step 1: Prepare Files on Your Local Machine

### 1.1 Create a production build folder
```bash
cd c:\Users\alabe\OneDrive\Escritorio\KsarApp
mkdir KsarApp-production
```

### 1.2 Copy essential files only:
```
KsarApp-production/
├── server.js
├── package.json
├── package-lock.json
├── .env (filled with production values)
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── people.html
│   ├── history.html
│   ├── css/
│   ├── js/
│   └── images/
└── src/
    ├── db/
    ├── middleware/
    ├── routes/
    └── utils/
```

DON'T include:
- node_modules/ (will be installed on server)
- .git/ (not needed)
- translate-aid-types.js (development only)
- src/db/schema.sql (keep separate)

---

## Step 2: Set Up Hostinger for Node.js

### 2.1 Log into Hostinger Control Panel
- Go to https://www.hostinger.es
- Login to your account
- Find "Hosting" or "Web Hosting"

### 2.2 Set Up Node.js App
- Go to **Manage** → **Node.js Applications**
- Click **+ Create Node.js Application**
- Configure:
  - **Application Name:** ksarapp
  - **Node Version:** 18 or higher
  - **Application Root:** public_html/ksarapp
  - **Application Startup File:** server.js
  - **Port:** 3000

### 2.3 Set Up Database
- Go to **Databases** → **PostgreSQL**
- Create new database or connect to existing one
- Save credentials:
  - Host: (from Hostinger)
  - Port: 5432
  - Database name
  - Username
  - Password

---

## Step 3: Upload Files via Hostinger File Manager

### 3.1 Create Application Folder
1. Open **File Manager**
2. Navigate to `public_html/`
3. Right-click → **Create Folder** → Name it `ksarapp`

### 3.2 Upload Files
1. Open the `ksarapp` folder
2. Upload files:
   - Upload `server.js`
   - Upload `package.json`
   - Upload `.env` (with production credentials)
   - Create folder `public` → Upload all files from local public/
   - Create folder `src` → Upload all files from local src/

### 3.3 Install Dependencies
Via SSH Terminal:
```bash
cd ~/public_html/ksarapp
npm install
```

Or via Hostinger's Terminal (if available):
- Go to Terminal in File Manager
- Run: `npm install`

---

## Step 4: Upload Database Schema

### 4.1 Via PostgreSQL Admin
1. Go to Hostinger **Databases**
2. Click on your database
3. Open **phpPgAdmin** or **pgAdmin**
4. Copy content of `src/db/schema.sql`
5. Paste into Query window and Execute

### 4.2 Or via SSH:
```bash
psql -h hostname -U username -d database_name < src/db/schema.sql
```

---

## Step 5: Configure Environment Variables

### 5.1 Create .env file on Server
Via File Manager:
1. Right-click in `public_html/ksarapp/`
2. **Create File** → Name: `.env`
3. Add contents:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
JWT_SECRET=your-very-secure-random-secret-key-here-min-32-chars
```

### 5.2 Set Permissions
```bash
chmod 600 .env
```

---

## Step 6: Configure Domain Subdomain

### 6.1 In Hostinger Control Panel
1. Go to **Domains** → **sagafit.es**
2. Go to **DNS Records** or **Subdomains**
3. Create new subdomain:
   - Name: `ksarapp`
   - Points to: `your-hostinger-ip` or `public_html/ksarapp`
   - SSL: Enable

### 6.2 Wait for DNS Propagation (5-15 minutes)

---

## Step 7: Start the Application

### 7.1 Via Hostinger Control Panel
1. Go to **Node.js Applications**
2. Find `ksarapp`
3. Click **Start**

### 7.2 Via SSH Terminal
```bash
cd ~/public_html/ksarapp
npm start
```

---

## Step 8: Verify Installation

### 8.1 Test the application
1. Open browser
2. Go to: `https://ksarapp.sagafit.es`
3. You should see the login page

### 8.2 Check Console for Errors
- Go to **Node.js Applications** → **ksarapp** → **Logs**
- Check for any error messages

### 8.3 Test Login
- Email: `admin@ksarapp.com`
- Password: `admin123`

---

## Troubleshooting

### App won't start
- Check `/logs` for error messages
- Verify `.env` file exists and has correct values
- Run `npm install` again
- Check Node.js version

### Database connection fails
- Verify DATABASE_URL is correct
- Check PostgreSQL credentials
- Ensure database exists and schema is loaded
- Test connection from SSH: `psql -h host -U user -d database`

### Domain not resolving
- Wait for DNS propagation (15-30 minutes)
- Flush browser cache (Ctrl+Shift+Del)
- Try accessing via IP address directly

### Permission denied errors
```bash
chmod 755 public_html/ksarapp
chmod 600 .env
chmod 644 package.json
chmod 755 src src/routes src/db src/middleware
```

---

## Important Security Notes

1. **Never commit .env file** to git
2. **Change default admin password** after first login
3. **Enable HTTPS** (SSL certificate)
4. **Set strong JWT_SECRET** - at least 32 random characters
5. **Backup database regularly**
6. **Keep Node.js updated**

---

## File Checklist

Before uploading, ensure you have:
- ✅ server.js
- ✅ package.json
- ✅ package-lock.json
- ✅ .env.production (renamed to .env on server)
- ✅ public/ folder with all HTML, CSS, JS, images
- ✅ src/ folder with all backend code
- ✅ Database schema SQL file

## Success Indicators

- ✅ App accessible at https://ksarapp.sagafit.es
- ✅ Login page loads without CSS/JS errors
- ✅ Can login with admin credentials
- ✅ Dashboard loads with data
- ✅ No console errors in browser
- ✅ All API calls return 200/201 status codes
