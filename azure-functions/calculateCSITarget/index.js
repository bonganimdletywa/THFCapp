// Log environment variables for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN ? '*** exists ***' : 'MISSING',
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID ? '*** exists ***' : 'MISSING',
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ? '*** exists ***' : 'MISSING',
  ZOHO_ORGANIZATION_ID: process.env.ZOHO_ORGANIZATION_ID ? '*** exists ***' : 'MISSING'
});

const logger = require('../utils/logger');
const ZohoApi = require('../utils/zohoApi');

// Log environment variables for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN ? '*** exists ***' : 'MISSING',
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID ? '*** exists ***' : 'MISSING',
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ? '*** exists ***' : 'MISSING',
  ZOHO_ORGANIZATION_ID: process.env.ZOHO_ORGANIZATION_ID ? '*** exists ***' : 'MISSING'
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
  'Access-Control-Allow-Credentials': true
};

module.exports = async function (context, req) {
  try {
    // Log environment info
    logger.logEnv(context);
    
    // Log incoming request
    logger.logRequest(context, req);
    
    if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: ''
    };
    return;
  }

    // Log the full request for debugging
    console.log('Full request object:', JSON.stringify({
      method: req.method,
      url: req.url,
      query: req.query,
      headers: req.headers,
      body: req.body
    }, null, 2));

    let { start_date, end_date } = req.query || {};
    console.log(`Processing request with start_date: ${start_date}, end_date: ${end_date}`);
    if (!start_date || !end_date) {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      start_date = startOfWeek.toISOString().split('T')[0];
      end_date = endOfWeek.toISOString().split('T')[0];
    }
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      context.res = {
        status: 401,
        headers: corsHeaders,
        body: { success: false, error: 'Not authenticated' }
      };
      return;
    }
    console.log('Checking for ZOHO_REFRESH_TOKEN in environment variables');
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    if (!refreshToken) {
      const error = new Error('Zoho refresh token not configured in environment variables');
      console.error('Configuration error:', error.message);
      throw error;
    }
    
    console.log('Attempting to get Zoho access token...');
    try {
      // The ZohoApi class automatically handles token refresh
      const accessToken = await ZohoApi.refreshAccessToken();
      console.log('Successfully obtained access token');
      
      // Example: Fetch data from Zoho
      // const data = await ZohoApi.someMethod();
      
      // For now, just return a success message
      return {
        status: 200,
        headers: corsHeaders,
        body: { 
          success: true, 
          message: 'Successfully connected to Zoho API',
          // data: data
        }
      };
    } catch (err) {
      console.error('Error in Zoho API call:', err);
      throw new Error(`Zoho API error: ${err.message}`);
    }
    // ...rest of your logic, call calculateCSIDonationTarget and return response...
    const result = { success: true, message: 'CSI Target calculated (implement logic)' };
    logger.logResponse(context, 200, result);
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: result
    };
  } catch (err) {
    logger.logError(context, err);
    const errorResponse = { 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };
    logger.logResponse(context, 500, errorResponse);
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: errorResponse
    };
  }
};
