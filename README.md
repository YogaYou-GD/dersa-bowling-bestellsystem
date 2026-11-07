# DERSA Bowling – digitales Kellner-Bestellsystem

Eine responsive Web-App für sechs Bowlingbahnen. Kellner melden sich an, erfassen Bestellungen und alle angemeldeten Geräte sehen die offenen Bestellungen live. Erledigte Bestellungen können abgehakt werden und verschwinden aus der offenen Liste.

## Was enthalten ist

- Login mit Benutzernamen `Kellner1`, `Kellner2`, … und individuellen Passwörtern
- Auswahl Bahn 1 bis 6
- Getränkekarte mit Kategorien, Warenkorb und Mengen
- Gemeinsame Live-Übersicht aller offenen Bestellungen
- Anzeige, welcher Kellner eine Bestellung aufgenommen hat
- Abhaken erledigter Bestellungen
- Supabase Auth, PostgreSQL, Row Level Security und Realtime
- Automatisches kostenloses Deployment auf GitHub Pages (für öffentliche GitHub-Free-Repositories)

> Die Getränkeliste und Beispielpreise sind Startwerte. Bitte vor dem echten Einsatz mit der aktuellen Getränkekarte abgleichen. Die Liste in `src/drinks.js` lässt sich leicht bearbeiten.

## Teil A – Supabase-Datenbank einrichten

1. Bei [Supabase](https://supabase.com/) ein kostenloses Projekt erstellen.
2. Im Projekt links **SQL Editor** öffnen.
3. Den kompletten Inhalt von `supabase/schema.sql` hineinkopieren und **Run** drücken.
4. Unter **Project Settings → API** die **Project URL** und den **Publishable key** (bei älteren Projekten ggf. `anon` key) kopieren.
5. Unter **Authentication → Sign In / Providers → Email** die E-Mail-Bestätigung deaktivieren, damit die Team-Logins ohne E-Mail-Link funktionieren. Das ist nur sinnvoll, weil die Konten vorher von einer verantwortlichen Person angelegt werden.
6. Unter **Authentication → Users → Add user** die Konten einzeln anlegen. Für den Benutzernamen `Kellner1` verwendest du diese E-Mail-Adresse:
   - `kellner1@dersabowling.de`
   - `kellner2@dersabowling.de`
   - `kellner3@dersabowling.de`
   - usw.

   Für jedes Konto ein eigenes Passwort setzen und **Auto Confirm User** aktivieren. Die Kellner geben später in der App nur `Kellner1` und ihr Passwort ein. Die E-Mail-Adresse ist nur die technische Zuordnung im Hintergrund.
7. Für den echten Betrieb sichere, unterschiedliche Passwörter vergeben und nicht das bisherige gemeinsame Passwort weiterverwenden.

## Teil B – Projekt auf GitHub veröffentlichen

1. Das ZIP entpacken.
2. Bei [GitHub](https://github.com/) anmelden und ein neues **Public repository** erstellen, z. B. `dersa-bowling-bestellsystem`.
3. Alle Dateien und Ordner aus diesem Projekt in das Repository hochladen. Wichtig: Auch den Ordner `.github/workflows` mit hochladen.
4. Im Repository **Settings → Secrets and variables → Actions → Variables** öffnen und zwei Repository Variables anlegen:
   - `VITE_SUPABASE_URL` = deine Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = dein Supabase Publishable Key (oder alter anon key)
5. **Settings → Pages** öffnen und bei **Build and deployment → Source** die Option **GitHub Actions** auswählen.
6. Den Upload/Commit auf den Branch `main` abschließen. Unter **Actions** den Workflow „Deploy DERSA Bowling to GitHub Pages“ beobachten.
7. Nach erfolgreichem Lauf findest du die öffentliche Adresse unter **Settings → Pages**. Sie sieht ungefähr so aus: `https://DEIN-GITHUB-NAME.github.io/dersa-bowling-bestellsystem/`.

Die App wird bei jedem neuen Commit auf `main` automatisch neu veröffentlicht.

## Teil C – Lokal testen (optional)

Node.js installieren, im Projektordner ein Terminal öffnen und ausführen:

```bash
npm install
cp .env.example .env
```

Dann `.env` mit Supabase URL und Publishable Key befüllen und starten:

```bash
npm run dev
```

Die angezeigte lokale Adresse im Browser öffnen.

## Sicherheit – bitte beachten

- **Niemals** den Supabase `service_role`- oder Secret-Key in diese Web-App, in GitHub oder in `.env` für den Browser eintragen. Nur der Publishable/anon-Key gehört in die Frontend-App.
- Die Datenbank ist durch Row Level Security geschützt. Nicht angemeldete Besucher können keine Bestellungen lesen oder ändern.
- Alle angemeldeten Kellner dürfen alle Bestellungen sehen und als erledigt markieren – das ist für die gemeinsame Schichtübersicht so vorgesehen.
- GitHub Pages ist öffentlich erreichbar. Das ist in Ordnung: Bestellungen und Benutzerkonten liegen nicht im GitHub-Repository, sondern geschützt bei Supabase.
- Kostenlose Tarife haben Nutzungsgrenzen und können sich ändern. Bei längerer Inaktivität kann ein kostenloses Supabase-Projekt pausiert werden; die aktuellen Bedingungen bitte beim Anbieter prüfen.
- Dies ist ein vorbereitetes Starterprojekt. Vor echtem Einsatz bitte mit Testkonten und mehreren Geräten testen.

## Bedienung

1. Kellner meldet sich an.
2. Bahn wählen.
3. Getränke in den Warenkorb legen und Bestellung absenden.
4. Alle eingeloggten Geräte sehen die Bestellung unter „Offene Bestellungen“.
5. Ein Kellner hakt sie ab. Sie verschwindet sofort aus der offenen Liste.

## Getränkeliste bearbeiten

Die Startliste befindet sich in `src/drinks.js`. Namen, Größen, Kategorien und Preise dort anpassen. Es sind zunächst alkoholfreie Getränke eingetragen.
