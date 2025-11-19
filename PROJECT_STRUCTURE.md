# DRAPELY.ai Project Structure

## Complete File Tree

```
DRAPELY-Ecommerce/
├── actions/
│   ├── admin-auth.ts              # Admin authentication actions
│   ├── admin-orders.ts            # Admin order queries
│   ├── admin-products.ts          # Admin product CRUD actions
│   ├── cart.ts                    # Cart server actions (add, remove, update, get)
│   ├── orders.ts                  # Order & Stripe checkout actions
│   └── products.ts                # Product queries (get, search, featured)
│
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx          # Admin login page
│   │   └── (dashboard)/
│   │       ├── layout.tsx        # Admin dashboard layout
│   │       ├── dashboard/
│   │       │   └── page.tsx      # Admin dashboard overview
│   │       ├── products/
│   │       │   ├── page.tsx      # Product list
│   │       │   ├── new/
│   │       │   │   └── page.tsx  # Create product
│   │       │   └── [id]/edit/
│   │       │       └── page.tsx  # Edit product
│   │       └── orders/
│   │           ├── page.tsx      # Order list
│   │           └── [id]/
│   │               └── page.tsx  # Order details
│   │
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
│   ├── admin/
│   │   ├── delete-product-dialog.tsx  # Confirmation dialog
│   │   ├── image-uploader.tsx         # Cloudinary image upload
│   │   ├── login-form.tsx             # Admin login form
│   │   ├── order-filters.tsx          # Order search/filters
│   │   ├── order-table.tsx            # Order listing table
│   │   ├── pagination.tsx             # Pagination controls
│   │   ├── product-filters.tsx        # Product search/filters
│   │   ├── product-form.tsx           # Product create/edit form
│   │   ├── product-table.tsx          # Product listing table
│   │   ├── sidebar.tsx                # Admin navigation sidebar
│   │   └── topbar.tsx                 # Admin top header bar
│   │
│   ├── ui/
│   │   ├── alert-dialog.tsx      # Alert dialog component
│   │   ├── badge.tsx             # Badge component
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card components
│   │   ├── checkbox.tsx          # Checkbox component
│   │   ├── input.tsx             # Input component
│   │   ├── label.tsx             # Label component
│   │   ├── select.tsx            # Select dropdown component
│   │   └── textarea.tsx          # Textarea component
│   │
│   ├── add-to-cart-button.tsx   # Reusable add to cart button
│   ├── cart-item.tsx             # Cart item with quantity controls
│   ├── navbar.tsx                # Navigation bar with cart icon
│   ├── product-card.tsx          # Product card component
│   ├── product-grid.tsx          # Product grid layout
│   └── smart-image.tsx           # Optimized image component
│
├── lib/
│   ├── admin-auth.ts             # Admin authentication helpers
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
├── ADMIN_PANEL_GUIDE.md          # Detailed admin documentation
├── ADMIN_README.md               # Admin quick start
├── COMPLETE_GUIDE.md             # Complete file & folder guide
├── eslint.config.mjs
├── IMPLEMENTATION_SUMMARY.md     # Feature checklist
├── middleware.ts                 # Clerk authentication middleware
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── PROJECT_STRUCTURE.md          # This file
├── QUICKSTART.md                 # 5-minute setup guide
├── README.md                     # Project overview
├── SETUP.md                      # Detailed setup instructions
├── TROUBLESHOOTING.md            # Common issues and solutions
├── tsconfig.json
└── wake-db.js                    # Database wake script for Neon
```

## Directory Descriptions

### `/actions`
Server actions for data mutations and queries. These are "use server" functions that can be called directly from client components.

**Customer Actions:**
- `cart.ts`: Add/remove/update cart items, get user's cart
- `orders.ts`: Create checkout sessions, fetch orders
- `products.ts`: Get products, search, filter by category

**Admin Actions:**
- `admin-auth.ts`: Admin login/logout
- `admin-products.ts`: Product CRUD operations
- `admin-orders.ts`: Admin order queries and statistics

### `/app`
Next.js 16 App Router directory. Each folder represents a route.

**Customer Pages:**
- `/`: Homepage with hero and featured products
- `/products`: Product listing with category filter
- `/products/[slug]`: Individual product detail page
- `/cart`: Shopping cart
- `/checkout/success`: Order confirmation
- `/orders`: Order history
- `/search`: Product search

**Admin Pages:**
- `/admin/login`: Admin authentication
- `/admin/dashboard`: Overview with statistics
- `/admin/products`: Product management (list, create, edit, delete)
- `/admin/orders`: Order viewing and filtering

**API Routes:**
- `/api/upload`: Image upload to Cloudinary
- `/api/webhooks/stripe`: Stripe payment webhook handler

### `/components`
Reusable React components.

**Admin Components** (`/admin`):
- `sidebar.tsx`: Admin navigation
- `topbar.tsx`: Admin header
- `product-form.tsx`: Product create/edit form
- `product-table.tsx`: Product listing with actions
- `order-table.tsx`: Order listing
- `image-uploader.tsx`: Multi-image upload with preview
- `pagination.tsx`: Reusable pagination

**UI Components** (`/ui`):
- Radix UI based components (Button, Card, Input, Badge, Select, etc.)
- Fully customizable with TailwindCSS

**Customer Components:**
- `navbar.tsx`: Main navigation with auth, cart icon, categories
- `product-card.tsx`: Product display card
- `product-grid.tsx`: Responsive product grid
- `cart-item.tsx`: Cart item with quantity controls
- `add-to-cart-button.tsx`: Reusable add to cart functionality
- `smart-image.tsx`: Optimized image loading with Next-Cloudinary

### `/lib`
Utility functions and configurations.

**Files:**
- `admin-auth.ts`: Admin authentication and session management
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
Product categories (Men's Fashion, Women's Fashion, Kids).

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

- **Customer Auth**: Clerk authentication with middleware
- **Admin Auth**: Email/password with httpOnly cookies
- **Protected Routes**: Middleware for customer, layout checks for admin
- **API Security**: Authentication required for uploads
- **Payment Security**: Stripe webhook signature verification
- **Database Security**: SQL injection prevention (Prisma)
- **CSRF Protection**: Next.js built-in
- **Environment Variables**: Validated on startup

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
- Test admin login and features
- Change admin credentials to production values
- Monitor error logs

---

**DRAPELY.ai** - Built with Next.js 16
