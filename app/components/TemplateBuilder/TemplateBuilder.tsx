'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { PlusCircleIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import QuestionTypeConfig from './QuestionTypeConfig';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface UserInfo {
  name: string;
  email: string;
}

export interface Recommendation {
  id: string;
  text: string;
  category: string;
}

export interface Option {
  id: string;
  text: string;
  value?: string;
  order: number;
  isDefault?: boolean;
  recommendations?: Recommendation[];
}

export interface SkipLogicRule {
  id: string;
  condition: {
    questionId: string;
    operator: string;
    value: string;
  };
  action?: 'SHOW' | 'HIDE';
  targetType?: 'QUESTION' | 'SECTION';
  targetSectionId?: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  isRequired: boolean;
  options?: Option[];
  skipLogicRules?: SkipLogicRule[];
  scaleConfig?: {
    min: number;
    max: number;
    step: number;
    labels: {
      min: string;
      max: string;
    };
  };
  matrixConfig?: {
    rows: string[];
    columns: string[];
    allowMultiple: boolean;
  };
  vitalSignsConfig?: {
    fields: {
      type: string;
      unit: string;
      min: number;
      max: number;
      required: boolean;
    }[];
  };
  scoringScaleConfig?: {
    options: {
      value: number;
      label: string;
    }[];
  };
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  questions: Question[];
}

export interface Template {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  sections: Section[];
  sectionCount?: number;
  questionCount?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 10);

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Question Type Options
const questionTypes = [
  { value: 'TEXT', label: 'Short Text' },
  { value: 'TEXTAREA', label: 'Long Text' },
  { value: 'SELECT', label: 'Dropdown Select' },
  { value: 'MULTISELECT', label: 'Multi-Select' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'RADIO', label: 'Radio Button' },
  { value: 'DATE', label: 'Date Picker' },
  { value: 'NUMBER', label: 'Number Input' },
  { value: 'SCALE', label: 'Scale (0-10)' },
  { value: 'MATRIX', label: 'Matrix/Grid' },
  { value: 'VITAL_SIGNS', label: 'Vital Signs' },
  { value: 'BMI_CALCULATOR', label: 'BMI Calculator' },
  { value: 'SCORING_SCALE', label: 'Scoring Scale (e.g., PHQ-9)' },
];

// Add type definitions for configurations
type VitalSignType = 'temperature' | 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'oxygenSaturation' | 'weight' | 'height';
type ScoringScaleType = 'PHQ9' | 'GAD7' | 'custom';

interface VitalSignField {
  type: VitalSignType;
  unit: string;
  min?: number;
  max?: number;
  required: boolean;
}

interface VitalSignsConfig {
  fields: VitalSignField[];
}

interface ScoringScaleConfig {
  type: ScoringScaleType;
  questions: {
    text: string;
    options: {
      text: string;
      value: number;
    }[];
  }[];
  scoringRules: {
    ranges: {
      min: number;
      max: number;
      label: string;
      recommendations: string[];
    }[];
  };
}

// TemplateBuilder Component
interface TemplateBuilderProps {
  initialTemplate?: Template;
  onSave: (template: Template) => void;
}

