// ============================================================
// BOOKING DIALOG — "Reserve This Journey"
// Reads sankalpa from localStorage, generates WhatsApp message
// Submits via a concierge-handoff (WhatsApp + email fallback)
// ============================================================
(function() {
  const tourId   = document.body.getAttribute('data-tour-id') || 'general';
  const tourName = document.querySelector('.hero-title')?.textContent?.trim()
                || document.querySelector('h1')?.textContent?.trim()
                || 'this journey';
  const tourPrice = document.querySelector('.booking-price')?.textContent?.trim() || '';

  // ── Inject dialog HTML ────────────────────────────────────
  // Inject minimal style to control SVG sizes in dialog
  const bookingStyle = document.createElement('style');
  bookingStyle.textContent = '.booking-dialog svg { display:inline-block; flex-shrink:0; } .booking-overlay, .booking-dialog { font-family: system-ui, -apple-system, sans-serif; }';
  document.head.appendChild(bookingStyle);

  const overlay = document.createElement('div');
  overlay.className = 'booking-overlay';
  overlay.id = 'bookingOverlay';

  const dialog = document.createElement('div');
  dialog.className = 'booking-dialog';
  dialog.id = 'bookingDialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Reserve your journey');

  // Read saved sankalpa
  let sankalpaTxt = '';
  try {
    const saved = JSON.parse(localStorage.getItem('sankalpa_' + tourId) || 'null');
    if (saved) sankalpaTxt = saved.label || '';
  } catch(e) {}

  const sankalpaBadge = sankalpaTxt
    ? `<div class="booking-dialog-sankalpa show" id="dialogSankalpaBadge">
        <span class="booking-dialog-sankalpa-icon">ॐ</span>
        <span>Your sankalpa: <em>"${sankalpaTxt}"</em> — will be offered at the morning aarti.</span>
       </div>`
    : `<div class="booking-dialog-sankalpa" id="dialogSankalpaBadge"></div>`;

  dialog.innerHTML = `
    <button class="booking-dialog-close" id="bookingDialogClose" aria-label="Close">✕</button>

    <div id="bookingFormState">
      <div class="booking-dialog-eyebrow">Reserve This Journey</div>
      <h2 class="booking-dialog-title">${tourName}</h2>
      <p class="booking-dialog-subtitle">No payment now. Our concierge will contact you within the hour to confirm dates, group size, and your preferences.</p>

      ${sankalpaBadge}

      <div class="booking-form" id="bookingForm">
        <div class="booking-field">
          <label>Your Name</label>
          <input type="text" id="bf-name" placeholder="Full name" autocomplete="name" required />
        </div>
        <div class="booking-field">
          <label>Phone / WhatsApp</label>
          <input type="tel" id="bf-phone" placeholder="+91 98765 43210" autocomplete="tel" required />
        </div>
        <div class="booking-field">
          <label>Preferred Travel Month</label>
          <select id="bf-month">
            <option value="">Select month</option>
            <option>January 2026</option><option>February 2026</option>
            <option>March 2026</option><option>April 2026</option>
            <option>May 2026</option><option>June 2026</option>
            <option>July 2026</option><option>August 2026</option>
            <option>September 2026</option><option>October 2026</option>
            <option>November 2026</option><option>December 2026</option>
            <option>January 2027</option><option>Flexible</option>
          </select>
        </div>
        <div class="booking-field">
          <label>Travellers</label>
          <select id="bf-pax">
            <option>1 person</option><option>2 people</option>
            <option>3 people</option><option>4 people</option>
            <option>5–8 people</option><option>9–16 people</option>
            <option>16+ (group)</option>
          </select>
        </div>
        <div class="booking-field full">
          <label>Anything we should know</label>
          <textarea id="bf-notes" placeholder="Dietary requirements, mobility considerations, special dates, or any questions…"></textarea>
        </div>
      </div>

      <div class="booking-dialog-divider"></div>

      <button class="booking-dialog-submit" id="bookingSubmit">Send reservation request</button>
      <div class="booking-dialog-actions">
        <a href="https://wa.me/919999999999" class="booking-dialog-whatsapp" id="bookingWA" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/></svg>
          Chat on WhatsApp
        </a>
        <a href="tel:+919999999999" class="booking-dialog-call">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          Call us now
        </a>
      </div>
      <p class="booking-dialog-trust">No payment required to reserve. We will call you to confirm every detail before proceeding.</p>
    </div>

    <div class="booking-dialog-confirm" id="bookingConfirm">
      <div class="booking-dialog-confirm-glyph">ॐ</div>
      <h3 class="booking-dialog-confirm-title">Your reservation is received.</h3>
      <p class="booking-dialog-confirm-body">Our pilgrimage concierge will reach you on WhatsApp within the hour. We look forward to walking this path with you.</p>
      <div class="booking-dialog-confirm-ref" id="bookingRef"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(dialog);

  // ── Open / Close ──────────────────────────────────────────
  function openDialog() {
    overlay.classList.add('open');
    dialog.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('bf-name')?.focus(), 500);
  }
  function closeDialog() {
    overlay.classList.remove('open');
    dialog.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Wire all "Reserve" buttons on the page
  document.querySelectorAll('.booking-btn, [data-open-booking]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openDialog();
    });
  });

  document.getElementById('bookingDialogClose').addEventListener('click', closeDialog);
  overlay.addEventListener('click', closeDialog);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDialog(); });

  // ── Update WhatsApp link dynamically ─────────────────────
  function buildWAMessage() {
    const name  = document.getElementById('bf-name')?.value  || '';
    const phone = document.getElementById('bf-phone')?.value || '';
    const month = document.getElementById('bf-month')?.value || 'Flexible';
    const pax   = document.getElementById('bf-pax')?.value   || '2';
    const notes = document.getElementById('bf-notes')?.value || '';
    const sankalpa = sankalpaTxt ? `\nSankalpa: "${sankalpaTxt}"` : '';

    const msg = `Hello Vedic Trails 🙏\n\nI'd like to reserve: *${tourName}*${tourPrice ? ` (${tourPrice})` : ''}\n\nName: ${name}\nPhone: ${phone}\nTravel: ${month}\nGroup: ${pax}${sankalpa}${notes ? `\nNotes: ${notes}` : ''}\n\nPlease contact me to confirm.`;
    return encodeURIComponent(msg);
  }

  ['bf-name','bf-phone','bf-month','bf-pax','bf-notes'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const wa = document.getElementById('bookingWA');
      if (wa) wa.href = `https://wa.me/919999999999?text=${buildWAMessage()}`;
    });
  });

  // ── Submit ────────────────────────────────────────────────
  document.getElementById('bookingSubmit').addEventListener('click', () => {
    const name  = document.getElementById('bf-name')?.value.trim();
    const phone = document.getElementById('bf-phone')?.value.trim();
    if (!name || !phone) {
      document.getElementById('bf-name').style.borderColor = name ? '' : '#A8312A';
      document.getElementById('bf-phone').style.borderColor = phone ? '' : '#A8312A';
      return;
    }

    // Generate a reference number
    const ref = 'VT-' + Date.now().toString(36).toUpperCase().slice(-6);
    localStorage.setItem('booking_ref_' + tourId, ref);

    // Save to localStorage for the concierge-sankalpa strip
    localStorage.setItem('pending_reservation', JSON.stringify({
      tourId, tourName, ref,
      name, phone,
      month: document.getElementById('bf-month')?.value,
      pax:   document.getElementById('bf-pax')?.value,
      notes: document.getElementById('bf-notes')?.value,
      sankalpa: sankalpaTxt,
      ts: Date.now()
    }));

    // Open WhatsApp with pre-filled message (primary handoff)
    const waUrl = `https://wa.me/919999999999?text=${buildWAMessage()}`;
    window.open(waUrl, '_blank', 'noopener');

    // Show confirmation
    document.getElementById('bookingFormState').style.display = 'none';
    document.getElementById('bookingRef').textContent = 'Reference: ' + ref;
    document.getElementById('bookingConfirm').classList.add('show');
    // Update the booking card status if on page
    const statusEl = document.getElementById('bookingSankalpaStatus');
    if (statusEl) {
      statusEl.classList.add('show');
      const textEl = document.getElementById('bookingSankalpaStatusText');
      if (textEl) textEl.textContent = 'Reservation requested · Ref: ' + ref;
    }
  });
})();
