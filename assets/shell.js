/* App shell behaviour for the DashStack layout: animated left sidebar + top bar.
   - Icons: any element with data-icon="name" gets an inline SVG (no icon font / CDN needed).
   - Sliding active indicator that follows the selected nav item (aria-selected="true" or .active).
   - Collapse to an icon rail (remembered per browser), tooltips while collapsed.
   - Off-canvas drawer with backdrop below 900px.
   - Page title in the top bar follows the active item.
   The page's own scripts keep owning navigation; this file only watches the DOM, so it works on any page. */
(function () {
  "use strict";
  var P = {
    company: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    departments: '<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="m2 13 10 5 10-5"/>',
    roi: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    individuals: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M6 6V5a2 2 0 0 1 2-2h9"/>',
    performance: '<path d="M3 21h18M6 17v-6M11 17V5M16 17v-9"/>',
    hr: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 11l2 2 4-4"/>',
    weights: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    ai_kpi: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
    projects: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    access: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    me: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    collapse: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || "") + "</svg>";
  }
  window.GCIcon = svg;

  var shell = document.querySelector(".app-shell");
  if (!shell) return;
  var nav = shell.querySelector(".sb-nav");
  var indicator = nav && nav.querySelector(".sb-indicator");
  var mq = window.matchMedia("(max-width: 900px)");

  shell.querySelectorAll("[data-icon]").forEach(function (el) { el.innerHTML = svg(el.dataset.icon); });

  function items() { return nav ? Array.prototype.slice.call(nav.querySelectorAll(":scope > button, :scope > a")) : []; }
  function activeItem() { return items().filter(function (b) { return b.getAttribute("aria-selected") === "true" || b.classList.contains("active"); })[0]; }

  function moveIndicator() {
    if (!indicator) return;
    var a = activeItem();
    var show = !!(a && !a.hidden);
    var first = show && !indicator.classList.contains("ready");
    if (!show) { if (indicator.classList.contains("ready")) indicator.classList.remove("ready"); return; }
    var tf = "translateY(" + a.offsetTop + "px)", h = a.offsetHeight + "px";
    if (first) indicator.style.transition = "none";   // place instantly on first show; animate later moves
    if (indicator.style.transform !== tf) indicator.style.transform = tf;
    if (indicator.style.height !== h) indicator.style.height = h;
    if (first) {
      void indicator.offsetWidth;   // flush the position before re-enabling transitions
      indicator.style.transition = "";
      indicator.classList.add("ready");
    }
  }
  function updateTitle() {
    var a = activeItem(), t = document.getElementById("pageTitle");
    if (a && t) {
      var label = a.querySelector(".sb-label");
      t.textContent = (label ? label.textContent : a.textContent).trim();
      document.title = t.textContent + " — Glocomp Systems";
    }
  }
  // Hide group headings that have no visible items under them (nav items are filtered per role).
  function tidyGroups() {
    if (!nav) return;
    var kids = Array.prototype.slice.call(nav.children);
    kids.forEach(function (k, i) {
      if (!k.classList.contains("sb-group")) return;
      var j = i + 1, any = false;
      while (j < kids.length && !kids[j].classList.contains("sb-group")) { if (kids[j].matches("button, a") && !kids[j].hidden) any = true; j++; }
      if (k.hidden !== !any) k.hidden = !any;   // only write on change: writes re-trigger the MutationObserver
    });
  }
  function refresh() { tidyGroups(); updateTitle(); moveIndicator(); }

  // collapse (desktop) / drawer (mobile)
  var KEY = "gc-sb-collapsed";
  try { if (localStorage.getItem(KEY) === "1") shell.classList.add("sb-collapsed"); } catch (e) { /* storage unavailable */ }
  function setCollapsed(on) {
    shell.classList.toggle("sb-collapsed", on);
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* ignore */ }
    var t = document.getElementById("sbToggle");
    if (t) t.setAttribute("aria-expanded", on ? "false" : "true");
    moveIndicator();                  // group headings resize instantly, so the final position is known now: slide with the rail
    setTimeout(moveIndicator, 320);   // fallback if transitionend doesn't fire (e.g. reduced motion)
  }
  function setOpen(on) { shell.classList.toggle("sb-open", on); }
  var toggle = document.getElementById("sbToggle");
  if (toggle) toggle.addEventListener("click", function () {
    if (mq.matches) setOpen(!shell.classList.contains("sb-open"));
    else setCollapsed(!shell.classList.contains("sb-collapsed"));
  });
  var collapseBtn = document.getElementById("sbCollapse");
  if (collapseBtn) collapseBtn.addEventListener("click", function () { setCollapsed(!shell.classList.contains("sb-collapsed")); });
  var backdrop = shell.querySelector(".sb-backdrop");
  if (backdrop) backdrop.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  if (nav) nav.addEventListener("click", function (e) { if (mq.matches && e.target.closest("button, a")) setOpen(false); });

  var sidebar = shell.querySelector(".sidebar");
  if (sidebar) sidebar.addEventListener("transitionend", function (e) { if (e.propertyName === "width") moveIndicator(); });
  window.addEventListener("resize", moveIndicator);

  // tooltips while collapsed
  var tip = document.createElement("div");
  tip.className = "sb-tooltip";
  tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);
  shell.querySelectorAll(".sidebar button, .sidebar a").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      if (!shell.classList.contains("sb-collapsed") || mq.matches) return;
      var label = el.querySelector(".sb-label");
      if (!label) return;
      var r = el.getBoundingClientRect();
      tip.textContent = label.textContent.trim();
      tip.style.left = (r.right + 12) + "px";
      tip.style.top = (r.top + r.height / 2 - 15) + "px";
      tip.classList.add("show");
    });
    el.addEventListener("mouseleave", function () { tip.classList.remove("show"); });
  });

  // React to the page's own navigation (tab switches, role filtering) without coupling to its code.
  // Ignore mutations the shell makes itself (indicator, group headings) and batch the rest into one frame,
  // otherwise refresh() -> attribute write -> observer -> refresh() would loop forever.
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () { pending = false; refresh(); }, 0);
  }
  if (nav && window.MutationObserver) {
    new MutationObserver(function (records) {
      var relevant = records.some(function (m) {
        var t = m.target;
        return !(t.classList && (t.classList.contains("sb-indicator") || t.classList.contains("sb-group")));
      });
      if (relevant) schedule();
    }).observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected", "class", "hidden"] });
  }
  refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

  window.GCShell = { refresh: refresh };
})();
