'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  mrn: string; // Medical Record Number
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
}

interface PatientFormProps {
  initialData?: Patient;
  isEditing?: boolean;
}

const emptyPatient: Patient = {
  id: '',
  name: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  mrn: '',
  insuranceProvider: '',
  insuranceNumber: '',
  allergies: [],
  medications: [],
  notes: ''
};

export default function PatientForm({ initialData, isEditing = false }: PatientFormProps) {
  const router = useRouter();
  
  // State
  const [patient, setPatient] = useState<Patient>(initialData || emptyPatient);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  
  // Generate a new MRN if creating a new patient
  useEffect(() => {
    if (!isEditing && !initialData?.mrn) {
      setPatient(prev => ({
        ...prev,
        id: `patient_${Date.now()}`,
        mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`
      }));
    }
  }, [isEditing, initialData]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Add a new allergy
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    
    setPatient(prev => ({
      ...prev,
      allergies: [...(prev.allergies || []), newAllergy.trim()]
    }));
    setNewAllergy('');
  };

  // Remove an allergy
  const handleRemoveAllergy = (index: number) => {
    setPatient(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index)
    }));
  };

  // Add a new medication
  const handleAddMedication = () => {
    if (!newMedication.trim()) return;
    
    setPatient(prev => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication.trim()]
    }));
    setNewMedication('');
  };

  // Remove a medication
  const handleRemoveMedication = (index: number) => {
    setPatient(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!patient.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!patient.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!patient.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    // Email is optional but validate format if provided
    if (patient.email.trim() && !/^\S+@\S+\.\S+$/.test(patient.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!patient.name) newErrors.name = 'Name is required';
    if (!patient.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!patient.gender) newErrors.gender = 'Gender is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the form
    setIsSubmitting(true);
    setShowSuccessMessage(false);
    
    try {
      // Get the current user's token from Firebase if available
      let authHeader = {};
      const { auth } = await import('../lib/firebase');
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const token = await currentUser.getIdToken();
        authHeader = {
          'Authorization': `Bearer ${token}`
        };
      }
      
      // Submit to API
      const response = isEditing
        ? await fetch(`/api/patients/${patient.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            },
            body: JSON.stringify(patient),
          })
        : await fetch('/api/patients', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            },
            body: JSON.stringify(patient),
          });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const savedPatient = await response.json();
      console.log('Patient saved successfully:', savedPatient);
      
      setShowSuccessMessage(true);
      
      // Redirect after a short delay if creating a new patient
      if (!isEditing) {
        setTimeout(() => {
          router.push('/patients');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setErrors({
        form: 'An error occurred while saving the patient. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEditing ? 'Edit Patient' : 'Add New Patient'}
        </h1>
      </div>
      
      {/* Success message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {isEditing ? 'Patient updated successfully!' : 'Patient added successfully!'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form error message */}
      {errors.form && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Basic details about the patient.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={patient.name}
                    onChange={handleChange}
                    aria-invalid={!!errors.name}
                    className={`block w-full rounded-md sm:text-sm ${
                      errors.name
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="mrn" className="block text-sm font-medium text-gray-700">
                  Medical Record Number (MRN)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="mrn"
                    id="mrn"
                    value={patient.mrn}
                    onChange={handleChange}
                    disabled={true} // MRN is auto-generated or cannot be changed
                    className="block w-full rounded-md border-gray-300 bg-gray-100 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={patient.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]} // Prevents future dates
                    aria-invalid={!!errors.dateOfBirth}
                    className={`block w-full rounded-md sm:text-sm ${
                      errors.dateOfBirth
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-2 text-sm text-red-600" id="dateOfBirth-error">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    value={patient.gender}
                    onChange={handleChange}
                    aria-invalid={!!errors.gender}
                    className={`block w-full rounded-md sm:text-sm ${
                      errors.gender
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600" id="gender-error">
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              How to reach the patient.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={patient.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    className={`block w-full rounded-md sm:text-sm ${
                      errors.email
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={patient.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    className={`block w-full rounded-md sm:text-sm ${
                      errors.phone
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600" id="phone-error">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={patient.address}
                    onChange={handleChange}
                    aria-invalid={!!errors.address}
                    className={`block w-full rounded-md sm:text-sm ${
                      errors.address
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600" id="address-error">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Insurance Information Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Insurance Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Patient's insurance details.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700">
                  Insurance Provider
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="insuranceProvider"
                    id="insuranceProvider"
                    value={patient.insuranceProvider || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700">
                  Policy Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="insuranceNumber"
                    id="insuranceNumber"
                    value={patient.insuranceNumber || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Medical Information Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Medical Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Allergies, medications, and other medical details.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <div className="mt-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Add an allergy"
                      className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddAllergy}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {patient.allergies.map((allergy, index) => (
                        <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                          <span className="flex-1 text-sm">{allergy}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllergy(index)}
                            className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No allergies added.</p>
                  )}
                </div>
              </div>
              
              {/* Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Medications</label>
                <div className="mt-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add a medication"
                      className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {patient.medications && patient.medications.length > 0 ? (
                    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {patient.medications.map((medication, index) => (
                        <li key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                          <span className="flex-1 text-sm">{medication}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(index)}
                            className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No medications added.</p>
                  )}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={patient.notes || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Any additional notes about the patient"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Patient' : 'Add Patient'}
          </button>
        </div>
      </form>
    </div>
  );
} 