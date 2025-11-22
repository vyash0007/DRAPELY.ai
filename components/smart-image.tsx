'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserSpecificImageUrl } from '@/actions/images';
import { IoShirtOutline } from "react-icons/io5";
import { IoShirtSharp } from "react-icons/io5";

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
  // Check if user should have access to AI images
  const shouldCheckAiImage = userId && (hasPremium || (aiEnabled && isTrialProduct));

  // Always call hooks unconditionally (React rules)
  // Initial state: always start with null for premium/AI users to prevent flash
  // For regular users, we'll set src immediately in useEffect
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [showAiImage, setShowAiImage] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Debug: Log initial props (only for AI-enabled users)
  useEffect(() => {
    if (shouldCheckAiImage) {
      console.log('[SmartImage] Component mounted/updated:', {
        productId,
        userId,
        hasPremium,
        aiEnabled,
        isTrialProduct,
        originalSrc: src?.substring(0, 60) + '...',
      });
    }
  }, [productId, userId, hasPremium, aiEnabled, isTrialProduct, src, shouldCheckAiImage]);

  // Preload images in parallel for instant toggle
  useEffect(() => {
    if (!shouldCheckAiImage || !aiImageUrl || imagesPreloaded) return;

    const preloadImages = async () => {
      const imagePromises = [
        new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = aiImageUrl!;
        }),
        new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        }),
      ];

      try {
        await Promise.all(imagePromises);
        setImagesPreloaded(true);
        console.log('[SmartImage] ✅ Both images preloaded for instant toggle');
      } catch (error) {
        console.warn('[SmartImage] ⚠️ Some images failed to preload:', error);
        // Still mark as preloaded to avoid retrying
        setImagesPreloaded(true);
      }
    };

    preloadImages();
  }, [shouldCheckAiImage, aiImageUrl, src, imagesPreloaded]);

  // Initialize image source and fetch AI image URL on mount
  // This runs immediately to check for AI image before rendering
  useEffect(() => {
    // For regular users, set src immediately and stop loading
    if (!shouldCheckAiImage) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBestImage = async () => {
      console.log('[SmartImage] Starting AI image fetch:', {
        productId,
        userId,
        hasPremium,
        aiEnabled,
        isTrialProduct,
        imageIndex,
        originalSrc: src.substring(0, 50) + '...',
      });

      try {
        // Check if AI image exists
        console.log('[SmartImage] Checking for AI image...');
        const aiUrl = await getUserSpecificImageUrl(userId!, productId, imageIndex);
        
        if (isMounted) {
          if (aiUrl && aiUrl.startsWith('http')) {
            console.log('[SmartImage] ✅ AI image found:', {
              aiUrl: aiUrl,
              productId,
              userId,
            });
            
            // Set AI image as initial state (prevents flash of regular image)
            setAiImageUrl(aiUrl);
            setShowToggle(true);
            setImageSrc(aiUrl);
            setShowAiImage(true);
            setIsLoading(false);
            console.log('[SmartImage] ✅ State updated - AI image set as initial');
          } else {
            console.log('[SmartImage] ❌ AI image not found for:', {
              productId,
              userId,
              imageIndex,
            });
            // No AI image found - use original
            setImageSrc(src);
            setShowToggle(false);
            setShowAiImage(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('[SmartImage] ❌ Error fetching AI image:', {
          error: error instanceof Error ? error.message : error,
          productId,
          userId,
        });
        if (isMounted) {
          setImageSrc(src);
          setShowToggle(false);
          setIsLoading(false);
        }
      }
    };

    fetchBestImage();

    return () => {
      isMounted = false;
    };
  }, [src, userId, productId, imageIndex, shouldCheckAiImage]);

  // Log current state before rendering (only for AI-enabled users)
  // This must be called BEFORE any early returns to maintain hook order
  useEffect(() => {
    if (shouldCheckAiImage) {
      console.log('[SmartImage] Current render state:', {
        imageSrc: imageSrc?.substring(0, 80) + '...',
        showToggle,
        showAiImage,
        hasAiImageUrl: !!aiImageUrl,
        productId,
      });
    }
  }, [imageSrc, showToggle, showAiImage, aiImageUrl, productId, shouldCheckAiImage]);

  // For regular users (no premium, no AI access), just render simple image
  if (!shouldCheckAiImage) {
    const imageProps = {
      src,
      alt,
      className,
      sizes,
      quality,
      priority,
      loading,
      onError,
    };

    return fill ? (
      <Image {...imageProps} fill />
    ) : (
      <Image {...imageProps} width={width} height={height} />
    );
  }

  // Show loading skeleton while checking for AI image (prevents flash)
  if (isLoading || !imageSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${fill ? 'absolute inset-0' : ''} ${className || ''}`}
        style={fill ? undefined : { width, height }}
      />
    );
  }

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

  const imageProps = {
    src: imageSrc!,
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
        className={`absolute top-3 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
          badgePosition === 'left' ? 'left-3' : 'right-3'
        }`}
        aria-label={showAiImage ? 'Show original image' : 'Show AI image'}
        title={showAiImage ? 'Click to view original' : 'Click to view AI try-on'}
        >
        <span className="text-purple-700">
          {showAiImage ? <IoShirtSharp className='w-5 h-5'/> : <IoShirtOutline className='w-5 h-5' />}
        </span>
        </button>
    </>
  );
}

