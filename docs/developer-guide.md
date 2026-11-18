# EventSphere Management System — Developer & Technical Architecture Guide

**System Name:** EventSphere Management System  
**Audience:** Software Engineers, DevOps, System Administrators & Project Evaluators  
**Architecture:** MERN (MongoDB, Express.js, React 18, Node.js) + Socket.io  
**Version:** 1.0.0 (Production Release)  

---

## 1. Prerequisites & Tooling

Before setting up the repository locally, ensure the following runtimes and tools are installed:
- **Node.js:** v18.18+ or v20.x LTS (Recommended)
- **NPM:** v9.x or v10.x
- **MongoDB:** Community Server v7.x/v8.x (Running locally on `mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.
- **Git:** v2.30+

---

## 2. Quickstart Installation (< 5 Minutes)

### Step 1: Clone the Repository
```bash
git clone <REPOSITORY_URL>
cd "EventSphere Management System"
```

### Step 2: Configure Environment Variables

**Backend Configuration (`server/.env`):**
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/eventsphere
JWT_SECRET=eventsphere_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=dev_user@example.com
SMTP_PASS=dev_password
SMTP_FROM=noreply@eventsphere.com
```

**Frontend Configuration (`client/.env`):**
```ini
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 4: Seed Initial Exhibition Data & Test Accounts
```bash
cd ../server
npm run seed  # (Or node src/scripts/seed.js if seeder is configured)
```

### Step 5: Start Development Servers
Run the backend and frontend in two separate terminal windows:

**Terminal 1 (Backend API & Socket Engine):**
```bash
cd server
npm run dev
# Server boots on http://localhost:5000
```

**Terminal 2 (Vite Frontend):**
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 3. Pre-Configured Test Accounts

| Role | Email Address | Password | Permissions & Scope |
|---|---|---|---|
| **Administrator** | `admin@eventsphere.com` | `AdminPass123!` | Full system authority, floor plans, schedule, analytics |
| **Commercial Exhibitor** | `exhibitor@techcorp.com` | `ExhibitorPass123!` | Stall applications, booth selection, corporate showcase |
| **Attendee Delegate** | `attendee@delegates.com` | `AttendeePass123!` | Keynote registration, bookmarks, messaging, GDPR export |

---

## 4. Project Directory Structure

```
EventSphere Management System/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Modular Reusable UI Components
│   │   │   ├── common/         # Navbar, Footer, Modal, ProtectedRoute
│   │   │   ├── feedback/       # FeedbackModal & inquiry forms
│   │   │   ├── layout/         # DashboardLayout with dynamic role sidebars
│   │   │   ├── notifications/  # NotificationBell dropdown & badges
│   │   │   └── privacy/        # GdprModal for data portability & erasure
│   │   ├── context/            # SocketContext (real-time events) & AuthContext
│   │   ├── pages/              # Application View Pages
│   │   │   ├── admin/          # AdminDashboard, Expos, Booths, Schedule, Analytics
│   │   │   ├── attendee/       # AttendeeDashboard, MySchedule
│   │   │   ├── exhibitor/      # ExhibitorDashboard, Applications, Booths, Profile
│   │   │   ├── events/         # EventsList, ExpoDetail, Directory
│   │   │   ├── legal/          # PrivacyPolicy (/privacy), TermsOfService (/terms)
│   │   │   └── messages/       # ChatPage real-time networking hub
│   │   ├── services/           # Axios API client integrations
│   │   └── App.jsx             # React Router routing configuration
│   └── package.json
│
├── server/                     # Backend API & Socket Server (Node.js + Express)
│   ├── logs/                   # Structured Winston file rotation logs
│   │   ├── combined.log        # Complete HTTP request stream
│   │   └── error.log           # Application error exceptions with stack traces
│   ├── src/
│   │   ├── config/             # Database connection & environment loaders
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Auth, Upload, Validation, Error Handling
│   │   ├── models/             # Mongoose schemas (10 collections)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Notifications, Analytics, Reminders Cron, Email
│   │   ├── sockets/            # SocketManager with room isolation & presence
│   │   ├── utils/              # TokenManager, Validators, Helpers, Logger
│   │   ├── app.js              # Express app configuration & middleware pipeline
│   │   └── server.js           # HTTP server boot & background schedulers
│   ├── tests/                  # Jest & Supertest test suites (61 tests)
│   └── package.json
│
├── docs/                       # Official Engineering Documentation
│   ├── project-specification-srs.md
│   ├── nfr-report.md           # Security & performance audit sign-off
│   ├── test-cases.md           # 56-case QA matrix with bug resolution log
│   ├── user-guide.md           # Role-by-role manual with FAQs
│   └── developer-guide.md      # This document
│
├── scripts/                    # Database backup and restore utilities
│   ├── backup-db.bat           # Windows mongodump automated script
│   └── backup-db.sh            # Linux/macOS mongodump automated script
└── tasks/                      # Project Task Milestone Trackers (Tasks 01 to 11)
```

---

## 5. Automated Test Suite Execution

EventSphere maintains an exhaustive automated test suite written with **Jest** and **Supertest**, verifying business logic, capacity limits, hall conflicts, and security boundaries.

### Run All Tests
```bash
cd server
npm test
```
*Expected Result:* 7 test suites pass cleanly (**61 / 61 tests green**) in ~35 seconds.

### Run Code Coverage Report
```bash
cd server
npx jest --coverage --runInBand
```
*Coverage Metric:* Core validator modules, data models, and helper utilities maintain **80% to 100% statement and line coverage**.

---

## 6. How to Add a New Feature / Module

EventSphere adheres to the standard **Model-Controller-Route-Service** pattern. To add a new capability (e.g., *Sponsorship Packages*):

1. **Define Data Model (`server/src/models/Sponsor.js`):**
   ```javascript
   const mongoose = require('mongoose');
   const sponsorSchema = new mongoose.Schema({
     expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
     companyName: { type: String, required: true },
     tier: { type: String, enum: ['Platinum', 'Gold', 'Silver'], default: 'Silver' },
   }, { timestamps: true });
   module.exports = mongoose.model('Sponsor', sponsorSchema);
   ```

2. **Add Joi Validation (`server/src/utils/validators.js`):**
   ```javascript
   const sponsorValidator = Joi.object({
     expoId: Joi.string().hex().length(24).required(),
     companyName: Joi.string().trim().required(),
     tier: Joi.string().valid('Platinum', 'Gold', 'Silver').default('Silver'),
   });
   ```

3. **Create Controller (`server/src/controllers/sponsorController.js`):**
   ```javascript
   const Sponsor = require('../models/Sponsor');
   const { asyncHandler, sendFormattedResponse } = require('../utils/helpers');

   const createSponsor = asyncHandler(async (req, res) => {
     const sponsor = await Sponsor.create(req.body);
     return sendFormattedResponse(res, 201, true, { sponsor }, 'Sponsor added.');
   });
   ```

4. **Define Route (`server/src/routes/sponsorRoutes.js`):**
   ```javascript
   const router = require('express').Router();
   const { protect, authorize } = require('../middleware/authMiddleware');
   const validate = require('../middleware/validate');
   const { sponsorValidator } = require('../utils/validators');

   router.post('/', protect, authorize('admin'), validate(sponsorValidator), createSponsor);
   module.exports = router;
   ```

5. **Mount Route (`server/src/app.js`):**
   ```javascript
   const sponsorRouter = require('./routes/sponsorRoutes');
   app.use('/api/sponsors', sponsorRouter);
   ```

---

## 7. Production Deployment Guidelines

### 7.1 Docker Architecture
Build production images using lightweight Alpine Linux base:
```dockerfile
# Multi-stage production build example
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### 7.2 Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name eventsphere.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5173; # or static build root
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

### 7.3 PM2 Horizontal Process Clustering
```bash
pm2 start src/server.js -i max --name "eventsphere-api"
pm2 save
pm2 startup
```
