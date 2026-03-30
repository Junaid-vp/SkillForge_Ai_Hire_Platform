import express from 'express';
import isHr from '../Middleware/isHr.js';
import { assignTask } from '../Controller/TaskController.js';
const route = express.Router();
route.post('/taskassgin', isHr, assignTask);
export default route;
