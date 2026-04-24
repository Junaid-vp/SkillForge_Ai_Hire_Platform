// src/router.tsx — Full lazy loading with React.lazy + Suspense
import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense } from "react"
import {
  DevProtectedRoute,
  HrProtectedRoute,
  PublicOnlyRoute,
  FullScreenLoader
} from "./Context/ProtectedRoutes"

// ─── Loading fallback ──────────────────────────────────────────────────────────
function wrap(element: React.ReactNode) {
  return <Suspense fallback={<FullScreenLoader />}>{element}</Suspense>
}

// ─── Public pages ──────────────────────────────────────────────────────────────
const Home            = lazy(() => import("./Home/Home"))
const SignUp          = lazy(() => import("./HR/Authentication/SignUp"))
const Login           = lazy(() => import("./HR/Authentication/Login"))
const RollSelection   = lazy(() => import("./Pages/RollSelection"))
const DevLogin        = lazy(() => import("./Dev/Auth/DevLogin"))
const AboutPage       = lazy(() => import("./Home/Aboutpage"))
const ContactPage     = lazy(() => import("./Home/Contactpage"))
const PrivacyPage     = lazy(() => import("./Home/Privacypage"))

// ─── HR Dashboard pages ────────────────────────────────────────────────────────
const DashboardLayout      = lazy(() => import("./HR/Components/DashboardLayout"))
const Dashboard            = lazy(() => import("./HR/Pages/Dashboard"))
const CreateInterview      = lazy(() => import("./HR/Pages/CreateInterview"))
const DeveloperList        = lazy(() => import("./HR/Pages/DeveloperList"))
const ScheduledInterview   = lazy(() => import("./HR/Pages/SheduledInterview"))
const TaskLibraryList      = lazy(() => import("./HR/Pages/TaskList"))
const TaskLibraryEdit      = lazy(() => import("./HR/Pages/TaskEdit"))
const TaskPreview          = lazy(() => import("./HR/Pages/TaskPreview"))
const Settings             = lazy(() => import("./HR/Pages/Settings"))
const DeveloperTotalDetails= lazy(() => import("./HR/Pages/DeveloperTotalDetails"))
const UpgradePage          = lazy(() => import("./HR/Pages/Upgradepage"))
const NotificationPage     = lazy(() => import("./HR/Pages/NotificationPage"))
const ReportPage           = lazy(() => import("./HR/Pages/ReportPage"))

// ─── Interview Room (shared HR + Dev) ─────────────────────────────────────────
// Heavy page — Monaco + PeerJS + MediaPipe — benefits most from lazy load
const InterviewRoom = lazy(() => import("./Pages/Interviewroom"))

// ─── Developer pages ───────────────────────────────────────────────────────────
const DevDashBoard = lazy(() => import("./Dev/Page/DevDashBoard"))

// ─── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([

  // ── Public routes ────────────────────────────────────────────────────────────
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/",             element: wrap(<Home />)          },
      { path: "/signup",       element: wrap(<SignUp />)        },
      { path: "/login",        element: wrap(<Login />)         },
      { path: "/rollselection",element: wrap(<RollSelection />) },
      { path: "/devLogin",     element: wrap(<DevLogin />)      },
      { path: "/about",        element: wrap(<AboutPage />)     },
      { path: "/contact",      element: wrap(<ContactPage />)   },
      { path: "/privacy",      element: wrap(<PrivacyPage />)   },
    ],
  },

  // ── HR protected routes ───────────────────────────────────────────────────────
  {
    element: <HrProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: wrap(<DashboardLayout />),
        children: [
          { index: true,                                    element: wrap(<Dashboard />)             },
          { path: "/dashboard/create-interview",            element: wrap(<CreateInterview />)       },
          { path: "/dashboard/developers",                  element: wrap(<DeveloperList />)         },
          { path: "/dashboard/schedule",                    element: wrap(<ScheduledInterview />)    },
          { path: "/dashboard/task-library",                element: wrap(<TaskLibraryList />)       },
          { path: "/dashboard/task-create",                 element: wrap(<TaskLibraryEdit />)       },
          { path: "/dashboard/task-edit/:id",               element: wrap(<TaskLibraryEdit />)       },
          { path: "/dashboard/task-preview/:id",            element: wrap(<TaskPreview />)           },
          { path: "/dashboard/settings",                    element: wrap(<Settings />)              },
          { path: "/dashboard/devFullDetails/:id",          element: wrap(<DeveloperTotalDetails />)},
          { path: "/dashboard/upgrade",                     element: wrap(<UpgradePage />)           },
          { path: "/dashboard/notifications",               element: wrap(<NotificationPage />)      },
          { path: "/dashboard/reports",                     element: wrap(<ReportPage />)            },
        ],
      },
      {
        path: "/dashboard/HrInterviewRoom/:interviewId",
        element: wrap(<InterviewRoom />),
      },
    ],
  },

  // ── Developer protected routes ────────────────────────────────────────────────
  {
    element: <DevProtectedRoute />,
    children: [
      { path: "/devDashboard",                   element: wrap(<DevDashBoard />)   },
      { path: "/DevInterviewRoom/:interviewId",  element: wrap(<InterviewRoom />) },
    ],
  },
])