import React, { useState, ChangeEvent } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Define recommendation interface
interface Recommendation {
  id: string;
  text: string;
  category: string;
}

// Updated Question interface with recommendation support
interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'number' | 'yes_no';
  options?: { text: string; recommendations: Recommendation[] }[];
  required?: boolean;
  placeholder?: string;
  defaultRecommendations?: Recommendation[]; // Recommendations for all responses
}

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

interface QuestionEditorProps {
  question: Question;
  onQuestionChange: (question: Question) => void;
  onDelete: () => void;
}

export default function QuestionEditor({ 
  question, 
  onQuestionChange, 
  onDelete 
}: QuestionEditorProps) {
  const [newOption, setNewOption] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(RECOMMENDATION_CATEGORIES[0]);
  const [addingRecommendationFor, setAddingRecommendationFor] = useState<number | 'default' | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onQuestionChange({
      ...question,
      text: e.target.value
    });
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as Question['type'];
    onQuestionChange({
      ...question,
      type: newType,
      // Clear options if changing from multiple choice
      options: newType === 'multiple_choice' ? question.options : undefined
    });
  };

  const handleRequiredChange = (e: ChangeEvent<HTMLInputElement>) => {
    onQuestionChange({
      ...question,
      required: e.target.checked
    });
  };

  const handlePlaceholderChange = (e: ChangeEvent<HTMLInputElement>) => {
    onQuestionChange({
      ...question,
      placeholder: e.target.value
    });
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    onQuestionChange({
      ...question,
      options: [...(question.options || []), { 
        text: newOption.trim(),
        recommendations: [] 
      }]
    });
    
    setNewOption('');
  };

  const handleRemoveOption = (indexToRemove: number) => {
    onQuestionChange({
      ...question,
      options: (question.options || []).filter((_, index) => index !== indexToRemove)
    });
  };

  // Add recommendation to an option or as default
  const handleAddRecommendation = () => {
    if (!newRecommendation.trim()) return;
    
    const newRec = {
      id: Date.now().toString(),
      text: newRecommendation.trim(),
      category: selectedCategory
    };
    
    if (addingRecommendationFor === 'default') {
      // Add as default recommendation (applies when no specific option matches)
      onQuestionChange({
        ...question,
        defaultRecommendations: [...(question.defaultRecommendations || []), newRec]
      });
    } else if (typeof addingRecommendationFor === 'number') {
      // Add to specific option
      const updatedOptions = [...(question.options || [])];
      updatedOptions[addingRecommendationFor] = {
        ...updatedOptions[addingRecommendationFor],
        recommendations: [...updatedOptions[addingRecommendationFor].recommendations, newRec]
      };
      
      onQuestionChange({
        ...question,
        options: updatedOptions
      });
    }
    
    // Reset form
    setNewRecommendation('');
    setSelectedCategory(RECOMMENDATION_CATEGORIES[0]);
    setAddingRecommendationFor(null);
  };

  // Remove a recommendation
  const handleRemoveRecommendation = (id: string, optionIndex?: number) => {
    if (optionIndex !== undefined) {
      // Remove from an option
      const updatedOptions = [...(question.options || [])];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        recommendations: updatedOptions[optionIndex].recommendations.filter(rec => rec.id !== id)
      };
      
      onQuestionChange({
        ...question,
        options: updatedOptions
      });
    } else {
      // Remove from default recommendations
      onQuestionChange({
        ...question,
        defaultRecommendations: (question.defaultRecommendations || []).filter(rec => rec.id !== id)
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm mb-4">
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Question text */}
        <div className="w-full">
          <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <input
            type="text"
            id="questionText"
            value={question.text}
            onChange={handleTextChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your question here..."
          />
        </div>
        
        {/* Question type */}
        <div className="w-full sm:w-1/3">
          <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            id="questionType"
            value={question.type}
            onChange={handleTypeChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="text">Text Answer</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="number">Number</option>
            <option value="yes_no">Yes/No</option>
          </select>
        </div>
        
        {/* Required toggle */}
        <div className="w-full sm:w-1/3 flex items-center">
          <label htmlFor="questionRequired" className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              id="questionRequired"
              checked={question.required || false}
              onChange={handleRequiredChange}
              className="h-4 w-4 text-blue-600 rounded mr-2"
            />
            Required
          </label>
        </div>
      </div>
      
      {/* Placeholder text for text & number inputs */}
      {(question.type === 'text' || question.type === 'number') && (
        <div className="mb-4">
          <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder Text (optional)
          </label>
          <input
            type="text"
            id="placeholder"
            value={question.placeholder || ''}
            onChange={handlePlaceholderChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g. Enter your answer here..."
          />
        </div>
      )}
      
      {/* Multiple choice options */}
      {question.type === 'multiple_choice' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options
          </label>
          
          {/* List of existing options */}
          {(question.options || []).length > 0 && (
            <ul className="mb-4">
              {(question.options || []).map((option, index) => (
                <li key={index} className="mb-3 border border-gray-200 rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <span className="flex-1 p-2 bg-gray-50 rounded-md text-sm">{option.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Option-specific recommendations */}
                  <div className="pl-2 mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Recommendations for this option:</div>
                    
                    {option.recommendations.length > 0 ? (
                      <ul className="mb-2 space-y-1">
                        {option.recommendations.map(rec => (
                          <li key={rec.id} className="flex items-center text-xs bg-blue-50 p-1.5 rounded">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded mr-1.5">
                              {rec.category}
                            </span>
                            <span className="flex-1">{rec.text}</span>
                            <button 
                              onClick={() => handleRemoveRecommendation(rec.id, index)}
                              className="ml-1 text-red-500"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-2">No recommendations added</p>
                    )}
                    
                    {addingRecommendationFor === index ? (
                      <div className="bg-gray-50 p-2 rounded-md">
                        <div className="flex mb-1">
                          <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="text-xs p-1 border border-gray-300 rounded-md mr-1 w-1/3"
                          >
                            {RECOMMENDATION_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={newRecommendation}
                            onChange={(e) => setNewRecommendation(e.target.value)}
                            placeholder="Add recommendation text..."
                            className="text-xs flex-1 p-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setAddingRecommendationFor(null)}
                            className="text-xs text-gray-500 mr-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddRecommendation}
                            className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md"
                            disabled={!newRecommendation.trim()}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingRecommendationFor(index)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <PlusIcon className="h-3 w-3 mr-0.5" /> Add recommendation for this option
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {/* Add new option */}
          <div className="flex">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md"
              placeholder="Add a new option..."
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Default recommendations section */}
      <div className="mb-4 border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Default Recommendations
          </label>
          <span className="text-xs text-gray-500">
            These will apply when no specific option matches or for non-multiple choice questions
          </span>
        </div>
        
        {/* List of default recommendations */}
        {(question.defaultRecommendations || []).length > 0 ? (
          <ul className="mb-3 space-y-1">
            {(question.defaultRecommendations || []).map(rec => (
              <li key={rec.id} className="flex items-center text-sm bg-blue-50 p-2 rounded">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded mr-2">
                  {rec.category}
                </span>
                <span className="flex-1">{rec.text}</span>
                <button 
                  onClick={() => handleRemoveRecommendation(rec.id)}
                  className="ml-2 text-red-500"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic mb-3">No default recommendations added</p>
        )}
        
        {/* Add default recommendation */}
        {addingRecommendationFor === 'default' ? (
          <div className="bg-gray-50 p-3 rounded-md mb-3">
            <div className="flex mb-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-md mr-2 w-1/4"
              >
                {RECOMMENDATION_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                value={newRecommendation}
                onChange={(e) => setNewRecommendation(e.target.value)}
                placeholder="Add recommendation text..."
                className="flex-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setAddingRecommendationFor(null)}
                className="text-gray-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecommendation}
                className="bg-blue-600 text-white px-3 py-1 rounded-md"
                disabled={!newRecommendation.trim()}
              >
                Add Recommendation
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingRecommendationFor('default')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Default Recommendation
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        {/* Delete question button */}
        <button
          type="button"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete Question
        </button>
      </div>
    </div>
  );
} 