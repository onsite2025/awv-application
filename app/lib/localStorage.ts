// Type imports
import { Template } from '../components/TemplateBuilder/TemplateBuilder';

// Keys for localStorage
const TEMPLATES_KEY = 'awv_templates';

// Get all templates from localStorage
export const getTemplates = (): Template[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const templates = localStorage.getItem(TEMPLATES_KEY);
  if (!templates) {
    return [];
  }
  
  try {
    return JSON.parse(templates);
  } catch (error) {
    console.error('Error parsing templates from localStorage:', error);
    return [];
  }
};

// Save a template to localStorage
export const saveTemplate = (template: Template): Template => {
  if (typeof window === 'undefined') {
    return template;
  }
  
  // Get existing templates
  const templates = getTemplates();
  
  // Generate an ID if not provided
  if (!template.id) {
    template.id = Date.now().toString();
  }
  
  // Add creation and update timestamps
  const now = new Date().toISOString();
  const templateWithMeta = {
    ...template,
    createdAt: now,
    updatedAt: now,
    createdBy: 'Demo User',
    sectionCount: template.sections.length,
    questionCount: template.sections.reduce(
      (count, section) => count + (section.questions?.length || 0), 
      0
    ),
  };
  
  // Add to templates array
  templates.push(templateWithMeta);
  
  // Save back to localStorage
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  
  return templateWithMeta;
};

// Delete a template from localStorage
export const deleteTemplate = (id: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Get existing templates
  const templates = getTemplates();
  
  // Filter out the template with the specified id
  const filteredTemplates = templates.filter(template => template.id !== id);
  
  // If no templates were removed, return false
  if (filteredTemplates.length === templates.length) {
    return false;
  }
  
  // Save the filtered templates back to localStorage
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filteredTemplates));
  
  return true;
};

// Update an existing template in localStorage
export const updateTemplate = (template: Template): Template | null => {
  if (typeof window === 'undefined' || !template.id) {
    return null;
  }
  
  // Get existing templates
  const templates = getTemplates();
  
  // Find the index of the template to update
  const templateIndex = templates.findIndex(t => t.id === template.id);
  
  // If template not found, return null
  if (templateIndex === -1) {
    return null;
  }
  
  // Update template with new values and metadata
  const updatedTemplate = {
    ...template,
    createdAt: templates[templateIndex].createdAt,
    updatedAt: new Date().toISOString(),
    createdBy: templates[templateIndex].createdBy,
    sectionCount: template.sections.length,
    questionCount: template.sections.reduce(
      (count, section) => count + (section.questions?.length || 0), 
      0
    ),
  };
  
  // Replace the template in the array
  templates[templateIndex] = updatedTemplate;
  
  // Save back to localStorage
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  
  return updatedTemplate;
};

// Get a single template by ID
export const getTemplateById = (id: string): Template | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const templates = getTemplates();
  return templates.find(template => template.id === id) || null;
}; 