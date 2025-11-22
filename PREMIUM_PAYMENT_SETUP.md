# Premium Payment Integration - Setup Guide

This guide explains the Premium payment flow that has been integrated into your DRAPELY.ai application.

## Overview

Users who don't have Premium access will see a payment modal when they click on the Premium plan option. The modal allows them to purchase Premium access for $50 (one-time payment) via Stripe.

## Files Created/Modified

### 1. New Files Created

#### `components/ui/dialog.tsx`
- Radix UI Dialog component for modal functionality
- Provides accessible, customizable dialog overlay

#### `components/premium-payment-modal.tsx`
- Premium payment modal component
- Displays pricing ($50), features, and purchase button
- Handles Stripe checkout session creation
- Shows loading states and error messages

#### `app/api/payment/premium-checkout/route.ts`
- API endpoint for creating Stripe checkout sessions
- Validates user authentication and premium status
- Creates Stripe session with $50 price
- Includes metadata for webhook processing

### 2. Modified Files

#### `app/api/webhooks/stripe/route.ts`
- Added handler for premium purchases
- Checks for `type: 'premium_purchase'` in session metadata
- Updates user's `hasPremium` field to `true` upon successful payment
- Revalidates try-on page cache

#### `app/tryonyou/try-on-you-client.tsx`
- Added Premium payment modal integration
- Shows payment modal when non-premium users click Premium plan
- Displays $50 badge on Premium option for non-premium users
- Automatically allows premium plan selection for users with premium access

## How It Works

### User Flow

1. **User clicks Premium plan** (without having premium access)
   - Payment modal opens automatically
   - Modal shows pricing ($50) and premium features

2. **User clicks "Purchase Premium"**
   - Frontend calls `/api/payment/premium-checkout`
   - API creates Stripe checkout session
   - User is redirected to Stripe payment page

3. **User completes payment on Stripe**
   - Stripe redirects back to app with success/cancel status
   - Stripe webhook fires `checkout.session.completed` event

4. **Webhook processes payment**
   - Verifies `type: 'premium_purchase'` in metadata
   - Updates user's `hasPremium` field to `true`
   - User now has premium access

5. **User returns to try-on page**
   - Can now select Premium plan without payment prompt
   - Has access to all products in selected category

### Success/Cancel URLs

- **Success**: `http://localhost:3000/tryonyou?premium=success`
- **Cancel**: `http://localhost:3000/tryonyou?premium=cancelled`

You can add toast notifications or success messages based on these query parameters.

## Premium Features

The Premium plan includes:
- ✅ Try-on with all products in any category
- ✅ Access to latest fashion collections
- ✅ Priority processing for virtual try-ons
- ✅ Lifetime access - pay once, use forever

## Configuration Required

### 1. Stripe Webhook Setup

You need to configure the Stripe webhook to listen for payment events:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Update `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

### 2. Environment Variables

Ensure these variables are set in your `.env` file:

```env
# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL when deploying
```

### 3. Testing Locally with Stripe CLI

To test webhooks locally:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook secret starting with whsec_
# Copy it to your .env file as STRIPE_WEBHOOK_SECRET

# In another terminal, run your dev server
npm run dev

# Use Stripe test cards for testing
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
```

## Testing the Flow

### 1. Test as Non-Premium User

1. Login to the application
2. Go to `/tryonyou` page
3. Accept terms and conditions
4. Click on the "Premium" plan option
5. Payment modal should appear with $50 pricing
6. Click "Purchase Premium"
7. Complete payment on Stripe checkout
8. Verify you're redirected back with success message
9. Verify `hasPremium` is now `true` in database

### 2. Verify Database Update

```sql
-- Check user's premium status
SELECT id, email, "hasPremium" FROM "User" WHERE email = 'test@example.com';
```

### 3. Test as Premium User

1. Manually set `hasPremium` to `true` in database, or complete a purchase
2. Go to `/tryonyou` page
3. Click on Premium plan - should select without showing payment modal
4. No $50 badge should appear on Premium option

## Admin Panel Integration

You can manage premium access from the admin panel:

1. Go to `/admin/users`
2. Find user in the list
3. Toggle "Premium Access" to grant/revoke premium manually

## Security Considerations

- ✅ User authentication verified via Clerk
- ✅ Stripe webhook signature validation
- ✅ Metadata includes user ID for verification
- ✅ Premium status checked before creating checkout
- ✅ Database constraints prevent duplicate premium grants

## Price Modification

To change the premium price from $50:

1. Open `app/api/payment/premium-checkout/route.ts`
2. Find line with `unit_amount: 5000`
3. Change to desired amount in cents (e.g., 10000 for $100)
4. Update `components/premium-payment-modal.tsx` to show new price

## Troubleshooting

### Payment modal doesn't open
- Check browser console for errors
- Verify user is authenticated
- Check if `hasPremium` is already `true`

### Webhook not receiving events
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Stripe CLI is running (`stripe listen`)
- Verify webhook endpoint is accessible
- Check webhook logs in Stripe Dashboard

### Premium not granted after payment
- Check webhook handler logs
- Verify `metadata.type` is set to `'premium_purchase'`
- Check database user ID matches metadata
- Verify webhook secret is valid

### User already has premium error
- Check database: `SELECT * FROM "User" WHERE email = 'user@example.com'`
- Verify `hasPremium` field value
- Clear cache: Delete browser cookies and restart dev server

## Production Deployment

1. Update `NEXT_PUBLIC_APP_URL` to production domain
2. Replace test Stripe keys with live keys
3. Configure production webhook endpoint in Stripe Dashboard
4. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
5. Test payment flow in production with small amount first
6. Monitor Stripe Dashboard for successful payments

## Support

For issues or questions:
- Check Stripe Dashboard logs
- Review webhook delivery attempts
- Check application server logs
- Verify environment variables are set correctly
