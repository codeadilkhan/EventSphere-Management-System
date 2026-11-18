# Master Quality Assurance & Test Case Specification (Task 10)

**Project:** EventSphere Management System  
**Deliverable:** Aptech eProject 2026  
**Status:** 100% Passed · Zero Critical Defects  
**Execution Environment:** Node.js v20.x, Express v4.x, MongoDB v8.x, Jest v29.x, Supertest, Vite 5.x / React 18  

---

## 1. Quality Assurance Summary & Metrics

| Metric | Target | Result | Status |
|---|---|---|---|
| **Total Test Cases Defined** | ≥ 40 cases | **56 Test Cases** | Met (140% of target) |
| **Automated Jest Unit/Integration Tests** | ≥ 30 tests | **61 Automated Tests (7 Suites)** | Met (203% of target) |
| **Test Execution Pass Rate** | 100% | **100% (61 / 61 Passed)** | Met |
| **Core Modules Coverage** | ≥ 70% | **76% - 100% in Core Engines** | Met |
| **High / Critical Open Bugs** | 0 | **0 Open Critical Bugs** | Met |
| **Security Penetration Cases** | OWASP Top 10 | **NoSQL, XSS, RBAC, Uploads Verified** | Met |

---

## 2. Test Case Execution Matrix (56 Test Cases)

### Module 1: Authentication, Role-Based Access Control (RBAC) & Password Security
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Attendee Registration | POST `/api/auth/register` with name, valid email, password ≥ 6 chars, role='attendee', consentGiven=true | HTTP 201 Created; safe user object (no password) + signed JWT token returned | 201 Created; user registered; JWT returned | **PASS** |
| **TC-AUTH-02** | Exhibitor Registration | POST `/api/auth/register` with role='exhibitor', business phone, consentGiven=true | HTTP 201 Created; role set to 'exhibitor' | 201 Created; exhibitor role assigned | **PASS** |
| **TC-AUTH-03** | Missing GDPR Consent | POST `/api/auth/register` with consentGiven=false or missing | HTTP 400 Bad Request; Joi error 'You must agree to the Terms of Service and Privacy Policy' | 400 Bad Request; registration blocked | **PASS** |
| **TC-AUTH-04** | Duplicate Email Rejection | POST `/api/auth/register` with existing email address | HTTP 400 Bad Request; message 'An account with this email address already exists' | 400 Bad Request; duplicate prevented | **PASS** |
| **TC-AUTH-05** | Successful Login | POST `/api/auth/login` with registered email and correct password | HTTP 200 OK; returns signed JWT bearer token and user role | 200 OK; JWT token issued | **PASS** |
| **TC-AUTH-06** | Invalid Password Attempt | POST `/api/auth/login` with registered email and incorrect password | HTTP 401 Unauthorized; 'Invalid email or password credentials' | 401 Unauthorized; login rejected | **PASS** |
| **TC-AUTH-07** | Forgot Password Trigger | POST `/api/auth/forgot-password` with valid user email | HTTP 200 OK; reset token generated and email dispatched | 200 OK; email triggered with reset link | **PASS** |
| **TC-AUTH-08** | Password Reset Execution | POST `/api/auth/reset-password/:token` with new password ≥ 6 chars and confirm match | HTTP 200 OK; password updated in DB with bcrypt hash; old reset token cleared | 200 OK; password reset successfully | **PASS** |

### Module 2: Exhibition Management & Floor Plan Configuration
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-EXPO-01** | Create Exhibition (Admin) | POST `/api/expos` with valid title, theme, start/end dates, location venue | HTTP 201 Created; expo saved in draft status | 201 Created; exhibition record created | **PASS** |
| **TC-EXPO-02** | Create Exhibition (Unauthorized) | POST `/api/expos` with Attendee or Exhibitor JWT | HTTP 403 Forbidden; 'Access restricted: You do not possess the required permission level' | 403 Forbidden; operation blocked | **PASS** |
| **TC-EXPO-03** | End Date Before Start Date | POST `/api/expos` with endDate < startDate | HTTP 400 Bad Request; Joi validation fails with 'End date must be on or after start date' | 400 Bad Request; schema validation failed | **PASS** |
| **TC-EXPO-04** | Public Exhibition Listing | GET `/api/expos` without authorization header | HTTP 200 OK; returns only expos with status='published' | 200 OK; draft expos hidden from public | **PASS** |
| **TC-EXPO-05** | Admin Exhibition Filter | GET `/api/expos?status=draft` with Admin JWT | HTTP 200 OK; returns draft expos for admin management | 200 OK; draft expos retrieved | **PASS** |
| **TC-EXPO-06** | Upload Exhibition Banner | POST `/api/expos/upload-banner` with PNG/WebP file < 5MB | HTTP 200 OK; file renamed with crypto hash and URL returned | 200 OK; banner saved in `/uploads` | **PASS** |

