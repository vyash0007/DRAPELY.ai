# Complete Project Guide - File & Folder Explanation

This document explains **every file and folder** in the project, what it does, and how to use it.

---

## 📁 Root Directory Files

### `package.json`
**Purpose**: Defines project dependencies and npm scripts.

**Key Dependencies**:
- `next@16.0.3` - Next.js framework
- `@clerk/nextjs@6.35.1` - Authentication
- `@prisma/client@6.19.0` - Database client
- `stripe@19.3.1` - Payment processing
- `cloudinary@2.8.0` - Image management

**Scripts**:
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint for code quality

npm run db:push    # Push Prisma schema to database
npm run db:seed    # Populate database with sample data
npm run db:studio  # Open Prisma Studio (visual database editor)
```

**Usage**: Run scripts to manage your development workflow.

---

### `package-lock.json`
**Purpose**: Locks exact versions of all dependencies.

**Working**: Auto-generated when you run `npm install`. Ensures all team members use identical package versions.

**Usage**: Don't edit manually. Commit to version control.

---

### `tsconfig.json`
**Purpose**: TypeScript configuration for the project.

**Key Settings**:
```json
{
  "paths": { "@/*": ["./*"] },  // Allows @/ imports
  "strict": true,                 // Enables strict type checking
  "jsx": "react-jsx"             // JSX support
}
```

**Usage**: Automatically used by TypeScript compiler. Modify if you need custom compiler options.

---

### `next.config.ts`
**Purpose**: Next.js configuration.

**Current Config**:
```typescript
const nextConfig = {};
export default nextConfig;
```

**Usage**: Add configuration for:
- Image domains (Cloudinary)
- Redirects/rewrites
- Environment variables
- Custom webpack config

---

### `eslint.config.mjs`
**Purpose**: ESLint configuration for code linting.

**Working**: Enforces code quality rules based on Next.js best practices.

**Usage**:
```bash
npm run lint  # Check for linting errors
```

---

### `postcss.config.mjs`
**Purpose**: PostCSS configuration for CSS processing.

**Working**: Configured to work with TailwindCSS 4.

**Usage**: Automatically processes CSS during build.

---

### `middleware.ts`
**Purpose**: Clerk authentication middleware.

**Working**:
```typescript
// Protects routes that require authentication
// Public routes: /, /products/*, /sign-in, /sign-up, /api/webhooks/stripe
// Protected routes: /cart, /checkout, /orders
```

**How It Works**:
1. Runs before every request
2. Checks if route is public or protected
3. If protected, verifies user is authenticated
4. Redirects to sign-in if not authenticated

**Usage**: Automatically runs. Add/remove protected routes by modifying `isPublicRoute()`.

---

### `.env` (Create this file)
**Purpose**: Stores environment variables.

**Required Variables**:
```env
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Usage**: Copy from `.env.example` and fill in your credentials.

---

### `.env.example`
**Purpose**: Template for environment variables.

**Usage**: Copy to `.env` and replace placeholder values with real credentials.

---

### `.gitignore`
**Purpose**: Specifies files Git should ignore.

**Ignored Files**:
- `node_modules/` - Dependencies
- `.env` - Secrets
- `.next/` - Build output

**Usage**: Automatically used by Git. Add patterns for files you don't want tracked.

---

## 📁 `/actions` - Server Actions

Server actions are "use server" functions that run on the server and can be called from client components.

### `actions/products.ts`
**Purpose**: Product-related database queries.

**Functions**:

```typescript
// Get all products (optionally filtered by category)
await getProducts('mens-fashion');  // Filtered
await getProducts();                 // All products

// Get featured products for homepage
await getFeaturedProducts();

// Get single product by slug
await getProductBySlug('classic-white-tshirt');

// Get all categories
await getCategories();

// Search products
await searchProducts('shirt');
```

**Working**:
- Queries Prisma database
- Returns products with category relations
- Handles errors gracefully

**Usage**: Import and call from any Server Component.

---

### `actions/cart.ts`
**Purpose**: Shopping cart operations.

**Functions**:

```typescript
// Get current user's cart
const cart = await getCart();
// Returns: { id, items[], totalItems, totalPrice }

// Add product to cart
await addToCart(productId, quantity);
// Validates stock, creates cart if needed

// Remove item from cart
await removeFromCart(cartItemId);

// Update quantity
await updateCartItemQuantity(cartItemId, newQuantity);
// Validates stock availability

// Clear entire cart
await clearCart();
```

