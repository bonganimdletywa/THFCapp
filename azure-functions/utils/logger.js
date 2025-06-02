// Logger utility for Azure Functions
const logger = {
  logRequest: (context, req) => {
    const logData = {
      method: req.method,
      url: req.url,
      query: req.query,
      headers: {
        'content-type': req.headers?.['content-type'],
        'user-agent': req.headers?.['user-agent'],
        // Don't log sensitive headers
      },
      // Don't log the full body as it might contain sensitive data
      body: req.body ? { _info: 'Body received' } : 'No body'
    };
    
    context.log('=== REQUEST ===', JSON.stringify(logData, null, 2));
  },

  logResponse: (context, status, body) => {
    const responseLog = {
      status,
      body: body ? { _info: 'Response body' } : 'No response body'
    };
    context.log(`=== RESPONSE ${status} ===`, JSON.stringify(responseLog, null, 2));
  },

  logError: (context, error) => {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    };
    context.error('=== ERROR ===', JSON.stringify(errorLog, null, 2));
  },

  logEnv: (context) => {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      // List of allowed environment variables to log (without values)
      envVars: Object.keys(process.env).filter(key => 
        key.startsWith('ZOHO_') || 
        key.startsWith('SUPABASE_') ||
        key === 'NODE_ENV'
      )
    };
    context.log('=== ENVIRONMENT ===', JSON.stringify(envVars, null, 2));
  }
};

module.exports = logger;
