# Fashion E-commerce Setup Guide

## Overview
This is a full-stack e-commerce application built with Next.js 14, featuring:
- Product browsing and detailed views
- Shopping cart functionality
- Stripe checkout integration
- Order history tracking
- Clerk authentication
- Cloudinary image management

## Tech Stack
- **Frontend**: Next.js 14, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (Neon recommended)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Image Storage**: Cloudinary

---

## Prerequisites
- Node.js 18+
- PostgreSQL database (local or Neon)
- Clerk account
- Stripe account
- Cloudinary account

---

## Installation Steps

### 1. Clone and Install Dependencies
```bash
cd virtual-tryon
npm install
```

### 2. Database Setup (Neon PostgreSQL)

#### Option A: Neon (Recommended for Production)
1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create a new database
createdb fashion_store
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Fill in the environment variables:

#### Database
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

#### Clerk Setup
1. Go to [Clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable and secret keys
4. Add to `.env`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### Stripe Setup
1. Go to [Stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. Set up webhook endpoint:
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook secret to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Cloudinary Setup
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Get your cloud name and API credentials
3. Add to `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### App URL
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Migration
```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npx prisma generate

# Seed database with sample products
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Management

### View Database (Prisma Studio)
```bash
npm run db:studio
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

---

## Project Structure

```
virtual-tryon/
├── actions/              # Server actions
│   ├── cart.ts          # Cart operations
│   ├── orders.ts        # Order & Stripe integration
│   └── products.ts      # Product queries
├── app/                 # Next.js app directory
│   ├── api/
│   │   ├── upload/      # Cloudinary upload endpoint
│   │   └── webhooks/
│   │       └── stripe/  # Stripe webhook handler
│   ├── cart/            # Shopping cart page
│   ├── checkout/
│   │   └── success/     # Order confirmation
│   ├── orders/          # Order history
│   ├── products/
│   │   ├── [slug]/      # Product detail page
│   │   └── page.tsx     # Products listing
│   ├── layout.tsx       # Root layout with Navbar
│   └── page.tsx         # Homepage
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── add-to-cart-button.tsx
│   ├── cart-item.tsx
│   ├── navbar.tsx
│   ├── product-card.tsx
│   └── product-grid.tsx
├── lib/                 # Utilities
│   ├── auth.ts          # Clerk helpers
│   ├── cloudinary.ts    # Cloudinary config
│   ├── db.ts            # Prisma client
│   ├── stripe.ts        # Stripe client
│   └── utils.ts         # Helper functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── middleware.ts        # Clerk auth middleware
```

---

## Key Features Implementation

### 1. Products
- Products are managed directly in PostgreSQL
- Use Prisma Studio or SQL to add/edit products
- Images stored on Cloudinary

### 2. Shopping Cart
- Server-side cart persistence
- Real-time quantity updates
- Stock validation

### 3. Checkout
- Stripe Checkout integration
- Automatic order creation
- Stock decrement after successful payment

### 4. Orders
- Order history for authenticated users
- Order status tracking
- Email notifications (via Stripe)

### 5. Authentication
- Clerk handles all auth flows
- Auto-sync users to database
- Protected routes via middleware

---

## Adding Products Manually

### Using Prisma Studio
```bash
npm run db:studio
```
1. Navigate to Product model
2. Click "Add record"
3. Fill in fields:
   - title, slug (unique), description
   - price (decimal)
   - stock (integer)
   - categoryId (select from Category)
   - images (array of URLs)
   - featured (boolean)

### Using SQL
```sql
INSERT INTO "Product" (id, title, slug, description, price, stock, "categoryId", images, featured, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'New Product',
  'new-product',
  'Product description',
  99.99,
  50,
  (SELECT id FROM "Category" WHERE slug = 'mens-fashion'),
  ARRAY['https://cloudinary.com/image1.jpg'],
  true,
  NOW(),
  NOW()
);
```

---

## Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables (from `.env`)
4. Deploy

### 3. Setup Production Webhook
1. In Stripe Dashboard, add webhook endpoint:
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
2. Copy webhook secret to Vercel environment variables

### 4. Update App URL
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## Testing

### Test Payments
Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Test Webhooks Locally
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check SSL mode for cloud databases
- Ensure database is accessible

### Clerk Auth Not Working
- Verify API keys in `.env`
- Check middleware configuration
- Ensure URLs match Clerk dashboard

### Stripe Webhook Failing
- Verify webhook secret
- Check Stripe CLI is running
- Review webhook logs in Stripe Dashboard

### Images Not Loading
- Verify Cloudinary credentials
- Check image URLs are accessible
- Ensure CORS is configured

---

## Admin Tasks

Since there's no admin dashboard, manage data via:

1. **Prisma Studio** (Recommended)
   ```bash
   npm run db:studio
   ```

2. **Direct PostgreSQL Access**
   ```bash
   psql $DATABASE_URL
   ```

3. **Neon Console**
   - Access via Neon dashboard

---

## Support

For issues:
1. Check environment variables
2. Review server logs
3. Verify external service status (Clerk, Stripe, Cloudinary)
4. Check database connectivity

---

## License
MIT
