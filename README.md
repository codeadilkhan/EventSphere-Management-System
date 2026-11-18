# 🎪 EventSphere — Enterprise Trade Expo & Event Management Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933.svg?logo=node.js)
![React](https://img.shields.io/badge/React-18_Vite-61DAFB.svg?logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7_Realtime-010101.svg?logo=socket.io)
![Jest Tests](https://img.shields.io/badge/Jest_Tests-61%2F61_Passing-brightgreen.svg)
![Security](https://img.shields.io/badge/Security-Helmet_|_RateLimit_|_GDPR-blue.svg)

> **Aptech eProject Submission**  
> EventSphere is a full-stack, enterprise-grade B2B trade exhibition and conference lifecycle management system. Designed for organizers, exhibitors, and attendees, EventSphere unifies interactive floor plan booth booking, exhibitor onboarding, dynamic keynote scheduling, bidirectional real-time communication, automated reminder notifications, visual business intelligence analytics, and GDPR compliance into a cohesive responsive web application.

---

## 📑 Complete Project Documentation Index

All primary project artifacts, specifications, and user manuals are available in the [`docs/`](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs) folder:

| Document | Description | Direct File Link |
| :--- | :--- | :--- |
| **Project Specification (SRS)** | Problem statement, objectives, functional & NFR requirements, 7 Mermaid system diagrams (Architecture, ERD, Schema, DFD 0/1, Sequence), 10 database collection schemas, and REST API specification. | [project-specification-srs.md](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/project-specification-srs.md) |
| **Official User Operations Guide** | Step-by-step role guides for Admins, Exhibitors, and Attendees, GDPR data rights walkthrough, FAQs, and common troubleshooting steps. | [user-guide.md](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/user-guide.md) |
| **Developer & Architecture Guide** | Quickstart instructions (< 5 minutes), environment configuration, seeding, test execution, folder structure, module creation, and Docker/Nginx/PM2 deployment guides. | [developer-guide.md](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/developer-guide.md) |
| **QA Test Plan & 56-Case Matrix** | Complete test strategy, 56 executable test cases across 10 functional modules, defect resolution log (BUG-01 to BUG-06), and coverage metrics. | [test-cases.md](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/test-cases.md) |
| **NFR & Security Hardening Report** | OWASP Top 10 defenses, Helmet headers, Mongo injection prevention, XSS filter, tiered rate limits, upload double-whitelisting, GDPR Article 17/20, Winston logging, and load test results. | [nfr-report.md](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/nfr-report.md) |
| **Video Demonstration Script** | Scene-by-scene 8–10 minute video recording script with screen action cues, spoken narration, and feature demonstration flows. | [video-demo-script.md](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/video-demo-script.md) |
| **Postman API Collection** | Importable JSON collection containing endpoints, headers, and pre-configured JSON payloads. | [EventSphere_Auth_API.postman_collection.json](file:///d:/Eproject%20Sir%20Abdullah/EventSphere%20Management%20System/docs/EventSphere_Auth_API.postman_collection.json) |

---

## 🚀 Key Feature Highlights

### 1. 🛡️ Authentication & Role-Based Access Control (RBAC)
- Multi-role authorization (`admin`, `exhibitor`, `attendee`) secured by HMAC-SHA256 JWT tokens.
- Secure HTTP cookies and Bearer authorization headers with password hashing via `bcryptjs` (salt factor 12).
- Automatic login session persistence and role-guarded route redirection.

### 2. 🗺️ Interactive Floor Plan & Dynamic Booth Booking
- Matrix grid visualizer displaying real-time booth statuses (`available`, `reserved`, `booked`, `maintenance`).
- Tier-based pricing and dimensional layout calculation (Standard, Premium, Corner, Island).
- Atomic concurrency protection preventing double-booking race conditions via MongoDB `findOneAndUpdate`.

### 3. 🏢 Exhibitor Onboarding & Digital Showcase
- Multi-step application submission workflow with document upload and admin approval/rejection auditing.
- Exhibitor company profile customizer: logo, banner, social links, brochures, catalog downloads, and product gallery.
- Direct 1-on-1 attendee lead messaging and inquiry tracking.

### 4. 📅 Conference Schedule & Keynote Reservation
- Multi-track, multi-day conference timetable filterable by track, date, speaker, and keyword.
- Atomic seat booking reservation engine with real-time seat decrementing and waiting-list protection.
- Personal schedule builder with conflict detection (preventing overlapping session selections).

### 5. 💬 Real-Time Messaging & Presence
- Full-duplex Socket.io communication engine partitioned into secure, authenticated rooms.
- 1-on-1 live chat between attendees and exhibitors with live typing indicators and instant unread count badges.
- Live administrative notification broadcast stream.

### 6. ⏰ Background Notifications & Smart Reminders
- System notification bell with live counter and read/unread toggle.
- Background cron runner scanning upcoming keynote sessions and sending atomic, exactly-once reminder notifications.
- Integrated ticketing support and feedback resolution desk with status triage (`open`, `in-progress`, `resolved`).

### 7. 📊 Visual Analytics & Reporting Suite
- Executive KPI cards: total attendees, active expos, revenue generated, and space utilization rate.
- Recharts visualizations: Attendee Daily Engagement Area Chart, Booth Tier Footfall Bar Chart, Session Registration vs Capacity Comparison, and Category Distribution Pie Chart.
- One-click CSV audit report generation.

### 8. 🔒 Security & Privacy (GDPR Compliance)
- HTTP security hardening via `helmet`, `express-mongo-sanitize`, recursive XSS sanitization, and `express-rate-limit`.
- Double-whitelist file upload validation verifying both MIME type and file extension with executable extension blocking.
- GDPR Data Portability (Article 20): complete user account data export in downloadable JSON.
- GDPR Right to Erasure (Article 17): atomic cascading account deletion releasing booked booths and keynote seats upon password confirmation.

---

## ⚡ Quickstart Guide (Run in < 5 Minutes)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [MongoDB](https://www.mongodb.com/) v6.0+ running locally on port `27017` (or a MongoDB Atlas connection string)
- Git command line tool

### Step 1: Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/eventsphere.git
cd "EventSphere Management System"

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Verify or copy the environment configuration files:

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/eventsphere
JWT_SECRET=eventsphere_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Seed Database with Demo Data
Populate MongoDB with realistic sample data (users, expos, booths, sessions, exhibitor profiles, messages, feedback):
```bash
# From the project root
npm run seed
# Or directly inside server directory:
node seed/seed.js
```

### Step 4: Start Development Servers
Open two terminal windows or run concurrently:

**Terminal 1 — Backend API Server:**
```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# Vite client will start on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Default Test Accounts

After running the seeder, the following pre-configured credentials are ready for evaluation:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@eventsphere.com` | `Admin@123456` | Full platform control, floor plan builder, exhibitor approval, schedule management, analytics, user administration. |
| **Exhibitor** | `exhibitor@techcorp.com` | `Exhibitor@123` | Booth reservation, company profile setup, product showcase upload, attendee inquiry chat, lead management. |
| **Attendee** | `john.doe@example.com` | `Attendee@123` | Expo browsing, interactive floor plan navigation, keynote seat reservation, personal agenda, 1-on-1 chat, GDPR controls. |

---

## 🧪 Automated Testing & Quality Assurance

EventSphere features an automated Jest test suite covering core authentication, RBAC, expo lifecycle, booth concurrency, attendee scheduling, real-time messaging, notifications, analytics aggregation, and security validation:

```bash
# Run all backend automated tests
cd server
npm test

# Run tests with code coverage report
npx jest --coverage
```

### Test Suite Execution Summary
```text
PASS  tests/task02_auth.test.js
PASS  tests/task03_expo_booth.test.js
PASS  tests/task05_schedule_attendee.test.js
PASS  tests/task07_notifications_feedback.test.js
PASS  tests/task08_analytics.test.js
PASS  tests/task09_nfr_security.test.js
PASS  tests/task10_auth_core_unit.test.js
PASS  tests/task10_expo_booth_application.test.js

Test Suites: 7 passed, 7 total
Tests:       61 passed, 61 total
Snapshots:   0 total
Time:        ~30s
Ran all test suites.
```

---

## 📁 Repository Directory Structure

```text
EventSphere Management System/
├── client/                     # Vite + React 18 Single-Page Application
│   ├── src/
│   │   ├── api/                # Axios API service instances and interceptors
│   │   ├── assets/             # Brand logos, placeholder graphics, iconography
│   │   ├── components/         # Reusable UI modules (modals, tables, floorplan, navbar)
│   │   ├── context/            # React Contexts (AuthContext, SocketContext)
│   │   ├── layouts/            # DashboardLayout, AuthLayout, PublicLayout
│   │   ├── pages/              # Role-partitioned views (Admin, Exhibitor, Attendee, Public)
│   │   ├── App.jsx             # React Router v6 tree with ProtectedRoute wrappers
│   │   └── main.jsx            # Application entrypoint
│   └── package.json            # Client dependencies and build scripts
├── server/                     # Node.js + Express REST API & Socket.io Server
│   ├── logs/                   # Winston rotation log files (error.log, combined.log)
│   ├── src/
│   │   ├── config/             # Database connection, Winston logger, Socket.io setup
│   │   ├── controllers/        # Express request handling controllers
│   │   ├── middleware/         # Auth JWT, RBAC guards, Multer upload, Joi validators
│   │   ├── models/             # Mongoose schemas (10 collections)
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── services/           # Business logic (notificationCron, analyticsService)
│   │   └── index.js            # Express app initialization and HTTP server start
│   ├── tests/                  # Jest & Supertest automated integration/unit tests
│   └── package.json            # Server dependencies and test scripts
├── docs/                       # Project documentation & deliverables
│   ├── project-specification-srs.md  # Comprehensive SRS specification
│   ├── user-guide.md                 # Official User Operations Manual
│   ├── developer-guide.md            # Technical & Architecture Manual
│   ├── test-cases.md                 # 56 QA test cases & defect register
│   ├── nfr-report.md                 # Non-functional security & load report
│   ├── video-demo-script.md          # 8-10 min video recording script
│   └── EventSphere_Auth_API.postman_collection.json # API endpoints
├── scripts/                    # Maintenance, load testing & DB backup scripts
│   ├── backup-db.bat / .sh     # Automated mongodump backup scripts
│   └── load-test.js            # High-concurrency performance benchmark script
├── seed/                       # Database seeder scripts and mock fixtures
│   └── seed.js                 # Complete idempotent database population script
└── tasks/                      # 11-milestone implementation plan & tracking records
```

---

## 👥 Aptech eProject Submission Details

- **Project Title:** EventSphere Trade Expo & Event Management System
- **Technology Stack:** MongoDB, Express.js, React (Vite), Node.js (MERN)
- **Primary Domain:** Event Management, Exhibition Logistics, Real-time B2B Scheduling
- **Evaluation Status:** Complete — All 11 Milestone Phases Verified & Documented
