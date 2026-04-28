<div align="center">

<img src="https://www.skillforge-ai.com/favicon.svg" alt="SkillForge AI Logo" width="80" height="80" />

# SkillForge AI

### AI-Powered Technical Interview Platform

**One HR. One Interview. Zero Technical Knowledge Required.**

[![Live Platform](https://img.shields.io/badge/🌐_Live-skillforge--ai.com-2563eb?style=for-the-badge)](https://www.skillforge-ai.com)
[![Backend API](https://img.shields.io/badge/⚙️_API-api.skillforge--ai.com-0f172a?style=for-the-badge)](https://api.skillforge-ai.com)
[![Frontend](https://img.shields.io/badge/🖥️_Frontend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Junaid-vp/SkillForge_Ai_Hire_Platform/tree/main/Frontend)
[![Backend](https://img.shields.io/badge/⚙️_Backend-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Junaid-vp/SkillForge_Ai_Hire_Platform/tree/main/Backend)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-FF9900?style=flat&logo=amazonaws&logoColor=white)

</div>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Live Demo](#-live-demo)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Docker Setup](#-docker-setup)
- [Production Deployment](#-production-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security](#-security)
- [Project Structure](#-project-structure)
- [Author](#-author)

---

## 🎯 The Problem

Most companies run **two separate interviews** to hire one developer:

1. **HR Interview** — Communication, culture fit, negotiation
2. **Technical Interview** — Requires a senior engineer to sit in

**Why two interviews?**

Because HR managers don't have a technical background. They can't evaluate code. They can't judge if an answer is right or wrong. They depend entirely on a technical co-interviewer — which costs double the time, double the scheduling, and double the salary hours.

The result:
- ❌ Candidates wait days between interviews
- ❌ Engineers pulled away from their actual work
- ❌ HR has to trust gut feeling over data
- ❌ Great developers get rejected unfairly
- ❌ Confident but incompetent candidates get hired

**The system is broken — not because HR is bad. But because they were never given the right tools.**

---

## 💡 The Solution

**SkillForge AI** gives HR teams an AI co-interviewer that handles everything technical:

- 🤖 Generates role-specific questions from the developer's resume
- 📊 Evaluates every answer live with a score, feedback, and verdict
- 👁️ Monitors candidate behaviour in real time with AI proctoring
- 💻 Runs an in-browser code editor for live coding challenges
- 📦 Reviews take-home task code with AI — no engineer needed
- 📄 Generates a full PDF report with hire/reject recommendation

**One HR. One interview. Zero technical knowledge required.**

---

## 🌐 Live Demo

| URL | Description |
|-----|-------------|
| [www.skillforge-ai.com](https://www.skillforge-ai.com) | Frontend (Vercel) |
| [api.skillforge-ai.com](https://api.skillforge-ai.com) | Backend API (AWS EC2) |
| [api.skillforge-ai.com/api/health](https://api.skillforge-ai.com/api/health) | Health Check |

**Test credentials:**
> Register as HR at [www.skillforge-ai.com](https://www.skillforge-ai.com) — free plan gives 5 interviews/month, no credit card required.

---

## ✨ Core Features

### 🔐 Authentication System

**HR Authentication**
- Email + password registration with Bcrypt hashing (cost factor 12)
- JWT access tokens (15 min expiry) + refresh tokens (7 days) stored in Redis
- Auto-refresh on token expiry — seamless session management
- Company profile: name, designation, website

**Developer Authentication — Magic Link**
- Zero registration. Zero password. Zero friction.
- HR schedules interview → system generates `crypto.randomBytes(32)` token
- Token stored in Redis with 7-day TTL (one-time use, deleted after login)
- Magic link emailed to developer → one click → in the interview
- No account creation. No onboarding. Just show up.

---

### 📄 Resume Parsing + AI Summary

- HR uploads developer resume (PDF)
- Multer stores file in memory (no disk write)
- `pdf-parse` extracts raw text
- Groq AI (Llama 3.3 70B) extracts: name, email, position, experience, skills
- AI generates a 3-sentence candidate summary
- Resume PDF stored on Cloudinary
- Developer profile auto-created in database

---

### 🎥 Live Interview Room

Built entirely from scratch with **WebRTC + Socket.io**:

**Video System**
- Two simultaneous PeerJS connections:
  - Connection 1: Camera feed (face-to-face)
  - Connection 2: Screen share stream
- HR sees developer's face in PiP while viewing screen share full-screen
- Local video shown in bottom-right corner
- Streams persist even when navigating between panels

**Real-Time Features (Socket.io)**
- Live chat with message history (persisted in room state)
- Room state hydration on reconnect — full session restored
- Interview status auto-updated: SCHEDULED → STARTED → COMPLETED
- Both parties notified when the other disconnects/reconnects

**Session State Persistence**
- `roomStates` Map stores: Q&A state, current question, timer, messages, code editor state
- Developer who refreshes mid-session rejoins exactly where they left off
- Suspended interviews block developer on rejoin

---

### 🧠 AI Q&A System

**Question Generation**
- HR clicks "Generate Questions"
- Groq AI reads developer's position, experience, and parsed skills
- Generates **13 tailored technical questions** (Easy → Hard progression) + **2 LeetCode problems** with:
  - Estimated time to solve
  - Input/output examples
  - Constraints
- Questions stored in DB linked to the interview

**Live Q&A Session**
- HR sends one question at a time with 180-second countdown timer
- Developer answers in a textarea — timer auto-submits on expiry
- Answer POSTed to backend → Groq AI evaluates immediately
- Evaluation returned via Socket.io in real time:
  - Score: 0–10
  - Feedback: what was covered
  - Missing: what was not mentioned
  - Recommendation: Strong / Average / Weak
- HR sees live score + feedback for each question

---

### 👁️ AI Proctoring System

**Three independent detection layers — all in-browser, no video stored:**

**Layer 1 — MediaPipe FaceLandmarker (GPU accelerated)**
| Detection | Severity | Threshold |
|-----------|----------|-----------|
| No face detected | HIGH (+2 pts) | Any frame |
| Multiple faces | HIGH (+2 pts) | >1 face |
| Head turned sideways | MEDIUM (+1 pt) | >25° rotation |
| Looking up | MEDIUM (+1 pt) | >20° up |
| Looking down | MEDIUM (+1 pt) | >20° down |
| Eyes sideways | Soft (log only) | >0.75 score |
| Eyes looking down | Soft (log only) | >0.75 score |

**Layer 2 — MediaPipe ObjectDetector (EfficientDet Lite)**
| Detection | Severity |
|-----------|----------|
| Phone in frame | HIGH (+2 pts) |
| Book/notes visible | MEDIUM (+1 pt) |
| Extra laptop/tablet | HIGH (+2 pts) |
| Additional person | HIGH (+2 pts) |

**Layer 3 — Browser Events**
| Event | Severity |
|-------|----------|
| Tab switch | HIGH (+2 pts) |
| Window blur | MEDIUM (+1 pt) |
| Copy attempt | MEDIUM (+1 pt) |
| Right click | LOW (0 pts) |

**Warning Progression (socketHandler)**
```
0–2 pts  → Silent log (no notification)
3 pts    → ⚠️ First Warning (one toast to HR + banner to developer)
5 pts    → ⚠️ Second Warning
7 pts    → ⚠️ Final Warning
8+ pts   → 🚫 AUTO SUSPEND (Interview status → SUSPENDED in DB)
```

**HR Panel**
- Hover button shows live proctoring log with timestamps
- Progress bar showing warning level
- Manual suspend button available at 3+ warning points

**Developer Overlay**
- Warning banner appears (auto-dismisses in 6s)
- Full-screen suspend overlay blocks everything on suspension
- Suspend state persisted in `sessionStorage` — refresh doesn't help

---

### 💻 Monaco Code Editor

- Monaco Editor (VS Code engine) embedded inside the interview room
- Video call **stays alive** while developer codes — no page navigation
- Supports 20+ languages including: JavaScript, TypeScript, Python, Java, C++, Go, Rust, C#
- LeetCode questions shown in left panel with: description, constraints, input/output examples
- **Run code** → POST to Judge0 CE (RapidAPI) → real execution → output shown
- **Submit** → code saved to `CodeAnswer` model in DB
- HR sees live run results via Socket.io (language, status, execution time)
- HR timer starts when code editor is opened — HR sees elapsed time

---

### 📦 Task Library + AI Code Review

**Task Library**
- 35 default industry-standard tasks seeded across 7 categories:
  - Frontend, Backend, Full Stack, DevOps, Mobile, Database, Algorithms & DSA
- Balanced difficulty: 1 Easy + 2 Medium + 2 Hard per category
- HR can create custom tasks for their company

**Submission Flow**
1. Developer uploads ZIP file via Multer
2. `AdmZip` extracts code files (skips `node_modules`, `dist`, `build`)
3. Job queued in **RabbitMQ** (`task_evaluation` queue)
4. Worker picks up job (concurrency: 3 parallel evaluations)
5. Groq AI reviews extracted code:
   - Code Quality (30%)
   - Completeness (30%)
   - Correctness (20%)
   - Best Practices (20%)
6. AI detects: human-written % vs AI-generated % with confidence rating
7. Results saved to DB → HR notified via in-app notification
8. Retry logic: 3 attempts with exponential backoff
9. Fallback: if RabbitMQ is down, evaluation runs inline

---

### 📄 Reports + Email System

**PDF Report** (jsPDF)
- Cover: Developer name, position, company, date, overall score
- Q&A breakdown: each question, answer summary, AI score, feedback
- LeetCode results: problems, language, status
- Task evaluation: scores, strengths, improvements, AI detection result
- HR Notes: notes written during interview
- Final Verdict: HIRE / MAYBE / REJECT with rationale

**Email Composer**
- In-app modal: To (auto-filled), Subject (auto-filled by status), custom body
- HR writes personal message — not a predefined template
- Resend delivers email with PDF attached
- `replyTo` set to HR's real email — developer replies directly to HR

**Email Types by Status:**
- `EVALUATED` → PDF report + custom message
- `SUSPENDED` → Suspension notice (no PDF)
- `CANCELLED` → Cancellation notice (no PDF)

---

### 🔔 Notifications System

- Real-time notifications via Socket.io (`join-hr-notification` room)
- Notification types: `TASK_SUBMITTED`, `TASK_EVALUATED`, `INTERVIEW_REMINDER`
- HR configurable: toggle interviews / submissions / progress notifications
- Settings persisted in `NotificationSettings` DB table
- Dashboard shows last 6 notifications with relative timestamps

---

### ⏰ Cron Jobs (node-cron)

| Job | Schedule | Function |
|-----|----------|----------|
| Interview Reminders | Every minute | Email HR 24hrs before scheduled interviews |
| Task Expiry | Every hour | Mark overdue tasks as EXPIRED |
| Notification Cleanup | Daily midnight | Archive old read notifications |

---

### 💳 Payments (Stripe)

- Stripe Checkout session created on plan selection
- Webhook verifies payment with `stripe.webhooks.constructEvent`
- HR plan updated: `free` (5 interviews/month) → `pro` (unlimited)
- Interview limit enforced on every interview creation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  HR Browser ─────────────────── Developer Browser          │
│       │                                  │                  │
│  WebRTC (PeerJS)  ←──────────→  WebRTC (PeerJS)           │
│  P2P Video (no server relay)             │                  │
└──────────────────┬───────────────────────┘                  │
                   │ Socket.io                                │
                   │ REST API                                 │
         ┌─────────▼─────────┐                               │
         │    Nginx (EC2)     │  ← SSL termination           │
         │  Reverse Proxy     │    Let's Encrypt              │
         └─────────┬─────────┘                               │
                   │                                         │
         ┌─────────▼─────────┐                               │
         │  Node.js + Express │  ← Docker container          │
         │    Socket.io       │    Port 3005                  │
         │    PeerJS Server   │                               │
         └──┬──────┬──────┬──┘                               │
            │      │      │                                   │
   ┌────────▼─┐ ┌──▼───┐ ┌▼──────────┐                      │
   │  AWS RDS │ │Redis │ │ RabbitMQ  │                       │
   │PostgreSQL│ │Cache │ │  Queue    │                       │
   └──────────┘ └──────┘ └─────┬─────┘                      │
                                │                             │
                         ┌──────▼──────┐                     │
                         │  Worker     │ ← same container     │
                         │  (amqplib)  │   processes jobs     │
                         └──────┬──────┘                     │
                                │                             │
                         ┌──────▼──────┐                     │
                         │  Groq AI    │ ← external API       │
                         │ Llama 3.3   │                     │
                         └─────────────┘                     │
                                                              │
Frontend: Vercel (global CDN) ────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Build Tool | Vite |
| State Management | TanStack React Query |
| Form Handling | React Hook Form + Formik |
| Validation | Zod + Yup |
| Routing | React Router v6 |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| PDF Generation | jsPDF |
| Real-time | Socket.io Client |
| Video/WebRTC | PeerJS |
| HTTP Client | Axios |
| UI Components | Lucide React icons |
| Notifications | React Hot Toast |
| Performance | React.lazy() + Suspense (code splitting) |
| Deployment | Vercel |

### Backend

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (AWS RDS) |
| Cache | Redis (AWS ElastiCache) via ioredis |
| Message Queue | RabbitMQ (amqplib) |
| Real-time | Socket.io |
| WebRTC | PeerJS Server |
| AI | Groq SDK (Llama 3.3 70B) |
| PDF Parsing | pdf-parse |
| ZIP Handling | AdmZip |
| File Upload | Multer (memoryStorage) |
| Cloud Storage | Cloudinary |
| Auth | JWT + Bcrypt |
| Email | Resend + Nodemailer |
| Payments | Stripe |
| Code Execution | Judge0 CE (RapidAPI) |
| Scheduling | node-cron |
| Security | Helmet + express-rate-limit |
| Compression | compression (gzip) |
| Logging | Pino |
| Deployment | Docker + AWS EC2 |

### AI / ML

| Technology | Usage |
|-----------|-------|
| Groq AI (Llama 3.3 70B) | Question generation, answer evaluation, task code review, resume parsing |
| Google MediaPipe FaceLandmarker | Face detection, head pose estimation, eye gaze tracking |
| Google MediaPipe ObjectDetector | Phone, book, extra device, extra person detection |
| Judge0 CE | Live code execution (20+ languages) |

### Infrastructure

| Service | Purpose |
|---------|---------|
| AWS EC2 | Backend + RabbitMQ hosting |
| AWS RDS | Managed PostgreSQL database |
| AWS ElastiCache | Managed Redis cache |
| AWS ECR | Docker image registry |
| Vercel | Frontend hosting + CDN |
| Nginx | Reverse proxy + SSL termination |
| Let's Encrypt | Free SSL certificates |
| GitHub Actions | CI/CD pipeline |
| Cloudinary | Resume PDF storage |
| Spaceship | Domain registrar |

---

## 🗄️ Database Schema

```prisma
model HR {
  id                   String   @id @default(uuid())
  name                 String
  email                String   @unique
  password             String
  companyName          String?
  designation          String?
  companyWebsite       String?
  plan                 String   @default("free")
  interviewLimit       Int      @default(10)
  createdAt            DateTime @default(now())
  
  developers           Developer[]
  interviews           Interview[]
  notificationSettings NotificationSettings?
  notifications        Notification[]
  subscription         Subscription?
}

model Developer {
  id             String   @id @default(uuid())
  developerName  String
  developerEmail String
  position       String
  experience     Int
  skills         String   // pipe-separated: "React|Node.js|TypeScript"
  aiSummary      String?
  resumeUrl      String?
  hrId           String
  createdAt      DateTime @default(now())
  
  hr             HR         @relation(...)
  interviews     Interview[]
}

model Interview {
  id          String          @id @default(uuid())
  status      InterviewStatus @default(SCHEDULED)
  scheduledAt DateTime
  hrId        String
  developerId String
  createdAt   DateTime        @default(now())
  
  hr          HR              @relation(...)
  developer   Developer       @relation(...)
  questions   Question[]
  answers     Answer[]
  codeAnswers CodeAnswer[]
  note        InterviewNote?
  task        Task?
  malpractice MalpracticeLog[]
}

enum InterviewStatus {
  SCHEDULED
  STARTED
  COMPLETED
  CANCELLED
  SUSPENDED
}

model Question {
  id            String   @id @default(uuid())
  questionText  String
  difficulty    String
  orderIndex    Int
  isLeetcode    Boolean  @default(false)
  estimatedTime Int?     // minutes (LeetCode only)
  inputExample  String?
  outputExample String?
  constraints   String?
  interviewId   String
  
  answers       Answer[]
  codeAnswers   CodeAnswer[]
}

model Answer {
  id          String   @id @default(uuid())
  answerText  String
  score       Int?     // 0-10
  feedback    String?  // JSON: {feedback, missing, recommendation}
  interviewId String
  questionId  String
  submittedAt DateTime @default(now())
}

model CodeAnswer {
  id          String   @id @default(uuid())
  code        String
  language    String
  output      String?
  codeStatus  String?
  runCount    Int      @default(0)
  interviewId String
  questionId  String
  submittedAt DateTime @default(now())
}

model Task {
  id          String     @id @default(uuid())
  status      TaskStatus @default(PENDING)
  submittedAt DateTime?
  fileUrl     String?
  aiScore     Int?       // 0-10
  aiReport    Json?      // full evaluation object
  interviewId String     @unique
  taskLibraryId String
  
  taskLibrary TaskLibrary @relation(...)
}

enum TaskStatus {
  PENDING
  SUBMITTED
  EXPIRED
  REVIEWED
  EVALUATED
}

model TaskLibrary {
  id           String  @id @default(uuid())
  title        String
  description  String
  requirements String  // pipe-separated
  category     String
  techStack    String
  difficulty   String  // Easy | Medium | Hard
  duration     Int     // days
  isDefault    Boolean @default(false)
  hrId         String?
}

model MalpracticeLog {
  id          String   @id @default(uuid())
  type        String
  message     String
  severity    String
  isSoft      Boolean  @default(false)
  timestamp   DateTime
  interviewId String
}
```

---




## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{interviewId, role}` | Join interview room |
| `send-peer-id` | `{interviewId, peerId}` | Share WebRTC peer ID |
| `send-screen-peer-id` | `{interviewId, screenPeerId}` | Share screen peer ID |
| `screen-share-stopped` | `interviewId` | Notify screen share ended |
| `send-message` | `{interviewId, message, senderName, senderRole}` | Send chat message |
| `start-qa` | `interviewId` | HR starts Q&A session |
| `send-question` | `{interviewId, questionId, questionText, orderIndex, total, timeLimit}` | HR sends question |
| `answer-submitted` | `{interviewId, questionId}` | Dev submits answer |
| `open-code-editor` | `{interviewId, questions}` | HR opens code editor |
| `code-result` | `{interviewId, questionId, output, status, language}` | Dev runs code |
| `coding-complete` | `{interviewId}` | Dev finishes coding |
| `malpractice` | `{interviewId, type, message, severity, timestamp}` | Hard violation detected |
| `malpractice-soft` | `{interviewId, type, message, timestamp}` | Soft violation detected |
| `suspend-interview` | `interviewId` | HR manually suspends |
| `end-call-explicitly` | `interviewId` | End interview |
| `leave-room` | `interviewId` | Leave room |

### Server → Client
| Event | Description |
|-------|-------------|
| `receive-peer-id` | Relay peer ID to other party |
| `receive-screen-peer-id` | Relay screen peer ID |
| `screen-share-stopped` | Notify screen share ended |
| `receive-message` | Deliver chat message |
| `init-room-state` | Send current room state on join |
| `qa-started` | Q&A session started |
| `receive-question` | New question sent to developer |
| `answer-submitted` | Notify HR answer submitted |
| `answer-evaluated` | AI evaluation result |
| `open-code-editor` | Open Monaco editor for developer |
| `code-result` | Code execution result |
| `coding-complete` | Developer finished coding |
| `malpractice-log` | Malpractice event for HR log |
| `malpractice-warning` | Warning milestone reached |
| `interview-suspended` | Interview suspended |
| `user-left` | Other party disconnected |
| `end-call-explicitly` | Interview ended |
| `interview-status-changed` | Status updated in DB |

---

## 🔒 Environment Variables

### Backend `.env`

```bash
# ── Server ────────────────────────────────
NODE_ENV=production
PORT=3005

# ── Database (AWS RDS) ────────────────────
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/skillforgedb

# ── Redis (AWS ElastiCache) ───────────────
REDIS_URL=redis://:password@elasticache-endpoint:6379

# ── JWT ───────────────────────────────────
ACCESS_TOKEN_KEY=your_access_secret_min_32_chars
REFRESH_TOKEN_KEY=your_refresh_secret_min_32_chars

# ── CORS ──────────────────────────────────
FRONTEND_URL=https://www.skillforge-ai.com

# ── AI ────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key

# ── Cloudinary ────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Stripe ───────────────────────────────
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_price_id

# ── Email ─────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=SkillForge AI <your@gmail.com>

# ── Message Queue ─────────────────────────
RABBITMQ_URL=amqps://user:pass@cloudamqp-host/vhost

# ── Code Execution ────────────────────────
JUDGE0_API_KEY=your_rapidapi_key

# ── Domain ───────────────────────────────
EMAIL_DOMAIN=skillforge-ai.com
```

### Frontend `.env`

```bash
VITE_API_URL=https://api.skillforge-ai.com
```

---

## 🖥️ Local Development

### Prerequisites

```bash
Node.js >= 20
PostgreSQL >= 15
Redis >= 7
Docker (optional)
```

### 1. Clone the repository

```bash
git clone https://github.com/Junaid-vp/SkillForge_Ai_Hire_Platform.git
cd SkillForge_Ai_Hire_Platform
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in all values in .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed default tasks
npx ts-node prisma/seed.ts

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Set VITE_API_URL=http://localhost:3005

# Start development server
npm run dev
```

### 4. Start Redis locally

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using Homebrew (macOS)
brew services start redis
```

### 5. Start RabbitMQ locally

```bash
# Using Docker (includes management UI at localhost:15672)
docker run -d \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=password \
  rabbitmq:3-management-alpine

# Set in .env:
# RABBITMQ_URL=amqp://admin:password@localhost:5672
```

---

## 🐳 Docker Setup

### Build and run everything with Docker Compose

```bash
# Copy environment file
cp .env.production .env

# Build and start all services
docker-compose up -d --build

# Run migrations after first start
docker-compose exec backend npx prisma migrate deploy

# Seed default tasks
docker-compose exec backend npx ts-node prisma/seed.ts

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

### Services started by Docker Compose

| Service | Port | Description |
|---------|------|-------------|
| backend | 3005 | Node.js API |
| frontend | 80 | React (Nginx) |
| postgres | 5432 | PostgreSQL |
| redis | 6379 | Redis cache |

---

## 🚀 Production Deployment

### Infrastructure Overview

```
skillforge-ai.com    → Vercel (Frontend)
api.skillforge-ai.com → AWS EC2 (Backend + Nginx + SSL)
Database              → AWS RDS PostgreSQL
Cache                 → AWS ElastiCache Redis
Queue                 → RabbitMQ (CloudAMQP)
Images                → AWS ECR
```

### AWS EC2 Setup

```bash
# SSH into EC2
ssh -i skillforge-key.pem ubuntu@13.206.3.10

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io awscli
sudo usermod -aG docker ubuntu

# Install Nginx + Certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/skillforge
# (See nginx.conf in repo root)

sudo ln -s /etc/nginx/sites-available/skillforge /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d api.skillforge-ai.com

# Create .env file
nano /home/ubuntu/.env
# (Fill all environment variables)
```

### DNS Configuration (Spaceship)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 13.206.3.10 | 300 |
| A | api | 13.206.3.10 | 300 |
| A | www | 13.206.3.10 | 300 |

---

## ⚙️ CI/CD Pipeline

GitHub Actions automatically deploys on every push to `main`:

```
git push origin main
       ↓
[Build Job]
1. Checkout code
2. Configure AWS credentials
3. Login to Amazon ECR
4. cd Backend → docker build
5. Tag with git SHA
6. Push image to ECR

[Deploy Job]
7. SSH into EC2 (appleboy/ssh-action)
8. AWS ECR login on EC2
9. docker image prune -af (free disk space)
10. docker pull new image
11. docker rm -f skillforge-app
12. docker run new container (--env-file /home/ubuntu/.env)
13. Health check verification
14. ✅ Zero-downtime deployment complete
```

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key |
| `EC2_USERNAME` | EC2 SSH username (ubuntu) |
| `SSH_PRIVATE_KEY` | Full contents of .pem file |

---

## 🛡️ Security

| Layer | Implementation |
|-------|---------------|
| HTTP Headers | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| Rate Limiting | 100 req/15min general, 10 req/15min auth, 20 req/hr AI |
| Password Hashing | Bcrypt (cost factor 12) |
| Token Storage | JWT in Redis (not localStorage) |
| Magic Links | crypto.randomBytes(32) — one-time use, 7-day TTL |
| SQL Injection | Prisma ORM parameterized queries |
| CORS | Strict origin whitelist |
| SSL/TLS | Let's Encrypt (A+ rating) |
| Video Privacy | WebRTC P2P — no video stored server-side |
| Detection Privacy | MediaPipe runs 100% in-browser — no frames sent to server |

---


## 🗺️ Roadmap

### ✅ V1 — Live (Current)

- [x] Live video interview room (WebRTC)
- [x] AI question generation + live evaluation
- [x] 3-layer AI malpractice detection
- [x] Monaco code editor with Judge0 execution
- [x] Take-home task system + AI code review
- [x] PDF reports + email composer
- [x] Magic link developer authentication
- [x] Stripe subscription (Free + Pro)
- [x] RabbitMQ task evaluation queue
- [x] GitHub Actions CI/CD
- [x] AWS production infrastructure

### 🔄 V2 — Coming Soon

- [ ] Candidate self-practice portal
- [ ] Interview recording + playback
- [ ] Advanced analytics dashboard
- [ ] ATS integrations (Greenhouse, Lever, Workday)
- [ ] Multi-interviewer support (panel interviews)
- [ ] Mobile app (React Native)
- [ ] Multi-language interview support
- [ ] AI interview coaching for developers
- [ ] Bulk interview scheduling

---

## 👨‍💻 Author

**Mohammed Junaid VP**

Full Stack Developer | AI Integration Specialist

[![GitHub](https://img.shields.io/badge/GitHub-Junaid--vp-181717?style=flat&logo=github)](https://github.com/Junaid-vp)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mohammed_Junaid-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/your-linkedin)

---

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ by Mohammed Junaid VP**

*SkillForge AI — Where Skills Are Forged, Not Just Tested*

[![Live Platform](https://img.shields.io/badge/🌐_Try_It_Live-skillforge--ai.com-2563eb?style=for-the-badge)](https://www.skillforge-ai.com)

</div>