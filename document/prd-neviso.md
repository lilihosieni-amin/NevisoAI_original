# Product Requirements Document (PRD)
## Neviso (neviso.ir) — AI-Powered Smart Note-Taking Platform

---

| Field | Value |
|---|---|
| Product Name | Neviso (neviso.ir) |
| Document Version | 1.4 |
| Primary Audience | University Students in Iran |
| Internal Audience | Neviso operations & support staff (Backoffice) |
| UI Language | Persian (RTL) |
| Payment Gateway | Zarinpal and Iranian gateways |
| Revenue Model | Prepaid credits (with discounted credit bundles) |

---

## 1. Executive Summary

Neviso is an AI-powered platform that helps students transform their class voice recordings and handwritten note photos into clean, structured, and editable digital notes. The core goal is to reduce the time students spend on note-writing while improving the overall quality of their study materials.

By offering a fully Persian, mobile-friendly experience, Neviso allows students to upload a voice recording or board photo right after class and receive a well-formatted note within minutes. Additional features include a rich-text editor, folder-based organization, PDF export, and an AI chatbot students can query about their own course content.

Neviso's business model is built on **prepaid credits**: users buy credits up front (like a phone top-up) and spend them as they create notes and chat. Larger, discounted **credit bundles** — ideally aligned to an academic term — serve as the "subscription" option, but renewal is a manual repurchase rather than an automatic recurring charge, which fits students' seasonal usage and Iranian payment habits. Credits do not expire, so nothing a user pays for is ever lost.

---

## 2. Problem Statement

Students spend hours in class each day, yet producing complete, organized notes from those sessions is time-consuming, frustrating, and often incomplete. Most students either skip note-taking altogether or end up with scattered, unusable materials — a problem that compounds severely during exam season.

**Why now?**
AI tools accessible to Iranian students are either not available in Persian, lack the ability to process voice and images together, or provide no organized interface for managing notes over time. Neviso fills all three gaps in one product.

---

## 3. User Personas

### Persona 1 — Ali, Engineering Student
- **Age:** 21
- **Behavior:** Prefers listening in class over writing; revisits notes later but has forgotten key details
- **Pain point:** Notes are scattered and he has no time to organize them before exams
- **Expectation from Neviso:** Upload the class voice and have a ready-to-study note

### Persona 2 — Maryam, Medical Student
- **Age:** 24
- **Behavior:** Records voice AND takes photos of the board; deals with high-volume content
- **Pain point:** Merging voice and images into one coherent note is difficult
- **Expectation from Neviso:** Download a clean PDF for offline study

### Persona 3 — Reza, Part-Time Working Student
- **Age:** 26
- **Behavior:** Rarely has free time; wants results with minimum effort
- **Pain point:** Has no time to write notes and borrows them from classmates
- **Expectation from Neviso:** Fewest clicks possible, maximum output; mobile access

---

## 4. User Stories

### Module 1 — Authentication & Profile

**US-01: OTP Login**
> As a new student, I want to log in with my mobile number and a verification code so that I don't have to set a password on my first visit.

**Acceptance Criteria:**
- [ ] The login page displays both methods (OTP / Password) simultaneously
- [ ] For first-time users, only OTP login is enabled; the password field is disabled
- [ ] After the first login, the user can set a password from their profile settings
- [ ] From that point on, login with mobile + password is also available

---

**US-02: Free Credit on First Login**
> As a new user, I want to automatically receive free credits upon first login so that I can try the system without purchasing anything.

**Acceptance Criteria:**
- [ ] Free credits are added to the account immediately after the first successful login
- [ ] The user can see their current credit balance in their dashboard
- [ ] Free credits are granted only once per account

---

### Module 2 — Upload & Note Generation

**US-03: Upload Voice and Images**
> As a student, I want to upload my class voice recording and photos so that the AI can generate a clean note for me.

**Acceptance Criteria:**
- [ ] Voice upload is supported (common audio formats)
- [ ] Image upload is supported (whiteboard photos, book pages)
- [ ] Multiple files can be uploaded in a single session
- [ ] Before upload begins, the system checks the user's credit balance; if insufficient, an error message is shown
- [ ] The user selects a destination folder or creates a new one
- [ ] The user can optionally enter a date for the recording; if left blank, today's date is used
- [ ] After processing, the AI generates a suggested name for the note

