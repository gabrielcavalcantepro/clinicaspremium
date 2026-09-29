/* ==========================================================================
   Clínicas Premium — Landing page
   ========================================================================== */

/*
  PONTO ÚNICO DE CONFIGURAÇÃO
  whatsappNumber: só dígitos, com 55 + DDD. Ex.: '5511999999999'.
  whatsappMessage: mensagem que já aparece escrita ao abrir a conversa.
    Usados pelo ícone do WhatsApp no cabeçalho e, por padrão, por TODOS os
    botões "Agendar diagnóstico gratuito".
  ctaUrl: opcional. Preencha só se os botões precisarem ir para outro destino
    (Calendly, formulário etc.). Vazio = botões vão para o WhatsApp.
  ctaNewTab: abre destinos externos em nova aba.

  Rastreamento: preencha os IDs para ativar. Vazio = não carrega nada.
*/
const CONFIG = {
  whatsappNumber: '',
  whatsappMessage: 'Olá! Quero agendar o diagnóstico gratuito da minha clínica.',
  ctaUrl: '',
  ctaNewTab: true,

  metaPixelId: '',              // ex.: '123456789012345'
  ga4Id: '',                    // ex.: 'G-XXXXXXXXXX'
  googleAdsId: '',              // ex.: 'AW-123456789'
  googleAdsConversionLabel: ''  // ex.: 'AbCdEfGhIjKlMnOp' (conversão do clique no CTA)
};

