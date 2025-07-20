// Common image domains that we trust
const TRUSTED_IMAGE_DOMAINS = [
  'placehold.co',
  'via.placeholder.com',
  'picsum.photos',
  'unsplash.com',
  'images.unsplash.com',
  'pexels.com',
  'images.pexels.com',
  'pixabay.com',
  'cdn.pixabay.com',
  'imgur.com',
  'i.imgur.com',
  'github.com',
  'raw.githubusercontent.com',
  'avatars.githubusercontent.com',
  'cloudflare.com',
  'imagedelivery.net',
  'p.ipic.vip',
  'i.ibb.co',
  'postimg.cc',
];

/**
 * Check if an image URL is from a trusted domain
 */
export function isTrustedImageDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return TRUSTED_IMAGE_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Get the appropriate image source - either direct or via proxy
 */
export function getImageSrc(originalSrc: string, useProxy = false): string {
  if (!originalSrc) return '';
  
  // If it's a local image, return as-is
  if (originalSrc.startsWith('/')) {
    return originalSrc;
  }
  
  // If using proxy or untrusted domain, use proxy
  if (useProxy || !isTrustedImageDomain(originalSrc)) {
    return `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`;
  }
  
  return originalSrc;
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Must be HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Check if it looks like an image URL
    const pathname = urlObj.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    return imageExtensions.some(ext => pathname.endsWith(ext)) ||
           pathname.includes('/image/') ||
           urlObj.searchParams.has('format');
  } catch {
    return false;
  }
}

/**
 * Get a fallback image URL
 */
export function getFallbackImageUrl(width = 400, height = 300, text = 'No Image'): string {
  return `https://placehold.co/${width}x${height}/E5E7EB/6B7280?text=${encodeURIComponent(text)}`;
}