/**
 * AIDEAS i18n + Theme switcher
 * - Language: English (default), Spanish. Shows only the alternate language button.
 * - Theme: Dark/Light toggle. Persists to localStorage.
 *
 * Note: innerHTML is used for elements with data-i18n-html attribute
 * because some translations contain inline markup (e.g., <a> links).
 * All translation content comes from local trusted JSON files, not user input.
 */
(function () {
  'use strict';

  // ── Language ──────────────────────────────────────────────
  var DEFAULT_LANG = 'en';
  var SUPPORTED_LANGS = ['en', 'es'];
  var LANG_STORAGE_KEY = 'aideas_lang';
  var currentLang = DEFAULT_LANG;

  function detectLanguage() {
    var stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    var browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0];
    if (SUPPORTED_LANGS.indexOf(browserLang) !== -1) return browserLang;
    return DEFAULT_LANG;
  }

  function getAlternateLang(lang) {
    return lang === 'en' ? 'es' : 'en';
  }

  function applyTranslations(translations) {
    var textElements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textElements.length; i++) {
      var el = textElements[i];
      var key = el.getAttribute('data-i18n');
      var attrMatch = key.match(/^\[(\w+)\](.+)$/);
      if (attrMatch) {
        var attrValue = getNestedValue(translations, attrMatch[2]);
        if (attrValue !== undefined) el.setAttribute(attrMatch[1], attrValue);
      } else {
        var value = getNestedValue(translations, key);
        if (value !== undefined) el.textContent = value;
      }
    }
    // HTML translations (trusted local JSON only)
    var htmlElements = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlElements.length; j++) {
      var htmlEl = htmlElements[j];
      var htmlKey = htmlEl.getAttribute('data-i18n-html');
      var htmlValue = getNestedValue(translations, htmlKey);
      if (htmlValue !== undefined) {
        // Safe: content from local trusted JSON files only
        htmlEl.innerHTML = htmlValue;
      }
    }
  }

  function getNestedValue(obj, path) {
    var keys = path.split('.');
    var current = obj;
    for (var i = 0; i < keys.length; i++) {
      if (current === undefined || current === null) return undefined;
      current = current[keys[i]];
    }
    return current;
  }

  function updateLangToggle(lang) {
    var alt = getAlternateLang(lang);
    var btns = [document.getElementById('lang-toggle'), document.getElementById('lang-toggle-mobile')];
    for (var i = 0; i < btns.length; i++) {
      if (!btns[i]) continue;
      btns[i].textContent = alt.toUpperCase();
      btns[i].setAttribute('data-lang', alt);
    }
  }

  function switchLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    fetch('locales/' + lang + '.json')
      .then(function (res) { return res.json(); })
      .then(function (translations) {
        applyTranslations(translations);
        updateLangToggle(lang);
        document.documentElement.lang = lang;
      })
      .catch(function (err) {
        console.warn('i18n: Failed to switch to', lang, err);
      });
  }

  function initI18n() {
    currentLang = detectLanguage();
    switchLanguage(currentLang);
  }

  function bindLangToggle() {
    var btns = [document.getElementById('lang-toggle'), document.getElementById('lang-toggle-mobile')];
    for (var i = 0; i < btns.length; i++) {
      if (!btns[i]) continue;
      btns[i].addEventListener('click', function (e) {
        e.preventDefault();
        var targetLang = this.getAttribute('data-lang');
        switchLanguage(targetLang);
      });
    }
  }

  // ── Theme ─────────────────────────────────────────────────
  var THEME_STORAGE_KEY = 'aideas_theme';

  function detectTheme() {
    var stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Infer from current body class
    if (document.body.classList.contains('body-light')) return 'light';
    return 'dark';
  }

  function applyTheme(theme) {
    var body = document.body;
    if (theme === 'light') {
      body.classList.remove('body-dark');
      body.classList.add('body-light');
    } else {
      body.classList.remove('body-light');
      body.classList.add('body-dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeIcon(theme);
    updateToolbarColors(theme);
  }

  function updateThemeIcon(theme) {
    var pairs = [
      ['icon-sun', 'icon-moon'],
      ['icon-sun-mobile', 'icon-moon-mobile']
    ];
    for (var i = 0; i < pairs.length; i++) {
      var sun = document.getElementById(pairs[i][0]);
      var moon = document.getElementById(pairs[i][1]);
      if (!sun || !moon) continue;
      if (theme === 'dark') {
        sun.style.display = 'block';
        moon.style.display = 'none';
      } else {
        sun.style.display = 'none';
        moon.style.display = 'block';
      }
    }
  }

  function updateToolbarColors(theme) {
    var toolbar = document.querySelector('.top-toolbar');
    if (!toolbar) return;
    var isDark = theme === 'dark';
    var style = document.getElementById('toolbar-theme-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'toolbar-theme-style';
      document.head.appendChild(style);
    }
    if (isDark) {
      style.textContent =
        '.toolbar-btn { color: rgba(255,255,255,0.4); }' +
        '.toolbar-btn:hover { color: rgba(255,255,255,0.8); }' +
        '.toolbar-divider { background: rgba(255,255,255,0.25); }' +
        '.theme-toggle-icon { fill: rgba(255,255,255,0.4); stroke: rgba(255,255,255,0.4); }' +
        '.toolbar-btn:hover .theme-toggle-icon { fill: rgba(255,255,255,0.8); stroke: rgba(255,255,255,0.8); }';
    } else {
      style.textContent =
        '.toolbar-btn { color: rgba(0,0,0,0.4); }' +
        '.toolbar-btn:hover { color: rgba(0,0,0,0.7); }' +
        '.toolbar-divider { background: rgba(0,0,0,0.25); }' +
        '.theme-toggle-icon { fill: rgba(0,0,0,0.4); stroke: rgba(0,0,0,0.4); }' +
        '.toolbar-btn:hover .theme-toggle-icon { fill: rgba(0,0,0,0.7); stroke: rgba(0,0,0,0.7); }';
    }
  }

  function bindThemeToggle() {
    var btns = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')];
    for (var i = 0; i < btns.length; i++) {
      if (!btns[i]) continue;
      btns[i].addEventListener('click', function (e) {
        e.preventDefault();
        var current = detectTheme();
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    bindLangToggle();
    bindThemeToggle();
    applyTheme(detectTheme());
    initI18n();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.aideasI18n = {
    switchLanguage: switchLanguage,
    detectLanguage: detectLanguage,
    switchTheme: applyTheme
  };
})();