(function () {
  'use strict';

  /* ---------- Rastreamento (Meta Pixel, GA4, Google Ads) ---------- */

  function loadMetaPixel(id) {
    if (!id) return;
    /* Snippet oficial do Meta Pixel, sem alterações de comportamento */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  function loadGtag(ids) {
    const list = ids.filter(Boolean);
    if (!list.length) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(list[0]);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    list.forEach(function (id) { window.gtag('config', id); });
  }

  function trackCtaClick(position) {
    if (window.fbq) window.fbq('track', 'Lead', { content_name: 'Agendar diagnóstico gratuito' });
    if (window.gtag) {
      window.gtag('event', 'generate_lead', { cta_position: position });
      if (CONFIG.googleAdsId && CONFIG.googleAdsConversionLabel) {
        window.gtag('event', 'conversion', { send_to: CONFIG.googleAdsId + '/' + CONFIG.googleAdsConversionLabel });
      }
    }
  }

  loadMetaPixel(CONFIG.metaPixelId);
  loadGtag([CONFIG.ga4Id, CONFIG.googleAdsId]);

  /* ---------- Destinos: WhatsApp do cabeçalho e botões de CTA ---------- */

  const whatsappNumber = CONFIG.whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber
    ? 'https://wa.me/' + whatsappNumber + (CONFIG.whatsappMessage ? '?text=' + encodeURIComponent(CONFIG.whatsappMessage) : '')
    : '';
  const ctaUrl = CONFIG.ctaUrl.trim() || whatsappUrl;

  function bindLink(link, url, onClick) {
    if (url) {
      link.href = url;
      if (/^https?:\/\//i.test(url) && CONFIG.ctaNewTab) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
    }

    link.addEventListener('click', function (event) {
      onClick();
      if (!url) {
        event.preventDefault();
        console.warn('[Clínicas Premium] Defina CONFIG.whatsappNumber (ou CONFIG.ctaUrl) em script.js para ativar os links.');
      }
    });
  }

  document.querySelectorAll('[data-cta]').forEach(function (cta, index) {
    bindLink(cta, ctaUrl, function () {
      const section = cta.closest('section');
      trackCtaClick(section && section.id ? section.id : 'cta-' + (index + 1));
    });
  });

  document.querySelectorAll('[data-whatsapp]').forEach(function (link) {
    bindLink(link, whatsappUrl, function () {
      if (window.fbq) window.fbq('track', 'Contact');
      if (window.gtag) window.gtag('event', 'contact', { method: 'whatsapp', cta_position: 'header' });
    });
  });

  /* ---------- Menu mobile ---------- */

  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    links.classList.toggle('is-open', open);
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.nav')) setMenu(false);
    });
  }

  /* ---------- Link ativo na navegação ---------- */

  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  const sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Barras "Esforço máximo, retorno mínimo." carregando na entrada ---------- */

  const effort = document.querySelector('.effort');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (effort && !reduceMotion && 'IntersectionObserver' in window) {
    effort.classList.add('is-armed');

    const effortObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      effortObserver.disconnect();
      /* Dois frames garantem que o estado inicial foi pintado antes da transição */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { effort.classList.add('is-loaded'); });
      });
    }, { threshold: 0.45 });

    effortObserver.observe(effort);
  }

  /* ---------- Funil "Como funciona": etapas surgem com a rolagem ----------
     Cada etapa aparece primeiro só com o título e, na sequência, com o parágrafo.
     Desktop (seção cabe na tela): a seção inteira fica fixa enquanto a rolagem
     avança os 8 passos; depois do último, a página volta a rolar normalmente.
     Mobile ou tela baixa: sem fixar; cada etapa se revela ao entrar na tela. */

  const how = document.querySelector('.how');
  const track = document.querySelector('[data-funnel-track]');
  const funnel = how && how.querySelector('.funnel');
  const frame = how && how.querySelector('.how__frame');

  if (how && track && funnel && frame && !reduceMotion) {
    const steps = Array.prototype.slice.call(funnel.querySelectorAll('.funnel__step'));
    const REVEALS = steps.length * 2;   // título + parágrafo de cada etapa
    const STEP_SCROLL = 0.28;           // fração da altura da tela por passo
    const START_AT = 0.25;              // começa quando a seção chega a 25% do topo
    const STAGE_TOP = 88;               // espaço do cabeçalho flutuante
    let pinned = false;
    let ticking = false;

    function setRevealCount(count) {
      steps.forEach(function (step, i) {
        step.classList.toggle('is-in', count >= i * 2 + 1);
        step.classList.toggle('is-open', count >= i * 2 + 2);
      });
    }

    function layout() {
      const vh = window.innerHeight;

      /* Título centralizado na faixa até o parágrafo aparecer */
      steps.forEach(function (step) {
        const desc = step.querySelector('.funnel__desc');
        const offset = desc ? (desc.offsetHeight + parseFloat(getComputedStyle(desc).marginTop)) / 2 : 0;
        step.style.setProperty('--shift', offset + 'px');
      });

      /* Mede a seção no layout fixo e escala para caber na tela;
         abaixo de 85% o texto ficaria pequeno, então não fixa */
      how.classList.add('is-pinned');
      how.style.setProperty('--fit', '1');
      const cta = how.querySelector('.section-cta');
      const ctaSpace = cta ? cta.offsetHeight + parseFloat(getComputedStyle(cta).marginTop) : 0;
      const fit = Math.min(1, (vh - STAGE_TOP - 24 - ctaSpace) / frame.offsetHeight);
      pinned = window.innerWidth >= 720 && fit >= 0.85;

      how.classList.toggle('is-pinned', pinned);
      how.style.setProperty('--fit', pinned ? fit.toFixed(3) : '1');
      how.style.setProperty('--stage-top', STAGE_TOP + 'px');
      how.style.setProperty('--track-h', pinned ? Math.round(vh * (1 + STEP_SCROLL * (REVEALS + 1))) + 'px' : 'auto');
      update();
    }

    function update() {
      ticking = false;
      const vh = window.innerHeight;

      if (pinned) {
        const rect = track.getBoundingClientRect();
        const distance = rect.height - vh + vh * START_AT;
        const progress = (vh * START_AT - rect.top) / distance;
        /* REVEALS + 1 fatias: a última segura o funil completo antes de soltar */
        const count = progress <= 0 ? 0 : Math.min(REVEALS, Math.floor(progress * (REVEALS + 1)) + 1);
        setRevealCount(count);
      } else {
        steps.forEach(function (step) {
          const top = step.getBoundingClientRect().top;
          step.classList.toggle('is-in', top < vh * 0.88);
          step.classList.toggle('is-open', top < vh * 0.62);
        });
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    how.classList.add('is-animated');
    layout();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
  }

  /* ---------- Dúvidas frequentes: entrada em sequência e abrir/fechar suave ----------
     Sem JS ou com movimento reduzido, o <details> nativo funciona normalmente. */

  const faq = document.querySelector('.faq');
  const faqList = faq && faq.querySelector('.faq__list');

  if (faq && faqList && !reduceMotion) {
    const items = Array.prototype.slice.call(faqList.querySelectorAll('.faq__item'));

    /* Entrada: as perguntas surgem uma após a outra */
    if ('IntersectionObserver' in window) {
      items.forEach(function (item, i) { item.style.setProperty('--i', i); });
      faq.classList.add('is-animated');

      const faqObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        faqObserver.disconnect();
        faq.classList.add('is-visible');
      }, { threshold: 0.15 });

      faqObserver.observe(faqList);
    }

    /* Abrir e fechar com a altura animada */
    if ('animate' in Element.prototype) {
      const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

      items.forEach(function (item) {
        const summary = item.querySelector('summary');
        const answer = item.querySelector('.faq__a');
        let animation = null;

        summary.addEventListener('click', function (event) {
          event.preventDefault();

          /* Se clicar no meio de uma animação, continua da altura atual */
          const current = answer.getBoundingClientRect().height;
          if (animation) animation.cancel();

          const closing = item.open && !item.classList.contains('is-closing');

          if (closing) {
            item.classList.add('is-closing');
            animation = answer.animate(
              [{ height: current + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
              { duration: 320, easing: EASE }
            );
            animation.onfinish = function () {
              item.open = false;
              item.classList.remove('is-closing');
              animation = null;
            };
          } else {
            const from = item.open ? current : 0;
            item.classList.remove('is-closing');
            item.open = true;
            const to = answer.scrollHeight;
            animation = answer.animate(
              [{ height: from + 'px', opacity: from ? 1 : 0 }, { height: to + 'px', opacity: 1 }],
              { duration: 380, easing: EASE }
            );
            animation.onfinish = function () { animation = null; };
          }
        });
      });
    }
  }

  /* ---------- Player do case: estado vazio até o arquivo existir ---------- */

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    if (!video) return;

    function ready() { player.classList.remove('is-empty'); }

    if (video.readyState >= 1) ready();
    video.addEventListener('loadedmetadata', ready);
  });
})();