---

**US-04: View and Edit a Note**
> As a student, I want to view the AI-generated note and edit it so that the final result matches exactly what I need.

**Acceptance Criteria:**
- [ ] The note is displayed in a Rich Text Editor
- [ ] The editor supports: font change, text color, highlight, bold/italic/underline, lists, tables, and text alignment
- [ ] The note name is editable
- [ ] The user can play the original voice recording from within the same page
- [ ] Changes are saved automatically or via an explicit save button

---

### Module 3 — Note Organization

**US-05: Folder Management**
> As a student, I want to organize my notes into subject folders so that I can find them easily.

**Acceptance Criteria:**
- [ ] The user can create a new folder with a name and an optional cover image
- [ ] Selecting a folder during upload is mandatory
- [ ] Notes can be moved between folders
- [ ] Folders are displayed as cards or a list in the user dashboard

---

**US-06: Delete a Note**
> As a student, I want to delete a note I no longer need.

**Acceptance Criteria:**
- [ ] The user can delete any note they own
- [ ] A confirmation prompt is shown before deletion
- [ ] Deleting a note does not refund the credits used to generate it

---

### Module 4 — Export

**US-07: Export as PDF**
> As a student, I want to download my note or an entire folder as a PDF so that I can study offline.

**Acceptance Criteria:**
- [ ] A single note can be exported as PDF
- [ ] The exported PDF includes a Neviso watermark
- [ ] The user can export all notes in a folder together as a combined PDF

---

### Module 5 — AI Chatbot

**US-08: Chat with Notes**
> As a student, I want to ask the AI questions about my course content so that I can clarify things I didn't fully understand.

**Acceptance Criteria:**
- [ ] The user must first select a folder to chat with (required)
- [ ] Upon folder selection, all notes in that folder are automatically selected as context
- [ ] The user can then manually deselect individual notes or narrow the selection down to a single note (optional)
- [ ] When the user asks a question, the AI searches through the selected folder's notes to find the most relevant information, rather than reading every document entirely — ensuring faster and more precise answers
- [ ] The AI responds based strictly on the retrieved content from the user's notes; it does not use outside knowledge
- [ ] Every conversation is saved to history
- [ ] The user can return to any previous conversation and continue it (similar to ChatGPT)

---

### Module 6 — Subscription & Payment

**US-09: Purchase a Plan or Credits**
> As a student, I want to purchase the right plan for my needs so that I can continue using the platform.

**Acceptance Criteria:**
- [ ] The plans page shows both options: one-time credit packs and larger discounted credit bundles ("plans")
- [ ] Payment is processed through an Iranian gateway (Zarinpal) as a one-time payment (no automatic recurring charge)
- [ ] After a successful payment, credits are added to the account automatically and do not expire
- [ ] The user receives a payment receipt
- [ ] A history of past purchases is visible in the user dashboard

---

### Module 7 — In-App Notifications

**US-10: Note Processing Notification**
> As a student, I want to receive an in-app notification when my note has finished processing so that I know it's ready to view without having to manually check.

**Acceptance Criteria:**
- [ ] When a note finishes processing (success or failure), an in-app notification is automatically generated
- [ ] A notification badge/counter appears on the notification bell icon in the header
- [ ] The user can open a notification panel to see all recent notifications
- [ ] Each notification shows: note title, folder name, status (ready / failed), and timestamp
- [ ] Tapping a "ready" notification takes the user directly to that note
- [ ] Tapping a "failed" notification takes the user to the upload page with an error explanation
- [ ] The user can mark individual notifications as read or mark all as read at once
- [ ] Unread notifications persist across sessions (survive page refresh and re-login)
- [ ] The notification panel shows a maximum of the last 50 notifications
- [ ] Read notifications are visually distinct from unread ones

---

### Module 8 — Backoffice / Admin Panel

> The Backoffice is an internal-only application hosted on a **separate subdomain** (`admin.neviso.ir`), used by Neviso operations and support staff. It is never exposed to end users. Access is restricted to accounts explicitly provisioned as admins, with a two-step login (password, then a one-time code).

