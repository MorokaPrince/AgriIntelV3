'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Animal } from '@/stores/animal-store';

interface AnimalFormData {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  rfidTag: string;
  weight: string;
  status: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    farmSection: string;
  };
  purchaseInfo: {
    purchasePrice: string;
    purchaseDate: string;
    supplier: string;
  };
  health: {
    overallCondition: string;
    vaccinations: string[];
    lastCheckup: string;
  };
  color: string;
  height: number;
  breeding: {
    isBreedingStock: boolean;
    fertilityStatus: string;
  };
  nutrition: {
    dailyFeedIntake: number;
    feedType: string;
    supplements: string[];
    feedingSchedule: string;
  };
  productivity: {
    weightGain: number;
    lastMeasurement: string;
  };
}

interface AnimalFormProps {
  animal?: Animal;
  onSubmit: (data: AnimalFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const speciesOptions = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'goats', label: 'Goats' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'pigs', label: 'Pigs' },
  { value: 'other', label: 'Other' }
];

const breedOptions = {
  cattle: ['Angus', 'Hereford', 'Charolais', 'Limousin', 'Simmental', 'Holstein', 'Jersey', 'Other'],
  sheep: ['Merino', 'Dorset', 'Suffolk', 'Hampshire', 'Lincoln', 'Other'],
  goats: ['Boer', 'Nubian', 'Alpine', 'LaMancha', 'Saanen', 'Other'],
  poultry: ['Broiler', 'Layer', 'Dual Purpose', 'Other'],
  pigs: ['Large White', 'Landrace', 'Duroc', 'Hampshire', 'Other'],
  other: ['Other']
};

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'deceased', label: 'Deceased' },
  { value: 'quarantined', label: 'Quarantined' },
  { value: 'breeding', label: 'Breeding' }
];

const healthOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'critical', label: 'Critical' }
];

