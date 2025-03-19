'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { UserRole } from '@/app/models/User';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackUrl = '/dashboard' 
}: RoleGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user profile to get their role
        const token = await user.getIdToken();
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userProfile = await response.json();
        
        // Check if user's role is in the allowedRoles array
        const hasPermission = allowedRoles.includes(userProfile.role as UserRole);
        setIsAuthorized(hasPermission);
        
        // If not authorized, redirect after a short delay
        if (!hasPermission) {
          setTimeout(() => {
            router.push(fallbackUrl);
          }, 1500);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
        setTimeout(() => {
          router.push(fallbackUrl);
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [user, router, allowedRoles, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white shadow-md rounded-lg">
          <UserGroupIcon className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 