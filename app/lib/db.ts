import mongoose from 'mongoose';
import { MongoClient, Db } from 'mongodb';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Get MongoDB URI from environment variables with fallback for development
const MONGODB_URI = isServer && (process.env.MONGODB_URI || 'mongodb://localhost:27017/awv-app');
const MONGODB_DB = isServer && (process.env.MONGODB_DB || 'awv-app');

// Log connection status but don't throw error to allow for gradual transition
if (isServer) {
  if (!process.env.MONGODB_URI) {
    console.warn(
      'Warning: MONGODB_URI environment variable is not set. Using default connection:',
      MONGODB_URI
    );
  } else {
    console.log('MONGODB_URI found in environment variables');
  }
} else {
  console.warn('Running in client-side context, MongoDB connection only available server-side');
}

// Track connection state
let isConnected = false;

// Connection caching
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface ConnectToDatabaseResult {
  client: MongoClient;
  db: Db;
}

/**
 * Connect to MongoDB database
 * 
 * This function implements connection pooling for improved performance
 * @returns Object containing the database client and database instance
 */
export async function connectToDatabase(): Promise<ConnectToDatabaseResult> {
  // If we have cached connections, use them
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create new connection
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);

    // Cache the connections
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Connect to MongoDB database using Mongoose
 * This is the original function kept for backward compatibility
 */
export async function dbConnect() {
  // Only run on the server
  if (!isServer) {
    console.warn('Attempted to connect to MongoDB from the client side');
    return;
  }
  
  // Return if already connected
  if (isConnected) {
    console.log('MongoDB: Already connected, reusing connection');
    return;
  }

  try {
    console.log(`MongoDB: Connecting to ${MONGODB_URI}`);
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    isConnected = !!db.connections[0].readyState;
    
    console.log(`MongoDB: Connected successfully. Connection state: ${isConnected}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

/**
 * Safely converts a string to MongoDB ObjectId
 * Returns null if the string is not a valid ObjectId
 */
export function toObjectId(id: string) {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  } catch (error) {
    console.error('Invalid ObjectId:', error);
    return null;
  }
}

/**
 * Generic function to find documents in a collection
 */
export async function findDocuments<T>(
  model: mongoose.Model<T>,
  query: any = {},
  sort: any = { createdAt: -1 }
): Promise<T[]> {
  try {
    console.log(`DB: findDocuments called for model ${model.modelName} with query:`, JSON.stringify(query));
    await dbConnect();
    console.log(`DB: Database connected, executing find query on ${model.modelName}`);
    
    // Log the actual MongoDB collection being queried
    const collection = model.collection.name;
    console.log(`DB: Querying collection "${collection}" with query:`, JSON.stringify(query));
    
    // Fix the sort parameter - ensure it's properly formatted
    let normalizedSort = sort;
    if (sort && typeof sort === 'object' && 'sort' in sort) {
      // If sort is accidentally wrapped in a 'sort' property, unwrap it
      normalizedSort = sort.sort;
    }
    
    // Ensure we have a valid sort object with fallback to default
    if (!normalizedSort || typeof normalizedSort !== 'object') {
      normalizedSort = { createdAt: -1 };
    }
    
    console.log(`DB: Using sort parameter:`, JSON.stringify(normalizedSort));
    
    const documents = await model.find(query).sort(normalizedSort).lean();
    console.log(`DB: Query returned ${documents.length} documents from ${model.modelName}`);
    
    return documents as T[];
  } catch (error) {
    console.error(`DB: Error finding documents in ${model.modelName}:`, error);
    return [];
  }
}

/**
 * Generic function to find a document by ID
 */
export async function findDocumentById<T>(
  model: mongoose.Model<T>,
  id: string
): Promise<T | null> {
  try {
    await dbConnect();
    const objectId = toObjectId(id);
    if (!objectId) return null;
    
    const document = await model.findById(objectId).lean();
    return document as T | null;
  } catch (error) {
    console.error(`Error finding document by ID in ${model.modelName}:`, error);
    return null;
  }
}

/**
 * Generic function to create a document
 */
export async function createDocument<T>(
  model: mongoose.Model<T>,
  data: any
): Promise<T | null> {
  try {
    console.log(`DB: createDocument called for model ${model.modelName}`);
    await dbConnect();
    console.log(`DB: Database connected, creating new ${model.modelName} document`);
    
    const document = new model(data);
    console.log(`DB: Document created, validating before save`);
    
    // Validate the document before saving
    const validationError = document.validateSync();
    if (validationError) {
      console.error(`DB: Validation error for ${model.modelName}:`, validationError);
      throw validationError;
    }
    
    console.log(`DB: Document is valid, saving to database`);
    const savedDocument = await document.save();
    console.log(`DB: Document saved successfully with ID: ${savedDocument._id}`);
    
    return savedDocument.toObject() as T;
  } catch (error: any) {
    console.error(`DB: Error creating document in ${model.modelName}:`, error);
    if (error.name === 'ValidationError') {
      // Format Mongoose validation errors more clearly
      const validationErrors = Object.keys(error.errors).map(field => {
        return `${field}: ${error.errors[field].message}`;
      });
      console.error(`DB: Validation errors: ${validationErrors.join(', ')}`);
    } else if (error.code === 11000) {
      // Handle duplicate key errors
      console.error(`DB: Duplicate key error for ${JSON.stringify(error.keyValue)}`);
    }
    throw error;
  }
}

/**
 * Generic function to update a document by ID
 */
export async function updateDocumentById<T>(
  model: mongoose.Model<T>,
  id: string,
  data: any
): Promise<T | null> {
  try {
    await dbConnect();
    const objectId = toObjectId(id);
    if (!objectId) return null;
    
    const updatedDocument = await model.findByIdAndUpdate(
      objectId,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    return updatedDocument as T | null;
  } catch (error) {
    console.error(`Error updating document in ${model.modelName}:`, error);
    return null;
  }
}

/**
 * Generic function to delete a document by ID
 */
export async function deleteDocumentById<T>(
  model: mongoose.Model<T>,
  id: string
): Promise<boolean> {
  try {
    await dbConnect();
    const objectId = toObjectId(id);
    if (!objectId) return false;
    
    const result = await model.findByIdAndDelete(objectId);
    return !!result;
  } catch (error) {
    console.error(`Error deleting document in ${model.modelName}:`, error);
    return false;
  }
}

/**
 * Generate an ObjectId-compatible string
 * This is a fallback for when we need to generate IDs client-side
 * @returns A 24-character hex string that can be used as an ID
 */
export function generateId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomPart = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return timestamp + randomPart;
} 