**Working**:
1. Authenticates user via `getCurrentUser()`
2. Performs database operations
3. Validates stock levels
4. Revalidates cache for instant UI updates

**Usage**: Call from client components with user interaction.

---

### `actions/orders.ts`
**Purpose**: Order management and Stripe integration.

**Functions**:

```typescript
// Create Stripe checkout session
const { url } = await createCheckoutSession();
// Creates pending order, returns Stripe URL

// Get user's order history
const orders = await getOrders();

// Get specific order
const order = await getOrderById(orderId);

// Get order by Stripe session
const order = await getOrderBySessionId(sessionId);
```

**Working**:
1. **createCheckoutSession()**:
   - Fetches user's cart
   - Validates stock
   - Creates Order in database (PENDING status)
   - Creates Stripe Checkout session
   - Returns redirect URL

2. **getOrders()**:
   - Fetches orders for current user
   - Includes order items and products

**Usage**: Call from checkout page and order history page.

---

## 📁 `/app` - Next.js App Router

### `app/layout.tsx`
**Purpose**: Root layout wrapping all pages.

**Components**:
- `ClerkProvider` - Authentication context
- `Navbar` - Navigation bar
- `main` - Page content area
- `footer` - Footer section

**Working**:
```typescript
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <Navbar />           {/* Shows on all pages */}
          <main>{children}</main>  {/* Page content */}
          <footer>...</footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Usage**: Automatically wraps all pages. Edit to modify global structure.

---

### `app/page.tsx`
**Purpose**: Homepage (route: `/`).

**Sections**:
1. **Hero** - Welcome banner with CTA
2. **Featured Products** - Displays featured items
3. **Categories** - Links to category pages

**Working**:
```typescript
export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <FeaturedProductsSection products={featuredProducts} />
      <CategoriesSection />
    </>
  );
}
```

**Usage**: First page users see. Edit to customize homepage.

---

### `app/globals.css`
**Purpose**: Global CSS styles and TailwindCSS directives.

**Contents**:
```css
@import "tailwindcss";
/* Global styles here */
```

**Usage**: Add global styles or customize TailwindCSS theme.

---

### `app/products/page.tsx`
**Purpose**: Product listing page (route: `/products`).

**Features**:
- Lists all products
- Category filtering via query params
- Responsive grid layout

**Working**:
```typescript
export default async function ProductsPage({ searchParams }) {
  const { category } = await searchParams;
  const products = await getProducts(category);

  return (
    <div>
      <h1>{category ? category : 'All Products'}</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

**URL Examples**:
- `/products` - All products
- `/products?category=mens-fashion` - Men's fashion only

**Usage**: Users browse products here.

---

### `app/products/[slug]/page.tsx`
**Purpose**: Individual product detail page (dynamic route).

**Features**:
- Product images gallery
- Product description
- Stock status
- Add to cart button

**Working**:
```typescript
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div>
      <ImageGallery images={product.images} />
      <ProductInfo product={product} />
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```

**URL Example**: `/products/classic-white-tshirt`

**Usage**: Shows detailed product information.

---

### `app/cart/page.tsx`
**Purpose**: Shopping cart page (route: `/cart`).

**Features**:
- List cart items
- Quantity controls
- Remove items
- Order summary
- Checkout button

**Working**:
```typescript
export default async function CartPage() {
  const cart = await getCart();

  if (!cart?.items.length) {
    return <EmptyCartMessage />;
  }

  return (
    <div>
      <CartItems items={cart.items} />
      <OrderSummary cart={cart} />
      <CheckoutButton />
    </div>
  );
}
```

**Usage**: Users manage cart before checkout.

---

### `app/checkout/success/page.tsx`
**Purpose**: Order confirmation page (route: `/checkout/success`).

**Features**:
- Order success message
- Order details
- Order number
- Links to continue shopping or view orders

**Working**:
```typescript
export default async function SuccessPage({ searchParams }) {
  const { session_id } = await searchParams;
  const order = await getOrderBySessionId(session_id);

  return (
    <div>
      <SuccessIcon />
      <h1>Order Successful!</h1>
      <OrderDetails order={order} />
    </div>
  );
}
```

**URL Example**: `/checkout/success?session_id=cs_test_...`

**Usage**: Stripe redirects here after successful payment.

---

### `app/orders/page.tsx`
**Purpose**: Order history page (route: `/orders`).

**Features**:
- List all user orders
- Order status badges
- Order details
- Links to products

**Working**:
```typescript
export default async function OrdersPage() {
  const orders = await getOrders();

  if (!orders.length) {
    return <NoOrdersMessage />;
  }

  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

**Usage**: Users track their order history.

---

### `app/search/page.tsx`
**Purpose**: Product search page (route: `/search`).

**Features**:
- Search input
- Live search results
- Results count

**Working**:
```typescript
'use client';  // Client component for interactivity

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const products = await searchProducts(query);
    setResults(products);
  };

  return (
    <form onSubmit={handleSearch}>
      <Input value={query} onChange={...} />
      <ProductGrid products={results} />
    </form>
  );
}
```

**Usage**: Users search for specific products.

---

### `app/api/upload/route.ts`
**Purpose**: API endpoint for image uploads to Cloudinary.

**Method**: POST

**Working**:
```typescript
export async function POST(request) {
  // 1. Authenticate user
  await requireAuth();

  // 2. Get file from FormData
  const file = await request.formData().get('file');

  // 3. Convert to base64
  const base64 = Buffer.from(file).toString('base64');

  // 4. Upload to Cloudinary
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'ecommerce-products'
  });

  // 5. Return URL
  return json({ url: result.secure_url });
}
```

**Usage**:
```typescript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const { url } = await response.json();
```

---

### `app/api/webhooks/stripe/route.ts`
**Purpose**: Stripe webhook handler for payment events.

**Method**: POST

**Events Handled**:
1. `checkout.session.completed` - Payment successful
2. `checkout.session.expired` - Session expired
3. `payment_intent.payment_failed` - Payment failed

**Working**:
```typescript
export async function POST(req) {
  // 1. Verify webhook signature
  const signature = headers().get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, signature, secret);

  // 2. Handle event
  switch (event.type) {
    case 'checkout.session.completed':
      // Update order status to PROCESSING
      await db.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' }
      });

      // Decrement product stock
      await decrementStock(orderItems);

      // Clear user's cart
      await clearCart(userId);
      break;

    case 'checkout.session.expired':
      // Mark order as CANCELLED
      await db.order.update({ status: 'CANCELLED' });
      break;
  }

  return json({ received: true });
}
```

**Stripe Setup**:
```bash
# Local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Production
# Add webhook in Stripe Dashboard
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: checkout.session.completed, checkout.session.expired
```

**Usage**: Automatically called by Stripe. Don't call directly.

---

## 📁 `/components` - React Components

### `components/navbar.tsx`
**Purpose**: Main navigation bar (server component).

**Features**:
- Logo/brand
- Category links
- Search icon
- Cart icon with item count
- User authentication (sign in/out)

**Working**:
```typescript
export async function Navbar() {
  const cart = await getCart();  // Server-side cart fetch
  const categories = await getCategories();

  return (
    <nav>
      <Logo />
      <CategoryLinks categories={categories} />
      <SearchButton />
      <CartIcon count={cart?.totalItems} />
      <UserButton />  {/* Clerk component */}
    </nav>
  );
}
```

**Usage**: Included in root layout. Shows on all pages.

---

### `components/product-card.tsx`
**Purpose**: Product display card component.

**Props**:
```typescript
interface Props {
  product: ProductWithCategory;
}
```

**Features**:
- Product image
- Product title
- Category name
- Price
- Stock status
- Add to cart button

**Working**:
```typescript
export function ProductCard({ product }) {
  return (
    <Card>
      <Image src={product.images[0]} />
      <CardContent>
        <h3>{product.title}</h3>
        <p>{product.category.name}</p>
        <p>{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter>
        <AddToCartButton productId={product.id} />
      </CardFooter>
    </Card>
  );
}
```

**Usage**: Used in ProductGrid to display multiple products.

---

### `components/product-grid.tsx`
**Purpose**: Responsive grid layout for products.

**Props**:
```typescript
interface Props {
  products: ProductWithCategory[];
  emptyMessage?: string;
}
```

**Working**:
```typescript
export function ProductGrid({ products, emptyMessage }) {
  if (products.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Usage**:
```typescript
<ProductGrid
  products={products}
  emptyMessage="No products found"
/>
```

---

### `components/add-to-cart-button.tsx`
**Purpose**: Reusable add to cart button (client component).

**Props**:
```typescript
interface Props {
  productId: string;
  quantity?: number;
  variant?: 'default' | 'outline';
  className?: string;
}
```

**Working**:
```typescript
'use client';

export function AddToCartButton({ productId, quantity = 1 }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await addToCart(productId, quantity);
      router.refresh();  // Refresh to update cart count
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      <ShoppingCart />
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

**Usage**:
```typescript
<AddToCartButton productId={product.id} />
<AddToCartButton productId={product.id} quantity={2} variant="outline" />
```

---

### `components/cart-item.tsx`
**Purpose**: Cart item display with quantity controls (client component).

**Props**:
```typescript
interface Props {
  item: CartItemWithProduct;
}
```

**Features**:
- Product image and details
- Quantity increment/decrement buttons
- Remove button
- Item subtotal

**Working**:
```typescript
'use client';

export function CartItem({ item }) {
  const handleUpdateQuantity = async (newQuantity) => {
    await updateCartItemQuantity(item.id, newQuantity);
    router.refresh();
  };

  const handleRemove = async () => {
    await removeFromCart(item.id);
    router.refresh();
  };

  return (
    <div>
      <Image src={item.product.images[0]} />
      <div>
        <h3>{item.product.title}</h3>
        <p>{formatPrice(item.product.price)}</p>
      </div>
      <div>
        <Button onClick={() => handleUpdateQuantity(item.quantity - 1)}>-</Button>
        <span>{item.quantity}</span>
        <Button onClick={() => handleUpdateQuantity(item.quantity + 1)}>+</Button>
      </div>
      <Button onClick={handleRemove}>Remove</Button>
      <p>{formatPrice(item.product.price * item.quantity)}</p>
    </div>
  );
}
```

**Usage**: Used in cart page to display each cart item.

---

### `components/ui/button.tsx`
**Purpose**: Reusable button component (Shadcn-style).

**Props**:
```typescript
interface Props {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
}
```

**Variants**:
- `default` - Black background, white text
- `outline` - White background, border
- `ghost` - Transparent, hover effect
- `destructive` - Red background (for delete actions)

**Usage**:
```typescript
<Button>Click me</Button>
<Button variant="outline" size="lg">Large Outline</Button>
<Button variant="destructive">Delete</Button>
```

---

### `components/ui/card.tsx`
**Purpose**: Card container components.

**Components**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Subtitle text
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Category</CardDescription>
  </CardHeader>
  <CardContent>
    Product details here
  </CardContent>
  <CardFooter>
    <Button>Add to Cart</Button>
  </CardFooter>
</Card>
```

---

### `components/ui/input.tsx`
**Purpose**: Styled text input component.

**Props**:
```typescript
interface Props extends HTMLInputAttributes {
  type?: string;
  placeholder?: string;
  className?: string;
}
```

**Usage**:
```typescript
<Input
  type="text"
  placeholder="Search products..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

---

### `components/ui/badge.tsx`
**Purpose**: Badge/tag component for labels.

**Props**:
```typescript
interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
}
```

**Usage**:
```typescript
<Badge>Featured</Badge>
<Badge variant="destructive">Out of Stock</Badge>
<Badge variant="secondary">{category.name}</Badge>
```

---

## 📁 `/lib` - Utility Libraries

### `lib/db.ts`
**Purpose**: Prisma client singleton.

**Working**:
```typescript
const prismaClientSingleton = () => new PrismaClient();

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db;
}
```

**Why Singleton?**:
- Prevents multiple Prisma instances
- Avoids connection pool exhaustion
- Better performance in development

**Usage**:
```typescript
import { db } from '@/lib/db';

const products = await db.product.findMany();
const user = await db.user.create({ data: {...} });
```

---

### `lib/auth.ts`
**Purpose**: Clerk authentication helpers.

**Functions**:

```typescript
// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Require authentication (throws error if not authenticated)
const user = await requireAuth();
```

**How getCurrentUser() Works**:
```typescript
export async function getCurrentUser() {
  // 1. Get Clerk user
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // 2. Check if user exists in database
  let user = await db.user.findUnique({
    where: { clerkId: clerkUser.id }
  });

  // 3. Create user if doesn't exist (auto-sync)
  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl
      }
    });
  }

  return user;
}
```

**Usage**:
```typescript
// In server actions
export async function addToCart(productId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  // ... rest of logic
}