**US-11: Two-Step Admin Login**
> As an admin, I want to sign in with my email and password and then confirm with a one-time code so that the backoffice stays protected even if my password leaks.

**Acceptance Criteria:**
- [ ] The admin panel lives on its own subdomain, fully separate from the student dashboard
- [ ] Login is two steps: first email + password, then a one-time code (OTP)
- [ ] The OTP is sent to the admin's registered mobile number
- [ ] A failed first step (wrong password) never reveals whether the email exists
- [ ] Regular student accounts can never authenticate into the backoffice, and admin accounts can never authenticate into the student app
- [ ] Admin sessions expire faster than student sessions and require re-login after a short idle period

---

**US-12: View & Search Users**
> As an admin, I want to browse and search the user base so that I can find a specific account quickly when handling support.

**Acceptance Criteria:**
- [ ] The admin can see a paginated list of all users
- [ ] The admin can search by mobile number, display name, or user ID
- [ ] The admin can filter by status (active / suspended / banned) and by whether the user has ever paid
- [ ] Opening a user shows: profile details, current credit balance, status, folders/notes count, subscription state, transaction history, and recent activity
- [ ] No admin can see a user's password (only that one is set or not)

---

**US-13: Adjust Credit Balance**
> As an admin, I want to manually add or remove credits from a user's account so that I can issue refunds, compensate for incidents, or correct mistakes.

**Acceptance Criteria:**
- [ ] The admin can add or subtract a credit amount on any user account
- [ ] A reason note is **required** for every manual adjustment
- [ ] The adjustment is recorded as a credit transaction visible in the user's history
- [ ] The user's live credit balance updates immediately
- [ ] Every adjustment is written to an audit log with the acting admin, amount, reason, and timestamp

---

**US-14: Suspend, Ban & Reactivate Users**
> As an admin, I want to suspend or ban abusive accounts and later reactivate them so that I can protect the platform while keeping mistakes reversible.

**Acceptance Criteria:**
- [ ] The admin can suspend a user (temporary, optionally with an end date) or ban a user (indefinite)
- [ ] A reason is **required** when changing a user's status
- [ ] A suspended or banned user cannot log in or use the API; they see a clear, polite message explaining the state
- [ ] The admin can reactivate a suspended or banned user at any time
- [ ] Every status change is recorded in the audit log

---

**US-15: Impersonate a User (Support)**
> As an admin, I want to view the app as a specific user so that I can reproduce and diagnose problems they report.

**Acceptance Criteria:**
- [ ] The admin can start an impersonation session for a chosen user
- [ ] While impersonating, the admin sees the student app exactly as that user would, with a persistent banner indicating impersonation is active and a one-click exit
- [ ] Impersonation is **read-only for sensitive actions**: it cannot make purchases, spend credits, change the user's password, or delete the user's data
- [ ] Impersonation sessions are short-lived and expire automatically
- [ ] Starting and ending an impersonation session is recorded in the audit log

---

**US-16: Grant or Cancel a User's Subscription**
> As an admin, I want to manually activate or deactivate a plan for a specific user so that I can comp a subscription (support, partnerships, compensation) or revoke one without needing a payment to flow through the gateway.

**Acceptance Criteria:**
- [ ] The admin can grant (activate) any active plan to a specific user without a payment, setting it as that user's current subscription
- [ ] When granting a subscription plan, the start date is now and the end date is computed from the plan's duration (or an admin-specified end date)
- [ ] Granting a plan applies its credit allowance to the user, recorded as a credit transaction
- [ ] The admin can cancel (deactivate) a user's active subscription, with a mandatory reason; the user immediately loses subscription status
- [ ] Cancelling a subscription does **not** automatically claw back credits already granted (separate manual adjustment if needed)
- [ ] A manually granted subscription is distinguishable from a paid one (it is marked as admin-granted)
- [ ] Both granting and cancelling are recorded in the audit log

---

**US-17: Manage Plans & Pricing**
> As an admin, I want to create and edit subscription plans and credit packs so that pricing can change without a code deployment.

**Acceptance Criteria:**
- [ ] The admin can create a new plan (subscription or credit pack) with name, price, credit amount, and duration
- [ ] The admin can edit an existing plan
- [ ] The admin can activate or deactivate a plan; deactivated plans are hidden from the public pricing page but remain attached to existing subscriptions
- [ ] Editing a plan's price does not retroactively change the price already paid by existing subscribers
- [ ] Every plan change is recorded in the audit log

