'use server';

import { dbConnect } from './db';
import { getTemplateById, getTemplates, saveTemplate, updateTemplate, deleteTemplate } from './templateService';

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