/* Aether sub-pages — scroll reveal + nav shadow + filter chips + smooth TOC */
(function () {
  "use strict";
  function reveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }
  function nav() {
    var n = document.querySelector(".nav-inner");
    if (!n) return;
    function s() { n.classList.toggle("scrolled", window.scrollY > 40); }
    s(); window.addEventListener("scroll", s, { passive: true });
  }
  function filters() {
    var groups = document.querySelectorAll(".filters");
    groups.forEach(function (g) {
      var chips = g.querySelectorAll(".filter");
      chips.forEach(function (c) {
        c.addEventListener("click", function () {
          chips.forEach(function (o) { o.classList.remove("on"); });
          c.classList.add("on");
          var f = c.getAttribute("data-filter");
          document.querySelectorAll("[data-cat]").forEach(function (card) {
            var show = !f || f === "all" || card.getAttribute("data-cat") === f;
            card.style.display = show ? "" : "none";
          });
        });
      });
    });
  }
  function boot() { reveal(); nav(); filters(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
