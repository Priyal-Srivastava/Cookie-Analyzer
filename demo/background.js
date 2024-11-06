// Simple rule-based system for cookie analysis
function analyzeCookie(cookie) {
    let risk = 0;
  
    // Check if the cookie is secure
    if (!cookie.secure) {
      risk += 0.3;
    }
  
    // Check if the cookie is HTTP only
    if (!cookie.httpOnly) {
      risk += 0.2;
    }
  
    // Check if it's a third-party cookie
    if (cookie.domain.startsWith('.')) {
      risk += 0.2;
    }
  
    // Check the cookie's lifespan
    const maxAge = cookie.expirationDate ? (cookie.expirationDate - Date.now() / 1000) : 0;
    if (maxAge > 31536000) { // More than a year
      risk += 0.1;
    }
  
    // Check for suspicious names
    const suspiciousNames = ['track', 'analytic', 'id', 'uid', 'user'];
    if (suspiciousNames.some(name => cookie.name.toLowerCase().includes(name))) {
      risk += 0.2;
    }
  
    return Math.min(risk, 1); // Ensure risk is between 0 and 1
  }
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      analyzeCookies(tab.url);
    }
  });
  
  function analyzeCookies(url) {
    chrome.cookies.getAll({url: url}, (cookies) => {
      cookies.forEach((cookie) => {
        const risk = analyzeCookie(cookie);
        
        if (risk > 0.7) {  // High risk threshold
          notifyUser(cookie, risk);
        }
        
        storeCookieInfo(cookie, risk);
      });
    });
  }
  
  function notifyUser(cookie, risk) {
    chrome.storage.local.get('notifications', (result) => {
      const notifications = result.notifications || [];
      notifications.push({
        cookie: cookie,
        risk: risk,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({notifications: notifications});
    });
  }
  
  function storeCookieInfo(cookie, risk) {
    chrome.storage.local.get('cookieInfo', (result) => {
      const cookieInfo = result.cookieInfo || {};
      cookieInfo[cookie.name] = {
        domain: cookie.domain,
        risk: risk,
        lastSeen: new Date().toISOString()
      };
      chrome.storage.local.set({cookieInfo: cookieInfo});
    });
  }