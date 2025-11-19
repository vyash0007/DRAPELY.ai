# DRAPELY.ai Admin Panel Guide

## Overview

The DRAPELY.ai Admin Panel is a complete management system for your e-commerce store. It provides a secure interface for managing products, viewing orders, and monitoring store performance.

## Features

- **Email/Password Authentication** - Simple, secure login system
- **Product Management** - Create, edit, delete, and manage product inventory
- **Order Management** - View and track customer orders
- **Dashboard** - Overview of store statistics and quick actions
- **Image Upload** - Cloudinary integration for product images
- **Search & Filters** - Find products and orders quickly
- **Pagination** - Handle large datasets efficiently

## Tech Stack

- **Next.js 16.0.3** - App Router, Server Components, Server Actions
- **React 19.2.0** - UI Library
- **TypeScript 5** - Full type safety
- **PostgreSQL (Neon) + Prisma 6.19.0** - Database (shared with main app)
- **TailwindCSS 4 + Radix UI** - Styling and components
- **Cloudinary 2.8.0 + Next-Cloudinary 6.17.5** - Image storage and optimization

---

## Getting Started

### 1. Environment Setup

Add these variables to your `.env` file:

```env
# Admin Panel Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPass123
```

**IMPORTANT**: Change these to secure credentials before deploying to production!

### 2. Access the Admin Panel

Navigate to: `http://localhost:3000/admin/login`

**Default Credentials:**
- Email: `admin@example.com`
- Password: `StrongPass123`

---

## Admin Panel Structure

```
app/admin/
├── login/                    # Login page (public)
│   └── page.tsx
└── (dashboard)/              # Protected admin routes
    ├── layout.tsx            # Dashboard layout with sidebar
    ├── dashboard/            # Overview page
    │   └── page.tsx
    ├── products/             # Product management
    │   ├── page.tsx          # Product listing
    │   ├── new/              # Create product
    │   │   └── page.tsx
    │   └── [id]/edit/        # Edit product
    │       └── page.tsx
    └── orders/               # Order management
        ├── page.tsx          # Order listing
        └── [id]/            # Order details
            └── page.tsx

components/admin/
├── login-form.tsx            # Login form
├── sidebar.tsx               # Navigation sidebar
├── topbar.tsx                # Top header bar
├── product-form.tsx          # Shared create/edit form
├── product-table.tsx         # Product listing table
├── product-filters.tsx       # Search and category filters
├── image-uploader.tsx        # Cloudinary image upload
├── delete-product-dialog.tsx # Confirmation dialog
├── order-table.tsx           # Order listing table
├── order-filters.tsx         # Order search and status filters
└── pagination.tsx            # Pagination controls

actions/
├── admin-auth.ts             # Login/logout actions
├── admin-products.ts         # Product CRUD actions
└── admin-orders.ts           # Order fetch actions

lib/
└── admin-auth.ts             # Auth utilities & session management
```

---

## Pages & Features

### 1. Login Page (`/admin/login`)

**Features:**
- Email/password authentication
- Session stored in httpOnly cookies
- Auto-redirect if already logged in

**Security:**
- Credentials verified against environment variables
- No database storage of admin passwords
- Secure cookie-based sessions

### 2. Dashboard (`/admin/dashboard`)

**Features:**
- Total revenue
- Order count (total, pending, processing, delivered)
- Product count
- Quick action cards

**Data Sources:**
- Real-time statistics from database
- Aggregated revenue calculations
- Order status breakdown

### 3. Products (`/admin/products`)

**List View:**
- Search by title or slug
- Filter by category
- Pagination (10 items per page)
- Quick edit and delete actions

**Create Product (`/admin/products/new`):**
- Title (auto-generates slug)
- Description
- Price (decimal)
- Stock quantity
- Category selection
- Featured toggle
- Multiple image upload (Cloudinary)

**Edit Product (`/admin/products/[id]/edit`):**
- All fields editable
- Add/remove images
- Update stock
- Change category

**Features:**
- Client-side form validation
- Server-side data validation
- Image preview before upload
- Loading states
- Error handling

### 4. Orders (`/admin/orders`)

**List View:**
- Search by order number or customer email
- Filter by status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- Pagination (20 items per page)
- View order details

**Order Detail (`/admin/orders/[id]`):**
- Order items with images
- Customer information
- Payment details (Stripe session/payment ID)
- Order status
- Total amount
- Order date

**Features:**
- Read-only (orders controlled by Stripe webhooks)
- Full order history
- Customer lookup

---

## Server Actions

### Authentication (`actions/admin-auth.ts`)

```typescript
// Login
await loginAdmin(email, password);

// Logout
await logoutAdmin();
```

### Products (`actions/admin-products.ts`)

```typescript
// Get all products with filters
await getAdminProducts({ search, categoryId, page, limit });

// Get single product
await getAdminProductById(id);

// Create product
await createProduct(formData);

// Update product
await updateProduct(id, formData);

// Delete product
await deleteProduct(id);

// Get categories
await getAdminCategories();
```

### Orders (`actions/admin-orders.ts`)

