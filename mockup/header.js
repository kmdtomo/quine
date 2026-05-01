(function () {
  const header = document.querySelector('.header');
  const main = document.querySelector('main');
  if (!header || !main) return;

  const FADE_RANGE = 200;
  let ticking = false;

  const update = () => {
    ticking = false;
    const p = Math.min(Math.max(main.scrollTop / FADE_RANGE, 0), 1);
    header.style.setProperty('--header-p', p.toFixed(3));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  main.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

/* ========== Copy profile link + success toast ========== */
(function () {
  const buttons = document.querySelectorAll('[aria-label="Copy profile link"]');
  if (!buttons.length) return;

  let toast = null;
  let hideTimer = null;

  function ensureToast() {
    if (toast) return toast;
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="toast__text">Profile link copied</span>
    `;
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(message) {
    const el = ensureToast();
    el.querySelector('.toast__text').textContent = message;
    // Force reflow so the transition re-triggers if shown twice in a row
    void el.offsetWidth;
    el.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      el.classList.remove('is-visible');
    }, 1800);
  }

  function profileUrl() {
    // Mockup: point to the profile page. In production, compute from the current user.
    return new URL('user-profile.html', window.location.href).href;
  }

  async function copyLink() {
    const url = profileUrl();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Profile link copied');
    } catch (e) {
      showToast('Failed to copy link');
    }
  }

  buttons.forEach((btn) => btn.addEventListener('click', copyLink));
})();

/* ========== Notify panel (connection requests dropdown) ========== */
(function () {
  const notifyBtn = document.querySelector('.header__notify');
  if (!notifyBtn) return;

  // Mock pending requests — Quine only handles connection approvals here
  const requests = [
    {
      name: 'Maksym Karafizi',
      role: 'Backend Engineer · Mintlify',
      avatar: 'assets/8a4c9bfca03871db6fdf728e677e6b5356ed9fa1.jpg',
    },
    {
      name: 'Rosaline Kumbirai',
      role: 'DevOps Engineer · Cloud Atlas',
      avatar: '../frontend/public/avatar.png',
    },
    {
      name: 'Vitaliy Akterskiy',
      role: 'Frontend Engineer · Techno Chain',
      avatar: '../frontend/public/avatar.png',
    },
  ];

  // Wrap the bell so we have a relative anchor for the panel
  const parent = notifyBtn.parentElement;
  const wrap = document.createElement('div');
  wrap.className = 'header__notify-wrap';
  parent.insertBefore(wrap, notifyBtn);
  wrap.appendChild(notifyBtn);

  // Build panel
  const panel = document.createElement('div');
  panel.className = 'notify-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Connection requests');

  const itemsHtml = requests.length
    ? requests
        .map(
          (r) => `
      <div class="notify-request" data-name="${r.name}">
        <img src="${r.avatar}" alt="" class="notify-request__avatar">
        <div class="notify-request__info">
          <div class="notify-request__name">${r.name}</div>
          <div class="notify-request__role">${r.role}</div>
        </div>
        <div class="notify-request__actions">
          <button type="button" class="btn btn--ghost btn--sm" data-action="ignore">Ignore</button>
          <button type="button" class="btn btn--gradient btn--sm" data-action="accept">Accept</button>
        </div>
      </div>`
        )
        .join('')
    : `<div class="notify-panel__empty">No pending connection requests.</div>`;

  panel.innerHTML = `
    <div class="notify-panel__head">
      <div class="notify-panel__title">Connection requests</div>
      <span class="notify-panel__count"><strong>${requests.length}</strong> pending</span>
    </div>
    <div class="notify-panel__body">${itemsHtml}</div>
  `;

  wrap.appendChild(panel);

  function open() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    notifyBtn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    notifyBtn.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    if (panel.classList.contains('is-open')) close();
    else open();
  }

  notifyBtn.setAttribute('aria-haspopup', 'true');
  notifyBtn.setAttribute('aria-expanded', 'false');
  notifyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  panel.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const item = actionBtn.closest('.notify-request');
    if (!item) return;
    item.style.transition = 'opacity 0.2s ease, transform 0.2s ease, height 0.25s ease';
    item.style.overflow = 'hidden';
    item.style.opacity = '0';
    item.style.transform = 'translateX(8px)';
    setTimeout(() => {
      item.remove();
      const remaining = panel.querySelectorAll('.notify-request').length;
      const countEl = panel.querySelector('.notify-panel__count strong');
      if (countEl) countEl.textContent = String(remaining);
      if (remaining === 0) {
        const body = panel.querySelector('.notify-panel__body');
        if (body) body.innerHTML = `<div class="notify-panel__empty">No pending connection requests.</div>`;
        const dot = document.querySelector('.header__notify-dot');
        if (dot) dot.style.display = 'none';
      }
    }, 220);
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !notifyBtn.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });
})();
