const logger = require('./utils/logger');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Access-Control-Allow-Credentials': true
};

module.exports = async function (context, req) {
  try {
    // Log environment info
    logger.logEnv(context);
    
    // Log incoming request
    logger.logRequest(context, req);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return {
        status: 200,
        headers: corsHeaders,
        body: ''
      };
    }

    // Your function logic here
    // ------------------------
    const requestBody = req.body || {};
    const { donation_batch_ref, crate_items, source_breakdown } = requestBody;
    if (!donation_batch_ref) {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: { success: false, error: 'Donation batch reference is required' }
      };
      return;
    }
    if (!crate_items || !Array.isArray(crate_items) || crate_items.length === 0) {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: { success: false, error: 'At least one crate item is required' }
      };
      return;
    }
    if (!source_breakdown || typeof source_breakdown !== 'object') {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: { success: false, error: 'Source breakdown is required' }
      };
      return;
    }
    // ...rest of your logic, call createDonationBatch and return response...
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: { success: true, message: 'Donation batch created (implement logic)' }
    };
    // ------------------------
    context.log('Processing request...');
    
    // Example: Get query parameters
    const params = req.query || {};
    context.log('Request parameters:', JSON.stringify(params));
    
    // Example: Process request body for POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      context.log('Request body:', JSON.stringify(req.body || {}));
    }
    
    // Your business logic here
    const result = { success: true, message: 'Function executed successfully' };
    // ------------------------
    
    // Log and return successful response
    logger.logResponse(context, 200, result);
    return {
      status: 200,
      headers: corsHeaders,
      body: result
    };
    
  } catch (err) {
    // Log the full error
    logger.logError(context, err);
    
    // Prepare error response
    const errorResponse = { 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };
    
    // Log the error response
    logger.logResponse(context, 500, errorResponse);
    
    // Return error response
    return {
      status: 500,
      headers: corsHeaders,
      body: errorResponse
    };
  }
};
