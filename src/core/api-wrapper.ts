import { client } from '../generated/client.gen.js';
import { handleApiError, formatErrorForMcp } from './error-handler.js';

/**
 * Safely execute an API call with comprehensive error handling
 */
export async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Execute an API call and format any errors for MCP response
 */
export async function safeApiCallForMcp<T>(apiCall: () => Promise<T>): Promise<{ data?: T; error?: string; details?: any }> {
  try {
    const data = await safeApiCall(apiCall);
    return { data };
  } catch (error) {
    return formatErrorForMcp(error);
  }
} 