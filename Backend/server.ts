import express, { Application } from "express";
import dotenv from "dotenv";
import AuthRoute from "./src/HR/Routes/AuthRoute.js";
import InterviewRoute from "./src/HR/Routes/InterviewRoute.js"
import TaskLibaryRoute from "./src/HR/Routes/libarytask.js";
import cors from "cors";
import { startRedisServer } from "./src/HR/Lib/redis.js";
import cookieParser from "cookie-parser";
import { main } from "./prisma/seed.js";
import DevAuthroute from "./src/Dev/Routes/AuthRoutes.js";
import DevDashRoute from "./src/Dev/Routes/DevDashRoutes.js";
import SettingRoute from "./src/HR/Routes/SettingsRoute.js";
import { CheckTaskDeadLine } from "./src/Dev/Services/CheckDeadline.js";
import TaskRoute from "./src/HR/Routes/TaskRoute.js";
dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: " http://localhost:5173",
    credentials: true,
  }),
);







app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use("/api/auth/", AuthRoute);
app.use('/api/interview/',InterviewRoute)
app.use('/api/tasklibary',TaskLibaryRoute)
app.use('/api/dev/',DevAuthroute)
app.use('/api/dash/dev',DevDashRoute)
app.use('/api/setting/',SettingRoute)
app.use('/api/task/',TaskRoute)
CheckTaskDeadLine()
startRedisServer()
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

