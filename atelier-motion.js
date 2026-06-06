/* ============================================================
   ATHER — Glass Atelier motion (ported from index.html)
   pinned hero→statement takeover · curtain-split reveal ·
   scroll reveals · counters · chart · accordion · pricing · form
   ============================================================ */
(function () {
  "use strict";
  var reduce = false;
  function ss(x, a, b) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* ---- scroll reveal (auto-tag a curated set) ---- */
  function initReveal() {
    var sel = ".sec-head, .chart-card, .results-foot, .svc-left, .svc-right, .qcard, .testi > div:first-child,"
      + " .phase, .member, .stat, .stat-cta, .price-select, .price-detail, .cs-card, .cs-photo, .cs-cta,"
      + " .qw-card, .ins-intro, .ins-card, .faq-box, .faq-contact, .contact-left, .form-card, .footer-grid > *, .wordmark, .svc-row";
    var els = [];
    document.querySelectorAll(sel).forEach(function (e) {
      if (e.closest("[data-scene]") || e.closest("[data-fold3]")) return; // own motion
      e.classList.add("reveal");
      els.push(e);
    });
    // stagger siblings within a grid/row
    [".phase-row", ".team-grid", ".stat-grid", ".qw-grid", ".ins-grid", ".svc-list"].forEach(function (g) {
      document.querySelectorAll(g).forEach(function (grid) {
        var i = 0;
        Array.prototype.forEach.call(grid.children, function (c) {
          if (c.classList.contains("reveal")) { c.style.setProperty("--d", (i * 0.07) + "s"); i++; }
        });
      });
    });
    if (!("IntersectionObserver" in window) || document.body.classList.contains("no-motion")) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: "0px 0px -7% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = el.hasAttribute("data-decimals") ? +el.getAttribute("data-decimals") : (target % 1 ? 1 : 0);
    if (document.body.classList.contains("no-motion")) { el.textContent = target.toFixed(dec); return; }
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window)) { els.forEach(animateCount); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- chart bars ---- */
  function initChart() {
    var bars = document.querySelectorAll("[data-bar]");
    if (!bars.length) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.width = e.target.getAttribute("data-bar") + "%"; io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { io.observe(b); });
  }

  /* ---- nav shadow on scroll ---- */
  function initNav() {
    var n = document.querySelector(".nav-inner");
    if (!n) return;
    function s() { n.classList.toggle("scrolled", window.scrollY > 40); }
    s(); window.addEventListener("scroll", s, { passive: true });
  }

  /* ---- FAQ accordion + group tabs ---- */
  function initFAQ() {
    var box = document.querySelector(".faq-box");
    if (!box) return;
    var items = [].slice.call(box.querySelectorAll(".faq-item"));
    var tabs = [].slice.call(box.querySelectorAll(".faq-tab"));

    function setIcon(it) {
      var ic = it.querySelector(".ic");
      if (ic) ic.textContent = it.classList.contains("open") ? "−" : "+";
    }
    items.forEach(function (it) {
      var q = it.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = it.classList.contains("open");
        // close others within the same visible group
        items.forEach(function (o) { if (o.style.display !== "none") { o.classList.remove("open"); setIcon(o); } });
        if (!wasOpen) { it.classList.add("open"); }
        setIcon(it);
      });
    });

    function showGroup(group) {
      var firstShown = null;
      items.forEach(function (it) {
        var match = it.getAttribute("data-group") === group;
        it.style.display = match ? "" : "none";
        it.classList.remove("open");
        setIcon(it);
        if (match && !firstShown) firstShown = it;
      });
      if (firstShown) { firstShown.classList.add("open"); setIcon(firstShown); }
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (o) { o.classList.remove("active"); });
        t.classList.add("active");
        showGroup(t.getAttribute("data-group"));
      });
    });

    // initial: show the active tab's group (default General)
    var active = box.querySelector(".faq-tab.active") || tabs[0];
    if (active) showGroup(active.getAttribute("data-group"));
  }

  /* ---- pricing toggle ---- */
  function initPricing() {
    var rows = document.querySelectorAll(".plan-row");
    var panels = document.querySelectorAll(".price-detail");
    if (!rows.length) return;
    rows.forEach(function (r) {
      r.addEventListener("click", function () {
        var k = r.getAttribute("data-plan");
        rows.forEach(function (x) { x.classList.toggle("sel", x === r); });
        panels.forEach(function (p) { p.classList.toggle("show", p.getAttribute("data-plan") === k); });
      });
    });
  }

  /* ---- contact form ---- */
  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.querySelectorAll(".chip[data-toggle]").forEach(function (c) { c.addEventListener("click", function () { c.classList.toggle("accent"); }); });
    form.querySelectorAll(".seg").forEach(function (s) {
      s.addEventListener("click", function () { s.parentNode.querySelectorAll("span").forEach(function (o) { o.classList.remove("on"); }); s.classList.add("on"); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("input[required], textarea[required]").forEach(function (f) {
        var valid = f.value.trim().length > 1 && (f.type !== "email" || /.+@.+\..+/.test(f.value));
        f.closest(".field").classList.toggle("err", !valid); if (!valid) ok = false;
      });
      if (ok) form.closest(".form-card").classList.add("sent");
    });
  }

  /* ---- newsletter ---- */
  function initNews() {
    var f = document.getElementById("news-form");
    if (!f) return;
    f.addEventListener("submit", function (e) { e.preventDefault(); f.classList.add("done"); });
  }

  /* ---- pinned scene (1→2) + curtain (3→4) + parallax ---- */
  function initScene() {
    var scene = document.querySelector("[data-scene]");
    var heroLayer = document.querySelector('[data-layer="hero"]');
    var stLayer = document.querySelector('[data-layer="statement"]');
    var heroContent = heroLayer ? heroLayer.querySelector(".wrap") : null;
    var heroOrbs = heroLayer ? heroLayer.querySelectorAll(".orb") : [];
    var stContent = stLayer ? stLayer.querySelector(".band") : null;
    var stOrb = stLayer ? stLayer.querySelector(".orb") : null;
    var fold3 = document.querySelector("[data-fold3]");
    var l1 = document.querySelector(".wc-line-1"), l2 = document.querySelector(".wc-line-2");
    var wcCards = fold3 ? fold3.querySelector(".wc-cards") : null;
    var wcOrb = fold3 ? fold3.querySelector(".wc-orb") : null;
    var ticking = false;

    function reset() {
      [heroContent, stContent, l1, l2, wcCards, wcOrb].forEach(function (e) { if (e) { e.style.transform = ""; e.style.opacity = ""; } });
      heroOrbs.forEach(function (o) { o.style.transform = ""; });
      if (stOrb) stOrb.style.transform = "translateX(-50%)";
      if (heroLayer) { heroLayer.style.opacity = ""; heroLayer.style.pointerEvents = ""; }
      if (stLayer) { stLayer.style.opacity = ""; stLayer.style.pointerEvents = ""; }
    }

    function update() {
      ticking = false;
      if (document.body.classList.contains("no-motion")) { reset(); return; }
      var vh = window.innerHeight;
      if (scene && heroLayer && stLayer) {
        if (window.innerWidth <= 980) {
          [heroContent, stContent].forEach(function (e) { if (e) { e.style.transform = ""; e.style.opacity = ""; } });
          heroOrbs.forEach(function (o) { o.style.transform = ""; });
          if (stOrb) stOrb.style.transform = "translateX(-50%)";
          heroLayer.style.opacity = ""; heroLayer.style.pointerEvents = "";
          stLayer.style.opacity = ""; stLayer.style.pointerEvents = "";
        } else {
        var sr = scene.getBoundingClientRect();
        var total = scene.offsetHeight - vh;
        var p = total > 0 ? Math.min(Math.max(-sr.top, 0), total) / total : 0;
        var he = ss(p, 0, 0.5);
        if (heroContent) { heroContent.style.transform = "translateY(" + (-he * 80) + "px) scale(" + (1 - he * 0.08) + ")"; heroContent.style.opacity = 1 - he; }
        heroOrbs.forEach(function (o, i) { o.style.transform = "translateY(" + (p * (i ? -210 : -150)) + "px)"; });
        heroLayer.style.opacity = 1 - ss(p, 0.42, 0.7);
        heroLayer.style.pointerEvents = p > 0.3 ? "none" : "auto";
        var se = ss(p, 0.34, 0.72);
        stLayer.style.opacity = se;
        stLayer.style.pointerEvents = se > 0.5 ? "auto" : "none";
        if (stContent) { stContent.style.transform = "translateY(" + ((1 - se) * 70) + "px) scale(" + (0.9 + se * 0.1) + ")"; stContent.style.opacity = se; }
        if (stOrb) stOrb.style.transform = "translateX(-50%) scale(" + (0.7 + se * 0.4) + ")";
        }
      }
      if (fold3 && l1 && l2) {
        if (window.innerWidth <= 980) {
          l1.style.transform = ""; l2.style.transform = ""; l1.style.opacity = ""; l2.style.opacity = "";
          if (wcCards) { wcCards.style.opacity = ""; wcCards.style.transform = ""; }
          if (wcOrb) wcOrb.style.transform = "";
        } else {
          var r = fold3.getBoundingClientRect();
          var t3 = fold3.offsetHeight - vh;
          var p3 = t3 > 0 ? Math.min(Math.max(-r.top, 0), t3) / t3 : 0;
          var sp = ss(p3, 0, 0.5);
          l1.style.transform = "translateX(" + (-sp * 150) + "%)";
          l2.style.transform = "translateX(" + (sp * 150) + "%)";
          var lf = 1 - ss(p3, 0.12, 0.46);
          l1.style.opacity = lf; l2.style.opacity = lf;
          var cp = ss(p3, 0.32, 0.7);
          if (wcCards) { wcCards.style.opacity = cp; wcCards.style.transform = "translateY(" + ((1 - cp) * 54) + "px) scale(" + (0.94 + cp * 0.06) + ")"; }
          if (wcOrb) wcOrb.style.transform = "scale(" + (1 + p3 * 0.5) + ")";
        }
      }
    }
    function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return update;
  }

  /* ---- services: pinned card-deck that shuffles on scroll ---- */
  function initServices() {
    var sec = document.querySelector("[data-svcdeck]");
    if (!sec) return;
    var cards = sec.querySelectorAll(".svc-card");
    var now = sec.querySelector(".svc-now");
    var bar = sec.querySelector(".svc-bar i");
    var n = cards.length;
    var ticking = false;
    function clear() {
      cards.forEach(function (c) { c.style.transform = ""; c.style.opacity = ""; c.style.zIndex = ""; c.style.pointerEvents = ""; });
    }
    function upd() {
      ticking = false;
      if (window.innerWidth <= 980 || document.body.classList.contains("no-motion")) {
        clear();
        if (now) now.textContent = "01";
        if (bar) bar.style.width = (100 / n) + "%";
        return;
      }
      var vh = window.innerHeight;
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - vh;
      var p = total > 0 ? Math.min(Math.max(-r.top, 0), total) / total : 0;
      var f = p * (n - 1);
      var active = Math.round(f);
      cards.forEach(function (c, i) {
        var rel = i - f;                     // <0 leaving, 0 active, >0 stacked behind
        var x, y, rot, sc, op, z;
        if (rel < 0) {                       // sliding off to the left, rotating
          var t = Math.min(1, -rel / 0.62);
          x = -t * 128; y = t * -10; rot = -t * 13; sc = 1 - t * 0.06; op = 1 - t;
          z = 200 - i;
        } else {                             // stacked behind the active card
          var d = Math.min(rel, 3);
          x = d * 4; y = d * 18; rot = d * 3.2; sc = 1 - d * 0.05;
          op = rel > 3.1 ? 0 : 1 - d * 0.14;
          z = Math.round(100 - rel * 10);
        }
        c.style.transform = "translate3d(" + x + "%," + y + "px,0) rotate(" + rot + "deg) scale(" + sc + ")";
        c.style.opacity = op;
        c.style.zIndex = z;
        c.style.pointerEvents = (Math.abs(rel) < 0.5) ? "auto" : "none";
      });
      if (now) now.textContent = ("0" + (active + 1)).slice(-2);
      if (bar) bar.style.width = (((active + 1) / n) * 100) + "%";
    }
    function onScroll() { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    upd();
  }

  /* ---- process: horizontal card accordion, scroll-driven (desktop) / IO (mobile) ---- */
  function initPhases() {
    var sec = document.querySelector("[data-phasescroll]");
    if (!sec) return;
    var cards = [].slice.call(sec.querySelectorAll(".pcard"));
    var n = cards.length;
    if (!n) return;
    function setActive(idx) {
      cards.forEach(function (c, i) { c.classList.toggle("active", i === idx); });
    }
    var io = null;
    function setupIO() {
      if (io) { io.disconnect(); io = null; }
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(cards.indexOf(en.target)); });
      }, { rootMargin: "-46% 0px -46% 0px", threshold: 0 });
      cards.forEach(function (c) { io.observe(c); });
    }
    var ticking = false, mobile = null;
    function upd() {
      ticking = false;
      var isMobile = window.innerWidth <= 980;
      if (isMobile !== mobile) {            // mode switch
        mobile = isMobile;
        if (isMobile) setupIO();
        else if (io) { io.disconnect(); io = null; }
      }
      if (isMobile) return;                 // IO handles mobile
      var vh = window.innerHeight;
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - vh;
      var p = total > 0 ? Math.min(Math.max(-r.top, 0), total) / total : 0;
      var idx = Math.min(n - 1, Math.floor(p * n * 0.999));
      setActive(idx);
    }
    function onScroll() { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    upd();
  }

  function boot() {
    initReveal(); initCounters(); initChart(); initNav(); initFAQ(); initPricing(); initForm(); initNews();
    initServices(); initPhases();
    var refresh = initScene();
    window.__aether = { refresh: refresh };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
