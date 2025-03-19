'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import QuestionTypeConfig from './QuestionTypeConfig';

// Helper function for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

interface TemplateBuilderProps {
  initialTemplate?: Template;
  onSave: (template: Template) => void;
}

// Define basic interfaces
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

// Define interfaces for advanced question types
export interface ScaleConfig {
  min: number;
  max: number;
  step: number;
  labels?: {
    min: string;
    max: string;
  };
}

export interface MatrixConfig {
  rows: string[];
  columns: string[];
  allowMultiple: boolean;
}

export type VitalSignType = 'temperature' | 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'oxygenSaturation' | 'weight' | 'height';

export interface VitalSignField {
  type: VitalSignType;
  unit: string;
  min?: number;
  max?: number;
  required: boolean;
}

export interface VitalSignsConfig {
  fields: VitalSignField[];
}

export type ScoringScaleType = 'PHQ9' | 'GAD7' | 'custom';

export interface ScoringScaleConfig {
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

export interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  isRequired: boolean;
  options: Option[];
  defaultRecommendations: Recommendation[];
  skipLogic?: SkipLogicRule[];
  scaleConfig?: ScaleConfig;
  matrixConfig?: MatrixConfig;
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

export default function TemplateBuilder({ initialTemplate, onSave }: TemplateBuilderProps) {
  const { register, handleSubmit, setValue, watch } = useForm<{
    name: string;
    description: string;
    questions: Question[];
  }>({
    defaultValues: {
      name: initialTemplate?.name || '',
      description: initialTemplate?.description || '',
      questions: initialTemplate?.sections.flatMap(section => section.questions) || [
        {
          id: '1',
          text: 'Sample Question',
          type: 'TEXT',
          order: 0,
          isRequired: false,
          options: [],
          defaultRecommendations: [],
          skipLogic: [],
          scaleConfig: undefined,
          matrixConfig: undefined,
          vitalSignsConfig: undefined,
          scoringScaleConfig: undefined
        } as Question
      ]
    }
  });

  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const questions = watch('questions');

  const handleQuestionTypeChange = (questionIndex: number, newType: string) => {
    const question: Question = {...questions[questionIndex]};
    
    // Clear existing configurations
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
        question.vitalSignsConfig = {
          fields: [
            {
              type: 'temperature',
              unit: '°F',
              required: true,
            }
          ]
        };
        break;
      case 'BMI_CALCULATOR':
        question.vitalSignsConfig = {
          fields: [
            {
              type: 'height',
              unit: 'inches',
              required: true,
            },
            {
              type: 'weight',
              unit: 'lbs',
              required: true,
            }
          ]
        };
        break;
      case 'SCORING_SCALE':
        question.scoringScaleConfig = {
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
            }
          ],
          scoringRules: {
            ranges: [
              { min: 0, max: 4, label: 'Minimal', recommendations: ['No action needed'] },
              { min: 5, max: 9, label: 'Mild', recommendations: ['Consider follow-up'] },
            ]
          }
        };
        break;
      case 'SELECT':
      case 'MULTISELECT':
      case 'CHECKBOX':
      case 'RADIO':
        // For option-based types, add default options
        question.options = [
          {
            id: '1',
            text: 'Option 1',
            value: 'option_1',
            order: 0,
            recommendations: []
          },
          {
            id: '2',
            text: 'Option 2',
            value: 'option_2',
            order: 1,
            recommendations: []
          },
        ];
        break;
    }
    
    // Update the question type
    question.type = newType;
    const newQuestions = [...questions];
    newQuestions[questionIndex] = question;
    setValue('questions', newQuestions);
  };

  const onSubmit = (data: any) => {
    const template: Template = {
      name: data.name,
      description: data.description,
      isActive: true,
      sections: data.sections,
    };
    onSave(template);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: 'TEXT',
      order: questions.length,
      isRequired: false,
      options: [],
      defaultRecommendations: [],
      skipLogic: [],
      scaleConfig: undefined,
      matrixConfig: undefined,
      vitalSignsConfig: undefined,
      scoringScaleConfig: undefined
    };
    
    setValue('questions', [...questions, newQuestion]);
    setActiveQuestion(questions.length);
  };

  return (
    <div className="flex flex-col space-y-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Template Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name*
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Template name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-md overflow-hidden">
                <div 
                  className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => setActiveQuestion(index)}
                >
                  <span className="font-medium">
                    {question.text || `Question ${index + 1}`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {questionTypes.find(t => t.value === question.type)?.label || question.type}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newQuestions = [...questions];
                        newQuestions.splice(index, 1);
                        setValue('questions', newQuestions);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {activeQuestion === index && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text*
                        </label>
                        <input
                          type="text"
                          {...register(`questions.${index}.text`, {
                            required: 'Question text is required'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Type*
                          </label>
                          <select
                            {...register(`questions.${index}.type`)}
                            onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                            {...register(`questions.${index}.isRequired`)}
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
                        activeSection={0}
                        questionIndex={index}
                        setValue={(path, value) => {
                          const newQuestions = [...questions];
                          const fieldPath = path.split('.').slice(2);
                          let target = newQuestions[index];
                          
                          // Navigate through the path to find the target object
                          for (let i = 0; i < fieldPath.length - 1; i++) {
                            if (!target[fieldPath[i]]) {
                              target[fieldPath[i]] = {};
                            }
                            target = target[fieldPath[i]];
                          }
                          
                          // Set the value
                          const lastField = fieldPath[fieldPath.length - 1];
                          if (lastField) {
                            target[lastField] = value;
                          }
                          
                          setValue('questions', newQuestions);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
} 