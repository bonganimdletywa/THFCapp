const validateCrateData = (data) => {
  const errors = [];
  
  // Required fields
  if (!data.crate_id_input) {
    errors.push('Crate ID is required');
  }
  
  if (data.bread_quantity === undefined || data.bread_quantity === null) {
    errors.push('Bread quantity is required');
  } else if (typeof data.bread_quantity !== 'number' || data.bread_quantity < 0) {
    errors.push('Bread quantity must be a non-negative number');
  }
  
  // Optional fields validation
  if (data.location && typeof data.location !== 'string') {
    errors.push('Location must be a string');
  }
  
  if (data.is_offline_scan !== undefined && typeof data.is_offline_scan !== 'boolean') {
    errors.push('is_offline_scan must be a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateCreateCrate = (data) => {
  const errors = [];
  
  if (!data.crate_id) {
    errors.push('Crate ID is required');
  }
  
  if (data.initial_bread_quantity !== undefined) {
    if (typeof data.initial_bread_quantity !== 'number' || data.initial_bread_quantity < 0) {
      errors.push('Initial bread quantity must be a non-negative number');
    }
  }
  
  if (data.location && typeof data.location !== 'string') {
    errors.push('Location must be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCrateData,
  validateCreateCrate
}; 