import express, { Application } from "express";
import dotenv from "dotenv";
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

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3005;
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();


const httpServer = createServer(app)


export const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  }
})


socketHandler(io)


app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);





app.post('/api/subscription/webhook', express.raw({ type: "application/json" }), stripeWebhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use("/api/auth/", AuthRoute);
app.use('/api/interview/', InterviewRoute)
app.use('/api/tasklibary', TaskLibaryRoute)
app.use('/api/dev/', DevAuthroute)
app.use('/api/dash/dev', DevDashRoute)
app.use('/api/setting/', SettingRoute)
app.use('/api/task/', TaskRoute)
app.use('/api/resume/', ResumeRoute)
app.use('/api/subscription', SubscriptonRoute)
app.use('/api/questions', QuestionRoute)
app.use('/api/code/', CodeRoute)
app.use('/api/notification', NotificationRoute)
startCronJobs()
startRedisServer()

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