---

**US-18: View Payments & Transactions**
> As an admin, I want to review payments and credit movements so that I can reconcile revenue and investigate billing disputes.

**Acceptance Criteria:**
- [ ] The admin can see a paginated list of all payments with status (pending / paid / failed)
- [ ] The admin can filter payments by status, date range, and plan, and search by user
- [ ] Opening a payment shows the user, plan, amount, gateway reference, and timestamps
- [ ] The admin can see, per user, the full credit transaction history (purchases, usage, refunds, free grants, manual adjustments)

---

**US-19: Analytics Dashboard**
> As an admin, I want an at-a-glance dashboard of platform health so that I can track growth and spot problems early.

**Acceptance Criteria:**
- [ ] The dashboard shows headline numbers: total users, active users, new signups, total notes generated, processing success rate, active subscriptions, and total revenue
- [ ] The admin can pick a time range (e.g., last 7 / 30 / 90 days)
- [ ] Trend charts are shown for signups over time, revenue over time, and notes generated over time
- [ ] The dashboard reflects the conversion rate from active users to paying users
- [ ] All figures respect the selected time range

---

**US-20: Choose OTP Delivery Channel**
> As an admin, I want to choose how login codes are delivered — by SMS, by the Bale messenger, or letting the user pick — so that I can match delivery to cost, reliability, and what our users actually use.

**Acceptance Criteria:**
- [ ] The admin can set the OTP mode to one of: SMS only, Bale only, or both
- [ ] When set to a single channel, all login codes go out on that channel
- [ ] When set to both, the login screen lets the user choose SMS (پیامک) or Bale (بله), and a returning user's choice is remembered
- [ ] Because Bale delivers in-app, a phone with no Bale account cannot receive a Bale code; in "both" mode the system falls back to SMS automatically, and in "Bale only" mode the user sees a clear message to use another method
- [ ] Changing the OTP mode is recorded in the audit log

---

## 5. Functional Requirements

### Authentication
- **FR-01:** The system must display both login methods (OTP and password) on a single login page.
- **FR-02:** For first-time users, only OTP login is active; the password field is visually disabled.
- **FR-03:** After the first login, the user can define a password from their profile panel.
- **FR-04:** The system automatically grants free credits to new users upon their first successful login.

### Upload & Processing
- **FR-05:** The system must verify the user's credit balance before the upload process begins.
- **FR-06:** If credits are insufficient, the system must display a clear error message and offer a direct link to the purchase page.
- **FR-07:** After successful processing, the AI produces the note body and a suggested title.
- **FR-08:** Both the suggested title and the note body must be editable by the user.
- **FR-09:** If the user does not enter a recording date, the system automatically uses today's date.

### Organization
- **FR-10:** Selecting a folder during upload is mandatory.
- **FR-11:** The user can create a new folder during the upload flow, with a name and an optional cover image.
- **FR-12:** The system must allow notes to be moved between folders.
- **FR-13:** Each folder can have a name and an optional cover image.

### Editor
- **FR-14:** The rich text editor must include: bold, italic, underline, text color, highlight, ordered/unordered lists, tables, and text alignment.
- **FR-15:** The user must be able to play the original voice recording from within the note editor page.

### Export
- **FR-16:** The system must provide PDF export for individual notes.
- **FR-17:** All exported PDFs must include a Neviso watermark.
- **FR-18:** The user must be able to export all notes in a folder as a combined PDF.

### Chatbot
- **FR-19:** The user must select a folder before starting a chat session (required).
- **FR-20:** Upon folder selection, all notes within that folder are automatically included as context.
- **FR-21:** The user can optionally deselect individual notes or reduce the context to a single note.
- **FR-22:** All chat conversations are saved to the user's history.
- **FR-23:** The user can reopen any past conversation and continue from where they left off.

