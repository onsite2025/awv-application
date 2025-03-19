'use client';

import React from 'react';

// Test function for syntax checking
export const handleQuestionTypeChange = (sectionIndex: number, questionIndex: number, newType: string) => {
  const question = { type: '', options: [] };
  
  // Clear existing options and configs
  question.options = [];
  question.type = newType;
  
  return question;
}; 