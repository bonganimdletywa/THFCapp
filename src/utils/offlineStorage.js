// Offline storage utilities using IndexedDB
import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'thfc_offline_db';
const DB_VERSION = 1;

// Store names
const STORES = {
  OFFLINE_SCANS: 'offline_scans',
  SYNC_QUEUE: 'sync_queue',
  USER_DATA: 'user_data'
};

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>} - Database connection
 */
export async function initDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.OFFLINE_SCANS)) {
        const scanStore = db.createObjectStore(STORES.OFFLINE_SCANS, { keyPath: 'id', autoIncrement: true });
        scanStore.createIndex('timestamp', 'timestamp');
        scanStore.createIndex('synced', 'synced');
      }
      
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp');
        syncStore.createIndex('retries', 'retries');
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }
    }
  });
}

/**
 * Save a scan to offline storage
 * @param {Object} scanData - The scan data to store
 * @returns {Promise<number>} - The ID of the stored scan
 */
export async function saveOfflineScan(scanData) {
  const db = await initDatabase();
  
  // Prepare scan data with metadata
  const offlineScan = {
    ...scanData,
    device_scan_id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    synced: false,
    is_offline_scan: true
  };
  
  // Store the scan in offline storage
  const id = await db.add(STORES.OFFLINE_SCANS, offlineScan);
  
  // Add to sync queue for later synchronization
  await db.add(STORES.SYNC_QUEUE, {
    type: 'scan',
    data: offlineScan,
    timestamp: new Date().toISOString(),
    retries: 0
  });
  
  return id;
}

/**
 * Get all offline scans
 * @param {boolean} [includeSync=false] - Whether to include already synced scans
 * @returns {Promise<Array>} - Array of offline scans
 */
export async function getOfflineScans(includeSync = false) {
  const db = await initDatabase();
  
  if (includeSync) {
    return db.getAll(STORES.OFFLINE_SCANS);
  } else {
    // Only get unsynced scans
    const tx = db.transaction(STORES.OFFLINE_SCANS, 'readonly');
    const index = tx.store.index('synced');
    return index.getAll(IDBKeyRange.only(false));
  }
}

/**
 * Synchronize offline data with the server
 * @param {function} syncCallback - Callback function to handle synchronization of an item
 * @returns {Promise<Object>} - Result of synchronization with counts
 */
export async function syncOfflineData(syncCallback) {
  const db = await initDatabase();
  const syncItems = await db.getAll(STORES.SYNC_QUEUE);
  
  if (syncItems.length === 0) {
    return { success: true, synced: 0, failed: 0, pending: 0 };
  }
  
  let synced = 0;
  let failed = 0;
  
  // Check for internet connectivity
  if (!navigator.onLine) {
    return { success: false, synced, failed, pending: syncItems.length };
  }
  
  // Process each item in sync queue
  for (const item of syncItems) {
    try {
      // Call the provided callback to sync the item
      const result = await syncCallback(item.data);
      
      if (result.success) {
        // Mark as synced in offline scans store
        if (item.type === 'scan') {
          const tx = db.transaction(STORES.OFFLINE_SCANS, 'readwrite');
          const scanStore = tx.objectStore(STORES.OFFLINE_SCANS);
          const scan = await scanStore.get(item.data.id);
          
          if (scan) {
            scan.synced = true;
            scan.server_response = result;
            await scanStore.put(scan);
          }
        }
        
        // Remove from sync queue
        await db.delete(STORES.SYNC_QUEUE, item.id);
        synced++;
      } else {
        // Increment retry count
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const syncStore = tx.objectStore(STORES.SYNC_QUEUE);
        item.retries = (item.retries || 0) + 1;
        item.lastError = result.error;
        
        // If too many retries, mark as failed
        if (item.retries > 5) {
          await db.delete(STORES.SYNC_QUEUE, item.id);
          failed++;
        } else {
          await syncStore.put(item);
          failed++;
        }
      }
    } catch (error) {
      console.error('Error syncing item:', error);
      failed++;
      
      // Update retry count
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const syncStore = tx.objectStore(STORES.SYNC_QUEUE);
      item.retries = (item.retries || 0) + 1;
      item.lastError = error.message;
      
      if (item.retries > 5) {
        await db.delete(STORES.SYNC_QUEUE, item.id);
      } else {
        await syncStore.put(item);
      }
    }
  }
  
  // Get remaining pending items
  const remainingItems = await db.getAll(STORES.SYNC_QUEUE);
  
  return {
    success: true,
    synced,
    failed,
    pending: remainingItems.length
  };
}

/**
 * Store user data for offline access
 * @param {string} key - The key to store the data under
 * @param {any} data - The data to store
 * @returns {Promise<void>}
 */
export async function storeUserData(key, data) {
  const db = await initDatabase();
  await db.put(STORES.USER_DATA, { key, data, timestamp: new Date().toISOString() });
}

/**
 * Get stored user data
 * @param {string} key - The key to retrieve data for
 * @returns {Promise<any>} - The stored data
 */
export async function getUserData(key) {
  const db = await initDatabase();
  const item = await db.get(STORES.USER_DATA, key);
  return item ? item.data : null;
}

/**
 * Clear all offline data
 * @returns {Promise<void>}
 */
export async function clearOfflineData() {
  const db = await initDatabase();
  await db.clear(STORES.OFFLINE_SCANS);
  await db.clear(STORES.SYNC_QUEUE);
}

/**
 * Get offline status information
 * @returns {Promise<Object>} - Offline status information
 */
export async function getOfflineStatus() {
  const db = await initDatabase();
  
  const offlineScans = await db.count(STORES.OFFLINE_SCANS);
  const pendingSync = await db.count(STORES.SYNC_QUEUE);
  
  return {
    offlineScans,
    pendingSync,
    isOnline: navigator.onLine
  };
}
