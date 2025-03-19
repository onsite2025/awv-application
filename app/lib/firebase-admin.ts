// This is a mock implementation of firebase-admin for development purposes
// In a real production app, you would use the actual firebase-admin SDK

// Mock auth implementation
export const auth = {
  verifyIdToken: async (token: string) => {
    // In development, we'll just assume the token is valid
    // In production, you should verify the token with Firebase Admin SDK
    console.log('Development mode: Assuming token is valid');
    
    // Extract user ID from token (in development, we'll just extract it from the token string)
    // In a real app, this would properly decode and verify the JWT
    const uid = token.split('.')[0] || 'mock-user-id';
    
    return {
      uid,
      email: 'user@example.com',
      email_verified: true
    };
  }
};

// Mock firestore implementation
export const firestore = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: true,
        data: () => ({ id, name: 'Mock Document' })
      }),
      set: async (data: any) => console.log('Mock set document', data)
    })
  })
};

// Export a mock admin object
const admin = {
  auth: () => auth,
  firestore: () => firestore,
  apps: []
};

export default admin; 