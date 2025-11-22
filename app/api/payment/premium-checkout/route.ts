import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userEmail, userId: requestUserId } = body;

    if (!userEmail || !requestUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the user exists and doesn't already have premium
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.hasPremium) {
      return NextResponse.json(
        { error: "You already have Premium access" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Virtual Try-On Access",
              description: "Lifetime access to all products in virtual try-on",
              images: ["https://res.cloudinary.com/drapely/image/upload/v1/premium-badge"],
            },
            unit_amount: 5000, // $50.00 in cents
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId: user.id,
        clerkId: userId,
        type: "premium_purchase",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tryonyou?premium=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tryonyou?premium=cancelled`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
