const { errorResponse } = require('../utils/responseHelper');
const jwt = require('jsonwebtoken');

const validateToken = async (token) => {
  try {
    // Replace this with your actual token validation logic
    // For example, if using JWT:
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return {
        isValid: false,
        error: 'Token has expired'
      };
    }

    return {
      isValid: true,
      userId: decoded.sub,
      roles: decoded.roles || []
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid token'
    };
  }
};

const validateAuth = async (context, req) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return {
      isAuthenticated: false,
      response: errorResponse(401, 'Authentication required', context)
    };
  }

  try {
    if (!authHeader.startsWith('Bearer ')) {
      return {
        isAuthenticated: false,
        response: errorResponse(401, 'Invalid authentication format', context)
      };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return {
        isAuthenticated: false,
        response: errorResponse(401, 'Token not provided', context)
      };
    }

    const validationResult = await validateToken(token);
    if (!validationResult.isValid) {
      return {
        isAuthenticated: false,
        response: errorResponse(401, validationResult.error, context)
      };
    }

    return {
      isAuthenticated: true,
      token,
      user: {
        id: validationResult.userId,
        roles: validationResult.roles
      }
    };
    
  } catch (error) {
    context.log.error('Auth error:', error);
    return {
      isAuthenticated: false,
      response: errorResponse(500, 'Authentication error', context)
    };
  }
};

module.exports = validateAuth; 