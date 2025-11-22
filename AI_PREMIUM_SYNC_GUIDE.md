# AI & Premium Feature Sync Guide

This guide explains how AI Try-On and Premium features are synchronized between the try-on page and the admin panel.

## Feature Overview

### AI Try-On Enabled (`aiEnabled`)
- Free trial access to AI virtual try-on feature
- Can be enabled independently without Premium
- Automatically enabled when Premium is purchased
- Users with AI enabled can use the trial plan on try-on page

### Premium Subscription (`hasPremium`)
- Paid subscription for $50 (one-time payment)
- Includes AI try-on access (automatically enables `aiEnabled`)
- Grants access to all products in selected category
- Managed via Stripe payment integration

## Synchronization Flow

### 1. Trial Plan Selection (Try-On Page)

**User Action:** User selects "Trial" plan on `/tryonyou` page

**What Happens:**
1. User uploads photo and submits form
2. System calls `/api/user/enable-ai` endpoint
3. Database updated: `aiEnabled = true`
4. Admin panel shows: "AI Try-On Enabled" ✅

**Result in Admin Panel:**
- ✅ AI Try-On Enabled: ON
- ❌ Premium Subscription: OFF

```typescript
// Code: app/tryonyou/try-on-you-client.tsx
if (selectedPlan === 'trial') {
    await fetch('/api/user/enable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
    })
}
```

### 2. Premium Purchase (Try-On Page)

**User Action:** User clicks "Premium" plan → Payment modal opens → Completes Stripe payment

**What Happens:**
1. User redirected to Stripe checkout ($50 payment)
2. User completes payment
3. Stripe webhook fires `checkout.session.completed` event
4. Webhook handler updates database: `hasPremium = true` AND `aiEnabled = true`
5. User redirected back to try-on page with success message

**Result in Admin Panel:**
- ✅ AI Try-On Enabled: ON
- ✅ Premium Subscription: ON

```typescript
// Code: app/api/webhooks/stripe/route.ts
await db.user.update({
  where: { id: userId },
  data: {
    hasPremium: true,
    aiEnabled: true, // Enable AI when premium is purchased
  },
});
```

### 3. Admin Panel Toggle - AI Try-On

**Admin Action:** Toggle "AI Try-On Enabled" in admin panel

**Rules:**
- ✅ Can enable AI independently (without Premium)
- ❌ Cannot disable AI if Premium is enabled
- Error message shown: "Cannot disable AI when Premium is enabled"

**Code Logic:**
```typescript
// Code: components/admin/customer-toggles.tsx
const handleAiToggle = async (checked: boolean) => {
  // If premium is enabled, don't allow disabling AI
  if (hasPremium && !checked) {
    setError('Cannot disable AI when Premium is enabled');
    return;
  }
  // ... update logic
}
```

### 4. Admin Panel Toggle - Premium Subscription

**Admin Action:** Toggle "Premium Subscription" in admin panel

**What Happens:**

**When Enabling Premium:**
1. `hasPremium = true`
2. `aiEnabled = true` (automatically enabled)
3. AI toggle becomes disabled (grayed out)
4. Description changes to: "Enabled with Premium subscription"

**When Disabling Premium:**
1. `hasPremium = false`
2. `aiEnabled` status remains unchanged (keeps previous value)
3. AI toggle becomes enabled again

**Code Logic:**
```typescript
// Code: actions/admin-customers.ts
export async function updateUserPremiumStatus(userId: string, hasPremium: boolean) {
  const updateData: { hasPremium: boolean; aiEnabled?: boolean } = { hasPremium };

  if (hasPremium) {
    updateData.aiEnabled = true; // Auto-enable AI when premium is enabled
  }

  await db.user.update({
    where: { id: userId },
    data: updateData,
  });
}
```

## Feature State Matrix

| User Action | `aiEnabled` | `hasPremium` | Admin Panel Display |
|-------------|-------------|--------------|---------------------|
| New user (no action) | `false` | `false` | Both OFF |
| Selects Trial plan | `true` | `false` | AI ON, Premium OFF |
| Purchases Premium | `true` | `true` | Both ON |
| Admin enables AI only | `true` | `false` | AI ON, Premium OFF |
| Admin enables Premium | `true` | `true` | Both ON (AI auto-enabled) |
| Admin disables Premium | `true` | `false` | AI ON, Premium OFF |

## File Structure

### API Endpoints
- `app/api/user/enable-ai/route.ts` - Enable AI for trial plan
- `app/api/payment/premium-checkout/route.ts` - Create Stripe checkout
- `app/api/webhooks/stripe/route.ts` - Handle payment completion

