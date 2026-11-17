# Task 08 — Analytics & Reporting

**Goal:** Admin dashboard with attendee engagement, booth traffic, and session popularity, plus real-time stats.
**Prerequisites:** Tasks 03–07 done.

## Subtasks
### Data collection
- [ ] **T08.1** `AnalyticsEvent` model: `type(page_view|booth_view|session_view|register|bookmark), expoId, refId, userId, createdAt`
- [ ] **T08.2** Log events from existing endpoints (booth/exhibitor profile view, session view, register, bookmark)
- [ ] **T08.3** Index by `expoId, type, createdAt` for fast aggregation

### Reports (aggregation API)
- [ ] **T08.4** `GET /api/analytics/overview?expoId` — total attendees, exhibitors, booths filled %, sessions
- [ ] **T08.5** `GET /api/analytics/engagement` — registrations/bookmarks/messages per day
- [ ] **T08.6** `GET /api/analytics/booth-traffic` — views per booth (top N)
- [ ] **T08.7** `GET /api/analytics/session-popularity` — registrations vs capacity per session

### Dashboard UI
- [ ] **T08.8** KPI cards (overview)
- [ ] **T08.9** Charts with Recharts: line (engagement), bar (booth traffic), bar/pie (session popularity)
- [ ] **T08.10** Expo selector + date range filter
- [ ] **T08.11** Live refresh via Socket.io (or polling every 30s)
- [ ] **T08.12** Export report to CSV

## Acceptance criteria
- Numbers match raw data (spot-check 3 values manually)
- Dashboard loads in < 2s with seeded data
- Only admin can access analytics endpoints

## If stuck
- Complex aggregation → build in MongoDB Compass first, then paste pipeline into code
- Empty charts → seed fake events with a script

## Done when
Dashboard shows three reports with realistic data.
