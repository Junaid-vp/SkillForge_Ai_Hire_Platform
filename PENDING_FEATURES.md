# SkillForge Pending Features Audit

This document lists features that are visibly incomplete or partially wired in the current codebase, based on source review of `Frontend/src` and `Backend/src`.

---

## 1) Developer Task Submission Flow (Not Implemented)

### Current status
- Developer dashboard shows a **Submit Task** button, but click handler is empty.
- No backend endpoint exists for developer task submission.
- Task can expire, but there is no submit path to move status from `PENDING` to `SUBMITTED`.

### Files involved
- `Frontend/src/Dev/Page/DevDashBoard.tsx`
  - `onClick={() => { /* submit task */ }}`
- `Backend/src/HR/Routes/TaskRoute.ts`
  - Only has task assignment route.
- `Backend/src/HR/Controller/TaskController.ts`
  - Only handles assign logic.

### What to build
- **Frontend**
  - Task submission modal/page (text, repository URL, file upload, optional notes).
  - API call for submit.
- **Backend**
  - New route, e.g. `POST /api/task/submit`.
  - Validate developer ownership and task deadline.
  - Persist submission payload and mark task `SUBMITTED`.
  - Optionally trigger email/notification to HR.

---

## 2) Code Editor Round Is Incomplete

### Current status
- Interview room emits `open-code-editor` and navigates developer to:
  - `/interview/:interviewId/code-editor?...`
- No frontend route/component exists for that path.
- Backend has socket relay for code events, but no dedicated API/persistence for code run history.

### Files involved
- `Frontend/src/Home/Interviewroom.tsx`
  - Emits and navigates to code editor path.
- `Frontend/src/Routes.tsx`
  - No route for `/interview/:interviewId/code-editor`.
- `Backend/Services/SocketHandle.ts`
  - Has `open-code-editor` and `code-result` socket events.

### What to build
- Create `CodeEditor` page/component and add route.
- Add execution UI + question switcher for 2 LeetCode questions.
- Add backend API (optional but recommended) to save code attempts and final submission.

---

## 3) HR Interview Feedback Module (Marked Coming Soon)

### Current status
- Developer detail section shows "Interview Feedback — Coming Soon".
- No endpoint currently returns structured HR feedback summary tied to interview evaluation.

### Files involved
- `Frontend/src/HR/Components/InterviewSection.tsx`
  - Explicit "Coming Soon" placeholder block.

### What to build
- Persist feedback model (rating, strengths, concerns, recommendation).
- Add HR submit endpoint and fetch endpoint.
- Replace placeholder with real data view and edit flow.

---

## 4) Submission Report / AI Report Section (Marked Coming Soon)

### Current status
- Task section has "Submission Report — Coming Soon" placeholder.
- Current app does evaluate Q&A answers, but no unified "task submission report" module is shown.

### Files involved
- `Frontend/src/HR/Components/TaskSection.tsx`
  - Explicit "Coming Soon" block.
- `Backend/src/HR/Controller/AnswerController.ts`
  - Evaluates interview answers, not take-home task submission package/report.

### What to build
- Store task submission artifacts.
- Generate report (score, checks, summary) and expose via API.
- Render report UI in `TaskSection`.

---

## 5) Notification Settings Persistence (UI Only)

### Current status
- Notification toggles work only in local component state.
- No API call or DB persistence.
- Settings reset on refresh.

### Files involved
- `Frontend/src/HR/Components/Notification.tsx`
  - Local `useState` only.

### What to build
- Add notification preferences fields in DB (per HR).
- Add endpoints:
  - `GET /api/setting/notifications`
  - `PUT /api/setting/notifications`
- Wire frontend toggles to load/save with optimistic updates.

---

## 6) Malpractice Detection Hooks Present but Disabled

### Current status
- Browser malpractice, movement, and object detection hooks exist.
- All three are commented out in interview room, so feature is not active in live flow.

### Files involved
- `Frontend/src/Home/Interviewroom.tsx`
  - `useBrowserMalpractice`, `useMalpracticeDetection`, `useObjectDetection` commented.
- `Frontend/src/Hooks/useBrowserMalpractice.ts`
- `Frontend/src/Hooks/useMalpracticeDetection.ts`
- `Frontend/src/Hooks/useObjectDetection.ts`
- `Backend/Services/SocketHandle.ts`
  - Supports `malpractice` socket event.

### What to build
- Re-enable hooks behind feature flag.
- Add calibration/tuning controls to reduce false positives.
- Save malpractice events to DB for audit history.

---

## 7) Mobile Access Strategy Is Placeholder

### Current status
- UI shows "Mobile support coming soon."
- No real mobile-specific flow or fallback experience.

### Files involved
- `Frontend/src/HR/Components/DesktopGaurd.tsx`

### What to build
- Decide product direction:
  - Block mobile with strict message, or
  - Build responsive/mobile-safe interview mode.
- Implement based on policy.

---

## 8) Feature Completeness Gaps Around Task Lifecycle

### Current status
- Lifecycle has assignment + expiry cron.
- Missing explicit "in-progress/submitted/reviewed" developer-side progression workflow.
- `REVIEWED` status exists in schema enum but no complete flow observed in source.

### Files involved
- `Backend/prisma/schema.prisma` (task statuses)
- `Backend/src/Dev/Services/CheckDeadline.ts`
- `Backend/src/HR/Controller/TaskController.ts`
- `Frontend/src/Dev/Page/DevDashBoard.tsx`

### What to build
- Formal task lifecycle APIs:
  - start task, save draft, submit, HR review, mark reviewed.
- Add UI states for each stage.

---

## Recommended Implementation Order

1. Developer task submit API + UI (highest business impact).  
2. Add code editor route/component (currently dead navigation target).  
3. Complete submission report + HR feedback modules.  
4. Persist notification settings.  
5. Re-enable malpractice hooks with tuning + DB logging.  
6. Finalize mobile strategy.

---

## Notes

- This audit focuses on **feature completeness** (pending/incomplete behavior), not security/performance issues.
- Reviewed source directories:
  - `Frontend/src`
  - `Backend/src`
  - `Backend/Services`
