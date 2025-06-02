// Zoho API integration utilities

import https from 'https';
import querystring from 'querystring';

// Zoho API URLs
const ZOHO_ACCOUNTS_URL = 'accounts.zoho.com';
const ZOHO_INVENTORY_URL = 'inventory.zoho.com';

// Document/Package Types
export const DOCUMENT_TYPES = {
  DISPATCH_ORDER: 'salesorder',
  DONATION_BATCH: 'packages'
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Stock Sources
export const STOCK_SOURCES = {
  FRESHLY_BAKED: 'Freshly Baked',
  UPLIFTED: 'Uplifted Stock',
  THFC_BAKED: 'THFC-Baked Stock'
} as const;

export type StockSource = typeof STOCK_SOURCES[keyof typeof STOCK_SOURCES];
