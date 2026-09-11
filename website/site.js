/* ACTA presentation website — interactions.
 * Static, immutable synthetic illustration data only. No ACTA API calls,
 * no network requests beyond same-origin static assets, no storage of cases.
 */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Language toggle (ES default, EN option, localStorage) ---------- */
  var LANG_KEY = "acta-web-lang";
  var langNodes = Array.prototype.slice.call(document.querySelectorAll("[data-en]"));
  langNodes.forEach(function (el) {
    if (!el.getAttribute("data-es")) el.setAttribute("data-es", el.textContent);
  });
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll("[data-en-aria]"));
  ariaNodes.forEach(function (el) {
    if (!el.getAttribute("data-es-aria")) el.setAttribute("data-es-aria", el.getAttribute("aria-label") || "");
  });
  var altNodes = Array.prototype.slice.call(document.querySelectorAll("[data-en-alt]"));
  altNodes.forEach(function (el) {
    if (!el.getAttribute("data-es-alt")) el.setAttribute("data-es-alt", el.getAttribute("alt") || "");
  });

  function readLang() {
    try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "es"; }
    catch (e) { return "es"; }
  }
  function writeLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* optional persistence */ }
  }
  function applyLang(lang) {
    root.setAttribute("lang", lang);
    langNodes.forEach(function (el) {
      el.textContent = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-es");
    });
    ariaNodes.forEach(function (el) {
      el.setAttribute("aria-label", lang === "en" ? el.getAttribute("data-en-aria") : el.getAttribute("data-es-aria"));
    });
    altNodes.forEach(function (el) {
      el.setAttribute("alt", lang === "en" ? el.getAttribute("data-en-alt") : el.getAttribute("data-es-alt"));
    });
    document.querySelectorAll(".lang-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
      // The control names the language it switches TO.
      btn.textContent = lang === "en" ? "Español" : "English";
    });
  }
  document.querySelectorAll(".lang-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("lang") === "en" ? "es" : "en";
      writeLang(next);
      applyLang(next);
      if (typeof refreshSrcDemoLang === "function") refreshSrcDemoLang();
    });
  });
  applyLang(readLang());

  /* ---------- Source review demo ---------- */
  var SRC = {
    solicitud: {
      panel: "origen-solicitud",
      value: { es: "Calle Los Robles 14, Panamá", en: "Calle Los Robles 14, Panamá" },
      reason: {
        es: "El valor propuesto coincide literalmente con la línea 4 de la solicitud. La propuesta queda sujeta a su confirmación.",
        en: "The proposed value literally matches line 4 of the application. The proposal remains subject to your confirmation."
      }
    },
    comprobante: {
      panel: "origen-comprobante",
      value: { es: "Calle Los Robles 41, Panamá", en: "Calle Los Robles 41, Panamá" },
      reason: {
        es: "El valor propuesto coincide literalmente con la línea 3 del comprobante. La diferencia con la solicitud (14 vs. 41) explica el pendiente de aclaración.",
        en: "The proposed value literally matches line 3 of the proof. The difference from the application (14 vs. 41) explains the clarification pending item."
      }
    }
  };
  var srcButtons = Array.prototype.slice.call(document.querySelectorAll(".src-switch button[data-src]"));
  var srcValue = document.querySelector(".src-proposal .pv-value");
  var srcReason = document.querySelector(".src-reason");
  var srcLineBtn = document.getElementById("ver-linea-origen");
  var currentSrc = "solicitud";

  function currentLang() { return root.getAttribute("lang") === "en" ? "en" : "es"; }

  function selectSrc(key) {
    currentSrc = key;
    srcButtons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-src") === key ? "true" : "false"); });
    Object.keys(SRC).forEach(function (k) {
      var panel = document.getElementById(SRC[k].panel);
      if (!panel) return;
      panel.hidden = k !== key;
      panel.querySelectorAll(".src-line.hit").forEach(function (l) { l.classList.remove("hit"); });
    });
    if (srcValue) srcValue.textContent = SRC[key].value[currentLang()];
    if (srcReason) {
      srcReason.textContent = SRC[key].reason[currentLang()];
      srcReason.classList.remove("show");
    }
  }
  srcButtons.forEach(function (b) {
    b.addEventListener("click", function () { selectSrc(b.getAttribute("data-src")); });
  });
  if (srcLineBtn) {
    srcLineBtn.addEventListener("click", function () {
      var panel = document.getElementById(SRC[currentSrc].panel);
      if (!panel) return;
      var line = panel.querySelector("[data-hit]");
      if (line) {
        line.classList.add("hit");
        line.setAttribute("tabindex", "-1");
        line.focus({ preventScroll: false });
      }
      if (srcReason) {
        srcReason.textContent = SRC[currentSrc].reason[currentLang()];
        srcReason.classList.add("show");
      }
    });
  }
  function refreshSrcDemoLang() {
    if (!srcButtons.length) return;
    if (srcValue) srcValue.textContent = SRC[currentSrc].value[currentLang()];
    if (srcReason && srcReason.classList.contains("show")) {
      srcReason.textContent = SRC[currentSrc].reason[currentLang()];
    }
  }
  if (srcButtons.length) selectSrc(currentSrc);

  /* Source links from other sections: select the matching document first. */
  document.querySelectorAll("a[data-src-link]").forEach(function (a) {
    a.addEventListener("click", function () { selectSrc(a.getAttribute("data-src-link")); });
  });

  /* ---------- Visit tabs (ARIA tablist, arrow keys) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.visit-tabs [role="tab"]'));
  function activateTab(tab, focus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab, false); });
    tab.addEventListener("keydown", function (ev) {
      var next = null;
      if (ev.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (ev.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (ev.key === "Home") next = tabs[0];
      else if (ev.key === "End") next = tabs[tabs.length - 1];
      if (next) { ev.preventDefault(); activateTab(next, true); }
    });
  });
  if (tabs.length) activateTab(tabs[0], false);

  /* ---------- Human review example ---------- */
  var ackCheck = document.getElementById("ack-check");
  var ackConfirm = document.getElementById("ack-confirm");
  var ackResult = document.getElementById("ack-result");
  var ackReset = document.getElementById("ack-reset");
  function syncAck() {
    if (ackConfirm) ackConfirm.disabled = !(ackCheck && ackCheck.checked);
  }
  if (ackCheck) ackCheck.addEventListener("change", syncAck);
  if (ackConfirm) ackConfirm.addEventListener("click", function () {
    if (ackResult) ackResult.classList.add("show");
    if (ackReset) ackReset.hidden = false;
    ackConfirm.disabled = true;
    if (ackCheck) ackCheck.disabled = true;
  });
  if (ackReset) ackReset.addEventListener("click", function () {
    if (ackResult) ackResult.classList.remove("show");
    ackReset.hidden = true;
    if (ackCheck) { ackCheck.disabled = false; ackCheck.checked = false; }
    if (ackConfirm) ackConfirm.disabled = true;
  });
  syncAck();

  /* ---------- Anchor focus for keyboard / assistive technology ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Restrained reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
