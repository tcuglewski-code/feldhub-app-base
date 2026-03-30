/**
 * AppFabrik App Base — Core WatermelonDB Schema
 * ===============================================
 * Generisches Basis-Schema für alle AppFabrik Tenants.
 *
 * Enthält die 7 Core-Tabellen die jede AppFabrik-App hat:
 *   employees, orders, work_logs, photos, teams, sync_queue, analytics_events
 *
 * Tenant-spezifische Tabellen → models/tenant-schema.ts (pro Repo)
 *
 * Zum Mergen:
 *   import { mergeSchemas } from './schema-utils';
 *   import { schema as coreSchema } from 'appfabrik-app-base/models/core-schema';
 *   import { tenantTables } from './tenant-schema';
 *   export const schema = mergeSchemas(coreSchema, tenantTables);
 */

import { appSchema, tableSchema, TableSchema, ColumnSchema } from '@nozbe/watermelondb';

// ─── Core Tables ─────────────────────────────────────────────────────────────

/**
 * employees — Mitarbeiter/Nutzer
 * Generic: Name, Email, Rolle, Team, Aktiv-Status
 */
export const employeesTable: TableSchema = tableSchema({
  name: 'employees',
  columns: [
    { name: 'server_id',    type: 'string',  isIndexed: true },
    { name: 'name',         type: 'string' },
    { name: 'email',        type: 'string',  isOptional: true },
    { name: 'phone',        type: 'string',  isOptional: true },
    { name: 'role',         type: 'string' },              // 'admin' | 'manager' | 'worker'
    { name: 'team_id',      type: 'string',  isOptional: true, isIndexed: true },
    { name: 'avatar_url',   type: 'string',  isOptional: true },
    { name: 'active',       type: 'boolean' },
    { name: 'metadata_json', type: 'string', isOptional: true }, // Tenant-spezifische Felder
    { name: 'synced',       type: 'boolean' },
    { name: 'created_at',   type: 'number' },
    { name: 'updated_at',   type: 'number' },
  ],
});

/**
 * orders — Aufträge / Jobs / Projekte
 * Generic: Title, Status, Kunde, Zeitraum, GPS
 * Tenant-spezifische Felder → metadata_json
 */
export const ordersTable: TableSchema = tableSchema({
  name: 'orders',
  columns: [
    { name: 'server_id',      type: 'string',  isIndexed: true },
    { name: 'title',          type: 'string' },
    { name: 'description',    type: 'string',  isOptional: true },
    { name: 'status',         type: 'string',  isIndexed: true }, // 'planned' | 'active' | 'completed' | 'cancelled'
    { name: 'priority',       type: 'string',  isOptional: true }, // 'high' | 'medium' | 'low'
    { name: 'customer_name',  type: 'string' },
    { name: 'customer_id',    type: 'string',  isOptional: true, isIndexed: true },
    { name: 'assigned_team_id', type: 'string', isOptional: true, isIndexed: true },
    { name: 'start_date',     type: 'number',  isOptional: true },
    { name: 'end_date',       type: 'number',  isOptional: true },
    { name: 'latitude',       type: 'number',  isOptional: true },
    { name: 'longitude',      type: 'number',  isOptional: true },
    { name: 'address',        type: 'string',  isOptional: true },
    { name: 'metadata_json',  type: 'string',  isOptional: true }, // Tenant-spezifische Felder
    { name: 'synced',         type: 'boolean' },
    { name: 'created_at',     type: 'number' },
    { name: 'updated_at',     type: 'number' },
  ],
});

/**
 * work_logs — Arbeitsprotokolle / Stunden
 * Generic: Order-Ref, Employee-Ref, Zeit, Arbeitstyp, Notizen
 */
export const workLogsTable: TableSchema = tableSchema({
  name: 'work_logs',
  columns: [
    { name: 'server_id',     type: 'string',  isIndexed: true },
    { name: 'order_id',      type: 'string',  isIndexed: true },
    { name: 'employee_id',   type: 'string',  isIndexed: true },
    { name: 'date',          type: 'number',  isIndexed: true },
    { name: 'start_time',    type: 'number' },
    { name: 'end_time',      type: 'number',  isOptional: true },
    { name: 'break_minutes', type: 'number' },
    { name: 'work_type',     type: 'string' },              // Tenant-definiert
    { name: 'notes',         type: 'string',  isOptional: true },
    { name: 'latitude',      type: 'number',  isOptional: true },
    { name: 'longitude',     type: 'number',  isOptional: true },
    { name: 'metadata_json', type: 'string',  isOptional: true }, // Mengen, Ergebnis-Felder
    { name: 'synced',        type: 'boolean' },
    { name: 'created_at',    type: 'number' },
    { name: 'updated_at',    type: 'number' },
  ],
});

