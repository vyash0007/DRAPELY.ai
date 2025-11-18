/**
 * Get user-specific image URL for premium/AI users
 * Format: ecommerce-products/users/{userId}_{productId}.jpg
 */
export function getUserSpecificImageUrl(
  originalUrl: string,
  userId: string,
  productId: string,
  imageIndex: number = 0
): string {
  try {
    // Parse the original Cloudinary URL
    // Example: https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763497560/ecommerce-products/wc/clmi50w3b2wp812msog4g.jpg
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // Find the upload path and version
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return originalUrl;
    
    // Get version (v1763497560) - it's the part after 'upload'
    const version = pathParts[uploadIndex + 1];
    
    // Build user-specific path
    // Format: ecommerce-products/users/{userId}_{productId}.jpg
    const imageSuffix = imageIndex > 0 ? `_${imageIndex}` : '';
    const userSpecificPath = `ecommerce-products/users/${userId}_${productId}${imageSuffix}`;
    
    // Reconstruct URL with user-specific path
    // Format: https://res.cloudinary.com/dnkrqpuqk/image/upload/{version}/{userSpecificPath}.jpg
    return `${url.protocol}//${url.host}/image/upload/${version}/${userSpecificPath}.jpg`;
  } catch (error) {
    // If URL parsing fails, return original
    console.error('Error parsing image URL:', error);
    return originalUrl;
  }
}

/**
 * Get the best image URL based on user subscription status
 */
export function getBestImageUrl(
  originalUrl: string,
  userId: string | null,
  productId: string,
  hasPremium: boolean,
  aiEnabled: boolean,
  isTrialProduct: boolean,
  imageIndex: number = 0
): string {
  // If no user, return original
  if (!userId) return originalUrl;
  
  // Premium users: Always check for user-specific images
  if (hasPremium) {
    return getUserSpecificImageUrl(originalUrl, userId, productId, imageIndex);
  }
  
  // AI-enabled users: Only for trial products
  if (aiEnabled && isTrialProduct) {
    return getUserSpecificImageUrl(originalUrl, userId, productId, imageIndex);
  }
  
  // Regular users: Return original
  return originalUrl;
}

