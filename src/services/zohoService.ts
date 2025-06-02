import { createClient } from '@supabase/supabase-js';
import { IDBPDatabase, openDB } from 'idb';
import { supabase } from '../lib/supabase.js';

// Types
interface DispatchOrder {
  salesorder_id: string;
  reference_number: string;
  status: string;
  line_items: Array<{
    item_id: string;
    name: string;
    quantity: number;
  }>;
}

interface CrateScan {
  id: string;
  qrCode: string;
  quantity: number;
  timestamp: Date;
  dispatchOrderId?: string;
  synced: boolean;
}

class ZohoService {
  private db: IDBPDatabase | null = null;
  private static instance: ZohoService;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): ZohoService {
    if (!ZohoService.instance) {
      ZohoService.instance = new ZohoService();
    }
    return ZohoService.instance;
  }

  private async initDB() {
    this.db = await openDB('thfc-scanner', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('crateScans')) {
          const store = db.createObjectStore('crateScans', { keyPath: 'id' });
          store.createIndex('by_sync', 'synced', { unique: false });
          store.createIndex('by_dispatch_order', 'dispatchOrderId', { unique: false });
        }
      },
    });
  }

  // Zoho API Methods
  async getActiveDispatchOrder(): Promise<DispatchOrder | null> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ZOHO_API_BASE}/salesorders?status=sent`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${await this.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      return data.salesorders?.[0] || null;
    } catch (error) {
      console.error('Error fetching active dispatch order:', error);
      return null;
    }
  }

  // Local Storage Methods
  async saveCrateScan(scan: Omit<CrateScan, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const scanWithMetadata: CrateScan = {
      ...scan,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      synced: false,
    };

    await this.db.add('crateScans', scanWithMetadata);
    await this.syncPendingScans();
  }

  private async syncPendingScans(): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('crateScans', 'readwrite');
    const store = tx.objectStore('crateScans');
    const index = store.index('by_sync');
    const pendingScans = await index.getAll(IDBKeyRange.only(false));

    for (const scan of pendingScans) {
      try {
        // Here you would implement the actual API call to Zoho
        // For example:
        // await this.updateDispatchOrder(scan.dispatchOrderId, scan);
        
        // Mark as synced
        await store.put({ ...scan, synced: true });
      } catch (error) {
        console.error('Error syncing scan:', error);
        break; // Stop on first error to maintain order
      }
    }
    
    await tx.done;
  }

  // Auth Methods
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token in localStorage
    const tokenData = localStorage.getItem('zoho_token');
    if (tokenData) {
      const { token, expiresAt } = JSON.parse(tokenData);
      if (new Date(expiresAt) > new Date()) {
        return token;
      }
    }

    // Refresh token if needed
    return this.refreshToken();
  }

  private async refreshToken(): Promise<string> {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: import.meta.env.VITE_ZOHO_REFRESH_TOKEN,
        client_id: import.meta.env.VITE_ZOHO_CLIENT_ID,
        client_secret: import.meta.env.VITE_ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    
    // Store the new token
    const tokenData = {
      token: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
    
    localStorage.setItem('zoho_token', JSON.stringify(tokenData));
    return data.access_token;
  }

  // Use the shared supabase instance in your methods
  async someMethod() {
    return await supabase.from('your_table').select();
  }
}

export const zohoService = ZohoService.getInstance();
export type { ZohoService };
