/* ============================================================
   Quine LP - scroll choreography
   ------------------------------------------------------------
   1. Smooth (inertial) scroll on the .lp container
      → wheel / keyboard / anchor links are interpolated so the
        page feels weighty and "page-turn" controlled.
   2. Hero stage parallax
      → background drifts slowly, hero copy floats upward and
        fades as you scroll past the first viewport.
   3. Section reveal
      → elements with [data-lp-reveal] fade + lift + de-blur
        when they enter the viewport. Children of [data-lp-stagger]
        are auto-staggered.
   ============================================================ */

(function () {
  const main = document.querySelector('main.lp');
  if (!main) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ---------- Reveal: stagger setup ----------
  // Within each [data-lp-stagger] container, give every reveal child
  // an incremental --lp-reveal-delay so siblings appear in sequence.
  const STAGGER_STEP = 90; // ms between siblings
  document.querySelectorAll('[data-lp-stagger]').forEach((group) => {
    const items = group.querySelectorAll(':scope [data-lp-reveal]');
    items.forEach((el, i) => {
      // Respect explicit override on the element if author already set one.
      if (!el.style.getPropertyValue('--lp-reveal-delay')) {
        el.style.setProperty('--lp-reveal-delay', `${i * STAGGER_STEP}ms`);
      }
    });
  });

  // ---------- Reveal: IntersectionObserver ----------
  const revealEls = document.querySelectorAll('[data-lp-reveal]');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        });
      },
      {
        root: main,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ---------- Parallax (hero stage) ----------
  const stageEl = document.querySelector('.lp-stage');
  const stageBg = document.querySelector('.lp-stage__bg');
  const heroInner = document.querySelector('.lp-hero__inner');

  const applyParallax = (scrollTop) => {
    if (!stageEl) return;
    const stageH = stageEl.offsetHeight || 1;
    const p = Math.min(1, Math.max(0, scrollTop / stageH));

    if (stageBg) {
      // Background drifts a little slower than scroll → depth.
      stageBg.style.transform = `translate3d(0, ${scrollTop * 0.28}px, 0)`;
    }
    if (heroInner) {
      // Hero copy lifts slightly and fades as you leave the stage.
      heroInner.style.transform = `translate3d(0, ${-scrollTop * 0.16}px, 0)`;
      heroInner.style.opacity = String(Math.max(0, 1 - p * 1.35));
    }
  };

  // ---------- Smooth scroll (desktop pointer + non-reduced motion) ----------
  // We hijack wheel / keyboard / anchor-link scrolls and interpolate the
  // scrollTop with a lerp so motion has weight and gentle settling.
  // Touch users keep the OS-native momentum scroll (do not double-decay).
  if (!reduceMotion && !isCoarse) {
    const LERP = 0.1; // lower = heavier
    const SETTLE = 0.4; // px threshold

    let target = main.scrollTop;
    let current = main.scrollTop;
    let rafId = null;
    let isProgrammatic = false;

    const maxScroll = () => Math.max(0, main.scrollHeight - main.clientHeight);
    const clamp = (v) => Math.max(0, Math.min(maxScroll(), v));

    const tick = () => {
      const diff = target - current;
      if (Math.abs(diff) < SETTLE) {
        current = target;
        isProgrammatic = true;
        main.scrollTop = current;
        applyParallax(current);
        rafId = null;
        return;
      }
      current += diff * LERP;
      isProgrammatic = true;
      main.scrollTop = current;
      applyParallax(current);
      rafId = requestAnimationFrame(tick);
    };

    const ensureTick = () => {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };

    // Wheel hijack
    main.addEventListener(
      'wheel',
      (e) => {
        // Let pinch-zoom & horizontal-only scrolls (e.g. inside the rail) pass.
        if (e.ctrlKey) return;
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
        e.preventDefault();
        target = clamp(target + e.deltaY);
        ensureTick();
      },
      { passive: false }
    );

    // Keyboard navigation (Page/Arrow/Space/Home/End)
    window.addEventListener('keydown', (e) => {
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      ) {
        return;
      }
      const vh = main.clientHeight;
      let delta = 0;
      switch (e.key) {
        case 'PageDown':
          delta = vh * 0.9;
          break;
        case 'PageUp':
          delta = -vh * 0.9;
          break;
        case 'ArrowDown':
          delta = 80;
          break;
        case 'ArrowUp':
          delta = -80;
          break;
        case ' ':
          delta = e.shiftKey ? -vh * 0.9 : vh * 0.9;
          break;
        case 'Home':
          e.preventDefault();
          target = 0;
          ensureTick();
          return;
        case 'End':
          e.preventDefault();
          target = maxScroll();
          ensureTick();
          return;
        default:
          return;
      }
      if (delta !== 0) {
        e.preventDefault();
        target = clamp(target + delta);
        ensureTick();
      }
    });

    // Anchor links → smooth scroll into view
    const HEADER_OFFSET = 72;
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const targetEl = document.querySelector(href);
        if (!targetEl) return;
        e.preventDefault();
        const top = Math.max(0, targetEl.offsetTop - HEADER_OFFSET);
        target = clamp(top);
        ensureTick();
      });
    });

    // External scroll (e.g. browser restore, devtools jump) → resync.
    main.addEventListener(
      'scroll',
      () => {
        if (isProgrammatic) {
          isProgrammatic = false;
          return;
        }
        target = main.scrollTop;
        current = main.scrollTop;
        applyParallax(current);
      },
      { passive: true }
    );

    // Initial paint
    applyParallax(current);
  } else {
    // Native scroll path (touch / reduced motion) → just drive parallax.
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        applyParallax(main.scrollTop);
      });
    };
    main.addEventListener('scroll', onScroll, { passive: true });
    if (!reduceMotion) applyParallax(main.scrollTop);
  }
})();
