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

  /* ---------- Player do case: estado vazio até o arquivo existir ---------- */

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    if (!video) return;

    function ready() { player.classList.remove('is-empty'); }

    if (video.readyState >= 1) ready();
    video.addEventListener('loadedmetadata', ready);
  });
})();