### Module 3: Commercial Stall Lifecycle & Floor Plan Matrix
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-BOOTH-01** | Create Single Stall | POST `/api/booths` with expoId, boothNumber='A-01', size='10x10', price=1000 | HTTP 201 Created; booth status='available' | 201 Created; booth initialized | **PASS** |
| **TC-BOOTH-02** | Duplicate Stall Number | POST `/api/booths` with existing boothNumber in the same expo | HTTP 400 Bad Request; 'Booth number already exists in this exhibition' | 400 Bad Request; duplicate rejected | **PASS** |
| **TC-BOOTH-03** | Bulk Generate Matrix | POST `/api/booths/bulk-generate` with rows=4, cols=5, basePrice=500 | HTTP 201 Created; 20 booths created (A-01 to D-05) with auto Corner categories | 201 Created; 20 stalls mapped | **PASS** |
| **TC-BOOTH-04** | Exhibitor Self-Reservation | PUT `/api/booths/:id/reserve` by Exhibitor with approved application | HTTP 200 OK; booth atomically marked 'allocated', exhibitorId assigned, live socket update emitted | 200 OK; stall secured for company | **PASS** |
| **TC-BOOTH-05** | Stall Double-Booking Prevention | PUT `/api/booths/:id/reserve` on an already allocated booth | HTTP 400 Bad Request; 'Booth is no longer available' | 400 Bad Request; double booking blocked | **PASS** |
| **TC-BOOTH-06** | Admin Stall Release | PUT `/api/booths/:id/release` with Admin JWT | HTTP 200 OK; booth reset to 'available' with exhibitorId=null | 200 OK; stall released to layout | **PASS** |

### Module 4: Exhibitor Applications & Document Review
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-APP-01** | Submit Application | POST `/api/applications` with companyName, contactEmail, valid expoId | HTTP 201 Created; application status='pending' | 201 Created; application recorded | **PASS** |
| **TC-APP-02** | Prevent Duplicate Application | POST `/api/applications` by same exhibitor for same expo | HTTP 400 Bad Request; 'You have already submitted an application' | 400 Bad Request; duplicate blocked | **PASS** |
| **TC-APP-03** | Upload Corporate Certificate | POST `/api/applications` with PDF document attached | HTTP 201 Created; document saved in `/uploads` with random prefix | 201 Created; document attached | **PASS** |
| **TC-APP-04** | Admin Review: Approve | PATCH `/api/applications/:id/review` with status='approved' | HTTP 200 OK; status updated, email dispatched, in-app notification sent | 200 OK; application approved | **PASS** |
| **TC-APP-05** | Admin Review: Reject | PATCH `/api/applications/:id/review` with status='rejected', adminRemarks='Incomplete docs' | HTTP 200 OK; rejection email & notification dispatched with remarks | 200 OK; application rejected | **PASS** |
| **TC-APP-06** | My Applications Filter | GET `/api/applications/my-applications` as Exhibitor | HTTP 200 OK; returns only applications belonging to `req.user.id` | 200 OK; applications isolated | **PASS** |

### Module 5: Conference Keynotes, Hall Conflicts & Attendee Agenda
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-SESS-01** | Create Session (Admin) | POST `/api/sessions` with speaker, topic, hall='Hall A', start/end within expo dates | HTTP 201 Created; session scheduled | 201 Created; keynote created | **PASS** |
| **TC-SESS-02** | Hall Timing Conflict | POST `/api/sessions` in 'Hall A' overlapping an existing session's timeframe | HTTP 400 Bad Request; 'Schedule Conflict: Hall A is already occupied by session...' | 400 Bad Request; conflict prevented | **PASS** |
| **TC-SESS-03** | Timing Outside Expo Dates | POST `/api/sessions` with startTime prior to expo startDate | HTTP 400 Bad Request; 'Session timing must fall within the exhibition date range' | 400 Bad Request; validation failed | **PASS** |
| **TC-SESS-04** | Attendee Session Booking | POST `/api/registrations/session` with valid sessionId | HTTP 201 Created; `registeredCount` incremented atomically; confirmation alert sent | 201 Created; seat confirmed | **PASS** |
| **TC-SESS-05** | Duplicate Booking Prevention | POST `/api/registrations/session` for a session already booked by user | HTTP 400 Bad Request; 'You are already registered for this session' | 400 Bad Request; duplicate blocked | **PASS** |
| **TC-SESS-06** | Hall Capacity Limit Check | POST `/api/registrations/session` when `registeredCount >= capacity` | HTTP 400 Bad Request; 'This session has reached its maximum hall capacity' | 400 Bad Request; overbooking prevented | **PASS** |
| **TC-SESS-07** | Cancel Booking & Release Seat | DELETE `/api/registrations/session/:id` | HTTP 200 OK; registration removed, `registeredCount` decremented by 1 | 200 OK; seat released | **PASS** |

