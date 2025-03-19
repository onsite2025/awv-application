'use client';

import React from 'react';

// Define the types locally 
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

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  isRequired: boolean;
  options: any[];
  defaultRecommendations: any[];
  skipLogic?: any[];
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

function getDefaultScaleConfig() {
  return {
    min: 0,
    max: 10,
    step: 1,
    labels: {
      min: 'Not at all',
      max: 'Very much',
    },
  };
}

function getDefaultMatrixConfig() {
  return {
    rows: ['Row 1', 'Row 2'],
    columns: ['Column 1', 'Column 2'],
    allowMultiple: false,
  };
}

function getDefaultVitalSignsConfig(): VitalSignsConfig {
  return {
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
      }
    ],
  };
}

function getDefaultScoringScaleConfig(): ScoringScaleConfig {
  return {
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
      ],
    },
  };
}

// Test function for checking syntax
export const handleQuestionTypeChange = (sectionIndex: number, questionIndex: number, newType: string) => {
  const question: Question = {
    id: '',
    text: '',
    type: '',
    order: 0,
    isRequired: false,
    options: [],
    defaultRecommendations: []
  };
  
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
          id: '1',
          text: 'Option 1',
          value: 'option_1',
          order: 0,
          recommendations: [],
        },
        {
          id: '2',
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
  return question;
}; 