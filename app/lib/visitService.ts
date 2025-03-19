import { 
  findDocuments, 
  findDocumentById, 
  createDocument, 
  updateDocumentById, 
  deleteDocumentById 
} from './db';
import mongoose from 'mongoose';
import Visit from '../models/Visit';
import { dbConnect } from './db';

export interface VisitData {
  _id?: string;
  id?: string;
  patientId: string;
  patientName: string;
  templateId: string;
  templateName: string;
  date: Date | string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  provider: string;
  notes?: string;
  duration?: number;
  responses?: Record<string, any>;
  recommendations?: Array<{
    text: string;
    source?: string;
    linked?: boolean;
  }>;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Convert a MongoDB document to a plain object with both _id and id fields
 * This avoids the "Objects with toJSON methods are not supported" error
 */
function convertToPlainObject(doc: any): any {
  if (!doc) return null;
  
  // If it's already a plain object, return it
  if (!doc.toObject && !doc._doc) {
    // Handle arrays of documents
    if (Array.isArray(doc)) {
      return doc.map(item => convertToPlainObject(item));
    }
    return doc;
  }
  
  // Convert to plain object using Mongoose's toObject if available
  let plainObject = doc.toObject ? doc.toObject({ getters: true }) : JSON.parse(JSON.stringify(doc._doc || doc));
  
  // Ensure both _id and id fields exist
  if (plainObject._id) {
    // Convert ObjectId to string
    plainObject.id = plainObject._id.toString();
    // Convert _id to a simple string to avoid serialization issues
    plainObject._id = plainObject._id.toString();
  }
  
  // Process nested objects and arrays recursively
  Object.keys(plainObject).forEach(key => {
    if (plainObject[key] && typeof plainObject[key] === 'object') {
      plainObject[key] = convertToPlainObject(plainObject[key]);
    }
  });
  
  return plainObject;
}

/**
 * Get all visits, optionally filtered by userId
 */
export async function getVisits(userId?: string): Promise<VisitData[]> {
  console.log('VISIT SERVICE: getVisits called with userId:', userId);
  try {
    // Create a filter object that includes the userId if provided
    const filter = userId ? { userId } : {};
    console.log('VISIT SERVICE: Using filter:', JSON.stringify(filter));
    
    console.log('VISIT SERVICE: Connecting to database to find visits');
    await dbConnect();
    
    console.log('VISIT SERVICE: Calling findDocuments with filter');
    const visits = await findDocuments(Visit, filter, {
      sort: { date: -1 }
    });
    
    console.log('VISIT SERVICE: Found visits:', visits.length, visits.map(v => v._id || v.id).join(', '));
    
    // Convert each visit document to a plain object
    const result = visits.map(convertToPlainObject);
    console.log('VISIT SERVICE: Returning visits as plain objects:', result.length);
    
    return result;
  } catch (error) {
    console.error('VISIT SERVICE: Error getting visits:', error);
    throw error;
  }
}

/**
 * Get a visit by ID
 */
export async function getVisitById(id: string): Promise<VisitData | null> {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid visit ID');
    }
    
    const visit = await findDocumentById(Visit, id);
    
    if (!visit) {
      return null;
    }
    
