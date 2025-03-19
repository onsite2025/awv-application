import { 
  findDocuments, 
  findDocumentById, 
  createDocument, 
  updateDocumentById, 
  deleteDocumentById 
} from './db';
import Template from '../models/Template';

// Interface for template data
interface TemplateData {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  userId?: string;
  sections: any[];
  sectionCount?: number;
  questionCount?: number;
  [key: string]: any;
}

/**
 * Convert MongoDB document to plain object
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
 * Get all templates from the database
 * @param userId - Optional userId to filter templates by owner
 * @returns Array of templates
 */
export async function getTemplates(userId?: string) {
  const query = userId ? { userId } : {};
  const templates = await findDocuments(Template, query, { updatedAt: -1 });
  
  // Convert each template to a plain object
  return templates.map(template => convertToPlainObject(template));
}

/**
 * Get a template by ID
 * @param id - Template ID
 * @returns Template or null if not found
 */
export async function getTemplateById(id: string) {
  try {
    const template = await findDocumentById(Template, id);
    return convertToPlainObject(template);
  } catch (error) {
    console.error(`Error finding template by ID ${id}:`, error);
    return null;
  }
}

/**
 * Save a new template to the database
 * @param template - Template to save
 * @param userId - Optional user ID to associate with the template
 * @returns Saved template
 */
export async function saveTemplate(template: TemplateData, userId?: string) {
  try {
    // If a userId is provided, assign it to the template
    if (userId) {
      template.userId = userId;
    }
    
    // Calculate section and question counts
    const sectionCount = template.sections?.length || 0;
    let questionCount = 0;
    
    template.sections?.forEach((section) => {
      questionCount += section.questions?.length || 0;
    });
    
    template.sectionCount = sectionCount;
    template.questionCount = questionCount;
    
    const savedTemplate = await createDocument(Template, template);
    return convertToPlainObject(savedTemplate);
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

/**
 * Update an existing template in the database
 * @param id - Template ID
 * @param template - Template to update
 * @returns Updated template or null if not found
 */
export async function updateTemplate(id: string, template: Partial<TemplateData>) {
  try {
    // Make sure we work with the MongoDB _id
    const cleanedTemplate = { ...template };
    
    // Preserve the original MongoDB _id if present in the template
    if (template._id) {
      // If _id exists, keep using it
      // No need to modify
    } else if (template.id) {
      // If only client-side id exists, use it as _id for MongoDB
      cleanedTemplate._id = template.id;
    }
    
    // Calculate section and question counts if sections are provided
    if (template.sections) {
      const sectionCount = template.sections.length;
      let questionCount = 0;
      
      template.sections.forEach((section) => {
        questionCount += section.questions?.length || 0;
      });
      
      cleanedTemplate.sectionCount = sectionCount;
      cleanedTemplate.questionCount = questionCount;
    }
    
    const updatedTemplate = await updateDocumentById(Template, id, cleanedTemplate);
    return convertToPlainObject(updatedTemplate);
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    return null;
  }
}

/**
 * Delete a template from the database
 * @param id - Template ID to delete
 * @returns Boolean indicating success
 */
export async function deleteTemplate(id: string) {
  return deleteDocumentById(Template, id);
} 