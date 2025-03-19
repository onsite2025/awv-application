import { NextRequest } from 'next/server';

/**
 * Verify user authentication from request headers
 * @param req The Next.js request object
 * @returns The user ID if authenticated, null otherwise
 */
export async function verifyAuth(req: NextRequest): Promise<string | null> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // For demo/development purposes, allow no authentication
    if (!token) {
      console.log('No authentication token found, using demo auth');
      return 'demo-user-id';
    }
    
    // In a production app, you would validate the token here
    // For this demo app, we'll just do a basic check
    if (token === 'demo-token' || token.length > 10) {
      // Return a demo user ID for testing
      return 'demo-user-id';
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return null;
  }
}

/**
 * Generate auth header for API requests
 * @returns Auth header object with Bearer token
 */
export function getAuthHeader(): Record<string, string> {
  // In a real app, this would get the token from cookies or localStorage
  return {
    'Authorization': 'Bearer demo-token'
  };
} 