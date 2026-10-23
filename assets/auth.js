// Optional sign-in with Supabase using an emailed sign-in link (no passwords).
// Everything works without an account; signing in makes the plan and daily usage follow the person
// across devices. If Supabase isn't configured (/api/config) or its library fails to load, none of
// the sign-in UI appears and the page behaves exactly as before.
(async () => {
  const $ = id => document.getElementById(id);
  const navSignin = $('nav-signin'), navAccount = $('nav-account'), navAvatar = $('nav-avatar');
  const signinDlg = $('signin'), accountDlg = $('account');
  const ask = $('signin-ask'), sent = $('signin-sent'), emailForm = $('signin-email');
  const emailInput = $('signin-address'), emailError = $('signin-error'), sendBtn = $('signin-send');
  const PLAN_LABEL = { free: 'Free plan', invited: 'Invited', pro: 'Pro' };
  const PLAN_CHIP = { free: 'bg-white/5 text-mist', invited: 'bg-teal/15 text-teal', pro: 'bg-royal/25 text-white' };

  let config;
  try { config = (await (await fetch('/api/config')).json()).auth; } catch {}
  if (!config || !window.supabase?.createClient) return;

  // Implicit flow: the emailed link carries the session back in the URL fragment, so it works in
  // whichever browser or mail app opens it. (PKCE would only finish in the browser that asked for
  // the link, and failed silently anywhere else.)
  const client = window.supabase.createClient(config.url, config.key, {
    auth: { flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  let session = null;
  window.slrAuth = { token: () => session?.access_token || null };

  // ---------- nav ----------
  const initial = email => (email || '?').trim().charAt(0).toUpperCase();
  function renderNav() {
    navSignin.hidden = !!session;
    navAccount.hidden = !session;
    if (session) navAvatar.textContent = $('account-avatar').textContent = initial(session.user.email);
    $('account-email').textContent = session?.user.email || '';
  }

  // Back from the emailed link: the library turns the URL into a session. Tidy the address bar and,
  // if Supabase reported a problem (in the query or the #fragment), say what happened.
  const AUTH_PARAMS = ['code', 'error', 'error_code', 'error_description', 'access_token', 'refresh_token',
    'expires_at', 'expires_in', 'token_type', 'type', 'provider_token'];
  function cleanUrl() {
    const url = new URL(location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const get = k => url.searchParams.get(k) || hash.get(k);
    if (!AUTH_PARAMS.some(k => url.searchParams.has(k) || hash.has(k))) return;
    const code = get('error_code'), problem = get('error_description');
    AUTH_PARAMS.forEach(k => { url.searchParams.delete(k); hash.delete(k); });
    const rest = hash.toString();
    history.replaceState(null, '', url.pathname + url.search + (rest ? '#' + rest : ''));
    if (!session && (code || problem)) {
      openSignin(code === 'otp_expired'
        ? 'That sign-in link has expired or was already used. Enter your email to get a new one.'
        : `Sign-in didn't finish (${problem || code}). Enter your email to get a new link.`);
    }
  }

  client.auth.onAuthStateChange((event, s) => {
    const changed = (session?.user.id || null) !== (s?.user.id || null);
    session = s;
    renderNav();
    if (event === 'INITIAL_SESSION') cleanUrl();
    if (changed) window.slrPage?.loadStatus();          // plan and usage now belong to this account
    if (event === 'SIGNED_IN' && signinDlg.open) signinDlg.close();
  });

  // ---------- sign-in dialog ----------
  function openSignin(message = '') {
    ask.hidden = false; sent.hidden = true;
    emailError.textContent = message;
    signinDlg.showModal();
    emailInput.focus();
  }
  const fail = msg => { emailError.textContent = msg; emailInput.setAttribute('aria-invalid', 'true'); emailInput.focus(); };
  const returnTo = () => location.origin + location.pathname;

  navSignin.addEventListener('click', () => openSignin());
  emailInput.addEventListener('input', () => { emailError.textContent = ''; emailInput.removeAttribute('aria-invalid'); });

  emailForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Enter your email address, like you@example.com.');
    sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: returnTo(), shouldCreateUser: true } });
    sendBtn.disabled = false; sendBtn.textContent = 'Email me a sign-in link';
    if (error) {
      // Supabase says which limit was hit: a per-address cooldown ("...after 42 seconds") or the
      // project-wide hourly cap on sign-in emails.
      const wait = /after (\d+) seconds?/i.exec(error.message || '');
      return fail(wait ? `A link was just sent to this address. You can request another in ${wait[1]} seconds.`
        : error.status === 429 ? 'Too many sign-in emails were sent in the last hour. Try again later, or use a link you already received.'
        : `Couldn't send the link. ${error.message}`);
    }
    $('signin-sent-to').textContent = email;
    ask.hidden = true; sent.hidden = false;
    sent.querySelector('[data-dialog-close]').focus();
  });
  $('signin-again').addEventListener('click', () => { openSignin(); emailInput.select(); });

  // ---------- account dialog ----------
  const accountPlan = $('account-plan'), accountUsage = $('account-usage'), leaveBtn = $('account-leave');
  document.addEventListener('slr:usage', ({ detail: u }) => {
    accountPlan.className = 'chip ' + PLAN_CHIP[u.plan];
    accountPlan.textContent = PLAN_LABEL[u.plan];
    accountUsage.textContent = u.plan !== 'free' ? 'Unlimited rewrites'
      : `${u.remaining} of ${u.limit} free rewrites left`;
    leaveBtn.hidden = u.plan !== 'invited';
  });

  navAccount.addEventListener('click', () => accountDlg.showModal());
  leaveBtn.addEventListener('click', () => window.slrPage?.leaveInvited());

  $('account-signout').addEventListener('click', async () => {
    const btn = $('account-signout');
    btn.disabled = true; btn.textContent = 'Signing out…';
    // Invited access saved on the account lasts until sign-out, so clear it first.
    if (window.slrPage?.plan() === 'invited') await window.slrPage.leaveInvited();
    await client.auth.signOut();
    btn.disabled = false; btn.textContent = 'Sign out';
    accountDlg.close();
  });

  // ---------- shared dialog behaviour ----------
  for (const dlg of [signinDlg, accountDlg]) {
    dlg.querySelectorAll('[data-dialog-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // dimmed backdrop
  }
})();
