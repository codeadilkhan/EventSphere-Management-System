# EventSphere Management System — Official User Manual & Operations Guide

**System Name:** EventSphere Management System  
**Audience:** Event Organizers, Commercial Exhibitors, Conference Delegates & Evaluators  
**Version:** 1.0.0  

---

## 1. System Overview & Getting Started

EventSphere is an all-in-one trade expo virtualization platform. Access is structured around three dedicated portals:
1. **Organizer / Admin Console (`/admin`):** Full administrative authority to launch expos, configure floor plan stalls, review commercial documentation, manage keynote schedules, monitor real-time footfall analytics, and resolve attendee inquiries.
2. **Exhibitor Commercial Hub (`/exhibitor`):** Dedicated commercial portal for organizations to submit participation applications, select and secure floor stalls, configure corporate showcase profiles, and communicate with attendees.
3. **Attendee Explorer (`/events`):** Delegate portal to explore trade expos, reserve keynote conference seats, bookmark agendas, chat with stall exhibitors, and download personal data archives.

---

## 2. Role-by-Role Operations Guide

### 2.1 Administrator / Event Organizer

#### Launching a Trade Exhibition
1. Sign in with administrative credentials at `/login`.
2. From the sidebar, click **"Manage Expos"** (`/admin/expos`).
3. Click the **"Create Exhibition"** button in the upper right.
4. Fill in the Expo Title, Theme/Industry, Start & End Dates, Venue, and City.
5. Click **"Save Exhibition"** or toggle status to **"Published"** to make it publicly discoverable.

#### Setting Up Floor Plan Stalls
1. In the sidebar, select **"Floor Plans & Booths"** (`/admin/booths`).
2. Choose your exhibition from the dropdown selector.
3. Use the **"Bulk Generate Matrix"** button to quickly generate a grid (e.g., 4 rows × 5 columns = 20 stalls).
4. Alternatively, click **"Add Single Stall"** to place custom Island or Premium stalls with custom pricing and dimensions.
5. The interactive SVG/CSS floor plan will render immediately with real-time status indicators (Available: Slate, Allocated: Emerald/Brand).

#### Reviewing Exhibitor Applications
1. Navigate to **"Exhibitor Applications"** (`/admin/applications`).
2. Filter applications by status (`Pending`, `Approved`, `Rejected`).
3. Click on any application card to inspect the company profile, proposed products, and attached business certificates (PDF/JPG).
4. Click **"Approve Application"** to grant stall reservation privileges, or **"Reject"** with custom feedback remarks.
5. The system will automatically dispatch an in-app notification and email alert to the exhibitor.

#### Keynote Scheduling & Hall Conflict Prevention
1. Go to **"Event Schedule"** (`/admin/schedule`).
2. Select your exhibition and click **"Add Keynote Session"**.
3. Enter Title, Speaker Name & Bio, Conference Hall (e.g., *Hall A*), Start Time, End Time, and Room Seating Capacity.
4. **Automated Conflict Protection:** If another session is already scheduled in *Hall A* during an overlapping time window, the system will highlight the clash and reject the conflict before saving.

#### Executive Analytics & CSV Export
1. Navigate to **"Analytics & Reports"** (`/admin/analytics`).
2. View real-time KPI cards: Total Attendees, Commercial Revenue Realized, Stall Occupancy Rate, and Keynote Seat Fill %.
3. Switch between tabs:
   - **Engagement Trends:** Daily time-series line chart of registrations and stall visits.
   - **Booth Traffic:** Bar chart ranking top stalls by physical visitor footfall.
   - **Keynote Popularity:** Seating capacity comparison and high-demand warnings.
4. Click **"Export CSV"** to download instant audit reports for offline spreadsheets.

---

### 2.2 Commercial Exhibitor

#### Applying for Exhibition Space
1. Register an account at `/register` selecting the **"Commercial Exhibitor"** role.
2. Sign in and navigate to **"My Applications"** (`/exhibitor/applications`).
3. Click **"Apply for Expo"** and select your target trade show.
4. Enter your Company Name, Business Email, Contact Phone, and upload your official incorporation or tax certificate.
5. Submit the application for organizer review.