### In-App Notifications
- **FR-27:** The system must create an in-app notification record whenever a note processing job completes (success or failure).
- **FR-28:** The notification bell icon in the header must display an unread count badge when there are unread notifications.
- **FR-29:** Each notification must include: note title, folder name, status (DONE / FAILED), and creation timestamp.
- **FR-30:** Clicking a "note ready" notification must navigate the user directly to that note's editor page.
- **FR-31:** Clicking a "note failed" notification must navigate the user to the upload page with a contextual error message.
- **FR-32:** Notifications must be marked as read when the user opens the notification panel or clicks on a specific notification.
- **FR-33:** Unread notification state must persist in the database and survive session re-authentication.
- **FR-34:** The notification panel must display the most recent 50 notifications, sorted newest first.

### Payment
- **FR-24:** The system must offer two purchase models: periodic subscription and direct credit top-up.
- **FR-25:** Payment must be processed through an Iranian payment gateway.
- **FR-26:** Credits must be added to the user's account instantly upon successful payment.

### Backoffice — Access & Authentication
- **FR-35:** The backoffice must be served from a dedicated subdomain (`admin.neviso.ir`), isolated from the student application.
- **FR-36:** Admin authentication must be two-step: email + password, followed by a one-time code (OTP) sent to the admin's registered mobile.
- **FR-37:** Student credentials and tokens must never grant access to backoffice operations, and admin credentials and tokens must never grant access to student operations.
- **FR-38:** Admin sessions must have a shorter lifetime than student sessions and require re-authentication after a short idle period.
- **FR-39:** Admin accounts must support roles with different permission levels (e.g., super admin, admin, support); the panel must hide or disable actions a role is not permitted to perform.

### Backoffice — User Management
- **FR-40:** The system must provide a paginated, searchable list of users (search by mobile, display name, or ID).
- **FR-41:** Admins must be able to filter users by account status and paying/non-paying.
- **FR-42:** Admins must be able to view a full user profile including credit balance, status, content counts, subscription, and transaction history.
- **FR-43:** Admins must be able to manually adjust a user's credit balance; a reason is mandatory and the change is logged as a credit transaction.
- **FR-44:** Admins must be able to suspend (optionally time-bound), ban, or reactivate a user; a reason is mandatory for suspend/ban.
- **FR-45:** Suspended or banned users must be blocked from authenticating and from using the API, and shown a clear status message.
- **FR-46:** Admins must be able to impersonate a user in read-only-for-sensitive-actions mode (no purchases, no credit spend, no password change, no data deletion), with a visible banner and automatic expiry.
- **FR-47:** Admins must be able to manually grant (activate) an active plan to a specific user without a payment, applying the plan's credit allowance and computing the subscription period from the plan's duration (or an admin-specified end date); admin-granted subscriptions must be marked as such.
- **FR-48:** Admins must be able to cancel (deactivate) a user's active subscription with a mandatory reason; cancellation removes subscription status immediately and does not automatically reverse previously granted credits.

### Backoffice — Plans, Payments & Analytics
- **FR-49:** Admins must be able to create, edit, and activate/deactivate plans (subscriptions and credit packs); deactivating a plan hides it from the public pricing page without affecting existing subscriptions.
- **FR-50:** Admins must be able to view and filter all payments (by status, date range, plan, and user) and view per-user credit transaction history.
- **FR-51:** The system must provide an analytics dashboard with headline KPIs and trend charts (signups, revenue, notes generated) over a selectable time range.

### Backoffice — Auditing
- **FR-52:** Every state-changing admin action (credit adjustment, status change, subscription grant/cancel, impersonation start/stop, plan change, admin login) must be recorded in an immutable audit log capturing the acting admin, action, target, reason/metadata, and timestamp.

### Backoffice — OTP Delivery
- **FR-53:** Admins must be able to set the OTP delivery mode to SMS-only, Bale-only, or both; the setting takes effect at runtime without a deployment and is recorded in the audit log.
- **FR-54:** When both channels are enabled, the login flow must let the user choose their delivery channel and remember the choice for next time; when one channel is enabled, that channel is used without prompting.
- **FR-55:** When Bale cannot deliver to a phone that has no Bale account, the system must fall back to SMS if available, or otherwise show the user a clear Persian message to use another method.

---

## 6. Design & UX Requirements

