const corsHeaders = require('../config/cors');
const { v4: uuidv4 } = require('uuid');

const createResponse = (status, body, context, requestId = null) => {
  // Generate or use provided request ID
  const responseId = requestId || uuidv4();
  
  // Log the response
  context.log.info({
    requestId: responseId,
    status,
    body: body ? { _info: 'Response sent' } : 'No response body'
  });

  return {
    status,
    headers: {
      ...corsHeaders,
      'x-request-id': responseId
    },
    body: {
      success: status >= 200 && status < 300,
      ...body
    }
  };
};

const successResponse = (body, context, requestId) => 
  createResponse(200, body, context, requestId);

const errorResponse = (status, message, context, requestId) => 
  createResponse(status, { error: message }, context, requestId);

const validationErrorResponse = (errors, context, requestId) => 
  createResponse(400, { errors }, context, requestId);

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  validationErrorResponse
}; 