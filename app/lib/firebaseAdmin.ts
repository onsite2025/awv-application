// Temporary implementation without requiring firebase-admin package
// IMPORTANT: This is for development purposes only and is NOT secure for production
// Replace this with actual firebase-admin implementation before deploying to production

/**
 * Mock Firebase Admin SDK
 * This allows the app to build and run without the firebase-admin package
 * but does NOT provide any actual server-side authentication
 */
const admin = {
  apps: [],
  initializeApp: () => {
    console.warn('⚠️ Using mock Firebase Admin SDK - NOT SECURE FOR PRODUCTION');
    return {};
  },
  credential: {
    cert: () => ({})
  },
  auth: () => ({
    verifyIdToken: async (token: string) => {
      console.warn('⚠️ SECURITY WARNING: Using mock token verification');
      // In a real implementation, this would verify the token
      // For now, just extract a "uid" from the token or use a placeholder
      return { 
        uid: token.split('.').pop() || 'mock-user-id',
        email: 'mock@example.com',
        email_verified: true
      };
    }
  })
};

// Initialize Firebase Admin SDK (mock version)
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('Mock Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

/**
 * Verifies a Firebase ID token (mock implementation)
 * @param token - The Firebase ID token to verify
 * @returns A promise that resolves with mock token claims
 */
export async function verifyIdToken(token: string): Promise<{ uid: string }> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Unauthorized: Invalid token');
  }
}

export const auth = {
  verifyIdToken,
};

export default admin; 