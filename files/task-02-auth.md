# Task 02 — Authentication & Roles

**Goal:** Secure register/login/logout, password reset, and role-based access (admin, exhibitor, attendee).
**Prerequisites:** Task 01 done.

## Subtasks
### Model & utilities
- [ ] **T02.1** `User` model: `name, email (unique), password (select:false), role (admin|exhibitor|attendee), phone, resetPasswordToken, resetPasswordExpires, consentGiven, createdAt`
- [ ] **T02.2** Pre-save hook to hash password with bcrypt (cost 10–12); `comparePassword` method
- [ ] **T02.3** JWT helper: sign/verify, expiry from env

### API
- [ ] **T02.4** `POST /api/auth/register` (Joi validation; role limited to exhibitor/attendee — admin created via seed only)
- [ ] **T02.5** `POST /api/auth/login` returns token + user (no password)
- [ ] **T02.6** `GET /api/auth/me` (protected)
- [ ] **T02.7** `POST /api/auth/forgot-password` generates hashed reset token, emails link (Ethereal/Mailtrap in dev)
- [ ] **T02.8** `POST /api/auth/reset-password/:token` validates token+expiry, sets new password
- [ ] **T02.9** `PUT /api/auth/change-password` (protected)

### Middleware
- [ ] **T02.10** `protect` middleware (verify JWT, attach `req.user`)
- [ ] **T02.11** `authorize(...roles)` middleware
- [ ] **T02.12** Rate limit on login/forgot-password routes

### Frontend
- [ ] **T02.13** `AuthContext` (user, token, login, logout, loading); persist token in localStorage
- [ ] **T02.14** Pages: Register (role select + consent checkbox), Login, Forgot Password, Reset Password
- [ ] **T02.15** `ProtectedRoute` and `RoleRoute` components; redirect by role after login (admin → /admin, exhibitor → /exhibitor, attendee → /events)
- [ ] **T02.16** Navbar shows items by role + logout

### Seed
- [ ] **T02.17** Seed one admin, two exhibitors, three attendees

## Acceptance criteria
- Passwords never stored/returned in plain form
- Wrong credentials give a generic error message
- Expired/invalid reset token rejected
- Attendee cannot open admin pages (UI and API both block, 403)
- All endpoints tested in Postman (save collection to `docs/`)

## If stuck
- "Invalid token" → check `Bearer ` prefix and that the same `JWT_SECRET` is used
- Password compare always false → ensure you select `+password` in login query
- Reset email not sent → log the reset URL in console as dev fallback

## Done when
Roles verified end-to-end, Postman collection saved, tracker updated.
