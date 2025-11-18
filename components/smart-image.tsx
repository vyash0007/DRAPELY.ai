'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserSpecificImageUrl, getBestImageUrl } from '@/actions/images';
import { Sparkles } from 'lucide-react';

interface SmartImageProps {
  src: string;
  alt: string;
  userId: string | null;
  productId: string;
  hasPremium: boolean;
  aiEnabled: boolean;
  isTrialProduct: boolean;
  imageIndex?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
  badgePosition?: 'left' | 'right';
}

export function SmartImage({
  src,
  alt,
  userId,
  productId,
  hasPremium,
  aiEnabled,
  isTrialProduct,
  imageIndex = 0,
  fill,
  width,
  height,
  className,
  sizes,
  quality = 85,
  priority,
  loading,
  onError,
  badgePosition = 'left',
}: SmartImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [showAiImage, setShowAiImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  // Debug: Log initial props
  useEffect(() => {
    console.log('[SmartImage] Component mounted/updated:', {
      productId,
      userId,
      hasPremium,
      aiEnabled,
      isTrialProduct,
      originalSrc: src?.substring(0, 60) + '...',
    });
  }, [productId, userId, hasPremium, aiEnabled, isTrialProduct, src]);

  // Check if user should have access to AI images
  const shouldCheckAiImage = userId && (hasPremium || (aiEnabled && isTrialProduct));

  // Fetch the best image URL on mount (original working logic)
  useEffect(() => {
    let isMounted = true;

    const fetchBestImage = async () => {
      console.log('[SmartImage] Starting image fetch:', {
        productId,
        userId,
        hasPremium,
        aiEnabled,
        isTrialProduct,
        imageIndex,
        shouldCheckAiImage,
        originalSrc: src.substring(0, 50) + '...',
      });

      if (!userId) {
        console.log('[SmartImage] No userId, using original image');
        return;
      }

      try {
        // Check if AI image exists first
        if (shouldCheckAiImage) {
          console.log('[SmartImage] Checking for AI image...');
          const aiUrl = await getUserSpecificImageUrl(userId, productId, imageIndex);
          
          if (isMounted && aiUrl) {
            console.log('[SmartImage] ✅ AI image found:', {
              aiUrl: aiUrl,
              productId,
              userId,
            });
            // AI image exists - set it up for toggle
            console.log('[SmartImage] Setting AI image URL:', {
              fullUrl: aiUrl,
              isValid: aiUrl.startsWith('http'),
              productId,
            });
            
            // Validate URL before setting
            if (aiUrl && aiUrl.startsWith('http')) {
              setAiImageUrl(aiUrl);
              setShowToggle(true);
              // Start with AI image
              setImageSrc(aiUrl);
              setShowAiImage(true);
              console.log('[SmartImage] ✅ State updated - AI image URL set:', aiUrl);
            } else {
              console.error('[SmartImage] ❌ Invalid AI URL format:', aiUrl);
              setImageSrc(src);
              setShowToggle(false);
            }
            return;
          } else {
            console.log('[SmartImage] ❌ AI image not found for:', {
              productId,
              userId,
              imageIndex,
            });
          }
        } else {
          console.log('[SmartImage] User does not have access to AI images:', {
            hasPremium,
            aiEnabled,
            isTrialProduct,
          });
        }
        
        // No AI image or user doesn't have access - use original
        if (isMounted) {
          console.log('[SmartImage] Using original image');
          setImageSrc(src);
          setShowToggle(false);
          setShowAiImage(false);
        }
      } catch (error) {
        console.error('[SmartImage] ❌ Error fetching image URLs:', {
          error: error instanceof Error ? error.message : error,
          productId,
          userId,
        });
        if (isMounted) {
          setImageSrc(src);
          setShowToggle(false);
        }
      }
    };

    fetchBestImage();

    return () => {
      isMounted = false;
    };
  }, [src, userId, productId, hasPremium, aiEnabled, isTrialProduct, imageIndex, shouldCheckAiImage]);

  // Toggle between original and AI image
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showAiImage && aiImageUrl) {
      // Switch to original
      console.log('[SmartImage] 🔄 Toggling to original image');
      setImageSrc(src);
      setShowAiImage(false);
    } else if (aiImageUrl) {
      // Switch to AI image
      console.log('[SmartImage] 🔄 Toggling to AI image');
      setImageSrc(aiImageUrl);
      setShowAiImage(true);
    }
  };

  const handleError = (e: any) => {
    console.error('[SmartImage] ❌ Image onError triggered:', {
      currentSrc: imageSrc?.substring(0, 80) + '...',
      productId,
      error: e,
      isAiImage: imageSrc !== src,
    });
    
    // If user-specific image fails, fall back to original
    if (imageSrc !== src && !hasError) {
      console.error('[SmartImage] Falling back to original image');
      setHasError(true);
      setImageSrc(src);
      setShowAiImage(false);
    } else if (onError) {
      onError();
    }
  };

  // Log current state before rendering
  useEffect(() => {
    console.log('[SmartImage] Current render state:', {
      imageSrc: imageSrc?.substring(0, 80) + '...',
      showToggle,
      showAiImage,
      hasAiImageUrl: !!aiImageUrl,
      productId,
    });
  }, [imageSrc, showToggle, showAiImage, aiImageUrl, productId]);

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    sizes,
    quality,
    priority,
    loading,
    onError: handleError,
    onLoad: () => {
      console.log('[SmartImage] ✅ Image loaded successfully:', {
        src: imageSrc?.substring(0, 80) + '...',
        productId,
      });
    },
  };

  const imageElement = fill ? (
    <Image {...imageProps} fill />
  ) : (
    <Image {...imageProps} width={width} height={height} />
  );

  // Show toggle badge only when both images are available
  if (!showToggle || !aiImageUrl) {
    return imageElement;
  }

  // When using fill, the wrapper needs to be positioned absolutely or maintain the parent's dimensions
  // Since the parent already has relative positioning and aspect ratio, we just need to ensure full coverage
  return (
    <>
      {imageElement}
      
      {/* Toggle Badge - positioned based on badgePosition prop */}
      <button
        onClick={handleToggle}
        className={`absolute top-2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-semibold shadow-lg hover:bg-white transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200 ${
          badgePosition === 'left' ? 'left-2' : 'right-2'
        }`}
        aria-label={showAiImage ? 'Show original image' : 'Show AI image'}
        title={showAiImage ? 'Click to view original' : 'Click to view AI try-on'}
      >
        <Sparkles className={`w-3.5 h-3.5 ${showAiImage ? 'text-purple-600' : 'text-gray-400'}`} />
        <span className={showAiImage ? 'text-purple-700' : 'text-gray-600'}>
          {showAiImage ? 'AI View' : 'Original'}
        </span>
      </button>
    </>
  );
}

