import type { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';

// Base URL for all API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'] & { location?: string };

// Field Worker Lambda function for Zoho integration
export type SubmitCrateData = {
  crate_id_input: string;
  bread_quantity: number;
  device_scan_id?: string;
  is_offline_scan?: boolean;
  stock_source?: 'Freshly Baked' | 'Uplifted Stock' | 'THFC-Baked Stock';
  dispatch_order_ref?: string;
  donation_batch_ref?: string;
  location?: string;
};

export type SubmitCrateResponse = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

export type CrateDetails = {
  crate_id: string;
  bread_quantity: number;
  location?: string;
  status?: string;
  last_updated?: string;
  last_updated_by?: string;
};

export type CrateDetailsResponse = {
  success: boolean;
  data?: CrateDetails;
  error?: string;
};

export type CreateCrateData = {
  crate_id: string;
  location?: string;
  initial_bread_quantity?: number;
};

// Submit crate data to Zoho via Lambda
export const submitCrateData = async (crateData: SubmitCrateData): Promise<SubmitCrateResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/submitCrateDataToZoho`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(crateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit crate data');
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error: unknown) {
    let message = 'Network error. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Create a new crate in Zoho via Lambda
export const createCrateInZoho = async (crateData: CreateCrateData): Promise<SubmitCrateResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Ensure we have a valid API URL without the 'admin/undefined' segment
    const endpoint = '/api/createCrateInZoho';
    const apiUrl = API_BASE_URL.endsWith('/') ? `${API_BASE_URL.slice(0, -1)}${endpoint}` : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(crateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create crate in Zoho');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error: unknown) {
    let message = 'Failed to create crate. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Types for dispatch order management
export type DispatchOrderData = {
  dispatch_order_ref: string;
  crate_items: Array<{
    item_id: string;
    crate_id: string;
    bread_quantity: number;
    warehouse_id?: string;
  }>;
  destination_warehouse?: string;
};

export type DispatchOrderResponse = {
  success: boolean;
  data?: {
    dispatch_order_ref: string;
    dispatch_order_id: string;
    status: string;
  };
  error?: string;
};

// Create a new dispatch order in Zoho via Lambda
export const createDispatchOrder = async (orderData: DispatchOrderData): Promise<DispatchOrderResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/createDispatchOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create dispatch order');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error: unknown) {
    let message = 'Failed to create dispatch order. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Finalize a dispatch order in Zoho via Lambda
export const finalizeDispatchOrder = async (dispatchOrderId: string): Promise<DispatchOrderResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/finalizeDispatchOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ dispatch_order_id: dispatchOrderId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to finalize dispatch order');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error: unknown) {
    let message = 'Failed to finalize dispatch order. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Finalize a donation batch in Zoho via Lambda
export const finalizeDonationBatch = async (donationBatchId: string): Promise<DonationBatchResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    const response = await fetch(`${API_BASE_URL}/finalizeDonationBatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ donation_batch_id: donationBatchId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to finalize donation batch');
    }
    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error: unknown) {
    let message = 'Failed to finalize donation batch. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Types for donation batch management
export type DonationBatchData = {
  donation_batch_ref: string;
  crate_items: Array<{
    item_id: string;
    crate_id: string;
    bread_quantity: number;
  }>;
  source_breakdown: {
    uplifted: number;
    thfc_baked: number;
  };
};

export type DonationBatchResponse = {
  success: boolean;
  data?: {
    donation_batch_ref: string;
    package_id: string;
    total_bread: string;
    food_forward_quantity: string;
    sa_harvest_quantity: string;
    total_value: string;
  };
  error?: string;
};

// Create a donation batch in Zoho via Lambda
export const createDonationBatch = async (batchData: DonationBatchData): Promise<DonationBatchResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/createDonationBatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(batchData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create donation batch');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error: unknown) {
    let message = 'Failed to create donation batch. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Calculate CSI target based on dispatch orders
export const calculateCSITarget = async (startDate: string, endDate: string): Promise<{
  success: boolean;
  data?: {
    target: number;
    total_dispatched: number;
    dispatch_orders: string[];
  };
  error?: string;
}> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/calculateCSITarget?start_date=${startDate}&end_date=${endDate}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to calculate CSI target');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to calculate CSI target. Please try again.',
    };
  }
};

// Generate donation report
export type DonationReport = {
  donations: Array<{
    donation_date: string;
    donation_quantity: number;
    food_forward_quantity: number;
    sa_harvest_quantity: number;
    value_per_loaf: number;
    total_value: number;
    uplifted_stock: number;
    thfc_baked: number;
    reference: string;
    crate_ids: string;
  }>;
  summary: {
    total_donations: number;
    total_bread: number;
    total_value: number;
    food_forward_total: number;
    sa_harvest_total: number;
    uplifted_stock_total: number;
    thfc_baked_total: number;
  };
};

export const generateDonationReport = async (
  startDate: string, 
  endDate: string
): Promise<{
  success: boolean;
  data?: DonationReport;
  error?: string;
}> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/generateDonationReport?start_date=${startDate}&end_date=${endDate}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate donation report');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error: unknown) {
    let message = 'Failed to generate donation report. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

// Fetch crate details from Zoho via Lambda
export const fetchCrateDetails = async (crateId: string): Promise<CrateDetailsResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/fetchCrateDetails?crateId=${encodeURIComponent(crateId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch crate details');
    }

    const data = await response.json();
    return { 
      success: true, 
      data: data.data as CrateDetails 
    };
  } catch (error: unknown) {
    let message = 'Failed to fetch crate details. Please try again.';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    return {
      success: false,
      error: message,
    };
  }
};

export const listUsers = async (): Promise<UserRow[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) throw error;
  return data as UserRow[];
};

export const createUser = async (
  userData: Omit<UserInsert, 'id' | 'created_at' | 'updated_at' | 'last_login_at' | 'status' | 'hashed_password'> & { password: string }
): Promise<UserRow> => {
  try {
    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
        },
      },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('Failed to create user');

    // 2. Insert user into users table
    const insertUser: UserInsert = {
      id: authData.user.id,
      user_code: userData.user_code,
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
      location: userData.location || 'Primary Hub', // Default to 'Primary Hub' if not specified
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
    };
    const { data: userRow, error: userInsertError } = await supabase
      .from('users')
      .insert([insertUser])
      .select()
      .single();
    if (userInsertError) throw userInsertError;
    return userRow as UserRow;
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    let message = 'Failed to create user';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      message = String((error as any).message);
    }
    throw new Error(message);
  }
};