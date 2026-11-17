# Task 10 — Testing & Quality Assurance

**Goal:** A reliable test suite (unit, integration, end-to-end) and documented test cases.
**Prerequisites:** Task 09 mostly done (can start earlier alongside features).

## Subtasks
### Backend
- [ ] **T10.1** Jest + Supertest setup with a separate test database (`mongodb-memory-server` or `eventsphere_test`)
- [ ] **T10.2** Unit tests: password hashing, JWT helper, validators, services
- [ ] **T10.3** Integration tests — Auth: register, login, wrong password, reset flow, role protection
- [ ] **T10.4** Integration tests — Expo/Booth CRUD and permissions
- [ ] **T10.5** Integration tests — Applications: approve/reject, double-booking prevention
- [ ] **T10.6** Integration tests — Sessions: overlap rule, registration capacity
- [ ] **T10.7** Coverage report; target ≥ 70% on core modules

### Frontend
- [ ] **T10.8** React Testing Library: login form, protected routes, key components
- [ ] **T10.9** (Optional) Cypress/Playwright E2E for 3 flows: attendee registers for session · exhibitor applies & books · admin approves

### Manual QA & security testing
- [ ] **T10.10** Write test-case table (ID, scenario, steps, expected, actual, pass/fail) in `docs/test-cases.md` — at least 40 cases
- [ ] **T10.11** Security tests: SQL/NoSQL injection attempts, XSS payloads, broken access control (use another role's token), brute-force login
- [ ] **T10.12** Bug log with severity and status; fix all high/critical bugs
- [ ] **T10.13** Final regression run before submission

## Acceptance criteria
- `npm test` passes on a clean clone
- No open critical/high bugs
- Test cases document complete

## If stuck
- Tests flaky → clear DB between tests (`beforeEach`), don't share state
- Don't test everything — cover auth, permissions, and business rules first

## Done when
Green test run + completed `docs/test-cases.md`.
