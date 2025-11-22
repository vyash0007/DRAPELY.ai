# Premium Payment Testing Checklist

Use this checklist to test the Premium payment integration thoroughly.

## Prerequisites

- [ ] `.env` file has all required Stripe keys
- [ ] Stripe CLI installed (for local testing)
- [ ] Development server running (`npm run dev`)
- [ ] Database is accessible

## Setup Stripe Webhook for Local Testing

```bash
# Terminal 1: Start Stripe CLI listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret (starts with whsec_)
# Update .env file:
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Terminal 2: Start dev server
npm run dev
```

## Test Cases

### 1. Non-Premium User Flow

#### Test 1.1: Modal Opens When Clicking Premium
- [ ] Login as a user without premium access
- [ ] Navigate to `/tryonyou`
- [ ] Accept terms and conditions
- [ ] Click on the "Premium" plan option
- [ ] **Expected**: Payment modal opens with $50 pricing
- [ ] **Expected**: Premium option shows a "$50" badge

#### Test 1.2: Modal Content Verification
- [ ] Modal shows "Upgrade to Premium" title
- [ ] Price displays as "$50"
- [ ] "One-time payment" text is visible
- [ ] Four feature bullet points are displayed:
  - Try-on with all products in any category
  - Access to latest fashion collections
  - Priority processing for virtual try-ons
  - Lifetime access - pay once, use forever
- [ ] "Secure payment powered by Stripe" text at bottom
- [ ] "Cancel" and "Purchase Premium" buttons present

#### Test 1.3: Cancel Payment Modal
- [ ] Click "Cancel" button in payment modal
- [ ] **Expected**: Modal closes
- [ ] **Expected**: User remains on try-on page
- [ ] **Expected**: No payment initiated

#### Test 1.4: Successful Payment Flow
- [ ] Click "Purchase Premium" button
- [ ] **Expected**: Button shows "Processing..." with spinner
- [ ] **Expected**: Redirects to Stripe checkout page
- [ ] Fill in test card details:
  - Card number: `4242 4242 4242 4242`
  - Expiry: Any future date (e.g., `12/25`)
  - CVC: Any 3 digits (e.g., `123`)
  - Name: Any name
  - Email: Your test email
- [ ] Click "Pay" on Stripe checkout
- [ ] **Expected**: Redirects back to `/tryonyou?premium=success`
- [ ] **Expected**: Green success banner shows "Premium Activated! 🎉"
- [ ] **Expected**: Banner disappears after 5 seconds
- [ ] **Expected**: Premium plan is auto-selected
- [ ] **Expected**: No "$50" badge on Premium option

#### Test 1.5: Database Verification After Payment
```sql
-- Check user's premium status in database
SELECT id, email, "hasPremium", "updatedAt" FROM "User" WHERE email = 'your@email.com';
```
- [ ] `hasPremium` field is `true`
- [ ] `updatedAt` timestamp reflects recent change

#### Test 1.6: Cancelled Payment Flow
- [ ] Start payment process as before
- [ ] On Stripe checkout, click "Back" or close tab
- [ ] **Expected**: Redirects to `/tryonyou?premium=cancelled`
- [ ] **Expected**: Yellow warning banner shows "Payment Cancelled"
- [ ] **Expected**: Banner disappears after 5 seconds
- [ ] **Expected**: Premium plan is NOT selected
- [ ] **Expected**: User can try payment again

### 2. Premium User Flow

#### Test 2.1: Premium User Can Select Plan Directly
- [ ] Ensure user has `hasPremium = true` in database
- [ ] Navigate to `/tryonyou`
- [ ] Accept terms and conditions
- [ ] Click on "Premium" plan option
- [ ] **Expected**: Plan selects WITHOUT opening payment modal
- [ ] **Expected**: NO "$50" badge displayed
- [ ] **Expected**: Premium option has pink border and background

#### Test 2.2: Premium User Cannot Purchase Again
- [ ] While logged in as premium user
- [ ] Try to access payment endpoint directly:
  ```bash
  # This should fail
  curl -X POST http://localhost:3000/api/payment/premium-checkout \
    -H "Content-Type: application/json" \
    -d '{"userEmail":"user@example.com","userId":"user_id"}'
  ```
- [ ] **Expected**: Returns error "You already have Premium access"

### 3. Webhook Testing

#### Test 3.1: Webhook Receives Events
- [ ] Stripe CLI is running (`stripe listen`)
- [ ] Complete a test payment
- [ ] Check Stripe CLI terminal output
- [ ] **Expected**: See `checkout.session.completed` event
- [ ] **Expected**: Webhook returns 200 status

#### Test 3.2: Webhook Updates Database
- [ ] Before payment: Check `hasPremium = false`
- [ ] Complete payment
- [ ] Wait 2-3 seconds for webhook processing
- [ ] Refresh database query
- [ ] **Expected**: `hasPremium = true`

#### Test 3.3: Webhook Logs
- [ ] Check server terminal after payment
- [ ] **Expected**: Log message like:
  ```
  User <user_id> upgraded to premium successfully
  ```

### 4. Error Handling

