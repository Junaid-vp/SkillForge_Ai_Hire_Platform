# SkillForge Recommended Architecture & Folder Restructure

To resolve the domain-leakage and scaling issues in your current setup, here is the recommended Enterprise-scale MVC directory structure. 

This correctly separates your **Config/Models** from your **Business Logic** and groups files by their technical purpose, making it much easier to maintain as your application grows.

---

## 1. Backend Restructure (Layered MVC)

Currently, your backend splits folders by **Role** (`HR` and `Dev`). The industry standard for Express applications is to separate by **Technical Layer** (Controllers, Routes, Services) and keep shared configurations global.

```text
Backend/
├── prisma/
│   ├── schema.prisma       # Your single source of truth (The Model layer)
│   └── seed.ts             # Database seeders
├── src/
│   ├── config/             # 🌍 GLOBAL Configurations (Moved out of HR folder!)
│   │   ├── prisma.ts       # Database singleton
│   │   ├── redis.ts        # Redis client & startup
│   │   └── env.ts          # Environment variable validations
│   ├── controllers/        # 🎮 Route Handlers (Req/Res logic only)
│   │   ├── auth.controller.ts        # Merged HR & Dev login/register
│   │   ├── interview.controller.ts
│   │   ├── task.controller.ts
│   │   ├── question.controller.ts
│   │   └── code.controller.ts        # Now correctly shared, not hidden in HR 
│   ├── services/           # 🧠 Business Logic & External API Calls
│   │   ├── email.service.ts          # All nodemailer logic
│   │   ├── answer.service.ts         # Handles the Groq AI evaluation logic
│   │   ├── subscription.service.ts   # Stripe webhook logic
│   │   └── compiler.service.ts       # Judge0 calling logic
│   ├── routes/             # 🛣️ Express Route Definitions
│   │   ├── auth.routes.ts
│   │   ├── interview.routes.ts
│   │   └── task.routes.ts
│   ├── middlewares/        # 🛡️ Protection & Validation
│   │   ├── auth.middleware.ts        # Contains isHr and isDeveloper
│   │   └── validateReq.ts            # Zod or schema validation checks
│   ├── utils/              # 🛠️ Helpers
│   │   ├── generateOTP.ts
│   │   ├── tokenGenerator.ts
│   │   └── resumeParser.ts
│   ├── sockets/            # 🔌 Realtime Events
│   │   └── socketHandler.ts          # Socket authentication & event mapping
│   ├── types/              # 🏷️ Global Types
│   │   └── index.d.ts                # JwtPayload, Request extensions
│   └── cron/               # ⏰ Background Jobs
│       └── deadlineChecker.ts        # Expiry task loops (with fixed try/catch)
├── server.ts               # Application entry point
└── .env
```

### Why this is better:
1. **No Cross-importing:** `Dev` routes no longer need to import `prisma` from the `HR` folder. Both simply import from `src/config/prisma`.
2. **Thin Controllers:** Moving AI calls (Groq) and Third-party calls (Stripe/Judge0) into the `services/` layer makes controllers incredibly easy to read and test.

---

## 2. Frontend Restructure (Feature-Driven Design)

The Frontend currently mixes generic layouts and massive core features (like the `Interviewroom.tsx`) into generic folders like `Home`. 

```text
Frontend/
├── src/
│   ├── api/                # Axios interceptors & base config
│   ├── assets/             # Images, global CSS
│   ├── components/         # 🧱 Shared/Dumb Components (Used across all roles)
│   │   ├── ui/             # Buttons, Inputs, Modals, Cards
│   │   ├── layout/         # DashboardLayout, Sidebar, Navbar
│   │   └── guards/         # DesktopGuard, AuthGuard
│   ├── features/           # 🚀 Complex Business Domains
│   │   ├── authentication/ # Login, Signup, OTP states
│   │   ├── interview-room/ # InterviewRoom.tsx, VideoGrid.tsx, Controls.tsx
│   │   ├── code-editor/    # The CodeEditor + Question Switcher components
│   │   └── hr-dashboard/   # HR specific components (TaskSection, InterviewSection)
│   ├── pages/              # 📄 Route-level Components (Top-level views)
│   │   ├── LandingPage.tsx
│   │   ├── HrDashboardPage.tsx
│   │   ├── DevDashboardPage.tsx
│   │   └── ActiveInterviewPage.tsx # Wraps the interview-room feature
│   ├── hooks/              # 🪝 Custom React Hooks
│   │   ├── useWebRTC.ts
│   │   ├── useMalpractice.ts
│   │   └── useCodeExecution.ts
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions (time formatters, etc)
│   ├── App.tsx             # Theme & Query Providers
│   └── Routes.tsx          # React Router definitions
```

### Why this is better:
1. **Feature Grouping:** Having an `interview-room/` folder allows you to break `InterviewRoom.tsx` (which is likely thousands of lines long with WebRTC logic) into smaller, manageable chunks (`VideoGrid.tsx`, `Chat.tsx`, `ToolBar.tsx`) without cluttering the main components folder.
2. **Page vs Component:** By splitting `pages/` (the entire screen) from `components/` (pieces of the screen), it makes Router logic crystal clear.

---

## The Migration Path
If you decide to restructure later, you should do it in steps:
1. Move `prisma.ts`, `redis.ts`, and `type.ts` out of HR and into a `Backend/src/config/` folder. Update all imports.
2. Consolidate middlewares into a `src/middlewares` folder.
3. Once the routing runs without crashes, split the massive controllers into Controller + Service files.
