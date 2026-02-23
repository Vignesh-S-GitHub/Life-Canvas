(function () {
  'use strict';

  /*
   * Life Canvas - main app logic
   *
   * Everything lives inside this IIFE so we don't leak globals.
   * No framework, no build step - just plain JS + DOM + Canvas.
   *
   * Fair warning: this file grew organically as features were added,
   * so some sections are denser than others. Refactoring welcome.
   */

  // ---- Quotes shown on each visualize ----
  const QUOTES = [
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
    { text: "The purpose of life is not to be happy. It is to be useful.", author: "Ralph Waldo Emerson" },
    { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
    { text: "Twenty years from now you will be more disappointed by the things you didn't do.", author: "Mark Twain" },
    { text: "Life isn't about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Not how long, but how well you have lived is the main thing.", author: "Seneca" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    { text: "Life is a succession of lessons which must be lived to be understood.", author: "Helen Keller" },
    { text: "The biggest adventure you can take is to live the life of your dreams.", author: "Oprah Winfrey" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  ];

  // ---- Comparison cards (sunrises, heartbeats, etc.) ----
  const COMPARISON_TEMPLATES = [
    { icon: "🌅", labelR: "Sunrises Left", labelL: "Sunrises Witnessed", calcR: (yl, ml, dl) => dl, calcL: (yl, ml, dl) => dl, group: 'nature' },
    { icon: "🌇", labelR: "Sunsets Left", labelL: "Sunsets Watched", calcR: (yl, ml, dl) => dl, calcL: (yl, ml, dl) => dl, group: 'nature' },
    { icon: "🌕", labelR: "Full Moons Left", labelL: "Full Moons Seen", calcR: (yl, ml) => ml, calcL: (yl, ml) => ml, group: 'nature' },
    { icon: "🌸", labelR: "Springs Left", labelL: "Springs Felt", calcR: (yl) => yl, calcL: (yl) => yl, group: 'seasons' },
    { icon: "☀️", labelR: "Summers Left", labelL: "Summers Enjoyed", calcR: (yl) => yl, calcL: (yl) => yl, group: 'seasons' },
    { icon: "🍂", labelR: "Autumns Left", labelL: "Autumns Walked", calcR: (yl) => yl, calcL: (yl) => yl, group: 'seasons' },
    { icon: "❄️", labelR: "Winters Left", labelL: "Winters Felt", calcR: (yl) => yl, calcL: (yl) => yl, group: 'seasons' },
    { icon: "🌧️", labelR: "Rainy Seasons Left", labelL: "Rainy Seasons Heard", calcR: (yl) => yl, calcL: (yl) => yl, group: 'seasons' },
    { icon: "💓", labelR: "Heartbeats Left", labelL: "Heartbeats So Far", calcR: (yl, ml, dl) => dl * 24 * 60 * 72, calcL: (yl, ml, dl) => dl * 24 * 60 * 72, group: 'nature' },
    { icon: "🫁", labelR: "Breaths Left", labelL: "Breaths Taken", calcR: (yl, ml, dl) => dl * 24 * 60 * 16, calcL: (yl, ml, dl) => dl * 24 * 60 * 16, group: 'nature' },
    { icon: "🌑", labelR: "New Moons Left", labelL: "New Moons Passed", calcR: (yl, ml) => ml, calcL: (yl, ml) => ml, group: 'nature' },
    { icon: "🎂", labelR: "Birthdays Left", labelL: "Birthdays Celebrated", calcR: (yl) => yl, calcL: (yl) => yl, group: 'festivals' },
    { icon: "🎆", labelR: "New Years Left", labelL: "New Years Celebrated", calcR: (yl) => yl, calcL: (yl) => yl, group: 'festivals' },
    { icon: "🪔", labelR: "Diwalis Left", labelL: "Diwalis Celebrated", calcR: (yl) => yl, calcL: (yl) => yl, group: 'festivals' },
    { icon: "🎄", labelR: "Christmases Left", labelL: "Christmases Celebrated", calcR: (yl) => yl, calcL: (yl) => yl, group: 'festivals' },
    { icon: "🌙", labelR: "Ramadans Left", labelL: "Ramadans Observed", calcR: (yl) => yl, calcL: (yl) => yl, group: 'festivals' },
  ];

  // Prompts that show before the user hits "Visualize"
  const REFLECTION_PROMPTS = [
    "If you had 100 months left, what would you stop doing?",
    "What's one thing you'd regret not starting today?",
    "When did you last do something for the first time?",
    "What would your 80-year-old self thank you for?",
    "If this were your last summer, how would you spend it?",
    "What are you waiting for permission to do?",
    "Who haven't you told 'I love you' recently?",
    "What story do you want your life to tell?",
    "What's the one thing you keep postponing?",
    "If your weeks were numbered, which ones mattered most?",
    "What would you do if you weren't afraid?",
    "What does a life well-lived look like to you?",
  ];

  // ---- Grab all the DOM nodes we need up-front ----
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {
    themeToggle: $('#themeToggle'), soundToggle: $('#soundToggle'),
    exportBtn: $('#exportBtn'), confettiCanvas: $('#confettiCanvas'),
    profileSelect: $('#profileSelect'), addProfileBtn: $('#addProfileBtn'),
    deleteProfileBtn: $('#deleteProfileBtn'),
    dobDay: $('#dobDay'), dobMonth: $('#dobMonth'), dobYear: $('#dobYear'),
    currentAge: $('#currentAge'), lifeExpectancy: $('#lifeExpectancy'),
    countrySelect: $('#countrySelect'), ageHint: $('#ageHint'),
    visualizeBtn: $('#visualizeBtn'), errorMsg: $('#errorMsg'),
    quoteSection: $('#quoteSection'), quoteText: $('#quoteText'), quoteAuthor: $('#quoteAuthor'),
    countdownSection: $('#countdownSection'), daysToBirthday: $('#daysToBirthday'),
    totalDaysLived: $('#totalDaysLived'), totalDaysLeft: $('#totalDaysLeft'),
    statsSection: $('#statsSection'),
    statLived: $('#statLived'), statRemaining: $('#statRemaining'),
    statTotal: $('#statTotal'), statPercent: $('#statPercent'),
    progressBar: $('#progressBar'), progressLabel: $('#progressLabel'),
    progressYearsLived: $('#progressYearsLived'), progressYearsLeft: $('#progressYearsLeft'),
    comparisonSection: $('#comparisonSection'), comparisonGrid: $('#comparisonGrid'),
    comparisonMicrocopy: $('#comparisonMicrocopy'),
    legendSection: $('#legendSection'), heatmapToggle: $('#heatmapToggle'),
    gridSection: $('#gridSection'), dotGrid: $('#dotGrid'), tooltip: $('#tooltip'),
    milestoneSection: $('#milestoneSection'), milestoneName: $('#milestoneName'),
    milestoneAge: $('#milestoneAge'), milestoneMonth: $('#milestoneMonth'), milestoneIcon: $('#milestoneIcon'),
    addMilestoneBtn: $('#addMilestoneBtn'), milestoneList: $('#milestoneList'),
    goalSection: $('#goalSection'), goalName: $('#goalName'), goalAge: $('#goalAge'),
    goalMonth: $('#goalMonth'),
    addGoalBtn: $('#addGoalBtn'), goalList: $('#goalList'),
    chartsSection: $('#chartsSection'), donutFill: $('#donutFill'),
    donutText: $('#donutText'), donutSubtext: $('#donutSubtext'),
    pieChart: $('#pieChart'), pieLegend: $('#pieLegend'),
    decadesChart: $('#decadesChart'),
    breakdownSection: $('#breakdownSection'),
    timelineSection: $('#timelineSection'), timelineContainer: $('#timelineContainer'),
    exportPanel: $('#exportPanel'), exportImage: $('#exportImage'),
    exportStats: $('#exportStats'), exportPrint: $('#exportPrint'),
    exportShare: $('#exportShare'), closeExportPanel: $('#closeExportPanel'),
    reflectionPrompt: $('#reflectionPrompt'), reflectionText: $('#reflectionText'),
    perspectiveToggle: $('#perspectiveToggle'),
    insightsSection: $('#insightsSection'), insightsGrid: $('#insightsGrid'),
    breakdownInsights: $('#breakdownInsights'),
    exportSnapshot: $('#exportSnapshot'),
    snapshotModal: $('#snapshotModal'), snapshotCanvas: $('#snapshotCanvas'),
    snapshotDownload: $('#snapshotDownload'), snapshotClose: $('#snapshotClose'),
    customCatName: $('#customCatName'), customCatIcon: $('#customCatIcon'),
    customCatHours: $('#customCatHours'), addCustomCatBtn: $('#addCustomCatBtn'),
    breakdownGrid: $('#breakdownGrid'),
  };

  // ======================= STATE =======================
  let state = {
    currentView: 'months',
    perspectiveMode: 'remaining',
    heatmapOn: false,
    soundOn: true,
    currentProfile: 'default',
    profiles: { default: { name: 'Default Profile' } },
    milestones: [],
    goals: [],
    customCategories: [], // { id, name, icon, hours }
    lastCalc: null, // { monthsLived, monthsRemaining, totalMonths, percentComplete, ageYears, lifeExp, dob }
  };

  let audioCtx = null;
  let confettiAnimId = null;

  // ---- Custom Modal (replaces browser prompt) ----
  function showCustomModal(title, description, placeholder) {
    return new Promise((resolve) => {
      const modal = document.getElementById('customModal');
      const overlay = modal.querySelector('.custom-modal-overlay');
      const input = document.getElementById('customModalInput');
      const titleEl = document.getElementById('customModalTitle');
      const descEl = document.getElementById('customModalDesc');
      const okBtn = document.getElementById('customModalOk');
      const cancelBtn = document.getElementById('customModalCancel');

      titleEl.textContent = title || 'Enter Details';
      descEl.textContent = description || '';
      input.placeholder = placeholder || 'Type here...';
      input.value = '';
      modal.classList.remove('hidden');
      setTimeout(() => input.focus(), 100);

      function cleanup() {
        modal.classList.add('hidden');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('click', onCancel);
        input.removeEventListener('keydown', onKey);
      }
      function onOk() { cleanup(); resolve(input.value); }
      function onCancel() { cleanup(); resolve(null); }
      function onKey(e) { if (e.key === 'Enter') onOk(); else if (e.key === 'Escape') onCancel(); }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      overlay.addEventListener('click', onCancel);
      input.addEventListener('keydown', onKey);
    });
  }

  // ======================= INIT =======================
  function init() {
    loadState();
    applyTheme();
    applyProfile();
    bindEvents();
    showReflectionPrompt();

    // only show the share button if the browser supports it
    if (navigator.share && dom.exportShare) dom.exportShare.style.display = '';

    registerSW();
  }

  // ======================= EVENTS =======================
  function bindEvents() {
    dom.visualizeBtn.addEventListener('click', visualize);
    dom.themeToggle.addEventListener('click', toggleTheme);
    dom.soundToggle.addEventListener('click', toggleSound);
    dom.exportBtn.addEventListener('click', showExportPanel);
    dom.closeExportPanel.addEventListener('click', () => dom.exportPanel.classList.add('hidden'));
    dom.exportImage.addEventListener('click', exportAsImage);
    dom.exportStats.addEventListener('click', exportStatsText);
    dom.exportPrint.addEventListener('click', () => {
      window.print();
    });
    dom.exportShare.addEventListener('click', shareData);
    dom.addProfileBtn.addEventListener('click', addProfile);
    dom.deleteProfileBtn.addEventListener('click', deleteProfile);
    dom.profileSelect.addEventListener('change', switchProfile);
    dom.countrySelect.addEventListener('change', onCountryChange);
    dom.addMilestoneBtn.addEventListener('click', addMilestone);
    dom.addGoalBtn.addEventListener('click', addGoal);
    dom.addCustomCatBtn.addEventListener('click', addCustomCategory);
    dom.exportSnapshot.addEventListener('click', generateSnapshot);
    dom.snapshotClose.addEventListener('click', () => dom.snapshotModal.classList.add('hidden'));
    dom.snapshotModal.querySelector('.snapshot-overlay').addEventListener('click', () => dom.snapshotModal.classList.add('hidden'));
    dom.snapshotDownload.addEventListener('click', downloadSnapshot);
    dom.heatmapToggle.addEventListener('change', () => {
      state.heatmapOn = dom.heatmapToggle.checked;
      if (state.lastCalc) renderGrid();
    });

    // Perspective toggle
    $$('.perspective-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.perspective-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.perspectiveMode = btn.dataset.mode;
        if (state.lastCalc) renderComparisons();
        playClick();
      });
    });

    // Life expectancy auto-recalc on change
    dom.lifeExpectancy.addEventListener('input', () => {
      if (state.lastCalc) {
        const age = parseInt(dom.currentAge.value);
        const lifeExp = parseInt(dom.lifeExpectancy.value);
        if (age >= 0 && lifeExp > 0 && age <= lifeExp) {
          visualize();
        }
      }
    });

    // View toggle buttons
    $$('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.view-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentView = btn.dataset.view;
        if (state.lastCalc) renderGrid();
      });
    });

    // DOB auto-advance
    dom.dobDay.addEventListener('input', () => { if (dom.dobDay.value.length >= 2) dom.dobMonth.focus(); autoCalcAge(); });
    dom.dobMonth.addEventListener('input', () => { if (dom.dobMonth.value.length >= 2) dom.dobYear.focus(); autoCalcAge(); });
    dom.dobYear.addEventListener('input', autoCalcAge);

    // Stepper buttons
    bindSteppers();

    // Breakdown category steppers
    $$('.stepper-btn[data-target-cat]').forEach((btn) => {
      let interval;
      const step = () => {
        const cat = btn.dataset.targetCat;
        const input = $(`.breakdown-hours[data-category="${cat}"]`);
        if (!input) return;
        const s = 0.5;
        let v = parseFloat(input.value) || 0;
        v = btn.classList.contains('stepper-plus') ? Math.min(v + s, 24) : Math.max(v - s, 0);
        input.value = v;
        if (state.lastCalc) updateBreakdown();
        playClick();
      };
      btn.addEventListener('mousedown', () => { step(); interval = setInterval(step, 150); });
      btn.addEventListener('mouseup', () => clearInterval(interval));
      btn.addEventListener('mouseleave', () => clearInterval(interval));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); step(); interval = setInterval(step, 150); });
      btn.addEventListener('touchend', () => clearInterval(interval));
    });

    // Breakdown input change
    $$('.breakdown-hours').forEach((input) => {
      input.addEventListener('change', () => { if (state.lastCalc) updateBreakdown(); });
    });

    // Tooltip for dots
    dom.dotGrid.addEventListener('mousemove', handleDotHover);
    dom.dotGrid.addEventListener('mouseleave', () => dom.tooltip.classList.add('hidden'));

    // Click dot to add quick milestone
    dom.dotGrid.addEventListener('click', handleDotClick);

    // escape key closes export panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dom.exportPanel.classList.add('hidden');
        dom.snapshotModal.classList.add('hidden');
      }
    });
  }

  function bindSteppers() {
    $$('.stepper-btn[data-target]').forEach((btn) => {
      let interval;
      const step = () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const s = parseFloat(input.step) || 1;
        let v = parseFloat(input.value) || 0;
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        v = btn.classList.contains('stepper-plus') ? v + s : v - s;
        if (!isNaN(min)) v = Math.max(min, v);
        if (!isNaN(max)) v = Math.min(max, v);
        input.value = v;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        playClick();
      };
      btn.addEventListener('mousedown', () => { step(); interval = setInterval(step, 150); });
      btn.addEventListener('mouseup', () => clearInterval(interval));
      btn.addEventListener('mouseleave', () => clearInterval(interval));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); step(); interval = setInterval(step, 150); });
      btn.addEventListener('touchend', () => clearInterval(interval));
    });
  }

  // ======================= COUNTRY =======================
  function onCountryChange() {
    const val = dom.countrySelect.value;
    if (val) {
      dom.lifeExpectancy.value = val;
      playClick();
    }
  }

  // ======================= DOB / AGE =======================
  function autoCalcAge() {
    const day = parseInt(dom.dobDay.value);
    const month = parseInt(dom.dobMonth.value);
    const year = parseInt(dom.dobYear.value);
    if (!day || !month || !year || year < 1900 || year > new Date().getFullYear()) {
      dom.ageHint.textContent = '';
      return;
    }
    const dob = new Date(year, month - 1, day);
    if (isNaN(dob.getTime()) || dob > new Date()) {
      dom.ageHint.textContent = '';
      return;
    }
    const age = calcAge(dob);
    dom.currentAge.value = age;
    dom.ageHint.textContent = `Auto-calculated: ${age}`;
    dom.dobDay.classList.remove('error');
    dom.dobMonth.classList.remove('error');
    dom.dobYear.classList.remove('error');
  }

  function calcAge(dob) {
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return Math.max(0, age);
  }

  function getDOB() {
    const d = parseInt(dom.dobDay.value);
    const m = parseInt(dom.dobMonth.value);
    const y = parseInt(dom.dobYear.value);
    if (!d || !m || !y) return null;
    if (y < 1900 || y > new Date().getFullYear()) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;
    // Validate actual date (e.g. reject Feb 30)
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    // Check month/day didn't overflow (e.g. Feb 30 becomes Mar 2)
    if (date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    // Must not be in the future
    if (date > new Date()) return null;
    return date;
  }

  function getMonthsLived(dob) {
    const now = new Date();
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (now.getDate() < dob.getDate()) months--;
    return Math.max(0, months);
  }

  function getWeeksLived(dob) {
    const now = new Date();
    const diff = now - dob;
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  }

  // ======================= CORE VISUALIZE =======================
  function visualize() {
    const age = parseInt(dom.currentAge.value);
    const lifeExp = parseInt(dom.lifeExpectancy.value);

    // Validate DOB fields if any are filled
    const dobD = dom.dobDay.value.trim();
    const dobM = dom.dobMonth.value.trim();
    const dobY = dom.dobYear.value.trim();
    if ((dobD || dobM || dobY) && !(dobD && dobM && dobY)) {
      return showError('Please fill in all Date of Birth fields (Day, Month, Year).');
    }
    if (dobD && dobM && dobY) {
      const d = parseInt(dobD), m = parseInt(dobM), y = parseInt(dobY);
      if (m < 1 || m > 12) {
        dom.dobMonth.classList.add('error');
        return showError('Month must be between 1 and 12.');
      }
      if (d < 1 || d > 31) {
        dom.dobDay.classList.add('error');
        return showError('Day must be between 1 and 31.');
      }
      if (y < 1900 || y > new Date().getFullYear()) {
        dom.dobYear.classList.add('error');
        return showError('Year must be between 1900 and ' + new Date().getFullYear() + '.');
      }
      const testDate = new Date(y, m - 1, d);
      if (testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
        dom.dobDay.classList.add('error');
        return showError('Invalid date. Please check day/month combination (e.g. Feb has max 28-29 days).');
      }
      if (testDate > new Date()) {
        dom.dobYear.classList.add('error');
        return showError('Date of birth cannot be in the future.');
      }
      dom.dobDay.classList.remove('error');
      dom.dobMonth.classList.remove('error');
      dom.dobYear.classList.remove('error');
    }

    if (!age && age !== 0) return showError('Please enter your current age or date of birth.');
    if (!lifeExp) return showError('Please enter a life expectancy.');
    if (age < 0 || age > 150) return showError('Age must be between 0 and 150.');
    if (lifeExp < 1 || lifeExp > 150) return showError('Life expectancy must be between 1 and 150.');
    if (age > lifeExp) return showError('Current age cannot exceed life expectancy.');

    hideError();

    const dob = getDOB();
    let monthsLived, weeksLived;
    if (dob) {
      monthsLived = getMonthsLived(dob);
      weeksLived = getWeeksLived(dob);
    } else {
      monthsLived = age * 12;
      weeksLived = age * 52;
    }
    const totalMonths = lifeExp * 12;
    const totalWeeks = lifeExp * 52;
    const monthsRemaining = Math.max(0, totalMonths - monthsLived);
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentComplete = Math.min(100, (monthsLived / totalMonths) * 100);

    state.lastCalc = {
      monthsLived, monthsRemaining, totalMonths,
      weeksLived, weeksRemaining, totalWeeks,
      percentComplete, ageYears: age, lifeExp, dob,
    };

    playDing();
    fireConfetti();

    // Show sections
    showSections();

    // Update everything
    showQuote();
    updateCountdown();
    updateStats();
    generateInsights();
    renderComparisons();
    renderGrid();
    renderMilestoneList();
    renderGoalList();
    updateCharts();
    updateBreakdown();
    renderTimeline();

    dom.exportBtn.style.display = '';
    saveState();

    // Smooth scroll to quote
    dom.quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showSections() {
    const sections = [
      dom.quoteSection, dom.countdownSection, dom.statsSection,
      dom.legendSection, dom.gridSection,
      dom.insightsSection, dom.comparisonSection,
      dom.milestoneSection, dom.goalSection,
      dom.chartsSection, dom.breakdownSection, dom.timelineSection,
    ];
    sections.forEach((s, i) => {
      setTimeout(() => {
        s.classList.remove('hidden');
        s.classList.add('section-reveal');
        // Trigger reveal via IntersectionObserver
        requestAnimationFrame(() => {
          sectionObserver.observe(s);
        });
      }, i * 60);
    });
  }

  // Intersection observer for nice section fade-ins
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  function showError(msg) {
    dom.errorMsg.textContent = msg;
    dom.errorMsg.classList.remove('hidden');
    dom.errorMsg.style.animation = 'shake .5s';
    setTimeout(() => (dom.errorMsg.style.animation = ''), 600);
    playClick();
  }

  function hideError() {
    dom.errorMsg.classList.add('hidden');
  }

  // ======================= QUOTE =======================
  function showQuote() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    dom.quoteText.textContent = q.text;
    dom.quoteAuthor.textContent = '- ' + q.author;
  }

  // ======================= COUNTDOWN =======================
  function updateCountdown() {
    const c = state.lastCalc;
    if (!c) return;

    const now = new Date();
    let daysToBday = '-';
    let daysLived = '-';

    if (c.dob) {
      // Days to next birthday
      let nextBday = new Date(now.getFullYear(), c.dob.getMonth(), c.dob.getDate());
      if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
      daysToBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
      daysLived = Math.floor((now - c.dob) / (1000 * 60 * 60 * 24));
    } else {
      daysLived = c.ageYears * 365;
      daysToBday = '-';
    }

    const totalDays = c.lifeExp * 365;
    const daysLeft = Math.max(0, totalDays - (typeof daysLived === 'number' ? daysLived : c.ageYears * 365));

    animateNumber(dom.daysToBirthday, daysToBday);
    animateNumber(dom.totalDaysLived, daysLived);
    animateNumber(dom.totalDaysLeft, daysLeft);
  }

  // ======================= STATS =======================
  function updateStats() {
    const c = state.lastCalc;
    if (!c) return;

    animateNumber(dom.statLived, c.monthsLived);
    animateNumber(dom.statRemaining, c.monthsRemaining);
    animateNumber(dom.statTotal, c.totalMonths);
    animateNumber(dom.statPercent, c.percentComplete.toFixed(1) + '%');

    const pct = c.percentComplete.toFixed(1);
    dom.progressLabel.textContent = pct + '%';
    dom.progressYearsLived.textContent = c.ageYears + ' years behind you';
    dom.progressYearsLeft.textContent = (c.lifeExp - c.ageYears) + ' years still ahead';
    setTimeout(() => (dom.progressBar.style.width = pct + '%'), 200);
  }

  function animateNumber(el, target) {
    if (typeof target === 'string') {
      el.textContent = target;
      return;
    }
    const duration = 1200;
    const start = parseInt(el.textContent) || 0;
    const diff = target - start;
    if (diff === 0) { el.textContent = target.toLocaleString(); return; }
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + diff * ease).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- Reflection prompt (random, shown pre-visualize) ----
  function showReflectionPrompt() {
    const prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
    dom.reflectionText.textContent = prompt;
  }

  // ---- Auto-generated insight cards ----
  function generateInsights() {
    const c = state.lastCalc;
    if (!c) return;
    dom.insightsGrid.innerHTML = '';

    const yearsLived = c.ageYears;
    const yearsLeft = c.lifeExp - c.ageYears;
    const insights = [];

    // Percentage milestone
    if (c.percentComplete > 50) {
      insights.push({ icon: '⏳', text: `You've crossed the halfway mark. ${c.percentComplete.toFixed(1)}% of your expected life is behind you.` });
    } else {
      insights.push({ icon: '🌱', text: `You're still in your first half. ${(100 - c.percentComplete).toFixed(1)}% of your life is still ahead.` });
    }

    // Reverse perspective - seasons
    if (yearsLeft < yearsLived) {
      insights.push({ icon: '❄️', text: `You have fewer winters left than you've already felt. Make each one count.` });
      insights.push({ icon: '☀️', text: `You've already enjoyed more summers than you have remaining. Soak in the next one.` });
    } else {
      insights.push({ icon: '🌸', text: `You still have more springs ahead than behind. There's so much time to bloom.` });
    }

    // Heartbeat facts
    const heartbeatsLived = yearsLived * 365 * 24 * 60 * 72;
    insights.push({ icon: '💓', text: `Your heart has beaten roughly ${(heartbeatsLived / 1e9).toFixed(1)} billion times so far. It's still going.` });

    // Full moons
    const fullMoonsSeen = c.monthsLived;
    const fullMoonsLeft = c.monthsRemaining;
    if (fullMoonsLeft < fullMoonsSeen) {
      insights.push({ icon: '🌕', text: `You've seen more full moons than you'll see again. About ${fullMoonsLeft} remain.` });
    }

    // Decades insight
    const currentDecade = Math.floor(yearsLived / 10) * 10;
    const decadeDesc = DECADE_DESCRIPTIONS[currentDecade] || '';
    if (decadeDesc) {
      insights.push({ icon: '📅', text: `You're in your "${decadeDesc}" decade. ${10 - (yearsLived % 10)} years until the next chapter.` });
    }

    // Time already spent sleeping
    const sleepYears = (yearsLived * 8 / 24).toFixed(1);
    insights.push({ icon: '😴', text: `You've already spent roughly ${sleepYears} years sleeping. That's time your body needed.` });

    // Birthdays
    insights.push({ icon: '🎂', text: `You've celebrated about ${yearsLived} birthdays. Approximately ${yearsLeft} more to go.` });

    // Only show 5-6 insights to keep it focused
    const selected = insights.slice(0, 6);
    selected.forEach((insight) => {
      const card = document.createElement('div');
      card.className = 'insight-card glass-card';
      card.innerHTML = `<span class="insight-icon">${sanitize(insight.icon)}</span><p class="insight-text">${sanitize(insight.text)}</p>`;
      dom.insightsGrid.appendChild(card);
    });
  }

  // ======================= COMPARISONS =======================
  function renderComparisons() {
    const c = state.lastCalc;
    if (!c) return;
    const yearsLeft = c.lifeExp - c.ageYears;
    const yearsLived = c.ageYears;
    const monthsLeft = c.monthsRemaining;
    const monthsLived = c.monthsLived;
    const daysLeft = yearsLeft * 365;
    const daysLived = yearsLived * 365;

    const mode = state.perspectiveMode;

    dom.comparisonGrid.innerHTML = '';

    if (mode === 'relative') {
      // Relative mode: emotional comparisons
      const relativeInsights = [];
      if (yearsLeft < yearsLived) {
        relativeInsights.push({ icon: '🌅', text: `You have fewer sunrises left (~${daysLeft.toLocaleString()}) than you've already seen (~${daysLived.toLocaleString()}).` });
        relativeInsights.push({ icon: '❄️', text: `You've felt more winters (${yearsLived}) than you'll feel again (${yearsLeft}).` });
        relativeInsights.push({ icon: '🌕', text: `Fewer full moons ahead (${monthsLeft}) than behind (${monthsLived}).` });
      } else {
        relativeInsights.push({ icon: '🌅', text: `More sunrises await you (~${daysLeft.toLocaleString()}) than you've seen (~${daysLived.toLocaleString()}).` });
        relativeInsights.push({ icon: '🌸', text: `You still have more springs (${yearsLeft}) than you've experienced (${yearsLived}).` });
        relativeInsights.push({ icon: '🌕', text: `More full moons ahead (${monthsLeft}) than behind (${monthsLived}).` });
      }
      relativeInsights.push({ icon: '💓', text: `Your heart has ~${(daysLeft * 24 * 60 * 72).toLocaleString()} beats remaining - each one a gift.` });
      relativeInsights.push({ icon: '🎂', text: `${yearsLived} birthdays celebrated. ${yearsLeft} more candles to light.` });

      relativeInsights.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'comparison-card relative-card' + (idx === 0 ? ' hero-card' : '');
        card.innerHTML = `<span class="comparison-icon">${sanitize(item.icon)}</span><p class="relative-text">${sanitize(item.text)}</p>`;
        dom.comparisonGrid.appendChild(card);
      });

      if (dom.comparisonMicrocopy) {
        dom.comparisonMicrocopy.textContent = "Time isn't just numbers - it's the moments between them.";
      }
    } else {
      // Remaining or Lived mode
      const isLived = mode === 'lived';
      const yl = isLived ? yearsLived : yearsLeft;
      const ml = isLived ? monthsLived : monthsLeft;
      const dl = isLived ? daysLived : daysLeft;

      // Group templates: nature first, then seasons, then festivals
      const groups = [
        { key: 'nature', label: '' },
        { key: 'seasons', label: 'Seasons' },
        { key: 'festivals', label: 'Celebrations & Festivals' },
      ];

      let isFirst = true;
      groups.forEach((grp) => {
        const items = COMPARISON_TEMPLATES.filter(t => t.group === grp.key);
        if (!items.length) return;

        if (grp.label) {
          const divider = document.createElement('div');
          divider.className = 'comparison-group-label';
          divider.textContent = grp.label;
          dom.comparisonGrid.appendChild(divider);
        }

        items.forEach((t) => {
          const label = isLived ? t.labelL : t.labelR;
          const calcFn = isLived ? t.calcL : t.calcR;
          const val = calcFn(yl, ml, dl);
          const card = document.createElement('div');
          card.className = 'comparison-card' + (isFirst ? ' hero-card' : '');
          card.innerHTML = `
            <span class="comparison-icon">${sanitize(t.icon)}</span>
            <span class="comparison-value">${typeof val === 'number' ? val.toLocaleString() : sanitize(String(val))}</span>
            <span class="comparison-label">${sanitize(label)}</span>`;
          dom.comparisonGrid.appendChild(card);
          isFirst = false;
        });
      });

      // Reflective microcopy
      const microcopyOptions = isLived ? [
        `${yearsLived} years of sunrises, laughter, and quiet mornings.`,
        `You've already walked through ${yearsLived} autumns. Each one changed you.`,
        `${monthsLived.toLocaleString()} months of memories - more than you can count.`,
        `Every heartbeat so far brought you to this moment.`,
      ] : [
        `You have about ${yearsLeft} winters left. Make them meaningful.`,
        `${yearsLeft} more springs to feel the warmth return.`,
        `Around ${daysLeft.toLocaleString()} sunrises are waiting for you. Rise for them.`,
        `${yearsLeft} more chances to watch the leaves change color.`,
        `That's ${monthsLeft.toLocaleString()} months of possibility, one at a time.`,
      ];
      if (dom.comparisonMicrocopy) {
        dom.comparisonMicrocopy.textContent = microcopyOptions[Math.floor(Math.random() * microcopyOptions.length)];
      }
    }
  }

  // ======================= DOT GRID =======================
  function renderGrid() {
    const c = state.lastCalc;
    if (!c) return;

    dom.dotGrid.innerHTML = '';
    dom.dotGrid.className = 'dot-grid';

    if (state.currentView === 'months') {
      dom.dotGrid.classList.add('view-months');
      renderDotsMonths(c);
    } else if (state.currentView === 'weeks') {
      dom.dotGrid.classList.add('view-weeks');
      renderDotsWeeks(c);
    } else {
      dom.dotGrid.classList.add('view-years');
      renderDotsYears(c);
    }
  }

  function renderDotsMonths(c) {
    const milestoneMonths = getMilestoneMonths();
    const goalMonths = getGoalMonths();
    const frag = document.createDocumentFragment();
    const currentDecadeStart = Math.floor(c.ageYears / 10) * 10;

    for (let i = 0; i < c.totalMonths; i++) {
      const ageAtMonth = Math.floor(i / 12);
      const monthInYear = (i % 12) + 1;

      // Decade separator
      if (i > 0 && i % 120 === 0) {
        const sep = document.createElement('div');
        sep.className = 'decade-separator';
        sep.dataset.decade = (ageAtMonth) + 's';
        frag.appendChild(sep);
      }

      const dot = document.createElement('div');
      dot.className = 'dot animate-in';
      dot.style.animationDelay = Math.min(i * 0.3, 800) + 'ms';
      dot.dataset.monthIndex = i;

      // Highlight current decade
      const dotDecade = Math.floor(ageAtMonth / 10) * 10;
      if (dotDecade === currentDecadeStart) {
        dot.classList.add('current-decade');
      }

      if (milestoneMonths[i]) {
        dot.classList.add('milestone');
        dot.dataset.info = `${milestoneMonths[i]} (Age ${ageAtMonth})`;
      } else if (goalMonths[i]) {
        dot.classList.add('goal-marker');
        dot.dataset.info = `Goal: ${goalMonths[i]} (Age ${ageAtMonth})`;
      } else if (i < c.monthsLived) {
        dot.classList.add('lived');
        dot.dataset.info = `Month ${i + 1} - Age ${ageAtMonth}, Month ${monthInYear} • Lived`;
      } else if (i === c.monthsLived) {
        dot.classList.add('current');
        dot.dataset.info = `Month ${i + 1} - You are here (Age ${ageAtMonth})`;
      } else {
        dot.classList.add('remaining');
        dot.dataset.info = `Month ${i + 1} - Age ${ageAtMonth}, Month ${monthInYear} • Ahead`;
      }

      if (state.heatmapOn && !milestoneMonths[i] && !goalMonths[i]) {
        applyHeatmap(dot, ageAtMonth);
      }

      frag.appendChild(dot);
    }
    dom.dotGrid.appendChild(frag);
  }

  function renderDotsWeeks(c) {
    const milestoneWeeks = getMilestoneWeeks();
    const goalWeeks = getGoalWeeks();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < c.totalWeeks; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot week-dot animate-in';
      dot.style.animationDelay = Math.min(i * 0.08, 600) + 'ms';

      const ageAtWeek = Math.floor(i / 52);
      const weekInYear = (i % 52) + 1;

      if (milestoneWeeks[i]) {
        dot.classList.add('milestone');
        dot.dataset.info = `${milestoneWeeks[i]} (Age ${ageAtWeek})`;
      } else if (goalWeeks[i]) {
        dot.classList.add('goal-marker');
        dot.dataset.info = `Goal: ${goalWeeks[i]} (Age ${ageAtWeek})`;
      } else if (i < c.weeksLived) {
        dot.classList.add('lived');
        dot.dataset.info = `Week ${i + 1} - Age ${ageAtWeek}, Week ${weekInYear} • Lived`;
      } else if (i === c.weeksLived) {
        dot.classList.add('current');
        dot.dataset.info = `Week ${i + 1} - You are here`;
      } else {
        dot.classList.add('remaining');
        dot.dataset.info = `Week ${i + 1} - Age ${ageAtWeek}, Week ${weekInYear} • Ahead`;
      }

      if (state.heatmapOn && !milestoneWeeks[i] && !goalWeeks[i]) {
        applyHeatmap(dot, ageAtWeek);
      }

      frag.appendChild(dot);
    }
    dom.dotGrid.appendChild(frag);
  }

  function renderDotsYears(c) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < c.lifeExp; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot year-dot animate-in';
      dot.style.animationDelay = (i * 15) + 'ms';

      const hasMilestone = state.milestones.some((m) => m.age === i);
      const hasGoal = state.goals.some((g) => g.age === i);

      if (hasMilestone) {
        dot.classList.add('milestone');
        const ms = state.milestones.filter((m) => m.age === i).map((m) => m.icon + ' ' + m.name).join(', ');
        dot.dataset.info = `Age ${i}: ${ms}`;
      } else if (hasGoal) {
        dot.classList.add('goal-marker');
        const gs = state.goals.filter((g) => g.age === i).map((g) => g.name).join(', ');
        dot.dataset.info = `Age ${i}: Goal - ${gs}`;
      } else if (i < c.ageYears) {
        dot.classList.add('lived');
        dot.dataset.info = `Year ${i + 1} - Age ${i} • Lived`;
      } else if (i === c.ageYears) {
        dot.classList.add('current');
        dot.dataset.info = `Year ${i + 1} - You are here (Age ${i})`;
      } else {
        dot.classList.add('remaining');
        dot.dataset.info = `Year ${i + 1} - Age ${i} • Ahead`;
      }

      if (state.heatmapOn && !hasMilestone && !hasGoal) {
        applyHeatmap(dot, i);
      }

      frag.appendChild(dot);
    }
    dom.dotGrid.appendChild(frag);
  }

  function applyHeatmap(dot, age) {
    const decade = Math.min(Math.floor(age / 10), 8);
    const c = state.lastCalc;
    const isLived = c && age <= c.ageYears;
    if (isLived) {
      dot.style.backgroundColor = `var(--heatmap-${decade})`;
    }
  }

  function getMilestoneMonths() {
    const map = {};
    state.milestones.forEach((m) => {
      const mo = (m.month || 1) - 1;
      const idx = m.age * 12 + mo;
      map[idx] = m.icon + ' ' + m.name;
    });
    return map;
  }

  function getMilestoneWeeks() {
    const map = {};
    state.milestones.forEach((m) => {
      const mo = (m.month || 1) - 1;
      const week = m.age * 52 + Math.round(mo * (52 / 12));
      map[week] = m.icon + ' ' + m.name;
    });
    return map;
  }

  function getGoalMonths() {
    const map = {};
    state.goals.forEach((g) => {
      const m = (g.month || 1) - 1;
      const idx = g.age * 12 + m;
      if (map[idx]) map[idx] += ', ' + g.name;
      else map[idx] = g.name;
    });
    return map;
  }

  function getGoalWeeks() {
    const map = {};
    state.goals.forEach((g) => {
      const m = (g.month || 1) - 1;
      const week = g.age * 52 + Math.round(m * (52 / 12));
      if (map[week]) map[week] += ', ' + g.name;
      else map[week] = g.name;
    });
    return map;
  }

  // ======================= TOOLTIP =======================
  function handleDotHover(e) {
    const dot = e.target.closest('.dot');
    if (!dot || !dot.dataset.info) {
      dom.tooltip.classList.add('hidden');
      return;
    }
    dom.tooltip.textContent = dot.dataset.info;
    dom.tooltip.classList.remove('hidden');
    const rect = dot.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - dom.tooltip.offsetWidth / 2;
    let top = rect.top - dom.tooltip.offsetHeight - 8;
    if (top < 4) top = rect.bottom + 8;
    if (left < 4) left = 4;
    if (left + dom.tooltip.offsetWidth > window.innerWidth - 4) left = window.innerWidth - dom.tooltip.offsetWidth - 4;
    dom.tooltip.style.left = left + 'px';
    dom.tooltip.style.top = top + 'px';
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Click a dot to quickly add a milestone ----
  function handleDotClick(e) {
    const dot = e.target.closest('.dot');
    if (!dot || dot.classList.contains('milestone') || dot.classList.contains('goal-marker')) return;
    const c = state.lastCalc;
    if (!c) return;

    let age;
    if (state.currentView === 'years') {
      const dots = [...dom.dotGrid.querySelectorAll('.dot')];
      age = dots.indexOf(dot);
    } else if (state.currentView === 'weeks') {
      const dots = [...dom.dotGrid.querySelectorAll('.dot')];
      age = Math.floor(dots.indexOf(dot) / 52);
    } else {
      const idx = parseInt(dot.dataset.monthIndex);
      age = Math.floor(idx / 12);
    }

    if (isNaN(age) || age < 0 || age > 150) return;
    const isFuture = age > c.ageYears;
    if (isFuture) {
      showCustomModal(
        'Add Goal',
        `Set a goal for age ${age}`,
        'What do you want to achieve?'
      ).then((name) => {
        if (!name || !name.trim()) return;
        if (name.trim().length > 50) return;
        if (state.goals.length >= 50) return showError('Maximum 50 goals reached.');
        hideError();
        const goalMonth = state.currentView === 'months'
          ? ((parseInt(e.target.closest('.dot')?.dataset?.monthIndex) || 0) % 12) + 1
          : 1;
        state.goals.push({ name: sanitize(name.trim()), age, month: goalMonth, id: Date.now() });
        renderGoalList();
        renderGrid();
        renderTimeline();
        saveState();
        playClick();
      });
    } else {
      showCustomModal(
        'Add Milestone',
        `Mark a special moment at age ${age}`,
        'What happened at this age?'
      ).then((name) => {
        if (!name || !name.trim()) return;
        if (name.trim().length > 40) return;
        if (state.milestones.length >= 50) return showError('Maximum 50 milestones reached.');
        hideError();
        const msMonth = state.currentView === 'months'
          ? ((parseInt(e.target.closest('.dot')?.dataset?.monthIndex) || 0) % 12) + 1
          : 1;
        state.milestones.push({ name: sanitize(name.trim()), age, month: msMonth, icon: '⭐', id: Date.now() });
        renderMilestoneList();
        renderGrid();
        renderTimeline();
        saveState();
        playClick();
      });
    }
  }

  // ---- Milestones (CRUD) ----
  function addMilestone() {
    const name = dom.milestoneName.value.trim();
    const age = parseInt(dom.milestoneAge.value);
    const month = parseInt(dom.milestoneMonth.value) || 1;
    const icon = dom.milestoneIcon.value || '⭐';
    if (!name) return showError('Please enter a milestone name.');
    if (name.length > 40) return showError('Milestone name must be 40 characters or less.');
    if (isNaN(age) || age < 0 || age > 150) return showError('Please enter a valid age for the milestone (0–150).');
    if (state.milestones.length >= 50) return showError('Maximum 50 milestones reached. Delete some to add more.');
    hideError();
    state.milestones.push({ name: sanitize(name), age, month, icon: sanitize(icon), id: Date.now() });
    dom.milestoneName.value = '';
    dom.milestoneAge.value = '';
    renderMilestoneList();
    if (state.lastCalc) renderGrid();
    if (state.lastCalc) renderTimeline();
    saveState();
    playClick();
  }

  function deleteMilestone(id) {
    state.milestones = state.milestones.filter((m) => m.id !== id);
    renderMilestoneList();
    if (state.lastCalc) renderGrid();
    if (state.lastCalc) renderTimeline();
    saveState();
  }

  function getBirthYear() {
    const c = state.lastCalc;
    if (c && c.dob) return c.dob.getFullYear();
    if (c) return new Date().getFullYear() - c.ageYears;
    return null;
  }

  function renderMilestoneList() {
    dom.milestoneList.innerHTML = '';
    const sorted = [...state.milestones].sort((a, b) => a.age - b.age || (a.month || 1) - (b.month || 1));
    const birthYear = getBirthYear();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    sorted.forEach((m) => {
      const item = document.createElement('div');
      item.className = 'milestone-item';
      const iconEl = document.createElement('span');
      iconEl.className = 'mi-icon';
      iconEl.textContent = m.icon;
      const textEl = document.createElement('span');
      textEl.className = 'mi-text';
      textEl.textContent = m.name;
      const mon = (m.month || 1) - 1;
      const ageEl = document.createElement('span');
      ageEl.className = 'mi-age';
      const yearStr = birthYear != null ? ' (' + (birthYear + m.age) + ')' : '';
      ageEl.textContent = 'Age ' + m.age + ', ' + monthNames[mon] + yearStr;
      const delBtn = document.createElement('button');
      delBtn.className = 'mi-del';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '&times;';
      delBtn.addEventListener('click', () => deleteMilestone(m.id));
      item.appendChild(iconEl);
      item.appendChild(textEl);
      item.appendChild(ageEl);
      item.appendChild(delBtn);
      dom.milestoneList.appendChild(item);
    });
  }

  // ---- Goals (CRUD) ----
  function addGoal() {
    const name = dom.goalName.value.trim();
    const age = parseInt(dom.goalAge.value);
    if (!name) return showError('Please enter a goal name.');
    if (name.length > 50) return showError('Goal name must be 50 characters or less.');
    if (isNaN(age) || age < 0 || age > 150) return showError('Please enter a valid target age (0–150).');
    if (state.goals.length >= 50) return showError('Maximum 50 goals reached. Delete some to add more.');
    hideError();
    state.goals.push({ name: sanitize(name), age, id: Date.now() });
    dom.goalName.value = '';
    dom.goalAge.value = '';
    renderGoalList();
    if (state.lastCalc) renderGrid();
    if (state.lastCalc) renderTimeline();
    saveState();
    playClick();
  }

  function deleteGoal(id) {
    state.goals = state.goals.filter((g) => g.id !== id);
    renderGoalList();
    if (state.lastCalc) renderGrid();
    if (state.lastCalc) renderTimeline();
    saveState();
  }

  function renderGoalList() {
    dom.goalList.innerHTML = '';
    const sorted = [...state.goals].sort((a, b) => a.age - b.age || (a.month || 1) - (b.month || 1));
    const birthYear = getBirthYear();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    sorted.forEach((g) => {
      const item = document.createElement('div');
      item.className = 'goal-item';
      const achieved = state.lastCalc && g.age <= state.lastCalc.ageYears;
      const iconEl = document.createElement('span');
      iconEl.className = 'gi-icon';
      iconEl.textContent = achieved ? '✅' : '🎯';
      const textEl = document.createElement('span');
      textEl.className = 'gi-text';
      textEl.textContent = g.name;
      const mon = (g.month || 1) - 1;
      const ageEl = document.createElement('span');
      ageEl.className = 'gi-age';
      let yearStr = '';
      if (birthYear != null) {
        const goalYear = birthYear + g.age + (mon >= (state.lastCalc && state.lastCalc.dob ? state.lastCalc.dob.getMonth() : 0) ? 0 : 0);
        yearStr = ' (' + (birthYear + g.age) + ')';
      }
      ageEl.textContent = 'Age ' + g.age + ', ' + monthNames[mon] + yearStr;
      const delBtn = document.createElement('button');
      delBtn.className = 'gi-del';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '&times;';
      delBtn.addEventListener('click', () => deleteGoal(g.id));
      item.appendChild(iconEl);
      item.appendChild(textEl);
      item.appendChild(ageEl);
      item.appendChild(delBtn);
      dom.goalList.appendChild(item);
    });
  }

  // ---- Charts (donut, pie, decades bar) ----
  function updateCharts() {
    const c = state.lastCalc;
    if (!c) return;
    updateDonut(c);
    drawPieChart(c);
    renderDecadesChart(c);
  }

  function updateDonut(c) {
    const circumference = 2 * Math.PI * 85;
    const offset = circumference * (1 - c.percentComplete / 100);
    setTimeout(() => (dom.donutFill.style.strokeDashoffset = offset), 300);
    dom.donutText.textContent = c.percentComplete.toFixed(1) + '%';
  }

  function drawPieChart(c) {
    const canvas = dom.pieChart;
    const ctx = canvas.getContext('2d');
    const size = 280;
    canvas.width = size * 2; canvas.height = size * 2;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, size, size);

    const hours = {};
    $$('.breakdown-hours').forEach((inp) => { hours[inp.dataset.category] = parseFloat(inp.value) || 0; });

    const data = [
      { label: 'Sleep', value: hours.sleep || 0, color: getCSS('--breakdown-sleep') },
      { label: 'Work', value: hours.work || 0, color: getCSS('--breakdown-work') },
      { label: 'Screen', value: hours.screen || 0, color: getCSS('--breakdown-screen') },
      { label: 'Exercise', value: hours.exercise || 0, color: getCSS('--breakdown-exercise') },
      { label: 'Eating', value: hours.eating || 0, color: getCSS('--breakdown-eating') },
      { label: 'Commute', value: hours.commute || 0, color: getCSS('--breakdown-commute') },
    ];
    // Add custom categories
    state.customCategories.forEach((cat, i) => {
      data.push({ label: cat.name, value: hours[cat.id] || 0, color: CUSTOM_CAT_COLORS[i % CUSTOM_CAT_COLORS.length] });
    });
    const allocatedHrs = data.reduce((s, d) => s + d.value, 0);
    const free = Math.max(0, 24 - allocatedHrs);
    data.push({ label: 'Free Time', value: free, color: getCSS('--breakdown-free') || '#67e8f9' });
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;

    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    let startAngle = -Math.PI / 2;
    data.forEach((d) => {
      if (d.value <= 0) return;
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });
    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = getCSS('--bg-glass') || '#fff';
    ctx.fill();

    // Legend
    dom.pieLegend.innerHTML = '';
    data.forEach((d) => {
      if (d.value <= 0) return;
      const item = document.createElement('div');
      item.className = 'pie-legend-item';
      item.innerHTML = `<span class="pie-legend-dot" style="background:${d.color}"></span>${sanitize(d.label)} (${d.value}h)`;
      dom.pieLegend.appendChild(item);
    });
  }

  // decade labels for the bar chart & insights
  const DECADE_DESCRIPTIONS = {
    0: 'Childhood', 10: 'Teenage Years', 20: 'Exploration',
    30: 'Building', 40: 'Responsibility', 50: 'Freedom',
    60: 'Reflection', 70: 'Gratitude', 80: 'Legacy', 90: 'Grace',
  };

  function renderDecadesChart(c) {
    dom.decadesChart.innerHTML = '';
    const decades = Math.ceil(c.lifeExp / 10);
    for (let i = 0; i < decades; i++) {
      const decadeStart = i * 10;
      const decadeEnd = Math.min((i + 1) * 10, c.lifeExp);
      const decadeYears = decadeEnd - decadeStart;
      let livedYears = 0;
      if (c.ageYears >= decadeEnd) livedYears = decadeYears;
      else if (c.ageYears > decadeStart) livedYears = c.ageYears - decadeStart;
      const pct = (livedYears / decadeYears) * 100;
      const isCurrent = c.ageYears >= decadeStart && c.ageYears < decadeEnd;
      const isFuture = c.ageYears < decadeStart;
      const desc = DECADE_DESCRIPTIONS[decadeStart] || '';

      const row = document.createElement('div');
      row.className = 'decade-row';
      row.innerHTML = `
        <span class="decade-label">${decadeStart}–${decadeEnd}</span>
        <span class="decade-desc">${sanitize(desc)}</span>
        <div class="decade-bar-track"><div class="decade-bar-fill ${isFuture ? 'future' : isCurrent ? 'partial' : 'lived'}" style="width:0%"></div></div>
        <span class="decade-value">${pct.toFixed(0)}%</span>`;
      dom.decadesChart.appendChild(row);
      setTimeout(() => {
        row.querySelector('.decade-bar-fill').style.width = pct + '%';
      }, 300 + i * 120);
    }
  }

  // ---- Life breakdown (sleep, work, screen, etc.) ----
  const CUSTOM_CAT_COLORS = ['#f472b6','#a78bfa','#38bdf8','#fb923c','#34d399','#fbbf24','#e879f9','#60a5fa'];

  function addCustomCategory() {
    const name = dom.customCatName.value.trim();
    const icon = dom.customCatIcon.value.trim() || '⏰';
    const hours = parseFloat(dom.customCatHours.value) || 1;
    if (!name) { dom.customCatName.focus(); return; }
    if (name.length > 20) return showError('Category name must be 20 characters or less.');
    if (state.customCategories.length >= 10) return showError('Maximum 10 custom categories.');

    const id = 'custom_' + Date.now();
    state.customCategories.push({ id, name, icon, hours });

    // Create card
    createCustomCategoryCard({ id, name, icon, hours });

    // Reset form
    dom.customCatName.value = '';
    dom.customCatIcon.value = '⏰';
    dom.customCatHours.value = '1';

    if (state.lastCalc) updateBreakdown();
    saveProfileData(state.currentProfile);
    playClick();
  }

  function createCustomCategoryCard(cat) {
    const card = document.createElement('div');
    card.className = 'breakdown-card glass-card custom-category-card';
    card.dataset.category = cat.id;
    card.innerHTML = `
      <div class="breakdown-header">
        <span class="breakdown-icon">${sanitize(cat.icon)}</span>
        <span class="breakdown-name">${sanitize(cat.name)}</span>
        <button type="button" class="custom-cat-remove" aria-label="Remove" title="Remove category">&times;</button>
      </div>
      <div class="breakdown-input-row"><label>Hours/day:</label>
        <div class="stepper-wrap stepper-sm">
          <button type="button" class="stepper-btn stepper-mini stepper-minus" data-target-cat="${cat.id}" aria-label="Decrease"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg></button>
          <input type="number" class="breakdown-hours" data-category="${cat.id}" min="0" max="24" step="0.5" value="${cat.hours}"/>
          <button type="button" class="stepper-btn stepper-mini stepper-plus" data-target-cat="${cat.id}" aria-label="Increase"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg></button>
        </div>
      </div>
      <div class="breakdown-result">
        <span class="breakdown-months" data-result="${cat.id}">0 months</span>
        <div class="breakdown-bar-track"><div class="breakdown-bar-fill" data-bar="${cat.id}"></div></div>
      </div>`;

    dom.breakdownGrid.appendChild(card);

    // Bind steppers for this new card
    card.querySelectorAll('.stepper-btn[data-target-cat]').forEach((btn) => {
      let interval;
      const step = () => {
        const catId = btn.dataset.targetCat;
        const input = card.querySelector(`.breakdown-hours[data-category="${catId}"]`);
        if (!input) return;
        const s = 0.5;
        let v = parseFloat(input.value) || 0;
        v = btn.classList.contains('stepper-plus') ? Math.min(v + s, 24) : Math.max(v - s, 0);
        input.value = v;
        // Update state
        const cc = state.customCategories.find(c => c.id === catId);
        if (cc) cc.hours = v;
        if (state.lastCalc) updateBreakdown();
        saveProfileData(state.currentProfile);
        playClick();
      };
      btn.addEventListener('mousedown', () => { step(); interval = setInterval(step, 150); });
      btn.addEventListener('mouseup', () => clearInterval(interval));
      btn.addEventListener('mouseleave', () => clearInterval(interval));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); step(); interval = setInterval(step, 150); });
      btn.addEventListener('touchend', () => clearInterval(interval));
    });

    // Bind input change
    card.querySelector('.breakdown-hours').addEventListener('change', () => {
      const cc = state.customCategories.find(c => c.id === cat.id);
      if (cc) cc.hours = parseFloat(card.querySelector('.breakdown-hours').value) || 0;
      if (state.lastCalc) updateBreakdown();
      saveProfileData(state.currentProfile);
    });

    // Remove button
    card.querySelector('.custom-cat-remove').addEventListener('click', () => {
      state.customCategories = state.customCategories.filter(c => c.id !== cat.id);
      card.remove();
      if (state.lastCalc) updateBreakdown();
      saveProfileData(state.currentProfile);
      playClick();
    });
  }

  function renderCustomCategories() {
    // Rebuild custom category cards from state (used on load)
    state.customCategories.forEach(cat => createCustomCategoryCard(cat));
  }

  function updateBreakdown() {
    const c = state.lastCalc;
    if (!c) return;
    const totalMonths = c.totalMonths;
    const breakdown = {};
    $$('.breakdown-card').forEach((card) => {
      const cat = card.dataset.category;
      const hrsInput = card.querySelector('.breakdown-hours');
      const hrs = parseFloat(hrsInput.value) || 0;
      const fraction = hrs / 24;
      const months = Math.round(totalMonths * fraction);
      const years = (months / 12).toFixed(1);
      breakdown[cat] = { hours: hrs, months, years: parseFloat(years) };
      card.querySelector(`[data-result="${cat}"]`).textContent = months.toLocaleString() + ' months (~' + years + ' years)';
      const pct = (fraction * 100).toFixed(1);
      setTimeout(() => {
        card.querySelector(`[data-bar="${cat}"]`).style.width = pct + '%';
      }, 200);
    });
    drawPieChart(c);
    renderBreakdownInsights(breakdown);
  }

  function renderBreakdownInsights(breakdown) {
    if (!dom.breakdownInsights) return;
    dom.breakdownInsights.innerHTML = '';
    const insights = [];

    const sleep = breakdown.sleep || { years: 0 };
    const work = breakdown.work || { years: 0 };
    const screen = breakdown.screen || { years: 0 };
    const exercise = breakdown.exercise || { years: 0 };
    const eating = breakdown.eating || { years: 0 };
    const commute = breakdown.commute || { years: 0 };

    // Combined comparison
    const smallCombined = exercise.years + commute.years + eating.years;
    if (sleep.years > smallCombined && smallCombined > 0) {
      insights.push(`💤 You'll spend more time sleeping (~${sleep.years} years) than exercising, commuting, and eating combined (~${smallCombined.toFixed(1)} years).`);
    }

    // Screen vs exercise
    if (screen.years > 0 && exercise.years > 0 && screen.years > exercise.years * 2) {
      insights.push(`📱 Your screen time (~${screen.years} years) is more than ${Math.floor(screen.years / exercise.years)}× your exercise time.`);
    }

    // Work
    if (work.years > 10) {
      insights.push(`💼 About ${work.years} years of your life will go to work. That's ${((work.years / (state.lastCalc.lifeExp)) * 100).toFixed(0)}% of your entire life.`);
    }

    // Free time
    const totalAllocated = Object.values(breakdown).reduce((s, b) => s + b.hours, 0);
    const freeHours = Math.max(0, 24 - totalAllocated);
    const freeYears = ((freeHours / 24) * state.lastCalc.lifeExp).toFixed(1);
    if (freeHours > 0) {
      insights.push(`✨ You have about ${freeHours.toFixed(1)} free hours per day - that's roughly ${freeYears} years of your life to fill with what matters most.`);
    }

    insights.slice(0, 3).forEach((text) => {
      const p = document.createElement('p');
      p.className = 'breakdown-insight-text';
      p.textContent = text;
      dom.breakdownInsights.appendChild(p);
    });
  }

  // ---- Animated timeline (horizontal scroll) ----
  function renderTimeline() {
    const c = state.lastCalc;
    if (!c) return;
    dom.timelineContainer.innerHTML = '';

    const track = document.createElement('div');
    track.className = 'timeline-track';

    // Collect all events by age
    const events = {};
    state.milestones.forEach((m) => {
      if (!events[m.age]) events[m.age] = [];
      events[m.age].push(m.icon + ' ' + m.name);
    });
    state.goals.forEach((g) => {
      if (!events[g.age]) events[g.age] = [];
      events[g.age].push('🎯 ' + g.name);
    });

    // Create nodes at every 5 years
    for (let age = 0; age <= c.lifeExp; age += 5) {
      if (age > 0) {
        const line = document.createElement('div');
        line.className = 'timeline-line' + (age <= c.ageYears ? ' lived' : '');
        track.appendChild(line);
      }

      const node = document.createElement('div');
      node.className = 'timeline-node';

      const dot = document.createElement('div');
      dot.className = 'timeline-dot-tl';
      if (age < c.ageYears) dot.classList.add('lived');
      else if (age === Math.round(c.ageYears / 5) * 5) dot.classList.add('current');
      else dot.classList.add('future');

      // Check for events near this age
      const nearEvents = [];
      for (let a = age - 2; a <= age + 2; a++) {
        if (events[a]) nearEvents.push(...events[a]);
      }
      if (nearEvents.length) dot.classList.add('has-event');

      const label = document.createElement('div');
      label.className = 'timeline-label';
      label.textContent = age === 0 ? 'Birth' : 'Age ' + age;

      node.appendChild(dot);
      node.appendChild(label);

      if (nearEvents.length) {
        const eventEl = document.createElement('div');
        eventEl.className = 'timeline-event';
        eventEl.textContent = nearEvents[0];
        eventEl.title = nearEvents.join('\n');
        node.appendChild(eventEl);
      }

      track.appendChild(node);
    }

    dom.timelineContainer.appendChild(track);
  }

  // ---- Life snapshot (nice shareable card) ----
  function generateSnapshot() {
    const c = state.lastCalc;
    if (!c) return;

    const canvas = dom.snapshotCanvas;
    const scale = 3;
    const w = 480, h = 640;
    canvas.width = w * scale;
    canvas.height = h * scale;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    if (isDark) {
      bgGrad.addColorStop(0, '#0a1a12');
      bgGrad.addColorStop(1, '#1e3a2f');
    } else {
      bgGrad.addColorStop(0, '#ecfdf5');
      bgGrad.addColorStop(1, '#d1fae5');
    }
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, w, h, 24);
    ctx.fill();

    // Border
    ctx.strokeStyle = isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.12)';
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, w - 2, h - 2, 24);
    ctx.stroke();

    // Top accent bar
    const accentGrad = ctx.createLinearGradient(0, 0, w, 0);
    accentGrad.addColorStop(0, '#16a34a');
    accentGrad.addColorStop(1, '#4ade80');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(20, 0, w - 40, 4);

    // Colors
    const textColor = isDark ? '#e8f5ec' : '#14532d';
    const mutedColor = isDark ? 'rgba(232,245,236,0.5)' : 'rgba(22,101,52,0.6)';
    const accentColor = isDark ? '#4ade80' : '#16a34a';

    // --- Header ---
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 12px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LIFE CANVAS', w / 2, 35);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 64px Inter, system-ui';
    ctx.fillText(String(c.ageYears), w / 2, 105);

    ctx.fillStyle = mutedColor;
    ctx.font = '500 15px Inter, system-ui';
    ctx.fillText('years of stories', w / 2, 130);

    // Divider
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(20,83,45,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(w - 80, 150); ctx.stroke();
    ctx.fillStyle = accentColor;
    [w / 2 - 10, w / 2, w / 2 + 10].forEach(px => {
      ctx.beginPath(); ctx.arc(px, 150, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // --- Stats Cards ---
    const stats = [
      { label: 'MONTHS LIVED', value: c.monthsLived.toLocaleString() },
      { label: 'MONTHS AHEAD', value: c.monthsRemaining.toLocaleString() },
      { label: 'JOURNEY', value: c.percentComplete.toFixed(1) + '%' },
      { label: 'EXPECTED', value: c.lifeExp + ' yrs' },
    ];
    const colW = (w - 90) / 2;
    stats.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 40 + col * (colW + 10);
      const cy = 170 + row * 90;

      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(22,163,74,0.05)';
      roundRect(ctx, cx, cy, colW, 75, 14);
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(22,163,74,0.08)';
      ctx.lineWidth = 1;
      roundRect(ctx, cx, cy, colW, 75, 14);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 26px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.value, cx + colW / 2, cy + 38);

      ctx.fillStyle = mutedColor;
      ctx.font = '600 9px Inter, system-ui';
      ctx.fillText(s.label, cx + colW / 2, cy + 58);
    });

    // --- Progress bar ---
    const barY = 375;
    const barX = 50;
    const barW = w - 100;
    const barH = 12;

    ctx.fillStyle = mutedColor;
    ctx.font = '600 10px Inter, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Life Progress', barX, barY - 6);
    ctx.textAlign = 'right';
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 11px Inter, system-ui';
    ctx.fillText(c.percentComplete.toFixed(1) + '%', barX + barW, barY - 6);

    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(22,163,74,0.08)';
    roundRect(ctx, barX, barY, barW, barH, 6);
    ctx.fill();

    const fillW = Math.max(barH, barW * (c.percentComplete / 100));
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
    fillGrad.addColorStop(0, '#16a34a');
    fillGrad.addColorStop(1, '#4ade80');
    ctx.fillStyle = fillGrad;
    roundRect(ctx, barX, barY, fillW, barH, 6);
    ctx.fill();

    ctx.fillStyle = mutedColor;
    ctx.font = '500 10px Inter, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(c.ageYears + ' yrs lived', barX, barY + 26);
    ctx.textAlign = 'right';
    ctx.fillText((c.lifeExp - c.ageYears) + ' yrs ahead', barX + barW, barY + 26);

    // --- Mini dot grid (monthly) ---
    const totalMonths = c.lifeExp * 12;
    const dotR = 1.6;
    const dotGap = 1.2;
    const dotD = dotR * 2 + dotGap;
    const gridCols = Math.floor((w - 60) / dotD);
    const gridStartX = (w - gridCols * dotD) / 2;
    const gridStartY = 430;

    ctx.fillStyle = mutedColor;
    ctx.font = '600 9px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EACH DOT = 1 MONTH', w / 2, gridStartY - 10);

    for (let i = 0; i < totalMonths; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = gridStartX + col * dotD + dotR;
      const y = gridStartY + row * dotD + dotR;

      if (i < c.monthsLived) {
        ctx.fillStyle = isDark ? '#86efac' : '#15803d';
      } else if (i === c.monthsLived) {
        ctx.fillStyle = '#facc15';
      } else {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5';
      }
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Footer ---
    const gridRows = Math.ceil(totalMonths / gridCols);
    const gridEndY = gridStartY + gridRows * dotD + 20;
    const footerY = Math.max(gridEndY, h - 30);
    ctx.fillStyle = isDark ? 'rgba(232,245,236,0.2)' : 'rgba(20,83,45,0.2)';
    ctx.font = '11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Make every month matter.', w / 2, footerY);

    dom.snapshotModal.classList.remove('hidden');
    dom.exportPanel.classList.add('hidden');
    playClick();
  }

  function downloadSnapshot() {
    const link = document.createElement('a');
    link.download = 'life-canvas-snapshot.png';
    link.href = dom.snapshotCanvas.toDataURL('image/png', 1.0);
    link.click();
    playClick();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ======================= CONFETTI =====================
  function fireConfetti() {
    const canvas = dom.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#22c55e', '#4ade80', '#facc15', '#f97316', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444'];
    const count = 150;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    const startTime = performance.now();
    const duration = 3000;

    function animate(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
        confettiAnimId = null;
        return;
      }

      const fadeStart = duration * 0.6;
      const globalAlpha = elapsed > fadeStart ? 1 - (elapsed - fadeStart) / (duration - fadeStart) : 1;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = globalAlpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      confettiAnimId = requestAnimationFrame(animate);
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    confettiAnimId = requestAnimationFrame(animate);
  }

  // ======================= SOUND =========================
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    return audioCtx;
  }

  function playTone(freq, duration, type) {
    if (!state.soundOn) return;
    const ac = getAudioCtx();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch (_) {}
  }

  function playDing() {
    playTone(880, 0.3, 'sine');
    setTimeout(() => playTone(1174.66, 0.2, 'sine'), 100);
    setTimeout(() => playTone(1318.51, 0.4, 'sine'), 200);
  }

  function playClick() {
    playTone(600, 0.06, 'square');
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    document.getElementById('soundIcon').innerHTML = state.soundOn ? '&#128264;' : '&#128263;';
    saveState();
    if (state.soundOn) playClick();
  }

  // ======================= THEME =========================
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    localStorage.setItem('lmv-theme', html.getAttribute('data-theme'));
    playClick();
    // Redraw pie chart if visible
    if (state.lastCalc) setTimeout(() => drawPieChart(state.lastCalc), 100);
  }

  function applyTheme() {
    const saved = localStorage.getItem('lmv-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      // Follow the user's OS-level dark/light preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Listen for OS theme changes in real-time (e.g. sunset auto-switch)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('lmv-theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        if (state.lastCalc) setTimeout(() => drawPieChart(state.lastCalc), 100);
      }
    });
  }

  // ======================= PROFILES ======================
  function addProfile() {
    showCustomModal(
      '👤 New Profile',
      'Create a new profile to track a different life perspective.',
      'Profile name...'
    ).then((name) => {
      if (!name || !name.trim()) return;
      const id = 'profile_' + Date.now();
      state.profiles[id] = { name: name.trim() };
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = name.trim();
      dom.profileSelect.appendChild(opt);
      dom.profileSelect.value = id;
      switchProfile();
      playClick();
    });
  }

  function deleteProfile() {
    const id = dom.profileSelect.value;
    if (id === 'default') return showError("Cannot delete the default profile.");
    hideError();
    if (!confirm('Delete this profile?')) return;
    delete state.profiles[id];
    localStorage.removeItem('lmv-state-' + id);
    dom.profileSelect.querySelector(`option[value="${id}"]`).remove();
    dom.profileSelect.value = 'default';
    switchProfile();
    playClick();
  }

  function switchProfile() {
    // Save current profile state
    saveProfileData(state.currentProfile);
    // Switch
    state.currentProfile = dom.profileSelect.value;
    loadProfileData(state.currentProfile);
    applyProfile();
    saveState();
    playClick();
  }

  function saveProfileData(profileId) {
    var data = {
      dobDay: dom.dobDay.value, dobMonth: dom.dobMonth.value, dobYear: dom.dobYear.value,
      currentAge: dom.currentAge.value, lifeExpectancy: dom.lifeExpectancy.value,
      countrySelect: dom.countrySelect.value,
      milestones: state.milestones, goals: state.goals,
      customCategories: state.customCategories,
      breakdownValues: {},
    };
    $$('.breakdown-hours').forEach((inp) => { data.breakdownValues[inp.dataset.category] = inp.value; });
    try {
      localStorage.setItem('lmv-state-' + profileId, JSON.stringify(data));
    } catch (e) {
      // storage full or unavailable - silently skip
    }
  }

  function loadProfileData(profileId) {
    const raw = localStorage.getItem('lmv-state-' + profileId);
    if (!raw) {
      // Reset fields
      dom.dobDay.value = ''; dom.dobMonth.value = ''; dom.dobYear.value = '';
      dom.currentAge.value = ''; dom.lifeExpectancy.value = '70';
      dom.countrySelect.value = '';
      state.milestones = []; state.goals = []; state.customCategories = [];
      // Remove any existing custom category cards
      $$('.custom-category-card').forEach(c => c.remove());
      return;
    }
    try {
      const data = JSON.parse(raw);
      dom.dobDay.value = data.dobDay || '';
      dom.dobMonth.value = data.dobMonth || '';
      dom.dobYear.value = data.dobYear || '';
      dom.currentAge.value = data.currentAge || '';
      dom.lifeExpectancy.value = data.lifeExpectancy || '70';
      dom.countrySelect.value = data.countrySelect || '';
      state.milestones = data.milestones || [];
      state.goals = data.goals || [];
      // Load custom categories
      state.customCategories = data.customCategories || [];
      $$('.custom-category-card').forEach(c => c.remove());
      renderCustomCategories();
      if (data.breakdownValues) {
        Object.entries(data.breakdownValues).forEach(([cat, val]) => {
          const inp = $(`.breakdown-hours[data-category="${cat}"]`);
          if (inp) inp.value = val;
        });
      }
    } catch (_) {}
  }

  function applyProfile() {
    // Rebuild profile dropdown
    dom.profileSelect.innerHTML = '';
    Object.entries(state.profiles).forEach(([id, p]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = p.name;
      dom.profileSelect.appendChild(opt);
    });
    dom.profileSelect.value = state.currentProfile;
    loadProfileData(state.currentProfile);
  }

  // ======================= EXPORT ========================
  function showExportPanel() {
    dom.exportPanel.classList.toggle('hidden');
    playClick();
  }

  function exportAsImage() {
    const c = state.lastCalc;
    if (!c) return;

    // 4K high-resolution export
    const scale = 4; // 4x DPR for crisp output
    const dotSize = 14;
    const gap = 4;
    const cols = state.currentView === 'weeks' ? 52 : state.currentView === 'years' ? 20 : 36;
    const total = state.currentView === 'weeks' ? c.totalWeeks : state.currentView === 'years' ? c.lifeExp : c.totalMonths;
    const lived = state.currentView === 'weeks' ? c.weeksLived : state.currentView === 'years' ? c.ageYears : c.monthsLived;
    const rows = Math.ceil(total / cols);

    const padding = 80;
    const headerH = 120;
    const footerH = 80;
    const canvasW = cols * (dotSize + gap) + padding * 2;
    const canvasH = rows * (dotSize + gap) + headerH + footerH;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW * scale;
    canvas.height = canvasH * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Background
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#052e16' : '#f0fdf4';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Title
    ctx.fillStyle = isDark ? '#f0fdf4' : '#14532d';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Life Canvas', canvasW / 2, 45);

    // Subtitle
    ctx.fillStyle = isDark ? '#bbf7d0' : '#166534';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText(state.currentView.charAt(0).toUpperCase() + state.currentView.slice(1) + ' View - Age ' + c.ageYears + ' / ' + c.lifeExp, canvasW / 2, 72);

    // Legend
    const legendY = 95;
    const legendItems = [
      { color: isDark ? '#86efac' : '#15803d', label: 'Lived' },
      { color: '#facc15', label: 'Current' },
      { color: isDark ? '#14532d' : '#bbf7d0', label: 'Remaining' },
      { color: '#f97316', label: 'Milestone' },
      { color: '#8b5cf6', label: 'Goal' },
    ];
    ctx.font = '11px Inter, system-ui, sans-serif';
    const totalLegendW = legendItems.length * 90;
    let lx = canvasW / 2 - totalLegendW / 2;
    legendItems.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(lx + 6, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isDark ? '#bbf7d0' : '#166534';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 15, legendY + 4);
      lx += 90;
    });

    // Dots
    const milestoneMonths = getMilestoneMonths();
    const goalMonths = getGoalMonths();
    const milestoneWeeks = state.currentView === 'weeks' ? getMilestoneWeeks() : {};
    const goalWeeks = state.currentView === 'weeks' ? getGoalWeeks() : {};

    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (dotSize + gap);
      const y = headerH + row * (dotSize + gap);

      let isMilestone, isGoal;
      if (state.currentView === 'weeks') {
        isMilestone = milestoneWeeks[i];
        isGoal = goalWeeks[i];
      } else if (state.currentView === 'years') {
        isMilestone = state.milestones.some((m) => m.age === i);
        isGoal = state.goals.some((g) => g.age === i);
      } else {
        isMilestone = milestoneMonths[i];
        isGoal = goalMonths[i];
      }

      if (isMilestone) ctx.fillStyle = '#f97316';
      else if (isGoal) ctx.fillStyle = '#8b5cf6';
      else if (i < lived) ctx.fillStyle = isDark ? '#86efac' : '#15803d';
      else if (i === lived) ctx.fillStyle = '#facc15';
      else ctx.fillStyle = isDark ? '#14532d' : '#bbf7d0';

      ctx.beginPath();
      ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stats footer
    ctx.fillStyle = isDark ? '#bbf7d0' : '#166534';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${c.percentComplete.toFixed(1)}% complete  ·  ${c.monthsLived.toLocaleString()} months lived  ·  ${c.monthsRemaining.toLocaleString()} months remaining`, canvasW / 2, canvasH - footerH + 30);

    ctx.fillStyle = isDark ? '#166534' : '#bbf7d0';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText('Generated by Life Canvas', canvasW / 2, canvasH - footerH + 55);

    // Download
    const link = document.createElement('a');
    link.download = 'life-visualization-4K.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    playClick();
  }

  function exportStatsText() {
    const c = state.lastCalc;
    if (!c) return;
    const text = `Life Canvas\n` +
      `Age: ${c.ageYears}\n` +
      `Expected Lifespan: ${c.lifeExp}\n` +
      `Months Lived: ${c.monthsLived}\n` +
      `Months Still Ahead: ${c.monthsRemaining}\n` +
      `Months in a Lifetime: ${c.totalMonths}\n` +
      `Journey So Far: ${c.percentComplete.toFixed(1)}%\n` +
      `\nMilestones: ${state.milestones.map(m => m.icon + ' ' + m.name + ' (age ' + m.age + ')').join(', ') || 'None'}\n` +
      `Goals: ${state.goals.map(g => g.name + ' (by age ' + g.age + ')').join(', ') || 'None'}`;
    navigator.clipboard.writeText(text).then(() => {
      dom.exportStats.textContent = '✓ Copied!';
      setTimeout(() => dom.exportStats.innerHTML = '&#128203; Copy to Clipboard', 2000);
    }).catch(() => showError('Failed to copy.'));
    playClick();
  }

  async function shareData() {
    const c = state.lastCalc;
    if (!c || !navigator.share) return;
    try {
      await navigator.share({
        title: 'Life Canvas',
        text: `I’ve experienced ${c.monthsLived} months - ${c.percentComplete.toFixed(1)}% of an expected ${c.totalMonths}-month lifetime. Every month matters.`,
        url: window.location.href,
      });
    } catch (_) {}
  }

  // ======================= STATE PERSISTENCE =============
  function saveState() {
    saveProfileData(state.currentProfile);
    var globalState = {
      soundOn: state.soundOn,
      currentProfile: state.currentProfile,
      profiles: state.profiles,
    };
    try {
      localStorage.setItem('lmv-global', JSON.stringify(globalState));
    } catch (e) {
      // quota exceeded or private browsing - not critical, just skip
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem('lmv-global');
      if (raw) {
        const data = JSON.parse(raw);
        state.soundOn = data.soundOn !== undefined ? data.soundOn : true;
        state.currentProfile = data.currentProfile || 'default';
        state.profiles = data.profiles || { default: { name: 'Default Profile' } };
      }
    } catch (_) {
      // corrupted data or private mode - just use defaults
    }
    document.getElementById('soundIcon').innerHTML = state.soundOn ? '&#128264;' : '&#128263;';
  }

  // ---- Service worker registration (for offline / PWA) ----
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // SW registration failed - app still works fine, just no offline support
      });
    }
  }

  // ---- Helpers ----
  function getCSS(prop) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  }

  // ---- Kick things off ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
