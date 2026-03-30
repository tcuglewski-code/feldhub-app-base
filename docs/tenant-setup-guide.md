# AppFabrik App Base — Tenant Setup Guide

> Schritt-für-Schritt: Neue Kunden-App in &lt;1 Stunde einrichten

## Voraussetzungen

- Node.js 22+
- EAS CLI: `npm install -g eas-cli`
- Expo Account (unter `baerenklee`)
- GitHub PAT (Tomek stellt bereit)
- Android Studio / Xcode (optional, für lokale Tests)

---

## Schritt 1: Neues Repo erstellen

```bash
# AppFabrik App Base klonen
git clone https://github.com/tcuglewski-code/appfabrik-app-base <tenant-slug>-app
cd <tenant-slug>-app

# Git-History entfernen → frischer Start
rm -rf .git
git init
git remote add origin https://github.com/tcuglewski-code/<tenant-slug>-app.git
```

---

## Schritt 2: Tenant konfigurieren

```bash
# Setup-Script ausführen
./scripts/setup-tenant.sh <tenant-slug> "<App-Name>" "https://api.example.com"
```

Danach manuell in `src/config/tenant.ts` anpassen:
- `brand.primaryColor` — Primärfarbe des Unternehmens
- `brand.accentColor` — Akzentfarbe
- `brand.appName` — App-Name wie er in der UI erscheint
- `features.*` — Feature-Flags aktivieren/deaktivieren

---

## Schritt 3: EAS Projekt erstellen

```bash
# Neues EAS Projekt anlegen
eas project:create

# Project ID in src/config/tenant.ts + app.config.ts eintragen
# → eas.projectId: 'xxx-yyy-zzz'
```

---

## Schritt 4: Tenant-spezifisches DB-Schema

Erstelle `models/tenant-schema.ts` mit tenant-spezifischen Tabellen:

```typescript
import { tableSchema } from '@nozbe/watermelondb';
import { mergeSchemas, schema as coreSchema } from 'appfabrik-app-base/models/core-schema';

// Beispiel: Forst-spezifische Tabellen
const forestAreasTable = tableSchema({
  name: 'forest_areas',
  columns: [
    { name: 'server_id', type: 'string', isIndexed: true },
    { name: 'name', type: 'string' },
    { name: 'size_hectares', type: 'number' },
    // ... weitere tenant-spezifische Felder
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export const schema = mergeSchemas(coreSchema, [forestAreasTable], 2);
```

---

## Schritt 5: Assets

Ersetze alle Placeholder-Assets:

| Datei | Größe | Format |
|-------|-------|--------|
| `assets/icon.png` | 1024×1024 | PNG, kein Alpha |
| `assets/splash.png` | 1284×2778 | PNG |
| `assets/adaptive-icon.png` | 1024×1024 | PNG mit Alpha |
| `assets/notification-icon.png` | 96×96 | PNG, weiß |

---

## Schritt 6: API verbinden

In `src/api/client.ts` ist die Base URL bereits aus `tenant.ts` konfiguriert.

Stelle sicher dass die Backend-API folgende Endpoints anbietet:
- `POST /api/v1/auth/login` → `{ token, refreshToken, user }`
- `POST /api/v1/auth/refresh` → `{ token }`
- `GET /api/v1/sync/pull?since=<timestamp>` → `{ changes[] }`
- `POST /api/v1/sync/push` → `{ ok }`

---

## Schritt 7: Erster Build

```bash
# Development Build (Simulator)
eas build --profile development --platform android

# Preview APK (intern testen)
eas build --profile preview --platform android

# Production (App Store)
eas build --profile production --platform all
```

---

## Schritt 8: OTA Updates einrichten

Expo Updates ermöglicht App-Updates ohne Store-Review:

```bash
# Update publishen
eas update --channel production --message "Fix: Sync-Fehler behoben"
```

---

## Checkliste Tenant-Launch

- [ ] `src/config/tenant.ts` vollständig ausgefüllt
- [ ] EAS Project ID eingetragen
- [ ] Assets ersetzt (Icon, Splash, Adaptive Icon)
- [ ] `models/tenant-schema.ts` erstellt (falls extra Tabellen nötig)
- [ ] API-Endpunkte vom Backend bereit
- [ ] Preview Build erfolgreich
- [ ] Sentry DSN eingetragen (optional)
- [ ] Push Notification Credentials (optional)
- [ ] Interner Test auf 3 Geräten
- [ ] Production Build + App Store Upload

---

## EAS Credentials (für neuen Tenant)

### Android
```bash
# Keystore automatisch generieren
eas credentials --platform android
# → "Generate new keystore" wählen
# Keystore wird auf EAS gespeichert (kein lokaler Download nötig)
```

### iOS (optional)
```bash
eas credentials --platform ios
# → Apple Distribution Certificate + Provisioning Profile
```

---

## Umgebungsvariablen (.env.local)

```env
EXPO_PROJECT_ID=<eas-project-id>
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
SENTRY_DSN=https://xxx@sentry.io/yyy
EAS_ROBOT_TOKEN=<robot-token>
```

---

*Fragen? → Amadeus in Mission Control*
