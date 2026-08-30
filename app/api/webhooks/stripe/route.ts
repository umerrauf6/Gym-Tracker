import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/src/lib/stripe";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not initialized" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Fallback in dev if webhook secret is not yet set
      event = JSON.parse(rawBody);
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
  }

  // Handle relevant events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ Stripe Checkout completed for:", session.customer_email || session.client_reference_id);
      // Here you can persist Pro status to your Supabase profiles table if desired
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      console.log("❌ Stripe Subscription cancelled for:", subscription.customer);
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
