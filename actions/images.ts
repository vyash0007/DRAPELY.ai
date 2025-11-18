'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * Check if a user-specific image exists in Cloudinary
 * Uses Cloudinary Admin API to check if resource exists
 * @param userId - User ID
 * @param productId - Product ID
 * @param imageIndex - Image index (0 for first image, 1 for second, etc.)
 * @returns The secure URL if image exists, null otherwise
 */
export async function getUserSpecificImageUrl(
  userId: string,
  productId: string,
  imageIndex: number = 0
): Promise<string | null> {
  const imageSuffix = imageIndex > 0 ? `_${imageIndex}` : '';
  const publicId = `ecommerce-products/users/${productId}_${userId}${imageSuffix}`;

  console.log('[getUserSpecificImageUrl] Checking Cloudinary for:', {
    publicId,
    userId,
    productId,
    imageIndex,
  });

  try {
    // Use Cloudinary Admin API to check if resource exists
    // Similar to: cloudinary.api.resource("ecommerce-products/users/clmi50w3b2wp812msog4g_cmi4zu9zv0000ull4ctqkclah")
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
    });

    // If resource exists, return its secure URL
    if (resource && resource.secure_url) {
      console.log('[getUserSpecificImageUrl] ✅ Resource found:', {
        publicId,
        secureUrl: resource.secure_url.substring(0, 50) + '...',
      });
      return resource.secure_url;
    }

    console.log('[getUserSpecificImageUrl] ⚠️ Resource found but no secure_url:', { publicId });
    return null;
  } catch (error: any) {
    // If resource doesn't exist, Cloudinary throws an error with status 404
    if (error?.http_code === 404 || error?.message?.includes('not found') || error?.message?.includes('Not Found')) {
      console.log('[getUserSpecificImageUrl] ❌ Resource not found (404):', {
        publicId,
        http_code: error?.http_code,
      });
      return null;
    }
    
    // Log other errors but don't throw - return null to fall back to original image
    console.error('[getUserSpecificImageUrl] ❌ Error checking Cloudinary resource:', {
      publicId,
      error: error?.message || error,
      http_code: error?.http_code,
    });
    return null;
  }
}

/**
 * Get the best image URL based on user subscription status
 * Checks Cloudinary API for user-specific images
 */
export async function getBestImageUrl(
  originalUrl: string,
  userId: string | null,
  productId: string,
  hasPremium: boolean,
  aiEnabled: boolean,
  isTrialProduct: boolean,
  imageIndex: number = 0
): Promise<string> {
  console.log('[getBestImageUrl] Getting best image URL:', {
    productId,
    userId,
    hasPremium,
    aiEnabled,
    isTrialProduct,
    imageIndex,
  });

  // If no user, return original
  if (!userId) {
    console.log('[getBestImageUrl] No userId, returning original');
    return originalUrl;
  }
  
  // Premium users: Always check for user-specific images
  if (hasPremium) {
    console.log('[getBestImageUrl] Premium user, checking for AI image...');
    const userImageUrl = await getUserSpecificImageUrl(userId, productId, imageIndex);
    if (userImageUrl) {
      console.log('[getBestImageUrl] ✅ Using AI image for premium user');
      return userImageUrl;
    }
    console.log('[getBestImageUrl] ⚠️ No AI image found for premium user, using original');
  }
  
  // AI-enabled users: Only for trial products
  if (aiEnabled && isTrialProduct) {
    console.log('[getBestImageUrl] AI-enabled user with trial product, checking for AI image...');
    const userImageUrl = await getUserSpecificImageUrl(userId, productId, imageIndex);
    if (userImageUrl) {
      console.log('[getBestImageUrl] ✅ Using AI image for AI-enabled user');
      return userImageUrl;
    }
    console.log('[getBestImageUrl] ⚠️ No AI image found for AI-enabled user, using original');
  }
  
  // Regular users or if user-specific image doesn't exist: Return original
  console.log('[getBestImageUrl] Using original image');
  return originalUrl;
}

