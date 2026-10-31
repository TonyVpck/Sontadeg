 //-------------------------------------------------------------------------------------------//
 // SONTADEG page d'acceuil // gestion de la langue de la page                       ---------//
 //-------------------------------------------------------------------------------------------//

(function () {
  'use strict';

  var LANGS = window.SONTADEG_LANGS || {};
  var CODES = Object.keys(LANGS);
  if (!CODES.length) return;

  var STORAGE_KEY = 'sontadeg-lang';
  var FALLBACK = LANGS.en ? 'en' : CODES[0];   // si la langue du navigateur n'est pas proposée
  var current = null;

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeStored(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { }
  }

  //- CHOIX DE LA LANGUE -----------------------------------------------------------------------------//
  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i]).toLowerCase().split('-')[0];   // "fr-CA" -> "fr"
      if (LANGS[base]) return base;
    }
    return null;
  }

  function fromUrl() {
    var m = /[?&]lang=([a-z]{2,3})/i.exec(location.search);
    return m && LANGS[m[1].toLowerCase()] ? m[1].toLowerCase() : null;
  }

  function initialLang() {
    var stored = readStored();
    return fromUrl() || (LANGS[stored] ? stored : null) || fromBrowser() || FALLBACK;
  }

  //- APPLICAITON -----------------------------------------------------------------------------------//
  function apply(code) {
    var lang = LANGS[code];
    if (!lang) return;
    current = code;
    var S = lang.strings || {};

    document.documentElement.lang = code;
    if (S.title) document.title = S.title;

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var v = S[el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-attr]'), function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        var v = S[(parts[1] || '').trim()];
        if (parts[0] && v != null) el.setAttribute(parts[0].trim(), v);
      });
    });

    var select = document.getElementById('lang');
    if (select) {
      select.value = code;
      if (S.langLabel) select.setAttribute('aria-label', S.langLabel);
    }

    document.dispatchEvent(new CustomEvent('sontadeg:lang', { detail: { code: code } }));
  }

  //- MENU DE LA LANGUE -----------------------------------------------------------------------------------//
  function buildMenu() {
    var select = document.getElementById('lang');
    if (!select) return;
    select.innerHTML = '';
    CODES.forEach(function (code) {
      var o = document.createElement('option');
      o.value = code;
      o.textContent = LANGS[code].code || code.toUpperCase();   // seules les lettres
      o.title = LANGS[code].name || '';
      select.appendChild(o);
    });
    select.addEventListener('change', function () {
      writeStored(select.value);   // seul un choix explicite est mémorisé
      apply(select.value);
    });
  }

  //- API PUBLIQUE --------------------------------------------------------------------------------------//
  window.SontadegI18n = {
    get lang() { return current; },
    questions: function () { return (LANGS[current] || {}).questions || []; },
    set: function (code) { writeStored(code); apply(code); }
  };

  buildMenu();
  apply(initialLang());
})();
