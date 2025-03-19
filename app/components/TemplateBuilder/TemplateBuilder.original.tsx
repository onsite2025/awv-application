'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { PlusCircleIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import QuestionTypeConfig from './QuestionTypeConfig';

// Types
export interface Recommendation {
  id: string;
  text: string;
  category?: string;
  isDefault: boolean;
}

export interface Option {
  id: string;
  text: string;
  value: string;
  order: number;
  recommendations: Recommendation[];
}

export interface SkipLogicRule {
  questionId: string;  // The question this rule applies to
  condition: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
  value: string | string[];  // The value to compare against
  action: 'show' | 'hide';  // What to do when condition is met
  targetQuestionIds: string[];  // Questions to show/hide
  targetSectionIds?: string[];  // Sections to show/hide
}

export interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  isRequired: boolean;
  options: Option[];
  defaultRecommendations: Recommendation[];
  skipLogic?: SkipLogicRule[];
  // New fields for advanced question types
  scaleConfig?: {
    min: number;
    max: number;
    step: number;
    labels?: {
      min: string;
      max: string;
    };
  };
  matrixConfig?: {
    rows: string[];
    columns: string[];
    allowMultiple: boolean;
  };
  vitalSignsConfig?: VitalSignsConfig;
  scoringScaleConfig?: ScoringScaleConfig;
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
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  sections: Section[];
  // Additional metadata fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  sectionCount?: number;
  questionCount?: number;
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
  const defaultTemplate: Template = {
    name: '',
    description: '',
    isActive: true,
    sections: [],
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Template>({
    defaultValues: initialTemplate || defaultTemplate,
  });

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = 
    useFieldArray({ control, name: 'sections' });

  const [activeSection, setActiveSection] = useState<number | null>(sections.length > 0 ? 0 : null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Watch all sections for drag and drop reordering
  const watchSections = watch('sections');

  // Handle form submission
  const onSubmit = (data: Template) => {
    // Ensure all arrays have proper order properties and required fields exist
    data.sections.forEach((section, sectionIndex) => {
      section.order = sectionIndex;
      section.questions.forEach((question, questionIndex) => {
        question.order = questionIndex;
        
        // Ensure defaultRecommendations exists
        if (!question.defaultRecommendations) {
          question.defaultRecommendations = [];
        }
        
        // Ensure options array exists
        if (!question.options) {
          question.options = [];
        }
        
        question.options.forEach((option, optionIndex) => {
          option.order = optionIndex;
          
          // Ensure recommendations array exists for each option
          if (!option.recommendations) {
            option.recommendations = [];
          }
        });
      });
    });
    
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
        recommendations: [],
      },
      {
        id: generateId(),
        text: 'Option 2',
        value: 'option_2',
        order: 1,
        recommendations: [],
      },
      {
        id: generateId(),
        text: 'Option 3',
        value: 'option_3',
        order: 2,
        recommendations: [],
      },
    ];
    
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      type: 'RADIO', // Default to RADIO type
      options: defaultOptions,
      order: currentQuestions.length,
      isRequired: false,
      defaultRecommendations: [],
      skipLogic: [], // Initialize empty skipLogic array
    };

    setValue(`sections.${sectionIndex}.questions`, [...currentQuestions, newQuestion]);
    
    // Expand newly added question
    setExpandedQuestions({
      ...expandedQuestions,
      [newQuestion.id]: true,
    });
  };

  // Handle adding an option to a question
  const handleAddOption = (sectionIndex: number, questionIndex: number) => {
    const currentOptions = watchSections[sectionIndex].questions[questionIndex].options || [];
    const newOption: Option = {
      id: generateId(),
      text: '',
      value: `option_${currentOptions.length + 1}`,
      order: currentOptions.length,
      recommendations: [],
    };

    setValue(`sections.${sectionIndex}.questions.${questionIndex}.options`, [...currentOptions, newOption]);
  };

  // Handle adding a recommendation to a default question recommendation
  const handleAddDefaultRecommendation = (sectionIndex: number, questionIndex: number) => {
    // Initialize defaultRecommendations if it doesn't exist
    if (!watchSections[sectionIndex].questions[questionIndex].defaultRecommendations) {
      setValue(`sections.${sectionIndex}.questions.${questionIndex}.defaultRecommendations`, []);
    }
    
    const currentRecommendations = watchSections[sectionIndex].questions[questionIndex].defaultRecommendations || [];
    const newRecommendation: Recommendation = {
      id: generateId(),
      text: '',
      category: 'General',
      isDefault: currentRecommendations.length === 0, // First one is default
    };

    setValue(`sections.${sectionIndex}.questions.${questionIndex}.defaultRecommendations`, 
      [...currentRecommendations, newRecommendation]);
  };

  // Handle adding a recommendation to an option
  const handleAddOptionRecommendation = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    // Initialize option recommendations if it doesn't exist
    if (!watchSections[sectionIndex].questions[questionIndex].options[optionIndex].recommendations) {
      setValue(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.recommendations`, []);
    }
    
    const currentRecommendations = watchSections[sectionIndex].questions[questionIndex].options[optionIndex].recommendations || [];
    const newRecommendation: Recommendation = {
      id: generateId(),
      text: '',
      category: 'General',
      isDefault: currentRecommendations.length === 0, // First one is default
    };

    setValue(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.recommendations`, 
      [...currentRecommendations, newRecommendation]);
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
    } else if (type === 'option') {
      // Extract indices from droppable id (format: "options-{sectionIndex}-{questionIndex}")
      const [_, sectionIndex, questionIndex] = result.destination.droppableId.split('-').map(Number);
      
      // Reorder options within a question
      const reorderedOptions = reorder<Option>(
        watchSections[sectionIndex].questions[questionIndex].options,
        source.index,
        destination.index
      );
      
      // Use this workaround to address the type issue with options
      const sectionPath = `sections.${sectionIndex}.questions.${questionIndex}.options`;
      setValue(sectionPath as any, reorderedOptions);
    }
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

  // Remove an option from a question
  const handleRemoveOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const currentOptions = [...watchSections[sectionIndex].questions[questionIndex].options];
    currentOptions.splice(optionIndex, 1);
    setValue(`sections.${sectionIndex}.questions.${questionIndex}.options`, currentOptions);
  };

  // Remove a default recommendation from a question
  const handleRemoveDefaultRecommendation = (sectionIndex: number, questionIndex: number, recommendationIndex: number) => {
    const currentRecommendations = [...(watchSections[sectionIndex].questions[questionIndex].defaultRecommendations || [])];
    currentRecommendations.splice(recommendationIndex, 1);
    setValue(`sections.${sectionIndex}.questions.${questionIndex}.defaultRecommendations`, currentRecommendations);
  };

  // Remove a recommendation from an option
  const handleRemoveOptionRecommendation = (sectionIndex: number, questionIndex: number, optionIndex: number, recommendationIndex: number) => {
    const currentRecommendations = [...(watchSections[sectionIndex].questions[questionIndex].options[optionIndex].recommendations || [])];
    currentRecommendations.splice(recommendationIndex, 1);
    setValue(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.recommendations`, currentRecommendations);
  };

  // Helper function to find a question by ID across all sections
  const findQuestionById = (questionId: string) => {
    for (const section of watchSections) {
      if (!section || !section.questions) continue;
      
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  };

  // Add a new function to handle adding skip logic rules
  const handleAddSkipLogic = (sectionIndex: number, questionIndex: number) => {
    const currentSkipLogic = watchSections[sectionIndex].questions[questionIndex].skipLogic || [];
    const newRule: SkipLogicRule = {
      questionId: '', // Will be set by the user from a dropdown
      condition: 'equals',
      value: '',
      action: 'hide',
      targetQuestionIds: [],
      targetSectionIds: [],
    };
    
    setValue(
      `sections.${sectionIndex}.questions.${questionIndex}.skipLogic`,
      [...currentSkipLogic, newRule]
    );
  };

  // Add a function to remove skip logic rules
  const handleRemoveSkipLogic = (sectionIndex: number, questionIndex: number, ruleIndex: number) => {
    const currentSkipLogic = [...(watchSections[sectionIndex].questions[questionIndex].skipLogic || [])];
    currentSkipLogic.splice(ruleIndex, 1);
    setValue(
      `sections.${sectionIndex}.questions.${questionIndex}.skipLogic`,
      currentSkipLogic
    );
  };

  // Add new helper functions for advanced question types
  const getDefaultScaleConfig = () => ({
    min: 0,
    max: 10,
    step: 1,
    labels: {
      min: 'Not at all',
      max: 'Very much',
    },
  });

  const getDefaultMatrixConfig = () => ({
    rows: ['Row 1', 'Row 2'],
    columns: ['Column 1', 'Column 2'],
    allowMultiple: false,
  });

  const getDefaultVitalSignsConfig = (): VitalSignsConfig => ({
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
      {
        type: 'respiratoryRate',
        unit: 'breaths/min',
        min: 8,
        max: 40,
        required: true,
      },
      {
        type: 'oxygenSaturation',
        unit: '%',
        min: 90,
        max: 100,
        required: true,
      },
      {
        type: 'weight',
        unit: 'lbs',
        min: 50,
        max: 500,
        required: true,
      },
      {
        type: 'height',
        unit: 'inches',
        min: 24,
        max: 96,
        required: true,
      },
    ],
  });

  const getDefaultScoringScaleConfig = (): ScoringScaleConfig => ({
    type: 'custom',
    questions: [
      {
        text: 'Question 1',
        options: [
          { text: 'Not at all', value: 0 },
          { text: 'Several days', value: 1 },
          { text: 'More than half the days', value: 2 },
          { text: 'Nearly every day', value: 3 },
        ],
      },
    ],
    scoringRules: {
      ranges: [
        { min: 0, max: 4, label: 'Minimal', recommendations: ['No action needed'] },
        { min: 5, max: 9, label: 'Mild', recommendations: ['Consider follow-up'] },
        { min: 10, max: 14, label: 'Moderate', recommendations: ['Schedule follow-up'] },
        { min: 15, max: 19, label: 'Moderately Severe', recommendations: ['Schedule urgent follow-up'] },
        { min: 20, max: 27, label: 'Severe', recommendations: ['Schedule immediate follow-up'] },
      ],
    },
  });

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
        question.scaleConfig = getDefaultScaleConfig();
        break;
      case 'MATRIX':
        question.matrixConfig = getDefaultMatrixConfig();
        break;
      case 'VITAL_SIGNS':
        question.vitalSignsConfig = getDefaultVitalSignsConfig();
        break;
      case 'BMI_CALCULATOR':
        question.vitalSignsConfig = getDefaultVitalSignsConfig();
        break;
      case 'SCORING_SCALE':
        question.scoringScaleConfig = getDefaultScoringScaleConfig();
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
            recommendations: [],
          },
          {
            id: generateId(),
            text: 'Option 2',
            value: 'option_2',
            order: 1,
            recommendations: [],
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

  return (
    <div className="flex flex-col space-y-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Template Header Information */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Template Information</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name*
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Template name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <Droppable droppableId="sections" type="section" isDropDisabled={false}>
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
                              Section Title*
                            </label>
                            <input
                              type="text"
                              {...register(`sections.${activeSection}.title`, { 
                                required: 'Section title is required' 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                        <Droppable droppableId={`questions-${activeSection}`} type="question" isDropDisabled={false}>
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
                                  isDragDisabled={false}
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
                                                Question Text*
                                              </label>
                                              <input
                                                type="text"
                                                {...register(`sections.${activeSection}.questions.${questionIndex}.text`, {
                                                  required: 'Question text is required'
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                              />
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
            }
          </div>
        </DragDropContext>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