#### Test 4.1: Network Error During Checkout
- [ ] Open browser DevTools Network tab
- [ ] Start payment flow
- [ ] Throttle network to "Offline" before clicking "Purchase Premium"
- [ ] **Expected**: Error message displays in modal
- [ ] **Expected**: "Payment Error" section shows

#### Test 4.2: Invalid Stripe Key
- [ ] Temporarily set invalid `STRIPE_SECRET_KEY` in `.env`
- [ ] Restart server
- [ ] Try to purchase premium
- [ ] **Expected**: Error message shows
- [ ] **Expected**: Payment does not proceed
- [ ] Restore valid key and restart server

#### Test 4.3: Missing User Authentication
- [ ] Logout from application
- [ ] Try to access `/api/payment/premium-checkout` directly
- [ ] **Expected**: 401 Unauthorized error

### 5. UI/UX Testing

#### Test 5.1: Mobile Responsiveness
- [ ] Open in mobile view (or use DevTools device emulation)
- [ ] Payment modal displays correctly
- [ ] All buttons are tappable
- [ ] Text is readable
- [ ] Modal scrolls if needed

#### Test 5.2: Loading States
- [ ] Click "Purchase Premium"
- [ ] **Expected**: Button disabled during processing
- [ ] **Expected**: Spinner icon shows
- [ ] **Expected**: Text changes to "Processing..."
- [ ] **Expected**: Cannot click button multiple times

#### Test 5.3: Modal Accessibility
- [ ] Tab through modal with keyboard
- [ ] **Expected**: Focus visible on interactive elements
- [ ] Press "Escape" key
- [ ] **Expected**: Modal closes
- [ ] Click outside modal (on overlay)
- [ ] **Expected**: Modal closes

### 6. Stripe Dashboard Verification

#### Test 6.1: Payment Appears in Dashboard
- [ ] Login to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- [ ] After successful payment
- [ ] **Expected**: Payment appears in "Payments" section
- [ ] **Expected**: Amount shows as $50.00
- [ ] **Expected**: Status is "Succeeded"
- [ ] **Expected**: Customer email matches test user

#### Test 6.2: Webhook Delivery Success
- [ ] Go to Stripe Dashboard > Webhooks
- [ ] Click on your webhook endpoint
- [ ] Check recent deliveries
- [ ] **Expected**: `checkout.session.completed` delivered successfully
- [ ] **Expected**: Response status is 200
- [ ] Click on event to see details
- [ ] **Expected**: Metadata includes:
  - `userId`: <user_id>
  - `clerkId`: <clerk_id>
  - `type`: "premium_purchase"

### 7. Edge Cases

#### Test 7.1: Multiple Rapid Clicks
- [ ] Click "Purchase Premium" rapidly multiple times
- [ ] **Expected**: Only one checkout session created
- [ ] **Expected**: Button disables after first click

#### Test 7.2: Browser Back Button After Redirect
- [ ] Complete payment successfully
- [ ] See success banner
- [ ] Click browser back button
- [ ] **Expected**: Banner may reappear briefly but user still has premium
- [ ] **Expected**: Premium plan remains selected

#### Test 7.3: Direct URL Access with Query Params
- [ ] Navigate directly to `/tryonyou?premium=success`
- [ ] **Expected**: Success banner shows (even if payment wasn't just completed)
- [ ] **Expected**: Banner disappears after 5 seconds

## Test with Different Payment Methods

### Successful Payments
- [ ] `4242 4242 4242 4242` - Succeeds immediately
- [ ] `4000 0025 0000 3155` - Requires authentication (3D Secure)

### Failed Payments
- [ ] `4000 0000 0000 9995` - Declined (insufficient funds)
- [ ] `4000 0000 0000 0002` - Declined (generic decline)

### Expected for Failed Payments
- [ ] Payment fails on Stripe page
- [ ] User returns to try-on page
- [ ] `hasPremium` remains `false`
- [ ] Can try payment again

## Production Checklist

Before deploying to production:

- [ ] Replace all test Stripe keys with live keys
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Configure production webhook in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production secret
- [ ] Test with real card (small amount first)
- [ ] Verify webhook deliveries in production
- [ ] Set up Stripe webhook monitoring/alerts
- [ ] Test refund process if needed
- [ ] Configure email notifications (future enhancement)

## Common Issues & Solutions

### Issue: Webhook not receiving events
**Solution**:
- Ensure Stripe CLI is running
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify endpoint URL is accessible

### Issue: Payment successful but user not upgraded
**Solution**:
- Check webhook handler logs
- Verify metadata in Stripe dashboard
- Check database connection
- Ensure user ID matches

### Issue: Modal doesn't open
**Solution**:
- Check browser console for errors
- Verify user is authenticated
- Check if user already has premium

### Issue: Redirect URLs not working
**Solution**:
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check for typos in success/cancel URLs
- Ensure URLs match application routes

## Cleanup After Testing

```sql
-- Reset user premium status for re-testing
UPDATE "User" SET "hasPremium" = false WHERE email = 'test@example.com';
```

## Notes

- Test payments in Stripe test mode are free
- Test payments won't create real charges
- Stripe CLI is only needed for local development
- Production webhooks work automatically once configured
