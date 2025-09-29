/* Page-specific JS for the Demo Checklist page */
(function() {
  'use strict';

  const KEY = 'kcdemo_demo_checklist_v1';
  let saved = {};

  function loadState() {
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (_) {
      saved = {};
    }
  }

  function applyState() {
    document.querySelectorAll('.checklist .form-check-input').forEach(cb => {
      cb.checked = !!saved[cb.id];
    });
  }

  function bindCheckboxes() {
    document.querySelectorAll('.checklist .form-check-input').forEach(cb => {
      cb.addEventListener('change', () => {
        saved[cb.id] = cb.checked;
        localStorage.setItem(KEY, JSON.stringify(saved));
      });
    });
  }

  function bindResetButton() {
    const btn = document.getElementById('reset-checklist');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Clear saved state and uncheck all checkboxes
      saved = {};
      try { localStorage.removeItem(KEY); } catch (_) {}
      document.querySelectorAll('.checklist .form-check-input').forEach(cb => {
        cb.checked = false;
      });
    });
  }

  function init() {
    loadState();
    applyState();
    bindCheckboxes();
    bindResetButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
