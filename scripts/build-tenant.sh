#!/usr/bin/env bash
# =============================================================================
# AppFabrik App Base — Build Helper
# =============================================================================
# Startet EAS Build für einen Tenant.
#
# Usage:
#   ./scripts/build-tenant.sh [profile] [platform]
#
# Beispiele:
#   ./scripts/build-tenant.sh preview android
#   ./scripts/build-tenant.sh production android
#   ./scripts/build-tenant.sh production all
# =============================================================================

set -euo pipefail

PROFILE="${1:-preview}"
PLATFORM="${2:-android}"
EAS_ROBOT_TOKEN="${EAS_ROBOT_TOKEN:-}"

echo "🏗️  AppFabrik Build"
echo "=================="
echo "  Profil:   $PROFILE"
echo "  Platform: $PLATFORM"
echo ""

# Robot Token setzen wenn vorhanden
if [[ -n "$EAS_ROBOT_TOKEN" ]]; then
  export EXPO_TOKEN="$EAS_ROBOT_TOKEN"
  echo "  🤖 Robot Token aktiv"
fi

# Build starten
eas build \
  --profile "$PROFILE" \
  --platform "$PLATFORM" \
  --non-interactive

echo ""
echo "✅ Build gestartet! Status auf https://expo.dev"