export default function AnimalForm({ animal, onSubmit, onCancel, isLoading = false }: AnimalFormProps) {
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    species: 'cattle',
    breed: '',
    dateOfBirth: '',
    gender: 'female',
    rfidTag: '',
    weight: '',
    status: 'active',
    location: {
      address: '',
      latitude: -26.2041, // Default to Johannesburg coordinates
      longitude: 28.0473,
      farmSection: 'Main Pasture'
    },
    purchaseInfo: {
      purchasePrice: '',
      purchaseDate: '',
      supplier: ''
    },
    health: {
      overallCondition: 'good',
      vaccinations: [],
      lastCheckup: new Date().toISOString().split('T')[0]
    },
    color: 'Brown',
    height: 1.5,
    breeding: {
      isBreedingStock: false,
      fertilityStatus: 'fertile'
    },
    nutrition: {
      dailyFeedIntake: 10,
      feedType: 'Grass',
      supplements: [],
      feedingSchedule: 'Twice daily'
    },
    productivity: {
      weightGain: 0.5,
      lastMeasurement: new Date().toISOString().split('T')[0]
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (animal) {
      setFormData({
        name: animal.name || '',
        species: animal.species || 'cattle',
        breed: animal.breed || '',
        dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth).toISOString().split('T')[0] : '',
        gender: animal.gender || 'female',
        rfidTag: animal.rfidTag || '',
        weight: animal.weight?.toString() || '',
        status: animal.status || 'active',
        location: {
          address: animal.location?.address || '',
          latitude: animal.location?.latitude || -26.2041,
          longitude: animal.location?.longitude || 28.0473,
          farmSection: animal.location?.farmSection || 'Main Pasture'
        },
        purchaseInfo: {
          purchasePrice: animal.purchaseInfo?.purchasePrice?.toString() || '',
          purchaseDate: animal.purchaseInfo?.purchaseDate ? new Date(animal.purchaseInfo.purchaseDate).toISOString().split('T')[0] : '',
          supplier: animal.purchaseInfo?.supplier || ''
        },
        health: {
          overallCondition: animal.health?.overallCondition || 'good',
          vaccinations: animal.health?.vaccinations?.map(v => v.vaccine) || [],
          lastCheckup: animal.health?.lastCheckup ? new Date(animal.health.lastCheckup).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        },
        color: animal.color || 'Brown',
        height: animal.height || 1.5,
        breeding: {
          isBreedingStock: animal.breeding?.isBreedingStock || false,
          fertilityStatus: animal.breeding?.fertilityStatus || 'fertile'
        },
        nutrition: {
          dailyFeedIntake: animal.nutrition?.dailyFeedIntake || 10,
          feedType: animal.nutrition?.feedType || 'Grass',
          supplements: animal.nutrition?.supplements || [],
          feedingSchedule: animal.nutrition?.feedingSchedule || 'Twice daily'
        },
        productivity: {
          weightGain: animal.productivity?.weightGain || 0.5,
          lastMeasurement: animal.productivity?.lastMeasurement ? new Date(animal.productivity.lastMeasurement).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }
      });
    }
  }, [animal]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.species) newErrors.species = 'Species is required';
        if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
        if (!formData.rfidTag.trim()) newErrors.rfidTag = 'RFID tag is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      case 2:
        if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
        if (!formData.location.address.trim()) newErrors.location = 'Location address is required';
        break;
      case 3:
        if (formData.purchaseInfo.purchasePrice && parseFloat(formData.purchaseInfo.purchasePrice) < 0) {
          newErrors.purchasePrice = 'Purchase price cannot be negative';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof AnimalFormData] as Record<string, unknown>,
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const availableBreeds = breedOptions[formData.species as keyof typeof breedOptions] || ['Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: step * 0.1 }}
            >
              {step}
            </motion.div>
            {step < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.name ? 'border-red-500' : 'border-wheat/30'
                }`}
                placeholder="Enter animal name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFID Tag *
              </label>
              <input
                type="text"
                value={formData.rfidTag}
                onChange={(e) => updateFormData('rfidTag', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.rfidTag ? 'border-red-500' : 'border-wheat/30'
                }`}
                placeholder="Enter RFID tag"
              />
              {errors.rfidTag && <p className="text-red-500 text-xs mt-1">{errors.rfidTag}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species *
              </label>
              <select
                value={formData.species}
                onChange={(e) => {
                  updateFormData('species', e.target.value);
                  updateFormData('breed', ''); // Reset breed when species changes
                }}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select the species of the animal"
              >
                {speciesOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed *
              </label>
              <select
                value={formData.breed}
                onChange={(e) => updateFormData('breed', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.breed ? 'border-red-500' : 'border-wheat/30'
                }`}
                title="Select the breed of the animal"
              >
                <option value="">Select breed</option>
                {availableBreeds.map(breed => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
              {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-wheat/30'
                }`}
                title="Select the date of birth of the animal"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => updateFormData('gender', e.target.value)}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select the gender of the animal"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Physical & Location Information */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Physical & Location Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.weight ? 'border-red-500' : 'border-wheat/30'
                }`}
                placeholder="Enter weight in kg"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateFormData('status', e.target.value)}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select the current status of the animal"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Address *
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => updateFormData('location.address', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.location ? 'border-red-500' : 'border-wheat/30'
                }`}
                placeholder="Enter location address"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Condition
              </label>
              <select
                value={formData.health.overallCondition}
                onChange={(e) => updateFormData('health.overallCondition', e.target.value)}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select the overall health condition of the animal"
              >
                {healthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Health Checkup
              </label>
              <input
                type="date"
                value={formData.health.lastCheckup}
                onChange={(e) => updateFormData('health.lastCheckup', e.target.value)}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select the date of the last health checkup"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Purchase & Additional Information */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Purchase & Additional Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price (R)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.purchaseInfo.purchasePrice}
                onChange={(e) => updateFormData('purchaseInfo.purchasePrice', e.target.value)}
                className={`input-agricultural w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.purchasePrice ? 'border-red-500' : 'border-wheat/30'
                }`}
                placeholder="Enter purchase price"
              />
              {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseInfo.purchaseDate}
                onChange={(e) => updateFormData('purchaseInfo.purchaseDate', e.target.value)}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select the purchase date"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={formData.purchaseInfo.supplier}
                onChange={(e) => updateFormData('purchaseInfo.supplier', e.target.value)}
                className="input-agricultural w-full px-3 py-2 border border-wheat/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter supplier name"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="px-4 py-2 text-wheat/70 hover:text-wheat transition-colors"
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </button>

        <div className="flex space-x-3">
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-agricultural-primary px-6 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="btn-agricultural-primary px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {isLoading ? 'Saving...' : animal ? 'Update Animal' : 'Create Animal'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}