```typescript
// Get all orders with filters
await getAdminOrders({ search, status, page, limit });

// Get single order
await getAdminOrderById(id);

// Get statistics
await getOrderStatistics();
```

---

## Authentication Flow

### Login Process

1. User enters email and password
2. Credentials verified against `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env
3. If valid, httpOnly cookie created with 7-day expiration
4. User redirected to `/admin/dashboard`

### Session Management

- **Cookie Name**: `admin-session`
- **Path**: `/admin` (only accessible on admin routes)
- **Duration**: 7 days
- **Security**: httpOnly, sameSite: lax

### Route Protection

All routes under `/admin/(dashboard)` are protected by:
1. **Layout-level auth check** - `requireAdminAuth()` in `layout.tsx`
2. **Server action auth** - Each action calls `requireAdminAuth()`

If not authenticated, user is redirected to `/admin/login`.

---

## Image Upload

### Cloudinary Integration

The admin panel uses the existing Cloudinary setup from the main app.

**Upload Flow:**
1. User selects images in product form
2. Client uploads to `/api/upload` endpoint
3. Server uploads to Cloudinary
4. Cloudinary URLs returned and stored in database

**Features:**
- Multiple image upload
- Image preview
- Primary image indicator (first image)
- Remove images
- Automatic optimization by Cloudinary

**Configuration:**
Uses same Cloudinary credentials as main app:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Database Schema

The admin panel uses the **same Prisma schema** as the main e-commerce app.

### Key Models

**Product:**
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  images      String[]
  featured    Boolean  @default(false)
  categoryId  String
  category    Category @relation(...)
  // ...
}
```

**Order:**
```prisma
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)
  total           Decimal     @db.Decimal(10, 2)
  stripeSessionId String?     @unique
  userId          String
  user            User        @relation(...)
  items           OrderItem[]
  // ...
}
```

**Category:**
```prisma
model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  products Product[]
  // ...
}
```

---

## UI Components

### Shadcn UI Components Used

- **Button** - Actions and navigation
- **Input** - Form fields
- **Label** - Form labels
- **Textarea** - Description fields
- **Select** - Category and status dropdowns
- **Checkbox** - Featured toggle
- **AlertDialog** - Delete confirmation

### Custom Components

**AdminSidebar:**
- Navigation menu
- Active route highlighting
- Logout button

**AdminTopbar:**
- Page title
- User avatar
- Notification icon (placeholder)

**ProductForm:**
- Shared between create and edit
- Auto-slug generation
- Image uploader integration
- Client-side validation

**ImageUploader:**
- Drag-drop support
- Multiple file upload
- Preview grid
- Remove images

**Pagination:**
- Page numbers
- Previous/Next buttons
- Total results count
- Smart ellipsis (...) for many pages

---

## Workflow Examples

### Adding a New Product

1. Navigate to `/admin/products`
2. Click "Add Product" button
3. Fill in product details:
   - Title: "Summer Dress"
   - Price: 49.99
   - Stock: 50
   - Category: Select from dropdown
   - Upload images
   - Toggle "Featured" if desired
4. Click "Create Product"
5. Redirected to product list
6. Product appears on main store immediately

### Managing Orders

1. Navigate to `/admin/orders`
2. Search by customer email or order number
3. Filter by status (e.g., "PENDING")
4. Click "View" icon to see order details
5. Review order items, customer info, payment status

**Note**: Order status is managed by Stripe webhooks and cannot be changed manually in the admin panel.

### Editing Product Stock

1. Navigate to `/admin/products`
2. Click "Edit" icon on product
3. Update "Stock Quantity" field
4. Click "Update Product"
5. Stock updated in database
6. Customers see new stock on product page

---

## Security Considerations

### Production Checklist

Before deploying to production:

1. **Change admin credentials**
   ```env
   ADMIN_EMAIL=your-secure-email@domain.com
   ADMIN_PASSWORD=VeryStrongPassword123!@#
   ```

2. **Use environment variables**
   - Never commit `.env` to git
   - Use platform environment variables (Vercel, etc.)

3. **Enable HTTPS**
   - Cookie `secure` flag will be true in production
   - Prevents session hijacking

4. **Consider additional security**
   - Rate limiting on login endpoint
   - 2FA (future enhancement)
   - IP whitelisting (if needed)

### Current Security Features

- **httpOnly cookies** - Not accessible via JavaScript
- **sameSite: lax** - CSRF protection
- **Server-side validation** - All actions verify auth
- **No database passwords** - Credentials in env only
- **Path-restricted cookies** - Only sent to `/admin/*`

---

## Integration with Main App

The admin panel is **fully integrated** with the main e-commerce app:

### Shared Resources

1. **Database** - Same Prisma client and schema
2. **Cloudinary** - Same upload API and credentials
3. **Environment** - Shares most env variables

### Data Sync

Changes in admin panel are **immediately reflected** in main app:

- Product created → Appears on store
- Product stock updated → Customers see new stock
- Product deleted → Removed from store

### Revalidation

Admin actions automatically revalidate relevant pages:

```typescript
revalidatePath('/admin/products');
revalidatePath('/products');
revalidatePath('/');
```

This ensures cache is cleared and changes are visible.

---

