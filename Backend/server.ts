import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config({ override: false });
import AuthRoute from "./src/HR/Routes/AuthRoute.js";
import InterviewRoute from "./src/HR/Routes/InterviewRoute.js"
import TaskLibaryRoute from "./src/HR/Routes/libarytask.js";
import cors from "cors";
import { startRedisServer } from "./src/HR/Lib/redis.js";
import cookieParser from "cookie-parser";
import { main } from "./prisma/seed.js";
import ResumeRoute from "./src/HR/Routes/Resume.js";
import DevAuthroute from "./src/Dev/Routes/AuthRoutes.js";
import DevDashRoute from "./src/Dev/Routes/DevDashRoutes.js";
import SettingRoute from "./src/HR/Routes/SettingsRoute.js";
import { startCronJobs } from "./src/HR/services/CronJobs.js";
import TaskRoute from "./src/HR/Routes/TaskRoute.js";
import SubscriptonRoute from "./src/HR/Routes/SubscriptonRoute.js";
import { stripeWebhook } from "./src/HR/Controller/SubscriptionController.js";
import { createServer } from 'http'
import { Server } from "socket.io";
import { socketHandler } from "./Services/SocketHandle.js";
import QuestionRoute from "./src/HR/Routes/QuestionRoute.js";
import CodeRoute from "./src/HR/Routes/codeRoutes.js";
import NotificationRoute from "./src/HR/Routes/NotificationRoute.js";
import ReportRoute from "./src/HR/Routes/Reportroute.js";
import SystemRoute from "./src/System/Routes/ContactRoute.js";
import helmet from "helmet"
import { aiLimiter } from "./src/HR/Middleware/RateLimit.js";
import { closeTaskQueue, startTaskWorker } from "./src/HR/services/Taskqueue.js";
import { prisma } from "./src/HR/Lib/prisma.js";
import { logger } from "./src/System/utils/logger.js";
import pinoHttpModule from "pino-http";
const pinoHttp = (pinoHttpModule as any).default || pinoHttpModule;

dotenv.config();
const app: Application = express();
app.use(pinoHttp({ logger }));
const PORT = process.env.PORT || 3005;
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(url => url.trim());
const trustProxy = process.env.TRUST_PROXY ?? (process.env.NODE_ENV === "production" ? "1" : "0");

if (trustProxy !== "0") {
  app.set("trust proxy", trustProxy === "true" ? true : Number(trustProxy) || 1);
}


const httpServer = createServer(app)


export const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  }
})
socketHandler(io)

app.use(helmet({

  //  Disable COEP (Cross-Origin Embedder Policy)
  // Needed because WebRTC / PeerJS requires cross-origin access for camera, mic, and peer connections
  crossOriginEmbedderPolicy: false,

  contentSecurityPolicy: {
    directives: {

      // Default rule for all resources (fallback)
      // Only allow resources from your own server (same origin)
      defaultSrc: ["'self'"],

      //  Controls where JavaScript can be loaded from
      scriptSrc: [
        "'self'",                // Allow scripts from your own server
        "'unsafe-inline'",       // Allow inline scripts (needed sometimes, but risky - XSS)
        "cdn.jsdelivr.net",      // Allow trusted CDN scripts
        "storage.googleapis.com"//  Allow scripts from Google Cloud Storage
      ],

      // Controls API calls, WebSockets, and network requests
      connectSrc: [
        "'self'",  //  Allow requests to your backend
        "wss:",    //  Allow secure WebSocket (Socket.IO, PeerJS)
        "ws:",     //  Allow non-secure WebSocket
        "https:"   //  Allow HTTPS API calls
      ],

      //  Controls audio/video sources
      mediaSrc: [
        "'self'", // Allow media from your server
        "blob:"   // Allow media streams (WebRTC camera, mic, screen share)
      ],

      //  Controls image sources
      imgSrc: [
        "'self'",               // Local images
        "data:",                // Base64 images
        "blob:",                // Generated images (canvas, etc.)
        "res.cloudinary.com"    // Cloudinary hosted images
      ],

      //  Controls iframe usage
      frameSrc: [
        "'none'" // Completely block all iframes (prevents clickjacking attacks)
      ],
    }
  }
}))







app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // or requests from our allowed frontendUrl array
      if (!origin || frontendUrl.includes(origin)) {
        callback(null, origin || false);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);





app.post('/api/subscription/webhook', express.raw({ type: "application/json" }), stripeWebhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use("/api/auth", AuthRoute);
app.use('/api/interview', InterviewRoute)
app.use('/api/tasklibary', TaskLibaryRoute)
app.use('/api/dev', DevAuthroute)
app.use('/api/dash/dev', DevDashRoute)
app.use('/api/setting', SettingRoute)
app.use('/api/task/', TaskRoute)
app.use('/api/resume/', aiLimiter, ResumeRoute)
app.use('/api/subscription', SubscriptonRoute)
app.use('/api/questions', QuestionRoute)
app.use('/api/code/', CodeRoute)
app.use('/api/notification', NotificationRoute)
app.use("/api/report", ReportRoute)
app.use("/api/system", SystemRoute)
startCronJobs()
startRedisServer()
main()

// ── Database Connection Check ─────────────────
prisma.$connect()
  .then(() => logger.info("✅ Database connected successfully within Docker"))
  .catch((err) => logger.error({ err }, "❌ Database connection failed within Docker"));

startTaskWorker()

// ── Health Check ─────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Graceful shutdown ─────────────────────────
process.on("SIGTERM", async () => {
  logger.info("SIGTERM — shutting down")
  await closeTaskQueue()
  process.exit(0)
})
process.on("SIGINT", async () => {
  logger.info("SIGINT — shutting down")
  await closeTaskQueue()
  process.exit(0)
})

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
