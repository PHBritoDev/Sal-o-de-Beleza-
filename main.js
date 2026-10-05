(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* WhatsApp e Instagram */
  if (S.whatsapp) {
    var wa = "https://wa.me/" + String(S.whatsapp).replace(/\D/g, "") +
      (S.whatsappMensagem ? "?text=" + encodeURIComponent(S.whatsappMensagem) : "");
    $$("[data-wa]").forEach(function (a) { a.href = wa; });
  }
  var insta = $("#insta");
  if (insta && S.instagram) insta.href = S.instagram;

  /* Ano */
  var ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* Serviços */
  var sv = $("#services");
  if (sv && S.servicos) {
    sv.innerHTML = S.servicos.map(function (s, i) {
      return '<article class="svc svc--' + (i % 3) + '"><h3>' + esc(s.nome) + "</h3><p>" + esc(s.texto) + "</p></article>";
    }).join("");
  }

  /* Galeria */
  var gal = $("#gallery");
  var items = S.galeria || [];
  if (gal) {
    gal.innerHTML = items.map(function (g, i) {
      return '<button type="button" class="shot" data-i="' + i + '" aria-label="Ampliar: ' + esc(g.legenda) + '">' +
        '<img src="' + esc(g.src) + '" alt="' + esc(g.legenda) + '" loading="lazy" width="800" height="1000">' +
        "<span>" + esc(g.legenda) + "</span></button>";
    }).join("");
    $$("img", gal).forEach(function (img) {
      img.addEventListener("error", function () { img.closest(".shot").classList.add("shot--off"); });
    });
  }

  /* Lightbox */
  var lb = $("#lb"), lbi = $("#lbi"), lbc = $("#lbc"), last = null, cur = 0;
  function openLb(i) {
    var g = items[i]; if (!g) return; cur = i;
    lbi.src = g.src; lbi.alt = g.legenda; lbc.textContent = g.legenda;
    lb.hidden = false; document.body.classList.add("lock");
    last = document.activeElement; $("#lbx").focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.classList.remove("lock"); lbi.removeAttribute("src");
    if (last && last.focus) last.focus();
  }
  if (gal) gal.addEventListener("click", function (e) {
    var b = e.target.closest(".shot"); if (b) openLb(+b.getAttribute("data-i"));
  });
  $("#lbx").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });

  /* Menu mobile */
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("lock", open);
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) setMenu(false); });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!lb.hidden) closeLb(); else if (menu.classList.contains("open")) setMenu(false);
  });

  function step(d) {
    if (items.length < 2) return;
    cur = (cur + d + items.length) % items.length;
    lbi.src = items[cur].src; lbi.alt = items[cur].legenda; lbc.textContent = items[cur].legenda;
  }
  $("#lbp").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  $("#lbn").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* Endereço, horário e mapa (só aparecem se preenchidos no config) */
  var info = $("#info"), c = S.contato || {}, rows = [];
  if (c.endereco) rows.push("<div><h3>Endereço</h3><p>" + esc(c.endereco) + "</p></div>");
  if (c.horario) rows.push("<div><h3>Horário</h3><p>" + esc(c.horario) + "</p></div>");
  if (c.mapa && /^https?:\/\//i.test(c.mapa)) rows.push('<div><h3>Localização</h3><p><a href="' + esc(c.mapa) + '" target="_blank" rel="noopener">Abrir no mapa</a></p></div>');
  if (info && rows.length) { info.innerHTML = rows.join(""); info.hidden = false; }

  /* Cabeçalho ao rolar */
  var header = $(".header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
