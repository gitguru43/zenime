/**
 * Analytics utility functions for tracking user behavior
 */

/**
 * Tracks a watch page view in Google Analytics
 * @param {Object} data - Data about the watch page
 */
export const trackWatchPage = (data) => {
  if (window.gtag) {
    // Create a descriptive page title
    const pageTitle = `${data.title || 'Unknown Anime'} Episode ${data.episodeNum || 'Unknown'}`;
    
    // Send a single page_view event with all the necessary information
    window.gtag('event', 'page_view', {
      // Standard page view parameters
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: window.location.pathname,
      
      // Custom dimensions for detailed analytics
      anime_title: data.title || 'Unknown',
      episode_number: data.episodeNum || 'Unknown',
      anime_id: data.animeId || '',
      episode_id: data.episodeId || ''
    });
  }
};

/**
 * Checks if the current page is a watch page
 * @returns {boolean} True if current page is a watch page
 */
export const isWatchPage = () => {
  return window.location.pathname.startsWith('/watch/');
}; 