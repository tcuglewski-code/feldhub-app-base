# AppFabrik App Base 📱

> White-Label React Native / Expo Template für Field-Service-Apps

## Überblick

`appfabrik-app-base` ist das generische Fundament für alle AppFabrik Mobile Apps.  
Jeder Tenant konfiguriert sich über `src/config/tenant.ts` — der Rest bleibt unverändert.

## Architektur

```
appfabrik-app-base/
├── src/
│   ├── config/        # Tenant-Konfiguration (tenant.ts + schema.ts)
│   ├── auth/          # Auth-System (JWT + Offline-Token)
│   ├── sync/          # WatermelonDB ↔ API Sync-Engine
│   ├── api/           # Generic API Client
│   ├── db/            # WatermelonDB Setup + Database Provider
│   ├── hooks/         # Shared Hooks (useSync, useAuth, useOffline)
│   ├── components/    # Base UI Components
│   └── utils/         # Utilities (Logging, Error Handling, etc.)
├── models/            # WatermelonDB Core Models
├── docs/              # Tenant-Setup Guide, Architecture Docs
├── scripts/           # EAS Build Helper Scripts
└── assets/            # Placeholder Assets (replace per Tenant)
```

## Quick Start für neuen Tenant

1. **Repo klonen:** `git clone https://github.com/tcuglewski-code/appfabrik-app-base new-tenant-app`
2. **Tenant konfigurieren:** `src/config/tenant.ts` anpassen
3. **Schema erweitern:** `models/tenant-schema.ts` mit tenant-spezifischen Tabellen
4. **EAS einrichten:** `scripts/setup-tenant.sh <tenant-slug>` ausführen
5. **Build:** `eas build --profile preview --platform android`

## Tenant-spezifische Anpassungen

| Was | Datei | Erforderlich? |
|-----|-------|--------------|
| App-Name, Slug, Bundle-ID | `src/config/tenant.ts` | ✅ Ja |
| API Base URL | `src/config/tenant.ts` | ✅ Ja |
| DB-Schema Erweiterungen | `models/tenant-schema.ts` | ✅ Ja |
| Farben, Fonts | `src/config/tenant.ts` | ✅ Ja |
| Push Notifications | `src/config/tenant.ts` | Optional |
| EAS Project ID | `src/config/tenant.ts` | ✅ Ja |
| App Icons | `assets/icon.png`, `assets/splash.png` | ✅ Ja |

## Core Features (out-of-the-box)

- ✅ **Offline-First** via WatermelonDB
- ✅ **Auth System** (JWT + Secure Store)
- ✅ **Background Sync** (Retry-Queue)
- ✅ **API Client** (Axios + Interceptors)
- ✅ **Error Handling** (Sentry-ready)
- ✅ **EAS Build Pipeline** (dev/preview/production)
- ✅ **OTA Updates** (Expo Updates)
- ✅ **Push Notifications** (Expo Notifications)

## Basis-Datenmodell (Core)

Jede AppFabrik-App bekommt folgende Core-Tabellen:
- `employees` — Nutzer/Mitarbeiter
- `orders` — Aufträge/Jobs/Projekte
- `work_logs` — Arbeitsprotokolle
- `photos` — Foto-Uploads
- `teams` — Teams/Gruppen
- `sync_queue` — Offline-Sync-Queue
- `analytics_events` — App-Analytics

Tenant-spezifische Tabellen kommen in `models/tenant-schema.ts`.

## Technologie-Stack

| Layer | Technologie |
|-------|-------------|
| Framework | Expo SDK 54 + Expo Router |
| Sprache | TypeScript |
| Offline DB | WatermelonDB (SQLite) |
| State Management | Zustand + React Query |
| Styling | NativeWind (Tailwind CSS) |
| Auth | JWT + expo-secure-store |
| Build | EAS Build |
| Updates | Expo Updates (OTA) |
| Monitoring | Sentry |
| Testing | Jest + Detox |

## Versionierung

- `appfabrik-app-base@1.0.0` — Initiale Extraktion aus `ka-app` (Sprint HF/HG)
- Jeder Tenant erhält eigenen Release-Tag

---

*AppFabrik — Digitale Betriebssysteme für KMU im Außendienst*