// Or use requireAuth() for cleaner code
export async function addToCart(productId: string) {
  const user = await requireAuth();  // Throws if not authenticated
  // ... rest of logic
}
```

---

### `lib/stripe.ts`
**Purpose**: Stripe client configuration.

**Working**:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true
});
```

**Usage**:
```typescript
import { stripe } from '@/lib/stripe';

// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [...],
  mode: 'payment',
  success_url: '...',
  cancel_url: '...'
});

// Verify webhook
const event = stripe.webhooks.constructEvent(body, signature, secret);
```

---

### `lib/cloudinary.ts`
**Purpose**: Cloudinary client configuration.

**Working**:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
```

**Usage**:
```typescript
import cloudinary from '@/lib/cloudinary';

const result = await cloudinary.uploader.upload(base64Image, {
  folder: 'ecommerce-products',
  resource_type: 'auto'
});

console.log(result.secure_url);  // Image URL
```

---

### `lib/utils.ts`
**Purpose**: Utility helper functions.

**Functions**:

```typescript
// Merge Tailwind classes (handles conflicts)
cn('px-4 py-2', 'px-6')  // Result: 'px-6 py-2'

// Format price as USD currency
formatPrice(99.99)  // Result: '$99.99'
formatPrice(1234.5)  // Result: '$1,234.50'

