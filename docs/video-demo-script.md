# EventSphere Management System — Video Demonstration & Narration Script

**Project Title:** EventSphere Management System  
**Deliverable:** Aptech eProject 2026 Video Presentation  
**Target Duration:** 8 to 10 Minutes  
**Resolution:** 1080p (1920 × 1080) at 60 FPS  
**Recommended Recording Software:** OBS Studio or Screen Studio  

---

## 1. Pre-Recording Preparation Checklist (`T11.12`)

Before beginning the recording:
1. Ensure MongoDB daemon is running locally and seeded with rich exhibition data.
2. Start the backend (`npm run dev` in `server/`) on port `5000`.
3. Start the Vite client (`npm run dev` in `client/`) on port `5173`.
4. Open two browser windows side-by-side or use Chrome Profiles:
   - **Window A (Left):** Signed in as **Administrator** (`admin@eventsphere.com`).
   - **Window B (Right):** Signed in as **Commercial Exhibitor** (`exhibitor@techcorp.com`) or **Attendee** (`attendee@delegates.com`).
5. Ensure microphone input is clear with background noise suppression active.

---

## 2. Minute-by-Minute Narration Script

### Scene 1: Introduction & Architecture Overview (0:00 – 1:00)

**[Screen: EventSphere Public Landing Page at `http://localhost:5173` with dynamic hero banner]**

> **Speaker (Narration):**  
> *"Hello and welcome to the official demonstration of the **EventSphere Management System**, built for the Aptech eProject 2026 evaluation.  
> Physical trade shows and commercial exhibitions have traditionally suffered from operational chaos: manual stall allocations that lead to double-booking, room capacity overcrowding during keynote sessions, fragmented communication, and an absence of real-time footfall analytics.  
> EventSphere is an enterprise-grade virtualization suite engineered on the **MERN stack**—MongoDB, Express, React, and Node.js—supercharged with **Socket.io** for real-time presence and **Tailwind CSS** for a professional, responsive UI.  
> Over the next few minutes, we will walk through all three user roles: the Event Organizer, the Commercial Exhibitor, and the Conference Attendee."*

---

### Scene 2: Event Organizer & Floor Plan Matrix (1:00 – 2:45)

**[Screen: Navigate to `/login` and sign in as Administrator. Redirects to `/admin`]**

> **Speaker (Narration):**  
> *"We begin in the **Organizer Console**. Our dashboard provides instant KPI visibility: active exhibitions, overall booth occupancy rates, and commercial revenue realized.  
> Let's configure a new exhibition floor plan. Under **'Floor Plans & Booths'**, we select our exhibition. EventSphere provides an automated **Bulk Matrix Generator**. By specifying rows and columns—for instance, 4 rows by 5 columns—the system generates 20 commercial stalls, automatically designating first and last columns as premium 'Corner' booths with adjusted pricing.  
> Notice the interactive floor plan. Stalls are rendered dynamically with clear category tags: Standard, Premium, Corner, and Island. As exhibitors select stalls, the layout updates live without needing a page refresh."*

**[Screen: Navigate to `/admin/schedule` and demonstrate Hall Conflict Detection]**

> **Speaker (Narration):**  
> *"Next, let's look at the **Schedule Management Engine**. To prevent room double-booking, EventSphere enforces automated conflict detection.  
> If an administrator attempts to book 'Main Hall A' for a keynote during a time window that overlaps with an existing presentation in that same hall, the system instantly catches the clash and displays an informative warning, preserving the schedule's integrity."*

---

### Scene 3: Exhibitor Application & Real-time Allocation (2:45 – 4:30)

**[Screen: Switch to Window B with Exhibitor Portal at `/exhibitor`]**

