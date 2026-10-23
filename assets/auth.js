// Optional accounts with Supabase: create an account, sign in and out with email and password,
// reset a forgotten password, delete the account. Everything works without an account; signing in
// makes the plan and daily usage follow the person across devices. If Supabase isn't configured
// (/api/config) or its library fails to load, none of this UI appears and the page works as before.
(async () => {
  const $ = id => document.getElementById(id);
  const navSignin = $('nav-signin'), navAccount = $('nav-account'), navAvatar = $('nav-avatar');
  const signinDlg = $('signin'), accountDlg = $('account');
  const views = { form: $('auth-form'), forgot: $('auth-forgot'), note: $('auth-note'), reset: $('auth-reset') };
  const PLAN_LABEL = { free: 'Free plan', invited: 'Invited', pro: 'Pro' };
  const PLAN_CHIP = { free: 'bg-white/5 text-mist', invited: 'bg-teal/15 text-teal', pro: 'bg-royal/25 text-white' };
  const MIN_PASSWORD = 8;

  let config;
  try { config = (await (await fetch('/api/config')).json()).auth; } catch {}
  if (!config || !window.supabase?.createClient) return;

  // Implicit flow: emailed links (password reset, optional email confirmation) carry the session back
  // in the URL fragment, so they work in whichever browser or mail app opens them.
  const client = window.supabase.createClient(config.url, config.key, {
    auth: { flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  let session = null;
  let keepOpen = false; // an invited sign-up keeps the dialog open to confirm the code was saved
  window.slrAuth = { token: () => session?.access_token || null };

  // Supabase's messages, in plain words.
  function friendly(error) {
    const m = String(error?.message || '').toLowerCase();
    if (error?.status === 429 || m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a few minutes and try again.';
    if (m.includes('invalid login credentials')) return 'Email or password is incorrect.';
    if (m.includes('email not confirmed')) return 'Confirm your email first: open the link we sent when you created the account.';
    if (m.includes('already registered') || m.includes('already exists')) return 'An account with this email already exists. Sign in instead.';
    if (m.includes('password')) return `Choose a stronger password: at least ${MIN_PASSWORD} characters.`;
    if (m.includes('signups not allowed') || m.includes('signup is disabled')) return "Creating accounts isn't available right now.";
    if (m.includes('fetch') || m.includes('network')) return "Couldn't reach the sign-in service. Check your connection and try again.";
    return error?.message || 'Something went wrong. Try again.';
  }
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  function busyBtn(btn, on, label) { btn.disabled = on; if (label) btn.textContent = label; }

  // ---------- nav ----------
  const initial = email => (email || '?').trim().charAt(0).toUpperCase();
  function renderNav() {
    navSignin.hidden = !!session;
    navAccount.hidden = !session;
    if (session) navAvatar.textContent = $('account-avatar').textContent = initial(session.user.email);
    $('account-email').textContent = session?.user.email || '';
  }

  // Back from an emailed link: tidy the address bar and explain any problem Supabase reported.
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
      openAuth('signin', code === 'otp_expired'
        ? 'That link has expired or was already used. Sign in, or reset your password again.'
        : `That didn't work (${problem || code}). Try again.`);
    }
  }

  client.auth.onAuthStateChange((event, s) => {
    const changed = (session?.user.id || null) !== (s?.user.id || null);
    session = s;
    renderNav();
    if (event === 'INITIAL_SESSION') cleanUrl();
    if (changed) window.slrPage?.loadStatus();   // plan and usage now belong to this account (or none)
    if (event === 'PASSWORD_RECOVERY') { cleanUrl(); show('reset'); if (!signinDlg.open) signinDlg.showModal(); $('reset-password').focus(); }
    else if (event === 'SIGNED_IN' && signinDlg.open && views.reset.hidden && !keepOpen) signinDlg.close();
  });

  // ---------- sign in / create account ----------
  const form = views.form, emailIn = $('auth-email'), passIn = $('auth-password'), errorEl = $('auth-error');
  const submitBtn = $('auth-submit');
  const MODES = {
    signin: { title: 'Sign in', lead: 'Welcome back. Your plan and daily rewrites follow you to any device.',
      submit: 'Sign in', switchText: "Don't have an account?", switchBtn: 'Create one', autocomplete: 'current-password' },
    register: { title: 'Create your account', lead: 'Free, and optional. Your plan and daily rewrites then follow you to any device.',
      submit: 'Create account', switchText: 'Already have an account?', switchBtn: 'Sign in', autocomplete: 'new-password' },
    invited: { title: 'Create your invited account', lead: 'Register with your invite code to get unlimited rewrites, saved to your account on every device.',
      submit: 'Create account', switchText: 'Already have an account?', switchBtn: 'Sign in', autocomplete: 'new-password' },
  };
  function show(name) {
    Object.entries(views).forEach(([k, el]) => { el.hidden = k !== name; });
    views.note.querySelector('[data-auth-back]').hidden = !!session; // nothing to go back to once signed in
  }
  function setMode(mode) {
    const m = MODES[mode];
    form.dataset.mode = mode;
    $('signin-title').textContent = m.title;
    $('auth-lead').textContent = m.lead;
    submitBtn.textContent = m.submit;
    $('auth-switch-text').textContent = m.switchText;
    $('auth-switch').textContent = m.switchBtn;
    $('auth-forgot-open').hidden = mode !== 'signin';
    $('auth-hint').hidden = mode === 'signin';
    $('auth-invite').hidden = mode !== 'invited';
    $('auth-invite-toggle-wrap').hidden = mode !== 'register';
    passIn.autocomplete = m.autocomplete;
    errorEl.textContent = '';
  }
  function openAuth(mode = 'signin', message = '') {
    setMode(mode);
    show('form');
    errorEl.textContent = message;
    if (!signinDlg.open) signinDlg.showModal();
    (emailIn.value ? passIn : emailIn).focus();
  }
  const fail = (el, input, msg) => { el.textContent = msg; input?.setAttribute('aria-invalid', 'true'); input?.focus(); };
  [emailIn, passIn].forEach(i => i.addEventListener('input', () => { errorEl.textContent = ''; i.removeAttribute('aria-invalid'); }));

  const codeIn = $('auth-code');
  navSignin.addEventListener('click', () => openAuth('signin'));
  $('auth-switch').addEventListener('click', () => { setMode(form.dataset.mode === 'signin' ? 'register' : 'signin'); emailIn.focus(); });
  $('auth-invite-toggle').addEventListener('click', () => { setMode('invited'); codeIn.focus(); });
  codeIn.addEventListener('input', () => { errorEl.textContent = ''; codeIn.removeAttribute('aria-invalid'); });
  // "Enter invite code" on the pricing card opens straight into the invited sign-up.
  window.slrAuth.openInvitedSignup = () => openAuth('invited');
  $('auth-show').addEventListener('click', e => {
    const on = passIn.type === 'password';
    passIn.type = on ? 'text' : 'password';
    e.currentTarget.textContent = on ? 'Hide' : 'Show';
    e.currentTarget.setAttribute('aria-pressed', String(on));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const mode = form.dataset.mode, email = emailIn.value.trim(), password = passIn.value;
    if (!validEmail(email)) return fail(errorEl, emailIn, 'Enter your email address, like you@example.com.');
    if (!password) return fail(errorEl, passIn, 'Enter your password.');
    if (mode !== 'signin' && password.length < MIN_PASSWORD) return fail(errorEl, passIn, `Use at least ${MIN_PASSWORD} characters for your password.`);
    const code = codeIn.value.trim();
    if (mode === 'invited' && !code) return fail(errorEl, codeIn, 'Enter your invite code.');

    busyBtn(submitBtn, true, mode === 'signin' ? 'Signing in…' : mode === 'invited' ? 'Checking code…' : 'Creating account…');
    try {
      if (mode === 'signin') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) return fail(errorEl, passIn, friendly(error));
        passIn.value = '';
        // SIGNED_IN closes the dialog and reloads the plan.
      } else {
        // Invited sign-up checks the code first, so a wrong code never leaves a half-made account.
        if (mode === 'invited') {
          try { await window.slrPage.redeemInvite(code, { checkOnly: true }); }
          catch (err) { return fail(errorEl, codeIn, err.message); }
          submitBtn.textContent = 'Creating account…';
        }
        keepOpen = mode === 'invited'; // stay open to confirm invited access below
        const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
        if (error) { keepOpen = false; return fail(errorEl, emailIn, friendly(error)); }
        // With "Confirm email" on, Supabase hides whether the address is taken: no identities = taken.
        if (data.user && !data.user.identities?.length) { keepOpen = false; return fail(errorEl, emailIn, friendly({ message: 'already registered' })); }
        passIn.value = '';
        if (!data.session) { // "Confirm email" is on in Supabase
          keepOpen = false;
          $('auth-note-title').textContent = 'Confirm your email';
          $('auth-note-text').textContent = `We sent a confirmation link to ${email}. Open it, then sign in with your password${mode === 'invited' ? ' and enter your invite code under "Invited user? Enter code"' : ''}.`;
          return show('note');
        }
        if (mode === 'invited') {
          session = data.session; // so the redeem below is made as this new account
          let saved = null; // 'account' | 'tab' | null (failed)
          try { saved = (await window.slrPage.redeemInvite(code)).saved; } catch {}
          if (saved) await window.slrPage.loadStatus(); // the latest answer wins over the check that ran at sign-in
          keepOpen = false;
          codeIn.value = '';
          $('auth-note-title').textContent = saved ? "You're in" : 'Account created';
          $('auth-note-text').textContent = saved === 'account'
            ? 'Your account is ready and invited access is on: unlimited rewrites on any device until you sign out.'
            : saved
              ? 'Your account is ready and invited access is on in this tab.'
              : 'Your account is ready, but the invite code couldn\'t be saved. Enter it again under "Invited user? Enter code".';
          show('note');
        }
      }
    } finally {
      busyBtn(submitBtn, false, MODES[form.dataset.mode].submit);
    }
  });

  // ---------- forgot password ----------
  const forgotIn = $('forgot-email'), forgotErr = $('forgot-error'), forgotBtn = $('forgot-submit');
  $('auth-forgot-open').addEventListener('click', () => {
    forgotIn.value = emailIn.value; forgotErr.textContent = '';
    show('forgot'); forgotIn.focus();
  });
  forgotIn.addEventListener('input', () => { forgotErr.textContent = ''; forgotIn.removeAttribute('aria-invalid'); });
  views.forgot.addEventListener('submit', async e => {
    e.preventDefault();
    const email = forgotIn.value.trim();
    if (!validEmail(email)) return fail(forgotErr, forgotIn, 'Enter your email address, like you@example.com.');
    busyBtn(forgotBtn, true, 'Sending…');
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    busyBtn(forgotBtn, false, 'Send reset link');
    if (error) return fail(forgotErr, forgotIn, friendly(error));
    $('auth-note-title').textContent = 'Check your inbox';
    $('auth-note-text').textContent = `If ${email} has an account, we sent it a link to choose a new password. It can take a minute to arrive, so check your spam folder too.`;
    show('note');
  });
  signinDlg.querySelectorAll('[data-auth-back]').forEach(b => b.addEventListener('click', () => openAuth('signin')));

  // ---------- choose a new password (back from the reset link) ----------
  const resetIn = $('reset-password'), resetErr = $('reset-error'), resetBtn = $('reset-submit');
  resetIn.addEventListener('input', () => { resetErr.textContent = ''; resetIn.removeAttribute('aria-invalid'); });
  views.reset.addEventListener('submit', async e => {
    e.preventDefault();
    if (resetIn.value.length < MIN_PASSWORD) return fail(resetErr, resetIn, `Use at least ${MIN_PASSWORD} characters.`);
    busyBtn(resetBtn, true, 'Saving…');
    const { error } = await client.auth.updateUser({ password: resetIn.value });
    busyBtn(resetBtn, false, 'Save new password');
    if (error) return fail(resetErr, resetIn, friendly(error));
    resetIn.value = '';
    signinDlg.close();
  });

  // ---------- account dialog ----------
  const accountPlan = $('account-plan'), accountUsage = $('account-usage'), leaveBtn = $('account-leave');
  document.addEventListener('slr:usage', ({ detail: u }) => {
    accountPlan.className = 'chip ' + PLAN_CHIP[u.plan];
    accountPlan.textContent = PLAN_LABEL[u.plan];
    accountUsage.textContent = u.plan !== 'free' ? 'Unlimited rewrites'
      : `${u.remaining} of ${u.limit} free rewrites left`;
    leaveBtn.hidden = u.plan !== 'invited';
  });

  const deleteBox = $('delete-confirm'), deleteErr = $('delete-error');
  navAccount.addEventListener('click', () => { deleteBox.hidden = true; deleteErr.textContent = ''; accountDlg.showModal(); });
  leaveBtn.addEventListener('click', () => window.slrPage?.leaveInvited());

  async function signOut() {
    // Invited access saved on the account lasts until sign-out, so clear it first.
    if (window.slrPage?.plan() === 'invited') await window.slrPage.leaveInvited();
    await client.auth.signOut();
  }
  $('account-signout').addEventListener('click', async e => {
    const btn = e.currentTarget; // currentTarget is cleared once the click finishes dispatching
    busyBtn(btn, true, 'Signing out…');
    await signOut();
    busyBtn(btn, false, 'Sign out');
    accountDlg.close();
  });

  $('account-delete').addEventListener('click', () => { deleteBox.hidden = false; deleteErr.textContent = ''; $('delete-cancel').focus(); });
  $('delete-cancel').addEventListener('click', () => { deleteBox.hidden = true; });
  $('delete-yes').addEventListener('click', async e => {
    const btn = e.currentTarget;
    busyBtn(btn, true, 'Deleting…');
    try {
      const res = await fetch('/api/account', { method: 'DELETE', headers: { Authorization: `Bearer ${session?.access_token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't delete the account. Try again.");
      await client.auth.signOut({ scope: 'local' }); // the account is gone; just forget the session here
      accountDlg.close();
    } catch (err) {
      deleteErr.textContent = err.name === 'TypeError' ? "Couldn't reach the server. Check your connection and try again." : err.message;
    } finally {
      busyBtn(btn, false, 'Delete permanently');
    }
  });

  // ---------- shared dialog behaviour ----------
  for (const dlg of [signinDlg, accountDlg]) {
    dlg.querySelectorAll('[data-dialog-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // dimmed backdrop
  }
})();
