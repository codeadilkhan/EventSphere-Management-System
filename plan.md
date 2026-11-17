# EventSphere Management System — Project Plan

> Aptech eProject | MERN Stack (MongoDB, Express, React, Node.js)
> How to use: read this file for the big picture, then work through `tasks/task-01 … task-11` in order. Tick checkboxes as you go.

---

## 1. Project Summary
A web platform that digitises expo / trade-show management. Three roles:

| Role | Can do |
|---|---|
| **Admin / Organizer** | Manage expos, booths, floor plan, exhibitor applications, schedule, analytics |
| **Exhibitor** | Apply to expos, manage profile, pick booth, message organizers/neighbors |
| **Attendee** | Browse expo, search exhibitors, register/bookmark sessions, get reminders, chat |

Cross-cutting: real-time updates, feedback/support, security, privacy, testing, documentation, video demo.

## 2. Goals & Success Criteria
- [ ] All functional requirements from the eProject brief implemented
- [ ] Non-functional requirements demonstrably met (security, responsiveness, 1–2s response, logging, tests)
- [ ] Complete deliverables submitted: source code, documentation, video demo
- [ ] Clean Git history and a README that lets anyone run the project in under 10 minutes

## 3. Scope
**MVP (must-have, build first):** Auth + roles, Expo CRUD, Booths + allocation, Exhibitor applications + approval, Schedule, Attendee registration/search.
**Phase 2 (should-have):** Real-time (Socket.io), messaging, notifications/reminders, feedback.
**Phase 3 (polish):** Analytics dashboard, security hardening, tests, docs, video.
**Out of scope:** Payments, native mobile apps, multi-language, AI features.

## 4. Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React (Vite), React Router, Axios, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| Email / jobs | Nodemailer, node-cron |
| Uploads | Multer |
| Validation | Joi (or express-validator) |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |
| Logging | morgan + winston |
| Testing | Jest + Supertest, React Testing Library, Postman |
| Tools | Git/GitHub, VS Code, MongoDB Compass, Postman |

## 5. Architecture
```
eventsphere/
├── client/                 # React app
│   └── src/ (components, pages, context, hooks, services, routes, utils)
├── server/
│   ├── src/
│   │   ├── config/         # db, env, mail
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/     # auth, roles, error, validate, upload
│   │   ├── services/       # email, notifications, analytics
│   │   ├── sockets/
│   │   ├── utils/
│   │   └── app.js, server.js
│   ├── tests/
│   └── seed/               # demo data script
├── docs/                   # SRS, diagrams, user guide, dev guide
├── plan.md
└── tasks/
```
Pattern: **routes → controllers → services → models**. REST API under `/api`, JWT in `Authorization: Bearer`, central error handler, consistent JSON response shape `{ success, data, message }`.

## 6. Data Model (collections)
User · Expo · Booth · ExhibitorApplication · ExhibitorProfile · Session · Registration · Message · Notification · Feedback · AnalyticsEvent
(Field details are defined in `task-01` and the task where each model is first used.)

## 7. API Map
```
/api/auth          register, login, forgot-password, reset-password, me
/api/expos         CRUD
/api/booths        list by expo, reserve, allocate, release
/api/applications  submit, list, approve/reject
/api/exhibitors    profile CRUD, search/filter
/api/sessions      CRUD
/api/registrations register, bookmark, list mine
/api/messages      send, conversations, history
/api/notifications list, mark read
/api/feedback      submit, list (admin)
/api/analytics     engagement, booth-traffic, session-popularity
```

## 8. Phases & Milestones
| # | Phase | Task file | Milestone / Done when |
|---|---|---|---|
| 1 | Setup & foundation | `task-01-setup.md` | Both apps run, DB connected, repo structured |
| 2 | Authentication & roles | `task-02-auth.md` | Register/login/reset work; role-protected routes |
| 3 | Expo & booth management | `task-03-expo-booth.md` | Admin can CRUD expos and manage floor plan/booths |
| 4 | Exhibitor module | `task-04-exhibitor.md` | Apply → approve → pick booth → manage profile |
| 5 | Schedule & attendee module | `task-05-schedule-attendee.md` | Attendee can search, register, bookmark |
| 6 | Real-time & messaging | `task-06-realtime-messaging.md` | Live updates + chat working |
| 7 | Notifications & feedback | `task-07-notifications-feedback.md` | Reminders sent, feedback captured |
| 8 | Analytics & reporting | `task-08-analytics.md` | Admin dashboard with 3 reports |
| 9 | Non-functional hardening | `task-09-nfr-security.md` | Security, privacy, logging, backups, a11y done |
| 10 | Testing & QA | `task-10-testing.md` | Test suite green, bugs fixed |
| 11 | Documentation, video, submission | `task-11-docs-video.md` | Package submitted |

**Suggested timeline (adjust to your deadline):**
Week 1: Phases 1–2 · Week 2: Phase 3–4 · Week 3: Phase 5–6 · Week 4: Phases 7–8 · Week 5: Phases 9–11

## 9. Working Rules (professional workflow)
1. **One task = one Git branch** (`feature/auth-login`), merge to `main` when its checklist is ticked.
2. **Commit small, commit often** using clear messages (`feat:`, `fix:`, `docs:`, `test:`).
3. **Backend first, then UI** for each module; test the API in Postman before building screens.
4. **Never commit `.env`**; maintain `.env.example`.
5. **Definition of Done** for every task: works end-to-end, validated inputs, errors handled, role access checked, tested manually (and with a test where possible), README/API doc updated.
6. Update `tasks/README.md` status table at the end of each work session.

## 10. Risks & "If I'm stuck" Playbook
| Risk | Mitigation |
|---|---|
| Floor plan feels too complex | Use a simple grid/SVG of booth rectangles; no drag-and-drop |
| Real-time bugs | Build the feature with plain REST first; add Socket.io as an enhancement |
| Email not working locally | Use Mailtrap/Ethereal for dev; log reset links to console as fallback |
| Running out of time | Cut scope in this order: analytics charts → exhibitor-to-exhibitor chat → reminders. Never cut auth, expo, booths, applications, schedule |
| Stuck on a bug > 45 min | Write down: expected vs actual, error text, what you tried. Check server logs → Postman → browser Network tab → then search/ask |
| Merge/Git mess | Keep `main` always runnable; work on branches |

## 11. Final Deliverables Checklist
- [ ] Source code (client + server) with README and `.env.example`
- [ ] Documentation: SRS, use-case / ER / DFD diagrams, API docs, test cases
- [ ] User guide + Developer guide
- [ ] Video demo showing all three roles end-to-end
- [ ] Seed data script for demo
