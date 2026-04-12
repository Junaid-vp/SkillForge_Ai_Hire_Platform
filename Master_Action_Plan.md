# SkillForge: 1-Week Master Action Plan (Including Deployment)

Since we have a full week, we are pivoting from a "rush MVP" approach to a **Production-Ready Engineering** approach. This means we will build real, scalable features, secure the application, and deploy it properly.

Here is your comprehensive day-by-day roadmap:

---

## Phase 1: Security & Stability (Days 1 & 2)
Before building new features, we must ensure the house doesn't fall down.

1. **Frontend Route Protection:** 
   - Implement a `<ProtectedRoute />` wrapper.
   - Redirect unauthenticated users trying to hit `/dashboard` back to login.
2. **Environment & Secrets Audit:** 
   - Ensure strictly separated `.env` files.
   - Restrict CORS on the Backend to only accept requests from your trusted frontend URLs.
3. **Purge Debugging Code:** 
   - Remove the ~30 `console.log()` statements floating around the backend and frontend. Protect your data structure from leaking in the console.
4. **Global Error Handling:** 
   - Implement universal try/catch blocks or an Express error-handling middleware so the backend sends clean 400/500 JSON errors instead of crashing the server.

---

## Phase 2: Feature Completion (Days 3 & 4)
Now we wire up the missing buttons and flows.

1. **Task Submission Flow:**
   - **Backend:** `POST /submit-task` to update the DB.
   - **Frontend:** Fix the dead `Submit Task` button in `DevDashBoard.tsx`. Add a modal for link submissions.
2. **Interview Feedback schema:**
   - Instead of the "Coming Soon" page in `InterviewSection.tsx`, build a form for HRs to submit final scores/feedback when a call ends.
3. **Status Lifecycle:**
   - Trigger the transition from `STARTED` -> `COMPLETED` seamlessly.
4. **Automated Nodemailer Setup:**
   - Once feedback is recorded, dispatch an automated HTML-templated email to the developer.

---

## Phase 3: Real-Time & Polish (Day 5)
Elevating the UX to feel like a premium SaaS.

1. **Real-time Notifications:**
   - Implement `Socket.io` connection to replace dummy notifications. Warn the HR instantly when a Developer completes a task or enters the waiting room.
2. **Mobile Layout Fixes:**
   - Remove the `DesktopGaurd.tsx` block ("Mobile support coming soon") and apply responsive Tailwind utility classes (`md:flex`, `hidden`) to ensure basic usability on smartphones.

---

## Phase 4: Production Deployment (Days 6 & 7)
Getting the app onto the public internet safely.

1. **Frontend Hosting (Vercel / Netlify):**
   - Setup CI/CD build scripts for Vite/React.
2. **Backend Hosting (Render / AWS EC2 / Railway):**
   - Connect your GitHub repo for automated deploys. 
   - Provision environment variables securely in the cloud dashboard.
3. **Database Hosting (Neon / Supabase / Render PG):**
   - Migrate your Prisma schema to a managed PostgreSQL cluster.
4. **Final Smoke Test:**
   - End-to-end testing (Sign up as HR -> Invite Dev -> Join Room -> Assign Task -> Complete Interview).

---

# Next Immediate Step
To start this 7-day process right now, we need to begin with **Phase 1: Frontend Route Protection**. 

Shall we write the `ProtectedRoute.tsx` wrapper to lock down your dashboards?
