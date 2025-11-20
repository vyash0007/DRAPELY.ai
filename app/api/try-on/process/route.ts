import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProductsByMetadata } from '@/actions/products';

export async function POST(request: NextRequest) {
  console.log('🚀 [TRY-ON API] POST request received at /api/try-on/process');
  
  try {
    // Get current user
    const user = await getCurrentUser();
    const userId = user?.id || 'anonymous';
    console.log('👤 [TRY-ON API] User ID:', userId);

    const body = await request.json();
    console.log('📦 [TRY-ON API] Request body:', {
      has_person_image: !!body.person_image,
      has_garment_images: !!body.garment_images,
      garment_images_count: body.garment_images ? Object.keys(body.garment_images).length : 0,
    });
    
    const { user_id, garment_images, person_image } = body;

    // Validate required fields
    if (!person_image) {
      return NextResponse.json(
        { error: 'person_image is required' },
        { status: 400 }
      );
    }

    // Use user_id from body if provided, otherwise use authenticated user
    const finalUserId = user_id || userId;

    // If garment_images is not provided, fetch products with is_trial: true
    let finalGarmentImages = garment_images;
    
    if (!finalGarmentImages) {
      const trialProducts = await getProductsByMetadata('is_trial', 'true', 100);
      finalGarmentImages = {};
      
      for (const product of trialProducts) {
        if (product.images && product.images.length > 0) {
          // Use the first image URL for each product
          finalGarmentImages[product.id] = product.images[0];
        }
      }
    }

    // For now, return a dummy response as requested
    // In the future, this would process the images and return actual processed image URLs
    const processedImages: Record<string, string> = {};
    
    for (const [productId, imageUrl] of Object.entries(finalGarmentImages)) {
      // Generate dummy processed image filename
      processedImages[productId] = `processed_${finalUserId}_${productId}.jpg`;
    }

    return NextResponse.json({
      success: true,
      user_id: finalUserId,
      processed_images: processedImages,
    });
  } catch (error) {
    console.error('Try-on processing error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process try-on request',
        success: false 
      },
      { status: 500 }
    );
  }
}

