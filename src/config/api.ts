// API configuration for Lambda endpoints

// API Gateway URLs for different environments
const API_GATEWAYS = {
  development: 'https://your-dev-api-gateway-id.execute-api.region.amazonaws.com/dev',
  staging: 'https://your-staging-api-gateway-id.execute-api.region.amazonaws.com/staging',
  production: 'https://your-prod-api-gateway-id.execute-api.region.amazonaws.com/prod',
};

// Determine current environment
const ENV = import.meta.env.MODE || 'development';

// API endpoints
const ENDPOINTS = {
  SUBMIT_CRATE_DATA: '/submitCrateDataToZoho',
  FETCH_CRATE_DETAILS: '/fetchCrateDetails',
  CREATE_CRATE: '/createCrateInZoho',
  CREATE_DISPATCH_ORDER: '/createDispatchOrder',
  FINALIZE_DISPATCH_ORDER: '/finalizeDispatchOrder',
  GET_DISPATCH_ORDER: '/getDispatchOrder',
  CREATE_DONATION_BATCH: '/createDonationBatch',
  CALCULATE_CSI_TARGET: '/calculateCSITarget',
  GENERATE_DONATION_REPORT: '/generateDonationReport',
};

// API configurations
export const API_CONFIG = {
  BASE_URL: API_GATEWAYS[ENV as keyof typeof API_GATEWAYS],
  ENDPOINTS,
  TIMEOUT: 30000, // 30 seconds timeout
  RETRY_ATTEMPTS: 3,
};

// Helper function to build endpoint URLs
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
