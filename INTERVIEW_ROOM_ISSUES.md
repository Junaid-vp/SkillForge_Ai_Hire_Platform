# 🔴 Interview Room — Critical Bugs & Loopholes

## Table of Contents

- [Bug 1: Screen Share Disconnects When LeetCode Starts](#bug-1-screen-share-disconnects-when-leetcode-starts)
- [Bug 2: No Way Back to Interview Room After Code Submission](#bug-2-no-way-back-to-interview-room-after-code-submission)
- [Bug 3 – 11: Interview Room Loopholes](#loopholes-found-in-interview-room)

---

## Bug 1: Screen Share Disconnects When LeetCode Starts

### What Happens

When HR clicks **"Open Code Editor for Developer"**, the developer is **navigated away** from the
InterviewRoom to a completely different route (`/interview/:id/code-editor`). This causes:

1. **The InterviewRoom component unmounts** → the cleanup function runs
2. Cleanup calls `peerRef.current?.destroy()` and `screenPeerRef.current?.destroy()`
3. Cleanup calls `socket.emit("leave-room")` and `disconnectSocket()`
4. **All WebRTC connections (video + screen share) are killed**
5. HR sees the "user left" toast and loses the video feed entirely

### Root Cause

```
InterviewRoom.tsx → Line 1497–1516 (open-code-editor socket listener)
```

```typescript
// Developer receives this event and navigates AWAY from the interview
socket.on("open-code-editor", (data) => {
  navigate(`/interview/${interviewId}/code-editor?...`);  // ← FULL PAGE NAVIGATION
});
```

React Router's `navigate()` unmounts InterviewRoom and mounts CodeEditor as a separate page.
The cleanup effect at **line 1540–1558** then destroys everything:

```typescript
return () => {
  streamRef.current?.getTracks().forEach((t) => t.stop());     // kills camera
  screenStreamRef.current?.getTracks().forEach((t) => t.stop()); // kills screen share
  peerRef.current?.destroy();                                    // kills video peer
  screenPeerRef.current?.destroy();                              // kills screen peer
  socket.emit("leave-room", interviewId);                        // tells HR "user left"
  disconnectSocket();                                            // kills socket entirely
};
```

### How to Fix

**Option A: Embed the Code Editor inside the InterviewRoom (Recommended)**

Instead of navigating to a new route, render the CodeEditor as a **panel/modal** within InterviewRoom.
This keeps WebRTC alive because InterviewRoom never unmounts.

```
InterviewRoom.tsx — changes needed:

1. Add state: const [showCodeEditor, setShowCodeEditor] = useState(false)
2. Add state: const [leetcodeData, setLeetcodeData] = useState(null)
3. On "open-code-editor" event → setShowCodeEditor(true) + setLeetcodeData(data)
   (instead of navigate())
4. Render: {showCodeEditor && <CodeEditor data={leetcodeData} onComplete={() => setShowCodeEditor(false)} />}
5. CodeEditor becomes the main view, video becomes a small PiP overlay
```

**Option B: Open Code Editor in a new browser tab**

```typescript
// Instead of navigate(), open a new tab
socket.on("open-code-editor", (data) => {
  const url = `/interview/${interviewId}/code-editor?...`;
  window.open(url, "_blank");  // new tab, InterviewRoom stays alive
});
```

> ⚠️ Option B has a problem: the `useBrowserMalpractice` hook will fire a
> TAB_SWITCH / WINDOW_BLUR alert when the new tab opens.
> You'd need to add an exception for the code-editor tab.

---

## Bug 2: No Way Back to Interview Room After Code Submission

### What Happens

After the developer submits both LeetCode problems in the CodeEditor, they are **stuck** on the
code editor page with no way to return to the interview room. There is:

- ❌ No "Return to Interview" button
- ❌ No socket event like `coding-complete` or `return-to-interview`
- ❌ No auto-redirect after all problems are submitted
- ❌ HR has no way to "recall" the developer back

The developer can only manually edit the URL or hit back in the browser, but that would create
a **new** InterviewRoom instance with a fresh socket connection (previous state is lost).

### Root Cause

```
CodeEditor.tsx → Line 220–262 (submitSolution function)
```

After submitting, the component only does:

```typescript
updateCurrent({ submitted: true })
toast.success("✅ Solution submitted!")

// Auto-switch to next problem if exists
if (activeQuestion < questions.length - 1) {
  setTimeout(() => handleQuestionChange(activeQuestion + 1), 800)
}
// ← NOTHING happens after the LAST problem is submitted
```

There is no logic for "all problems done → go back".

### How to Fix

**If using Option A above (embedded editor):**
The `onComplete` callback would simply do `setShowCodeEditor(false)` and the interview
room is instantly visible again. This is the cleanest solution.

**If keeping separate routes:**

Add this logic to CodeEditor after the last submission:

```typescript
// In submitSolution(), after updateCurrent({ submitted: true }):

const allSubmitted = Object.values(questionStates).every(s => s.submitted);
// also check the one we just submitted
const updatedStates = { ...questionStates, [activeQuestion]: { ...current, submitted: true } };
const allDone = Object.values(updatedStates).every(s => s.submitted);

if (allDone) {
  // 1. Notify HR via socket
  getSocket().emit("coding-complete", { interviewId });

  // 2. Show completion message
  toast.success("All problems submitted! Returning to interview...");

  // 3. Navigate back after brief delay
  setTimeout(() => {
    navigate(`/DevInterviewRoom/${interviewId}?role=Developer&name=...`);
  }, 2000);
}
```

And add the corresponding socket handler in the backend:

```typescript
// SocketHandle.ts
socket.on("coding-complete", (data: { interviewId: string }) => {
  socket.to(data.interviewId).emit("coding-complete", data);
});
```

And in InterviewRoom, HR receives:

```typescript
socket.on("coding-complete", () => {
  toast("✅ Developer finished all coding problems!", { icon: "💻" });
  setLeetcodeStartTime(null); // stop elapsed timer
});
```

---

## Loopholes Found in Interview Room

### Bug 3: Malpractice Detection Hooks Are NOT Being Used

**Severity: 🔴 CRITICAL**

The three malpractice detection hooks exist as files but are **never imported or called**
in the InterviewRoom component:

| Hook | File | Purpose | Used? |
|------|------|---------|-------|
| `useMalpracticeDetection` | `Hooks/useMalpracticeDetection.ts` | Face/gaze detection via MediaPipe | ❌ NO |
| `useObjectDetection` | `Hooks/useObjectDetection.ts` | Phone/book/person detection | ❌ NO |
| `useBrowserMalpractice` | `Hooks/useBrowserMalpractice.ts` | Tab switch, blur, copy detection | ❌ NO |

The InterviewRoom only listens for `malpractice-alert` events from the socket (to display
toasts on the HR side), but **no developer-side code actually sends** those events because
the hooks are never activated.

**Fix:** Add these hooks to InterviewRoom:

```typescript
// Inside InterviewRoom component, after state declarations:

useBrowserMalpractice(interviewId, !isHR);
useMalpracticeDetection(interviewId, localVideoRef, !isHR);
useObjectDetection(interviewId, localVideoRef, !isHR);
```

---

### Bug 4: No Malpractice Detection in Code Editor

**Severity: 🔴 CRITICAL**

Even after fixing Bug 3, when the developer navigates to the CodeEditor page:

- The InterviewRoom unmounts → all malpractice hooks stop
- The CodeEditor has **zero** malpractice detection
- Developer can freely tab-switch, use phones, get help from others
- The coding portion is the **most cheat-prone** part of the interview

**Fix:** Either embed the editor (Option A from Bug 1) so malpractice hooks stay alive,
or import and activate the browser malpractice hook inside CodeEditor:

```typescript
// In CodeEditor.tsx:
import { useBrowserMalpractice } from "../../Hooks/useBrowserMalpractice"

// Inside component:
useBrowserMalpractice(interviewId, true)
```

---

### Bug 5: Socket Singleton Can Leak Across Pages

**Severity: 🟡 MEDIUM**

The socket service (`Service/socket.ts`) uses a singleton pattern:

```typescript
let socket: Socket | null = null;
export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3005", { withCredentials: true });
  }
  return socket;
};
```

The InterviewRoom cleanup calls `disconnectSocket()` which sets `socket = null`.
But if the CodeEditor calls `getSocket()` before the cleanup runs, it reuses the
same socket instance. After cleanup runs, that socket is disconnected but the
CodeEditor still holds a reference to the dead socket.

**Result:** `code-result` events from the CodeEditor may silently fail to reach HR.

**Fix:** Don't disconnect the socket when navigating to code editor. Only disconnect
on `endCall()`. Or use the embedded approach (Option A).

---

### Bug 6: Developer Can Impersonate HR via URL params

**Severity: 🔴 CRITICAL**

The role is determined entirely by the URL query parameter:

```typescript
const role = searchParams.get("role") ?? "HR";
```

A developer can manually change `?role=Developer` to `?role=HR` in the URL and gain
access to:
- Generate questions
- View expected answers and AI evaluations
- View interview notes
- Open code editor controls
- See all scores

**Fix:** Verify the role on the server side. The `isDeveloper` middleware already validates
developer tokens. Do the same check when joining the interview room:

```typescript
// On socket "join-room", verify the token cookie and determine role server-side
// Send the role back: socket.emit("role-confirmed", { role: "Developer" })
```

---

### Bug 7: No Authentication on Socket Connection

**Severity: 🔴 CRITICAL**

The socket server accepts **any** connection without checking authentication:

```typescript
// SocketHandle.ts
io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  // ← No auth check. Anyone can connect.
});
```

Anyone can connect to the socket, join any interview room by guessing/knowing the
interviewId, and:
- Listen to all Q&A questions and answers
- Send fake malpractice alerts
- Send fake chat messages
- Disrupt the interview

**Fix:** Add socket authentication middleware:

```typescript
io.use((socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  // Parse and verify JWT from cookies
  // Attach user info to socket.data
  // Reject if invalid
});
```

---

### Bug 8: No Authorization Check on Room Join

**Severity: 🟡 MEDIUM**

Even with socket auth, there's no check that the user is actually part of the interview:

```typescript
socket.on("join-room", (interviewId: string) => {
  socket.join(interviewId);  // ← Anyone can join any room
});
```

**Fix:** Verify the user (HR or Developer) is associated with this `interviewId`
in the database before allowing them to join the room.

---

### Bug 9: Developer Can Submit Answers After Timer Expires

**Severity: 🟡 MEDIUM**

The timer runs client-side only. A developer can:
1. Let the timer expire (auto-submit fires with "No answer provided")
2. Quickly modify the answer text and call `submitAnswer()` manually before the
   auto-submit's API call completes
3. Or simply disable JavaScript timer via DevTools

The backend `/questions/answer/submit` endpoint does **not** validate whether the
time limit has been exceeded.

**Fix:** Track question send time server-side. Reject answers submitted after
`sentAt + timeLimit + gracePeriod`.

---

### Bug 10: Code Editor Has No Submission Limit

**Severity: 🟡 MEDIUM**

The developer can run code unlimited times. While `runCount` is tracked, it's
purely informational. A developer could:
- Run code 100+ times, brute-forcing test cases
- Keep modifying and re-running after "submitting" (submitted flag is client-side only)

The backend `submitCodeAnswer` uses `upsert` on `questionId`, so repeated submissions
just overwrite the previous one.

**Fix:**
- Add a max run count server-side
- Reject submissions after the first successful submit for a given questionId
- Or add a `submittedAt` timestamp check to reject late overwrites

---

### Bug 11: HR Can End Interview Without Completing Q&A

**Severity: 🟢 LOW**

HR can click "End Call" at any point, even mid-question. There's no confirmation
dialog or state check. This is more of a UX issue than a security loophole, but
it means interviews can be accidentally terminated.

**Fix:** Add a confirmation modal before ending:

```typescript
const endCall = () => {
  if (qaStarted && evaluations.length < techQuestions.length) {
    // Show confirmation: "Q&A is still in progress. Are you sure?"
  }
  // proceed with cleanup
};
```

---

## Priority Summary

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Screen share dies on code editor navigate | 🔴 Critical | Medium |
| 2 | No return path after code submission | 🔴 Critical | Low |
| 3 | Malpractice hooks never activated | 🔴 Critical | Low |
| 4 | No malpractice detection in code editor | 🔴 Critical | Low |
| 5 | Socket singleton leak across pages | 🟡 Medium | Low |
| 6 | Developer can impersonate HR via URL | 🔴 Critical | Medium |
| 7 | No socket authentication | 🔴 Critical | Medium |
| 8 | No room join authorization | 🟡 Medium | Medium |
| 9 | Timer bypass — client-side only | 🟡 Medium | Medium |
| 10 | Unlimited code runs / re-submissions | 🟡 Medium | Low |
| 11 | No end-call confirmation | 🟢 Low | Low |

## Recommended Fix Order

1. **Bug 1 + 2 + 4** → Embed CodeEditor inside InterviewRoom (fixes all three at once)
2. **Bug 3** → Add malpractice hook calls (3 lines of code)
3. **Bug 6 + 7 + 8** → Add socket auth + server-side role verification
4. **Bug 5** → Resolved automatically if using embedded approach
5. **Bug 9 + 10** → Add server-side time/submission validation
6. **Bug 11** → Add confirmation dialog
