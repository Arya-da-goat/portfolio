(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const header = $('#siteHeader');
  const nav = $('#primaryNav');
  const menuToggle = $('#menuToggle');
  const toast = $('#toast');
  $('#year').textContent = new Date().getFullYear();

  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // Cinematic music console. Audio starts only after an explicit visitor action.
  (() => {
    const widget = $('#musicWidget');
    const audio = $('#backgroundMusic');
    const playButton = $('#musicPlay');
    const muteButton = $('#musicMute');
    const volume = $('#musicVolume');
    const volumeValue = $('#volumeValue');
    const status = $('#musicStatus');
    const trackLabel = $('#musicTrackLabel');
    const footnote = $('#musicFootnote');
    const collapse = $('#musicCollapse');
    if (!widget || !audio || !playButton || !volume) return;

    const store = {
      get(key, fallback) { try { const value = localStorage.getItem(`arya_${key}`); return value === null ? fallback : value; } catch (_) { return fallback; } },
      set(key, value) { try { localStorage.setItem(`arya_${key}`, String(value)); } catch (_) {} }
    };
    let isPlaying = false;
    let isMuted = store.get('music_muted', 'false') === 'true';
    let targetVolume = Math.max(0, Math.min(1, Number(store.get('music_volume', '.28')) || 0));
    let fadeFrame = 0;
    let missingAudio = false;
    const savedVolume = Math.round(targetVolume * 100);
    volume.value = String(savedVolume);
    volumeValue.textContent = `${savedVolume}%`;
    audio.volume = isMuted ? 0 : targetVolume;
    widget.classList.toggle('is-collapsed', store.get('music_collapsed', 'false') === 'true');
    collapse?.setAttribute('aria-expanded', String(!widget.classList.contains('is-collapsed')));

    function paintMute() {
      const icon = muteButton?.querySelector('i');
      if (icon) icon.className = isMuted || targetVolume === 0 ? 'fa-solid fa-volume-xmark' : targetVolume < .45 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
      muteButton?.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
    }
    function paintPlay() {
      const icon = playButton.querySelector('i');
      if (icon) icon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      playButton.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Enable atmosphere');
      widget.classList.toggle('is-playing', isPlaying);
    }
    function fadeVolume(to, duration = 650) {
      if (fadeFrame) cancelAnimationFrame(fadeFrame);
      const from = audio.volume;
      const started = performance.now();
      const tick = now => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = progress * progress * (3 - 2 * progress);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * eased));
        if (progress < 1) fadeFrame = requestAnimationFrame(tick);
        else fadeFrame = 0;
      };
      fadeFrame = requestAnimationFrame(tick);
    }
    function setStatus(text) { status.textContent = text; }
    function audioFailed() {
      missingAudio = true; isPlaying = false; paintPlay(); setStatus('Audio file not found');
      trackLabel.textContent = 'Add the music file';
      footnote.textContent = 'Place background-music.wav beside index.html, or update the audio source in index.html.';
      playButton.disabled = false;
      notify('Music file unavailable. See README.txt to add or replace the track.');
    }
    audio.addEventListener('error', audioFailed);
    audio.addEventListener('playing', () => { missingAudio = false; isPlaying = true; paintPlay(); setStatus('Now playing · ambient synth'); trackLabel.textContent = 'Deep Space / 01'; footnote.textContent = 'Original ambient synth · looping instrumental'; });
    audio.addEventListener('pause', () => { if (!audio.ended && isPlaying) { isPlaying = false; paintPlay(); setStatus('Paused'); trackLabel.textContent = 'Resume atmosphere'; } });
    audio.addEventListener('ended', () => { isPlaying = false; paintPlay(); });

    playButton.addEventListener('click', async () => {
      if (isPlaying) {
        isPlaying = false; paintPlay(); fadeVolume(0, 280);
        window.setTimeout(() => { audio.pause(); audio.volume = isMuted ? 0 : targetVolume; }, 300);
        setStatus('Atmosphere paused'); trackLabel.textContent = 'Resume atmosphere';
        store.set('music_enabled', 'false'); return;
      }
      if (missingAudio) { notify('Add background-music.wav next to index.html, then refresh.'); return; }
      try {
        audio.volume = 0;
        await audio.play();
        isPlaying = true; paintPlay(); setStatus('Now playing · ambient synth');
        fadeVolume(isMuted ? 0 : targetVolume, 1000);
        store.set('music_enabled', 'true');
      } catch (_) { audioFailed(); }
    });
    muteButton?.addEventListener('click', () => {
      isMuted = !isMuted; store.set('music_muted', isMuted); paintMute();
      if (isPlaying) fadeVolume(isMuted ? 0 : targetVolume, 350);
      else audio.volume = isMuted ? 0 : targetVolume;
      footnote.textContent = isMuted ? 'Audio muted. Your volume preference is saved.' : 'Tap play to enter the atmosphere.';
    });
    volume.addEventListener('input', () => {
      targetVolume = Number(volume.value) / 100; store.set('music_volume', targetVolume);
      volumeValue.textContent = `${volume.value}%`; paintMute();
      if (isPlaying) fadeVolume(isMuted ? 0 : targetVolume, 120);
      else audio.volume = isMuted ? 0 : targetVolume;
    });
    collapse?.addEventListener('click', () => {
      const collapsed = widget.classList.toggle('is-collapsed');
      collapse.setAttribute('aria-expanded', String(!collapsed));
      collapse.setAttribute('aria-label', collapsed ? 'Expand music controls' : 'Collapse music controls');
      store.set('music_collapsed', collapsed);
    });
    paintMute(); paintPlay();
    // Remember the last choice, but never autoplay sound on a fresh page load.
    if (store.get('music_enabled', 'false') === 'true') {
      setStatus('Ready when you are'); trackLabel.textContent = 'Resume atmosphere';
      footnote.textContent = 'Your last session used music. Tap play to resume.';
    }
  })();

  // Header, active section navigation, and mobile menu.
  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const sectionLinks = $$('.nav-link');
  const observedSections = $$('main section[id]');
  const navObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .4] });
  observedSections.forEach(section => navObserver.observe(section));
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 16), { passive: true });

  // Scroll reveal. If IntersectionObserver is unavailable, content remains visible.
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .12 });
    $$('.reveal').forEach(el => revealObserver.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('visible'));

  // Contextual service links select the matching option and focus the details field.
  $$('[data-service]').forEach(link => link.addEventListener('click', () => {
    const select = $('#serviceSelect');
    if (select) select.value = link.dataset.service;
    setTimeout(() => $('#message')?.focus({ preventScroll: true }), 350);
  }));

  // Copy email with a clipboard fallback for non-secure preview contexts.
  const email = 'eliteninja12347@gmail.com';
  async function copyEmail() {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const field = document.createElement('textarea');
        field.value = email; field.setAttribute('readonly', '');
        field.style.position = 'fixed'; field.style.opacity = '0'; document.body.appendChild(field);
        field.select();
        const success = document.execCommand('copy'); field.remove();
        if (!success) throw new Error('Clipboard unavailable');
      }
      notify('Email address copied.');
    } catch (_) { notify('Email: ' + email); }
  }
  $('#copyEmail').addEventListener('click', copyEmail);

  // Contact form prepares a mailto draft; it never claims to send the email itself.
  $('#contactForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#senderName').value.trim();
    const service = $('#serviceSelect').value;
    const message = $('#message').value.trim();
    if (!message) { $('#message').focus(); notify('Add a few details before preparing the email.'); return; }
    const subject = encodeURIComponent(`Portfolio enquiry — ${service}`);
    const body = encodeURIComponent(`${name ? `Name: ${name}\n` : ''}Service: ${service}\n\nProject details:\n${message}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    notify('Your email draft is ready to review.');
  });

  // Desktop pointer aura and restrained magnetic buttons / card tilt.
  const pointerAura = $('#pointerAura');
  if (finePointer && !reducedMotion) {
    let pointerFrame = 0;
    window.addEventListener('pointermove', event => {
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerAura.style.left = `${event.clientX}px`;
        pointerAura.style.top = `${event.clientY}px`;
        pointerFrame = 0;
      });
    }, { passive: true });
    $$('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const rect = element.getBoundingClientRect();
        const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
        element.style.transform = `translate(${dx * 5}px, ${dy * 4}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
    $$('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 3}deg) rotateY(${(x - 0.5) * 3.5}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Stable seeded starfield. No random repositioning during animation, so the backdrop never glitches.
  (() => {
    const canvas = $('#starfield');
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;
    let width = 1, height = 1, dpr = 1, stars = [], raf = 0, lastFrame = 0, elapsed = 0;
    let isVisible = !document.hidden;
    let seed = 48271;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    function resize() {
      width = Math.max(1, window.innerWidth); height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.6);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(width < 700 ? 55 : 115, Math.floor(width * height / (width < 700 ? 14500 : 10500)));
      stars = Array.from({ length: count }, () => ({ x: random() * width, y: random() * height, r: .35 + random() * 1.05, alpha: .16 + random() * .48, phase: random() * Math.PI * 2, speed: .12 + random() * .25 }));
      paint(0, true);
    }
    function paint(time, staticFrame = false) {
      context.clearRect(0, 0, width, height);
      const t = elapsed + (staticFrame ? 0 : time * .00018);
      stars.forEach(star => {
        const twinkle = reducedMotion ? 1 : .78 + .22 * Math.sin(t + star.phase);
        const y = (star.y - (reducedMotion ? 0 : (t * star.speed * 3) % (height + 4)) + height + 4) % (height + 4);
        context.beginPath(); context.arc(star.x, y, star.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(184,207,255,${star.alpha * twinkle})`; context.fill();
      });
    }
    function frame(time) {
      raf = 0;
      if (!isVisible || reducedMotion) { paint(0, true); return; }
      if (time - lastFrame > 32) { lastFrame = time; elapsed += 0.018; paint(time); }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (raf || !isVisible || reducedMotion) return; raf = requestAnimationFrame(frame); }
    document.addEventListener('visibilitychange', () => { isVisible = !document.hidden; if (!isVisible && raf) { cancelAnimationFrame(raf); raf = 0; } else start(); });
    window.addEventListener('resize', resize, { passive: true });
    resize(); start();
  })();

  // Procedural planet: canvas-only sphere with shaded surface, latitude/longitude, particles, drag inertia and marker tips.
  (() => {
    const canvas = $('#planetCanvas');
    const stage = $('#planetWrap');
    const pauseButton = $('#planetPause');
    const resetButton = $('#planetReset');
    const coordinates = $('#coordinates');
    const tooltip = $('#planetTooltip');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !stage || !ctx) return;
    let width = 1, height = 1, dpr = 1, radius = 1;
    let rotation = -.62, tilt = -.18, velocityX = 0, velocityY = 0, dragging = false, paused = false, pointerX = 0, pointerY = 0;
    let lastX = 0, lastY = 0, lastTime = 0, frameId = 0, tooltipTimer = 0;
    const points = [];
    let seed = 19841;
    const random = () => { seed = (seed * 48271) % 2147483647; return (seed - 1) / 2147483646; };
    const pointCount = window.innerWidth < 600 ? 460 : 760;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < pointCount; i++) {
      const y = 1 - (i / (pointCount - 1)) * 2;
      const ring = Math.sqrt(1 - y * y);
      const angle = goldenAngle * i;
      points.push({ x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring, size: .3 + random() * .85, tone: random() });
    }
    function resize() {
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, width < 500 ? 1.35 : 1.7);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) * .315;
      render(0, true);
    }
    function rotatePoint(point) {
      const x = point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
      const z = point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
      const y = point.y * Math.cos(tilt) - z * Math.sin(tilt);
      const depth = point.y * Math.sin(tilt) + z * Math.cos(tilt);
      return { x, y, depth };
    }
    function drawArc(cx, cy, r, axis, value) {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + .025; a += .035) {
        let x, y, z;
        if (axis === 'lat') { const ring = Math.cos(value); x = Math.cos(a) * ring; y = Math.sin(value); z = Math.sin(a) * ring; }
        else { x = Math.sin(a) * Math.sin(value); y = Math.cos(value); z = Math.cos(a) * Math.sin(value); }
        const p = rotatePoint({ x, y, z });
        const px = cx + p.x * r, py = cy + p.y * r;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    function render(time = 0, staticFrame = false) {
      frameId = 0;
      const dt = lastTime ? Math.min(32, time - lastTime) : 16; lastTime = time;
      if (!dragging && !paused && !reducedMotion && !staticFrame) {
        rotation += .00025 * dt + velocityX;
        tilt = Math.max(-.7, Math.min(.7, tilt + velocityY));
        velocityX *= .94; velocityY *= .9;
      }
      ctx.clearRect(0, 0, width, height);
      const cx = width * .5, cy = height * .485, r = radius;
      const halo = ctx.createRadialGradient(cx, cy, r * .5, cx, cy, r * 1.6);
      halo.addColorStop(0, 'rgba(37,106,207,0)'); halo.addColorStop(.62, 'rgba(44,126,226,.11)'); halo.addColorStop(1, 'rgba(44,126,226,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2); ctx.fill();
      // Planet body with a stable multi-stop lighting gradient.
      const body = ctx.createRadialGradient(cx - r * .37, cy - r * .4, r * .04, cx + r * .18, cy + r * .16, r * 1.25);
      body.addColorStop(0, '#428dc5'); body.addColorStop(.2, '#1d5b99'); body.addColorStop(.52, '#103361'); body.addColorStop(.82, '#09152b'); body.addColorStop(1, '#030711');
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      // A few calm oceanic surface bands and grid arcs.
      const band = ctx.createLinearGradient(cx - r, cy - r * .3, cx + r, cy + r * .5);
      band.addColorStop(0, 'rgba(69,188,211,.04)'); band.addColorStop(.5, 'rgba(92,157,255,.12)'); band.addColorStop(1, 'rgba(174,151,255,.025)');
      ctx.fillStyle = band; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.lineWidth = .6;
      for (let lon = .42; lon < Math.PI; lon += Math.PI / 6) { ctx.strokeStyle = 'rgba(113,204,255,.17)'; drawArc(cx, cy, r, 'lon', lon); }
      for (let lat = -1.15; lat <= 1.16; lat += .38) { ctx.strokeStyle = 'rgba(113,204,255,.12)'; drawArc(cx, cy, r, 'lat', lat); }
      // Land-like clusters from a deterministic point field.
      for (const p of points) {
        const q = rotatePoint(p);
        if (q.depth < -.08) continue;
        const px = cx + q.x * r, py = cy + q.y * r;
        const front = Math.max(0, q.depth);
        const alpha = .2 + front * .65;
        ctx.beginPath(); ctx.arc(px, py, p.size * (.6 + front * .65), 0, Math.PI * 2);
        ctx.fillStyle = p.tone > .89 ? `rgba(111,232,240,${alpha})` : p.tone > .58 ? `rgba(104,183,224,${alpha * .72})` : `rgba(113,153,223,${alpha * .48})`;
        ctx.fill();
        if (p.tone > .982 && front > .2) { ctx.beginPath(); ctx.arc(px, py, p.size * 2.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(119,231,245,${alpha * .12})`; ctx.fill(); }
      }
      ctx.restore();
      // Atmospheric rim and orbital strokes.
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(119,231,245,.72)'; ctx.lineWidth = 1.1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.35, r * .32, -.35, .08, Math.PI * .96); ctx.strokeStyle = 'rgba(143,174,255,.34)'; ctx.lineWidth = .9; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.35, r * .32, -.35, Math.PI * 1.08, Math.PI * 1.91); ctx.strokeStyle = 'rgba(119,231,245,.62)'; ctx.lineWidth = 1.2; ctx.stroke();
      const degrees = ((rotation * 180 / Math.PI) % 360 + 360) % 360;
      if (coordinates) coordinates.textContent = `ROT ${String(Math.round(degrees)).padStart(3, '0')}° / TILT ${String(Math.round(tilt * 57.3)).padStart(2, '0')}°`;
      if (!staticFrame && !document.hidden) frameId = requestAnimationFrame(render);
    }
    function startRender() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(render); }
    function stopRender() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; }
    canvas.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true; lastX = event.clientX; lastY = event.clientY; velocityX = velocityY = 0;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (!dragging) return;
      const dx = event.clientX - lastX, dy = event.clientY - lastY;
      rotation += dx * .008; tilt = Math.max(-.8, Math.min(.8, tilt + dy * .004));
      velocityX = dx * .00013; velocityY = dy * .00004;
      lastX = event.clientX; lastY = event.clientY;
    });
    const endDrag = () => { dragging = false; };
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag); canvas.addEventListener('lostpointercapture', endDrag);
    canvas.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { rotation -= .12; event.preventDefault(); }
      if (event.key === 'ArrowRight') { rotation += .12; event.preventDefault(); }
      if (event.key === 'ArrowUp') { tilt = Math.max(-.8, tilt - .08); event.preventDefault(); }
      if (event.key === 'ArrowDown') { tilt = Math.min(.8, tilt + .08); event.preventDefault(); }
    });
    pauseButton.addEventListener('click', () => {
      paused = !paused;
      pauseButton.textContent = paused ? '▶' : 'Ⅱ';
      pauseButton.setAttribute('aria-label', paused ? 'Resume planet rotation' : 'Pause planet rotation');
      notify(paused ? 'Planet rotation paused.' : 'Planet rotation resumed.');
    });
    resetButton.addEventListener('click', () => {
      rotation = -.62; tilt = -.18; velocityX = velocityY = 0; paused = false;
      pauseButton.textContent = 'Ⅱ'; pauseButton.setAttribute('aria-label', 'Pause planet rotation');
      notify('Planet view reset.');
    });
    $$('.planet-marker').forEach(marker => {
      marker.addEventListener('click', () => {
        tooltip.textContent = marker.dataset.marker || 'Explore new ideas.';
        tooltip.classList.add('show'); clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(() => tooltip.classList.remove('show'), 2500);
      });
      marker.addEventListener('focus', () => { tooltip.textContent = marker.dataset.marker || 'Explore new ideas.'; tooltip.classList.add('show'); });
      marker.addEventListener('blur', () => tooltip.classList.remove('show'));
    });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopRender(); else startRender(); });
    resize(); startRender();
  })();

  // Command palette (Ctrl/Cmd + K), with search, keyboard navigation, and working actions.
  (() => {
    const overlay = $('#commandOverlay');
    const input = $('#commandInput');
    const closeButton = $('#commandClose');
    const items = $('#commandItems');
    const openButton = $('#commandOpen');
    let lastFocused = null;
    function openPalette() {
      lastFocused = document.activeElement;
      overlay.hidden = false;
      input.value = '';
      filterItems('');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 20);
    }
    function closePalette() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    function filterItems(query) {
      const q = query.trim().toLowerCase();
      let firstVisible = null;
      $$('button', items).forEach(button => {
        const match = !q || button.textContent.toLowerCase().includes(q);
        button.hidden = !match;
        if (match && !firstVisible) firstVisible = button;
      });
      if (firstVisible) firstVisible.classList.add('suggested');
      $$('button', items).filter(button => button !== firstVisible).forEach(button => button.classList.remove('suggested'));
    }
    function goTo(target) {
      closePalette();
      if (target) document.querySelector(target)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
    openButton.addEventListener('click', openPalette);
    closeButton.addEventListener('click', closePalette);
    overlay.addEventListener('click', event => { if (event.target.matches('[data-close-command]')) closePalette(); });
    input.addEventListener('input', () => filterItems(input.value));
    items.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-copy-email')) { closePalette(); copyEmail(); return; }
      goTo(button.dataset.go);
    });
    input.addEventListener('keydown', event => {
      const visible = $$('button:not([hidden])', items);
      const current = visible.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' && visible.length) { event.preventDefault(); visible[Math.min(current + 1, visible.length - 1)].focus(); }
      if (event.key === 'Enter' && visible.length) { event.preventDefault(); visible[0].click(); }
    });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); overlay.hidden ? openPalette() : closePalette(); }
      if (event.key === 'Escape' && !overlay.hidden) closePalette();
    });
  })();
})();
