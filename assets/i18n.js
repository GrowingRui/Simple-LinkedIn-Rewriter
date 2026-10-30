// English / German for every page. The pages are written in English; in German, each piece of
// text (and placeholder, aria-label, alt, title) whose English wording is a key below is swapped
// for its translation, including text the page's scripts set later (a MutationObserver catches
// it). Switching back restores the English. Long legal text uses whole blocks instead:
// [data-lang-only="en"|"de"] is shown only in that language (German starts out `hidden`, so
// the English shows even without JavaScript).
// Language: ?lang=de|en in the URL or the /de home page, else the visitor's last choice, else the
// browser's language. On the home page, switching also moves between / and /de.
(() => {
  const STORE = 'slr-lang';
  const root = document.documentElement;

  const DE = {
    // ---------- head ----------
    'Simple LinkedIn Rewriter': null, // same in both languages
    'Free LinkedIn Post Rewriter | Simple LinkedIn Rewriter': 'Kostenloser LinkedIn-Post-Rewriter | Simple LinkedIn Rewriter',
    'Paste a rough LinkedIn draft and get a clear, human post back in seconds. Keeps your voice, cuts the clichés.':
      'Füge einen groben LinkedIn-Entwurf ein und erhalte in Sekunden einen klaren, menschlichen Beitrag. Deine Stimme bleibt, die Floskeln fliegen raus.',
    'Privacy policy | Simple LinkedIn Rewriter': 'Datenschutzerklärung | Simple LinkedIn Rewriter',
    'Terms of use | Simple LinkedIn Rewriter': 'Nutzungsbedingungen | Simple LinkedIn Rewriter',
    'What Simple LinkedIn Rewriter does with your drafts, cookies and usage data.':
      'Was Simple LinkedIn Rewriter mit deinen Entwürfen, Cookies und Nutzungsdaten macht.',
    'The rules for using Simple LinkedIn Rewriter.': 'Die Regeln für die Nutzung von Simple LinkedIn Rewriter.',

    // ---------- nav and footer ----------
    'Main': 'Hauptnavigation',
    'Footer': 'Fußzeile',
    'Language': 'Sprache',
    'Simple LinkedIn Rewriter home': 'Simple LinkedIn Rewriter Startseite',
    'How it works': 'So funktioniert’s',
    'Examples': 'Beispiele',
    'Pricing': 'Preise',
    'Sign in': 'Anmelden',
    'Your account': 'Dein Konto',
    'Try it free': 'Kostenlos testen',
    'Privacy': 'Datenschutz',
    'Terms': 'Nutzungsbedingungen',
    '© 2026 Simple LinkedIn Rewriter. Not affiliated with LinkedIn.': '© 2026 Simple LinkedIn Rewriter. Nicht mit LinkedIn verbunden.',

    // ---------- hero ----------
    'Write LinkedIn posts people finish reading.': 'LinkedIn-Posts, die man zu Ende liest.',
    'Paste a rough post, your About section or a message. Simple LinkedIn Rewriter puts your point up front, cuts the filler, and keeps it sounding like you, not like a press release.':
      'Füge einen groben Beitrag, deinen Info-Bereich oder eine Nachricht ein. Simple LinkedIn Rewriter stellt deine Kernaussage nach vorne, streicht das Füllmaterial und lässt alles nach dir klingen, nicht nach Pressemitteilung.',
    'Rewrite a post free': 'Beitrag kostenlos umschreiben',
    'See examples': 'Beispiele ansehen',
    '5 free rewrites a day. No sign-up, no card.': '5 kostenlose Umschreibungen pro Tag. Ohne Anmeldung, ohne Kreditkarte.',

    // ---------- rewriter ----------
    'What are you writing?': 'Was schreibst du?',
    'Post': 'Beitrag',
    'Profile': 'Profil',
    'Message': 'Nachricht',
    'Your draft': 'Dein Entwurf',
    'Rewritten': 'Umgeschrieben',
    'Tone': 'Ton',
    'Natural': 'Natürlich',
    'Confident & friendly': 'Selbstbewusst & freundlich',
    'Formal': 'Förmlich',
    'Concise': 'Knapp',
    'Persuasive': 'Überzeugend',
    'Section': 'Bereich',
    'Headline': 'Überschrift',
    'About': 'Info',
    'Experience': 'Berufserfahrung',
    'Your post': 'Dein Beitrag',
    'How it reads in the feed': 'So wirkt er im Feed',
    'Your profile': 'Dein Profil',
    'Headline, About, experience or achievements': 'Überschrift, Info, Berufserfahrung oder Erfolge',
    'Your message': 'Deine Nachricht',
    'Connection request, follow-up or outreach': 'Kontaktanfrage, Follow-up oder Erstkontakt',
    'Your headline': 'Deine Überschrift',
    'Your About section': 'Dein Info-Bereich',
    'A job from your experience': 'Eine Stelle aus deiner Berufserfahrung',
    'Your LinkedIn draft': 'Dein LinkedIn-Entwurf',
    'Paste your LinkedIn draft here. Bullet points or a rough paragraph both work.':
      'Füge hier deinen LinkedIn-Entwurf ein. Stichpunkte oder ein grober Absatz reichen.',
    'Paste your headline, your About section, or a job from your experience.':
      'Füge deine Überschrift, deinen Info-Bereich oder eine Stelle aus deiner Berufserfahrung ein.',
    'Paste a connection request, a reply to a recruiter, a follow-up or a message to a client.':
      'Füge eine Kontaktanfrage, eine Antwort an Recruiter, ein Follow-up oder eine Nachricht an Kunden ein.',
    'Paste your current headline, or your role and main skills.':
      'Füge deine aktuelle Überschrift ein, oder deine Rolle und deine wichtigsten Fähigkeiten.',
    'Paste your About section, or a few sentences about you and what you want next.':
      'Füge deinen Info-Bereich ein, oder ein paar Sätze über dich und das, was du als Nächstes willst.',
    'Paste a job description, your duties, or your achievements.':
      'Füge eine Stellenbeschreibung, deine Aufgaben oder deine Erfolge ein.',
    'words': 'Wörter',
    'hashtags': 'Hashtags',
    'Clear': 'Leeren',
    'Copy': 'Kopieren',
    'Copied': 'Kopiert',
    'Select and copy': 'Markieren und kopieren',
    'Rewrite': 'Umschreiben',
    'Edit draft': 'Entwurf bearbeiten',
    'New version': 'Neue Version',
    'Edited': 'Bearbeitet',
    'Original': null,
    'Show': 'Anzeigen',
    'Click the text to change anything before you copy it.': 'Klicke in den Text, um vor dem Kopieren noch etwas zu ändern.',
    'Rewriting…': 'Wird umgeschrieben …',
    'Free plan': 'Kostenloser Plan',
    'Invited': 'Eingeladen',
    'Unlimited rewrites': 'Unbegrenzte Umschreibungen',
    'No free rewrites left today. More at midnight UTC.': 'Heute keine kostenlosen Umschreibungen mehr. Neue gibt es um Mitternacht (UTC).',
    'Invited user? Enter code': 'Eingeladen? Code eingeben',
    'Switch to free plan': 'Zum kostenlosen Plan wechseln',
    'Switching to the free plan…': 'Wechsel zum kostenlosen Plan …',
    'Paste a draft first.': 'Füge zuerst einen Entwurf ein.',
    "Couldn't reach the rewriter. Check your connection and try again.":
      'Der Rewriter ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
    'The rewriter is busy right now. Try again in a minute.': 'Der Rewriter ist gerade ausgelastet. Versuche es in einer Minute erneut.',
    'Drafts can be up to 3,000 characters.': 'Entwürfe dürfen bis zu 3.000 Zeichen lang sein.',
    'Pick a tone.': 'Wähle einen Ton.',
    'Rewriting is not set up yet. Try again later.': 'Das Umschreiben ist noch nicht eingerichtet. Versuche es später erneut.',
    "You've used your 5 free rewrites for today. They reset at midnight UTC, or enter an invite code for unlimited rewrites.":
      'Du hast deine 5 kostenlosen Umschreibungen für heute genutzt. Um Mitternacht (UTC) gibt es neue, oder du gibst einen Einladungscode für unbegrenzte Umschreibungen ein.',

    // ---------- how it works ----------
    'Three steps, about ten seconds.': 'Drei Schritte, etwa zehn Sekunden.',
    'No prompts to learn and no settings to tune. You bring the draft; it comes back ready to post.':
      'Keine Prompts lernen, nichts einstellen. Du bringst den Entwurf mit, zurück kommt ein Beitrag, den du posten kannst.',
    'Paste your draft': 'Entwurf einfügen',
    'A post, your headline or About section, a job from your experience, or a message. Rough notes are fine, up to 3,000 characters.':
      'Ein Beitrag, deine Überschrift oder dein Info-Bereich, eine Stelle aus deiner Berufserfahrung oder eine Nachricht. Grobe Notizen reichen, bis zu 3.000 Zeichen.',
    'Pick a tone': 'Ton wählen',
    'Natural, confident and friendly, formal, concise or persuasive. Switch between them and compare before you commit.':
      'Natürlich, selbstbewusst und freundlich, förmlich, knapp oder überzeugend. Wechsle zwischen ihnen und vergleiche, bevor du dich entscheidest.',
    'Copy and post': 'Kopieren und posten',
    'One click copies it with LinkedIn-friendly line breaks intact. Edit anything you like first.':
      'Ein Klick kopiert den Text mit LinkedIn-tauglichen Zeilenumbrüchen. Vorher kannst du alles nach Belieben anpassen.',

    // ---------- examples ----------
    'Same point. Better post.': 'Gleiche Aussage. Besserer Beitrag.',
    'Illustrative examples of the posts people struggle with, before and after.':
      'Beispiele für Beiträge, mit denen sich viele schwertun, vorher und nachher.',
    'Example posts': 'Beispielbeiträge',
    'Lesson learned': 'Lektion gelernt',
    'Hiring': 'Wir stellen ein',
    'Project launch': 'Produktstart',
    "So I wanted to share something that happened this week that really made me think. We had a big launch and honestly things didn't go as planned at all.":
      'Ich wollte mal etwas teilen, das mich diese Woche echt zum Nachdenken gebracht hat. Wir hatten einen großen Launch und ehrlich gesagt lief gar nichts nach Plan.',
    'Our onboarding flow broke for about 2 hours and we lost a lot of signups. But you know what? Failure is just a stepping stone to success.':
      'Unser Onboarding war rund 2 Stunden kaputt und wir haben viele Anmeldungen verloren. Aber wisst ihr was? Scheitern ist nur ein Sprungbrett zum Erfolg.',
    'Lesson: always test on real devices!! Agree? 👇 #Leadership #Startups #Growth #Failure #Lessons':
      'Lektion: immer auf echten Geräten testen!! Seht ihr das auch so? 👇 #Leadership #Startups #Growth #Failure #Lessons',
    'Our onboarding flow broke for 2 hours on launch day. We lost a lot of signups.':
      'Am Launch-Tag war unser Onboarding 2 Stunden lang kaputt. Wir haben viele Anmeldungen verloren.',
    'The cause: we tested on simulators, not real phones. The bug only showed up on older Android devices.':
      'Der Grund: Wir hatten in Simulatoren getestet, nicht auf echten Handys. Der Fehler trat nur auf älteren Android-Geräten auf.',
    'We now run every release on five physical devices before shipping. Cheap fix, expensive lesson.':
      'Heute testen wir jedes Release vorher auf fünf echten Geräten. Günstige Lösung, teure Lektion.',
    'The point is in line one': 'Die Kernaussage steht in Zeile eins',
    'Vague moral replaced with the actual fix': 'Vage Moral ersetzt durch die echte Lösung',
    '5 hashtags down to 1': '5 Hashtags auf 1 reduziert',
    "🚀 WE'RE HIRING!!! 🚀 Are you a rockstar ninja developer who is passionate about building the future?? Do you thrive in a fast-paced environment?":
      '🚀 WIR STELLEN EIN!!! 🚀 Bist du ein Rockstar-Ninja-Developer, der mit Leidenschaft die Zukunft baut?? Blühst du in einem schnelllebigen Umfeld auf?',
    'Our amazing team at Brightline is looking for a Backend Engineer to join our family! Competitive salary and great culture.':
      'Unser großartiges Team bei Brightline sucht Verstärkung für unsere Familie: Backend Engineer gesucht! Attraktives Gehalt und tolle Kultur.',
    'DM me or apply below!! Please share with your network 🙏 #Hiring #Jobs #Tech #Developer #OpenToWork':
      'Schreib mir oder bewirb dich unten!! Bitte teilt das mit eurem Netzwerk 🙏 #Hiring #Jobs #Tech #Developer #OpenToWork',
    'Brightline is hiring a Backend Engineer.': 'Brightline sucht Backend Engineer (m/w/d).',
    "You'd own the payments API that 400 small businesses use to get paid. We work in Go and Postgres, remote across EU time zones.":
      'Du verantwortest die Payment-API, über die 400 kleine Unternehmen ihr Geld bekommen. Wir arbeiten mit Go und Postgres, remote in EU-Zeitzonen.',
    'If that sounds like your kind of problem, the job post is in the comments, or message me directly.':
      'Wenn das nach deiner Art von Problem klingt: Die Stellenanzeige steht in den Kommentaren, oder schreib mir direkt.',
    'Role and company up front': 'Rolle und Firma gleich vorne',
    'Clichés swapped for real details': 'Klischees durch echte Details ersetzt',
    'One clear next step': 'Ein klarer nächster Schritt',
    'After many months of hard work, late nights, and countless cups of coffee ☕, I am beyond thrilled to finally share what our team has been working on!!':
      'Nach vielen Monaten harter Arbeit, langen Nächten und unzähligen Tassen Kaffee ☕ freue ich mich unglaublich, endlich zu zeigen, woran unser Team gearbeitet hat!!',
    "Introducing Ledgerly, a game-changing new way for freelancers to manage their invoices. It's going to revolutionize the industry.":
      'Darf ich vorstellen: Ledgerly, ein echter Game-Changer für Freelancer bei der Rechnungsverwaltung. Das wird die Branche revolutionieren.',
    'Check it out and let me know your thoughts! #Launch #Startup #Fintech #Freelance #Innovation':
      'Schaut es euch an und sagt mir eure Meinung! #Launch #Startup #Fintech #Freelance #Innovation',
    'We just launched Ledgerly: invoicing for freelancers that sends payment reminders for you.':
      'Wir haben gerade Ledgerly gestartet: Rechnungen für Freelancer, die Zahlungserinnerungen für dich verschicken.',
    'We built it after watching our own freelance friends spend Fridays chasing late payments.':
      'Wir haben es gebaut, nachdem wir gesehen haben, wie befreundete Freelancer ihre Freitage damit verbringen, offenen Zahlungen hinterherzulaufen.',
    "It's free for your first 10 invoices. I'd love feedback from anyone who bills clients.":
      'Die ersten 10 Rechnungen sind kostenlos. Ich freue mich über Feedback von allen, die Kunden Rechnungen stellen.',
    'What it does, in one sentence': 'Was es macht, in einem Satz',
    'Hype replaced with why it exists': 'Hype ersetzt durch den Grund, warum es das gibt',
    'Specific ask for feedback': 'Konkrete Bitte um Feedback',

    // ---------- clichés ----------
    'It cuts the lines everyone scrolls past.': 'Weg mit den Sätzen, über die alle hinwegscrollen.',
    'Your names, numbers, and opinions stay. The stock phrases, hashtag pile-ups, and engagement bait go.':
      'Deine Namen, Zahlen und Meinungen bleiben. Floskeln, Hashtag-Berge und Klick-Köder fliegen raus.',
    'Examples of phrases that get removed': 'Beispiele für Floskeln, die entfernt werden',
    "I'm humbled and honored to announce": 'Ich bin stolz, verkünden zu dürfen',
    'Agree?': 'Seht ihr das auch so?',
    'Let that sink in.': 'Lasst das mal sacken.',
    "In today's fast-paced world": 'In der heutigen schnelllebigen Welt',
    "I'm thrilled to share": 'Ich freue mich, euch mitteilen zu dürfen',
    'Thoughts? 👇': 'Eure Meinung? 👇',
    'This is a game-changer': 'Das ist ein echter Game-Changer',
    "I couldn't have done it without you": 'Ohne euch hätte ich das nie geschafft',
    'Hot take:': 'Steile These:',

    // ---------- reviews (the quotes themselves stay as written) ----------
    'What early users say.': 'Was erste Nutzer sagen.',
    "Feedback from people who've used it on their own posts and messages.":
      'Feedback von Leuten, die es für ihre eigenen Beiträge und Nachrichten genutzt haben.',
    '5 out of 5 stars': '5 von 5 Sternen',

    // ---------- pricing ----------
    'Free to start. Cheap to keep.': 'Kostenlos starten. Günstig bleiben.',
    'Most people post a few times a week. The free plan covers that.': 'Die meisten posten ein paar Mal pro Woche. Dafür reicht der kostenlose Plan.',
    'Your plan': 'Dein Plan',
    'Free': 'Kostenlos',
    'For posting now and then.': 'Für gelegentliches Posten.',
    '5 rewrites a day': '5 Umschreibungen pro Tag',
    'Posts, profile and messages in 5 tones': 'Beiträge, Profil und Nachrichten in 5 Tönen',
    'No account needed': 'Kein Konto nötig',
    'Start free': 'Kostenlos starten',
    'Coming soon': 'Bald verfügbar',
    '/ month': '/ Monat',
    'For people who post every week. Launching soon.': 'Für alle, die jede Woche posten. Startet bald.',
    'Voice profile trained on your past posts': 'Stilprofil, trainiert mit deinen bisherigen Beiträgen',
    'Rewrite history and saved drafts': 'Verlauf und gespeicherte Entwürfe',
    'Join the waitlist': 'Auf die Warteliste',
    'with a code': 'mit Code',
    "Pro access for people we've invited.": 'Pro-Zugang für Leute, die wir eingeladen haben.',
    'Pro features as they launch': 'Pro-Funktionen, sobald sie starten',
    'Saved to your account when signed in': 'In deinem Konto gespeichert, wenn du angemeldet bist',
    'Enter invite code': 'Einladungscode eingeben',

    // ---------- FAQ ----------
    'Questions': 'Fragen',
    'Something else? Email': 'Noch etwas? Schreib an',
    'Will it still sound like me?': 'Klingt es dann noch nach mir?',
    'Yes. It keeps your meaning and first-person voice while raising the wording to a professional standard. A Pro voice profile that learns from your past posts is coming soon.':
      'Ja. Deine Aussage und deine Ich-Perspektive bleiben, nur die Formulierung wird professioneller. Ein Pro-Stilprofil, das aus deinen bisherigen Beiträgen lernt, kommt bald.',
    'Does it make things up?': 'Erfindet es etwas dazu?',
    "It won't add names, numbers, dates, or results that aren't in your draft. It may add general professional context to round out a short post, so read the rewrite before you publish it.":
      'Es fügt keine Namen, Zahlen, Daten oder Ergebnisse hinzu, die nicht in deinem Entwurf stehen. Bei kurzen Beiträgen kann es allgemeinen fachlichen Kontext ergänzen. Lies die Umschreibung deshalb, bevor du sie veröffentlichst.',
    'Do you post to LinkedIn for me?': 'Postet ihr für mich auf LinkedIn?',
    'No, and we never ask for your LinkedIn login. You copy the rewrite and post it yourself.':
      'Nein, und wir fragen nie nach deinen LinkedIn-Zugangsdaten. Du kopierst die Umschreibung und postest sie selbst.',
    'What happens to my drafts?': 'Was passiert mit meinen Entwürfen?',
    "We don't store your drafts or rewrites. Your draft is sent to our AI provider to be rewritten and the result comes straight back to you. The draft you're working on is also kept in your own browser, so a refresh doesn't lose it; Clear removes it. The":
      'Wir speichern weder deine Entwürfe noch die Umschreibungen. Dein Entwurf geht zum Umschreiben an unseren KI-Anbieter, und das Ergebnis kommt direkt zu dir zurück. Der Entwurf, an dem du gerade arbeitest, bleibt außerdem in deinem eigenen Browser, damit er beim Neuladen nicht verloren geht; „Leeren“ löscht ihn. Details stehen in der',
    'privacy policy': 'Datenschutzerklärung',
    'has the details.': '.',
    'When is Pro available?': 'Wann gibt es Pro?',
    "Soon. Join the waitlist from the pricing section and you'll hear first. Once it launches, you'll be able to cancel anytime.":
      'Bald. Trag dich bei den Preisen in die Warteliste ein, dann erfährst du es zuerst. Nach dem Start kannst du jederzeit kündigen.',

    // ---------- final call to action ----------
    'Your next post is already half written.': 'Dein nächster Beitrag ist schon halb geschrieben.',
    'Paste it in and see the other half.': 'Füg ihn ein und sieh dir die andere Hälfte an.',

    // ---------- invite dialog ----------
    'Close': 'Schließen',
    'Enter your invite code': 'Gib deinen Einladungscode ein',
    'Invited users get everything in Pro, including unlimited rewrites.': 'Eingeladene bekommen alles aus Pro, auch unbegrenzte Umschreibungen.',
    'Invite code': 'Einladungscode',
    'Your code': 'Dein Code',
    'Cancel': 'Abbrechen',
    'Verify code': 'Code prüfen',
    'Checking…': 'Wird geprüft …',
    'Invited access is on': 'Einladungszugang ist aktiv',
    'You have unlimited rewrites in every tone, the same as Pro.': 'Du hast unbegrenzte Umschreibungen in jedem Ton, genau wie bei Pro.',
    'It stays on until you close this tab.': 'Er bleibt aktiv, bis du diesen Tab schließt.',
    'It stays on for your account, on any device, until you sign out.': 'Er bleibt für dein Konto auf jedem Gerät aktiv, bis du dich abmeldest.',
    'Start rewriting': 'Jetzt umschreiben',
    'Enter your invite code.': 'Gib deinen Einladungscode ein.',
    "Couldn't reach the server. Check your connection and try again.": 'Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
    "Couldn't check the code. Try again.": 'Der Code konnte nicht geprüft werden. Versuche es erneut.',
    "Invite codes aren't available right now. Try again later.": 'Einladungscodes sind gerade nicht verfügbar. Versuche es später erneut.',
    'Too many attempts. Try again in an hour.': 'Zu viele Versuche. Versuche es in einer Stunde erneut.',
    "That invite code isn't valid. Check it and try again.": 'Dieser Einladungscode ist ungültig. Prüfe ihn und versuche es erneut.',

    // ---------- sign-in dialog ----------
    'Welcome back. Your plan and daily rewrites follow you to any device.':
      'Willkommen zurück. Dein Plan und deine täglichen Umschreibungen begleiten dich auf jedes Gerät.',
    'Email': 'E-Mail',
    'you@example.com': 'du@beispiel.de',
    'Password': 'Passwort',
    'Forgot password?': 'Passwort vergessen?',
    'Show': 'Anzeigen',
    'Hide': 'Verbergen',
    'At least 8 characters.': 'Mindestens 8 Zeichen.',
    'Have an invite code?': 'Hast du einen Einladungscode?',
    "Don't have an account?": 'Noch kein Konto?',
    'Create one': 'Konto erstellen',
    'Already have an account?': 'Schon ein Konto?',
    'By continuing you agree to the': 'Wenn du fortfährst, akzeptierst du die',
    'terms': 'Nutzungsbedingungen',
    'and': 'und die',
    ". You don't need an account for the 5 free rewrites a day.": '. Für die 5 kostenlosen Umschreibungen pro Tag brauchst du kein Konto.',
    'Create your account': 'Konto erstellen',
    'Free, and optional. Your plan and daily rewrites then follow you to any device.':
      'Kostenlos und freiwillig. Dein Plan und deine täglichen Umschreibungen begleiten dich dann auf jedes Gerät.',
    'Create account': 'Konto erstellen',
    'Create your invited account': 'Konto mit Einladung erstellen',
    'Register with your invite code to get unlimited rewrites, saved to your account on every device.':
      'Registriere dich mit deinem Einladungscode und erhalte unbegrenzte Umschreibungen, gespeichert in deinem Konto auf jedem Gerät.',
    'Reset your password': 'Passwort zurücksetzen',
    "Enter your account email and we'll send you a link to choose a new password.":
      'Gib die E-Mail-Adresse deines Kontos ein. Wir schicken dir einen Link, mit dem du ein neues Passwort wählen kannst.',
    'Back to sign in': 'Zurück zur Anmeldung',
    'Send reset link': 'Link senden',
    'Check your inbox': 'Schau in dein Postfach',
    'Done': 'Fertig',
    'Choose a new password': 'Neues Passwort wählen',
    "At least 8 characters. You'll stay signed in.": 'Mindestens 8 Zeichen. Du bleibst angemeldet.',
    'New password': 'Neues Passwort',
    'Save new password': 'Neues Passwort speichern',
    'Too many attempts. Wait a few minutes and try again.': 'Zu viele Versuche. Warte ein paar Minuten und versuche es erneut.',
    'Email or password is incorrect.': 'E-Mail oder Passwort ist falsch.',
    'Confirm your email first: open the link we sent when you created the account.':
      'Bestätige zuerst deine E-Mail-Adresse: Öffne den Link, den wir dir bei der Registrierung geschickt haben.',
    'An account with this email already exists. Sign in instead.': 'Mit dieser E-Mail-Adresse gibt es schon ein Konto. Melde dich stattdessen an.',
    'Choose a stronger password: at least 8 characters.': 'Wähle ein sichereres Passwort: mindestens 8 Zeichen.',
    "Creating accounts isn't available right now.": 'Konten können gerade nicht erstellt werden.',
    "Couldn't reach the sign-in service. Check your connection and try again.":
      'Der Anmeldedienst ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
    'Something went wrong. Try again.': 'Etwas ist schiefgelaufen. Versuche es erneut.',
    'That link has expired or was already used. Sign in, or reset your password again.':
      'Dieser Link ist abgelaufen oder wurde schon benutzt. Melde dich an oder setze dein Passwort erneut zurück.',
    'Enter your email address, like you@example.com.': 'Gib deine E-Mail-Adresse ein, zum Beispiel du@beispiel.de.',
    'Enter your password.': 'Gib dein Passwort ein.',
    'Use at least 8 characters for your password.': 'Dein Passwort braucht mindestens 8 Zeichen.',
    'Use at least 8 characters.': 'Verwende mindestens 8 Zeichen.',
    'Signing in…': 'Anmeldung läuft …',
    'Checking code…': 'Code wird geprüft …',
    'Creating account…': 'Konto wird erstellt …',
    'Confirm your email': 'Bestätige deine E-Mail-Adresse',
    "You're in": 'Du bist drin',
    'Account created': 'Konto erstellt',
    'Your account is ready and invited access is on: unlimited rewrites on any device until you sign out.':
      'Dein Konto ist bereit und der Einladungszugang ist aktiv: unbegrenzte Umschreibungen auf jedem Gerät, bis du dich abmeldest.',
    'Your account is ready and invited access is on in this tab.': 'Dein Konto ist bereit und der Einladungszugang ist in diesem Tab aktiv.',
    'Your account is ready, but the invite code couldn\'t be saved. Enter it again under "Invited user? Enter code".':
      'Dein Konto ist bereit, aber der Einladungscode konnte nicht gespeichert werden. Gib ihn unter „Eingeladen? Code eingeben“ erneut ein.',
    'Sending…': 'Wird gesendet …',
    'Saving…': 'Wird gespeichert …',

    // ---------- account dialog ----------
    'Plan': null,
    'Today': 'Heute',
    'Your plan and daily rewrites follow you on any device where you sign in.':
      'Dein Plan und deine täglichen Umschreibungen begleiten dich auf jedes Gerät, auf dem du dich anmeldest.',
    'Delete account': 'Konto löschen',
    'Sign out': 'Abmelden',
    'Signing out…': 'Abmeldung läuft …',
    'Delete your account?': 'Konto wirklich löschen?',
    "This permanently removes your account, your saved invited access and your usage history. It can't be undone. You can still use the free rewrites without an account.":
      'Damit werden dein Konto, dein gespeicherter Einladungszugang und dein Nutzungsverlauf endgültig gelöscht. Das lässt sich nicht rückgängig machen. Die kostenlosen Umschreibungen kannst du weiterhin ohne Konto nutzen.',
    'Delete permanently': 'Endgültig löschen',
    'Deleting…': 'Wird gelöscht …',
    "Couldn't delete the account. Try again.": 'Das Konto konnte nicht gelöscht werden. Versuche es erneut.',
    "Couldn't delete the account. Try again in a minute.": 'Das Konto konnte nicht gelöscht werden. Versuche es in einer Minute erneut.',
    'Sign in again, then delete your account.': 'Melde dich erneut an und lösche dann dein Konto.',
    "Deleting accounts isn't available right now. Email xiarui091@gmail.com and we'll delete it for you.":
      'Konten können gerade nicht gelöscht werden. Schreib an xiarui091@gmail.com, dann löschen wir es für dich.',

    // ---------- privacy and terms pages ----------
    'Back to the rewriter': 'Zurück zum Rewriter',
    'Privacy policy': 'Datenschutzerklärung',
    'Terms of use': 'Nutzungsbedingungen',
    'Last updated 29 October 2026': 'Zuletzt aktualisiert am 29. Oktober 2026',
    'Last updated 23 October 2026': 'Zuletzt aktualisiert am 23. Oktober 2026',
  };

  // Text the page builds with numbers or names in it.
  const PATTERNS = [
    [/^(\d+) of (\d+) free rewrites left today$/, '$1 von $2 kostenlosen Umschreibungen heute übrig'],
    [/^(\d+) of (\d+) free rewrites left$/, '$1 von $2 kostenlosen Umschreibungen übrig'],
    [/^(\d+) fewer words$/, '$1 Wörter weniger'],
    [/^Hashtags (\d+) to (\d+)$/, 'Hashtags von $1 auf $2'],
    [/^([\d,]+) \/ 3,000$/, (_, n) => `${n.replace(/,/g, '.')} / 3.000`],
    [/^That didn't work \((.+)\)\. Try again\.$/, 'Das hat nicht geklappt ($1). Versuche es erneut.'],
    [/^We sent a confirmation link to (.+?)\. Open it, then sign in with your password( and enter your invite code under "Invited user\? Enter code")?\.$/,
      (_, email, code) => `Wir haben einen Bestätigungslink an ${email} geschickt. Öffne ihn und melde dich dann mit deinem Passwort an${code ? ' und gib deinen Einladungscode unter „Eingeladen? Code eingeben“ ein' : ''}.`],
    [/^If (.+) has an account, we sent it a link to choose a new password\. It can take a minute to arrive, so check your spam folder too\.$/,
      'Falls es für $1 ein Konto gibt, haben wir dorthin einen Link für ein neues Passwort geschickt. Das kann eine Minute dauern, schau also auch in den Spam-Ordner.'],
  ];

  // The rewriter's sample drafts, in German.
  const SAMPLES = {
    [`I am extremely humbled and honored to announce that after a long and challenging process, I have officially accepted a new position as Senior Product Designer at Northwind Health!! 🎉🎉

I want to take a moment to thank each and every person who has supported me on this incredible journey. I couldn't have done it without you.

Excited for this next chapter and can't wait to see what the future holds!

#NewJob #Blessed #Grateful #Design #UX #Career #Motivation #Hired`]: `Ich bin unglaublich stolz und dankbar, verkünden zu dürfen, dass ich nach einem langen und herausfordernden Prozess offiziell eine neue Position als Senior Product Designer bei Northwind Health angenommen habe!! 🎉🎉

Ich möchte mir einen Moment nehmen, um jeder einzelnen Person zu danken, die mich auf dieser unglaublichen Reise unterstützt hat. Ohne euch hätte ich das nie geschafft.

Ich freue mich auf dieses neue Kapitel und kann es kaum erwarten zu sehen, was die Zukunft bringt!

#NewJob #Blessed #Grateful #Design #UX #Career #Motivation #Hired`,
    'Marketing person with 6 years experience. I do social media, campaigns and some data stuff. I worked at two agencies and now I want to move to a tech company. Hard worker and team player, I like learning new things.':
      'Marketing-Mensch mit 6 Jahren Erfahrung. Ich mache Social Media, Kampagnen und ein bisschen was mit Daten. Ich war bei zwei Agenturen und will jetzt zu einer Tech-Firma wechseln. Fleißig und teamfähig, ich lerne gerne Neues.',
    'hi, i saw your profile and i want to connect. im looking for a job in product design and maybe you can help me or know someone who is hiring. thanks':
      'hi, hab dein profil gesehen und will mich vernetzen. ich suche einen job im product design und vielleicht kannst du mir helfen oder kennst jemanden der einstellt. danke',
    'marketing manager, social media, campaigns, data': 'marketing manager, social media, kampagnen, daten',
    'At my last job I was responsible for the social media accounts, I made campaigns, I did the monthly reports and I trained 2 juniors.':
      'In meinem letzten Job war ich für die Social-Media-Kanäle zuständig, habe Kampagnen gemacht, die Monatsberichte erstellt und 2 Juniors eingearbeitet.',
  };

  const norm = s => s.replace(/\s+/g, ' ').trim();
  function lookup(key) {
    if (DE[key]) return DE[key];
    for (const [re, to] of PATTERNS) if (re.test(key)) return key.replace(re, to);
    return null;
  }

  // ---------- which language ----------
  const pick = l => (l === 'de' || l === 'en' ? l : null);
  const HOME = { en: '/', de: '/de' };
  const onHome = ['/', '/index.html', '/de'].includes(location.pathname);
  let lang = pick(new URLSearchParams(location.search).get('lang')) || (location.pathname === '/de' ? 'de' : null);
  if (lang) { try { localStorage.setItem(STORE, lang); } catch {} }
  if (!lang) { try { lang = pick(localStorage.getItem(STORE)); } catch {} }
  if (!lang) lang = (navigator.languages || [navigator.language]).find(l => /^(de|en)\b/i.test(l || ''))?.slice(0, 2).toLowerCase() || 'en';
  root.lang = lang;

  // Styles for the switch, and a short hold so German readers don't see the English flash by first.
  const style = document.createElement('style');
  style.textContent = `
    html.i18n-wait body { visibility: hidden; }
    .lang-switch { display: inline-flex; gap: 2px; padding: 3px; border-radius: 999px; background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1px rgba(255,255,255,.06); }
    .lang-switch button { position: relative; min-width: 34px; padding: 6px 9px; border-radius: 999px; font: 600 12.5px/1 Inter, system-ui, sans-serif; letter-spacing: .02em; color: #A9B8D0; cursor: pointer; transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
    .lang-switch button::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: rgba(255,255,255,.08); opacity: 0; transition: opacity .2s ease; }
    .lang-switch button:hover::before { opacity: 1; }
    .lang-switch button:active { transform: scale(.92); }
    .lang-switch button:focus-visible { outline: 2px solid #10B981; outline-offset: 2px; }
    .lang-switch button[aria-pressed="true"] { color: #fff; }
    .lang-switch button[aria-pressed="true"]::before { opacity: 1; background: rgba(26,115,232,.55); box-shadow: 0 2px 8px -2px rgba(26,115,232,.6); }
    .lang-switch-nav { display: none; }
    @media (min-width: 640px) { .lang-switch-nav { display: inline-flex; } }
  `;
  document.head.appendChild(style);
  if (lang === 'de') {
    root.classList.add('i18n-wait');
    setTimeout(() => root.classList.remove('i18n-wait'), 1500); // never hold the page longer than this
  }

  // ---------- translating and restoring ----------
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
  const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  const texts = new Map(); // text node -> { en, de }
  const attrs = new Map(); // element -> { attr: { en, de } }
  const skipped = el => !el || SKIP.has(el.tagName) || el.closest('[data-no-i18n]');

  function trText(n) {
    if (skipped(n.parentElement)) return;
    const v = n.nodeValue, key = norm(v);
    const de = key && lookup(key);
    if (!de) return;
    const lead = /^[.,;:!?)]/.test(de) ? '' : v.match(/^\s*/)[0];
    const out = lead + de + v.match(/\s*$/)[0];
    if (out === v) return;
    texts.set(n, { en: v, de: out });
    n.nodeValue = out;
  }
  function trAttr(el, a) {
    const v = el.getAttribute(a);
    const de = v && !el.closest('[data-no-i18n]') && lookup(norm(v)); // a textarea's own text is skipped, its placeholder isn't
    if (!de || de === v) return;
    if (!attrs.has(el)) attrs.set(el, {});
    attrs.get(el)[a] = { en: v, de };
    el.setAttribute(a, de);
  }
  function trTree(node) {
    if (node.nodeType === 3) return trText(node);
    if (node.nodeType !== 1 || skipped(node)) return;
    ATTRS.forEach(a => node.hasAttribute(a) && trAttr(node, a));
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (n.nodeType === 3) trText(n);
      else ATTRS.forEach(a => n.hasAttribute(a) && trAttr(n, a));
    }
  }
  // German -> English, for text that was rebuilt after we translated it (the hero headline is split
  // into lines and put back by the motion layer). Only unambiguous, real phrases.
  const EN = {};
  Object.entries(DE).forEach(([en, de]) => { if (de && de.length > 3) EN[de] = de in EN ? null : en; });
  function restore() {
    texts.forEach((r, n) => { if (n.nodeValue === r.de) n.nodeValue = r.en; });
    attrs.forEach((m, el) => Object.entries(m).forEach(([a, r]) => { if (el.getAttribute(a) === r.de) el.setAttribute(a, r.en); }));
    texts.clear(); attrs.clear();
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (skipped(n.parentElement)) continue;
      const en = EN[norm(n.nodeValue)];
      if (en) n.nodeValue = n.nodeValue.match(/^\s*/)[0] + en + n.nodeValue.match(/\s*$/)[0];
    }
  }

  // Text the page's scripts set later is translated as it appears.
  const observer = new MutationObserver(list => {
    if (lang !== 'de') return;
    for (const m of list) {
      if (m.type === 'characterData') trText(m.target);
      else if (m.type === 'attributes') trAttr(m.target, m.attributeName);
      else m.addedNodes.forEach(trTree);
    }
  });

  const head = {};
  function applyHead() {
    head.title ??= EN[document.title] || document.title; // /de arrives with a German head
    const meta = document.querySelector('meta[name="description"]');
    if (meta) head.description ??= EN[meta.content] || meta.content;
    document.title = lang === 'de' ? lookup(head.title) || head.title : head.title;
    if (meta) meta.content = lang === 'de' ? lookup(head.description) || head.description : head.description;
  }

  function apply() {
    root.lang = lang;
    applyHead();
    document.querySelectorAll('[data-lang-only]').forEach(el => { el.hidden = el.dataset.langOnly !== lang; });
    if (lang === 'de') trTree(document.body); else restore();
    document.querySelectorAll('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
  }

  function setLang(l) {
    if (!pick(l) || l === lang) return;
    lang = l;
    try { localStorage.setItem(STORE, l); } catch {}
    if (onHome) history.replaceState(history.state, '', HOME[l] + location.hash);
    apply();
    document.dispatchEvent(new CustomEvent('slr:lang', { detail: l }));
    window.ScrollTrigger?.refresh(); // text lengths changed, so scroll positions did too
  }

  // Called once at the end of each page, before the motion layer runs.
  function start() {
    apply();
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-set-lang]');
      if (b) setLang(b.dataset.setLang);
    });
    root.classList.remove('i18n-wait');
  }

  window.slrI18n = {
    start, setLang,
    lang: () => lang,
    // The sample draft in the current language; `isSample` knows both versions.
    sample: en => (lang === 'de' && SAMPLES[en]) || en,
    samples: en => (SAMPLES[en] ? [en, SAMPLES[en]] : [en]),
  };
})();
