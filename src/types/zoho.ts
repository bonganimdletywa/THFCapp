// Zoho API Types

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

// Location Types
export const LOCATIONS = {
  PRIMARY_HUB: 'Primary Hub',
  THFC_PRODUCTION: 'THFC Production',
  WAREHOUSE_A: 'Warehouse A',
  WAREHOUSE_B: 'Warehouse B',
  OUTBOUND_CENTER: 'Outbound Center'
} as const;

export type Location = typeof LOCATIONS[keyof typeof LOCATIONS];

// User Roles
export const USER_ROLES = {
  PRODUCTION_OPERATOR: 'production_operator',
  DISPATCH_COORDINATOR: 'dispatch_coordinator',
  CSI_FIELD_WORKER: 'csi_field_worker',
  THFC_PRODUCTION_OPERATOR: 'thfc_production_operator',
  ZOHO_ADMIN: 'zoho_admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Zoho API Response Types
export interface ZohoAPIResponse<T> {
  code: number;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Crate Interface
export interface ZohoCrate {
  crate_id: string;
  bread_quantity: number;
  location?: string;
  status?: 'Active' | 'Inactive' | 'In Transit';
  last_updated?: string;
  last_updated_by?: string;
}
