import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin-session';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication by reading cookie from request
    // In API routes, we need to read cookies from the request object
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE);
    const isAdmin = adminSession?.value === 'authenticated';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }
    // Revalidate all category-related caches
    revalidateTag('categories', 'max');
    revalidateTag('products', 'max');
    revalidateTag('featured', 'max');
    revalidateTag('trial-products', 'max'); // Clear trial products cache for try-on

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: 'Cache cleared successfully'
    });
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      error: String(err)
    }, { status: 500 });
  }
}
