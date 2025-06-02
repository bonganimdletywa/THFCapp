const { validateCrateData } = require('../validators/crateValidator');
const validateAuth = require('../middleware/auth');
const CrateService = require('../services/crateService');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Access-Control-Allow-Credentials': true
};

module.exports = async function (context, req) {
  try {
    // Log environment and request
    logger.logEnv(context);
    logger.logRequest(context, req);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return successResponse({}, context);
    }

    // Validate authentication
    const authResult = await validateAuth(context, req);
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    // Validate input
    const requestBody = req.body || {};
    const validationResult = validateCrateData(requestBody);
    if (!validationResult.isValid) {
      return validationErrorResponse(validationResult.errors, context);
    }

    // Process the request
    const crateService = new CrateService(context);
    const result = await crateService.submitCrateData(requestBody);

    // Return success response
    return successResponse(result, context);

  } catch (err) {
    // Log the error
    logger.logError(context, err);
    
    // Return error response
    return errorResponse(
      500,
      process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      context
    );
  }
};
