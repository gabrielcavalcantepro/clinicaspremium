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
  whatsappNumber: '558598321549',   // (85) 9832-1549
  whatsappMessage: 'Olá, quero mais informações sobre os serviços de vocês',
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

  /* ---------- Fundo do hero: Magic Rings (React Bits) ----------
     Porte do componente <MagicRings /> (variante JS-CSS) para WebGL puro, sem
     React nem three.js. O shader é o original; a configuração abaixo é a mesma
     passada ao componente. Pausa fora da tela e com a aba oculta; com movimento
     reduzido, desenha um único quadro estático. */

  const MAGIC_RINGS = {
    color: '#cec293',
    colorTwo: '#cec293',
    ringCount: 6,
    speed: 1,
    attenuation: 10,
    lineThickness: 2,
    baseRadius: 0.35,
    radiusStep: 0.1,
    scaleRate: 0.1,
    opacity: 0.6,   // era 1: mais discreto, para o foco ficar no texto e no botão
    blur: 0,
    noiseAmount: 0.1,
    rotation: 0,
    ringGap: 1.5,
    fadeIn: 0.7,
    fadeOut: 0.5,
    followMouse: false,
    mouseInfluence: 0.2,
    hoverScale: 1.2,
    parallax: 0.05,
    clickBurst: false,
    alphaMode: 'luminance'
  };

  const RINGS_VERTEX = [
    'attribute vec2 position;',
    'void main() { gl_Position = vec4(position, 0.0, 1.0); }'
  ].join('\n');

  const RINGS_FRAGMENT = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform float uCoverageAlpha;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float coverage = 0.0;
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    float ringAmount = ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px);
    c = mix(c, rc, vec3(ringAmount));
    coverage = max(coverage, ringAmount);
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  float intensity = max(c.r, max(c.g, c.b));
  vec3 emissiveColor = intensity > 0.0001 ? clamp(c / intensity, 0.0, 1.0) : vec3(0.0);
  vec3 outputColor = mix(emissiveColor, clamp(c, 0.0, 1.0), uCoverageAlpha);
  float outputAlpha = mix(intensity, coverage, uCoverageAlpha);
  gl_FragColor = vec4(outputColor, clamp(outputAlpha * uOpacity, 0.0, 1.0));
}
`;

  /* Mesma conversão de cor do three.js (hex sRGB → espaço linear) */
  function hexToLinear(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  }

  function initMagicRings(mount, cfg) {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    }

    const vs = compile(gl.VERTEX_SHADER, RINGS_VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, RINGS_FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    /* Quadro que cobre a tela inteira */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    /* Mesma mistura do material transparente do three.js */
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const u = {};
    ['uTime', 'uAttenuation', 'uLineThickness', 'uBaseRadius', 'uRadiusStep', 'uScaleRate',
      'uOpacity', 'uNoiseAmount', 'uRotation', 'uRingGap', 'uFadeIn', 'uFadeOut',
      'uMouseInfluence', 'uHoverAmount', 'uHoverScale', 'uParallax', 'uBurst',
      'uCoverageAlpha', 'uResolution', 'uMouse', 'uColor', 'uColorTwo', 'uRingCount'
    ].forEach(function (name) { u[name] = gl.getUniformLocation(program, name); });

    /* Valores fixos da configuração */
    gl.uniform1f(u.uAttenuation, cfg.attenuation);
    gl.uniform1f(u.uLineThickness, cfg.lineThickness);
    gl.uniform1f(u.uBaseRadius, cfg.baseRadius);
    gl.uniform1f(u.uRadiusStep, cfg.radiusStep);
    gl.uniform1f(u.uScaleRate, cfg.scaleRate);
    gl.uniform1i(u.uRingCount, cfg.ringCount);
    gl.uniform1f(u.uOpacity, cfg.opacity);
    gl.uniform1f(u.uNoiseAmount, cfg.noiseAmount);
    gl.uniform1f(u.uRotation, (cfg.rotation * Math.PI) / 180);
    gl.uniform1f(u.uRingGap, cfg.ringGap);
    gl.uniform1f(u.uFadeIn, cfg.fadeIn);
    gl.uniform1f(u.uFadeOut, cfg.fadeOut);
    gl.uniform1f(u.uMouseInfluence, cfg.followMouse ? cfg.mouseInfluence : 0);
    gl.uniform1f(u.uHoverScale, cfg.hoverScale);
    gl.uniform1f(u.uParallax, cfg.parallax);
    gl.uniform1f(u.uCoverageAlpha, cfg.alphaMode === 'coverage' ? 1 : 0);
    gl.uniform3fv(u.uColor, hexToLinear(cfg.color));
    gl.uniform3fv(u.uColorTwo, hexToLinear(cfg.colorTwo));

    if (cfg.blur > 0) mount.style.filter = 'blur(' + cfg.blur + 'px)';
    mount.appendChild(canvas);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      if (reduceMotion) draw();
    }

    /* Mouse: o hero inteiro é a área de interação (o conteúdo fica por cima) */
    const area = mount.parentElement;
    const mouse = [0, 0];
    const smooth = [0, 0];
    let hovered = false;
    let hoverAmount = 0;
    let burst = 0;

    area.addEventListener('mousemove', function (e) {
      const rect = mount.getBoundingClientRect();
      mouse[0] = (e.clientX - rect.left) / rect.width - 0.5;
      mouse[1] = -((e.clientY - rect.top) / rect.height - 0.5);
    });
    area.addEventListener('mouseenter', function () { hovered = true; });
    area.addEventListener('mouseleave', function () { hovered = false; mouse[0] = 0; mouse[1] = 0; });
    area.addEventListener('click', function () { burst = 1; });

    let elapsed = reduceMotion ? 1.2 : 0;
    let lastT = 0;
    let frameId = 0;
    let visible = false;
    let covered = false;
    let pageVisible = !document.hidden;

    function draw() {
      gl.uniform1f(u.uTime, elapsed);
      gl.uniform2f(u.uMouse, smooth[0], smooth[1]);
      gl.uniform1f(u.uHoverAmount, hoverAmount);
      gl.uniform1f(u.uBurst, cfg.clickBurst ? burst : 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function animate(t) {
      frameId = requestAnimationFrame(animate);
      const dt = lastT === 0 ? 0 : Math.min(t - lastT, 100);
      lastT = t;
      elapsed += dt * 0.001 * cfg.speed;
      smooth[0] += (mouse[0] - smooth[0]) * 0.08;
      smooth[1] += (mouse[1] - smooth[1]) * 0.08;
      hoverAmount += ((hovered ? 1 : 0) - hoverAmount) * 0.08;
      burst *= 0.95;
      if (burst < 0.001) burst = 0;
      draw();
    }

    function start() {
      if (reduceMotion || !visible || covered || !pageVisible || frameId) return;
      lastT = 0;
      frameId = requestAnimationFrame(animate);
    }

    function stop() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    }

    resize();
    window.addEventListener('resize', resize);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mount);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(mount);
    } else {
      visible = true;
    }

    document.addEventListener('visibilitychange', function () {
      pageVisible = !document.hidden;
      if (pageVisible) start(); else stop();
    });

    if (reduceMotion) draw(); else start();

    return {
      /* Hero totalmente coberto pela seção seguinte: pausa o desenho */
      setCovered: function (value) {
        covered = value;
        if (covered) stop(); else start();
      }
    };
  }

  const ringsMount = document.querySelector('[data-magic-rings]');
  const rings = ringsMount ? initMagicRings(ringsMount, MAGIC_RINGS) : null;

  /* ---------- Hero fixo coberto pela seção 2 ----------
     O hero fica parado (position: sticky) e a seção do vídeo sobe por cima,
     com a borda em degradê. Logo no início da rolagem, título, parágrafo e
     botão sobem um pouco e somem juntos, no mesmo ritmo. */

  const hero = document.querySelector('.hero');
  const coverSection = document.getElementById('case');

  if (hero && coverSection) {
    const EXIT_SHARE = 0.3;    // a saída termina após rolar 30% da altura do hero
    let exitEnd = 1;
    let heroStart = 0;
    let heroTicking = false;

    function heroLayout() {
      const vh = window.innerHeight;
      const heroH = hero.offsetHeight;
      const stickScroll = Math.max(0, heroH - vh);
      /* Posição natural do hero (a do próprio hero muda enquanto ele está fixo) */
      heroStart = coverSection.offsetTop - heroH;
      hero.style.setProperty('--hero-stick', Math.min(0, vh - heroH) + 'px');

      /* Um único intervalo de saída para todos os elementos */
      exitEnd = Math.max(1, stickScroll + heroH * EXIT_SHARE);
      heroUpdate();
    }

    function heroUpdate() {
      heroTicking = false;
      const scrolled = window.scrollY - heroStart;

      if (!reduceMotion) {
        /* Definido no hero e herdado por título, parágrafo e botão */
        const out = Math.min(1, Math.max(0, scrolled / exitEnd));
        hero.style.setProperty('--out', out.toFixed(3));
      }

      const isCovered = coverSection.getBoundingClientRect().top <= 0;
      if (isCovered !== hero.classList.contains('is-covered')) {
        hero.classList.toggle('is-covered', isCovered);
        if (rings) rings.setCovered(isCovered);
      }
    }

    if (!reduceMotion) hero.classList.add('is-exit-ready');
    heroLayout();
    window.addEventListener('resize', heroLayout);
    window.addEventListener('scroll', function () {
      if (!heroTicking) {
        heroTicking = true;
        requestAnimationFrame(heroUpdate);
      }
    }, { passive: true });
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
