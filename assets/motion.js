// Motion layer for the home page, built on GSAP + ScrollTrigger + SplitText.
// Pure enhancement: it only animates transform and opacity, never touches the page's own
// behaviour, and is skipped entirely (page shown as-is) if GSAP is missing or the visitor
// prefers reduced motion. gsap.matchMedia() reverts everything if that preference changes.
(() => {
  const root = document.documentElement;
  const showPage = () => root.classList.remove('motion');
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return showPage();

  gsap.registerPlugin(ScrollTrigger, SplitText);
  // One easing family for the whole site: fast start, long soft settle (matches --ease-out in CSS).
  gsap.defaults({ ease: 'power4.out', duration: 1 });

  const $ = s => document.querySelector(s);
  const $$ = s => gsap.utils.toArray(s);
  const mm = gsap.matchMedia();
  // Scroll zones for reveals: elements play in inside ENTER and reset once outside AWAY (fully off screen).
  const ENTER = { start: 'top 88%', end: 'bottom 12%' };
  const AWAY = { start: 'top bottom', end: 'bottom top' };

  mm.add('(prefers-reduced-motion: no-preference)', ctx => {
    heroIntro(ctx);
    sectionReveals();
    finalCta();
  });
  mm.add('(prefers-reduced-motion: reduce)', showPage);

  // Parallax only on large screens, where there is room for depth to read as depth.
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', parallax);

  // ---------- 1. The one orchestrated moment: the hero assembles itself ----------
  function heroIntro(ctx) {
    const title = $('[data-hero-in="title"]');
    const support = $$('[data-hero-in]:not([data-hero-in="title"]):not([data-hero-in="demo"])');
    const demo = $('[data-hero-in="demo"]');
    gsap.set([title, ...support, demo], { autoAlpha: 0 });
    showPage(); // GSAP now holds them hidden; CSS can let go

    // Split into lines only once the display font is in, or line breaks would be wrong.
    const fontsReady = Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 900))]);
    fontsReady.then(() => ctx.add(() => {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
      gsap.timeline({ onComplete: () => split.revert() }) // hand the heading back to normal text flow
        .set(title, { autoAlpha: 1 })
        .from(split.lines, { yPercent: 110, duration: 1.15, stagger: 0.1 }, 0)
        .fromTo(demo, { autoAlpha: 0, y: 48, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.3, clearProps: 'transform' }, 0.25)
        .fromTo(support, { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, clearProps: 'transform' }, 0.45);
    }));
  }

  // ---------- 2. Scroll reveals: each section's intro, then its cards in a short stagger ----------
  // Replays every time an element comes into view, in either direction: scrolling down it rises into
  // place, scrolling up it drops in from above with the stagger reversed. Each element has its own
  // trigger (so tall stacked groups on phones behave), and ScrollTrigger.batch staggers the ones that
  // arrive together. An element is reset only once it is completely off screen, so nothing ever
  // disappears in view. Fades use opacity, not visibility, so screen readers still reach everything.
  function onScrollIn(trigger, show, hide) {
    hide();
    ScrollTrigger.create({ trigger, ...ENTER, onEnter: () => show(1), onEnterBack: () => show(-1) });
    ScrollTrigger.create({ trigger, ...AWAY, onLeave: hide, onLeaveBack: hide });
  }

  function reveal(targets, { y = 32, duration = 1.05, stagger = 0.1, ease = 'power4.out' } = {}) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    const show = dir => batch => gsap.fromTo(batch, { opacity: 0, y: dir * y }, {
      opacity: 1, y: 0, duration, ease, overwrite: true,
      stagger: { each: stagger, from: dir > 0 ? 'start' : 'end' },
      clearProps: 'transform', // give transforms back to CSS hover states afterwards
    });
    const hide = batch => gsap.set(batch, { opacity: 0, overwrite: true });
    hide(els);
    ScrollTrigger.batch(els, { ...ENTER, onEnter: show(1), onEnterBack: show(-1) });
    ScrollTrigger.batch(els, { ...AWAY, onLeave: hide, onLeaveBack: hide });
  }

  function sectionReveals() {
    // Section intros (heading + its lead paragraph), top to bottom so triggers refresh in page order.
    $$('main > section:not(:first-child):not([data-final-cta]) h2').forEach(h2 => {
      const lead = h2.nextElementSibling?.tagName === 'P' ? h2.nextElementSibling : null;
      reveal([h2, lead].filter(Boolean), { y: 24, stagger: 0.12 });
    });

    reveal('#how .step-card', { stagger: 0.14 });
    reveal('#ex-tabs', { y: 16 });
    reveal('#ex-panel > *', { stagger: 0.14 });
    reveal('#ex-notes', { y: 12, duration: 0.8 });
    // Cliché chips arrive just before the existing strike-through runs over them. The chips carry
    // inline transition-delays meant for their ::after strike line; on the chip itself those delays
    // would hold back GSAP's opacity frames, so transitions are switched off for the chip only.
    gsap.set('#cliches li', { transitionProperty: 'none' });
    reveal('#cliches li', { y: 14, duration: 0.7, stagger: 0.035, ease: 'back.out(1.6)' });
    // The strike-through is redrawn each time the row comes back: cleared off screen, re-applied as it lands.
    const cliches = $('#cliches');
    let strike;
    onScrollIn(cliches,
      () => { strike?.kill(); strike = gsap.delayedCall(0.35, () => cliches.classList.add('struck')); },
      () => { strike?.kill(); cliches.classList.remove('struck'); });
    reveal('#reviews .review', { stagger: 0.12 });
    reveal('[data-plan-card]', { y: 40, stagger: 0.13 });
    reveal('#faq details', { y: 16, duration: 0.8, stagger: 0.07 });

    // Late content (plan row, web fonts) changes page height; keep trigger positions honest.
    let t;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); })
      .observe(document.body);
  }

  // ---------- 3. Closing call to action: the mark lands, then the line ----------
  function finalCta() {
    const sec = $('[data-final-cta]');
    if (!sec) return;
    const mark = sec.querySelector('img'), lines = gsap.utils.toArray(sec.querySelectorAll('h2, p, [data-cta]'));
    let tl;
    onScrollIn(sec,
      dir => {
        tl?.kill();
        tl = gsap.timeline()
          .fromTo(mark, { opacity: 0, scale: 0.6, rotation: -12 },
            { opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: 'back.out(1.7)' })
          .fromTo(lines, { opacity: 0, y: dir * 26 },
            { opacity: 1, y: 0, stagger: { each: 0.1, from: dir > 0 ? 'start' : 'end' }, clearProps: 'transform' }, '-=0.75');
      },
      () => { tl?.kill(); gsap.set([mark, ...lines], { opacity: 0 }); });
  }

  // ---------- 4. Subtle parallax (desktop): layers drift at different speeds ----------
  function parallax() {
    const hero = $('main > section:first-child');
    const drift = (target, trigger, from, to, vars = {}) => gsap.fromTo(target, { y: from }, {
      y: to, ease: 'none', ...vars,
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    });
    // Hero copy lags behind the scroll while the rewriter card moves slightly ahead of it.
    gsap.to('[data-hero-copy]', { y: 70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 } });
    gsap.to('#demo .tool', { y: -28, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 } });
    // The big step numbers float behind the cards.
    $$('#how .step-card .font-display').forEach((n, i) => drift(n, '#how', 18 + i * 6, -18 - i * 6));
  }
})();
