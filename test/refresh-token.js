// refresh-token.js
const apiBase = 'http://localhost:5000/';

// Helper to get login page path dynamically
function getLoginPage() {
  const lang = (typeof controller !== 'undefined' && controller.language) || 'LT';
  // Use root-relative path to avoid duplicating the language code
  return `/${lang}/prisijungimas.html`;
}

function getIndexPage() {
  const lang = (typeof controller !== 'undefined' && controller.language) || 'LT';
  // Use root-relative path to avoid duplicating the language code
  return `/${lang}/index.html`;
}

// Refresh the access token using the refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const userDataStr = localStorage.getItem('userData');

  if (!refreshToken) {
    console.log('No refresh token, redirect to login');
    window.location.href = getLoginPage();
    return false;
  }

  let userData = null;
  try {
    userData = JSON.parse(userDataStr) || {};
    const { token, ...userDataWithoutToken } = userData;
    userData = userDataWithoutToken;
  } catch (e) {
    console.error('Failed to parse userData:', e);
  }

  try {
    const response = await fetch(apiBase + 'auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, userData })
    });

    if (!response.ok) {
      console.log('❌ Refresh token expired, redirect to login');
      localStorage.removeItem('userData');
      localStorage.removeItem('refreshToken');
      window.location.href = getLoginPage();
      return false;
    }

    const data = await response.json();
    const currentUserData = JSON.parse(localStorage.getItem('userData')) || {};
    const updatedUserData = { ...currentUserData, ...data };
    delete updatedUserData.code;

    localStorage.setItem('userData', JSON.stringify(updatedUserData));

    console.log('✅ Access token refreshed. Changed fields:', Object.keys(data).filter(k => k !== 'code' && k !== 'token'));
    return true;

  } catch (err) {
    console.error('Refresh failed:', err);
    window.location.href = getLoginPage();
    return false;
  }
}

// Wrapper for fetch that automatically handles token refresh
async function apiFetch(url, options = {}) {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  if (!userData.token) {
    window.location.href = getLoginPage();
    return null;
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${userData.token}`
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    try {
      const data = await response.json();

      if (data.needsRefresh || data.code === 'AUTH_EXPIRED' || data.code === 'AUTH_REVOKED') {
        console.log('Token expired/revoked, refreshing...');
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          const newUserData = JSON.parse(localStorage.getItem('userData')) || {};
          options.headers['Authorization'] = `Bearer ${newUserData.token}`;
          response = await fetch(url, options);
        } else {
          window.location.href = getLoginPage();
          return null;
        }
      } else {
        window.location.href = getLoginPage();
        return null;
      }
    } catch {
      window.location.href = getLoginPage();
      return null;
    }
  }

  return response;
}

// Logout function
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

  // Redirect to login page after logout
  window.location.href = getIndexPage();
}
