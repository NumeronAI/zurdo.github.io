// Site behavior for every page: theme toggle, tabs, copy buttons, shell
// highlighting, and docs-page enhancements (anchors, tables, TOC). No dependencies.
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
  // Docs pages: enhance the rendered Markdown.
  var prose = document.querySelector('[data-prose]');
  if (prose) {
    var copyIcons =
      '<svg class="lp-copy-idle" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>' +
      '<svg class="lp-copy-done" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

    // Wide tables scroll inside their own frame instead of the page.
    prose.querySelectorAll('table').forEach(function (table) {
      var frame = document.createElement('div');
      frame.className = 'lp-table';
      table.parentNode.insertBefore(frame, table);
      frame.appendChild(table);
    });

    // Code blocks: language label and copy button.
    prose.querySelectorAll('div.highlighter-rouge').forEach(function (block) {
      var code = block.querySelector('pre code');
      if (!code) return;
      var lang = (block.className.match(/language-(\w+)/) || [])[1];
      if (lang && lang !== 'plaintext' && lang !== 'text') {
        var label = document.createElement('span');
        label.className = 'lp-code-lang';
        label.textContent = lang;
        block.appendChild(label);
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button--ghost button--icon-only button--sm lp-code__copy';
      button.setAttribute('aria-label', 'Copy code');
      button.innerHTML = copyIcons;
      button.addEventListener('click', function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(code.textContent.replace(/\n$/, '')).then(function () { flash(button); });
      });
      block.appendChild(button);
    });

    // Heading anchors and the on-this-page list.
    var headings = Array.prototype.slice.call(prose.querySelectorAll('h2[id], h3[id]'));
    headings.forEach(function (h) {
      var a = document.createElement('a');
      a.className = 'lp-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'Link to this section');
      a.textContent = '#';
      h.appendChild(a);
    });

    var toc = document.querySelector('[data-toc]');
    var list = document.querySelector('[data-toc-list]');
    if (toc && list && headings.length > 1) {
      var links = headings.map(function (h) {
        var li = document.createElement('li');
        if (h.tagName === 'H3') li.className = 'lp-toc__sub';
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.replace(/#$/, '').trim();
        li.appendChild(a);
        list.appendChild(li);
        return a;
      });
      toc.hidden = false;

      // Highlight the last heading scrolled past the top of the viewport.
      var ticking = false;
      function spy() {
        ticking = false;
        var active = 0;
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].getBoundingClientRect().top - 100 <= 0) active = i;
          else break;
        }
        links.forEach(function (a, i) {
          if (i === active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(spy); }
      }, { passive: true });
      spy();
    }
  }
})();
