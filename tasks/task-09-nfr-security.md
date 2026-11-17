# Task 09 — Non-Functional Hardening (Security, Privacy, Performance, Usability)

**Goal:** Meet the non-functional requirements from the brief and make the app production-grade.
**Prerequisites:** Core features (Tasks 02–08) done.

## Subtasks
### Security
- [ ] **T09.1** Add `helmet`, strict CORS, `express-rate-limit`, `express-mongo-sanitize`, XSS sanitisation
- [ ] **T09.2** Validate every request body/params with Joi (central `validate` middleware)
- [ ] **T09.3** Authorisation audit: list every route and verify role + ownership checks (users only access their own data)
- [ ] **T09.4** Secure uploads (type/size whitelist, random filenames, no executable types)
- [ ] **T09.5** HTTPS-ready config (secure cookies/headers; document TLS for deployment)
- [ ] **T09.6** Run `npm audit` and fix high/critical issues

### Privacy (GDPR-style)
- [ ] **T09.7** Consent checkbox stored with timestamp; Privacy Policy page
- [ ] **T09.8** "Download my data" and "Delete my account" features
- [ ] **T09.9** Minimise data returned by APIs (no password/tokens, limited contact data)

### Performance & scalability
- [ ] **T09.10** Add DB indexes (email, expoId, boothNumber, session times, text index)
- [ ] **T09.11** Pagination on all list endpoints; `lean()` for read queries
- [ ] **T09.12** Response compression; measure typical endpoints (< 1–2s)
- [ ] **T09.13** Load test with `autocannon` or k6 (~200 concurrent users) and note results
- [ ] **T09.14** Stateless server design documented (ready for horizontal scaling)

### Reliability & monitoring
- [ ] **T09.15** `winston` logging (errors, requests, auth events) to files with rotation
- [ ] **T09.16** `/api/health` extended with DB status
- [ ] **T09.17** Backup script using `mongodump` + restore instructions in docs

### Usability & compatibility
- [ ] **T09.18** Responsive check (mobile/tablet/desktop) on every page
- [ ] **T09.19** Accessibility pass: labels, alt text, focus states, colour contrast, keyboard navigation (WCAG basics)
- [ ] **T09.20** Cross-browser check: Chrome, Firefox, Edge (Safari if available)
- [ ] **T09.21** Consistent loading, empty, and error states in the UI

## Acceptance criteria
- No sensitive data in API responses/logs
- Lighthouse accessibility score ≥ 90 on main pages
- Load test shows acceptable response times

## If stuck
- Too many items → prioritise T09.1–T09.4, T09.10, T09.15, T09.18
- Rate limiter blocking you in dev → relax limits via env variable

## Done when
Security/audit checklist signed off; results recorded in `docs/nfr-report.md`.