#### Reserving Your Exhibition Stall
1. Once your application is marked **"Approved"**, navigate to **"Floor Plan & Select Booth"** (`/exhibitor/booths`).
2. Review the interactive floor plan layout. Stalls display dimensions, price, and category tags (Standard, Premium, Corner).
3. Click on any vacant stall card (marked *Available*).
4. Click **"Confirm & Secure Booth"**. The stall is atomically locked to your account with zero double-booking risk.
5. Your neighbor exhibitors in adjacent stalls will display in your portal for commercial networking.

#### Managing Company Profile Showcase
1. Go to **"Company Profile & Showcase"** (`/exhibitor/profile`).
2. Upload your high-resolution corporate logo and banner.
3. Add your company overview, website URL, and key product showcase tags.
4. Attendees browsing the **"Exhibitor Directory"** will view your profile and can initiate direct messages.

---

### 2.3 Conference Attendee / Delegate

#### Discovering Expos & Reserving Keynote Seats
1. Register or sign in with an **"Attendee"** account.
2. Click **"Browse Expos"** (`/events/browse`) to view upcoming trade shows.
3. Select an exhibition to open its full detail view with schedule tabs and floor plans.
4. Navigate to the **"Schedule"** tab.
5. Click **"Reserve Seat"** on any keynote conference session. The room seating capacity counter increments automatically.
6. Click the **Bookmark** (ribbon) icon to save keynotes to your personal agenda (`/events/my-schedule`).

#### Automated 30-Minute Session Reminders
- The EventSphere background scheduler automatically monitors your registered keynotes.
- Approximately 30 minutes before your session begins, you will receive:
  1. A real-time Bell notification in your header with direct room navigation.
  2. A clean HTML email reminder confirming the speaker, topic, and hall location.

#### Direct Networking & Support Inquiries
- Click **"Exhibitor Directory"** (`/events/exhibitors`) to explore participating companies.
- Click **"Chat with Exhibitor"** to open a direct real-time chat thread.
- Need organizer assistance? Click the **Help/Question Mark icon** in the top header to submit a support ticket.

---

## 3. Privacy & GDPR Self-Service Controls

Every registered user can access the **Privacy & Data Governance** modal from the sidebar or header:
- **Active Consent Verification:** Displays your recorded consent timestamp compliant with GDPR Article 6.
- **Download My Data (Article 20):** Click **"Download Personal Data (.JSON)"** to receive a complete machine-readable archive of your account profile, session bookings, stall applications, and direct message history.
- **Delete Account (Article 17):** In the Danger Zone, enter your password and click **"Confirm Permanent Deletion"**. The system purges your personal credentials, cancels registrations, and releases any allocated stalls back to the floor plan.

---

## 4. Frequently Asked Questions (FAQs)

**Q: Can two exhibitors book the same stall simultaneously?**  
A: No. EventSphere implements atomic database locking via `findOneAndUpdate({ _id, status: 'available' })`. If two exhibitors click simultaneously, the first request secures the stall, and the second receives a clear notification that the stall is no longer available.

**Q: Can attendees send direct messages to other attendees?**  
A: To protect attendees from unsolicited spam and commercial harassment, direct messaging is restricted by policy: Attendees can message Commercial Exhibitors and Organizers, but cannot initiate unsolicited chats with other attendees.

**Q: What happens if an exhibitor's application is rejected?**  
A: The exhibitor receives an email and in-app notification detailing the organizer's remarks (e.g., missing certificates). The exhibitor can update their documentation and re-apply.

**Q: How do I export audit data to Excel?**  
A: In the Admin Analytics dashboard (`/admin/analytics`), click the **"Export CSV"** dropdown button and choose *Executive Overview*, *Engagement Timeline*, *Floor Plan & Booths*, or *Keynote Sessions*. The downloaded `.csv` file opens directly in Microsoft Excel, Google Sheets, or Apple Numbers.
