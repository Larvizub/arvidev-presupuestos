// Servicio de validación para asegurar integridad de datos

/**
 * Valida datos de presupuesto
 */
export const validateBudget = (budgetData) => {
  const errors = {};
  
  // Validar nombre
  if (!budgetData.name || budgetData.name.trim() === '') {
    errors.name = 'El nombre es obligatorio';
  } else if (budgetData.name.length > 100) {
    errors.name = 'El nombre es demasiado largo (máximo 100 caracteres)';
  }
  
  // Validar mes y año
  if (budgetData.month === undefined || budgetData.month === null) {
    errors.month = 'El mes es obligatorio';
  } else if (budgetData.month < 0 || budgetData.month > 11) {
    errors.month = 'Mes inválido';
  }
  
  if (!budgetData.year) {
    errors.year = 'El año es obligatorio';
  } else if (budgetData.year < 2000 || budgetData.year > 2100) {
    errors.year = 'Año inválido';
  }
  
  // Validar descripción (opcional)
  if (budgetData.description && budgetData.description.length > 500) {
    errors.description = 'La descripción es demasiado larga (máximo 500 caracteres)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida datos de transacción
 */
export const validateTransaction = (transactionData) => {
  const errors = {};
  
  // Validar tipo
  if (!transactionData.type || !['income', 'expense'].includes(transactionData.type)) {
    errors.type = 'Tipo de transacción inválido';
  }
  
  // Validar nombre
  if (!transactionData.name || transactionData.name.trim() === '') {
    errors.name = 'El nombre es obligatorio';
  } else if (transactionData.name.length > 100) {
    errors.name = 'El nombre es demasiado largo (máximo 100 caracteres)';
  }
  
  // Validar monto
  if (transactionData.amount === undefined || transactionData.amount === null || isNaN(transactionData.amount)) {
    errors.amount = 'El monto es obligatorio y debe ser un número';
  } else if (transactionData.amount < 0) {
    errors.amount = 'El monto no puede ser negativo';
  } else if (transactionData.amount > 1000000000) { // Mil millones
    errors.amount = 'El monto es demasiado grande';
  }
  
  // Validar categoría
  if (!transactionData.category || transactionData.category.trim() === '') {
    errors.category = 'La categoría es obligatoria';
  }
  
  // Validar fecha
  if (!transactionData.date) {
    errors.date = 'La fecha es obligatoria';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(transactionData.date)) {
      errors.date = 'Formato de fecha inválido (YYYY-MM-DD)';
    }
  }
  
  // Validar items de alimentación si aplica
  if (transactionData.category === 'Alimentación' && transactionData.foodItems) {
    if (!Array.isArray(transactionData.foodItems)) {
      errors.foodItems = 'Formato de items inválido';
    } else {
      const invalidItems = transactionData.foodItems.filter(item => 
        !item.name || !item.price || isNaN(item.price) || !item.quantity || isNaN(item.quantity)
      );
      
      if (invalidItems.length > 0) {
        errors.foodItems = 'Algunos items tienen datos inválidos';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitiza datos para prevenir inyección
 */
export const sanitizeData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Escapar HTML para prevenir XSS
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }
    
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};
