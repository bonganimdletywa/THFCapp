// Zoho API integration utilities

import https from 'https';
import querystring from 'querystring';

// Zoho API URLs
const ZOHO_ACCOUNTS_URL = 'accounts.zoho.com';
const ZOHO_INVENTORY_URL = 'inventory.zoho.com';

/**
 * @typedef {'salesorder' | 'packages'} DocumentType
 */

/**
 * Document/Package Types used in Zoho API
 * @readonly
 * @enum {DocumentType}
 */
const DOCUMENT_TYPES = Object.freeze({
  /** Sales order document type */
  DISPATCH_ORDER: 'salesorder',
  /** Package document type for donations */
  DONATION_BATCH: 'packages'
});

/**
 * @typedef {'Freshly Baked' | 'Uplifted Stock' | 'THFC-Baked Stock'} StockSource
 */

/**
 * Stock Sources for inventory tracking
 * @readonly
 * @enum {StockSource}
 */
const STOCK_SOURCES = Object.freeze({
  /** Stock that has been freshly baked */
  FRESHLY_BAKED: 'Freshly Baked',
  /** Stock that has been uplifted from partners */
  UPLIFTED: 'Uplifted Stock',
  /** Stock that has been baked by THFC */
  THFC_BAKED: 'THFC-Baked Stock'
});
