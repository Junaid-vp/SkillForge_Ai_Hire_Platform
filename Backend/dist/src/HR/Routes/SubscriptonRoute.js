import express from 'express';
import isHr from '../Middleware/isHr.js';
import { cancelSubscription, createCheckout, stripeWebhook } from '../Controller/SubscriptionController.js';
const route = express.Router();
route.post("/checkout", isHr, createCheckout);
route.post('/cancel', isHr, cancelSubscription);
route.post('/webhook', express.raw({ type: "application/json" }), stripeWebhook);
export default route;
