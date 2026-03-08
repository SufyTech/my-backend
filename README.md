# CodeMind AI — Backend 🔧

> Node.js + Express REST API powering CodeMind AI

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)](https://github.com/SufyTech/my-frontend)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blueviolet)](https://codemind-ai-eight.vercel.app/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)]()

## 🔗 Live Application
**[codemind-ai-eight.vercel.app](https://codemind-ai-eight.vercel.app/)**

---

## 📌 What is this?

This is the backend server for **CodeMind AI** — an AI-powered code review platform. It handles:
- REST API endpoints for code review requests
- Google OAuth 2.0 authentication via Passport.js
- Session management
- CORS configuration for Vercel-deployed frontend

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| Passport.js | Google OAuth 2.0 authentication |
| express-session | Session management |
| CORS | Cross-origin request handling |

---

## 📁 Project Structure
```
my-backend/
├── src/               # Core logic modules
├── server.js          # Main Express server entry point
├── test-env.js        # Environment variable validation
├── package.json       # Dependencies
└── .gitignore
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js installed
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com/))

### Setup
```bash
git clone https://github.com/SufyTech/my-backend
cd my-backend
npm install
```

Create a `.env` file in the root:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_session_secret
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Run the server:
```bash
node server.js
```

Server runs at `http://localhost:3000`

---

## 🔐 Authentication Flow
```
User clicks "Login with Google"
        ↓
Frontend redirects to /auth/google
        ↓
Passport.js handles OAuth handshake
        ↓
Google verifies credentials
        ↓
Callback to /auth/google/callback
        ↓
Session created, user redirected to frontend
        ↓
Frontend receives authenticated session
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/auth/google` | Initiates Google OAuth login |
| GET | `/auth/google/callback` | OAuth callback handler |
| GET | `/auth/logout` | Logs out current user |
| GET | `/auth/user` | Returns current session user |
| POST | `/api/review` | Submits code for AI review |

---

## 🔑 Key Technical Challenges Solved

**CORS in Production**
The hardest challenge was configuring CORS correctly between the Vercel-deployed frontend and this Express backend. In development, everything worked fine — in production, OAuth callbacks were being blocked.

Fixed by:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Passport.js Session Persistence**
Sessions weren't persisting after OAuth redirect in production. Fixed by setting secure cookie options correctly for the deployed environment:
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));
```

---

## 🔗 Related Repository

- **Frontend:** [github.com/SufyTech/my-frontend](https://github.com/SufyTech/my-frontend)

---

## 👨‍💻 Built By

**Sufiyan Khan** — B.Tech CS 2025
- 📧 suzkhan135@gmail.com
- 🐙 [github.com/SufyTech](https://github.com/SufyTech)
- 🌐 [codemind-ai-eight.vercel.app](https://codemind-ai-eight.vercel.app/)

---

⭐ Star this repo if you found it useful!
