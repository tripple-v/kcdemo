/* Main JS for Keycloak Demo pages */
(function() {
  'use strict';

  // Helper: fetch /userinfo and display it if the target element exists
  async function loadUserInfo() {
    const el = document.getElementById('userinfo');
    if (!el) return; // Only on protected/manager pages
    try {
      const resp = await fetch(`/userinfo?ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' });

      if (!resp.ok) {
        let text = '';
        try { text = await resp.text(); } catch (_) {}
        throw new Error(`HTTP ${resp.status}${text ? ': ' + text : ''}`);
      }
      const data = await resp.json();
      el.textContent = JSON.stringify(data, null, 2);
      el.classList.remove('text-danger');
    } catch (e) {
      el.classList.add('text-danger');
      el.textContent = 'Unable to load /userinfo: ' + (e && e.message ? e.message : e);
    }
  }

  function init() {
    loadUserInfo();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
