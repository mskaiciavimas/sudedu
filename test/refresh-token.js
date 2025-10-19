// refresh-token.js
const apiBase = 'http://localhost:5000/';

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const userDataStr = localStorage.getItem('userData');
  
  if (!refreshToken) {
    console.log('No refresh token, redirect to login');
    window.location.href = './prisijungimas.html';
    return false;
  }

  // Parse current userData to send to server
  let userData = null;
  try {
    userData = JSON.parse(userDataStr);
    // Remove token before sending (server doesn't need it)
    const { token, ...userDataWithoutToken } = userData;
    userData = userDataWithoutToken;
  } catch (e) {
    console.error('Failed to parse userData:', e);
  }

  try {
    const response = await fetch(apiBase + 'auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        refreshToken,
        userData // Send current client data
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Get current userData from localStorage
      const currentUserData = JSON.parse(localStorage.getItem('userData'));
      
      // ✅ MERGE: Keep old data, overwrite only changed fields
      const updatedUserData = {
        ...currentUserData,  // Start with existing data
        ...data,             // Overwrite with server response (only changed fields + new token)
      };
      
      // Remove fields that shouldn't be in userData
      delete updatedUserData.code;
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      console.log('✅ Access token refreshed. Changed fields:', Object.keys(data).filter(k => k !== 'code' && k !== 'token'));
      return true;
    } else {
      console.log('❌ Refresh token expired, redirect to login');
      localStorage.removeItem('userData');
      localStorage.removeItem('refreshToken');
      window.location.href = './prisijungimas.html';
      return false;
    }
  } catch (err) {
    console.error('Refresh failed:', err);
    return false;
  }
}

async function apiFetch(url, options = {}) {
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  if (!userData || !userData.token) {
    window.location.href = './prisijungimas.html';
    return null;
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${userData.token}`
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    const data = await response.json();
    
    if (data.needsRefresh || data.code === 'AUTH_EXPIRED' || data.code === 'AUTH_REVOKED') {
      console.log('Token expired/revoked, refreshing...');
      
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        const newUserData = JSON.parse(localStorage.getItem('userData'));
        options.headers['Authorization'] = `Bearer ${newUserData.token}`;
        response = await fetch(url, options);
      } else {
        return null;
      }
    }
  }

  return response;
}

async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (refreshToken) {
    try {
      await fetch(apiBase + 'auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  localStorage.removeItem('userData');
  localStorage.removeItem('refreshToken');
  window.location.reload();
}