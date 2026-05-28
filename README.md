# 🌸 She Can Foundation — NGO Website

> A production-grade NGO website with a Node.js + Express backend and Neon PostgreSQL database. Built for real-world internship and portfolio use.

---

## 📁 Project Structure

```
she-can-foundation/
├── public/                  ← Frontend (served as static files)
│   ├── index.html           ← Main landing page
│   ├── admin.html           ← Admin submissions dashboard
│   ├── style.css            ← All styles (mobile-first)
│   └── script.js            ← Frontend JavaScript
├── server.js                ← Express backend (main entry point)
├── schema.sql               ← PostgreSQL table creation script
├── package.json             ← Node dependencies
├── .env.example             ← Template for environment variables
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18+ ([nodejs.org](https://nodejs.org))
- A free Neon PostgreSQL database ([neon.tech](https://neon.tech))

### Step 1 — Clone & Install

```bash
# Clone or download the project
cd she-can-foundation

# Install dependencies
npm install
```

### Step 2 — Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Open .env and fill in your values:
# - DATABASE_URL  ← from Neon console
# - ADMIN_SECRET  ← choose any strong password
# - PORT          ← default 3000
```

Your `.env` should look like:
```
PORT=3000
DATABASE_URL=postgresql://priya:password123@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
FRONTEND_URL=http://localhost:3000
ADMIN_SECRET=MySuperSecretKey2024
```

### Step 3 — Set Up Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) → **Sign Up (free)**
2. Create a new project
3. Click **SQL Editor** → paste the contents of `schema.sql` → **Run**
4. Copy your **Connection String** → paste as `DATABASE_URL` in `.env`

> ✅ The server also auto-creates the table on startup if it doesn't exist.

### Step 4 — Run the Server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Open: **http://localhost:3000**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/contact` | Submit contact/volunteer form |
| `GET`  | `/api/admin/submissions` | Fetch all submissions (requires `x-admin-secret` header) |
| `GET`  | `/api/admin/submissions?search=priya` | Search submissions |
| `GET`  | `/api/health` | Health check |

### Example: Submit a Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "9876543210",
    "city": "Pune",
    "interest": "Education",
    "message": "I want to volunteer!",
    "volunteer": true
  }'
```

### Example: Fetch Submissions

```bash
curl http://localhost:3000/api/admin/submissions \
  -H "x-admin-secret: MySuperSecretKey2024"
```

---

## 🚀 Deployment Guide

### Option A — Deploy Everything on Render (easiest)

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables (same as your `.env`):
   - `DATABASE_URL`
   - `ADMIN_SECRET`
   - `FRONTEND_URL` → set to your Render URL after deploy
6. Click **Deploy** ✅

### Option B — Frontend on Vercel + Backend on Render

#### Backend (Render)
1. Push just the backend to GitHub (or the whole repo)
2. Deploy on Render as above
3. Note your Render URL: `https://she-can-api.onrender.com`

#### Frontend (Vercel)
1. In `public/script.js`, change:
   ```js
   const API_BASE = "https://she-can-api.onrender.com";
   ```
2. Push `public/` folder to a GitHub repo
3. Go to [vercel.com](https://vercel.com) → **New Project**
4. Import repo → set **Root Directory** to `public` → Deploy ✅

#### Database (Neon)
- Neon is already cloud-hosted. Just use the connection string.
- Under **Project Settings → Compute**, make sure auto-suspend is enabled to stay on the free tier.

### Option C — Railway (one-click full stack)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Add variables in Railway's **Variables** tab
4. Railway auto-detects Node.js and deploys ✅

---

## 📱 Mobile Setup (Acode / Replit)

### Using Replit (Recommended for mobile)

1. Go to [replit.com](https://replit.com) → **Create Repl**
2. Choose **Node.js** template
3. Upload all files using the Files panel
4. In the **Shell**, run:
   ```bash
   npm install
   ```
5. Add your `.env` variables in **Secrets** (🔒 icon in sidebar):
   - Key: `DATABASE_URL`, Value: your Neon URL
   - Key: `ADMIN_SECRET`, Value: your secret
   - Key: `PORT`, Value: `3000`
6. Click the green **Run** button ▶️
7. Replit gives you a live URL automatically!

### Using Acode + Termux (Android)

1. Install **Termux** from F-Droid
2. In Termux:
   ```bash
   pkg update && pkg install nodejs
   # Navigate to your project folder
   npm install
   npm start
   ```
3. Use Acode to edit files
4. Access via `http://localhost:3000` in your browser

---

## 🗄️ Database Schema

```sql
CREATE TABLE submissions (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(20),
  city        VARCHAR(80),
  interest    VARCHAR(100),
  message     TEXT,
  volunteer   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔒 Security Notes

- Never commit `.env` to GitHub (it's in `.gitignore`)
- Change `ADMIN_SECRET` to a strong, random string
- In production, restrict CORS to your exact frontend URL
- For production, consider adding rate limiting (`express-rate-limit`)

---

## ✨ Features

- ✅ Mobile-first responsive design
- ✅ Glassmorphism UI with pink/purple theme
- ✅ Animated counter statistics
- ✅ Scroll-reveal animations
- ✅ Working contact/volunteer form
- ✅ Neon PostgreSQL backend
- ✅ Input validation (client + server)
- ✅ LocalStorage fallback if backend is down
- ✅ Admin panel with search + CSV export
- ✅ Toast notifications
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ Beginner-friendly commented code

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (custom properties), Vanilla JS |
| Backend | Node.js + Express.js |
| Database | Neon PostgreSQL (via `pg` driver) |
| Icons | Lucide Icons |
| Fonts | Playfair Display + DM Sans (Google Fonts) |
| Deployment | Render / Railway / Vercel + Neon |

---

## 📞 Support

Built with 💜 for the She Can Foundation.  
For questions, open an issue or email `hello@shecfoundation.org`.

---

*© 2025 She Can Foundation. Empowering women & girls since 2015.*