- **Language & Direction:** The entire UI is in Persian (RTL layout).
- **Responsiveness:** The platform must display correctly across all screen sizes (mobile, tablet, desktop).
- **PWA:** The user dashboard must be implemented as a Progressive Web App so that mobile users can install it on their home screen.
- **Landing Page:** The public homepage introduces the product, highlights key features, displays pricing plans, and includes a clear login/signup CTA.
- **Real-time Feedback:** Every operation (upload, processing, payment) must display a clear status indicator (processing / success / failed).
- **Navigation Guard:** If the user attempts to leave the page during an active upload, a warning prompt must be shown.
- **In-App Notifications:** A persistent notification bell icon in the dashboard header shows unread count. The notification panel slides in from the side and lists all recent processing events with direct navigation links.
- **Backoffice:** The admin panel is a separate, internal-only web application on `admin.neviso.ir`. It is **desktop-first** (operations staff work on larger screens), in Persian (RTL), and is **not** a PWA and **not** publicly linked from the student app or landing page. It prioritizes dense, scannable data tables, clear status indicators, and confirmation prompts on every destructive action (suspend, ban, credit removal). An impersonation session must always show a prominent, persistent banner with a one-click exit.

---

## 7. Out of Scope — Version 1

The following will not be built in the first release:

- Video file upload and processing
- Note sharing between users
- AI-generated quizzes or tests from notes
- Support for non-student personas (employees, corporate meeting use cases)
- Voice type selection before processing (lecture, meeting, etc.)
- Login via Google or Apple accounts
- Native iOS or Android applications
- Word (.docx) export
- Self-service admin sign-up (admins are provisioned manually / by a super admin only)
- Granular custom permission builder for admins (only the fixed roles below ship in v1)
- Admin content editing of user notes (admins can view via impersonation but not edit user note content in v1)
- Bulk user operations (mass credit grants, mass messaging) — deferred

---

## 8. Future Roadmap

### Version 2 — Audience Expansion
- Add an "Employee" persona to the platform
- Allow users to select voice type before processing (university lecture / work meeting / conference)
- Generate context-specific outputs: study notes / meeting minutes / negotiation summaries
- Use dedicated AI prompts per content type for improved output quality

### Version 3 — Active Learning
- Auto-generate multiple-choice and open-ended questions from notes
- Offer in-platform quizzes based on each folder's content
- Provide a performance report highlighting weak areas per subject

---

## 9. Success Metrics (KPIs)

| Metric | 3-Month Target |
|---|---|
| Registered Users | 1,000 |
| Conversion to Paying Users | 15% of active users |
| Total Notes Generated | 5,000 |
| 30-Day User Retention | 40% |
| User Satisfaction Score (CSAT) | Above 4 out of 5 |
| Average Note Generation Time | Under 3 minutes |

---

## 10. Risks & Assumptions

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI output quality is poor for noisy recordings or regional accents | Medium | High | Test with real samples; provide easy in-app editing |
| Users abuse the free credit system with multiple accounts | High | Medium | Verify identity via real Iranian mobile number (OTP) |
| Iranian payment gateway experiences downtime | Medium | High | Support multiple payment gateways |
| AI API costs exceed projections | Medium | High | Calculate credit consumption based on audio duration |

**Key Assumptions:**
- Iranian students are willing to pay for a useful, Persian-first tool
- The majority of users will access the platform via mobile
- Classroom voice recordings are of sufficient quality for AI processing

---

## 11. Open Questions

- ~~How should credits be calculated — per upload, or based on audio duration?~~ **Resolved:** by audio duration (1 credit/minute), plus 2/image and 1/chat message.
- ~~Can a user merge multiple voice recordings into a single note?~~ **Resolved:** yes — a single note accepts multiple audio/image files in one upload.
- ~~Should the PDF watermark be text-based, image-based, or both? Is it customizable?~~ **Resolved:** text-based ("نویسو | neviso.ir"), configurable.
- ~~Do subscription plans have a note count limit, or is it unlimited?~~ **Resolved:** no separate note limit — usage is bounded only by the user's credit balance.
- **Still open — chatbot history retention:** how long should chatbot conversation history be kept per session?
- **Still open — free-grant framing:** the signup grant is 20 credits; decide how this is communicated (e.g. "enough for ~X notes"), which depends on final pricing.

---

*This document is maintained by the Neviso product team and serves as the primary reference for design, engineering, and marketing.*