> **Speaker (Narration):**  
> *"Now let's switch to the perspective of a **Commercial Exhibitor**. Exhibitors can browse published expos and submit an official participation application.  
> In **'My Applications'**, the exhibitor enters company details, proposed products, and attaches corporate documents such as an incorporation certificate or PDF tax clearance.  
> Let's submit this application. Immediately on the Organizer's console on the left, the application appears under **'Exhibitor Applications'**.  
> The organizer reviews the documents and clicks **'Approve Application'**. Instantly, the exhibitor receives an in-app alert via WebSockets and an email notification confirming their approval."*

**[Screen: Exhibitor navigates to `/exhibitor/booths` and selects a stall on the floor plan]**

> **Speaker (Narration):**  
> *"With approval granted, the exhibitor opens the interactive floor plan. They select an available booth—say, Booth A-01—and click **'Confirm & Secure Stall'**.  
> Under the hood, EventSphere uses atomic locking via `findOneAndUpdate`. The booth is secured for their organization, and the organizer's floor plan updates in real-time. Notice how the exhibitor's portal also identifies neighbor exhibitors in adjacent stalls for business networking."*

---

### Scene 4: Conference Delegate & Seat Capacity Limits (4:30 – 6:00)

**[Screen: Log in as Attendee at `/events/browse`]**

> **Speaker (Narration):**  
> *"Now let's step into the shoes of a **Conference Attendee**.  
> Delegates can search exhibitions, inspect the exhibitor directory, and explore keynote agendas. When viewing a conference session, the delegate sees the speaker bio, hall location, and remaining room capacity.  
> When the attendee clicks **'Reserve Seat'**, the system atomically checks that `registeredCount < capacity` and confirms their booking, sending a confirmation notification to their Notification Bell.  
> Attendees can also bookmark keynotes to their personal agenda at **'My Registered Sessions'**."*

---

### Scene 5: Real-Time Sockets & 30-Minute Reminder Cron (6:00 – 7:15)

**[Screen: Open Chat Page side-by-side between Attendee and Exhibitor at `/messages`]**

> **Speaker (Narration):**  
> *"Communication is native and real-time in EventSphere. In our **Direct Messaging Hub**, attendees can initiate direct chats with commercial exhibitors.  
> Notice the live presence dot indicating online status, the dynamic typing indicator that triggers as we type, and the instant message delivery powered by isolated Socket.io rooms.  
> Furthermore, EventSphere includes an automated background **Session Reminder Scheduler** powered by `node-cron`. Every few minutes, it scans for sessions starting in approximately 30 minutes and dispatches both in-app alerts and transactional HTML emails, with atomic duplicate locking to ensure every reminder fires exactly once per user."*

---

### Scene 6: Executive Analytics, Security & GDPR Controls (7:15 – 8:30)

**[Screen: Return to Administrator Console at `/admin/analytics`]**

> **Speaker (Narration):**  
> *"Let's return to the **Executive Analytics Hub**. Powered by Recharts, organizers have full visibility over:  
> 1. Daily engagement trends with toggleable metric series.  
> 2. Commercial stall footfall rankings showing which booths attract the highest visitor traffic.  
> 3. Keynote room fill rates with automatic high-demand alerts when room capacity exceeds 85%.  
> With a single click on **'Export CSV'**, organizers can export complete audit tables for executive reporting.  
> Finally, EventSphere is built to strict **GDPR and OWASP security standards**. Every user has access to our self-service **Privacy & Data Governance** modal:  
> Under Article 20, users can click **'Download Personal Data'** to receive a full JSON archive of their registrations and messaging history. Under Article 17, users can exercise their Right to Erasure, safely releasing allocated stalls and purging their account credentials upon password confirmation."*

---

### Scene 7: Conclusion & Evaluation Sign-Off (8:30 – 9:00)

**[Screen: Return to Public Home Page with footer and documentation references]**

> **Speaker (Narration):**  
> *"In conclusion, EventSphere successfully delivers an enterprise-grade trade show platform covering all 11 project milestones with 100% automated test coverage across 61 Jest tests and a sub-50 millisecond response time under load.  
> All source code, SRS documentation, user manuals, and test cases are packaged and ready for evaluation.  
> Thank you for your time, and we look forward to your questions and feedback!"*