/**
 * photos — Foto-Uploads
 * Generic: Order/WorkLog-Ref, Local URI, Remote URL, GPS, Status
 */
export const photosTable: TableSchema = tableSchema({
  name: 'photos',
  columns: [
    { name: 'server_id',     type: 'string',  isIndexed: true },
    { name: 'order_id',      type: 'string',  isIndexed: true },
    { name: 'work_log_id',   type: 'string',  isOptional: true, isIndexed: true },
    { name: 'local_uri',     type: 'string' },
    { name: 'remote_url',    type: 'string',  isOptional: true },
    { name: 'photo_type',    type: 'string',  isOptional: true }, // 'before' | 'after' | 'issue'
    { name: 'caption',       type: 'string',  isOptional: true },
    { name: 'latitude',      type: 'number',  isOptional: true },
    { name: 'longitude',     type: 'number',  isOptional: true },
    { name: 'upload_status', type: 'string' },               // 'pending' | 'uploading' | 'done' | 'error'
    { name: 'upload_attempts', type: 'number' },
    { name: 'taken_by',      type: 'string' },
    { name: 'synced',        type: 'boolean' },
    { name: 'created_at',    type: 'number' },
  ],
});

/**
 * teams — Teams / Gruppen
 */
export const teamsTable: TableSchema = tableSchema({
  name: 'teams',
  columns: [
    { name: 'server_id',  type: 'string',  isIndexed: true },
    { name: 'name',       type: 'string' },
    { name: 'leader_id',  type: 'string',  isOptional: true },
    { name: 'active',     type: 'boolean' },
    { name: 'metadata_json', type: 'string', isOptional: true },
    { name: 'updated_at', type: 'number' },
  ],
});

/**
 * sync_queue — Offline-Sync-Queue
 * Speichert lokal erstellte/geänderte Records bis Sync möglich
 */
export const syncQueueTable: TableSchema = tableSchema({
  name: 'sync_queue',
  columns: [
    { name: 'table_name',  type: 'string',  isIndexed: true },
    { name: 'record_id',   type: 'string' },
    { name: 'action',      type: 'string' },  // 'create' | 'update' | 'delete'
    { name: 'payload',     type: 'string' },  // JSON
    { name: 'attempts',    type: 'number' },
    { name: 'last_error',  type: 'string',  isOptional: true },
    { name: 'created_at',  type: 'number' },
  ],
});

/**
 * analytics_events — App-Analytics
 */
export const analyticsEventsTable: TableSchema = tableSchema({
  name: 'analytics_events',
  columns: [
    { name: 'event_type',     type: 'string',  isIndexed: true },
    { name: 'event_name',     type: 'string',  isIndexed: true },
    { name: 'was_offline',    type: 'boolean' },
    { name: 'user_id',        type: 'string',  isOptional: true },
    { name: 'metadata_json',  type: 'string',  isOptional: true },
    { name: 'created_at',     type: 'number',  isIndexed: true },
  ],
});

// ─── Zusammengeführtes Core-Schema ───────────────────────────────────────────

export const CORE_SCHEMA_VERSION = 1;

export const schema = appSchema({
  version: CORE_SCHEMA_VERSION,
  tables: [
    employeesTable,
    ordersTable,
    workLogsTable,
    photosTable,
    teamsTable,
    syncQueueTable,
    analyticsEventsTable,
  ],
});

// ─── Schema-Merge Utility ─────────────────────────────────────────────────────

/**
 * Mergt Tenant-spezifische Tabellen in das Core-Schema.
 *
 * @example
 * // In tenant-repo: models/tenant-schema.ts
 * import { mergeSchemas, schema as coreSchema } from 'appfabrik-app-base/models/core-schema';
 * import { tenantTables } from './tenant-tables';
 *
 * export const schema = mergeSchemas(coreSchema, tenantTables, 2);
 */
export function mergeSchemas(
  baseSchema: ReturnType<typeof appSchema>,
  additionalTables: TableSchema[],
  newVersion?: number,
): ReturnType<typeof appSchema> {
  return appSchema({
    version: newVersion ?? baseSchema.version,
    tables: [...baseSchema.tables, ...additionalTables],
  });
}

export type CoreTableName = 'employees' | 'orders' | 'work_logs' | 'photos' | 'teams' | 'sync_queue' | 'analytics_events';