    return convertToPlainObject(visit);
  } catch (error) {
    console.error(`Error getting visit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Save a new visit
 */
export async function saveVisit(visitData: VisitData, userId?: string): Promise<VisitData> {
  try {
    console.log(`VISIT SERVICE: saveVisit called with data:`, JSON.stringify(visitData, null, 2));
    console.log(`VISIT SERVICE: userId passed to saveVisit:`, userId);
    
    // Ensure date is a Date object
    if (typeof visitData.date === 'string') {
      try {
        console.log(`VISIT SERVICE: Converting date string to Date object:`, visitData.date);
        const parsedDate = new Date(visitData.date);
        if (isNaN(parsedDate.getTime())) {
          console.error(`VISIT SERVICE: Invalid date provided:`, visitData.date);
          throw new Error(`Invalid date: ${visitData.date}`);
        }
        visitData.date = parsedDate;
        console.log(`VISIT SERVICE: Date converted successfully:`, parsedDate.toISOString());
      } catch (error) {
        console.error(`VISIT SERVICE: Error parsing date: ${visitData.date}`, error);
        throw new Error(`Invalid date format: ${visitData.date}`);
      }
    }
    
    // Add userId if provided
    if (userId) {
      visitData.userId = userId;
      console.log(`VISIT SERVICE: Set userId to:`, userId);
    } else {
      console.warn(`VISIT SERVICE: No userId provided, using existing value:`, visitData.userId);
    }
    
    // Make sure status is lowercase
    if (visitData.status) {
      const originalStatus = visitData.status;
      visitData.status = visitData.status.toLowerCase() as any;
      console.log(`VISIT SERVICE: Normalized status from "${originalStatus}" to "${visitData.status}"`);
    }

    // Ensure required fields
    const missingFields = [];
    ['patientId', 'patientName', 'templateId', 'templateName', 'date', 'status', 'provider', 'userId'].forEach(field => {
      if (!visitData[field as keyof VisitData]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(`VISIT SERVICE: ${errorMsg}`, visitData);
      throw new Error(errorMsg);
    }
    
    // Print the final data being saved
    console.log('VISIT SERVICE: Final visit data being saved to database:', JSON.stringify(visitData, null, 2));
    
    // Directly connect to database before creating document
    console.log('VISIT SERVICE: Ensuring database connection');
    await dbConnect();
    
    console.log('VISIT SERVICE: Creating visit document in database');
    let visit;
    try {
      visit = await createDocument(Visit, visitData);
      console.log(`VISIT SERVICE: Visit created with ID: ${visit._id}`);
    } catch (dbError: any) {
      console.error(`VISIT SERVICE: Database error creating visit:`, dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    return convertToPlainObject(visit);
  } catch (error: any) {
    console.error('VISIT SERVICE: Error saving visit:', error);
    throw error;
  }
}

/**
 * Update a visit by ID
 */
export async function updateVisit(id: string, visitData: Partial<VisitData>) {
  console.log(`visitService.updateVisit called for visit ID: ${id}`);
  
  if (!id) {
    console.error('updateVisit called with invalid ID');
    throw new Error('Invalid visit ID');
  }

  try {
    await dbConnect();
    
    // Clean the data to make sure it's safe to update
    const cleanedData = { ...visitData };
    
    // Ensure dates are properly formatted
    if (cleanedData.date && !(cleanedData.date instanceof Date)) {
      cleanedData.date = new Date(cleanedData.date);
    }
    
    if (cleanedData.updatedAt && !(cleanedData.updatedAt instanceof Date)) {
      cleanedData.updatedAt = new Date(cleanedData.updatedAt);
    } else {
      cleanedData.updatedAt = new Date();
    }
    
    // Force status to lowercase for consistency
    if (cleanedData.status) {
      const originalStatus = cleanedData.status;
      // Cast the lowercase status to the correct type
      const normalizedStatus = cleanedData.status.toLowerCase();
      
      // Validate the status is one of the allowed values
      if (['scheduled', 'in-progress', 'completed', 'cancelled'].includes(normalizedStatus)) {
        cleanedData.status = normalizedStatus as "scheduled" | "in-progress" | "completed" | "cancelled";
        
        if (originalStatus !== normalizedStatus) {
          console.log(`Status normalized from "${originalStatus}" to "${normalizedStatus}"`);
        }
      } else {
        console.warn(`Invalid status value: ${normalizedStatus}, leaving unchanged`);
      }
    }
    
    console.log(`Attempting to update visit with data:`, JSON.stringify(cleanedData, null, 2));
    
    // Update the visit
    const updatedVisit = await updateDocumentById(Visit, id, cleanedData);
    
    if (!updatedVisit) {
      console.error(`Failed to update visit with ID: ${id}`);
      throw new Error(`Visit update failed for ID: ${id}`);
    }
    
    console.log(`Successfully updated visit: ${id}, status: ${updatedVisit.status}`);
    return updatedVisit;
  } catch (error: any) {
    console.error(`Error in updateVisit for ID ${id}:`, error);
    throw new Error(`Visit update failed: ${error.message}`);
  }
}

/**
 * Delete a visit by ID
 */
export async function deleteVisit(id: string): Promise<boolean> {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid visit ID');
    }
    
    const result = await deleteDocumentById(Visit, id);
    return result;
  } catch (error) {
    console.error(`Error deleting visit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Find visits by userId with case-insensitive pattern matching
 * This is a fallback method to handle possible case mismatches
 */
export async function findVisitsByUserIdPattern(userId: string): Promise<VisitData[]> {
  console.log('VISIT SERVICE: findVisitsByUserIdPattern called with userId:', userId);
  try {
    if (!userId) {
      console.log('VISIT SERVICE: No userId provided for pattern matching');
      return [];
    }
    
    await dbConnect();
    console.log('VISIT SERVICE: Connected to database for case-insensitive search');
    
    // First attempt: Check if any visits exist at all (debug only)
    const allVisits = await findDocuments(Visit, {});
    console.log(`VISIT SERVICE: Total visits in database (unrestricted): ${allVisits.length}`);
    
    if (allVisits.length > 0) {
      console.log('VISIT SERVICE: Sample userIds in database:', 
        allVisits.slice(0, 3).map(v => v.userId).join(', '));
    }
    
    // Do a case-insensitive search
    console.log('VISIT SERVICE: Performing case-insensitive search for userId:', userId);
    const regex = new RegExp(`^${userId}$`, 'i');
    const visits = await findDocuments(Visit, { 
      userId: { $regex: regex } 
    }, { sort: { date: -1 } });
    
    console.log(`VISIT SERVICE: Found ${visits.length} visits with case-insensitive match`);
    
    // If still no results, try an alternative approach as a last resort
    if (visits.length === 0 && allVisits.length > 0) {
      console.log('VISIT SERVICE: Attempting to identify userId format differences');
      
      // Convert all userIds to lowercase for comparison
      const lowerUserId = userId.toLowerCase();
      const matchingVisits = allVisits.filter(v => 
        v.userId && v.userId.toLowerCase() === lowerUserId
      );
      
      console.log(`VISIT SERVICE: Found ${matchingVisits.length} visits with lowercase comparison`);
      
      if (matchingVisits.length > 0) {
        console.log('VISIT SERVICE: First matching userId:', matchingVisits[0].userId);
        return matchingVisits;
      }
    }
    
    return visits;
  } catch (error) {
    console.error('VISIT SERVICE: Error in findVisitsByUserIdPattern:', error);
    return [];
  }
} 