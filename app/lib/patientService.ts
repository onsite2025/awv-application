import { 
  findDocuments, 
  findDocumentById, 
  createDocument, 
  updateDocumentById, 
  deleteDocumentById 
} from './db';
import Patient from '../models/Patient';

// Interface for patient data
interface PatientData {
  _id?: string;
  id?: string;
  name: string;
  dateOfBirth: string | Date;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  mrn: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
  userId?: string;
  lastVisitDate?: string | Date;
}

/**
 * Convert MongoDB document to plain object
 * This avoids the "Objects with toJSON methods are not supported" error
 */
function convertToPlainObject(doc: any): any {
  if (!doc) return null;
  
  // If it's already a plain object, return it
  if (!doc.toObject && !doc._doc) return doc;
  
  // Convert to plain object using Mongoose's toObject if available
  const plainObject = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc._doc || doc));
  
  // Ensure both _id and id fields exist
  if (plainObject._id) {
    plainObject.id = plainObject._id.toString();
  }
  
  return plainObject;
}

/**
 * Get all patients from the database
 * @param userId - Optional userId to filter patients by owner
 * @returns Array of patients
 */
export async function getPatients(userId?: string) {
  const query = userId ? { userId } : {};
  const patients = await findDocuments(Patient, query, { updatedAt: -1 });
  
  // Convert each patient to a plain object
  return patients.map(patient => convertToPlainObject(patient));
}

/**
 * Get a patient by ID
 * @param id - Patient ID
 * @returns Patient or null if not found
 */
export async function getPatientById(id: string) {
  try {
    const patient = await findDocumentById(Patient, id);
    return convertToPlainObject(patient);
  } catch (error) {
    console.error(`Error finding patient by ID ${id}:`, error);
    return null;
  }
}

/**
 * Save a new patient to the database
 * @param patient - Patient to save
 * @param userId - Optional user ID to associate with the patient
 * @returns Saved patient
 */
export async function savePatient(patient: PatientData, userId?: string) {
  try {
    // If a userId is provided, assign it to the patient
    if (userId) {
      patient.userId = userId;
    }
    
    // Format the date of birth
    if (patient.dateOfBirth && typeof patient.dateOfBirth === 'string') {
      patient.dateOfBirth = new Date(patient.dateOfBirth);
    }
    
    // Format the last visit date if present
    if (patient.lastVisitDate && typeof patient.lastVisitDate === 'string') {
      patient.lastVisitDate = new Date(patient.lastVisitDate);
    }
    
    const savedPatient = await createDocument(Patient, patient);
    return convertToPlainObject(savedPatient);
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
}

/**
 * Update an existing patient in the database
 * @param id - Patient ID
 * @param patient - Patient data to update
 * @returns Updated patient or null if not found
 */
export async function updatePatient(id: string, patient: Partial<PatientData>) {
  try {
    // Make sure we work with the MongoDB _id
    const cleanedPatient = { ...patient };
    
    // Preserve the original MongoDB _id if present in the patient
    if (patient._id) {
      // If _id exists, keep using it
      // No need to modify
    } else if (patient.id) {
      // If only client-side id exists, use it as _id for MongoDB
      cleanedPatient._id = patient.id;
    }
    
    // Format the date of birth if present
    if (patient.dateOfBirth && typeof patient.dateOfBirth === 'string') {
      cleanedPatient.dateOfBirth = new Date(patient.dateOfBirth);
    }
    
    // Format the last visit date if present
    if (patient.lastVisitDate && typeof patient.lastVisitDate === 'string') {
      cleanedPatient.lastVisitDate = new Date(patient.lastVisitDate);
    }
    
    const updatedPatient = await updateDocumentById(Patient, id, cleanedPatient);
    return convertToPlainObject(updatedPatient);
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error);
    return null;
  }
}

/**
 * Delete a patient from the database
 * @param id - Patient ID to delete
 * @returns Boolean indicating success
 */
export async function deletePatient(id: string) {
  return deleteDocumentById(Patient, id);
} 