// Format date
formatDate(new Date())  // Result: 'November 15, 2024'
formatDate('2024-01-01')  // Result: 'January 1, 2024'
```

**Implementation**:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Price formatter
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

// Date formatter
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}
```

**Usage**:
```typescript
import { cn, formatPrice, formatDate } from '@/lib/utils';

// In components
<div className={cn('px-4', isActive && 'bg-blue-500')}>

<p>{formatPrice(product.price)}</p>

<time>{formatDate(order.createdAt)}</time>
```

---

## 📁 `/prisma` - Database

### `prisma/schema.prisma`
**Purpose**: Database schema definition.

**Models**:

#### 1. **User**
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?

  carts  Cart[]
  orders Order[]
}
```
**Purpose**: Customer accounts linked to Clerk.

---

#### 2. **Category**
```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?

  products Product[]
}
```
**Purpose**: Product categories (Men's Fashion, Women's Fashion, Accessories).

---

#### 3. **Product**
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  images      String[]  // Array of Cloudinary URLs
  featured    Boolean  @default(false)
  categoryId  String

  category   Category    @relation(...)
  cartItems  CartItem[]
  orderItems OrderItem[]
}
```
**Purpose**: Product catalog with images, pricing, stock.

---

#### 4. **Cart**
```prisma
model Cart {
  id     String @id @default(cuid())
  userId String @unique

  user  User       @relation(...)
  items CartItem[]
}
```
**Purpose**: Shopping cart container (one per user).

