// Landing page behavior (layout: landing): theme toggle, quick-start tabs,
// copy buttons, and light shell highlighting. No dependencies.
(function () {
  var root = document.documentElement;

  // Theme toggle — the initial theme is set inline in <head> to avoid a flash.
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = root.classList.contains('dark') ? 'light' : 'dark';
      root.classList.toggle('dark', next === 'dark');
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('zurdo-theme', next); } catch (e) {}
    });
  });

  // Tabs — HeroUI's tab markup driven by a small WAI-ARIA tablist.
  document.querySelectorAll('[data-tabs]').forEach(function (tabsEl) {
    var tabs = Array.prototype.slice.call(tabsEl.querySelectorAll('[role="tab"]'));
    var indicator = tabsEl.querySelector('[data-indicator]');

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on) t.setAttribute('data-selected', 'true');
        else t.removeAttribute('data-selected');
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (indicator) tab.appendChild(indicator);
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (event.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (event.key === 'Home') next = tabs[0];
        else if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) { event.preventDefault(); select(next, true); }
      });
    });
  });

  // Shell highlighting: dim comments, tint the leading command word.
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  document.querySelectorAll('code[data-shell]').forEach(function (code) {
    var inHeredoc = false;
    code.innerHTML = code.textContent.split('\n').map(function (line) {
      if (inHeredoc) {
        if (line.trim() === 'EOF') inHeredoc = false;
        return escapeHtml(line);
      }
      if (/<<\s*'?EOF'?/.test(line)) inHeredoc = true;
      var hash = line.search(/(^|\s)#/);
      var body = hash === -1 ? line : line.slice(0, hash);
      var comment = hash === -1 ? '' : line.slice(hash);
      var html = escapeHtml(body).replace(/^(\s*)(zurdo|brew|cat)\b/, '$1<span class="t-cmd">$2</span>');
      return html + (comment ? '<span class="t-comment">' + escapeHtml(comment) + '</span>' : '');
    }).join('\n');
  });

  // Copy buttons.
  function flash(button) {
    button.setAttribute('data-copied', '');
    setTimeout(function () { button.removeAttribute('data-copied'); }, 1600);
  }
  document.querySelectorAll('[data-copy], [data-copy-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = button.getAttribute('data-copy-target');
      var text = target
        ? document.getElementById(target).textContent
        : button.getAttribute('data-copy');
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text.trim()).then(function () { flash(button); });
    });
  });
})();
