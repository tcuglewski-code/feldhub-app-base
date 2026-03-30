/**
 * AppFabrik App Base — Core Schema Migrations
 * =============================================
 * WatermelonDB Migrations für Core-Tabellen.
 * Tenant-spezifische Migrations kommen in tenant-repo.
 *
 * Migration Strategy:
 * - v1 → v2: Neue Core-Spalten
 * - v2 → v3: Neue Core-Tabellen
 *
 * Tenant ergänzt eigene Migrations:
 * addMigrations(coreMigrations, tenantMigrations)
 */

import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const coreMigrations = schemaMigrations({
  migrations: [
    // v1 ist das initiale Schema (kein Migration-Eintrag nötig)

    // Beispiel für zukünftige Migrations:
    // {
    //   toVersion: 2,
    //   steps: [
    //     addColumns({
    //       table: 'orders',
    //       columns: [
    //         { name: 'new_field', type: 'string', isOptional: true },
    //       ],
    //     }),
    //   ],
    // },
  ],
});

/**
 * Kombiniert Core-Migrations mit Tenant-Migrations.
 */
export function addMigrations(
  base: ReturnType<typeof schemaMigrations>,
  tenant: ReturnType<typeof schemaMigrations>,
): ReturnType<typeof schemaMigrations> {
  return schemaMigrations({
    migrations: [...base.migrations, ...tenant.migrations],
  });
}
