import Stripe from "stripe";
import dotenv from "dotenv";
import { prisma } from "../Lib/prisma.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const getHrIdFromCheckoutSession = (session) => {
    return session.metadata?.hrId ?? session.client_reference_id ?? null;
};
export const createCheckout = async (req, res) => {
    try {
        const id = req.userId;
        const priceId = process.env.STRIPE_PRO_PRICE_ID;
        const frontendUrl = process.env.FRONTEND_URL;
        if (!id) {
            return res.status(401).json({ Message: "Not authorized" });
        }
        if (!priceId || !frontendUrl) {
            return res.status(500).json({
                Message: "Stripe is not configured correctly",
            });
        }
        const hr = await prisma.hR.findUnique({
            where: {
                id,
            },
        });
        if (!hr) {
            return res.status(404).json({ Message: "HR not found" });
        }
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer_email: hr.email,
            client_reference_id: id,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                hrId: id,
            },
            subscription_data: {
                metadata: {
                    hrId: id,
                },
            },
            success_url: `${frontendUrl}/dashboard?payment=success`,
            cancel_url: `${frontendUrl}/dashboard?payment=cancelled`,
        });
        console.log("Stripe checkout created", {
            sessionId: session.id,
            hrId: id,
            email: hr.email,
        });
        res.status(200).json({
            checkoutUrl: session.url,
            status: "success",
        });
    }
    catch (e) {
        res.status(500).json({ Message: "Server Error", Error: e.message });
    }
};
export const stripeWebhook = async (req, res) => {
    try {
        const sig = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!sig || !webhookSecret) {
            return res.status(400).json({
                Message: "Stripe webhook signature configuration missing",
            });
        }
        if (!Buffer.isBuffer(req.body)) {
            console.error("Stripe webhook received non-raw body", {
                bodyType: typeof req.body,
            });
        }
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log("Stripe webhook hit", {
            eventId: event.id,
            eventType: event.type,
        });
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const hrId = getHrIdFromCheckoutSession(session);
                const stripeSubId = typeof session.subscription === "string"
                    ? session.subscription
                    : session.subscription?.id ?? null;
                const stripeCustomerId = typeof session.customer === "string"
                    ? session.customer
                    : session.customer?.id ?? null;
                console.log("Processing checkout.session.completed", {
                    sessionId: session.id,
                    hrId,
                    stripeSubId,
                    stripeCustomerId,
                });
                if (!hrId) {
                    console.warn("checkout.session.completed missing hrId", {
                        sessionId: session.id,
                    });
                    break;
                }
                let currentPeriodEnd = null;
                if (stripeSubId) {
                    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubId);
                    const itemPeriodEnd = stripeSubscription.items.data[0]?.current_period_end;
                    currentPeriodEnd = itemPeriodEnd ? new Date(itemPeriodEnd * 1000) : null;
                }
                await prisma.hR.update({
                    where: { id: hrId },
                    data: {
                        plan: "pro",
                        interviewLimit: 999999,
                    }
                });
                await prisma.subscription.upsert({
                    where: { hrId },
                    create: {
                        hrId,
                        plan: "pro",
                        stripeCustomerId,
                        stripeSubId,
                        status: "active",
                        currentPeriodEnd,
                    },
                    update: {
                        plan: "pro",
                        stripeCustomerId,
                        stripeSubId,
                        status: "active",
                        currentPeriodEnd,
                    }
                });
                break;
            }
            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                const customerId = typeof invoice.customer === "string"
                    ? invoice.customer
                    : invoice.customer?.id ?? null;
                const parentSubscription = invoice.parent?.subscription_details?.subscription;
                const stripeSubId = typeof parentSubscription === "string"
                    ? parentSubscription
                    : parentSubscription?.id ?? null;
                const subscription = await prisma.subscription.findFirst({
                    where: {
                        OR: [
                            ...(customerId ? [{ stripeCustomerId: customerId }] : []),
                            ...(stripeSubId ? [{ stripeSubId }] : []),
                        ],
                    }
                });
                if (subscription) {
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: { status: "active" }
                    });
                }
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object;
                const customerId = typeof sub.customer === "string"
                    ? sub.customer
                    : sub.customer?.id ?? null;
                const subscription = await prisma.subscription.findFirst({
                    where: {
                        OR: [
                            { stripeSubId: sub.id },
                            ...(customerId ? [{ stripeCustomerId: customerId }] : []),
                        ],
                    }
                });
                if (subscription) {
                    await prisma.hR.update({
                        where: { id: subscription.hrId },
                        data: {
                            plan: "free",
                            interviewLimit: 5,
                            interviewCount: 0
                        }
                    });
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: { plan: "free", status: "cancelled" }
                    });
                }
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object;
                const customerId = typeof invoice.customer === "string"
                    ? invoice.customer
                    : invoice.customer?.id ?? null;
                const parentSubscription = invoice.parent?.subscription_details?.subscription;
                const stripeSubId = typeof parentSubscription === "string"
                    ? parentSubscription
                    : parentSubscription?.id ?? null;
                const subscription = await prisma.subscription.findFirst({
                    where: {
                        OR: [
                            ...(customerId ? [{ stripeCustomerId: customerId }] : []),
                            ...(stripeSubId ? [{ stripeSubId }] : []),
                        ],
                    }
                });
                if (subscription) {
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: { status: "payment_failed" }
                    });
                }
                break;
            }
        }
        res.status(200).json({ received: true });
    }
    catch (e) {
        console.error("Stripe webhook error", e);
        res.status(400).json({ Message: e.message });
    }
};
export const cancelSubscription = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const subscription = await prisma.subscription.findUnique({
            where: { hrId: id }
        });
        if (!subscription?.stripeSubId) {
            return res.status(404).json({
                message: "No active subscription found"
            });
        }
        await stripe.subscriptions.update(subscription.stripeSubId, {
            cancel_at_period_end: true
        }),
            await prisma.subscription.update({
                where: { hrId: id },
                data: {
                    status: "cancel_scheduled"
                }
            });
        res.status(200).json({
            message: "Subscription will be cancelled at end of billing period",
            status: "success"
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Server Error",
            error: e.message
        });
    }
};
