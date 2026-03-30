/**
 * AppFabrik App Base — Tenant Configuration
 * ==========================================
 * Jeder Tenant konfiguriert diese Datei.
 * Alle anderen Dateien bleiben unberührt.
 *
 * Validierung erfolgt automatisch beim App-Start über validateTenantConfig().
 */

import { z } from 'zod';

// ─── Schema ──────────────────────────────────────────────────────────────────

const TenantBrandSchema = z.object({
  /** Primärfarbe (Hex) */
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  /** Sekundärfarbe / Akzent */
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  /** Hintergrundfarbe */
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  /** Textfarbe auf primär */
  primaryTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  /** App-Name (erscheint in der UI) */
  appName: z.string().min(1),
  /** Kurz-Beschreibung (Splash Screen) */
  tagline: z.string().optional(),
});

const TenantApiSchema = z.object({
  /** Base URL der REST-API */
  baseUrl: z.string().url(),
  /** Timeout in ms */
  timeoutMs: z.number().default(15000),
  /** API-Version Prefix */
  versionPrefix: z.string().default('/api/v1'),
});

const TenantEasSchema = z.object({
  /** EAS Project ID von expo.dev */
  projectId: z.string().uuid(),
  /** Android Bundle Identifier */
  androidPackage: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
  /** iOS Bundle Identifier */
  iosBundleIdentifier: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
  /** App Slug (expo.dev) */
  slug: z.string().min(1),
});

const TenantFeaturesSchema = z.object({
  /** GPS-Tracking aktivieren */
  gpsTracking: z.boolean().default(false),
  /** Foto-Upload aktivieren */
  photoUpload: z.boolean().default(true),
  /** Digitale Signatur aktivieren */
  digitalSignature: z.boolean().default(false),
  /** Zeiterfassung aktivieren */
  timeTracking: z.boolean().default(true),
  /** Analytics aktivieren */
  analytics: z.boolean().default(true),
  /** Push Notifications */
  pushNotifications: z.boolean().default(true),
  /** OTA Updates */
  otaUpdates: z.boolean().default(true),
  /** Offline-Modus */
  offlineMode: z.boolean().default(true),
});

export const TenantConfigSchema = z.object({
  /** Eindeutiger Tenant-Slug (lowercase, kebab-case) */
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Slug muss lowercase kebab-case sein'),
  /** App-Version */
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  /** Android Version Code */
  versionCode: z.number().int().positive(),
  /** Branding */
  brand: TenantBrandSchema,
  /** API-Konfiguration */
  api: TenantApiSchema,
  /** EAS Build-Konfiguration */
  eas: TenantEasSchema,
  /** Feature Flags */
  features: TenantFeaturesSchema,
  /** Sentry DSN (optional) */
  sentryDsn: z.string().url().optional(),
  /** Primäre Sprache (BCP 47) */
  locale: z.string().default('de-DE'),
  /** Zeitzone */
  timezone: z.string().default('Europe/Berlin'),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;
export type TenantBrand = z.infer<typeof TenantBrandSchema>;
export type TenantFeatures = z.infer<typeof TenantFeaturesSchema>;

// ─── Validierung ─────────────────────────────────────────────────────────────

/**
 * Validiert die Tenant-Konfiguration beim App-Start.
 * Wirft einen Fehler wenn die Konfiguration ungültig ist.
 */
export function validateTenantConfig(config: unknown): TenantConfig {
  const result = TenantConfigSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`❌ Ungültige Tenant-Konfiguration:\n${errors}`);
  }
  return result.data;
}

// ─── Beispiel-Konfiguration (TEMPLATE — ersetzen!) ───────────────────────────

/**
 * TEMPLATE-Konfiguration — in tenant-specific repo durch echte Werte ersetzen!
 *
 * Kopiere diese Datei in dein Tenant-Repo und passe alle Werte an.
 * Niemals Produktions-Credentials hier committen!
 */
export const tenantConfig: TenantConfig = validateTenantConfig({
  slug: 'appfabrik-template',
  version: '1.0.0',
  versionCode: 1,

  brand: {
    primaryColor: '#1A1A2E',
    accentColor: '#4A90D9',
    backgroundColor: '#F5F5F5',
    primaryTextColor: '#FFFFFF',
    appName: 'AppFabrik Template',
    tagline: 'Digitales Betriebssystem',
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com',
    timeoutMs: 15000,
    versionPrefix: '/api/v1',
  },

  eas: {
    projectId: process.env.EXPO_PROJECT_ID ?? '00000000-0000-0000-0000-000000000000',
    androidPackage: 'com.appfabrik.template',
    iosBundleIdentifier: 'com.appfabrik.template',
    slug: 'appfabrik-template',
  },

  features: {
    gpsTracking: false,
    photoUpload: true,
    digitalSignature: false,
    timeTracking: true,
    analytics: true,
    pushNotifications: true,
    otaUpdates: true,
    offlineMode: true,
  },

  locale: 'de-DE',
  timezone: 'Europe/Berlin',
});

export default tenantConfig;