### Module 6: Real-time Socket Messaging & Presence
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-MSG-01** | Socket JWT Handshake | Connect Socket.io client with `auth: { token: validJwt }` | Socket connected; joined user room `user:<id>` and presence broadcast | Connected; rooms initialized | **PASS** |
| **TC-MSG-02** | Send Message (Allowed Pair) | POST `/api/messages` from Attendee to Exhibitor | HTTP 201 Created; message stored in DB and emitted to recipient via socket | 201 Created; live message received | **PASS** |
| **TC-MSG-03** | Restricted Messaging Rule | POST `/api/messages` from Attendee to Attendee | HTTP 403 Forbidden; 'Attendees can only message commercial exhibitors or organizers' | 403 Forbidden; policy enforced | **PASS** |
| **TC-MSG-04** | Typing Indicator Broadcast | Socket event `typing:start` emitted with `{ recipientId }` | `typing:user` delivered exclusively to recipient's socket room | Delivered to recipient room | **PASS** |
| **TC-MSG-05** | Unread Counter Synchronization | Message delivered to recipient; recipient fetches `/api/messages/unread-count` | Counter increments live in Bell and chat badge | Live counter updated | **PASS** |

### Module 7: Notifications Engine & Background Reminder Cron
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-NOTIF-01** | In-App Notification Trigger | Application approved or booth allocated | Notification saved in MongoDB and emitted via Socket event `notification:new` | Delivered in real-time | **PASS** |
| **TC-NOTIF-02** | List Notifications | GET `/api/notifications` with pagination | HTTP 200 OK; paginated notification array with `unreadCount` | 200 OK; notifications listed | **PASS** |
| **TC-NOTIF-03** | Mark As Read | PATCH `/api/notifications/:id/read` | HTTP 200 OK; `read` flag updated to true | 200 OK; read state saved | **PASS** |
| **TC-NOTIF-04** | Mark All Read | PATCH `/api/notifications/read-all` | HTTP 200 OK; all notifications for `req.user.id` marked read | 200 OK; counter reset to 0 | **PASS** |
| **TC-NOTIF-05** | Exactly-Once Reminder Cron | Execute `checkAndSendReminders()` on sessions starting in ~30 min | Dispatches in-app alert + email; atomically flips `reminderSent: true` to prevent duplicates | Dispatched once; flag set | **PASS** |

### Module 8: Executive Analytics, Reporting & CSV Export
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-ANL-01** | Overview KPI Aggregation | GET `/api/analytics/overview?expoId` as Admin | HTTP 200 OK; returns total attendees, booths count, occupancy %, and revenue | 200 OK; accurate calculations | **PASS** |
| **TC-ANL-02** | Spot-Check Occupancy Math | Compare `(allocatedBooths / totalBooths) * 100` against returned `boothOccupancyRate` | Value exactly matches raw database ratio | Exact mathematical match | **PASS** |
| **TC-ANL-03** | Engagement Daily Time-Series | GET `/api/analytics/engagement?days=14` | HTTP 200 OK; returns contiguous array of 14 day records with 0-filled days | 200 OK; continuous data points | **PASS** |
| **TC-ANL-04** | Commercial Booth Traffic | GET `/api/analytics/booth-traffic?limit=10` | HTTP 200 OK; returns ranked booths by footfall views and category share | 200 OK; top stalls ranked | **PASS** |
| **TC-ANL-05** | Export Dataset to CSV | GET `/api/analytics/export?type=booths` | HTTP 200 OK; header `Content-Type: text/csv; charset=utf-8` and RFC-escaped rows | 200 OK; downloadable CSV | **PASS** |

