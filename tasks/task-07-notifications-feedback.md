# Task 07 — Notifications, Reminders & Feedback

**Goal:** In-app + email notifications, session reminders, and a feedback/support mechanism.
**Prerequisites:** Tasks 04–06 done.

## Subtasks
### Notifications
- [ ] **T07.1** `Notification` model: `userId, type, title, message, link, read, createdAt`
- [ ] **T07.2** Notification service `notify(userId, payload)` that saves + emits via socket
- [ ] **T07.3** Trigger notifications: application approved/rejected, booth allocated, schedule changed, new message
- [ ] **T07.4** API: list (paginated), mark one/all as read
- [ ] **T07.5** UI: bell icon with unread count + dropdown + full page

### Reminders
- [ ] **T07.6** `node-cron` job runs every few minutes: find bookmarked/registered sessions starting in ~30 min and not yet reminded
- [ ] **T07.7** Send in-app notification + email; mark `reminderSent` to avoid duplicates
- [ ] **T07.8** Email templates (HTML) for reset, approval, reminder

### Feedback & support
- [ ] **T07.9** `Feedback` model: `userId, type(suggestion|issue), subject, message, status(open|in-progress|resolved), adminReply`
- [ ] **T07.10** Submit feedback (all roles); view own submissions
- [ ] **T07.11** Admin feedback page: filter, update status, reply

## Acceptance criteria
- Reminder is sent exactly once per user per session
- Notification count updates live
- Admin can resolve feedback and the user sees the reply

## If stuck
- Cron not firing → log each run; verify server time/timezone
- Emails failing → keep Ethereal/Mailtrap for dev; wrap sends in try/catch so failures don't crash requests

## Done when
Approve an application → exhibitor gets bell + email; reminder fires for a bookmarked session.