### Components
- `app/tryonyou/try-on-you-client.tsx` - Try-on page UI
- `components/premium-payment-modal.tsx` - Payment modal
- `components/admin/customer-toggles.tsx` - Admin panel toggles

### Actions
- `actions/admin-customers.ts` - Admin toggle handlers

## Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  clerkId       String   @unique
  email         String   @unique
  firstName     String?
  lastName      String?
  imageUrl      String?
  aiEnabled     Boolean  @default(false)  // AI try-on access
  hasPremium    Boolean  @default(false)  // Premium subscription
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // ... other fields
}
```

## Testing the Sync

### Test 1: Trial Plan Flow
1. Go to `/tryonyou`
2. Select "Trial" plan
3. Upload photo and submit
4. Check admin panel `/admin/customers`
5. **Expected:** AI Try-On Enabled ✅, Premium Subscription ❌

### Test 2: Premium Purchase Flow
1. Go to `/tryonyou`
2. Click "Premium" plan
3. Complete payment ($50)
4. Return to site with success message
5. Check admin panel `/admin/customers`
6. **Expected:** AI Try-On Enabled ✅, Premium Subscription ✅

### Test 3: Admin Toggle - Enable AI
1. Go to `/admin/customers/<user-id>`
2. Toggle "AI Try-On Enabled" to ON
3. **Expected:** AI enabled, Premium stays OFF

### Test 4: Admin Toggle - Enable Premium
1. Go to `/admin/customers/<user-id>`
2. Toggle "Premium Subscription" to ON
3. **Expected:** Premium enabled, AI auto-enabled
4. **Expected:** AI toggle becomes disabled (grayed out)

### Test 5: Admin Toggle - Cannot Disable AI with Premium
1. Ensure user has Premium enabled
2. Try to toggle "AI Try-On Enabled" to OFF
3. **Expected:** Error message: "Cannot disable AI when Premium is enabled"
4. **Expected:** AI toggle remains ON

### Test 6: Admin Toggle - Disable Premium
1. Go to `/admin/customers/<user-id>` with Premium ON
2. Toggle "Premium Subscription" to OFF
3. **Expected:** Premium disabled, AI remains enabled
4. **Expected:** AI toggle becomes enabled (can be toggled)

## SQL Queries for Testing

### Check User Status
```sql
SELECT id, email, "aiEnabled", "hasPremium"
FROM "User"
WHERE email = 'test@example.com';
```

### Manually Set Trial User
```sql
UPDATE "User"
SET "aiEnabled" = true, "hasPremium" = false
WHERE email = 'test@example.com';
```

### Manually Set Premium User
```sql
UPDATE "User"
SET "aiEnabled" = true, "hasPremium" = true
WHERE email = 'test@example.com';
```

### Reset User
```sql
UPDATE "User"
SET "aiEnabled" = false, "hasPremium" = false
WHERE email = 'test@example.com';
```

## Important Notes

1. **Premium always includes AI**: When a user purchases Premium, both `hasPremium` and `aiEnabled` are set to `true`

2. **AI can exist without Premium**: Users can have `aiEnabled = true` and `hasPremium = false` (trial users)

3. **Premium cannot be disabled if AI needs to stay on**: The admin UI prevents disabling AI when Premium is enabled

4. **Disabling Premium keeps AI status**: When admin disables Premium, the AI status is not changed (it keeps whatever value it had)

5. **Webhook handles Premium purchases**: The Stripe webhook automatically sets both fields when payment succeeds

6. **Trial submission enables AI**: When users submit the try-on form with trial plan, AI is enabled via API call

## Troubleshooting

### Issue: Premium purchased but AI not enabled
**Solution:** Check webhook logs, verify `metadata.type === 'premium_purchase'`, ensure webhook updates both fields

### Issue: Trial plan doesn't enable AI
**Solution:** Check if `/api/user/enable-ai` is being called, verify API endpoint is working

### Issue: Admin can't toggle AI
**Solution:** Check if user has Premium enabled, AI toggle should be disabled when Premium is ON

### Issue: Database not updating
**Solution:** Check database connection, verify Prisma client is properly initialized, check server logs

## Related Documentation

- [PREMIUM_PAYMENT_SETUP.md](PREMIUM_PAYMENT_SETUP.md) - Premium payment setup
- [PREMIUM_TESTING_CHECKLIST.md](PREMIUM_TESTING_CHECKLIST.md) - Testing checklist
