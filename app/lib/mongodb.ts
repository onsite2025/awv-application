'use server';

import mongoose from 'mongoose';
import { dbConnect } from './db';
import { getTemplateById, getTemplates, saveTemplate, updateTemplate, deleteTemplate } from './templateService';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Server-side wrapper for getTemplates
 */
export async function fetchTemplates(userId?: string) {
  try {
    await dbConnect();
    return getTemplates(userId);
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch templates');
  }
}

/**
 * Server-side wrapper for getTemplateById
 */
export async function fetchTemplateById(id: string) {
  try {
    await dbConnect();
    return getTemplateById(id);
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw new Error('Failed to fetch template');
  }
}

/**
 * Server-side wrapper for saveTemplate
 */
export async function createTemplate(templateData: any, userId?: string) {
  try {
    await dbConnect();
    return saveTemplate(templateData, userId);
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Failed to create template');
  }
}

/**
 * Server-side wrapper for updateTemplate
 */
export async function modifyTemplate(id: string, templateData: any) {
  try {
    await dbConnect();
    return updateTemplate(id, templateData);
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    throw new Error('Failed to update template');
  }
}

/**
 * Server-side wrapper for deleteTemplate
 */
export async function removeTemplate(id: string) {
  try {
    await dbConnect();
    return deleteTemplate(id);
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    throw new Error('Failed to delete template');
  }
}

export default connectToDatabase; 