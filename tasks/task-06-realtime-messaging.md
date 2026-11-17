# Task 06 — Real-time Updates & Messaging

**Goal:** Live updates for schedule/booth/event changes and in-app messaging between users.
**Prerequisites:** Tasks 03–05 done.

## Subtasks
### Socket infrastructure
- [ ] **T06.1** Integrate Socket.io into `server.js`; authenticate sockets with the JWT
- [ ] **T06.2** Rooms: `user:<id>`, `expo:<id>`; join on connect/page entry
- [ ] **T06.3** Client `SocketContext` (connect on login, disconnect on logout)

### Real-time updates
- [ ] **T06.4** Emit `booth:updated` when booth status changes → floor plans update live
- [ ] **T06.5** Emit `schedule:updated` when sessions change → schedule pages refresh
- [ ] **T06.6** Emit `expo:updated` for expo detail changes
- [ ] **T06.7** Show a small toast "Schedule updated" on affected pages

### Messaging
- [ ] **T06.8** `Message` model: `senderId, receiverId, expoId, content, readAt, createdAt` + index on participants
- [ ] **T06.9** REST: `GET /api/messages/conversations`, `GET /api/messages/:userId`, `POST /api/messages`
- [ ] **T06.10** Socket event `message:new` delivers instantly; unread counter
- [ ] **T06.11** Rules: attendee ↔ exhibitor, exhibitor ↔ admin, exhibitor ↔ neighbor exhibitors in same expo
- [ ] **T06.12** Chat UI: conversation list + chat window + "Message exhibitor" button on exhibitor profile
- [ ] **T06.13** Neighbor exhibitors list on "My booth" page with contact info/chat

## Acceptance criteria
- Two browsers open: changing a booth/session in one updates the other without refresh
- Unauthorized socket connections are rejected
- Messages persist after refresh

## If stuck
- Sockets not connecting → check CORS config for Socket.io separately and the client URL
- Events not received → verify the client joined the correct room
- Make REST work first, then layer sockets on top

## Done when
Live updates and chat demonstrated with two logged-in users.
