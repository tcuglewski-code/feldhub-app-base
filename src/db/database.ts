/**
 * AppFabrik App Base — Database Setup
 * =====================================
 * WatermelonDB Initialisierung mit Core-Schema.
 * Tenant kann eigene Tabellen via mergeSchemas() hinzufügen.
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema as coreSchema } from '../../models/core-schema';
import { tenantConfig } from '../config/tenant';

let database: Database | null = null;

/**
 * Initialisiert die WatermelonDB.
 * Wird einmal beim App-Start aufgerufen.
 */
export function initDatabase(schema = coreSchema): Database {
  if (database) return database;

  const adapter = new SQLiteAdapter({
    schema,
    dbName: `appfabrik_${tenantConfig.slug}`,
    jsi: true, // JSI für bessere Performance
    onSetUpError: (error) => {
      console.error('[AppFabrik DB] Setup-Fehler:', error);
    },
  });

  database = new Database({
    adapter,
    modelClasses: [], // Tenant fügt seine Models hier ein
  });

  return database;
}

export function getDatabase(): Database {
  if (!database) throw new Error('Datenbank nicht initialisiert. initDatabase() zuerst aufrufen.');
  return database;
}

export function resetDatabase(): void {
  database = null;
}
