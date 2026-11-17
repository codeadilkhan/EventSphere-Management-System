# Task 01 — Setup & Foundation

**Goal:** A running skeleton: React client + Express server + MongoDB connection, with a clean repo structure.
**Prerequisites:** Node.js LTS, Git, MongoDB (local or Atlas), VS Code, Postman.

## Subtasks
### Repo & tooling
- [ ] **T01.1** Create GitHub repo `eventsphere`; add `.gitignore` (node_modules, .env, uploads)
- [ ] **T01.2** Create folders: `client/`, `server/`, `docs/`; copy `plan.md` and `tasks/` into repo
- [ ] **T01.3** Add ESLint + Prettier config to both apps

### Backend skeleton
- [ ] **T01.4** `cd server && npm init -y`; install: `express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken joi multer nodemailer socket.io node-cron`; dev: `nodemon jest supertest`
- [ ] **T01.5** Create folder structure (`config, models, controllers, routes, middleware, services, sockets, utils`)
- [ ] **T01.6** `app.js` (middleware, routes mount) and `server.js` (listen) separated
- [ ] **T01.7** MongoDB connection in `config/db.js`; `.env` + `.env.example` (`PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES, CLIENT_URL, SMTP_*`)
- [ ] **T01.8** Health route `GET /api/health` returns `{ success: true }`
- [ ] **T01.9** Global error handler + `AppError` class + async wrapper (`catchAsync`)
- [ ] **T01.10** Standard response helper (`{ success, data, message }`)

### Frontend skeleton
- [ ] **T01.11** `npm create vite@latest client -- --template react`; install `react-router-dom axios recharts socket.io-client` + Tailwind
- [ ] **T01.12** Folder structure (`components, pages, context, hooks, services, routes, utils`)
- [ ] **T01.13** Axios instance (`services/api.js`) with base URL and token interceptor
- [ ] **T01.14** Router with placeholder pages + shared `Navbar`, `Footer`, `Layout`
- [ ] **T01.15** Call `/api/health` from the client to confirm connection (CORS working)

### Seed & scripts
- [ ] **T01.16** `npm run dev` scripts for both apps (optionally root script using `concurrently`)
- [ ] **T01.17** Create empty `seed/seed.js` (filled in later tasks)

## Acceptance criteria
- `npm run dev` starts server on :5000 and client on :5173 without errors
- Health endpoint visible from browser and from React
- `.env` is NOT in Git; `.env.example` is

## If stuck
- Mongo connection fails → check `MONGO_URI`, Atlas IP whitelist, or that `mongod` service is running
- CORS error → set `cors({ origin: CLIENT_URL })` before routes
- Port in use → change `PORT` or kill the process

## Done when
All boxes ticked, first commit pushed to `main`, tracker updated.
