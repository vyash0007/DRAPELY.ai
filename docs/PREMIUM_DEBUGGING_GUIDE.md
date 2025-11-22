# Premium Payment Debugging Guide

## Issue: Premium purchased but still shows payment prompt

This guide will help you debug and fix the issue where a user has purchased Premium but the system still asks them to pay again.

## Step 1: Check Database Status

First, verify that the webhook actually updated the database:

```sql
-- Check user's current status
SELECT
  id,
  email,
  "aiEnabled",
  "hasPremium",
  "updatedAt"
FROM "User"
WHERE email = 'your@email.com';
```

### Expected Result:
- `hasPremium` = `true`
- `aiEnabled` = `true`
- `updatedAt` = Recent timestamp (after payment)

### If Database is NOT Updated:

**Problem:** Webhook didn't fire or failed

**Solution:**
1. Check if Stripe CLI is running:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Check webhook logs in terminal for errors

3. Manually update database for testing:
   ```sql
   UPDATE "User"
   SET "hasPremium" = true, "aiEnabled" = true
   WHERE email = 'your@email.com';
   ```

4. Refresh the try-on page

## Step 2: Check Browser Console

Open browser DevTools (F12) → Console tab

Look for this debug log:
```
🔍 [TRY-ON] User Premium Status: {
  email: "your@email.com",
  hasPremium: true,  // ← Should be true
  aiEnabled: true     // ← Should be true
}
```

### If hasPremium is false:

**Problem:** Page is loading cached user data

**Solutions:**

1. **Hard refresh the page:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Or use Incognito/Private window

3. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## Step 3: Verify Page Cache Settings

The try-on page should have these settings in `app/tryonyou/page.tsx`:

```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

These ensure the page doesn't cache user data.

### Check the file:
```bash
# Should show these exports
grep -n "dynamic\|revalidate" app/tryonyou/page.tsx
```

## Step 4: Check Router Refresh

The client component should refresh after payment. Check `try-on-you-client.tsx`:

```typescript
// Should have this code
if (!hasRefreshed.current) {
    hasRefreshed.current = true;
    router.refresh();
}
```

## Step 5: Manual Testing Steps

1. **Clear everything and start fresh:**
   ```sql
   -- Reset user to non-premium
   UPDATE "User"
   SET "hasPremium" = false, "aiEnabled" = false
   WHERE email = 'your@email.com';
   ```

2. **Restart development server:**
   ```bash
   npm run dev
   ```

3. **Clear browser cache** (or use Incognito)

4. **Login and navigate to** `/tryonyou`

5. **Check console** - should show `hasPremium: false`

6. **Click Premium** - payment modal should open

7. **Complete payment** with test card

8. **After redirect** - check console again

9. **Expected** - should show `hasPremium: true`

10. **Expected** - $50 badge should be gone

## Step 6: Test Webhook Manually

If webhook isn't updating database, test it manually:

### Check Webhook Secret

```bash
# .env file should have
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Test Webhook Endpoint

```bash
# Check if endpoint is accessible
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json"

# Should return error about missing signature (that's OK)
# If 404 or server error, webhook endpoint has issues
```

### Check Webhook Logs

After payment, check server terminal for:
```
User {userId} upgraded to premium successfully (Premium & AI enabled)
```

If this appears, webhook worked correctly.

## Step 7: Common Issues & Fixes

### Issue 1: Database Updated but UI Still Shows $50

**Cause:** Frontend has cached user data

**Fix:**
```typescript
// Ensure router.refresh() is being called
// Check browser console for:
🔍 [TRY-ON] User Premium Status: { hasPremium: true }
```

If console shows `false` but database shows `true`:
1. Hard refresh browser (Ctrl+Shift+R)
2. Restart dev server
3. Try different browser

### Issue 2: Infinite Refresh Loop (Fixed)

**Cause:** `router.refresh()` causing re-render loop

**Fix:** Using `useRef` to track if refresh already happened:
```typescript
const hasRefreshed = useRef(false);

if (!hasRefreshed.current) {
    hasRefreshed.current = true;
    router.refresh();
}
```

### Issue 3: Payment Succeeds but Database Not Updated

**Cause:** Webhook not firing or failing

**Checklist:**
- [ ] Stripe CLI running
- [ ] Correct webhook secret in `.env`
- [ ] Server running on correct port (3000)
- [ ] Check webhook logs for errors
- [ ] Verify metadata in Stripe dashboard

**Fix:**
```bash
# Ensure Stripe CLI is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret and update .env
# Restart server
npm run dev
```

### Issue 4: Modal Opens Even After Purchase

**Cause:** `user.hasPremium` is false in client

**Debug:**
1. Check browser console log
2. Verify database value
3. Hard refresh page
4. Check if `dynamic = 'force-dynamic'` is set

**Fix:**
```sql
-- Manually verify and update if needed
SELECT "hasPremium" FROM "User" WHERE email = 'your@email.com';

-- If false but should be true:
UPDATE "User" SET "hasPremium" = true WHERE email = 'your@email.com';
```

Then refresh page.

## Step 8: Verify Complete Flow

After fixes, test the complete flow:

1. **Database:** `hasPremium = false`
2. **Browser:** Open `/tryonyou` in Incognito
3. **UI:** See $50 badge on Premium
4. **Action:** Click Premium → Modal opens
5. **Action:** Complete payment
6. **Webhook:** Check logs for success message
7. **Database:** Verify `hasPremium = true`
8. **Browser:** Should redirect to `/tryonyou?premium=success`
9. **UI:** Success banner shows
10. **UI:** $50 badge is **gone**
11. **UI:** Premium is **auto-selected**
12. **Console:** Shows `hasPremium: true`

## Step 9: Production Deployment

When deploying to production:

1. **Remove debug console.log:**
   ```typescript
   // Comment out or remove this:
   console.log('🔍 [TRY-ON] User Premium Status:', ...);
   ```

2. **Verify environment variables:**
   - `STRIPE_SECRET_KEY` = Live key
   - `STRIPE_WEBHOOK_SECRET` = Production webhook secret
   - `NEXT_PUBLIC_APP_URL` = Production domain

3. **Test in production:**
   - Use small test amount first
   - Verify webhook fires
   - Check database updates
   - Verify UI updates correctly

## Quick Fix Commands

```bash
# 1. Restart everything
# Stop server (Ctrl+C)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy webhook secret to .env
npm run dev

# 2. Clear Next.js cache
rm -rf .next
npm run dev

# 3. Force refresh browser
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

## SQL Quick Fixes

```sql
-- Check status
SELECT email, "hasPremium", "aiEnabled" FROM "User";

-- Force premium for testing
UPDATE "User"
SET "hasPremium" = true, "aiEnabled" = true
WHERE email = 'your@email.com';

-- Reset for re-testing
UPDATE "User"
SET "hasPremium" = false, "aiEnabled" = false
WHERE email = 'your@email.com';
```

## Support Checklist

If still not working, provide:

- [ ] Database query result (hasPremium value)
- [ ] Browser console output (hasPremium log)
- [ ] Server logs (webhook processing)
- [ ] Stripe dashboard (payment status)
- [ ] Browser used (Chrome, Firefox, etc.)
- [ ] Steps to reproduce the issue

## Next Steps

Once working:
1. Remove debug console.log statements
2. Test with different users
3. Test payment failure scenarios
4. Test with real Stripe account (test mode)
5. Deploy to production and verify
