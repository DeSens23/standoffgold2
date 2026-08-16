/**
 * GOLDRUSH - Interactive Engine
 * Standoff 2 Promotional Landing Experience
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. AMBIENT PARTICLES CANVAS
     ========================================== */
  const initParticlesCanvas = () => {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let particles = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const rand = (min, max) => Math.random() * (max - min) + min;

    const createParticles = () => {
      particles = [];
      const count = Math.min(Math.floor(window.innerWidth / 16), 65);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: rand(0, 1),
          y: rand(0, 1),
          r: rand(0.8, 2.5),
          speedY: rand(0.0001, 0.00035),
          speedX: rand(-0.00008, 0.00008),
          opacity: rand(0.15, 0.65),
          color: Math.random() > 0.4 ? '#FFD700' : (Math.random() > 0.5 ? '#FF8C00' : '#FFFFFF'),
          pulse: rand(0, Math.PI * 2)
        });
      }
    };

    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw cyber grid subtle background lines
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.015)';
      ctx.lineWidth = 1;

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;

        if (p.y < 0) { p.y = 1; p.x = rand(0, 1); }
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        const currentOpacity = p.opacity * (0.8 + 0.2 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };

    draw();
  };

  initParticlesCanvas();


  /* ==========================================
     2. FLOATING COINS IN HERO
     ========================================== */
  const initFloatingCoins = () => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const coinSizes = [16, 20, 24, 28, 18];

    const spawnSingleCoin = () => {
      const coin = document.createElement('div');
      const size = coinSizes[Math.floor(Math.random() * coinSizes.length)];
      const duration = 8 + Math.random() * 7;
      const startX = 5 + Math.random() * 90;

      coin.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #FFF080, #FFB800 60%, #B87300);
        box-shadow: 0 0 16px rgba(255, 215, 0, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.6);
        left: ${startX}%;
        bottom: -40px;
        z-index: 0;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease;
        animation: floatCoinAnim ${duration}s linear forwards;
      `;

      hero.appendChild(coin);

      setTimeout(() => {
        if (coin.parentNode) coin.remove();
      }, duration * 1000);
    };

    // Inject CSS keyframe for floating coins
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatCoinAnim {
        0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0; }
        10% { opacity: 0.7; transform: translateY(-10vh) rotate(60deg) scale(1); }
        90% { opacity: 0.6; }
        100% { transform: translateY(-110vh) rotate(540deg) scale(0.9); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < 8; i++) {
      setTimeout(spawnSingleCoin, i * 600);
    }
    setInterval(spawnSingleCoin, 2400);
  };

  initFloatingCoins();


  /* ==========================================
     3. COUNTDOWN TIMER
     ========================================== */
  const initCountdown = () => {
    const STORAGE_KEY = 'goldrush_promo_deadline_v1';
    let deadline = localStorage.getItem(STORAGE_KEY);

    // Initial 5 hours, 48 mins, 20 secs
    if (!deadline || isNaN(parseInt(deadline))) {
      deadline = Date.now() + (5 * 3600 + 48 * 60 + 20) * 1000;
      localStorage.setItem(STORAGE_KEY, deadline);
    } else {
      deadline = parseInt(deadline);
    }

    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    if (!hoursEl || !minutesEl || !secondsEl) return;

    const pad = (num) => String(num).padStart(2, '0');

    let lastSec = -1;

    const updateTimer = () => {
      let diff = Math.max(0, deadline - Date.now());

      if (diff === 0) {
        // Reset back when expired for continuous urgency
        deadline = Date.now() + (4 * 3600 + 32 * 60 + 15) * 1000;
        localStorage.setItem(STORAGE_KEY, deadline);
        diff = deadline - Date.now();
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      hoursEl.textContent = pad(h);
      minutesEl.textContent = pad(m);
      secondsEl.textContent = pad(s);

      if (s !== lastSec) {
        secondsEl.classList.remove('highlight-pulse');
        void secondsEl.offsetWidth; // trigger reflow
        secondsEl.classList.add('highlight-pulse');
        lastSec = s;
      }
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  };

  initCountdown();


  /* ==========================================
     4. DYNAMIC SLOTS DECREMENT (Urgency)
     ========================================== */
  const initSlotsTicker = () => {
    const slotsEl = document.getElementById('slots-count');
    if (!slotsEl) return;

    let spots = 9;
    const interval = setInterval(() => {
      if (spots > 3) {
        if (Math.random() > 0.45) {
          spots--;
          slotsEl.textContent = `${spots} свободных мест`;
          slotsEl.style.color = '#FF2A55';
          setTimeout(() => {
            slotsEl.style.color = '';
          }, 600);
        }
      } else {
        clearInterval(interval);
      }
    }, 28000);
  };

  initSlotsTicker();


  /* ==========================================
     5. STATS NUMBER COUNTER ANIMATION
     ========================================== */
  const initStatsCounter = () => {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = parseInt(entry.target.getAttribute('data-target'), 10);
        const duration = 2000;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuad
          const easeProgress = 1 - (1 - progress) * (1 - progress);
          const currentVal = Math.floor(easeProgress * target);

          entry.target.textContent = currentVal.toLocaleString('ru-RU');

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            entry.target.textContent = target.toLocaleString('ru-RU');
          }
        };

        requestAnimationFrame(updateCount);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
  };

  initStatsCounter();


  /* ==========================================
     6. SCROLL REVEAL OBSERVER
     ========================================== */
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
  };

  initScrollReveal();


  /* ==========================================
     7. MOBILE STICKY BAR VISIBILITY
     ========================================== */
  const initMobileStickyBar = () => {
    const stickyBar = document.getElementById('sticky-bar');
    if (!stickyBar) return;

    let lastKnownScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      lastKnownScroll = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lastKnownScroll > 320) {
            stickyBar.classList.add('show');
          } else {
            stickyBar.classList.remove('show');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  };

  initMobileStickyBar();


  /* ==========================================
     8. SOCIAL PROOF LIVE RECENT ACTIVITY TOASTS
     ========================================== */
  const initLiveActivityToasts = () => {
    const toast = document.getElementById('live-toast');
    const toastUser = document.getElementById('toast-user');
    const toastSeconds = document.getElementById('toast-seconds');

    if (!toast || !toastUser || !toastSeconds) return;

    const recentGamers = [
      'Артем_S2', 'Vortex_Sniper', 'Даниил_Kill', 'Максим_PRO',
      'CyberKing', 'StandoffGamer_77', 'Shadow_Blade', 'Никита_Dragon',
      'Frost_AWP', 'Alex_SO2_Top', 'Кирилл_Rush', 'Phoenix_Fire'
    ];

    const showToast = () => {
      const user = recentGamers[Math.floor(Math.random() * recentGamers.length)];
      const sec = Math.floor(Math.random() * 35) + 5;

      toastUser.textContent = `Игрок ${user}`;
      toastSeconds.textContent = `${sec} секунд`;

      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
      }, 4500);
    };

    // First toast after 3.5 seconds, then every 14 seconds
    setTimeout(showToast, 3500);
    setInterval(showToast, 14000);
  };

  initLiveActivityToasts();

});
