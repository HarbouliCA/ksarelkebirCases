# Ksar El Kebir - Case Management System

A lightweight Node.js + HTML/CSS/JavaScript web application for case management, running with Express backend and PostgreSQL database on Aiven Cloud.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL database (Aiven)
- Environment variables configured

### Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database:**
   ```bash
   npm run setup-db
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:3000`

### Default Credentials (After Setup)
- **Email:** admin@ksarapp.com
- **Password:** admin123

## 📁 Project Structure

```
ksarapp/
├── public/                    # Frontend (served as static files)
│   ├── index.html            # Login page
│   ├── dashboard.html        # Main dashboard
│   ├── css/
│   │   └── style.css         # Global styles
│   └── js/
│       ├── api.js            # API helper functions
│       └── auth.js           # Authentication utilities
│
├── src/                       # Backend (Node.js)
│   ├── routes/               # API endpoint definitions
│   │   ├── auth.js          # Login/register endpoints
│   │   ├── cases.js         # Case management endpoints
│   │   └── users.js         # User management endpoints
│   │
│   ├── middleware/           # Express middleware
│   │   ├── auth.js          # JWT verification
│   │   └── errorHandler.js  # Error handling
│   │
│   └── db/                   # Database layer
│       ├── db.js            # Database connection
│       ├── schema.sql        # Database schema
│       └── setup.js          # Schema initialization
│
├── server.js                 # Main Express application
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .env                      # Actual environment (git-ignored)
├── nginx.conf.example        # Nginx configuration template
├── ecosystem.config.js       # PM2 configuration
└── .gitignore               # Git ignore rules
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/status` - Check API status

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get specific case
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔐 Authentication

- Uses JWT tokens stored in `localStorage`
- Tokens expire after 7 days
- Passwords hashed with bcryptjs
- Protected routes require valid Bearer token

**Request with token:**
```javascript
Authorization: Bearer <token>
```

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL driver
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin requests
- **helmet** - Security headers
- **dotenv** - Environment variables
- **morgan** - Request logging
- **nodemon** - Development auto-reload

## 🚀 Deployment (Hostinger VPS)

### 1. Upload to VPS
```bash
# From local machine
scp -r . user@your-vps-ip:/var/www/api/ksarapp
```

### 2. Install PM2 (Process Manager)
```bash
npm install -g pm2
cd /var/www/api/ksarapp
npm install
npm run setup-db  # Initialize database
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Configure Nginx
```bash
# Copy nginx config
sudo cp nginx.conf.example /etc/nginx/sites-available/sagafit

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/sagafit /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d sagafit.es -d www.sagafit.es

# Update nginx.conf with SSL paths
# Uncomment HTTPS section in nginx.conf
```

### 5. Verify Deployment
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs ksarapp

# Test API
curl http://localhost:3000/api/health
```

## 🔧 Development Tips

### Run in Watch Mode
```bash
npm run dev
```

### View Logs
```bash
# Production with PM2
pm2 logs ksarapp

# Development
npm run dev
```

### Database Queries
Edit `/src/db/schema.sql` to modify database schema, then:
```bash
npm run setup-db
```

### Environment Variables
All sensitive data in `.env` (never commit to Git):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing tokens
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode

## 📝 Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password (bcryptjs)
- `name` - User full name
- `role` - admin | volunteer | guest
- `is_active` - Account status
- `created_at` / `updated_at` - Timestamps

### Cases Table
- `id` - Primary key
- `title` - Case title
- `description` - Case details
- `status` - open | in_progress | closed | archived
- `priority` - 1 (low) to 3 (high)
- `assigned_to` - User ID (foreign key)
- `created_by` - User ID (foreign key)
- `created_at` / `updated_at` - Timestamps

### Activity Logs Table
- Tracks all user actions for audit trail

## 🐛 Troubleshooting

### Database Connection Error
```
Check .env DATABASE_URL is correct
Verify Aiven PostgreSQL network settings allow your VPS IP
Test connection: psql "your-database-url"
```

### JWT Token Expired
- Tokens expire after 7 days
- User must login again to get new token
- Modify expiry in `/src/routes/auth.js`

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### CORS Errors
- Ensure frontend and backend are on same domain (after nginx proxy)
- Check CORS middleware in `server.js`

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js PostgreSQL](https://node-postgres.com/)
- [JWT.io](https://jwt.io/)
- [Aiven PostgreSQL](https://aiven.io/postgresql)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)

## 📄 License

ISC

---

**Last Updated:** 2026-02-05