## Troubleshooting

### "Invalid email or password"

**Cause**: Credentials don't match `.env` variables

**Solution**:
1. Check `.env` file has `ADMIN_EMAIL` and `ADMIN_PASSWORD`
2. Restart dev server after changing `.env`
3. Ensure no extra spaces in credentials

### "Unauthorized" on admin pages

**Cause**: Session expired or not logged in

**Solution**:
1. Go to `/admin/login` and login again
2. Check browser cookies aren't blocked
3. Clear cookies and try again

### Image upload fails

**Cause**: Cloudinary credentials not configured

**Solution**:
1. Verify Cloudinary env variables are set
2. Check API route `/api/upload` exists
3. Test Cloudinary credentials in dashboard

### Products not appearing after creation

**Cause**: Database connection issue

**Solution**:
1. Check `DATABASE_URL` is correct
2. Run `npx prisma db push` to sync schema
3. Run `npx prisma generate` to regenerate client
4. Check Neon database is active

### Can't access `/admin/*` routes

**Cause**: Routing issue or middleware conflict

**Solution**:
1. Check folder structure matches exactly
2. Verify `(dashboard)` folder has parentheses
3. Restart dev server
4. Clear `.next` cache: `rm -rf .next`

---

## Development Tips

### Testing

**Quick Test Flow:**
1. Login: `/admin/login`
2. View dashboard: Check stats load
3. Create product: Upload images, save
4. Edit product: Change stock
5. View orders: Check order list
6. View order detail: Check all data displays

### Debugging

**Check auth status:**
```typescript
import { isAdminAuthenticated } from '@/lib/admin-auth';

const authenticated = await isAdminAuthenticated();
console.log('Admin authenticated:', authenticated);
```

**Check database queries:**
```typescript
// Enable Prisma query logging in lib/db.ts
const db = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Performance

- **Pagination**: Limits data fetched per page
- **Server Components**: Most components are server-rendered
- **Selective revalidation**: Only invalidates affected paths
- **Lazy image loading**: Next.js Image component

---

## Extending the Admin Panel

### Adding New Features

**Example: Add a "Published" toggle to products**

1. Update Prisma schema:
```prisma
model Product {
  // ...
  published Boolean @default(true)
}
```

2. Run migration:
```bash
npx prisma db push
npx prisma generate
```

3. Update `ProductForm`:
```typescript
const [formData, setFormData] = useState({
  // ...
  published: product?.published || true,
});

// Add checkbox
<Checkbox
  id="published"
  checked={formData.published}
  onCheckedChange={(checked) =>
    setFormData({ ...formData, published: checked as boolean })
  }
/>
```

4. Update server action:
```typescript
await db.product.create({
  data: {
    // ...
    published: data.published,
  },
});
```

### Adding New Pages

**Example: Add a Categories management page**

1. Create page: `app/admin/(dashboard)/categories/page.tsx`
2. Create actions: `actions/admin-categories.ts`
3. Add to sidebar: Update `components/admin/sidebar.tsx`
4. Implement CRUD operations

---

## API Reference

### Admin Auth Utilities

```typescript
// lib/admin-auth.ts

// Verify credentials against env
verifyAdminCredentials(email: string, password: string): boolean

// Create session cookie
await createAdminSession(): Promise<void>

// Check if authenticated
await isAdminAuthenticated(): Promise<boolean>

// Require auth or redirect
await requireAdminAuth(): Promise<void>

// Destroy session
await destroyAdminSession(): Promise<void>
```

### Product Actions

```typescript
// actions/admin-products.ts

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  featured: boolean;
}

await getAdminProducts(filters?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
})

await getAdminProductById(id: string)
await createProduct(data: ProductFormData)
await updateProduct(id: string, data: ProductFormData)
await deleteProduct(id: string)
await getAdminCategories()
```

### Order Actions

```typescript
// actions/admin-orders.ts

await getAdminOrders(filters?: {
  search?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
})

await getAdminOrderById(id: string)
await getOrderStatistics()
```

---

## Deployment

### Vercel Deployment

1. **Environment Variables**:
   Add all required env variables in Vercel dashboard:
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - Cloudinary credentials
   - etc.

2. **Build Settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Deploy**:
   ```bash
   git push origin main
   ```
   Vercel auto-deploys from GitHub.

4. **Access Admin**:
   `https://yourdomain.com/admin/login`

### Security in Production

- Change default admin credentials!
- Use strong passwords (20+ characters)
- Enable Vercel's authentication (optional extra layer)
- Monitor login attempts
- Consider adding rate limiting

---

## Support

For issues or questions:

1. Check this guide
2. Review code comments
3. Check main app documentation
4. Review troubleshooting section

---

## Changelog

### Version 1.0 (Initial Release)

**Features:**
- Email/password authentication
- Product CRUD with image upload
- Order viewing and filtering
- Dashboard with statistics
- Search and pagination
- Mobile-responsive UI

**Tech:**
- Next.js 14 App Router
- TypeScript
- Prisma
- Shadcn UI
- Cloudinary

---

## License

Same as main e-commerce application (MIT).

---

**DRAPELY.ai** - Built with Next.js 16

