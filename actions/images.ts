'use server';

import cloudinary from '@/lib/cloudinary';

/**
 * Check if a user-specific image exists in Cloudinary
 * Uses Cloudinary Admin API to check if resource exists
 * @param userId - User ID
 * @param productId - Product ID
 * @param imageIndex - Image index (0 for first image, 1 for second, etc.)
 * @param isPremium - Whether user is premium (determines naming convention)
 * @returns The secure URL if image exists, null otherwise
 */
export async function getUserSpecificImageUrl(
  userId: string,
  productId: string,
  imageIndex: number = 0,
  isPremium: boolean = false
): Promise<string | null> {
  const imageSuffix = imageIndex > 0 ? `_${imageIndex}` : '';
  
  // Premium convention: productId_userId (ONLY for premium users)
  // Trial convention: userId_productId (ONLY for trial users)
  const publicId = isPremium
    ? `ecommerce-products/users/${productId}_${userId}${imageSuffix}`
    : `ecommerce-products/users/${userId}_${productId}${imageSuffix}`;

  console.log('[getUserSpecificImageUrl] Checking Cloudinary for:', {
    userId,
    productId,
    imageIndex,
    isPremium,
    convention: isPremium ? 'premium (productId_userId)' : 'trial (userId_productId)',
    publicId,
  });

  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
    });

    if (resource && resource.secure_url) {
      console.log(`[getUserSpecificImageUrl] ✅ Resource found:`, {
        publicId,
        secureUrl: resource.secure_url.substring(0, 50) + '...',
        convention: isPremium ? 'premium' : 'trial',
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
        convention: isPremium ? 'premium' : 'trial',
      });
      return null;
    }
    
    // Log other errors but don't throw
    console.error('[getUserSpecificImageUrl] ❌ Error checking Cloudinary resource:', {
      publicId,
      error: error?.message || error,
      http_code: error?.http_code,
      convention: isPremium ? 'premium' : 'trial',
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
  
  // Priority check: Premium first, then AI trial (if not premium)
  // Premium users: Always check for user-specific images (all products) - uses productId_userId convention
  if (hasPremium) {
    console.log('[getBestImageUrl] Premium user, checking for AI image (premium convention: productId_userId)...');
    const userImageUrl = await getUserSpecificImageUrl(userId, productId, imageIndex, true); // isPremium = true
    if (userImageUrl) {
      console.log('[getBestImageUrl] ✅ Using AI image for premium user');
      return userImageUrl;
    }
    console.log('[getBestImageUrl] ⚠️ No AI image found for premium user, using original');
    return originalUrl; // Premium user but no AI image, return original
  }
  
  // AI-enabled users (trial): Only for trial products (only if NOT premium) - uses userId_productId convention
  if (aiEnabled && isTrialProduct) {
    console.log('[getBestImageUrl] AI-enabled user (trial) with trial product, checking for AI image (trial convention: userId_productId)...');
    const userImageUrl = await getUserSpecificImageUrl(userId, productId, imageIndex, false); // isPremium = false
    if (userImageUrl) {
      console.log('[getBestImageUrl] ✅ Using AI image for AI-enabled user');
      return userImageUrl;
    }
    console.log('[getBestImageUrl] ⚠️ No AI image found for AI-enabled user, using original');
    return originalUrl; // AI trial user but no AI image, return original
  }
  
  // Regular users or if user-specific image doesn't exist: Return original
  console.log('[getBestImageUrl] Using original image');
  return originalUrl;
}

