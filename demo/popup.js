document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['cookieInfo', 'notifications'], function(result) {
      const cookieInfo = result.cookieInfo || {};
      const notifications = result.notifications || [];
      
      const cookieList = document.getElementById('cookieList');
      
      for (let [name, info] of Object.entries(cookieInfo)) {
        const cookieItem = document.createElement('div');
        cookieItem.className = 'cookie-item';
        
        let riskClass = 'low-risk';
        if (info.risk > 0.7) riskClass = 'high-risk';
        else if (info.risk > 0.4) riskClass = 'medium-risk';
        
        cookieItem.innerHTML = `
          <strong>${name}</strong> (${info.domain})<br>
          Risk: <span class="${riskClass}">${(info.risk * 100).toFixed(2)}%</span><br>
          Last seen: ${new Date(info.lastSeen).toLocaleString()}
        `;
        
        const blockButton = document.createElement('button');
        blockButton.textContent = 'Block';
        blockButton.onclick = function() {
          chrome.cookies.remove({url: `http://${info.domain}`, name: name});
          cookieItem.style.display = 'none';
        };
        
        cookieItem.appendChild(blockButton);
        cookieList.appendChild(cookieItem);
      }
      
      if (notifications.length > 0) {
        const notificationArea = document.createElement('div');
        notificationArea.innerHTML = '<h2>Recent Notifications</h2>';
        notifications.forEach(notification => {
          const notificationItem = document.createElement('div');
          notificationItem.innerHTML = `
            <strong>${notification.cookie.name}</strong> (${notification.cookie.domain})<br>
            High risk detected: ${(notification.risk * 100).toFixed(2)}%<br>
            Detected at: ${new Date(notification.timestamp).toLocaleString()}
          `;
          notificationArea.appendChild(notificationItem);
        });
        cookieList.appendChild(notificationArea);
      }
    });
  });