/* Resources directory: search, filters, grouping and languages.
   Data is read from the JSON block in the page. Everything is written with
   textContent, never innerHTML, so listing text can never run as code.
   Translations load on demand from assets/i18n/<language>.js. */
(function () {
  'use strict';
  var dataEl = document.getElementById('resData');
  var listEl = document.getElementById('resList');
  if (!dataEl || !listEl) return;

  var all;
  try { all = JSON.parse(dataEl.textContent).resources || []; } catch (e) { all = []; }

  var TYPE_ORDER = ['Crisis line', 'Helpline', 'Therapist directory', 'Counseling and clinics', 'Campus counseling', 'Education and tools', 'Community support'];
  var TOPIC_ORDER = ['Suicide and crisis', 'General mental health', 'Sexual assault and abuse', 'Domestic and dating violence', 'Human trafficking', 'Children and youth', 'Substance use and recovery', 'Eating disorders', 'Pregnancy and new parents', 'Grief and loss'];
  var RTL = { ar: true, ur: true };
  var LOCALE = { en: 'en-US', es: 'es-US', ar: 'ar', ur: 'ur', hi: 'hi-IN', bn: 'bn-BD' };

  /* English text for everything this script writes. Page text keeps its
     English in the HTML and is read from there. */
  var EN = {
    showingAll: 'Showing all {n} resources',
    showingSome: 'Showing {a} of {n} resources',
    lCall: 'Call', lText: 'Text', lHours: 'Hours', lCost: 'Cost', lLanguages: 'Languages',
    callNow: 'Call now', call988: 'Call 988', visit: 'Visit website', chat: 'Chat online',
    checkedFull: 'Details checked on the official website, {date}.',
    checkedPart: 'Listing checked, {date}.',
    source: 'Source',
    confirm: 'Please confirm details with the organization.',
    michigan: 'Michigan', national: 'National'
  };

  var $ = function (id) { return document.getElementById(id); };
  var q = $('resSearch'), fTopic = $('resTopic'), fType = $('resType'), fCommunity = $('resCommunity');
  var fArea = $('resArea'), fGroup = $('resGroup'), clearBtn = $('resClear'), countEl = $('resCount');
  var emptyEl = $('resEmpty'), langSel = $('resLang'), noteEl = $('langNote'), main = $('main');

  var lang = 'en';
  var pack = null; /* the loaded translation for the current language */

  /* Remember the English page text so we can always switch back */
  var staticEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  staticEls.forEach(function (el) { el.setAttribute('data-en', el.textContent); });
  var phEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-placeholder]'));
  phEls.forEach(function (el) { el.setAttribute('data-en-ph', el.getAttribute('placeholder')); });

  function ui(key) { return (pack && pack.ui && pack.ui[key]) || EN[key] || ''; }
  function tax(label) { return (pack && pack.tax && pack.tax[label]) || label; }
  function field(r, key) {
    var t = pack && pack.res && pack.res[r.id];
    var short = key === 'description' ? 'd' : key;
    return (t && t[short]) || r[key] || '';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function isMichigan(r) { return r.area !== 'National'; }
  function safeUrl(u) { return /^https:\/\//i.test(u || '') ? u : null; }
  function telHref(phone) {
    if (!phone) return null;
    if (/^\s*(dial\s*)?(988|911|211|2-1-1)\b/i.test(phone)) return 'tel:' + phone.replace(/\D/g, '').slice(0, 3);
    var main0 = phone.split(/[;,/]| or /i)[0].replace(/\(.{5,}?\)/g, '');
    var letters = { A: 2, B: 2, C: 2, D: 3, E: 3, F: 3, G: 4, H: 4, I: 4, J: 5, K: 5, L: 5, M: 6, N: 6, O: 6, P: 7, Q: 7, R: 7, S: 7, T: 8, U: 8, V: 8, W: 9, X: 9, Y: 9, Z: 9 };
    var digits = main0.toUpperCase().replace(/[A-Z]/g, function (c) { return letters[c]; }).replace(/\D/g, '');
    if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
    return digits.length === 10 ? 'tel:+1' + digits : null;
  }
  function niceDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return '';
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    try { return d.toLocaleDateString(LOCALE[lang] || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return iso; }
  }

  function fillSelect(select, values) {
    var keep = select.value;
    while (select.options.length > 1) select.remove(1);
    values.forEach(function (v) { var o = el('option', null, tax(v)); o.value = v; select.appendChild(o); });
    select.value = keep;
  }
  function present(key, order) {
    var seen = {};
    all.forEach(function (r) { if (r[key]) seen[r[key]] = true; });
    var keys = Object.keys(seen);
    if (order) return order.filter(function (t) { return seen[t]; }).concat(keys.filter(function (k) { return order.indexOf(k) === -1; }).sort());
    return keys.sort(function (a, b) {
      if (a === 'Everyone') return -1;
      if (b === 'Everyone') return 1;
      return a < b ? -1 : 1;
    });
  }
  function fillAll() {
    fillSelect(fTopic, present('topic', TOPIC_ORDER));
    fillSelect(fType, present('type', TYPE_ORDER));
    fillSelect(fCommunity, present('community'));
  }

  function card(r) {
    var li = el('li', 'res-card');
    var head = el('div', 'res-card-head');
    var h = el('h4', null, r.name); h.setAttribute('dir', 'auto');
    head.appendChild(h);
    var tags = el('p', 'res-tags');
    [r.type, r.topic, r.community].forEach(function (t) { if (t) tags.appendChild(el('span', null, tax(t))); });
    if (r.area) tags.appendChild(el('span', null, r.area === 'National' ? ui('national') : tax(r.area)));
    head.appendChild(tags);
    li.appendChild(head);
    li.appendChild(el('p', 'res-desc', field(r, 'description')));

    var facts = el('dl', 'res-facts');
    [['lCall', r.phone, true], ['lText', field(r, 'text')], ['lHours', field(r, 'hours')], ['lCost', field(r, 'cost')], ['lLanguages', field(r, 'languages')]].forEach(function (f) {
      if (!f[1]) return;
      facts.appendChild(el('dt', null, ui(f[0])));
      var dd = el('dd', null, f[1]);
      if (f[2]) dd.setAttribute('dir', 'ltr');
      facts.appendChild(dd);
    });
    if (facts.children.length) li.appendChild(facts);

    var actions = el('div', 'res-actions');
    var tel = telHref(r.phone);
    if (tel) { var c = el('a', 'btn btn-light', tel === 'tel:988' ? ui('call988') : ui('callNow')); c.href = tel; actions.appendChild(c); }
    var chat = safeUrl(r.chat);
    if (chat) { var ch = el('a', 'btn btn-ghost', ui('chat')); ch.href = chat; ch.target = '_blank'; ch.rel = 'noopener'; actions.appendChild(ch); }
    var site = safeUrl(r.url);
    if (site) { var w = el('a', 'btn btn-ghost', ui('visit')); w.href = site; w.target = '_blank'; w.rel = 'noopener'; actions.appendChild(w); }
    li.appendChild(actions);

    var check = el('p', 'res-check');
    var full = r.confidence === 'Verified on official site';
    check.appendChild(document.createTextNode(ui(full ? 'checkedFull' : 'checkedPart').replace('{date}', niceDate(r.verified)) + ' '));
    var src = safeUrl(r.source);
    if (src) { var s = el('a', null, ui('source')); s.href = src; s.target = '_blank'; s.rel = 'noopener'; check.appendChild(s); }
    if (!full) check.appendChild(document.createTextNode(' ' + ui('confirm')));
    li.appendChild(check);
    return li;
  }

  function matches(r) {
    if (fTopic.value && r.topic !== fTopic.value) return false;
    if (fType.value && r.type !== fType.value) return false;
    if (fCommunity.value && r.community !== fCommunity.value) return false;
    if (fArea.value === 'National' && isMichigan(r)) return false;
    if (fArea.value === 'Michigan' && !isMichigan(r)) return false;
    var term = q.value.trim().toLowerCase();
    if (!term) return true;
    var hay = [r.name, r.description, r.type, r.topic, r.community, r.area, r.languages, r.cost,
      field(r, 'description'), tax(r.type), tax(r.topic), tax(r.community), tax(r.area), field(r, 'languages')].join(' ').toLowerCase();
    return term.split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
  }

  function groupKey(r) {
    if (fGroup.value === 'community') return r.community;
    if (fGroup.value === 'topic') return r.topic;
    if (fGroup.value === 'area') return isMichigan(r) ? 'Michigan' : 'National';
    return r.type;
  }
  function groupOrder(keys) {
    var order = fGroup.value === 'type' ? TYPE_ORDER : fGroup.value === 'topic' ? TOPIC_ORDER : fGroup.value === 'area' ? ['Michigan', 'National'] : null;
    if (order) return order.filter(function (t) { return keys.indexOf(t) !== -1; }).concat(keys.filter(function (k) { return order.indexOf(k) === -1; }).sort());
    return keys.sort(function (a, b) {
      if (a === 'Everyone') return 1;
      if (b === 'Everyone') return -1;
      return a < b ? -1 : 1;
    });
  }
  function groupLabel(k) {
    if (k === 'Michigan') return ui('michigan');
    if (k === 'National') return ui('national');
    return tax(k);
  }

  function render() {
    var shown = all.filter(matches);
    var groups = {};
    shown.forEach(function (r) { var k = groupKey(r); (groups[k] = groups[k] || []).push(r); });
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    groupOrder(Object.keys(groups)).forEach(function (k) {
      var sec = el('section', 'res-group');
      var h = el('h3', null, groupLabel(k));
      h.appendChild(el('span', null, ' ' + groups[k].length));
      sec.appendChild(h);
      var ul = el('ul', 'res-cards');
      groups[k].sort(function (a, b) { return a.name < b.name ? -1 : 1; }).forEach(function (r) { ul.appendChild(card(r)); });
      sec.appendChild(ul);
      listEl.appendChild(sec);
    });
    countEl.textContent = shown.length === all.length
      ? ui('showingAll').replace('{n}', all.length)
      : ui('showingSome').replace('{a}', shown.length).replace('{n}', all.length);
    emptyEl.hidden = shown.length !== 0;
    clearBtn.hidden = !(q.value || fTopic.value || fType.value || fCommunity.value || fArea.value);
    saveState();
  }

  /* Filters and language (never the search text) are kept in the address so a view can be shared */
  function saveState() {
    var parts = [];
    if (lang !== 'en') parts.push('lang=' + lang);
    [['topic', fTopic], ['type', fType], ['community', fCommunity], ['area', fArea]].forEach(function (p) {
      if (p[1].value) parts.push(p[0] + '=' + encodeURIComponent(p[1].value));
    });
    if (fGroup.value !== 'type') parts.push('group=' + encodeURIComponent(fGroup.value));
    try { history.replaceState(null, '', parts.length ? '#' + parts.join('&') : location.pathname + location.search); } catch (e) { /* local file preview */ }
  }
  function readState() {
    var state = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) state[kv[0]] = decodeURIComponent(kv[1] || '');
    });
    return state;
  }
  function applyState(state) {
    [['topic', fTopic], ['type', fType], ['community', fCommunity], ['area', fArea], ['group', fGroup]].forEach(function (p) {
      var v = state[p[0]];
      if (v && Array.prototype.some.call(p[1].options, function (o) { return o.value === v; })) p[1].value = v;
    });
  }

  /* Languages */
  function applyLanguage() {
    staticEls.forEach(function (n) {
      var key = n.getAttribute('data-i18n');
      n.textContent = (pack && pack.ui && pack.ui[key]) || n.getAttribute('data-en');
    });
    phEls.forEach(function (n) {
      var key = n.getAttribute('data-i18n-placeholder');
      n.setAttribute('placeholder', (pack && pack.ui && pack.ui[key]) || n.getAttribute('data-en-ph'));
    });
    main.setAttribute('lang', lang);
    main.setAttribute('dir', RTL[lang] ? 'rtl' : 'ltr');
    main.classList.toggle('script-other', lang !== 'en' && lang !== 'es');
    noteEl.hidden = lang === 'en';
    langSel.value = lang;
    fillAll();
    render();
  }
  function setLanguage(code) {
    if (!LOCALE[code]) code = 'en';
    try { localStorage.setItem('shifaLang', code); } catch (e) { /* private mode */ }
    if (code === 'en') { lang = 'en'; pack = null; applyLanguage(); return; }
    var store = window.SHIFA_I18N || (window.SHIFA_I18N = {});
    var done = function () { lang = code; pack = store[code] || null; if (!pack) lang = 'en'; applyLanguage(); };
    if (store[code]) { done(); return; }
    var s = document.createElement('script');
    s.src = 'assets/i18n/' + code + '.js';
    s.onload = done;
    s.onerror = function () { lang = 'en'; pack = null; applyLanguage(); };
    document.head.appendChild(s);
  }

  var timer;
  q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(render, 120); });
  [fTopic, fType, fCommunity, fArea, fGroup].forEach(function (s) { s.addEventListener('change', render); });
  langSel.addEventListener('change', function () { setLanguage(langSel.value); });
  clearBtn.addEventListener('click', function () {
    q.value = ''; fTopic.value = ''; fType.value = ''; fCommunity.value = ''; fArea.value = '';
    render(); q.focus();
  });
  $('resForm').addEventListener('submit', function (e) { e.preventDefault(); render(); });

  window.addEventListener('hashchange', function () {
    var state = readState();
    applyState(state);
    if ((state.lang || 'en') !== lang) setLanguage(state.lang || 'en'); else render();
  });

  var start = readState();
  fillAll();
  applyState(start);
  var saved = null;
  try { saved = localStorage.getItem('shifaLang'); } catch (e) { /* private mode */ }
  var first = start.lang || saved || 'en';
  if (first !== 'en' && LOCALE[first]) setLanguage(first); else render();
})();
