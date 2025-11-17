import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Revalidate all category-related caches
    revalidateTag('categories', 'max');
    revalidateTag('products', 'max');
    revalidateTag('featured', 'max');

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
