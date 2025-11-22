# 🚀 DRAPELY.ai Quick Start Guide

Get your e-commerce store running in **5 minutes**!

## Step 1: Install Dependencies (1 min)

```bash
cd DRAPELY-Ecommerce
npm install
```

## Step 2: Set Up Services (2 min)

### A. Database (Neon - Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project → Copy connection string

### B. Clerk (Free)
1. Go to [clerk.com](https://clerk.com)
2. Create application
3. Copy publishable key and secret key

### C. Stripe (Test Mode - Free)
1. Go to [stripe.com](https://stripe.com)
2. Sign up
3. Switch to **Test Mode**
4. Get API keys from Developers → API keys

### D. Cloudinary (Free Tier)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up
3. Dashboard → Copy cloud name, API key, API secret

## Step 3: Configure Environment (1 min)

Create `.env` file:

```bash
cp .env.example .env
```

Fill in these values:

```env
# From Neon
DATABASE_URL="postgresql://..."

# From Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# From Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # (See Step 4)

# From Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Panel (Optional - set your own credentials)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPass123

# Local dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Set Up Stripe Webhook (1 min)

**Option A: Stripe CLI (Recommended for local dev)**
```bash
# Install Stripe CLI (one-time)
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Download from https://github.com/stripe/stripe-cli/releases/latest

# Login
stripe login

# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret (whsec_...) to .env
```

**Option B: Skip for now**
- Checkout will work but orders won't auto-complete
- Add webhook later in production

## Step 5: Initialize Database (30 sec)

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npx prisma generate

# Seed with sample products
npm run db:seed
```

## Step 6: Start Development Server (10 sec)

```bash
# Option 1: Standard dev server
npm run dev

# Option 2: Wake database first (recommended for Neon)
npm run dev:wake
```

Open [http://localhost:3000](http://localhost:3000)

**Admin Panel**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## ✅ Test the App

### 1. Sign Up
- Click user icon → Sign up
- Create account (email + password)

### 2. Browse Products
- Homepage shows featured products
- Click "Shop Now" or "All Products"
- Filter by category

### 3. Add to Cart
- Click any product
- Click "Add to Cart"
- See cart icon update with count

### 4. Checkout
- Click cart icon
- Review items
- Click "Proceed to Checkout"

### 5. Test Payment
Use Stripe test card:
```
Card: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

### 6. View Order
- After payment, see confirmation
- Click "View All Orders"
- See order history

---

## 🎉 You're Done!

Your e-commerce store is running!

### What's Included?
- ✅ 10 sample products
- ✅ 3 categories
- ✅ Full cart functionality
- ✅ Stripe checkout (test mode)
- ✅ Order tracking
- ✅ User authentication
- ✅ Admin panel with dashboard
- ✅ Product management interface

---

## 🛠️ Common Issues

### Issue: Database connection fails
**Solution**: Check DATABASE_URL has `?sslmode=require` at the end

### Issue: Clerk not working
**Solution**: Verify keys are copied correctly (no extra spaces)

### Issue: Images not loading
**Solution**: Check Cloudinary credentials, ensure cloud name is correct

### Issue: Stripe checkout fails
**Solution**: Make sure using test mode keys (sk_test_... not sk_live_...)

### Issue: Webhook not working
**Solution**:
- Make sure Stripe CLI is running
- Check terminal for webhook secret
- Update STRIPE_WEBHOOK_SECRET in .env

---

## 📚 Next Steps

### Add Your Own Products

**Option 1: Admin Panel (Recommended)**
1. Go to http://localhost:3000/admin/login
2. Login with your admin credentials
3. Navigate to Products → Add Product
4. Fill in details and upload images
5. Save

**Option 2: Prisma Studio**
```bash
# Open Prisma Studio
npm run db:studio

# Navigate to Product model
# Click "Add record"
# Fill in product details
```

### Customize Styling
- Edit `app/globals.css`
- Modify component styles in `components/`
- Update TailwindCSS classes

### Deploy to Production
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

See [SETUP.md](./SETUP.md) for detailed deployment guide.

---

## 🆘 Need Help?

- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **Code Structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Feature Overview**: See [README.md](./README.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Pro Tips

1. **Use Prisma Studio** for easy database management:
   ```bash
   npm run db:studio
   ```

2. **Keep Stripe CLI running** in a separate terminal while developing

3. **Test with different scenarios**:
   - Out of stock products
   - Multiple items in cart
   - Various payment methods

4. **Monitor Stripe Dashboard** to see test payments

5. **Check Clerk Dashboard** to manage users

6. **Use Admin Panel** to manage products:
   ```
   http://localhost:3000/admin/login
   ```

---

**Happy Coding!** 🚀 | DRAPELY.ai
