import { NextResponse } from 'next/server';
import { getProductsByMetadata } from '@/actions/products';

export async function GET() {
  try {
    // Fetch all products with is_trial: true
    const trialProducts = await getProductsByMetadata('is_trial', 'true', 100);
    
    console.log('🔍 [TRIAL PRODUCTS API] Found trial products:', trialProducts.length);
    
    // If no products found with string 'true', try boolean true
    let finalTrialProducts = trialProducts;
    if (trialProducts.length === 0) {
      console.log('⚠️ [TRIAL PRODUCTS API] No products found with is_trial="true", trying boolean true...');
      // We'll need to modify getProductsByMetadata or query directly
      // For now, let's add better logging to see what's in the database
    }
    
    // Build garment_images object with product IDs and their first image URL
    const garmentImages: Record<string, string> = {};
    
    for (const product of trialProducts) {
      console.log(`🔍 [TRIAL PRODUCTS API] Checking product ${product.id}:`, {
        title: product.title,
        hasImages: !!(product.images && product.images.length > 0),
        imageCount: product.images?.length || 0,
        metadata: product.metadata,
      });
      
      if (product.images && product.images.length > 0) {
        // Use the first image URL for each product
        garmentImages[product.id] = product.images[0];
        console.log(`✅ [TRIAL PRODUCTS API] Added product ${product.id}: ${product.images[0]}`);
      } else {
        console.warn(`⚠️ [TRIAL PRODUCTS API] Product ${product.id} has no images`);
      }
    }

    console.log('📦 [TRIAL PRODUCTS API] Returning garment_images:', Object.keys(garmentImages).length, 'products');

    return NextResponse.json({
      success: true,
      garment_images: garmentImages,
    });
  } catch (error) {
    console.error('Error fetching trial products:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch trial products',
        success: false 
      },
      { status: 500 }
    );
  }
}


