import { client } from '../generated/client.gen.js';
import { z } from 'zod';

const ConfigSchema = z.object({
  apiUrl: z.string().url(),
  apiToken: z.string().min(10)
});

export function configureCoolifyClient() {
  // Validate required environment variables
  const apiUrl = process.env.COOLIFY_API_URL;
  const apiToken = process.env.COOLIFY_API_TOKEN;
  
  try {
    const config = ConfigSchema.parse({
      apiUrl,
      apiToken
    });
    
    // Configure the generated client
    client.setConfig({
      baseUrl: `${config.apiUrl}/api/v1`,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Failed to configure Coolify client: ' + String(error));
  }
} 