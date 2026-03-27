// ============================================================
//  RoadMap — shared app.js
//  Handles: localStorage state, navigation helpers, utilities
// ============================================================

const TW = {

  // ---- state helpers ----
  save(key, value) {
    try { localStorage.setItem('tw_' + key, JSON.stringify(value)); } catch(e) {}
  },
  load(key, fallback = null) {
    try {
      const v = localStorage.getItem('tw_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
  },
  clear() {
    Object.keys(localStorage).filter(k => k.startsWith('tw_')).forEach(k => localStorage.removeItem(k));
  },

  // ---- navigation ----
  go(page) { window.location.href = page; },

  // ---- auth guard ----
  requireAuth() {
    const user = TW.load('user');
    if (!user) { window.location.href = 'index.html'; return false; }
    return user;
  },

  // ---- format helpers ----
  fmt: {
    usd(n) { return '$' + Math.round(n).toLocaleString(); },
    pct(n) { return Math.round(n) + '%'; },
    mins(n) { return n < 60 ? n + ' min' : Math.floor(n/60) + 'h ' + (n%60 ? n%60+'m' : ''); },
  },

  // ---- chip / toggle helpers ----
  initChips(container, multi = true) {
    const chips = container.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (!multi) {
          chips.forEach(c => c.classList.remove('active'));
        }
        chip.classList.toggle('active');
      });
    });
  },

  getActiveChips(container) {
    return [...container.querySelectorAll('.chip.active')].map(c => c.dataset.value || c.textContent.trim());
  },

  initPrefTiles(container) {
    container.querySelectorAll('.pref-tile').forEach(tile => {
      tile.addEventListener('click', () => tile.classList.toggle('active'));
    });
  },

  getActivePrefs(container) {
    return [...container.querySelectorAll('.pref-tile.active')].map(t => t.dataset.value || t.querySelector('.label').textContent.trim());
  },

  // ---- toggle switch ----
  initToggles(container) {
    container.querySelectorAll('.toggle-switch').forEach(sw => {
      sw.addEventListener('click', () => sw.classList.toggle('on'));
    });
  },

  getToggles(container) {
    const result = {};
    container.querySelectorAll('.constraint-item').forEach(item => {
      const key = item.dataset.key;
      const on = item.querySelector('.toggle-switch').classList.contains('on');
      if (key) result[key] = on;
    });
    return result;
  },

  // ---- pace selector ----
  initPace(container) {
    container.querySelectorAll('.pace-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pace-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  },

  getActivePace(container) {
    const active = container.querySelector('.pace-btn.active');
    return active ? (active.dataset.value || active.querySelector('.name').textContent.trim()) : 'balanced';
  },

  // ---- plan card selector ----
  initPlanCards(container, cb) {
    container.querySelectorAll('.plan-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (cb) cb(card.dataset.plan);
      });
    });
  },

  // ---- day tabs ----
  initDayTabs(tabsEl, contentFn) {
    tabsEl.querySelectorAll('.day-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (contentFn) contentFn(tab.dataset.day);
      });
    });
  },

  // ---- budget bar animation ----
  animateBudgetBars() {
    setTimeout(() => {
      document.querySelectorAll('.budget-bar-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    }, 100);
  },

  // ---- mock data ----
  mockFlights(from, to) {
    return [
      { airline: 'Air India + ANA', duration: '9h 45m', stops: '1 stop (Singapore)', price: 420, tag: 'best value' },
      { airline: 'Singapore Airlines', duration: '8h 20m', stops: '1 stop', price: 580, tag: '' },
      { airline: 'Japan Airlines', duration: '8h 00m', stops: 'non-stop', price: 710, tag: 'direct' },
    ];
  },

  mockHotels(prefs, plan) {
    const budget = [
      {
        name: 'Khaosan Asakusa Hostel', type: 'Private room',
        price: 45, area: 'Asakusa',
        walking: ['Senso-ji 8 min', 'Ueno 25 min'], transit: ['Metro at door'],
        saving: 'Saves ~$180 vs central hotels. 70% of itinerary is walkable.',
      },
      {
        name: 'Airbnb — Ueno-eki area', type: 'Entire apartment',
        price: 68, area: 'Taito City',
        walking: ['4 attractions within 1km'], transit: ['JR Yamanote 3 min walk'],
        saving: 'Central for history belt. Cook breakfast to save $15/day.',
      },
    ];
    const smart = [
      {
        name: 'Richmond Hotel Premier Asakusa', type: 'Double room',
        price: 110, area: 'Asakusa',
        walking: ['Senso-ji 5 min', 'Nakamise market 3 min'], transit: ['Metro 2 min walk'],
        saving: 'Includes breakfast. Saves ~$20/day on morning food.',
      },
    ];
    const luxury = [
      {
        name: 'The Gate Hotel Asakusa', type: 'Superior room',
        price: 210, area: 'Asakusa',
        walking: ['Senso-ji rooftop view', 'Sky view from room'], transit: ['Private transfer available'],
        saving: 'Skip-the-queue included for major temples.',
      },
    ];
    return plan === 'budget' ? budget : plan === 'luxury' ? luxury : smart;
  },

  mockItinerary(prefs, pace, constraints) {
    const days = [
      {
        day: 1, title: 'temples & old tokyo',
        stats: { activities: 4, walkPct: 72, transportCost: 8 },
        reality: 'Day 1 is gentle. Mostly flat Asakusa. ~2km total walking split into 3 stints. Rest zones at Senso-ji café and Ueno park benches.',
        activities: [
          { time: '9:00', title: 'Senso-ji Temple & Nakamise market', meta: 'Asakusa · free entry · ~90 min · rest zones available', transport: [{ type: 'walk', label: 'walk 8 min from hotel' }, { type: 'free', label: 'FREE' }] },
          { time: '11:00', title: 'Tokyo National Museum', meta: 'Ueno · ¥1,000 (~$7) · ~2 hrs · seating throughout', transport: [{ type: 'metro', label: 'metro 12 min · ¥180' }, { type: 'walk', label: 'or walk 25 min' }] },
          { time: '14:00', title: 'lunch at Ameyoko market', meta: 'Ueno · $8–12 pp · street food · benches nearby', transport: [{ type: 'walk', label: 'walk 5 min from museum' }] },
          { time: '16:30', title: 'Ueno Park & Shinobazu Pond', meta: 'Free · low energy · great for photography', transport: [{ type: 'walk', label: 'walk 3 min' }], reality: { type: 'info', text: 'Actually calm and uncrowded by 4pm. Genuinely worth it — no Instagram exaggeration here.' } },
        ]
      },
      {
        day: 2, title: 'shibuya & harajuku',
        stats: { activities: 5, walkPct: 45, transportCost: 22 },
        reality: null,
        warn: 'Budget warning: Shibuya + Harajuku = danger zone for overspending. Bring cash only, leave your card at the hotel. Easy to blow $50+ unplanned.',
        activities: [
          { time: '10:00', title: 'Meiji Shrine', meta: 'Harajuku · free · tranquil forest walk · ~1.5km inside', transport: [{ type: 'metro', label: 'metro 22 min · ¥200' }] },
          { time: '12:30', title: 'Takeshita Street, Harajuku', meta: 'Free to walk · lots of visual chaos · budget creep risk!', transport: [{ type: 'walk', label: 'walk 12 min from shrine' }], reality: { type: 'warn', text: 'Fun for 30 min. After that it\'s just shops. Set a hard cash limit before entering.' } },
          { time: '15:00', title: 'Shibuya Crossing (free!)', meta: 'Most photographed crossing in world · 15 min max', transport: [{ type: 'metro', label: 'metro 8 min · ¥170' }], reality: { type: 'info', text: 'Impressive for 10 minutes. Skip the Shibuya Sky observation deck (¥2,000) — the ground-level view is just as iconic.' } },
          { time: '16:30', title: 'Yoyogi Park (free)', meta: 'Relax, picnic, people-watch · no cost · great after Shibuya', transport: [{ type: 'walk', label: 'walk 18 min' }, { type: 'metro', label: 'or metro 5 min · ¥170' }] },
          { time: '19:00', title: 'dinner: Omoide Yokocho (Memory Lane)', meta: 'Shinjuku · $12–18 · tiny yakitori stalls · very atmospheric', transport: [{ type: 'metro', label: 'metro 15 min · ¥200' }] },
        ]
      },
      {
        day: 3, title: 'history & market day',
        stats: { activities: 4, walkPct: 60, transportCost: 18 },
        reality: 'Day 3 is your history deep-dive. Two museums, one market. Pace is intentionally slower — matching your "balanced" preference.',
        activities: [
          { time: '9:30', title: 'Edo-Tokyo Museum', meta: 'Ryogoku · ¥600 · ~2 hrs · extensive seating · truly fascinating', transport: [{ type: 'metro', label: 'metro 18 min · ¥190' }] },
          { time: '13:00', title: 'Tsukiji Outer Market', meta: 'Fresh sushi lunch · $12–18 · walk through stalls', transport: [{ type: 'metro', label: 'metro 20 min · ¥210' }] },
          { time: '15:00', title: 'Hamarikyu Gardens', meta: '¥300 · historic garden · calm · tea house inside', transport: [{ type: 'walk', label: 'walk 10 min from Tsukiji' }] },
          { time: '17:30', title: 'Sumida River cruise (optional)', meta: '¥800 · 35 min · good photography · connects back to Asakusa', transport: [{ type: 'walk', label: 'walk 5 min to pier' }], reality: { type: 'info', text: 'This is genuinely beautiful at dusk. Not touristy-overrated. Worth the ¥800.' } },
        ]
      },
    ];
    return days;
  },

  mockBudget(plan, totalBudget) {
    const plans = {
      budget: { flight: 420, hotel: 225, food: 250, activities: 75, transport: 70, misc: 80 },
      smart:  { flight: 580, hotel: 550, food: 350, activities: 100, transport: 90, misc: 130 },
      luxury: { flight: 710, hotel: 1050, food: 500, activities: 200, transport: 300, misc: 200 },
    };
    const p = plans[plan] || plans.smart;
    const total = Object.values(p).reduce((a,b) => a+b, 0);
    const buffer = Math.max(0, totalBudget - total);
    return { ...p, buffer, total, over: total > totalBudget };
  },
};

// ---- expose globally ----
window.TW = TW;
