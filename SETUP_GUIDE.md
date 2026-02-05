# KsarApp - Initial Setup Guide

## ✅ Setup Complete!

Your KsarApp Node.js + HTML/CSS/JavaScript web application has been successfully scaffolded!

## 📋 What Was Created

### Project Structure
```
KsarApp/
├── server.js                 # Express main server
├── package.json              # Node.js dependencies
├── .env                      # Environment variables (CONFIGURE THIS!)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── nginx.conf.example        # Nginx config for VPS
├── ecosystem.config.js       # PM2 config for VPS
├── README.md                 # Full documentation
│
├── public/                   # Frontend (static HTML/CSS/JS)
│   ├── index.html           # Login page
│   ├── dashboard.html       # Dashboard page
│   ├── css/
│   │   └── style.css        # Styles
│   └── js/
│       ├── api.js           # API fetch wrapper
│       └── auth.js          # Auth utilities
│
└── src/                      # Backend (Node.js + Express)
    ├── routes/
    │   ├── auth.js          # Login/register endpoints
    │   ├── cases.js         # Case management endpoints
    │   └── users.js         # User management endpoints
    ├── middleware/
    │   ├── auth.js          # JWT verification
    │   └── errorHandler.js  # Error handling
    └── db/
        ├── db.js            # Database connection
        ├── schema.sql       # Database schema
        └── setup.js         # Database initialization
```

### Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Aiven Cloud)
- **Authentication:** JWT + bcryptjs
- **Process Manager:** PM2 (for VPS)
- **Web Server:** Nginx (for VPS)

## 🚀 Next Steps

### 1. Configure Database Credentials (CRITICAL)

Edit `.env` file and update the `DATABASE_URL` with your actual Aiven PostgreSQL credentials:

```env
DATABASE_URL=postgres://avnadmin:YOUR_ACTUAL_PASSWORD@ksardb-cmk-25.d.aivencloud.com:17327/defaultdb?sslmode=require&uselibpqcompat=true
```

**Get your actual password from:**
1. Go to Aiven Console: https://console.aiven.io
2. Select your PostgreSQL database
3. Connection tab → "avnadmin" user → copy password
4. Replace `YOUR_ACTUAL_PASSWORD` in `.env`

### 2. Initialize Database

Once credentials are set, initialize the database schema and create a test admin user:

```bash
npm run setup-db
```

This will:
- Create tables: `users`, `cases`, `activity_logs`
- Create test admin user: `admin@ksarapp.com` / `admin123`
- Set up database triggers for auto-updating timestamps

### 3. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### 4. Access the Application

**Login Page:** http://localhost:3000

**Test Credentials (after setup-db):**
- Email: `admin@ksarapp.com`
- Password: `admin123`

**Dashboard:** http://localhost:3000/dashboard

## 🔌 API Endpoints

All endpoints require authentication (Bearer token) except login/register.

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/status` - Check API status

### Cases Management
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Users (Admin Only)
- `GET /api/users/profile` - Get your profile
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🧪 Testing API Locally

### Using cURL

```bash
# 1. Check API status
curl http://localhost:3000/api/auth/status

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ksarapp.com","password":"admin123"}'

# Response will include a token, copy it

# 3. Get cases (using token)
curl http://localhost:3000/api/cases \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Create case
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My First Case","description":"Test case","priority":2}'
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create new requests to test endpoints
3. For protected endpoints, add header: `Authorization: Bearer <token>`

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start dev server (with auto-reload)
npm run dev

# Start production server
npm start

# Initialize database
npm run setup-db
```

## 📝 Important Files

### Environment (.env)
- **DATABASE_URL** - PostgreSQL connection string
- **JWT_SECRET** - Secret for signing tokens
- **PORT** - Server port (default: 3000)
- **NODE_ENV** - Environment mode (development/production)

### Frontend (public/)
- **index.html** - Login and registration page
- **dashboard.html** - Main application page
- **css/style.css** - All styles
- **js/api.js** - Fetch wrapper for API calls
- **js/auth.js** - Authentication utilities

### Backend (src/)
- **routes/** - API endpoint definitions
- **middleware/** - Auth and error handling
- **db/** - Database connection and schema

## 🚨 Troubleshooting

### Database Connection Error
**Problem:** `password authentication failed`

**Solution:**
1. Double-check DATABASE_URL in .env
2. Make sure password is correct from Aiven
3. Verify network settings allow your IP in Aiven

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port in .env
PORT=3001
```

### CORS or Authentication Errors
**Problem:** Frontend can't communicate with API

**Solution:**
1. Check browser console for errors
2. Verify token is stored in localStorage
3. Check .env JWT_SECRET is set
4. Restart server after changes

## 📚 Documentation

Full documentation available in `README.md`:
- Complete API documentation
- Database schema details
- Production deployment guide
- PM2 and Nginx configuration
- SSL/HTTPS setup instructions

## 🎯 Before Production Deployment

- [ ] Test all API endpoints locally
- [ ] Verify JWT authentication works
- [ ] Check database backups are working
- [ ] Update JWT_SECRET in production .env
- [ ] Change admin password from default
- [ ] Set NODE_ENV=production in .env
- [ ] Review security headers in server.js
- [ ] Test SSL certificate (on VPS)
- [ ] Set up PM2 process manager
- [ ] Configure Nginx with provided template

## 📞 Support Resources

- [Express.js Docs](https://expressjs.com/)
- [Node.js PostgreSQL](https://node-postgres.com/)
- [JWT.io](https://jwt.io/)
- [Aiven Documentation](https://docs.aiven.io/)
- [PM2 Guide](https://pm2.keymetrics.io/)
- [Nginx Docs](https://nginx.org/en/docs/)

## 📅 Next Meeting

When database credentials are configured:
1. Run `npm run setup-db`
2. Run `npm run dev`
3. Test login at http://localhost:3000
4. Create and manage test cases
5. Verify frontend/backend integration

---

**Project Created:** February 5, 2026
**Status:** ✅ Ready for Development
