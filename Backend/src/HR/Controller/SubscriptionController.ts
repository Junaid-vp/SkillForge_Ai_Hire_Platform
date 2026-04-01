import Stripe from "stripe";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "../Lib/prisma.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ Message: "Not authorized" });
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
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        hrId: id,
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
    });

    res.status(200).json({
      checkoutUrl: session.url,
      status: "success",
    });
  } catch (e: any) {
    res.status(500).json({ Message: "Server Error", Error: e.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"] as string

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
console.log("🔥 Webhook hit")
console.log("Event:", event.type)
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const hrId = session.metadata?.hrId

        if (hrId) {
          await prisma.hR.update({
            where: { id: hrId },
            data: {
              plan:           "pro",
              interviewLimit: 999999
            }
          })

          await prisma.subscription.upsert({
            where:  { hrId },
            create: {
              hrId,
              plan:             "pro",
              stripeCustomerId: session.customer as string,
              stripeSubId:      session.subscription as string,
              status:           "active",
              currentPeriodEnd: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              )
            },
            update: {
              plan:             "pro",
              stripeCustomerId: session.customer as string,
              stripeSubId:      session.subscription as string,
              status:           "active",
            }
          })
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId }
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data:  { status: "active" }
          })
        }
        break
      }

      
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId }
        })

        if (subscription) {
        
          await prisma.hR.update({
            where: { id: subscription.hrId },
            data: {
              plan:           "free",
              interviewLimit: 5,
              interviewCount: 0
            }
          })

         
          await prisma.subscription.update({
            where: { id: subscription.id },
            data:  { plan: "free", status: "cancelled" }
          })
        }
        break
      }

      
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        
        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId }
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data:  { status: "payment_failed" }
          })
         
        }
        break
      }
    }

    res.status(200).json({ received: true })

  } catch (e: any) {
    res.status(400).json({ Message: e.message })
  }
}



export const cancelSubscription = async(req:Request,res:Response)=>{
try{
const id = req.userId;

 if (!id) {
      return res.status(401).json({ message: "Not authorized" })
    }

    const subscription = await prisma.subscription.findUnique({
        where:{hrId:id}
    })
    

    if (!subscription?.stripeSubId) {
      return res.status(404).json({
        message: "No active subscription found"
      })
    }

    await stripe.subscriptions.update(subscription.stripeSubId,{
        cancel_at_period_end:true
    }),

    await prisma.subscription.update({
      where: { hrId: id },
      data: {
        status: "cancel_scheduled"
      }
    })

      res.status(200).json({
      message: "Subscription will be cancelled at end of billing period",
      status: "success"
    })

}catch (e: any) {
    res.status(500).json({
      message: "Server Error",
      error: e.message
    })
  }
}