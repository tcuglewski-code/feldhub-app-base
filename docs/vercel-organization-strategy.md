# Vercel Organization Strategy — AppFabrik

> Konzept: Alle Projekte zentral unter einer Vercel Organization verwalten

**Status:** Konzept abgeschlossen — Umsetzung erfordert Tomek (Billing/Account)
**Erstellt:** 2026-03-30

---

## Ist-Situation

| Projekt | Vercel Account | Deployment |
|---------|---------------|-----------|
| ka-forstmanager | baerenklee (persönlich) | ka-forstmanager.vercel.app |
| mission-control | baerenklee (persönlich) | mission-control-tawny-omega.vercel.app |
| appfabrik-base | baerenklee (persönlich) | (noch kein Deploy) |

**Probleme:**
- Alle Projekte unter persönlichem Account → kein Business-Branding
- Kein zentrales Team-Management
- CNAME-Domains fehlen (Custom Domains)
- Kein Spending-Limit pro Projekt
- Kein Audit-Log

---

## Soll-Konzept: Vercel Organization "FELDWERK"

```
Vercel Organization: feldwerk
├── Teams
│   ├── Core (Amadeus + Tomek)
│   └── Clients (Read-Only pro Tenant)
│
├── Projekte
│   ├── mission-control          → mc.feldwerk.io
│   ├── appfabrik-base-docs      → docs.feldwerk.io
│   ├── ka-forstmanager          → forstmanager.kochaufforstung.de
│   ├── [tenant-2]-manager       → manager.[tenant-2].de
│   └── ...
│
└── Environment Variables (shared)
    ├── AMADEUS_TOKEN (global)
    └── ...tenant-spezifisch
```

---

## Schritte zur Umsetzung

### Phase 1: Organization erstellen (Tomek, ~15 Min)
1. vercel.com → Einstellungen → "Create Team"
2. Name: `feldwerk` oder `appfabrik`
3. Billing-Plan: **Pro** ($20/Monat) — nötig für benutzerdefinierte Domains + Teams
4. Tomeks persönliche Projekte migrieren (Vercel hat "Transfer"-Funktion)

### Phase 2: Projekte übertragen (Amadeus, nach Phase 1)
```bash
# Vercel CLI login mit Team
vercel login
vercel teams switch feldwerk

# Projekte dem Team zuweisen (via vercel.json scope)
# vercel.json: { "scope": "feldwerk" }
```

### Phase 3: Custom Domains einrichten
| Projekt | Domain | DNS-Eintrag |
|---------|--------|-------------|
| mission-control | mc.feldwerk.io | CNAME → cname.vercel-dns.com |
| ka-forstmanager | forstmanager.kochaufforstung.de | CNAME → cname.vercel-dns.com |
| appfabrik-docs | docs.feldwerk.io | CNAME → cname.vercel-dns.com |

### Phase 4: CI/CD Token für Subagenten
```bash
# Team-spezifischer Deploy-Token (ersetzt persönlichen Token)
# Vercel Dashboard → Team Settings → Tokens → "Create Token"
# Scope: "Deploy" (kein Admin-Zugriff nötig)
```

---

## Kosten-Kalkulation

| Plan | Preis | Features |
|------|-------|---------|
| Hobby (aktuell) | $0 | Nur persönliche Projekte |
| **Pro** | $20/Monat | Teams, Custom Domains, 10 Members |
| Enterprise | $400/Monat | SOC2, SAML SSO, unbegrenzte Members |

**Empfehlung:** Pro-Plan ab Kunde #2

---

## vercel.json Template für AppFabrik Projekte

```json
{
  "scope": "feldwerk",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Priorität

**Jetzt:** Noch nicht nötig (nur 1 Kunde)
**Bei Kunde #2:** Phase 1+2 umsetzen
**Ab Kunde #3:** Phase 3+4 + Custom Domains

---

## Action Items (Tomek)

- [ ] Firmenname FELDWERK final bestätigen
- [ ] Vercel Pro Plan aktivieren (nach GmbH-Gründung)
- [ ] Vercel Team "feldwerk" erstellen
- [ ] Tomeks Projekte in Team übertragen

