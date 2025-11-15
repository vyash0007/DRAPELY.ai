# Admin Panel - Quick Start

## Access

**URL**: `http://localhost:3000/admin/login`

**Default Credentials**:
- Email: `admin@example.com`
- Password: `StrongPass123`

## Features

- Product Management (Create, Edit, Delete)
- Order Viewing & Tracking
- Dashboard with Statistics
- Image Upload (Cloudinary)
- Search & Filtering
- Pagination

## Setup

1. **Add admin credentials to `.env`**:
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPass123
```

2. **Restart dev server** (if running):
```bash
npm run dev
```

3. **Access admin panel**:
Navigate to `http://localhost:3000/admin/login`

## File Structure

```
app/admin/
├── login/                    # Login page
└── (dashboard)/              # Protected routes
    ├── dashboard/            # Overview
    ├── products/             # Product management
    │   ├── page.tsx          # List
    │   ├── new/              # Create
    │   └── [id]/edit/        # Edit
    └── orders/               # Order management
        ├── page.tsx          # List
        └── [id]/             # Details

components/admin/             # Admin UI components
actions/admin-*.ts            # Server actions
lib/admin-auth.ts             # Authentication
```

## Common Tasks

### Create a Product
1. Go to Products → Add Product
2. Fill in title, price, stock, category
3. Upload images
4. Save

### View Orders
1. Go to Orders
2. Search by email or order number
3. Click to view details

### Edit Product Stock
1. Go to Products
2. Click edit icon
3. Update stock number
4. Save

## Security

**IMPORTANT**: Change default credentials before production!

```env
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSWORD=VeryStrongPassword!
```

## Documentation

See `ADMIN_PANEL_GUIDE.md` for complete documentation.

## Troubleshooting

**Can't login?**
- Check `.env` has `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Restart dev server after changing `.env`

**Images not uploading?**
- Verify Cloudinary credentials in `.env`

**Database errors?**
- Run `npx prisma generate`
- Check Neon database is active

## Tech Stack

- Next.js 14 (App Router + Server Actions)
- TypeScript
- PostgreSQL + Prisma
- TailwindCSS + Shadcn UI
- Cloudinary

---

**For detailed documentation, see [ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md)**
