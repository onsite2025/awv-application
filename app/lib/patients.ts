import { connectToDatabase } from './db';
import { ObjectId, Document, WithId } from 'mongodb';

interface Patient {
  _id: string;
  name: string;
  dateOfBirth: string | Date;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  [key: string]: any; // Allow other fields
}

/**
 * Get a patient by ID from the database
 * @param id Patient ID
 * @returns Patient object or null if not found
 */
export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const { db } = await connectToDatabase();
    
    // Try to convert string ID to ObjectId if possible
    let query: any = { _id: id };
    
    // If ID is a valid ObjectId format, search by ObjectId
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { _id: new ObjectId(id) }] };
    }
    
    const patient = await db.collection('patients').findOne(query);
    
    if (!patient) {
      console.log(`Patient with ID ${id} not found`);
      return null;
    }
    
    // Safe type conversion
    return patient as unknown as Patient;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
}

/**
 * Get all patients from the database
 * @returns Array of patient objects
 */
export async function getAllPatients(): Promise<Patient[]> {
  try {
    const { db } = await connectToDatabase();
    const patients = await db.collection('patients').find({}).toArray();
    
    // Safe type conversion
    return patients as unknown as Patient[];
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
} 