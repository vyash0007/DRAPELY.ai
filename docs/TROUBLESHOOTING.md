# DRAPELY.ai Troubleshooting Guide

## Database Connection Issues

### Problem: "Can't reach database server"

This error occurs when the application cannot connect to your Neon PostgreSQL database.

**Note**: The app has been designed to degrade gracefully when the database is unreachable. The navbar and homepage will still render, showing empty state instead of crashing. However, for full functionality, the database must be accessible.

### Solutions:

#### 1. **Check Neon Database Status**
- Go to [Neon Console](https://console.neon.tech)
- Verify your database is active
- Check if it's been suspended due to inactivity

#### 2. **Wake Database and Restart Server**
```bash
# Kill the current dev server (Ctrl+C)
# Wake database and restart:
npm run dev:wake

# Or wake manually then start:
npm run db:wake
npm run dev
```

#### 3. **Test Database Connection**
```bash
# Test if Prisma can connect
npx prisma db pull
```

#### 4. **Update Connection String**
If the connection string has changed in Neon:
1. Go to Neon Console → Connection Details
2. Copy the "Pooled connection" string
3. Update `.env`:
```env
DATABASE_URL="your-new-connection-string"
```

#### 5. **Use Direct Connection (Alternative)**
If pooled connection fails, try direct connection:
1. In Neon Console, copy "Direct connection" string
2. Update `.env`
3. Restart dev server

---

## Prisma Client Not Generated

### Problem: "@prisma/client did not initialize yet"

### Solution:
```bash
npx prisma generate
```

---

## Port Already in Use

### Problem: "Port 3000 is in use"

### Solution (Windows):
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill //F //PID <PID>

# Or let Next.js use another port
# It will automatically use 3001, 3002, etc.
```

---

## Clerk Authentication Not Working

### Problem: Redirect loops or auth errors

### Solutions:

#### 1. **Verify Environment Variables**
Check `.env`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### 2. **Check Clerk Dashboard**
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Verify domain is correct
- Check API keys match `.env`

#### 3. **Clear Browser Cache**
- Hard refresh: `Ctrl + Shift + R`
- Or clear cookies for localhost

---

## Stripe Webhook Not Working

### Problem: Payments not completing, orders stuck in PENDING

### Solutions:

#### 1. **Install Stripe CLI** (Local Development)
```bash
# Windows (with Scoop)
scoop install stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### 2. **Copy Webhook Secret**
```bash
# After running `stripe listen`, copy the webhook secret (whsec_...)
# Update .env:
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

#### 3. **Production Webhooks**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Copy signing secret to production env variables

---

## Cloudinary Upload Fails

### Problem: Image upload returns error

### Solutions:

#### 1. **Verify Credentials**
Check `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 2. **Check Cloudinary Dashboard**
- Go to [Cloudinary Console](https://cloudinary.com/console)
- Verify account is active
- Check API credentials match

#### 3. **Test Upload**
```typescript
// In browser console (after logging in)
const formData = new FormData();
formData.append('file', yourImageFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

console.log(await response.json());
```

---

## Build Errors

### Problem: `npm run build` fails

### Solutions:

#### 1. **Clear Next.js Cache**
```bash
rm -rf .next
# or on Windows:
rmdir /s .next

# Then rebuild:
npm run build
```

#### 2. **Check TypeScript Errors**
```bash
npm run lint
```

#### 3. **Verify Environment Variables**
All required variables must be set for build to succeed.

---

## Database Schema Changes Not Reflecting

### Problem: Code changes but database stays the same

### Solution:
```bash
# Push schema changes
npm run db:push

# Or create migration
npx prisma migrate dev --name your_change_name

# Regenerate client
npx prisma generate
```

---

## Products Not Showing

### Problem: Homepage or products page is empty

### Solutions:

#### 1. **Verify Database Has Products**
```bash
npm run db:studio
# Check Product table has records
```

#### 2. **Re-seed Database**
```bash
npm run db:seed
```

#### 3. **Check Console for Errors**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

---

## Admin Panel Issues

### Problem: Can't access admin panel

### Solutions:

#### 1. **Check Admin Credentials**
Verify `.env` has admin credentials:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPass123
```

#### 2. **Restart Server After Adding Credentials**
```bash
# Ctrl+C to stop
npm run dev
```

#### 3. **Clear Browser Cookies**
- Admin session is stored in cookies
- Clear cookies for localhost
- Try logging in again

### Problem: Admin session expires immediately

### Solution:
- Check browser isn't blocking cookies
- Ensure you're accessing via http://localhost:3000 (not 127.0.0.1)
- Clear cookies and try again

### Problem: Can't upload images in admin panel

### Solution:
- Verify Cloudinary credentials in `.env`
- Check you're logged in (authentication required)
- Ensure image file size is reasonable (< 10MB)

---

## Quick Debug Checklist

When something isn't working:

- [ ] **Check `.env` file** - All variables filled in (including admin credentials)?
- [ ] **Database reachable?** - Run `npm run db:wake` or `npx prisma db pull`
- [ ] **Prisma generated?** - Run `npx prisma generate`
- [ ] **Dev server running?** - Check terminal
- [ ] **Browser console errors?** - Open DevTools (F12)
- [ ] **Clerk authenticated?** - Try signing out/in
- [ ] **Admin authenticated?** - Check admin login at /admin/login
- [ ] **Stripe webhook running?** - Check `stripe listen` terminal
- [ ] **Clear cache** - Delete `.next` folder and browser cache, restart

---

## Getting Help

### Check Logs
1. **Next.js Terminal** - Server errors
2. **Browser Console** - Client errors
3. **Neon Dashboard** - Database errors
4. **Clerk Dashboard** - Auth errors
5. **Stripe Dashboard** - Payment errors

### Common Error Messages

| Error | Location | Solution |
|-------|----------|----------|
| "Can't reach database" | Terminal | Check Neon status, run `npm run db:wake` |
| "Prisma Client not initialized" | Terminal | Run `npx prisma generate` |
| "Unauthorized" (customer) | Browser | Sign in with Clerk |
| "Unauthorized" (admin) | Admin panel | Login at /admin/login |
| "Invalid email or password" | Admin login | Check ADMIN_EMAIL and ADMIN_PASSWORD in .env |
| "Webhook signature invalid" | Stripe | Update STRIPE_WEBHOOK_SECRET |
| "Port in use" | Terminal | Kill process or use different port |

---

## Still Having Issues?

1. **Check all environment variables** are correct
2. **Restart everything**:
   ```bash
   # Stop dev server (Ctrl+C)
   # Clear cache
   rm -rf .next
   # Restart
   npm run dev
   ```
3. **Verify external services** (Neon, Clerk, Stripe, Cloudinary) are active
4. **Check network connectivity** - Some services may be blocked by firewall/VPN

---

## Preventive Measures

### Before Development
- [ ] Verify Neon database is active
- [ ] Check Clerk dashboard is accessible
- [ ] Ensure Stripe test mode is enabled
- [ ] Confirm all `.env` variables are set

### During Development
- [ ] Save files before testing
- [ ] Clear browser cache when auth issues occur
- [ ] Monitor terminal for errors
- [ ] Keep Stripe CLI running if testing checkout

### Before Deployment
- [ ] Run `npm run build` locally
- [ ] Test full checkout flow
- [ ] Test admin panel functionality
- [ ] Verify webhook endpoints
- [ ] Change admin credentials to strong production values
- [ ] Update production environment variables

---

**Remember**: Most issues are related to:
1. Missing/incorrect environment variables (especially admin credentials)
2. Database connectivity (Neon sleep mode)
3. Cached data (clear `.next` folder and browser cache)
4. Admin session cookies (clear and re-login)

For deployment-specific issues, see [SETUP.md](./SETUP.md)

---

**DRAPELY.ai** - Built with Next.js 16
