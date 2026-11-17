# Task 04 — Exhibitor Module

**Goal:** Exhibitors apply to expos, get approved, choose booths, and manage their profile.
**Prerequisites:** Tasks 02–03 done.

## Subtasks
### Models & API
- [ ] **T04.1** `ExhibitorProfile` model: `userId, companyName, logo, description, website, contact{email,phone,address}, category, products[], staff[{name,role,phone}]`
- [ ] **T04.2** Profile API: `GET/PUT /api/exhibitors/me`, logo upload
- [ ] **T04.3** `ExhibitorApplication` model: `exhibitorId, expoId, companyDetails, productsServices, documents[], preferredBoothIds[], status(pending|approved|rejected), adminRemarks, reviewedBy, reviewedAt`
- [ ] **T04.4** Submit application (document upload: PDF/image only, size limit); block duplicate application per expo
- [ ] **T04.5** Admin: list/filter applications; approve/reject with remarks
- [ ] **T04.6** Booth reservation: approved exhibitor can reserve an `available` booth (atomic update to avoid double booking)
- [ ] **T04.7** Admin can assign/override booth for an exhibitor
- [ ] **T04.8** Update booth showcase details (products/services, staff)

### Frontend — Exhibitor portal
- [ ] **T04.9** Exhibitor dashboard (application status per expo, booth, quick links)
- [ ] **T04.10** Profile edit page (logo preview, validation)
- [ ] **T04.11** Browse expos + application form (multi-step optional)
- [ ] **T04.12** Booth selection page using `FloorPlan` (only available booths clickable)
- [ ] **T04.13** My booth page (edit showcase details/staff)

### Frontend — Admin
- [ ] **T04.14** Applications page: table, view details/documents, approve/reject modal

### Notifications hook (basic)
- [ ] **T04.15** On approve/reject, create a `Notification` record (full system in Task 07)

## Acceptance criteria
- Two exhibitors cannot reserve the same booth (test with 2 requests)
- Unapproved exhibitor cannot select a booth
- Status changes visible to exhibitor immediately on refresh

## If stuck
- Double booking → use `findOneAndUpdate({_id, status:'available'}, {...})` and check result
- File upload errors → confirm `multipart/form-data`, field names, and `uploads/` folder exists

## Done when
Complete flow works: apply → approve → select booth → edit showcase.
