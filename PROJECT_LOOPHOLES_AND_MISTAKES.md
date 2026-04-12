# SkillForge Complete Project Loopholes & Hidden Mistakes Audit

After a comprehensive code review of the entire SkillForge full-stack repository, several critical security loopholes, architectural flaws, and hidden logic mistakes were identified. 

---

## 1. Security & Authentication Loopholes

### A. Predictable Magic Links (`uniqueCodeGenerator.ts`)
**Location:** `Backend/src/HR/services/uniqueCodeGenerator.ts`
**Issue:** The `uniqueCode` token sent to developers via email (Magic Link) is generated using `Math.random().toString(36)`. This is highly predictable and computationally trivial to guess. A malicious actor could easily brute-force recent tokens and join interviews masquerading as other developers.
**Fix:** Use a cryptographically secure method like `crypto.randomBytes(32).toString('hex')`.

### B. Severe Cross-Tenant Data Forgery in Submissions
**Location:** `Backend/src/HR/Controller/AnswerController.ts` & `CodeController.ts`
**Issue:** When a developer submits an answer (`submitAnswer`) or code (`submitCodeAnswer`), the backend strictly relies on the `interviewId` provided in the HTTP request body. It **does not verify** if the currently logged-in developer (from `req.devId`) actually owns that `interviewId`. A developer could forge the `interviewId` and overwrite another developer's test answers.
**Fix:** Validate that the `interviewId` belongs to `req.devId` in the database before proceeding with `upsert`.

### C. Zero WebSocket Authentication (`SocketHandle.ts`)
**Location:** `Backend/Services/SocketHandle.ts`
**Issue:** Anyone who connects to the WebSocket URL can emit events like `join-room`, `code-change`, and `open-code-editor` by simply guessing or knowing the room ID (which is just the `interviewId`). There is no Handshake Authentication verifying that the socket connection belongs to an authorized HR or Developer.
**Fix:** Implement standard Socket.IO middleware using JWT validation before allowing room connections.

### D. URL-Based Role Impersonation
**Location:** `Frontend/src/Home/Interviewroom.tsx`
**Issue:** The frontend determines UI layouts (like whether to show HR controls vs Candidate views) solely by checking `searchParams.get("role") === "HR"`. A developer can trivially append `?role=HR` to their URL and bypass frontend restrictions to see HR tools.
**Fix:** Authorization states must be derived securely from an API endpoint `/me` backed by HTTP-only cookies, not from URL parameters.

---

## 2. Server-Crashing Logic Mistakes

### A. Fragile Cron Job Error Handling (`CheckDeadline.ts`)
**Location:** `Backend/src/Dev/Services/CheckDeadline.ts`
**Issue:** The `try/catch` block encapsulates the **entire** loop for expiring tasks.
```typescript
for (const task of expiredTasks) {
  await redis.del(`magic:${task.developer.uniqueCode}`);
  await prisma.task.update({ ... });
}
```
If a single `redis.del` or `prisma.update` fails for ONE task, the error is caught outside the loop, causing the cron job to crash for all subsequent tasks. Those tasks will permanently remain stuck in the `PENDING` state despite missing their deadlines.
**Fix:** Move the `try/catch` inside the `for` loop so individual task failures do not abort the entire batch.

### B. No Database Transaction Handling
**Location:** `Backend/src/HR/Controller/TaskController.ts` (`assignTask`)
**Issue:** The system creates a `Task` and updates the `TaskLibrary.usedCount` as two completely separate Prisma calls. If the first succeeds and the server crashes before the second, your database statistics fall out of sync.
**Fix:** Wrap related queries in `$prisma.$transaction()`.

---

## 3. Financial & Integration Loopholes

### A. Unlimited Judge0 Code Execution
**Location:** `Backend/src/HR/Controller/CodeController.ts` (`runCode`)
**Issue:** The `/api/code/run` endpoint directly forwards `sourceCode` to the Judge0 compiler. There is no rate limiting, payload capping, or execution-count limit per user. A malicious developer can run an infinite while-loop spam script, drastically increasing your Judge0 computation costs and leading to a potential Denial of Wallet (DoW) attack.
**Fix:** Implement IP/User rate-limiting using Redis and restrict max payload sizes.

### B. Stripe Webhook Replay Attacks Possible
**Location:** `Backend/src/HR/Controller/SubscriptionController.ts`
**Issue:** The Stripe webhook verifies signatures, which is good, but there is no mechanism to prevent replay attacks if a webhook is received multiple times. It blindly upserts and updates based on the payload.
**Fix:** Track processed Stripe Event IDs in the local database to ensure idempotency.

---

## 4. UI / Error Handling Flaws

### A. Unsafe AI JSON Parsing
**Location:** `Backend/src/HR/Controller/QuestionController.ts` & `AnswerController.ts`
**Issue:** The system expects the Groq AI model to strictly return JSON. It attempts to strip markdown with `.replace(/```json|```/g, "")`. If the AI hallucinates conversational text outside the ticks (e.g., "Here are your questions: [ ... ]"), the backend `JSON.parse` will throw a 500 fatal error, disrupting the HR workflow completely.
**Fix:** Enforce Strict JSON output via the AI model parameters (`response_format: { type: "json_object" }`) or use robust regex extraction.

### B. Token Blacklisting is Missing
**Location:** `Backend/src/HR/Controller/AuthController.ts`
**Issue:** Logging out simply calls `res.clearCookie()`. However, the JWTs are fundamentally stateless and have an expiry time up to 7 days. If a token is stolen before logout, it remains perfectly valid on the backend because there is no Redis Blacklist verifying token revocations.
**Fix:** Add incoming token signatures to a Redis blacklist upon logout.
