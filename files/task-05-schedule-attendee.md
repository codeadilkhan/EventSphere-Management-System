# Task 05 — Schedule Management & Attendee Module

**Goal:** Admin builds the event schedule; attendees browse, search exhibitors, register for and bookmark sessions.
**Prerequisites:** Tasks 02–04 done.

## Subtasks
### Schedule (Admin)
- [ ] **T05.1** `Session` model: `expoId, title, description, speaker{name,bio,photo}, topic, location/hall, startTime, endTime, capacity, status`
- [ ] **T05.2** Session CRUD API (admin) with validation (end > start, within expo dates)
- [ ] **T05.3** Conflict check: same hall cannot have overlapping sessions
- [ ] **T05.4** Admin schedule page: calendar/timeline view + create/edit/delete forms

### Attendee features (API)
- [ ] **T05.5** `Registration` model: `attendeeId, expoId, sessionId (optional), type(expo|session), bookmarked, registeredAt` (unique index to prevent duplicates)
- [ ] **T05.6** Register for expo / session (respect capacity); cancel registration
- [ ] **T05.7** Bookmark / unbookmark session; `GET /api/registrations/me`
- [ ] **T05.8** Exhibitor search: `GET /api/exhibitors?expoId&category&q=` (keyword over company, products)
- [ ] **T05.9** Public exhibitor detail incl. booth location

### Attendee UI
- [ ] **T05.10** Events list + Event detail (info, schedule, exhibitor list, floor plan view-only)
- [ ] **T05.11** Exhibitor directory with search + category filters; exhibitor profile page highlighting booth on the floor plan
- [ ] **T05.12** Schedule page: grouped by day, register/bookmark buttons, "My Schedule" page
- [ ] **T05.13** Attendee dashboard (upcoming sessions, bookmarks)

### Seed
- [ ] **T05.14** Seed ~10 sessions and several exhibitor profiles

## Acceptance criteria
- Cannot register twice or exceed capacity
- Search is case-insensitive and returns relevant results in < 2s
- Overlapping hall bookings are rejected with a clear message

## If stuck
- Search slow/inaccurate → add a MongoDB text index on company/products; fall back to regex
- Timezone confusion → store UTC, display in local time

## Done when
Attendee can find an exhibitor, see its booth, and plan a personal schedule.
