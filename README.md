# Fashion E-commerce Store

A modern, full-stack e-commerce application built with Next.js 14, featuring a complete shopping experience with product browsing, cart management, secure checkout, and order tracking.

## Features

- **Product Catalog**: Browse and search products with category filtering
- **Product Details**: Detailed product pages with image galleries
- **Shopping Cart**: Persistent cart with real-time updates
- **Secure Checkout**: Stripe payment integration
- **Order Management**: Order history and tracking
- **Authentication**: Clerk-powered user authentication
- **Image Management**: Cloudinary integration for product images
- **Responsive Design**: Mobile-first design with TailwindCSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (recommended)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon.tech recommended)
- Accounts for: Clerk, Stripe, Cloudinary

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials (see SETUP.md for detailed instructions)

3. **Set up database**
   ```bash
   npm run db:push
   npx prisma generate
   npm run db:seed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## Project Structure

```
virtual-tryon/
├── actions/              # Server actions for data mutations
├── app/                  # Next.js app directory
│   ├── api/             # API routes (upload, webhooks)
│   ├── cart/            # Shopping cart page
│   ├── checkout/        # Checkout success page
│   ├── orders/          # Order history
│   ├── products/        # Product pages
│   └── search/          # Search page
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   └── ...              # Feature components
├── lib/                 # Utilities and configurations
└── prisma/              # Database schema and seeds
```

## Key Features

### 1. Product Management
- Products are managed via PostgreSQL/Prisma
- Rich product details with multiple images
- Category organization
- Stock tracking
- Featured product highlighting

### 2. Shopping Cart
- Server-side cart persistence
- Real-time quantity updates
- Stock validation
- Cart items sync across devices

### 3. Checkout & Payments
- Stripe Checkout integration
- Secure payment processing
- Automatic order creation
- Email confirmations

### 4. Order Tracking
- Complete order history
- Order status tracking
- Detailed order information

### 5. Authentication
- Clerk authentication integration
- Protected routes
- User profile management
- Automatic database sync

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## Environment Variables

Required environment variables:

```env
DATABASE_URL                          # PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # Clerk public key
CLERK_SECRET_KEY                      # Clerk secret key
STRIPE_SECRET_KEY                     # Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   # Stripe public key
STRIPE_WEBHOOK_SECRET                 # Stripe webhook secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    # Cloudinary cloud name
CLOUDINARY_API_KEY                    # Cloudinary API key
CLOUDINARY_API_SECRET                 # Cloudinary API secret
NEXT_PUBLIC_APP_URL                   # Your app URL
```

See [.env.example](./.env.example) for complete list.

## Database Schema

The application uses the following main models:

- **User**: Customer accounts (synced with Clerk)
- **Category**: Product categories
- **Product**: Product catalog
- **Cart**: Shopping carts
- **CartItem**: Cart line items
- **Order**: Customer orders
- **OrderItem**: Order line items

See [prisma/schema.prisma](./prisma/schema.prisma) for complete schema.

## Adding Products

### Option 1: Prisma Studio (Recommended)
```bash
npm run db:studio
```
Navigate to Product model and add records through the UI.

### Option 2: Direct SQL
Connect to your database and insert products manually.

### Option 3: API/Script
Create a custom script to bulk import products.

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Production Checklist

- [ ] Set up production database (Neon recommended)
- [ ] Configure Clerk production instance
- [ ] Set up Stripe production keys
- [ ] Configure Stripe webhook endpoint
- [ ] Set up Cloudinary production environment
- [ ] Update NEXT_PUBLIC_APP_URL
- [ ] Test checkout flow
- [ ] Test webhook handling

## Testing

### Test Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

Any future expiry date, any CVC, any ZIP code.

### Test Webhooks Locally

```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Architecture Decisions

### Why Server Actions?
- Simplified data mutations
- Type-safe API
- Automatic revalidation
- Better DX with colocation

### Why Clerk?
- Production-ready authentication
- Easy integration
- User management UI
- Security best practices

### Why Stripe Checkout?
- Handles payment UI
- PCI compliance
- Multiple payment methods
- Built-in fraud detection

### Why Cloudinary?
- Image optimization
- CDN delivery
- Transform on-the-fly
- Generous free tier

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning or as a template for your own e-commerce store.

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js 14