---

#### 5. **CartItem**
```prisma
model CartItem {
  id        String @id @default(cuid())
  quantity  Int    @default(1)
  cartId    String
  productId String

  cart    Cart    @relation(...)
  product Product @relation(...)

  @@unique([cartId, productId])  // One product per cart
}
```
**Purpose**: Individual items in cart with quantities.

---

#### 6. **Order**
```prisma
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique @default(cuid())
  status          OrderStatus @default(PENDING)
  total           Decimal     @db.Decimal(10, 2)
  stripeSessionId String?     @unique
  userId          String

  user  User        @relation(...)
  items OrderItem[]
}
```
**Purpose**: Customer orders with payment info and status.

---

#### 7. **OrderItem**
```prisma
model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)  // Price at purchase time
  orderId   String
  productId String

  order   Order   @relation(...)
  product Product @relation(...)
}
```
**Purpose**: Order line items (stores price at time of purchase).

---

**Database Commands**:
```bash
# Push schema to database (without migrations)
npx prisma db push

# Create migration
npx prisma migrate dev --name add_feature

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

### `prisma/seed.ts`
**Purpose**: Populate database with sample data.

**What It Seeds**:
- 3 Categories (Men's Fashion, Women's Fashion, Accessories)
- 10 Products with images, prices, stock

**Working**:
```typescript
async function main() {
  // Create categories
  const mensCategory = await prisma.category.upsert({
    where: { slug: 'mens-fashion' },
    update: {},
    create: {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: '...'
    }
  });

  // Create products
  await prisma.product.upsert({
    where: { slug: 'classic-white-tshirt' },
    update: {},
    create: {
      title: 'Classic White T-Shirt',
      slug: 'classic-white-tshirt',
      price: 29.99,
      stock: 100,
      categoryId: mensCategory.id,
      images: ['...'],
      featured: true
    }
  });
}

