# Project Structure

## Complete File Tree

```
virtual-tryon/
├── actions/
│   ├── cart.ts                    # Cart server actions (add, remove, update, get)
│   ├── orders.ts                  # Order & Stripe checkout actions
│   └── products.ts                # Product queries (get, search, featured)
│
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts          # Cloudinary image upload endpoint
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts      # Stripe webhook handler
│   │
│   ├── cart/
│   │   └── page.tsx              # Shopping cart page
│   │
│   ├── checkout/
│   │   └── success/
│   │       └── page.tsx          # Order success confirmation
│   │
│   ├── orders/
│   │   └── page.tsx              # Order history page
│   │
│   ├── products/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # Product detail page (dynamic route)
│   │   └── page.tsx              # Products listing page
│   │
│   ├── search/
│   │   └── page.tsx              # Product search page
│   │
│   ├── favicon.ico
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with Navbar & ClerkProvider
│   └── page.tsx                  # Homepage
│
├── components/
│   ├── ui/
│   │   ├── badge.tsx             # Badge component (Shadcn-style)
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card components
│   │   └── input.tsx             # Input component
│   │
│   ├── add-to-cart-button.tsx   # Reusable add to cart button
│   ├── cart-item.tsx             # Cart item with quantity controls
│   ├── navbar.tsx                # Navigation bar with cart icon
│   ├── product-card.tsx          # Product card component
│   └── product-grid.tsx          # Product grid layout
│
├── lib/
│   ├── auth.ts                   # Clerk auth helpers (getCurrentUser, requireAuth)
│   ├── cloudinary.ts             # Cloudinary configuration
│   ├── db.ts                     # Prisma client singleton
│   ├── stripe.ts                 # Stripe client configuration
│   └── utils.ts                  # Utility functions (cn, formatPrice, formatDate)
│
├── prisma/
│   ├── schema.prisma             # Complete database schema
│   └── seed.ts                   # Database seeding script
│
├── public/
│   ├── next.svg
│   └── vercel.svg
│
├── .env.example                  # Environment variables template
├── .gitignore
├── eslint.config.mjs
├── middleware.ts                 # Clerk authentication middleware
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── PROJECT_STRUCTURE.md          # This file
├── README.md                     # Project overview
├── SETUP.md                      # Detailed setup instructions
└── tsconfig.json
```

## Directory Descriptions

### `/actions`
Server actions for data mutations and queries. These are "use server" functions that can be called directly from client components.

**Files:**
- `cart.ts`: Add/remove/update cart items, get user's cart
- `orders.ts`: Create checkout sessions, fetch orders
- `products.ts`: Get products, search, filter by category

### `/app`
Next.js 14 App Router directory. Each folder represents a route.

**Key Pages:**
- `/`: Homepage with hero and featured products
- `/products`: Product listing with category filter
- `/products/[slug]`: Individual product detail page
- `/cart`: Shopping cart
- `/checkout/success`: Order confirmation
- `/orders`: Order history
- `/search`: Product search

**API Routes:**
- `/api/upload`: Image upload to Cloudinary
- `/api/webhooks/stripe`: Stripe payment webhook handler

### `/components`
Reusable React components.

**UI Components** (`/ui`):
- Shadcn-style components (Button, Card, Input, Badge)
- Fully customizable with TailwindCSS

**Feature Components:**
- `navbar.tsx`: Main navigation with auth, cart icon, categories
- `product-card.tsx`: Product display card
- `product-grid.tsx`: Responsive product grid
- `cart-item.tsx`: Cart item with quantity controls
- `add-to-cart-button.tsx`: Reusable add to cart functionality

### `/lib`
Utility functions and configurations.

**Files:**
- `auth.ts`: Clerk authentication helpers
- `db.ts`: Prisma client (singleton pattern)
- `stripe.ts`: Stripe API client
- `cloudinary.ts`: Cloudinary configuration
- `utils.ts`: Helper functions (formatting, class merging)

### `/prisma`
Database schema and seeding.

**Files:**
- `schema.prisma`: Complete database schema (User, Product, Category, Cart, Order)
- `seed.ts`: Sample data seeding script

## Key Files Explained

### `middleware.ts`
Clerk authentication middleware that protects routes. Public routes include homepage, products, sign-in/up, and webhooks.

### `.env.example`
Template for environment variables. Copy to `.env` and fill in:
- Database URL
- Clerk keys
- Stripe keys
- Cloudinary credentials
- App URL

### `package.json`
Scripts:
- `dev`: Start development server
- `build`: Build for production
- `db:push`: Push schema to database
- `db:seed`: Seed database
- `db:studio`: Open Prisma Studio

## Database Models

### User
Linked to Clerk, stores user info and relations to carts/orders.

### Category
Product categories (Men's Fashion, Women's Fashion, Accessories).

### Product
Complete product info including images, price, stock, category.

### Cart & CartItem
Persistent shopping cart for logged-in users.

### Order & OrderItem
Order tracking with Stripe integration.

## Data Flow

### Product Browsing
1. Server component fetches products via `getProducts()` action
2. ProductGrid displays ProductCard components
3. Client-side AddToCartButton handles cart additions

### Shopping Cart
1. User adds product → `addToCart()` server action
2. Cart stored in PostgreSQL, linked to user
3. Cart page fetches via `getCart()` action
4. CartItem component handles quantity updates

### Checkout
1. User clicks checkout → `createCheckoutSession()` action
2. Order created in database (PENDING status)
3. Redirected to Stripe Checkout
4. User completes payment

### Webhook Processing
1. Stripe sends webhook to `/api/webhooks/stripe`
2. Webhook verifies signature
3. On success: Order status updated, stock decremented, cart cleared
4. On failure: Order marked as CANCELLED

## Authentication Flow

1. Clerk handles sign-in/sign-up
2. Middleware protects routes
3. `getCurrentUser()` syncs Clerk user to database
4. User automatically created in DB on first login

## Image Management

1. Authenticated users upload via `/api/upload`
2. Images stored in Cloudinary
3. URLs saved in Product.images array
4. Next.js Image component handles optimization

## Type Safety

- TypeScript throughout
- Prisma generates types from schema
- Server actions have full type inference
- Components use typed props

## Performance Optimizations

- Server Components by default (reduces JS bundle)
- Image optimization with Next.js Image
- Database indexes on frequently queried fields
- Cloudinary CDN for images
- Static generation where possible

## Security Features

- Clerk authentication
- Protected API routes
- Stripe webhook signature verification
- SQL injection prevention (Prisma)
- CSRF protection (Next.js built-in)
- Environment variable validation

## Deployment Considerations

### Environment Setup
- All environment variables must be set
- Database must be accessible
- Webhook endpoints configured

### Vercel Deployment
- Push to GitHub
- Import in Vercel
- Add environment variables
- Auto-deploys on push

### Post-Deployment
- Test checkout flow
- Verify webhook handling
- Check email notifications
- Monitor error logs
