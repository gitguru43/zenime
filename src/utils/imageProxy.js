/**
 * Utility function to handle image URLs with or without proxy
 * 
 * This function helps handle image URLs in a way that works both locally and when deployed
 * It provides a fallback mechanism when wsrv.nl is blocked or not working properly
 */

/**
 * Process an image URL to ensure it displays correctly in all environments
 * @param {string} imageUrl - The original image URL from the API
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useProxy - Whether to use wsrv.nl proxy (default: false)
 * @param {boolean} options.forceDirect - Force direct URL even in development (default: false)
 * @param {string} options.fallbackImage - URL to use if the image fails to load
 * @param {string} options.section - Section name for targeted handling (optional)
 * @returns {string} - The processed image URL
 */
export const getImageUrl = (imageUrl, options = {}) => {
  // Default options
  const { 
    useProxy = false, 
    forceDirect = false,
    fallbackImage = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg",
    section = null 
  } = options;
  
  // If no image URL provided, return fallback
  if (!imageUrl) return fallbackImage;
  
  // Check if we're in development environment (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
  
  // Handle problematic sections differently when deployed
  const isProblematicSection = section && [
    'spotlight', 'trending', 'top-airing', 
    'most-popular', 'most-favorite', 'latest-completed',
    'continue-watching', 'topten', 'watch', 'animeinfo'
  ].includes(section.toLowerCase());

  // For problematic sections, always use direct URL without proxy
  if (isProblematicSection || forceDirect) {
    // If the URL already has wsrv.nl, extract the original URL
    if (imageUrl.includes('wsrv.nl')) {
      try {
        const urlParam = new URLSearchParams(imageUrl.split('?')[1]).get('url');
        return urlParam || imageUrl;
      } catch (error) {
        // If parsing fails, return the original URL
        return imageUrl;
      }
    }
    
    // Otherwise return the direct URL
    return imageUrl;
  }
  
  // In development, we can use wsrv.nl proxy as it works fine for non-problematic sections
  if (isDevelopment && useProxy) {
    return `https://wsrv.nl/?url=${imageUrl}`;
  }
  
  // For other sections in production, handle according to whether it's already proxied
  if (!isDevelopment) {
    // If the image URL already contains "wsrv.nl", use it as is
    if (imageUrl.includes('wsrv.nl')) {
      return imageUrl;
    }
    
    // Otherwise use direct URL
    return imageUrl;
  }
  
  // Default fallback to direct URL
  return imageUrl;
};

/**
 * React onError handler for images with multiple fallback strategies
 * @param {Event} e - The error event
 * @param {Object} options - Options for error handling
 * @param {string} options.originalUrl - Original image URL before proxying
 * @param {string} options.fallbackImage - URL to fallback image
 * @param {Function} options.onFallbackUsed - Callback when fallback is used
 */
export const handleImageError = (e, options = {}) => {
  const { 
    originalUrl = null,
    fallbackImage = "https://i.postimg.cc/HnHKvHpz/no-avatar.jpg",
    onFallbackUsed = null
  } = options;
  
  // Get section from data attribute if available
  const section = e.target.dataset?.section;
  const isProblematicSection = section && [
    'spotlight', 'trending', 'top-airing', 
    'most-popular', 'most-favorite', 'latest-completed',
    'continue-watching', 'topten', 'watch', 'animeinfo'
  ].includes(section.toLowerCase());
  
  // If we have the original URL and the current src is using wsrv.nl
  if (originalUrl && (e.target.src.includes('wsrv.nl') || isProblematicSection)) {
    // Try direct URL first
    e.target.src = originalUrl;
    
    // Add event listener for second failure
    e.target.onerror = () => {
      // For production environment, try an alternative proxy approach as fallback
      const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
      if (!isDevelopment && originalUrl) {
        // Try a direct CORS proxy as second fallback for production
        e.target.src = originalUrl;
        
        // If that fails too, use the final fallback image
        e.target.onerror = () => {
          e.target.src = fallbackImage;
          e.target.onerror = null; // Prevent infinite loop
          if (onFallbackUsed && typeof onFallbackUsed === 'function') {
            onFallbackUsed();
          }
        };
      } else {
        // For development or if we've tried everything, use fallback image
        e.target.src = fallbackImage;
        e.target.onerror = null; // Prevent infinite loop
        if (onFallbackUsed && typeof onFallbackUsed === 'function') {
          onFallbackUsed();
        }
      }
    };
  } else {
    // Default fallback
    e.target.src = fallbackImage;
    e.target.onerror = null; // Prevent infinite loop
  }
}; 