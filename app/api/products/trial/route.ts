import { NextRequest, NextResponse } from 'next/server';
import { getTrialProducts, getTrialProductsByCategory, getAllProductsByCategory, getProducts } from '@/actions/products';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get('category');
    const plan = searchParams.get('plan') || 'trial'; // 'trial' or 'premium'
    
    console.log('🔍 [PRODUCTS API] Category filter:', categorySlug || 'none', 'Plan:', plan);
    
    let products;
    
    if (plan === 'premium' || plan === 'subscribed') {
      // Premium/Subscribed: Get ALL products from category (not just trial)
      if (categorySlug) {
        products = await getAllProductsByCategory(categorySlug, 100);
      } else {
        // If no category, get all products (first page, but we need all)
        const result = await getProducts({ categorySlug: undefined, page: 1, limit: 100 });
        products = result.products;
      }
      console.log('🔍 [PRODUCTS API] Found products (premium):', products.length);
    } else {
      // Trial: Get only products with availableForTryOn: true
      products = categorySlug
        ? await getTrialProductsByCategory(categorySlug, 100)
        : await getTrialProducts(100);
      console.log('🔍 [PRODUCTS API] Found trial products:', products.length);
    }
    
    // Build garment_images object with product IDs and their first image URL
    const garmentImages: Record<string, string> = {};
    
    for (const product of products) {
      console.log(`🔍 [PRODUCTS API] Checking product ${product.id}:`, {
        title: product.title,
        hasImages: !!(product.images && product.images.length > 0),
        imageCount: product.images?.length || 0,
        metadata: product.metadata,
      });
      
      if (product.images && product.images.length > 0) {
        // Use the first image URL for each product
        garmentImages[product.id] = product.images[0];
        console.log(`✅ [PRODUCTS API] Added product ${product.id}: ${product.images[0]}`);
      } else {
        console.warn(`⚠️ [PRODUCTS API] Product ${product.id} has no images`);
      }
    }

    console.log('📦 [PRODUCTS API] Returning garment_images:', Object.keys(garmentImages).length, 'products');

    return NextResponse.json({
      success: true,
      garment_images: garmentImages,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        success: false 
      },
      { status: 500 }
    );
  }
}


