/* The Shifa Institute website. Small, dependency-free interactions.
   Nothing is tied to scroll position. */
(function () {
  'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Mobile menu */
  var btn = $('#menuBtn'), nav = $('#siteNav');
  if (btn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    };
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }

  /* Photo row: previous and next buttons */
  $$('[data-row]').forEach(function (wrap) {
    var row = $('.photo-row', wrap);
    if (!row) return;
    $$('[data-row-step]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var dir = Number(b.getAttribute('data-row-step'));
        row.scrollBy({ left: dir * row.clientWidth * 0.7, behavior: reduce.matches ? 'auto' : 'smooth' });
      });
    });
  });

  // Embedded frames (Instagram posts, donation form): show a loading note
  // until the frame has loaded, and a plain link if it takes too long.
  $$('[data-embed]').forEach(function (box) {
    var frame = $('iframe', box), note = $('[data-embed-note]', box);
    if (!frame || !note) return;
    var done = false;
    box.classList.add('is-loading');
    function finish() { done = true; box.classList.remove('is-loading'); note.hidden = true; }
    frame.addEventListener('load', finish);
    setTimeout(function () {
      if (done) return;
      box.classList.remove('is-loading');
      note.textContent = note.getAttribute('data-embed-late');
    }, 12000);
  });

  /* Tabs (ways to give) */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (n === null) return;
        e.preventDefault();
        select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
  });

  /* Footer year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
