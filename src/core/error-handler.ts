/**
 * Comprehensive error handling and validation for Coolify MCP tools
 */

export class CoolifyError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'CoolifyError';
    
    // Ensure proper stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CoolifyError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack
    };
  }
}

export class ValidationError extends CoolifyError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, context);
    this.name = 'ValidationError';
  }
}

export class ApiError extends CoolifyError {
  constructor(message: string, statusCode: number, context?: Record<string, any>) {
    super(message, statusCode, context);
    this.name = 'ApiError';
  }
}

/**
 * Handle API errors and convert them to CoolifyError instances
 */
export function handleApiError(error: any): never {
  if (error.response) {
    // API returned an error response
    const statusCode = error.response.status;
    const data = error.response.data;
    
    const errorMessage = data?.message || data?.error || 'Unknown API error';
    
    throw new ApiError(
      `API Error (${statusCode}): ${errorMessage}`,
      statusCode,
      { 
        response: data,
        url: error.config?.url,
        method: error.config?.method 
      }
    );
  } else if (error.request) {
    // Request was made but no response received
    throw new CoolifyError(
      'No response received from Coolify API server. Please check your connection and server availability.',
      0,
      { request: error.request }
    );
  } else if (error instanceof CoolifyError) {
    // Re-throw existing CoolifyError instances
    throw error;
  } else {
    // Error in setting up the request or other unknown error
    throw new CoolifyError(
      `Request setup error: ${error.message}`,
      0,
      { originalError: error }
    );
  }
}

/**
 * Validate that required parameters are present and not empty
 */
export function validateRequiredParams(
  params: Record<string, any>,
  required: string[]
): void {
  const missing = required.filter(param => {
    const value = params[param];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required parameters: ${missing.join(', ')}`,
      { params, missing, provided: Object.keys(params) }
    );
  }
}

/**
 * Parse JSON body with proper error handling
 */
export function parseJsonBody(body?: string): any {
  if (!body || body.trim() === '') {
    throw new ValidationError('Request body is required and cannot be empty');
  }
  
  try {
    const parsed = JSON.parse(body);
    if (parsed === null || typeof parsed !== 'object') {
      throw new ValidationError('Request body must be a valid JSON object');
    }
    return parsed;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      'Invalid JSON in request body',
      { 
        body: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
        parseError: error instanceof Error ? error.message : String(error)
      }
    );
  }
}

/**
 * Validate Coolify ID format (more flexible than strict UUID)
 * Coolify uses IDs like: pcs0k0scoow4c0scs4w0w8kw
 */
export function validateCoolifyId(value: string, paramName: string): void {
  // Coolify IDs are typically alphanumeric strings of 20-40 characters
  const coolifyIdRegex = /^[a-z0-9]{16,40}$/i;
  
  if (!value || typeof value !== 'string') {
    throw new ValidationError(
      `Parameter '${paramName}' is required and must be a valid Coolify ID`,
      { paramName, value }
    );
  }
  
  if (!coolifyIdRegex.test(value)) {
    throw new ValidationError(
      `Invalid Coolify ID format for parameter '${paramName}'. Expected alphanumeric string of 16-40 characters`,
      { paramName, value }
    );
  }
}

/**
 * Validate UUID format (kept for compatibility, but prefer validateCoolifyId for Coolify resources)
 */
export function validateUuid(value: string, paramName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!value || !uuidRegex.test(value)) {
    throw new ValidationError(
      `Invalid UUID format for parameter '${paramName}'. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
      { paramName, value }
    );
  }
}

/**
 * Validate operation parameter against allowed operations
 */
export function validateOperation(operation: string, allowedOperations: string[]): void {
  if (!allowedOperations.includes(operation)) {
    throw new ValidationError(
      `Invalid operation '${operation}'. Allowed operations: ${allowedOperations.join(', ')}`,
      { operation, allowedOperations }
    );
  }
}

/**
 * Sanitize and validate string inputs
 */
export function validateString(value: any, paramName: string, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
} = {}): string {
  const { required = false, minLength, maxLength, pattern } = options;
  
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`Parameter '${paramName}' is required`);
    }
    return '';
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(
      `Parameter '${paramName}' must be a string`,
      { paramName, actualType: typeof value, value }
    );
  }
  
  if (minLength && value.length < minLength) {
    throw new ValidationError(
      `Parameter '${paramName}' must be at least ${minLength} characters long`,
      { paramName, value, minLength, actualLength: value.length }
    );
  }
  
  if (maxLength && value.length > maxLength) {
    throw new ValidationError(
      `Parameter '${paramName}' must not exceed ${maxLength} characters`,
      { paramName, value: value.substring(0, 50) + '...', maxLength, actualLength: value.length }
    );
  }
  
  if (pattern && !pattern.test(value)) {
    throw new ValidationError(
      `Parameter '${paramName}' does not match required pattern`,
      { paramName, value, pattern: pattern.toString() }
    );
  }
  
  return value;
}

/**
 * Validate integer inputs
 */
export function validateInteger(value: any, paramName: string, options: {
  required?: boolean;
  min?: number;
  max?: number;
} = {}): number | undefined {
  const { required = false, min, max } = options;
  
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`Parameter '${paramName}' is required`);
    }
    return undefined;
  }
  
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  
  if (isNaN(num) || !Number.isInteger(num)) {
    throw new ValidationError(
      `Parameter '${paramName}' must be a valid integer`,
      { paramName, value, actualType: typeof value }
    );
  }
  
  if (min !== undefined && num < min) {
    throw new ValidationError(
      `Parameter '${paramName}' must be at least ${min}`,
      { paramName, value: num, min }
    );
  }
  
  if (max !== undefined && num > max) {
    throw new ValidationError(
      `Parameter '${paramName}' must not exceed ${max}`,
      { paramName, value: num, max }
    );
  }
  
  return num;
}

/**
 * Format error for MCP response
 */
export function formatErrorForMcp(error: any): { error: string; details?: any } {
  if (error instanceof CoolifyError) {
    return {
      error: error.message,
      details: {
        type: error.name,
        statusCode: error.statusCode,
        context: error.context
      }
    };
  }
  
  return {
    error: error instanceof Error ? error.message : String(error),
    details: {
      type: 'UnknownError'
    }
  };
} 