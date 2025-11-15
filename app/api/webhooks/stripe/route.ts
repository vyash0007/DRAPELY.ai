import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.orderId) {
          throw new Error('No order ID in session metadata');
        }

        // Update order with payment information
        await db.order.update({
          where: { id: session.metadata.orderId },
          data: {
            status: 'PROCESSING',
            stripePaymentId: session.payment_intent as string,
            shippingAddress: session.shipping_details
              ? JSON.stringify(session.shipping_details)
              : null,
          },
        });

        // Get order items to update stock
        const order = await db.order.findUnique({
          where: { id: session.metadata.orderId },
          include: {
            items: true,
          },
        });

        if (order) {
          // Decrease product stock
          for (const item of order.items) {
            await db.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          // Clear user's cart
          const cart = await db.cart.findUnique({
            where: { userId: order.userId },
          });

          if (cart) {
            await db.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
          }
        }

        console.log(`Order ${session.metadata.orderId} completed successfully`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.orderId) {
          // Mark order as cancelled
          await db.order.update({
            where: { id: session.metadata.orderId },
            data: {
              status: 'CANCELLED',
            },
          });

          console.log(`Order ${session.metadata.orderId} expired`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Find order by payment intent and mark as cancelled
        const order = await db.order.findFirst({
          where: { stripePaymentId: paymentIntent.id },
        });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: 'CANCELLED',
            },
          });

          console.log(`Order ${order.id} payment failed`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