### Module 9: GDPR Data Privacy, Consent, Portability & Erasure
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-GDPR-01** | Retrieve Privacy Profile | GET `/api/users/me` as authenticated user | HTTP 200 OK; returns user record with `consentGiven: true` and `consentTimestamp` | 200 OK; consent record verified | **PASS** |
| **TC-GDPR-02** | Article 20 Data Portability | GET `/api/users/me/export-data?download=true` | HTTP 200 OK; downloads `eventsphere-user-data.json` with all registrations and chats | 200 OK; archive downloaded | **PASS** |
| **TC-GDPR-03** | Erasure: Wrong Password | DELETE `/api/users/me` with incorrect password | HTTP 401 Unauthorized; 'Incorrect password. Account deletion aborted.' | 401 Unauthorized; account preserved | **PASS** |
| **TC-GDPR-04** | Erasure: Full Account Purge | DELETE `/api/users/me` with correct password | HTTP 200 OK; allocated booths released, session capacities decremented, all records deleted | 200 OK; data purged permanently | **PASS** |
| **TC-GDPR-05** | Privacy Policy Page | Browse `/privacy` in browser | HTTP 200 OK; renders GDPR Article 6, Article 17, and Article 20 legal disclosures | Rendered cleanly | **PASS** |

### Module 10: Security Penetration & Abuse Resistance
| ID | Scenario / Feature | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-SEC-01** | NoSQL Injection Attempt | POST `/api/auth/login` with `{"email": {"$gt": ""}, "password": "x"}` | MongoDB query operators stripped by `mongoSanitize`; query fails safely | Stripped; injection neutralized | **PASS** |
| **TC-SEC-02** | Cross-Site Scripting (XSS) | POST `/api/feedback` with `<script>alert('XSS')</script>Issue` in subject | `<script>` tags stripped by XSS filter middleware; stored safely | Script tags scrubbed | **PASS** |
| **TC-SEC-03** | Executable Upload Attempt | POST `/api/applications` with `malware.exe` or `payload.php` | Multer filter rejects file with 400 'Executable or script files are strictly prohibited' | 400 Bad Request; file rejected | **PASS** |
| **TC-SEC-04** | Rate Limiting Enforcement | Send 1,200 rapid GET requests from same IP in < 1 minute | Rate limiter triggers HTTP 429 Too Many Requests | 429 Too Many Requests | **PASS** |

---

## 3. Defect & Bug Resolution Register (`T10.12`)

| Defect ID | Severity | Module | Description | Root Cause | Resolution & Fix | Status |
|---|---|---|---|---|---|---|
| **BUG-01** | High | Auth | Password hash was saved in plain text during direct seeder runs | Mongoose `.create` called without pre-save trigger | Integrated `user.save()` with salt round 10 in all seeders | **RESOLVED** |
| **BUG-02** | Medium | Schedule | Admin could overlap sessions in the same conference hall | Lack of pre-insert conflict query | Implemented `checkHallConflict` query verifying `startTime < existingEnd && endTime > existingStart` | **RESOLVED** |
| **BUG-03** | High | Sockets | Attendees could initiate unsolicited messaging with arbitrary attendees | Missing authorization filter in `messageController` | Enforced strict role rule: Attendee ↔ Exhibitor and Admin ↔ All allowed; Attendee ↔ Attendee rejected with 403 | **RESOLVED** |
| **BUG-04** | Critical | Reminders | Concurrent cron execution could dispatch duplicate session emails | Race condition between query and send | Implemented atomic `findOneAndUpdate({ _id, reminderSent: false }, { reminderSent: true })` | **RESOLVED** |
| **BUG-05** | Medium | Uploads | Uploaded image filenames had potential directory traversal vectors | Using original raw filename | Replaced with `crypto.randomBytes(8).toString('hex')` and lowercase extension whitelist | **RESOLVED** |
| **BUG-06** | Low | UI | Navbar fragment tag mismatch broke Vite JSX production build | Unclosed fragment `<>` in ternary operator | Added missing closing fragment tag `</>` | **RESOLVED** |

---

## 4. Final Regression Sign-Off (`T10.13`)

- **Full Test Suite Status:** `npm test` executed across all 7 suites — **61 / 61 tests PASSED (0 failures, 0 errors)**.
- **Client Build Status:** `npm run build` executed — **Vite production bundle built cleanly in 22.41s with 0 errors**.
- **Security Check:** OWASP Top 10 controls active and validated.
- **Documentation:** Complete and signed off for final evaluation.
