import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/src/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { priceId, userEmail, userId } = body;

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const configuredPriceId = priceId || process.env.STRIPE_PRO_PRICE_ID;

    let mode: "payment" | "subscription" = "payment";

    // Detect if the price is recurring subscription or one-time payment
    if (configuredPriceId) {
      try {
        const price = await stripe.prices.retrieve(configuredPriceId);
        if (price.type === "recurring") {
          mode = "subscription";
        } else {
          mode = "payment";
        }
      } catch (err) {
        console.warn("Could not retrieve price type from Stripe, defaulting based on ID:", err);
      }
    }

    // Use configured price ID if available, otherwise fall back to dynamic line item
    const line_items = configuredPriceId
      ? [{ price: configuredPriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "GymTracker Pro",
                description: "Unlimited custom splits, smart equipment alternatives, and volume analytics.",
                images: [`${origin}/exercises/barbell-bench-press.png`],
              },
              unit_amount: 2900, // $29.00 USD
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode,
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        userId: userId || "",
        userEmail: userEmail || "",
        plan: mode === "subscription" ? "pro_subscription" : "pro_lifetime",
      },
      success_url: `${origin}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/profile?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
