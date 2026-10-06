/* ==========================================================================
   DROGARIA PEDROSO — script.js
   JavaScript puro, sem bibliotecas. Cada bloco é independente.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURAÇÃO — edite aqui para mudar número, mensagem ou endereço
     ------------------------------------------------------------------ */
  const CONFIG = {
    whatsappNumber: '5515996775787', // DDI + DDD + número, só dígitos
    whatsappMessage: 'Olá! Vim pelo site da Drogaria Pedroso e gostaria de fazer um pedido.',
    mapsQuery: 'Rod. Faustino Daniel da Silva, 419, Amarela Velha, Itapeva, SP',
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  /* ------------------------------------------------------------------
     1. Links de WhatsApp e mapa (todos os elementos com data-whatsapp / data-maps)
     ------------------------------------------------------------------ */
  const whatsappUrl =
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;

  $$('[data-whatsapp]').forEach((a) => { a.href = whatsappUrl; });
  $$('[data-maps]').forEach((a) => { a.href = mapsUrl; });

  /* ------------------------------------------------------------------
     2. Navbar: muda de aparência ao rolar
     ------------------------------------------------------------------ */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. Menu hambúrguer (celular / tablet)
     ------------------------------------------------------------------ */
  const toggle = $('.nav-toggle');
  const nav = $('#menu');

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(min-width: 1080px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ------------------------------------------------------------------
     4. Link ativo no menu conforme a seção visível
     ------------------------------------------------------------------ */
  const navLinks = $$('.nav__link');
  const linkById = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const setCurrent = (id) => {
    navLinks.forEach((a) => a.removeAttribute('aria-current'));
    const link = linkById.get(id);
    if (link) link.setAttribute('aria-current', 'true');
  };

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    $$('main section[id]').forEach((s) => sectionObserver.observe(s));
  }

  /* ------------------------------------------------------------------
     5. Animação de entrada (fade-in ao rolar)
     ------------------------------------------------------------------ */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     6. FAQ (accordion)
     ------------------------------------------------------------------ */
  $$('.faq__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(willOpen));
      btn.closest('.faq__item').classList.toggle('is-open', willOpen);
    });
  });

  /* ------------------------------------------------------------------
     7. Carrossel de depoimentos
     ------------------------------------------------------------------ */
  $$('[data-carousel]').forEach((root) => {
    const track = $('.carousel__track', root);
    const prev = $('[data-prev]', root);
    const next = $('[data-next]', root);

    const step = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return card.getBoundingClientRect().width + gap;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: scrollBehavior });

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });
    track.addEventListener('scroll', () => window.requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ------------------------------------------------------------------
     8. Galeria + lightbox (usa <dialog> nativo)
     ------------------------------------------------------------------ */
  const dialog = $('#lightbox');
  const items = $$('[data-lightbox]');

  if (dialog && typeof dialog.showModal === 'function' && items.length) {
    const imgEl = $('.lightbox__img', dialog);
    const capEl = $('.lightbox__caption', dialog);
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const btn = items[index];
      const img = $('img', btn);
      imgEl.src = btn.dataset.full || img.currentSrc || img.src;
      imgEl.alt = img.alt;
      capEl.textContent = `${btn.dataset.caption || ''} (${index + 1} de ${items.length})`;
    };

    items.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        opener = btn;
        show(i);
        dialog.showModal();
      });
    });

    $('.lightbox__prev', dialog).addEventListener('click', () => show(index - 1));
    $('.lightbox__next', dialog).addEventListener('click', () => show(index + 1));
    $('.lightbox__close', dialog).addEventListener('click', () => dialog.close());

    // Clique no fundo escuro fecha
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

    // Setas do teclado
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    // Gesto de arrastar no celular
    let startX = null;
    dialog.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    // Devolve o foco ao botão que abriu
    dialog.addEventListener('close', () => { if (opener) opener.focus(); });
  }

  /* ------------------------------------------------------------------
     9. Ano do copyright
     ------------------------------------------------------------------ */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
