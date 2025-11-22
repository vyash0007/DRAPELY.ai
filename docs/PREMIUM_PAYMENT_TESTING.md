# Premium Payment - Complete Testing Guide

This guide will help you test the entire Premium payment flow to ensure everything works correctly.

## Prerequisites

Before testing, ensure:
- [x] Development server is running (`npm run dev`)
- [x] Database is accessible
- [x] Stripe CLI is running for local webhook testing
- [x] You have a test user account

## Stripe CLI Setup (Required for Local Testing)

```bash
# Terminal 1: Start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret (whsec_xxxxx)
# Add to .env file:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Terminal 2: Start development server
npm run dev
```

## Test Scenario 1: Non-Premium User Clicks Premium

### Steps:
1. Login to your application
2. Navigate to `/tryonyou`
3. Accept terms and conditions
4. Look at the Premium plan option

### Expected Results:
- ✅ Premium option shows **$50 badge**
- ✅ Premium option is **NOT selected** by default
- ✅ Trial option is selected by default

### Screenshot Verification:
```
┌─────────────────────────┐  ┌─────────────────────────┐
│ ⚫ Trial                 │  │ ⚪ Premium        [$50] │
│ Try-on with trial       │  │ Try-on with all        │
│ products only           │  │ products in category   │
└─────────────────────────┘  └─────────────────────────┘
```

## Test Scenario 2: Payment Modal Opens

### Steps:
1. While on `/tryonyou` page as non-premium user
2. Click on the **Premium plan card**

### Expected Results:
- ✅ Payment modal opens immediately
- ✅ Modal shows "$50" pricing
- ✅ Modal shows "One-time payment" text
- ✅ Premium plan is **NOT selected** (remains unselected)
- ✅ Modal has "Cancel" and "Purchase Premium" buttons

### Screenshot Verification:
```
┌────────────────────────────────────────┐
│  ✨ Upgrade to Premium                 │
│  Unlock unlimited try-on experiences   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │          $50                     │  │
│  │      One-time payment            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Premium includes:                      │
│  ✓ Try-on with all products            │
│  ✓ Access to latest collections        │
│  ✓ Priority processing                 │
│  ✓ Lifetime access                     │
│                                         │
│  [ Cancel ]  [ Purchase Premium ]      │
└────────────────────────────────────────┘
```

## Test Scenario 3: Cancel Payment Modal

### Steps:
1. Open payment modal (click Premium)
2. Click **"Cancel"** button

### Expected Results:
- ✅ Modal closes
- ✅ User remains on try-on page
- ✅ Premium plan is **NOT selected**
- ✅ Trial plan remains selected
- ✅ $50 badge still visible on Premium option
- ✅ No payment initiated

## Test Scenario 4: Complete Premium Purchase

### Steps:
1. Open payment modal (click Premium)
2. Click **"Purchase Premium"** button
3. Fill in Stripe checkout form:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: Your name
   - Email: Your email
4. Click **"Pay"** on Stripe page

### Expected Results:

**During Payment:**
- ✅ Button shows "Processing..." with spinner
- ✅ Redirected to Stripe checkout page

**After Payment:**
- ✅ Redirected back to `/tryonyou?premium=success`
- ✅ Green success banner appears: "Premium Activated! 🎉"
- ✅ Success banner disappears after 5 seconds
- ✅ **$50 badge is REMOVED** from Premium option
- ✅ Premium plan is auto-selected
- ✅ Terms page is skipped (goes straight to form)
- ✅ Page refreshes to show updated user data

**Screenshot After Success:**
```
┌────────────────────────────────────────────────┐
│ ✓ Premium Activated! 🎉                        │
│ Welcome to Premium! You now have unlimited     │
│ access to try-on all products in any category. │
└────────────────────────────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ ⚪ Trial                 │  │ ⚫ Premium               │  ← No $50!
│ Try-on with trial       │  │ Try-on with all        │
│ products only           │  │ products in category   │
└─────────────────────────┘  └─────────────────────────┘
```

## Test Scenario 5: Database Verification

### Steps:
After successful premium purchase, check the database:

```sql
SELECT id, email, "aiEnabled", "hasPremium", "updatedAt"
FROM "User"
WHERE email = 'your@email.com';
```

### Expected Results:
- ✅ `aiEnabled` = `true`
- ✅ `hasPremium` = `true`
- ✅ `updatedAt` shows recent timestamp

## Test Scenario 6: Admin Panel Verification

### Steps:
1. Go to `/admin/customers`
2. Find your test user in the list
3. Click on the user to view details
4. Check the "Features" section

### Expected Results:
- ✅ "AI Try-On Enabled" toggle is **ON** (checked)
- ✅ "Premium Subscription" toggle is **ON** (checked)
- ✅ AI toggle is **disabled/grayed out** (cannot be turned off)
- ✅ Description shows: "Enabled with Premium subscription"

### Screenshot Verification:
```
Features
────────────────────────────────
⚫ AI Try-On Enabled          [DISABLED]
   Enabled with Premium subscription

⚫ Premium Subscription
   Premium subscription includes AI try-on
   and other premium features
```

## Test Scenario 7: Premium User Returns to Try-On Page

### Steps:
1. As a premium user (after successful purchase)
2. Navigate to `/tryonyou` again
3. Accept terms (if shown)
4. Look at the plan selection

### Expected Results:
- ✅ **No $50 badge** on Premium option
- ✅ Premium plan is **auto-selected**
- ✅ Clicking Premium does **NOT** open payment modal
- ✅ Premium plan can be selected normally
- ✅ Can switch between Trial and Premium freely

