'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserPlusIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  DocumentPlusIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface Breadcrumb {
  name: string;
  href: string;
  current: boolean;
}

interface PageNavigationProps {
  title?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function PageNavigation({ title, breadcrumbs }: PageNavigationProps) {
  const pathname = usePathname();
  
  // Determine which buttons to show based on the current path
  const showDashboard = pathname !== '/dashboard';
  const showAddPatient = !pathname.includes('/patients/new');
  const showAddTemplate = !pathname.includes('/templates/new');
  const showScheduleVisit = !pathname.includes('/visits/schedule') && !pathname.includes('/dashboard-visits');
  const showPatients = !pathname.includes('/patients') || pathname.includes('/patients/new');
  const showVisits = (!pathname.includes('/visits') && !pathname.includes('/dashboard-visits')) || 
                    pathname.includes('/visits/schedule');
  const showTemplates = !pathname.includes('/templates') || pathname.includes('/templates/new');
  
  return (
    <div className="mb-8">
      {/* Title and Breadcrumbs */}
      {(title || breadcrumbs) && (
        <div className="mb-4">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          )}
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex mt-1" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.href}>
                    <div className="flex items-center">
                      {index > 0 && (
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                      )}
                      <Link
                        href={breadcrumb.href}
                        className={`ml-2 text-sm font-medium ${
                          breadcrumb.current
                            ? 'text-gray-700'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-current={breadcrumb.current ? 'page' : undefined}
                      >
                        {breadcrumb.name}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-2">
        {showDashboard && (
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <HomeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Dashboard
          </Link>
        )}
        
        {showAddPatient && (
          <Link
            href="/patients/new"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Add Patient
          </Link>
        )}
        
        {showScheduleVisit && (
          <Link
            href="/dashboard-visits?new=true"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <CalendarIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Schedule Visit
          </Link>
        )}
        
        {showPatients && (
          <Link
            href="/patients"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <UserGroupIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Patients
          </Link>
        )}
        
        {showVisits && (
          <Link
            href="/dashboard-visits"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ClipboardDocumentListIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Visits
          </Link>
        )}
        
        {showTemplates && (
          <Link
            href="/templates"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Templates
          </Link>
        )}
      </div>
    </div>
  );
} 