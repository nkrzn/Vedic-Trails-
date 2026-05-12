// ============================================================
// SANKALPA STONE — the intention-setting ritual
// Stores intent per tour in localStorage; reveals booking confirmation
// ============================================================
(function() {
  const tourId = document.body.getAttribute('data-tour-id');
  if (!tourId) return;
  const storageKey = 'sankalpa_' + tourId;

  const intents = document.querySelectorAll('.sankalpa-intent');
  const customField = document.getElementById('sankalpaCustom');
  const confirmBox = document.getElementById('sankalpaConfirm');
  const confirmText = document.getElementById('sankalpaConfirmText');
  const bookingStatus = document.getElementById('bookingSankalpaStatus');
  const bookingStatusText = document.getElementById('bookingSankalpaStatusText');

  function setIntent(intent, label) {
    localStorage.setItem(storageKey, JSON.stringify({ intent, label, ts: Date.now() }));
    showConfirm(label);
    intents.forEach(i => i.classList.toggle('selected', i.getAttribute('data-intent') === intent));
    if (customField && intent !== 'custom') customField.value = '';
  }

  function showConfirm(label) {
    if (confirmBox && confirmText) {
      confirmText.innerHTML = '<strong>Your sankalpa is set</strong>Your intention will be carried to the temple. Our concierge will offer it at the morning aarti on your behalf.';
      confirmBox.classList.add('show');
    }
    if (bookingStatus && bookingStatusText) {
      bookingStatusText.textContent = 'Your sankalpa is set: "' + label + '"';
      bookingStatus.classList.add('show');
    }
  }

  intents.forEach(item => {
    item.addEventListener('click', () => {
      const intent = item.getAttribute('data-intent');
      const label = item.getAttribute('data-label') || item.textContent.trim();
      setIntent(intent, label);
    });
  });

  if (customField) {
    let typingTimeout;
    customField.addEventListener('input', (e) => {
      clearTimeout(typingTimeout);
      const value = e.target.value.trim();
      if (!value) return;
      typingTimeout = setTimeout(() => {
        intents.forEach(i => i.classList.remove('selected'));
        setIntent('custom', value);
      }, 800);
    });
  }

  // Restore state on load
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved) {
      if (saved.intent === 'custom' && customField) {
        customField.value = saved.label;
      } else {
        const match = document.querySelector(`.sankalpa-intent[data-intent="${saved.intent}"]`);
        if (match) match.classList.add('selected');
      }
      showConfirm(saved.label);
    }
  } catch (e) { /* noop */ }
})();