main();
```

**Usage**:
```bash
npm run db:seed
```

---

## 📁 `/public` - Static Assets

### `public/next.svg`
**Purpose**: Next.js logo.

**Usage**: Display Next.js branding.

---

### `public/vercel.svg`
**Purpose**: Vercel logo.

**Usage**: Display Vercel branding.

---

## 📄 Documentation Files

### `README.md`
**Purpose**: Project overview and quick start guide.

**Contents**:
- Feature list
- Tech stack
- Installation steps
- Available scripts
- Deployment guide

---

### `QUICKSTART.md`
**Purpose**: 5-minute setup guide.

**Contents**:
- Step-by-step setup
- Service registration (Clerk, Stripe, etc.)
- Testing instructions
- Common issues

---

### `SETUP.md`
**Purpose**: Detailed setup and deployment guide.

**Contents**:
- Complete setup instructions
- Service configuration details
- Production deployment
- Troubleshooting

---

### `PROJECT_STRUCTURE.md`
**Purpose**: File tree and architecture overview.

**Contents**:
- Complete file listing
- Directory descriptions
- Data flow explanation
- Architecture decisions

---

### `IMPLEMENTATION_SUMMARY.md`
**Purpose**: Feature checklist and implementation details.

**Contents**:
- Completed features
- File count
- Technology breakdown
- Testing checklist

---

## 🔄 Data Flow Examples

### Adding to Cart
```
1. User clicks "Add to Cart" button
   ↓
2. AddToCartButton component calls addToCart() server action
   ↓
3. Server action:
   - Authenticates user via getCurrentUser()
   - Checks product stock in database
   - Gets or creates user's cart
   - Adds CartItem to database
   - Revalidates /cart path
   ↓
4. UI updates with new cart count in navbar
```

---

### Checkout Flow
```
1. User clicks "Proceed to Checkout"
   ↓
2. createCheckoutSession() server action:
   - Fetches user's cart from database
   - Validates all items have sufficient stock
   - Creates Order (status: PENDING)
   - Creates Stripe Checkout session
   - Returns Stripe URL
   ↓
3. User redirected to Stripe Checkout page
   ↓
4. User enters payment info and submits
   ↓
5. Stripe processes payment
   ↓
6. Stripe sends webhook to /api/webhooks/stripe
   ↓
7. Webhook handler:
   - Verifies signature
   - Updates Order status to PROCESSING
   - Decrements product stock
   - Clears user's cart
   ↓
8. User redirected to /checkout/success
```

---

## 🎯 Common Tasks

### Add a New Product (via Prisma Studio)
```bash
1. npm run db:studio
2. Click "Product" model
3. Click "Add record"
4. Fill in:
   - title: Product name
   - slug: url-friendly-name (unique)
   - description: Product details
   - price: 99.99
   - stock: 50
   - categoryId: Select from dropdown
   - images: ["https://cloudinary.com/image.jpg"]
   - featured: true/false
5. Click "Save 1 change"
```

---

### Modify Cart Logic
```
1. Open actions/cart.ts
2. Find the function (addToCart, removeFromCart, etc.)
3. Modify business logic
4. Server action automatically available to client components
```

---

### Add New Category
```bash
1. npm run db:studio
2. Click "Category" model
3. Add record:
   - name: "Kids Fashion"
   - slug: "kids-fashion"
   - description: "Clothing for kids"
```

---

### Customize Navbar
```
1. Open components/navbar.tsx
2. Modify JSX structure
3. Add/remove links
4. Change styling with Tailwind classes
```

---

This completes the comprehensive guide for every file and folder in your e-commerce project!
