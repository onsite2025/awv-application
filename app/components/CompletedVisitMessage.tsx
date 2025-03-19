import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface CompletedVisitMessageProps {
  visitId: string;
}

export default function CompletedVisitMessage({ visitId }: CompletedVisitMessageProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircleIcon className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="mt-4 text-xl font-bold text-gray-900">
        Visit Completed Successfully
      </h2>
      
      <p className="mt-2 text-gray-600">
        Thank you for completing this Annual Wellness Visit. Your responses have been saved.
      </p>
      
      <div className="mt-6 space-y-3">
        <p className="text-sm text-gray-500">
          A personalized health plan has been generated based on your responses.
        </p>
        
        <Link
          href={`/visits/${visitId}/plan`}
          className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
          View Your Health Plan
        </Link>
        
        <div className="pt-2">
          <Link
            href="/visits"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Return to All Visits
          </Link>
        </div>
      </div>
    </div>
  );
} 