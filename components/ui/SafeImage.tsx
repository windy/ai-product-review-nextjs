'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { getImageSrc, isValidImageUrl, getFallbackImageUrl } from '@/lib/utils/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  useProxy?: boolean;
}

export default function SafeImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fallback,
  useProxy = false,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default fallback component
  const defaultFallback = (
    <div 
      className={`flex items-center justify-center bg-gray-100 ${className}`}
      style={{ width, height }}
    >
      <Package className="h-8 w-8 text-gray-400" />
    </div>
  );

  // If error occurred, show fallback
  if (error) {
    return fallback || defaultFallback;
  }

  // Validate and determine image source
  const isValid = src && isValidImageUrl(src);
  const imageSrc = isValid ? getImageSrc(src, useProxy) : getFallbackImageUrl(width, height, alt);
  
  // If original URL is invalid, show error immediately
  if (!isValid && src) {
    return fallback || defaultFallback;
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
        >
          <div className="h-6 w-6 bg-gray-300 rounded"></div>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        unoptimized={useProxy} // Disable optimization for proxied images
      />
    </div>
  );
}