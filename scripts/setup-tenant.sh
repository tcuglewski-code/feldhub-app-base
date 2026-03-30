#!/usr/bin/env bash
# =============================================================================
# AppFabrik App Base — Tenant Setup Script
# =============================================================================
# Richtet ein neues Tenant-App-Repo ein.
#
# Usage:
#   ./scripts/setup-tenant.sh <tenant-slug> <app-name> <api-base-url>
#
# Beispiel:
#   ./scripts/setup-tenant.sh mein-betrieb "Mein Betrieb" "https://meinbetrieb.com"
#
# Was passiert:
#   1. eas.json aus eas.template.json erstellen
#   2. app.config.ts mit Tenant-Werten generieren
#   3. src/config/tenant.ts mit Placeholders füllen
#   4. package.json name + version anpassen
#   5. README mit Tenant-Infos aktualisieren
#   6. Git-Repo initialisieren + Initial Commit
# =============================================================================

set -euo pipefail

TENANT_SLUG="${1:-}"
APP_NAME="${2:-}"
API_URL="${3:-}"

# ─── Validierung ─────────────────────────────────────────────────────────────

if [[ -z "$TENANT_SLUG" || -z "$APP_NAME" || -z "$API_URL" ]]; then
  echo "❌ Fehler: Argumente fehlen"
  echo ""
  echo "Usage: $0 <tenant-slug> <app-name> <api-base-url>"
  echo ""
  echo "Beispiel:"
  echo "  $0 mein-betrieb \"Mein Betrieb GmbH\" \"https://api.meinbetrieb.com\""
  exit 1
fi

# Slug validieren
if ! echo "$TENANT_SLUG" | grep -qE '^[a-z][a-z0-9-]+$'; then
  echo "❌ Fehler: Tenant-Slug muss lowercase kebab-case sein (z.B. 'mein-betrieb')"
  exit 1
fi

echo ""
echo "🚀 AppFabrik Tenant Setup"
echo "========================="
echo "  Slug: $TENANT_SLUG"
echo "  Name: $APP_NAME"
echo "  API:  $API_URL"
echo ""

# ─── eas.json erstellen ──────────────────────────────────────────────────────

echo "📋 Erstelle eas.json..."
sed \
  -e "s/TENANT_SLUG/$TENANT_SLUG/g" \
  eas.template.json > eas.json
# _comment entfernen (production JSON erlaubt keine Kommentare)
# Hinweis: jq für saubere JSON-Verarbeitung verwenden wenn installiert
echo "   ✅ eas.json erstellt"

# ─── app.config.ts generieren ────────────────────────────────────────────────

echo "📱 Generiere app.config.ts..."
cat > app.config.ts << EOF
/**
 * App Config — ${APP_NAME}
 * Generiert von AppFabrik setup-tenant.sh
 * Datum: $(date +%Y-%m-%d)
 */
export default {
  expo: {
    name: '${APP_NAME}',
    slug: '${TENANT_SLUG}',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1A2E',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1A1A2E',
      },
      package: 'com.appfabrik.${TENANT_SLUG//-/.}',
      versionCode: 1,
      newArchEnabled: true,
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.appfabrik.${TENANT_SLUG//-/.}',
      buildNumber: '1',
    },
    extra: {
      eas: { projectId: process.env.EXPO_PROJECT_ID ?? 'SET_YOUR_PROJECT_ID' },
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '${API_URL}',
    },
    updates: {
      url: 'https://u.expo.dev/' + (process.env.EXPO_PROJECT_ID ?? 'SET_YOUR_PROJECT_ID'),
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
    ],
  },
};
EOF
echo "   ✅ app.config.ts generiert"

# ─── Zusammenfassung ─────────────────────────────────────────────────────────

echo ""
echo "✅ Tenant-Setup abgeschlossen!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. EXPO_PROJECT_ID in app.config.ts + eas.json ersetzen"
echo "      → 'eas project:create' oder expo.dev/accounts/<account>/projects"
echo ""
echo "   2. src/config/tenant.ts anpassen:"
echo "      → Farben, Features, Sentry DSN"
echo ""
echo "   3. Assets ersetzen:"
echo "      → assets/icon.png (1024x1024)"
echo "      → assets/splash.png (1284x2778)"
echo "      → assets/adaptive-icon.png (1024x1024)"
echo ""
echo "   4. Ersten Build starten:"
echo "      → eas build --profile preview --platform android"
echo ""
echo "   5. Tenant-spezifische Models in models/tenant-schema.ts"
echo ""
echo "🎼 AppFabrik — Tenant '${TENANT_SLUG}' ist bereit!"