### Screenshot Verification:
```
┌─────────────────────────┐  ┌─────────────────────────┐
│ ⚪ Trial                 │  │ ⚫ Premium               │
│ Try-on with trial       │  │ Try-on with all        │
│ products only           │  │ products in category   │
└─────────────────────────┘  └─────────────────────────┘
```

## Test Scenario 8: Webhook Processing

### Steps:
1. Check Stripe CLI terminal during payment
2. Look for webhook events

### Expected Results:
- ✅ See `checkout.session.completed` event
- ✅ Webhook returns `200` status
- ✅ Server logs show: "User {userId} upgraded to premium successfully (Premium & AI enabled)"

### Stripe CLI Output:
```
2025-01-22 10:30:45   --> checkout.session.completed [evt_xxxxx]
2025-01-22 10:30:45  <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

## Test Scenario 9: Trial Plan Still Works

### Steps:
1. As a premium user
2. Go to `/tryonyou`
3. Select **Trial** plan (switch from Premium)
4. Upload photo and submit

### Expected Results:
- ✅ Can select Trial plan
- ✅ Form submission works
- ✅ AI is enabled (from premium purchase)
- ✅ Try-on processes with trial products only

## Test Scenario 10: Cancelled Payment

### Steps:
1. As non-premium user
2. Click Premium → Open payment modal
3. Click "Purchase Premium"
4. On Stripe checkout, click **"Back"** or close the page
5. Return to try-on page

### Expected Results:
- ✅ Redirected to `/tryonyou?premium=cancelled`
- ✅ Yellow warning banner: "Payment Cancelled"
- ✅ Banner disappears after 5 seconds
- ✅ Premium plan is **NOT selected**
- ✅ **$50 badge still visible**
- ✅ User can try payment again

## Common Issues & Solutions

### Issue: $50 badge still shows after payment
**Cause:** Page not refreshed with updated user data
**Solution:** Check if `router.refresh()` is called on success, verify webhook updated database

### Issue: Payment modal opens for premium users
**Cause:** User data not updated or condition not working
**Solution:** Check `user.hasPremium` value, verify database has `hasPremium = true`

### Issue: Premium plan not auto-selected after payment
**Cause:** User data not refreshed or condition not triggered
**Solution:** Verify `router.refresh()` is called, check `user.hasPremium` after webhook

### Issue: Webhook not firing
**Cause:** Stripe CLI not running or wrong webhook secret
**Solution:** Start Stripe CLI, copy correct webhook secret to `.env`

### Issue: Database not updated after payment
**Cause:** Webhook processing error
**Solution:** Check webhook logs, verify `metadata.type === 'premium_purchase'`, check database connection

## Debug Checklist

If something doesn't work, check:

- [ ] Is Stripe CLI running? (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [ ] Is `STRIPE_WEBHOOK_SECRET` in `.env` correct?
- [ ] Is development server running? (`npm run dev`)
- [ ] Is database accessible?
- [ ] Check browser console for errors
- [ ] Check server terminal for webhook logs
- [ ] Check Stripe dashboard for payment status
- [ ] Verify database has correct values (`aiEnabled`, `hasPremium`)
- [ ] Clear browser cache and reload page

## Stripe Dashboard Verification

### Steps:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. Find your test payment

### Expected Results:
- ✅ Payment shows in "Payments" list
- ✅ Amount is $50.00
- ✅ Status is "Succeeded"
- ✅ Customer email matches test user

### Webhook Verification:
1. Go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Check recent events

### Expected Results:
- ✅ `checkout.session.completed` event delivered
- ✅ Response status: 200
- ✅ Metadata includes:
  - `userId`: User's database ID
  - `clerkId`: User's Clerk ID
  - `type`: "premium_purchase"

## Manual Database Reset (For Re-testing)

```sql
-- Reset user to non-premium state
UPDATE "User"
SET "aiEnabled" = false, "hasPremium" = false
WHERE email = 'your@email.com';

-- Set user to trial state (AI only)
UPDATE "User"
SET "aiEnabled" = true, "hasPremium" = false
WHERE email = 'your@email.com';

-- Set user to premium state
UPDATE "User"
SET "aiEnabled" = true, "hasPremium" = true
WHERE email = 'your@email.com';
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Replace test Stripe keys with live keys
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure production webhook in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production secret
- [ ] Test with real card (small amount first)
- [ ] Verify webhook deliveries in production
- [ ] Monitor Stripe Dashboard for payments
- [ ] Test the entire flow in production
- [ ] Set up error monitoring and alerts

## Success Criteria

All tests pass when:

✅ Non-premium users see $50 badge
✅ Payment modal opens when clicking Premium
✅ Payment completes successfully
✅ Database updates correctly (both fields)
✅ $50 badge disappears after payment
✅ Premium plan auto-selects after payment
✅ Admin panel shows both toggles ON
✅ Premium users can use the feature
✅ Webhook processes correctly
✅ No errors in console or logs

## Support

If you encounter issues not covered here:
1. Check server logs for errors
2. Check Stripe webhook delivery attempts
3. Verify all environment variables are set
4. Review the [PREMIUM_PAYMENT_SETUP.md](PREMIUM_PAYMENT_SETUP.md)
5. Review the [AI_PREMIUM_SYNC_GUIDE.md](AI_PREMIUM_SYNC_GUIDE.md)
