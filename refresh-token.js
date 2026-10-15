// refresh-token.js
const apiBase = 'https://sudedu-server.onrender.com/';

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
  // (a simulation has no refresh token: when its token ends, back to the admin page)
  if (simulationInfo()) { exitSimulation(); return false; }
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

  if (!response.ok && response.status >= 500) {
    const MAX_RETRIES = 3;
    const DELAY_MS = 500;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.warn(`Server error ${response.status}, retry attempt ${attempt}...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * attempt));
      response = await fetch(url, options);
      if (response.ok || response.status < 500) break;
    }
  }

  return response;
}

// Logout function
async function logout() {
  if (simulationInfo()) { exitSimulation(); return; }
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

// ---------------------------------------------------------------- admin simulation ("View as user")
// The admin page opens the site as a user sees it: the admin's browser storage is put aside (all of it - so nothing of
// the user's session stays behind afterwards), the user's data and a 2-hour token (no refresh token) go in, and a
// floating button on every page returns to the admin page, putting the admin's storage back exactly. "view" mode is
// read-only (the server refuses changes), "full" acts as the user.
const SIMULATION_KEY = 'sudeduAdminSimulation';
function simulationInfo() {
  try {
    const s = JSON.parse(localStorage.getItem(SIMULATION_KEY) || 'null');
    return s && s.saved ? s : null;
  } catch (e) { return null; }
}
function startSimulation(data, page) {
  const saved = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== SIMULATION_KEY) saved[key] = localStorage.getItem(key);
  }
  const { simulation, ...userData } = data;
  localStorage.clear();
  localStorage.setItem(SIMULATION_KEY, JSON.stringify({ saved, ...simulation, nickname: userData.nickname, accType: userData.accType }));
  localStorage.setItem('userData', JSON.stringify(userData));
  window.location.href = page || (userData.accType === 'teacher' ? '/LT/uzduotys.html' : '/LT/index.html');
}
function exitSimulation() {
  const s = simulationInfo();
  localStorage.clear();
  if (s) Object.entries(s.saved).forEach(([key, value]) => localStorage.setItem(key, value));
  window.location.href = '/LT/admin.html';
}
// the floating button (every page that loads this file)
(function showSimulationBadge() {
  const s = simulationInfo();
  if (!s) return;
  const draw = () => {
    if (document.getElementById('sim-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'sim-badge';
    const left = Math.max(0, Math.round((s.expiresAt - Date.now()) / 60000));
    badge.innerHTML = `<span>👁 ${s.mode === 'full' ? 'Prisijungta kaip' : 'Peržiūra (tik skaityti)'}: <b></b> · ${left} min.</span><button type="button">Grįžti į administravimą</button>`;
    badge.querySelector('b').textContent = s.nickname || s.username || '';
    badge.querySelector('button').addEventListener('click', exitSimulation);
    badge.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-radius:22px;'
      + `background:${s.mode === 'full' ? '#9b2c1f' : '#1d566e'};color:#fff;font:600 13px/1.2 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:calc(100vw - 24px)`;
    const btn = badge.querySelector('button');
    btn.style.cssText = 'border:0;border-radius:16px;padding:6px 12px;background:#fff;color:#1f2a30;font:600 13px system-ui,sans-serif;cursor:pointer;white-space:nowrap';
    document.body.appendChild(badge);
  };
  if (document.body) draw(); else document.addEventListener('DOMContentLoaded', draw);
  // (the token ends after 2 hours: back to the admin page)
  if (s.expiresAt) setTimeout(exitSimulation, Math.max(0, s.expiresAt - Date.now()));
})();
