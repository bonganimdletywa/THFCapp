import { Context, HttpRequest } from '@azure/functions';

// Context and Request Types
export interface AzureFunctionContext extends Context {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  verbose: (...args: any[]) => void;
  [key: string]: any;
}

export interface AzureHttpRequest extends HttpRequest {
  query: Record<string, string | string[]>;
  params: Record<string, string>;
  body?: any;
  rawBody?: any;
}

// Response Types
export interface AzureHttpResponse {
  status?: number;
  body?: any;
  headers?: Record<string, string>;
  isRaw?: boolean;
  cookies?: Array<{
    name: string;
    value: string;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
}

// Error Types
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status = 500, code?: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

// Request Validation
export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string[]>;
  value?: any;
}

// Logger Interface
export interface ILogger {
  log(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  child(meta: Record<string, any>): ILogger;
}

// Zoho API Types
export interface ZohoAccessToken {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

export interface ZohoItem {
  item_id: string;
  name: string;
  sku: string;
  rate: number;
  status: 'active' | 'inactive';
  unit: string;
  description?: string;
  purchase_account_id?: string;
  account_id?: string;
  purchase_rate?: number;
  reorder_level?: number;
  initial_stock?: number;
  initial_stock_rate?: number;
  tax_id?: string;
  tax_name?: string;
  tax_percentage?: number;
  tax_type?: string;
  available_stock?: number;
  available_stock_formatted?: string;
  actual_available_stock?: number;
  actual_available_stock_formatted?: string;
  vendor_id?: string;
  vendor_name?: string;
  created_time?: string;
  last_modified_time?: string;
  source?: string;
  is_linked_with_zohocrm?: boolean;
  warehouse_available_stocks?: Array<{
    warehouse_id: string;
    warehouse_name: string;
    available_stock: number;
    available_stock_formatted: string;
  }>;
  custom_fields?: Array<{
    customfield_id: string;
    label: string;
    value: any;
  }>;
  image_name?: string;
  image_type?: string;
  image_document_id?: string;
  is_taxable?: boolean;
  tax_authority_id?: string;
  tax_exemption_id?: string;
  tax_exemption_code?: string;
  has_attachment?: boolean;
}

// Crate Types
export interface CrateItem {
  item_id: string;
  name: string;
  quantity: number;
  rate: number;
  unit: string;
  sku?: string;
}

export interface Crate {
  crate_id: string;
  location: string;
  status: 'available' | 'in_transit' | 'delivered' | 'returned' | 'damaged';
  items: CrateItem[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Donation Batch Types
export interface DonationBatchItem {
  item_id: string;
  name: string;
  quantity: number;
  rate: number;
  unit: string;
  sku?: string;
  source_crate_id?: string;
}

export interface DonationBatch {
  batch_id: string;
  reference: string;
  status: 'pending' | 'processed' | 'cancelled';
  items: DonationBatchItem[];
  source_breakdown?: Array<{
    source: string;
    item_id: string;
    quantity: number;
  }>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Production Order Types
export interface ProductionOrderItem {
  item_id: string;
  name: string;
  quantity: number;
  rate: number;
  unit: string;
  sku?: string;
  produced_quantity?: number;
  remaining_quantity?: number;
}

export interface ProductionOrder {
  order_id: string;
  reference: string;
  status: 'draft' | 'in_production' | 'completed' | 'cancelled';
  items: ProductionOrderItem[];
  target_completion_date?: string;
  actual_completion_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// CSI Target Types
export interface CSITarget {
  target_id: string;
  period_start: string;
  period_end: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Environment Variables Type
export interface ProcessEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  ZOHO_ORGANIZATION_ID?: string;
  ZOHO_API_DOMAIN?: string;
  LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  [key: string]: string | undefined;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnv {}
  }
}

// Request/Response Types
export interface CrateData {
  crate_id_input: string;
  bread_quantity: number;
  device_scan_id?: string;
  is_offline_scan?: boolean;
  stock_source?: string;
  dispatch_order_ref?: string;
  donation_batch_ref?: string;
  location?: string;
}

export interface CreateCrateData {
  crate_id: string;
  location?: string;
  initial_bread_quantity?: number;
}

export interface ZohoAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface ZohoInventoryItem {
  item_id?: string;
  name: string;
  sku: string;
  status: 'active' | 'inactive';
  description?: string;
  rate?: number;
  initial_stock?: number;
  initial_stock_rate?: number;
}

// Service Response Types
export interface SubmitCrateResponse {
  crate_id: string;
  updated_quantity: number;
  timestamp: string;
}

export interface CreateCrateResponse {
  crate_id: string;
  location?: string;
  initial_bread_quantity?: number;
  created_at: string;
}

// Auth Types
export interface AuthResult {
  isAuthenticated: boolean;
  token?: string;
  response?: any;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
