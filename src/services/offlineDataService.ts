// offlineDataService.ts
// Robust offline-first data capture and sync for crate scans and submissions
// Uses IndexedDB (with fallback to localStorage)

import { openDB, DBSchema } from 'idb';

// Define the schema for IndexedDB
export interface CrateScan {
  id: string; // unique (timestamp or uuid)
  crateId: string;
  breadQuantity: number;
  deviceScanId?: string;
  isOfflineScan: boolean;
  stockSource?: string;
  dispatchOrderRef?: string;
  donationBatchRef?: string;
  location?: string;
  createdAt: string;
  synced: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any; // original payload for submission (cannot type strictly due to dynamic API payloads)

}

interface OfflineDB extends DBSchema {
  crateScans: {
    key: string; // id
    value: CrateScan;
  };
}

const DB_NAME = 'thfc-offline-db';
const DB_VERSION = 1;

export async function getDB() {
  return openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('crateScans')) {
        const store = db.createObjectStore('crateScans', { keyPath: 'id' });
        // Use 'any' to avoid TS error due to index typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (store as any).createIndex('by-synced', 'synced');
      }
    },
  });
}

export async function saveCrateScan(scan: CrateScan) {
  const db = await getDB();
  await db.put('crateScans', scan);
}

export async function getPendingScans(): Promise<CrateScan[]> {
  const db = await getDB();
  try {
    // IndexedDB doesn't consistently handle boolean values as keys
    // Use 0 for false and 1 for true as numerical equivalents for indexing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db as any).getAllFromIndex('crateScans', 'by-synced', IDBKeyRange.only(0));
  } catch (error) {
    console.error('Error fetching pending scans:', error);
    return [];
  }
}

export async function markScanAsSynced(id: string) {
  const db = await getDB();
  const scan = await db.get('crateScans', id);
  if (scan) {
    scan.synced = true;
    await db.put('crateScans', scan);
  }
}

export async function deleteScan(id: string) {
  const db = await getDB();
  await db.delete('crateScans', id);
}

// Fallback to localStorage if IndexedDB is unavailable
function isIndexedDBAvailable() {
  try {
    return 'indexedDB' in window;
  } catch {
    return false;
  }
}

export async function saveCrateScanWithFallback(scan: CrateScan) {
  if (isIndexedDBAvailable()) {
    await saveCrateScan(scan);
  } else {
    const queue = JSON.parse(localStorage.getItem('crateScanQueue') || '[]');
    queue.push(scan);
    localStorage.setItem('crateScanQueue', JSON.stringify(queue));
  }
}

export async function getPendingScansWithFallback(): Promise<CrateScan[]> {
  if (isIndexedDBAvailable()) {
    return getPendingScans();
  } else {
    return JSON.parse(localStorage.getItem('crateScanQueue') || '[]');
  }
}

export async function markScanAsSyncedWithFallback(id: string) {
  if (isIndexedDBAvailable()) {
    await markScanAsSynced(id);
  } else {
    const queue: CrateScan[] = JSON.parse(localStorage.getItem('crateScanQueue') || '[]');
    const idx = queue.findIndex(q => q.id === id);
    if (idx !== -1) {
      queue[idx].synced = true;
      localStorage.setItem('crateScanQueue', JSON.stringify(queue));
    }
  }
}

export async function deleteScanWithFallback(id: string) {
  if (isIndexedDBAvailable()) {
    await deleteScan(id);
  } else {
    let queue: CrateScan[] = JSON.parse(localStorage.getItem('crateScanQueue') || '[]');
    queue = queue.filter(q => q.id !== id);
    localStorage.setItem('crateScanQueue', JSON.stringify(queue));
  }
}

// Background sync function
export async function syncPendingScans(
  submitFn: (scan: CrateScan) => Promise<unknown>
) {
  const pending = await getPendingScansWithFallback();
  for (const scan of pending) {
    if (!scan.synced) {
      try {
        await submitFn(scan);
        await markScanAsSyncedWithFallback(scan.id);
      } catch (e: unknown) {
        // Optionally, update scan.error or log error
        // (error message extraction removed since it was unused)
        continue;
      }
    }
  }
}

// Listen for online event to trigger sync
type SyncCallback = () => void;
let syncCallback: SyncCallback | null = null;

export function setSyncCallback(cb: SyncCallback) {
  syncCallback = cb;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (syncCallback) syncCallback();
  });
}
