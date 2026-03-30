# Neon DB Multi-Tenant Strategie — AppFabrik

> Konzept: Ein Neon-Projekt pro Tenant — Isolation, Skalierung, Kosten

**Status:** Konzept final — Umsetzung ab Tenant #2
**Erstellt:** 2026-03-30
**Autor:** Amadeus

---

## TL;DR

Jeder AppFabrik-Tenant bekommt sein **eigenes Neon-Projekt** (eigene DB-Instanz).
Kein Shared Schema. Keine Row-Level-Security-Hacks. Volle Isolation.

---

## Warum eigene DB pro Tenant?

### Option A: Shared Database (anti-pattern)
```
PostgreSQL
└── public schema (oder tenant_1, tenant_2 schemas)
    ├── users_tenant_1
    ├── orders_tenant_1
    ├── users_tenant_2
    └── orders_tenant_2
```
❌ Datenleak-Risiko (falsche WHERE-Clause → alle Tenants lesen)
❌ Performance-Probleme wenn Tenant-A viel Last macht
❌ Backup ist komplex (1 Dump = alle Tenants)
❌ DSGVO: Datentrennung schwer nachweisbar

### Option B: Row-Level-Security (RLS)
```
PostgreSQL
└── public schema
    ├── orders (mit tenant_id Spalte + RLS Policy)
    └── users  (mit tenant_id Spalte + RLS Policy)
```
⚠️ Besser als Option A, aber komplexer
⚠️ Requires SET LOCAL app.current_tenant = '...' für jede Query
⚠️ Prisma: Kein nativer RLS-Support → Middleware nötig
⚠️ Fehleranfällig bei Raw Queries

### ✅ Option C: Eigenes Neon-Projekt pro Tenant (gewählt)
```
Neon Account (AppFabrik)
├── Projekt: ka-forstmanager
│   └── Branch: main → postgresql://...neon.tech/ka_forstmanager
├── Projekt: tenant-2
│   └── Branch: main → postgresql://...neon.tech/tenant_2
└── Projekt: tenant-3
    └── Branch: main → postgresql://...neon.tech/tenant_3
```
✅ Volle Isolation — keine Datenlecks möglich
✅ Eigenes Backup pro Tenant
✅ Neon Branching: Staging/Dev-Branch pro Tenant
✅ DSGVO: Tenant kann Löschung des gesamten Projekts verlangen
✅ Performance-Isolation

---

## Neon Projekt-Struktur pro Tenant

```
Neon Projekt: <tenant-slug>
├── Branches
│   ├── main (Production) ←── App + API
│   ├── staging           ←── Testing
│   └── dev               ←── Entwicklung
│
├── Compute (Auto-suspend nach 5 Min Inaktivität)
│   └── Standard: 0.25 vCPU, 1 GB RAM (skaliert automatisch)
│
└── Connection Strings
    ├── DATABASE_URL=postgresql://...@main.neon.tech/dbname?sslmode=require
    └── DIRECT_URL=postgresql://...@main.neon.tech/dbname (für Prisma Migrate)
```

---

## Prisma Schema (Core) in appfabrik-base

```prisma
// prisma/schema.prisma (appfabrik-base Template)
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ── Core Models (alle Tenants) ──────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   // 'admin' | 'manager' | 'worker'
  teamId    String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  team      Team?    @relation(fields: [teamId], references: [id])
  orders    Order[]  @relation("AssignedOrders")
  workLogs  WorkLog[]
}

model Team {
  id        String   @id @default(cuid())
  name      String
  leaderId  String?
  active    Boolean  @default(true)
  updatedAt DateTime @updatedAt

  members   User[]
  orders    Order[]
}

model Order {
  id           String   @id @default(cuid())
  title        String
  description  String?
  status       String   // 'planned' | 'active' | 'completed' | 'cancelled'
  priority     String?
  customerName String
  customerId   String?
  teamId       String?
  startDate    DateTime?
  endDate      DateTime?
  latitude     Float?
  longitude    Float?
  metadata     Json?    // tenant-spezifische Felder
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  team         Team?    @relation(fields: [teamId], references: [id])
  workLogs     WorkLog[]
  photos       Photo[]
}

model WorkLog {
  id           String   @id @default(cuid())
  orderId      String
  userId       String
  date         DateTime
  startTime    DateTime
  endTime      DateTime?
  breakMinutes Int      @default(0)
  workType     String
  notes        String?
  latitude     Float?
  longitude    Float?
  metadata     Json?    // tenant-spezifische Mengendaten etc.
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  order        Order    @relation(fields: [orderId], references: [id])
  user         User     @relation(fields: [userId], references: [id])
  photos       Photo[]
}

model Photo {
  id           String   @id @default(cuid())
  orderId      String
  workLogId    String?
  localUri     String?
  remoteUrl    String?
  photoType    String?
  caption      String?
  latitude     Float?
  longitude    Float?
  takenBy      String
  uploadStatus String   // 'pending' | 'done' | 'error'
  createdAt    DateTime @default(now())

  order        Order    @relation(fields: [orderId], references: [id])
  workLog      WorkLog? @relation(fields: [workLogId], references: [id])
}
```

---

## Tenant Onboarding — DB Setup

```bash
# 1. Neon Projekt erstellen (via Neon API oder Dashboard)
neonctl projects create --name <tenant-slug> --region eu-central-1

# 2. Connection String holen
neonctl connection-string <project-id> --branch main

# 3. In Vercel Environment Variables eintragen
vercel env add DATABASE_URL production < connection_string.txt
vercel env add DIRECT_URL production < direct_connection.txt

# 4. Prisma Schema deployen
DATABASE_URL=<connection-string> npx prisma migrate deploy

# 5. Seed-Daten (Admin-User, Beispiel-Daten)
DATABASE_URL=<connection-string> npx prisma db seed
```

---

## Kosten-Kalkulation Neon

| Plan | Preis | Compute-Stunden | Storage | Tenants |
|------|-------|----------------|---------|---------|
| Free | $0 | 191 h/Monat | 512 MB | 1-2 kleine |
| Launch | $19/Monat | 300 h/Monat | 10 GB | 3-5 |
| Scale | $69/Monat | 750 h/Monat | 50 GB | 10+ |

**Empfehlung:**
- 0-2 Tenants: Free Plan
- 3-5 Tenants: Launch Plan ($19 → ~€4/Tenant/Monat)
- 6+ Tenants: Scale Plan

---

## Backup-Strategie

Neon hat automatische Backups (Point-in-Time-Recovery, 7 Tage).

Zusätzlich: Täglicher pg_dump via Cron (Sprint HK):
```bash
# Cron: täglich 02:00 Uhr
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
# → Upload zu Nextcloud /Koch-Aufforstung/Backups/
```

---

## Neon CLI installieren

```bash
npm install -g neonctl
neonctl auth  # Browser-Auth mit Tomeks Account
```

---

## Action Items

- [x] Konzept erstellt (Sprint HJ)
- [ ] Neon Account unter Tomeks Email (neon.tech)
- [ ] `neonctl` in Subagenten-Toolchain aufnehmen (TOOLS.md)
- [ ] Erstes Tenant-Projekt (Koch Aufforstung) in Neon migrieren (nach GmbH-Gründung)
- [ ] Sprint HK: Backup-Automatisierung implementieren

---

*Fragen → Amadeus | Implementierung → Archie (DB-Agent)*
