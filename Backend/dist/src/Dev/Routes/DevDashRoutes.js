import express from 'express';
import { isDeveloper } from '../MIddleware/isDeveloper.js';
import { getDashboard } from '../Controller/DevDashBoard.js';
const route = express.Router();
route.get('/dashboard', isDeveloper, getDashboard);
export default route;
