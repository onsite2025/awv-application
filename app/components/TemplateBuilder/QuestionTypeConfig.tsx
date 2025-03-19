import React, { useState } from 'react';
import { TrashIcon, PlusIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { 
  Question, 
  Option,
  Recommendation
} from './TemplateBuilder';
import { v4 as uuidv4 } from 'uuid';

// Define local types that were previously imported from TemplateBuilder
type VitalSignType = 'temperature' | 'bloodPressure' | 'heartRate' | 'respiratoryRate' | 'oxygenSaturation' | 'weight' | 'height';
type ScoringScaleType = 'PHQ9' | 'GAD7' | 'custom';

interface VitalSignField {
  type: VitalSignType;
  unit: string;
  min?: number;
  max?: number;
  required: boolean;
}

interface ScaleConfig {
  min: number;
  max: number;
  step: number;
  labels: {
    min: string;
    max: string;
  };
}

interface MatrixConfig {
  rows: string[];
  columns: string[];
}

interface VitalSignsConfig {
  fields: VitalSignField[];
}

interface ScoringScaleConfig {
  type: ScoringScaleType;
  questions: string[];
  options: {
    value: number;
    label: string;
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

interface QuestionTypeConfigProps {
  question: Question;
  activeSection: number;
  questionIndex: number;
  setValue: (name: string, value: any) => void;
}

const QuestionTypeConfig: React.FC<QuestionTypeConfigProps> = ({
  question,
  activeSection,
  questionIndex,
  setValue,
}) => {
  // States for recommendation editing
  const [editingOptionRecs, setEditingOptionRecs] = useState<string | null>(null);
  const [addingOptionRec, setAddingOptionRec] = useState<string | null>(null);
  const [newOptionRec, setNewOptionRec] = useState<{text: string, category: string}>({
    text: '',
    category: 'Preventive Care'
  });
  
  // Categories for recommendations
  const RECOMMENDATION_CATEGORIES = [
    'Preventive Care',
    'Lifestyle',
    'Exercise',
    'Nutrition',
    'Follow-up',
    'Medication',
    'Mental Health',
    'Specialist Referral',
    'Screenings',
    'Other'
  ];

  // Multiple Choice Options UI for RADIO, SELECT, etc.
  if (['RADIO', 'SELECT', 'MULTISELECT', 'CHECKBOX'].includes(question.type)) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Options</h4>
        <div className="space-y-3">
          {(question.options || []).map((option, optionIndex) => (
            <div key={option.id} className="flex flex-col space-y-2 p-3 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[optionIndex] = {
                      ...newOptions[optionIndex],
                      text: e.target.value,
                      value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                    };
                    setValue(`sections.${activeSection}.questions.${questionIndex}.options`, newOptions);
                  }}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
                    setValue(`sections.${activeSection}.questions.${questionIndex}.options`, newOptions);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Recommendation toggle button */}
              <button
                type="button"
                onClick={() => {
                  // Toggle showing recommendations UI for this option
                  setEditingOptionRecs(editingOptionRecs === `${activeSection}-${questionIndex}-${optionIndex}` 
                    ? null 
                    : `${activeSection}-${questionIndex}-${optionIndex}`);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 text-left flex items-center"
              >
                {editingOptionRecs === `${activeSection}-${questionIndex}-${optionIndex}` ? 
                  'Hide Recommendations' : 
                  `Recommendations (${option.recommendations?.length || 0})`}
              </button>
              
              {/* Recommendations UI (collapsed by default) */}
              {editingOptionRecs === `${activeSection}-${questionIndex}-${optionIndex}` && (
                <div className="pl-3 border-l-2 border-blue-100 mt-1">
                  <div className="text-xs text-gray-500 mb-1">
                    Plan recommendations to add when this option is selected:
                  </div>
                  
                  {/* List of recommendations */}
                  {option.recommendations && option.recommendations.length > 0 ? (
                    <ul className="space-y-1 mb-2">
                      {option.recommendations.map((rec, recIndex) => (
                        <li key={rec.id} className="flex items-center text-xs bg-blue-50 p-1 rounded">
                          <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded mr-1.5">
                            {rec.category}
                          </span>
                          <span className="flex-1 truncate">{rec.text}</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Remove the recommendation
                              const newOptions = [...(question.options || [])];
                              const newRecs = [...(newOptions[optionIndex].recommendations || [])].filter((_, i) => i !== recIndex);
                              newOptions[optionIndex] = {
                                ...newOptions[optionIndex],
                                recommendations: newRecs
                              };
                              setValue(`sections.${activeSection}.questions.${questionIndex}.options`, newOptions);
                            }}
                            className="ml-2 text-red-500"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-2">No recommendations added yet</p>
                  )}
                  
                  {/* Add recommendation form */}
                  {addingOptionRec === `${activeSection}-${questionIndex}-${optionIndex}` ? (
                    <div className="bg-gray-50 p-1.5 rounded text-xs mb-2">
                      <input
                        type="text"
                        value={newOptionRec.text}
                        onChange={(e) => setNewOptionRec({...newOptionRec, text: e.target.value})}
                        className="w-full p-1 border border-gray-300 rounded-md mb-1"
                        placeholder="Recommendation text..."
                      />
                      <div className="flex">
                        <select
                          value={newOptionRec.category}
                          onChange={(e) => setNewOptionRec({...newOptionRec, category: e.target.value})}
                          className="text-xs flex-1 p-1 border border-gray-300 rounded-md"
                        >
                          {RECOMMENDATION_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="ml-1">
                          <button
                            type="button"
                            onClick={() => setAddingOptionRec(null)}
                            className="px-1.5 py-1 border border-gray-300 rounded text-gray-500 mr-1"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Add the recommendation
                              if (!newOptionRec.text.trim()) return;
                              
                              const newRec = {
                                id: uuidv4(),
                                text: newOptionRec.text.trim(),
                                category: newOptionRec.category
                              };
                              
                              const newOptions = [...(question.options || [])];
                              newOptions[optionIndex] = {
                                ...newOptions[optionIndex],
                                recommendations: [...(newOptions[optionIndex].recommendations || []), newRec]
                              };
                              
                              setValue(`sections.${activeSection}.questions.${questionIndex}.options`, newOptions);
                              setNewOptionRec({text: '', category: RECOMMENDATION_CATEGORIES[0]});
                              setAddingOptionRec(null);
                            }}
                            className="px-1.5 py-1 bg-blue-600 text-white rounded"
                            disabled={!newOptionRec.text.trim()}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingOptionRec(`${activeSection}-${questionIndex}-${optionIndex}`)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <PlusCircleIcon className="h-3 w-3 mr-1" />
                      Add Recommendation
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => {
              // Create a new option with a unique ID
              const newOption = {
                id: uuidv4(),
                text: 'New Option',
                value: `option_${(question.options || []).length + 1}`,
                order: (question.options || []).length,
                recommendations: [] // Initialize empty recommendations array
              };
              
              // Update the form data with the new option
              setValue(
                `sections.${activeSection}.questions.${questionIndex}.options`,
                [...(question.options || []), newOption]
              );
            }}
            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add Option
          </button>
        </div>
      </div>
    );
  }

  // Scale Configuration UI
  if (question.type === 'SCALE' && question.scaleConfig) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Scale Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600">Minimum Value</label>
            <input
              type="number"
              value={question.scaleConfig.min}
              onChange={(e) => {
                const newConfig = {
                  ...question.scaleConfig,
                  min: parseInt(e.target.value),
                };
                setValue(`questions.${questionIndex}.scaleConfig`, newConfig);
              }}
              className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Maximum Value</label>
            <input
              type="number"
              value={question.scaleConfig.max}
              onChange={(e) => {
                const newConfig = {
                  ...question.scaleConfig,
                  max: parseInt(e.target.value),
                };
                setValue(`questions.${questionIndex}.scaleConfig`, newConfig);
              }}
              className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Step Size</label>
            <input
              type="number"
              value={question.scaleConfig.step}
              onChange={(e) => {
                const newConfig = {
                  ...question.scaleConfig,
                  step: parseInt(e.target.value),
                };
                setValue(`questions.${questionIndex}.scaleConfig`, newConfig);
              }}
              className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Labels (Optional)</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input
                type="text"
                placeholder="Min Label"
                value={question.scaleConfig.labels?.min || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...question.scaleConfig,
                    labels: {
                      ...question.scaleConfig.labels,
                      min: e.target.value,
                    },
                  };
                  setValue(`questions.${questionIndex}.scaleConfig`, newConfig);
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Max Label"
                value={question.scaleConfig.labels?.max || ''}
                onChange={(e) => {
                  const newConfig = {
                    ...question.scaleConfig,
                    labels: {
                      ...question.scaleConfig.labels,
                      max: e.target.value,
                    },
                  };
                  setValue(`questions.${questionIndex}.scaleConfig`, newConfig);
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Matrix Configuration UI
  if (question.type === 'MATRIX' && question.matrixConfig) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Matrix Configuration</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600">Rows</label>
            <div className="mt-1 space-y-2">
              {question.matrixConfig.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => {
                      const newRows = [...question.matrixConfig.rows];
                      newRows[rowIndex] = e.target.value;
                      const newConfig = {
                        ...question.matrixConfig,
                        rows: newRows,
                      };
                      setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newRows = question.matrixConfig.rows.filter((_, i) => i !== rowIndex);
                      const newConfig = {
                        ...question.matrixConfig,
                        rows: newRows,
                      };
                      setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newConfig = {
                    ...question.matrixConfig,
                    rows: [...question.matrixConfig.rows, `Row ${question.matrixConfig.rows.length + 1}`],
                  };
                  setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add Row
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Columns</label>
            <div className="mt-1 space-y-2">
              {question.matrixConfig.columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={column}
                    onChange={(e) => {
                      const newColumns = [...question.matrixConfig.columns];
                      newColumns[columnIndex] = e.target.value;
                      const newConfig = {
                        ...question.matrixConfig,
                        columns: newColumns,
                      };
                      setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newColumns = question.matrixConfig.columns.filter((_, i) => i !== columnIndex);
                      const newConfig = {
                        ...question.matrixConfig,
                        columns: newColumns,
                      };
                      setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newConfig = {
                    ...question.matrixConfig,
                    columns: [...question.matrixConfig.columns, `Column ${question.matrixConfig.columns.length + 1}`],
                  };
                  setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add Column
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={question.matrixConfig.allowMultiple}
              onChange={(e) => {
                const newConfig = {
                  ...question.matrixConfig,
                  allowMultiple: e.target.checked,
                };
                setValue(`questions.${questionIndex}.matrixConfig`, newConfig);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Allow multiple selections per row
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Vital Signs Configuration UI
  if ((question.type === 'VITAL_SIGNS' || question.type === 'BMI_CALCULATOR') && question.vitalSignsConfig) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Vital Signs Configuration</h4>
        <div className="space-y-4">
          {question.vitalSignsConfig.fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className="p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium text-gray-700 capitalize">{field.type.replace(/([A-Z])/g, ' $1').trim()}</h5>
                <button
                  type="button"
                  onClick={() => {
                    const newFields = question.vitalSignsConfig.fields.filter((_, i) => i !== fieldIndex);
                    const newConfig = {
                      ...question.vitalSignsConfig,
                      fields: newFields,
                    };
                    setValue(`questions.${questionIndex}.vitalSignsConfig`, newConfig);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600">Unit</label>
                  <input
                    type="text"
                    value={field.unit}
                    onChange={(e) => {
                      const newFields = [...question.vitalSignsConfig.fields];
                      newFields[fieldIndex] = {
                        ...field,
                        unit: e.target.value,
                      };
                      const newConfig = {
                        ...question.vitalSignsConfig,
                        fields: newFields,
                      };
                      setValue(`questions.${questionIndex}.vitalSignsConfig`, newConfig);
                    }}
                    className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Required</label>
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const newFields = [...question.vitalSignsConfig.fields];
                        newFields[fieldIndex] = {
                          ...field,
                          required: e.target.checked,
                        };
                        const newConfig = {
                          ...question.vitalSignsConfig,
                          fields: newFields,
                        };
                        setValue(`questions.${questionIndex}.vitalSignsConfig`, newConfig);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Minimum Value</label>
                  <input
                    type="number"
                    value={field.min || ''}
                    onChange={(e) => {
                      const newFields = [...question.vitalSignsConfig.fields];
                      newFields[fieldIndex] = {
                        ...field,
                        min: e.target.value ? parseFloat(e.target.value) : undefined,
                      };
                      const newConfig = {
                        ...question.vitalSignsConfig,
                        fields: newFields,
                      };
                      setValue(`questions.${questionIndex}.vitalSignsConfig`, newConfig);
                    }}
                    className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Maximum Value</label>
                  <input
                    type="number"
                    value={field.max || ''}
                    onChange={(e) => {
                      const newFields = [...question.vitalSignsConfig.fields];
                      newFields[fieldIndex] = {
                        ...field,
                        max: e.target.value ? parseFloat(e.target.value) : undefined,
                      };
                      const newConfig = {
                        ...question.vitalSignsConfig,
                        fields: newFields,
                      };
                      setValue(`questions.${questionIndex}.vitalSignsConfig`, newConfig);
                    }}
                    className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newField: VitalSignField = {
                type: 'temperature',
                unit: '°F',
                required: true,
              };
              const newConfig = {
                ...question.vitalSignsConfig,
                fields: [...question.vitalSignsConfig.fields, newField],
              };
              setValue(`questions.${questionIndex}.vitalSignsConfig`, newConfig);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Add Vital Sign
          </button>
        </div>
      </div>
    );
  }

  // Scoring Scale (PHQ-9, GAD-7) Configuration UI
  if (question.type === 'SCORING_SCALE' && question.scoringScaleConfig) {
    // Use a simpler UI since we're updating the types
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Scoring Scale Configuration</h4>
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              Scoring Scale Assessment
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {question.scoringScaleConfig.options.length} scoring options
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Return null for question types that don't need special configuration
  return null;
};

export default QuestionTypeConfig; 