export default function TemplateBuilder({ initialTemplate, onSave }: TemplateBuilderProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const formMethods = useForm<Template>({
    defaultValues: {
      id: generateId(), // Generate an ID for the new template
      name: '',
      description: '',
      isActive: true,
      sections: [],
    }
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = formMethods;

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = 
    useFieldArray({ control, name: 'sections' });

  // Watch all sections for drag and drop reordering
  const watchSections = watch('sections');

  // Load initial template data if provided (for editing mode)
  useEffect(() => {
    if (initialTemplate) {
      console.log('Loading initial template:', initialTemplate);
      
      // Handle MongoDB _id to id conversion
      const templateToEdit = {
        ...initialTemplate,
        id: initialTemplate._id || initialTemplate.id // Use MongoDB _id if available
      };
      
      // Reset form with initial template data
      Object.keys(templateToEdit).forEach(key => {
        // Handle nested arrays and objects properly
        setValue(key as any, templateToEdit[key as keyof Template]);
      });
      
      // If there are sections, expand the first one by default
      if (templateToEdit.sections && templateToEdit.sections.length > 0) {
        setActiveSection(0);
      } else {
        // If there are no sections, create a default section with one question
        handleAddSection();
      }
    }
  }, [initialTemplate, setValue]);

  // Handle form submission
  const onSubmit = (data: Template) => {
    // Validation checks before processing
    let hasValidationErrors = false;
    
    // Ensure there's at least one section
    if (data.sections.length === 0) {
      alert("Please add at least one section to your template.");
      return;
    }

    // Process and ensure all arrays have proper order properties and required fields exist
    data.sections.forEach((section, sectionIndex) => {
      // Validate section title
      if (!section.title || section.title.trim() === '') {
        alert(`Section ${sectionIndex + 1} requires a title.`);
        hasValidationErrors = true;
        return;
      }
      
      section.order = sectionIndex;
      
      // Validate questions
      if (!section.questions || section.questions.length === 0) {
        alert(`Section "${section.title}" needs at least one question.`);
        hasValidationErrors = true;
        return;
      }
      
      section.questions.forEach((question, questionIndex) => {
        // Validate question text
        if (!question.text || question.text.trim() === '') {
          alert(`Question ${questionIndex + 1} in section "${section.title}" requires text.`);
          hasValidationErrors = true;
          return;
        }
        
        question.order = questionIndex;
        
        // Ensure options array exists
        if (!question.options) {
          question.options = [];
        }
        
        question.options.forEach((option, optionIndex) => {
          // Validate option text
          if (!option.text || option.text.trim() === '') {
            alert(`Option ${optionIndex + 1} in question "${question.text}" requires text.`);
            hasValidationErrors = true;
            return;
          }
          
          option.order = optionIndex;
        });
      });
    });
    
    // If validation fails, don't proceed with saving
    if (hasValidationErrors) {
      return;
    }
    
    // Log template data for debugging
    console.log('Template data to save:', data);
    
    onSave(data);
  };

  // Handle adding a new section
  const handleAddSection = () => {
    const newSection: Section = {
      id: generateId(),
      title: `Section ${sections.length + 1}`,
      description: '',
      order: sections.length,
      isActive: true,
      questions: [],
    };
    appendSection(newSection);
    setActiveSection(sections.length);
    
    // If this is the first section, automatically add a default question
    if (sections.length === 0) {
      // We need to wait for the section to be added to the form
      setTimeout(() => {
        handleAddQuestion(0);
      }, 100);
    }
  };

  // Handle drag and drop for sections
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    if (type === 'section') {
      // Reorder sections
      if (source.index !== destination.index) {
        moveSection(source.index, destination.index);
        
        // Update active section if needed
        if (activeSection === source.index) {
          setActiveSection(destination.index);
        } else if (
          activeSection !== null &&
          activeSection >= Math.min(source.index, destination.index) &&
          activeSection <= Math.max(source.index, destination.index)
        ) {
          setActiveSection(
            activeSection < source.index
              ? activeSection + 1
              : activeSection - 1
          );
        }
      }
    } else if (type === 'question') {
      // Extract section index from droppable id (format: "questions-{sectionIndex}")
      const sectionIndex = parseInt(result.destination.droppableId.split('-')[1], 10);
      
      // Reorder questions within a section
      const reorderedQuestions = reorder<Question>(
        watchSections[sectionIndex].questions,
        source.index,
        destination.index
      );
      
      setValue(`sections.${sectionIndex}.questions`, reorderedQuestions);
    }
  };

  // Handle adding a new question to a section
  const handleAddQuestion = (sectionIndex: number) => {
    const currentQuestions = watchSections[sectionIndex].questions || [];
    
    // Create default options for the radio button
    const defaultOptions = [
      {
        id: generateId(),
        text: 'Option 1',
        value: 'option_1',
        order: 0,
      },
      {
        id: generateId(),
        text: 'Option 2',
        value: 'option_2',
        order: 1,
      },
      {
        id: generateId(),
        text: 'Option 3',
        value: 'option_3',
        order: 2,
      },
    ];
    
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      type: 'RADIO', // Default to RADIO type
      options: defaultOptions,
      order: currentQuestions.length,
      isRequired: false,
    };

    setValue(`sections.${sectionIndex}.questions`, [...currentQuestions, newQuestion]);
    
    // Expand newly added question
    setExpandedQuestions({
      ...expandedQuestions,
      [newQuestion.id]: true,
    });
  };

  // Toggle expanded state of a question
  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [questionId]: !expandedQuestions[questionId],
    });
  };

  // Remove a question from a section
  const handleRemoveQuestion = (sectionIndex: number, questionIndex: number) => {
    const currentQuestions = [...watchSections[sectionIndex].questions];
    currentQuestions.splice(questionIndex, 1);
    setValue(`sections.${sectionIndex}.questions`, currentQuestions);
  };

  // Add new function to handle question type changes
  const handleQuestionTypeChange = (sectionIndex: number, questionIndex: number, newType: string) => {
    const question = watchSections[sectionIndex].questions[questionIndex];
    
    // Clear existing options and configs
    question.options = [];
    question.scaleConfig = undefined;
    question.matrixConfig = undefined;
    question.vitalSignsConfig = undefined;
    question.scoringScaleConfig = undefined;
    
    // Set default config based on new type
    switch (newType) {
      case 'SCALE':
        question.scaleConfig = {
          min: 0,
          max: 10,
          step: 1,
          labels: {
            min: 'Not at all',
            max: 'Very much',
          },
        };
        break;
      case 'MATRIX':
        question.matrixConfig = {
          rows: ['Row 1', 'Row 2'],
          columns: ['Column 1', 'Column 2'],
          allowMultiple: false,
        };
        break;
      case 'VITAL_SIGNS':
        question.vitalSignsConfig = {
          fields: [
            {
              type: 'temperature',
              unit: '°F',
              min: 95,
              max: 105,
              required: true,
            },
            {
              type: 'bloodPressure',
              unit: 'mmHg',
              min: 70,
              max: 200,
              required: true,
            },
            {
              type: 'heartRate',
              unit: 'bpm',
              min: 40,
              max: 200,
              required: true,
            },
          ],
        };
        break;
      case 'SELECT':
      case 'MULTISELECT':
      case 'CHECKBOX':
      case 'RADIO':
        // For option-based types, add default options
        question.options = [
          {
            id: generateId(),
            text: 'Option 1',
            value: 'option_1',
            order: 0,
          },
          {
            id: generateId(),
            text: 'Option 2',
            value: 'option_2',
            order: 1,
          },
        ];
        break;
      default:
        // For text-based types, no options needed
        question.options = [];
    }
    
    // Update the question with the new type and configs
    question.type = newType;
    setValue(`sections.${sectionIndex}.questions.${questionIndex}`, question);
  };

  // Add function to handle adding an option
  const handleAddOption = (sectionIndex: number, questionIndex: number) => {
    // Create a new option with a unique ID
    const newOption = {
      id: uuidv4(),
      text: 'New Option',
      value: `option_${watchSections[sectionIndex].questions[questionIndex].options?.length || 0 + 1}`,
      order: watchSections[sectionIndex].questions[questionIndex].options?.length || 0,
      recommendations: [] // Initialize empty recommendations array
    };

    // Update the form data with the new option
    setValue(
      `sections.${sectionIndex}.questions.${questionIndex}.options`,
      [...(watchSections[sectionIndex].questions[questionIndex].options || []), newOption]
    );

    console.log('Successfully added option');
  };

  // Add function to handle removing an option
  const handleRemoveOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const currentOptions = [...(watchSections[sectionIndex].questions[questionIndex].options || [])];
    
    // Remove the option at the specified index
    currentOptions.splice(optionIndex, 1);
    
    // Reorder remaining options
    currentOptions.forEach((opt, idx) => {
      opt.order = idx;
    });
    
    // Update the form data
    setValue(
      `sections.${sectionIndex}.questions.${questionIndex}.options`,
      currentOptions
    );
    
    console.log('Successfully removed option');
  };

  // Add function for auto-saving
  const autoSave = useCallback(
    (data: Template) => {
      // Don't auto-save if the form is not valid yet or if there are no sections
      if (!data.name || !data.sections || data.sections.length === 0) {
        return;
      }

      // Update status
      setAutoSaveStatus('Saving...');
      
      try {
        // Call the save function
        onSave(data);
        
        // Update last saved time
        const now = new Date();
        setLastSaved(now);
        setAutoSaveStatus(`Last auto-saved at ${now.toLocaleTimeString()}`);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setAutoSaveStatus('');
        }, 3000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('Auto-save failed');
      }
    },
    [onSave]
  );

  // Set up auto-save timer
  useEffect(() => {
    // Get the current form data
    const subscription = formMethods.watch((formData) => {
      // Only start auto-saving after initial data is loaded
      if (!formData.name || initialTemplate && !lastSaved) return;
      
      const autoSaveTimer = setTimeout(() => {
        autoSave(formData as Template);
      }, 30000); // Auto-save after 30 seconds of inactivity
      
      return () => clearTimeout(autoSaveTimer);
    });
    
    return () => subscription.unsubscribe();
  }, [formMethods, autoSave, initialTemplate, lastSaved]);

  return (
    <div className="flex flex-col space-y-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Template Information</h2>
            {autoSaveStatus && (
              <span className="text-sm text-gray-500 italic">{autoSaveStatus}</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Template name is required' })}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="is-active" className="flex items-center">
                <input
                  id="is-active"
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active Template</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sections and Questions */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Template Sections</h2>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Add Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">No sections added yet. Click "Add Section" to begin building your template.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Section List */}
                <div className="md:col-span-1 border-r border-gray-200 pr-4">
                  <Droppable 
                    droppableId="sections" 
                    type="section" 
                    isDropDisabled={false} 
                    isCombineEnabled={false}
                    ignoreContainerClipping={false}
                  >
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {sections.map((section, index) => (
                          <Draggable 
                            key={section.id} 
                            draggableId={`section-${section.id}`} 
                            index={index}
                            isDragDisabled={false}
                          >
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-3 rounded-md cursor-pointer flex justify-between items-center group ${
                                  activeSection === index
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveSection(index)}
                              >
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {watchSections[index]?.title || `Section ${index + 1}`}
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {watchSections[index]?.questions?.length || 0} questions
                                  </div>
                                </div>
                                <div 
                                  className="opacity-50 hover:opacity-100" 
                                  {...provided.dragHandleProps}
                                >
                                  <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
                                </div>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </div>

                {/* Section Content */}
                <div className="md:col-span-3">
                  {activeSection !== null && (
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 rounded-md">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Section Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register(`sections.${activeSection}.title`, { 
                                required: 'Section title is required' 
                              })}
                              className={`w-full px-3 py-2 border ${errors.sections?.[activeSection]?.title ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.sections?.[activeSection]?.title && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.sections[activeSection]?.title?.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Section Description
                            </label>
                            <textarea
                              {...register(`sections.${activeSection}.description`)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`section-active-${activeSection}`}
                                {...register(`sections.${activeSection}.isActive`)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label 
                                htmlFor={`section-active-${activeSection}`}
                                className="ml-2 text-sm text-gray-700"
                              >
                                Active
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSection(activeSection)}
                              className="px-2 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                            >
                              Delete Section
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Questions */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Questions</h3>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(activeSection)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                          >
                            <PlusCircleIcon className="h-4 w-4 mr-1" />
                            Add Question
                          </button>
                        </div>

                        <Droppable 
                          droppableId={`questions-${activeSection}`} 
                          type="question" 
                          isDropDisabled={false} 
                          isCombineEnabled={false}
                          ignoreContainerClipping={false}
                        >
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {watchSections[activeSection]?.questions?.map((question, questionIndex) => (
                                <Draggable
                                  key={question.id}
                                  draggableId={`question-${question.id}`}
                                  index={questionIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="border border-gray-200 rounded-md overflow-hidden"
                                    >
                                      {/* Question Header */}
                                      <div 
                                        className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer"
                                        onClick={() => toggleQuestionExpanded(question.id)}
                                      >
                                        <div className="flex items-center">
                                          <div 
                                            className="mr-2" 
                                            {...provided.dragHandleProps}
                                          >
                                            <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
                                          </div>
                                          <span className="font-medium">
                                            {question.text || `Question ${questionIndex + 1}`}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {questionTypes.find(t => t.value === question.type)?.label || question.type}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveQuestion(activeSection, questionIndex);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <TrashIcon className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Question Details */}
                                      {expandedQuestions[question.id] && (
                                        <div className="p-4 border-t border-gray-200">
                                          <div className="grid grid-cols-1 gap-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Question Text <span className="text-red-500">*</span>
                                              </label>
                                              <input
                                                type="text"
                                                {...register(`sections.${activeSection}.questions.${questionIndex}.text`, {
                                                  required: 'Question text is required'
                                                })}
                                                className={`w-full px-3 py-2 border ${errors.sections?.[activeSection]?.questions?.[questionIndex]?.text ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                              />
                                              {errors.sections?.[activeSection]?.questions?.[questionIndex]?.text && (
                                                <p className="mt-1 text-sm text-red-600">
                                                  {errors.sections?.[activeSection]?.questions?.[questionIndex]?.text?.message}
                                                </p>
                                              )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Question Type*
                                                </label>
                                                <select
                                                  {...register(`sections.${activeSection}.questions.${questionIndex}.type`)}
                                                  onChange={(e) => handleQuestionTypeChange(activeSection, questionIndex, e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                  {questionTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                      {type.label}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                              <div className="flex items-center">
                                                <input
                                                  type="checkbox"
                                                  id={`question-required-${question.id}`}
                                                  {...register(`sections.${activeSection}.questions.${questionIndex}.isRequired`)}
                                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label 
                                                  htmlFor={`question-required-${question.id}`}
                                                  className="ml-2 text-sm text-gray-700"
                                                >
                                                  Required Question
                                                </label>
                                              </div>
                                            </div>

                                            {/* Advanced Question Type Configurations */}
                                            <QuestionTypeConfig 
                                              question={question}
                                              activeSection={activeSection}
                                              questionIndex={questionIndex}
                                              setValue={setValue}
                                            />

                                            {/* Add Skip Logic Section */}
                                            <div className="mt-6 border-t border-gray-200 pt-4">
                                              <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-md font-medium">Skip Logic</h4>
                                              </div>
                                              <p className="text-sm text-gray-500 mb-3">
                                                Create rules to show or hide this question based on answers to previous questions.
                                              </p>
                                              
                                              <div className="space-y-3">
                                                {question.skipLogicRules?.map((rule, ruleIndex) => {
                                                  // Find available questions for skip logic
                                                  const availableQuestions = watchSections.flatMap((section, idx) => {
                                                    if (idx === activeSection) {
                                                      // Only include questions before this one in the same section
                                                      return section.questions
                                                        .filter((_, qIdx) => qIdx < questionIndex)
                                                        .map(q => ({ ...q, sectionIndex: idx }));
                                                    }
                                                    // Include all questions from previous sections
                                                    return section.questions.map(q => ({ ...q, sectionIndex: idx }));
                                                  });
                                                  
                                                  // Get the referenced question
                                                  const sourceQuestion = availableQuestions.find(q => q.id === rule.condition.questionId);
                                                  
                                                  return (
                                                    <div key={rule.id} className="border border-gray-200 rounded-md p-3">
                                                      <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium">Rule {ruleIndex + 1}</span>
                                                      </div>
                                                      
                                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Source Question
                                                          </label>
                                                          <select
                                                            {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.condition.questionId`)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                          >
                                                            {availableQuestions.map(q => (
                                                              <option key={q.id} value={q.id}>
                                                                {q.text || `Question ${q.order + 1}`}
                                                              </option>
                                                            ))}
                                                          </select>
                                                        </div>
                                                        
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Operator
                                                          </label>
                                                          <select
                                                            {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.condition.operator`)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                          >
                                                            <option value="EQUALS">Equals</option>
                                                            <option value="NOT_EQUALS">Not Equals</option>
                                                            <option value="CONTAINS">Contains</option>
                                                            <option value="GREATER_THAN">Greater Than</option>
                                                            <option value="LESS_THAN">Less Than</option>
                                                            <option value="IS_ANSWERED">Is Answered</option>
                                                            <option value="IS_NOT_ANSWERED">Is Not Answered</option>
                                                          </select>
                                                        </div>
                                                        
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Value
                                                          </label>
                                                          {sourceQuestion && ['RADIO', 'SELECT', 'MULTISELECT', 'CHECKBOX'].includes(sourceQuestion.type) ? (
                                                            <select
                                                              {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.condition.value`)}
                                                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                              {sourceQuestion.options.map(option => (
                                                                <option key={option.id} value={option.value}>
                                                                  {option.text}
                                                                </option>
                                                              ))}
                                                            </select>
                                                          ) : (
                                                            <input
                                                              type="text"
                                                              {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.condition.value`)}
                                                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                              disabled={['IS_ANSWERED', 'IS_NOT_ANSWERED'].includes(rule.condition.operator)}
                                                            />
                                                          )}
                                                        </div>
                                                      </div>
                                                      
                                                      {/* Add action and target selection */}
                                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Action
                                                          </label>
                                                          <select
                                                            {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.action`)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                          >
                                                            <option value="SHOW">Show</option>
                                                            <option value="HIDE">Hide</option>
                                                          </select>
                                                        </div>
                                                        
                                                        <div>
                                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Target Type
                                                          </label>
                                                          <select
                                                            {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.targetType`)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                          >
                                                            <option value="QUESTION">This Question</option>
                                                            <option value="SECTION">A Section</option>
                                                          </select>
                                                        </div>
                                                        
                                                        {rule.targetType === 'SECTION' && (
                                                          <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                              Target Section
                                                            </label>
                                                            <select
                                                              {...register(`sections.${activeSection}.questions.${questionIndex}.skipLogicRules.${ruleIndex}.targetSectionId`)}
                                                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                              {watchSections.map((section, idx) => (
                                                                <option key={section.id} value={section.id}>
                                                                  {section.title || `Section ${idx + 1}`}
                                                                </option>
                                                              ))}
                                                            </select>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DragDropContext>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                router.push('/templates');
              }
            }}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
}
