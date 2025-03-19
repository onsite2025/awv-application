'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

interface MinimalTemplateProps {
  onSave: (data: any) => void;
}

export default function MinimalBuilder({ onSave }: MinimalTemplateProps) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <div className="flex flex-col space-y-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Template Information</h2>
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