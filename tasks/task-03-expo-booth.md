# Task 03 — Expo & Booth Management (Admin)

**Goal:** Admin can create/edit/delete expos and define a floor plan with booths.
**Prerequisites:** Task 02 done.

## Subtasks
### Expo
- [x] **T03.1** `Expo` model: `title, description, theme, startDate, endDate, location{venue,city,address}, bannerImage, status(draft|published|completed), createdBy`
- [x] **T03.2** Expo CRUD API (admin-only for write; public read of published expos) + validation (endDate ≥ startDate)
- [x] **T03.3** Pagination, search, and filter by status/date on `GET /api/expos`
- [x] **T03.4** Banner image upload with Multer (type/size limits)

### Booths & floor plan
- [x] **T03.5** `Booth` model: `expoId, boothNumber (unique per expo), size, price, category, position{row,col} or {x,y,w,h}, status(available|reserved|allocated), exhibitorId`
- [x] **T03.6** Bulk-generate booths for an expo (e.g., rows × columns)
- [x] **T03.7** Booth CRUD API (admin) + `GET /api/expos/:id/booths`
- [x] **T03.8** Admin allocate/release booth to an exhibitor (`PUT /api/booths/:id/allocate`)

### Frontend (Admin)
- [x] **T03.9** Admin layout with sidebar (Dashboard, Expos, Exhibitors, Schedule, Analytics, Feedback)
- [x] **T03.10** Expos list page (table, search, status badge) + create/edit form + delete confirm
- [x] **T03.11** `FloorPlan` component: SVG/CSS-grid of booths coloured by status; click to view/allocate
- [x] **T03.12** Booth management page (generate, edit, allocate)

### Seed
- [x] **T03.13** Seed 1 published expo with ~20 booths

## Acceptance criteria
- Duplicate booth numbers within an expo are rejected
- Non-admin cannot create/edit/delete (403)
- Floor plan clearly shows available/reserved/allocated

## If stuck
- Floor plan too hard → render a simple grid of `<div>` boxes first; improve styling later
- Date issues → store ISO dates; format only in the UI

## Done when
Admin can fully manage an expo and its booth map; seed data loads.
