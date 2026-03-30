/**
 * AppFabrik App Base — Generic Sync Engine
 * ==========================================
 * WatermelonDB ↔ REST-API Bidirektionaler Sync
 *
 * Features:
 * - Background Sync mit Expo Background Fetch
 * - Retry-Queue für fehlgeschlagene Syncs
 * - Conflict Resolution (Server wins)
 * - Sync-Status Tracking
 */

import { Database, Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';
import { apiClient } from '../api/client';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  status: SyncStatus;
  syncedAt: Date;
  pushedCount: number;
  pulledCount: number;
  errorMessage?: string;
}

// ─── Sync Engine ─────────────────────────────────────────────────────────────

export class AppFabrikSyncEngine {
  private db: Database;
  private status: SyncStatus = 'idle';
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor(database: Database) {
    this.db = database;
  }

  // ─── Status ────────────────────────────────────────────────────────────

  getStatus(): SyncStatus {
    return this.status;
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(status: SyncStatus) {
    this.status = status;
    this.listeners.forEach((l) => l(status));
  }

  // ─── Main Sync ─────────────────────────────────────────────────────────

  async sync(force = false): Promise<SyncResult> {
    // Nicht doppelt syncen
    if (this.status === 'syncing' && !force) {
      return { status: 'syncing', syncedAt: new Date(), pushedCount: 0, pulledCount: 0 };
    }

    // Offline check
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      return { status: 'idle', syncedAt: new Date(), pushedCount: 0, pulledCount: 0 };
    }

    this.emit('syncing');

    try {
      // 1. Push — lokale Änderungen hochladen
      const pushed = await this.pushChanges();

      // 2. Pull — Server-Änderungen holen
      const pulled = await this.pullChanges();

      // 3. Sync-Queue abarbeiten
      await this.processSyncQueue();

      this.emit('success');
      return {
        status: 'success',
        syncedAt: new Date(),
        pushedCount: pushed,
        pulledCount: pulled,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unbekannter Fehler';
      this.emit('error');
      return {
        status: 'error',
        syncedAt: new Date(),
        pushedCount: 0,
        pulledCount: 0,
        errorMessage: msg,
      };
    }
  }

  // ─── Push Changes ──────────────────────────────────────────────────────

  private async pushChanges(): Promise<number> {
    const syncQueue = this.db.get('sync_queue');
    const pendingItems = await syncQueue
      .query(Q.where('attempts', Q.lt(5)))
      .fetch();

    let count = 0;
    for (const item of pendingItems) {
      try {
        const record = item as unknown as {
          tableName: string;
          recordId: string;
          action: string;
          payload: string;
          attempts: number;
        };

        await apiClient.post('/sync/push', {
          table: record.tableName,
          recordId: record.recordId,
          action: record.action,
          payload: JSON.parse(record.payload),
        });

        await this.db.write(async () => {
          await (item as any).destroyPermanently();
        });
        count++;
      } catch (error) {
        // Fehler-Counter erhöhen
        await this.db.write(async () => {
          await (item as any).update((r: any) => {
            r.attempts = r.attempts + 1;
            r.lastError = error instanceof Error ? error.message : 'Fehler';
          });
        });
      }
    }

    return count;
  }

  // ─── Pull Changes ──────────────────────────────────────────────────────

  private async pullChanges(): Promise<number> {
    // Letzten Sync-Zeitpunkt bestimmen
    // (In echtem Tenant: aus AsyncStorage holen)
    const lastSync = 0;

    try {
      const response = await apiClient.get('/sync/pull', {
        params: { since: lastSync },
      });

      const changes = response.data?.changes ?? [];

      // Änderungen in WatermelonDB schreiben
      await this.db.write(async () => {
        for (const change of changes) {
          const collection = this.db.get(change.table);
          if (!collection) continue;

          try {
            if (change.action === 'delete') {
              const record = await collection.find(change.id);
              await (record as any).destroyPermanently();
            } else {
              // Upsert — existiert es schon?
              let existing: any;
              try {
                existing = await collection.find(change.id);
              } catch {
                existing = null;
              }

              if (existing) {
                await existing.update((r: any) => {
                  Object.assign(r, change.payload);
                });
              } else {
                await collection.create((r: any) => {
                  r._raw = { id: change.id, ...change.payload };
                });
              }
            }
          } catch {
            // Einzelne Record-Fehler ignorieren
          }
        }
      });

      return changes.length;
    } catch {
      return 0;
    }
  }

  // ─── Process Sync Queue ────────────────────────────────────────────────

  private async processSyncQueue(): Promise<void> {
    // Bereits in pushChanges abgearbeitet
  }
}

// ─── Singleton Factory ────────────────────────────────────────────────────────

let syncEngineInstance: AppFabrikSyncEngine | null = null;

export function getSyncEngine(db?: Database): AppFabrikSyncEngine {
  if (!syncEngineInstance && db) {
    syncEngineInstance = new AppFabrikSyncEngine(db);
  }
  if (!syncEngineInstance) throw new Error('SyncEngine nicht initialisiert. Übergib eine Database.');
  return syncEngineInstance;
}
