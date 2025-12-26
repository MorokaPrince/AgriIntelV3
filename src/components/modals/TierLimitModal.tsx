'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Zap, ArrowRight } from 'lucide-react';

interface TierLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  currentTier: 'beta' | 'professional' | 'enterprise';
  currentCount: number;
  limit: number;
  message?: string;
}

export const TierLimitModal: React.FC<TierLimitModalProps> = ({
  isOpen,
  onClose,
  module,
  currentTier,
  currentCount,
  limit,
  message,
}) => {
  const tierUpgrades = {
    beta: {
      name: 'Professional',
      price: '$29/month',
      features: ['500 records per module', 'Multi-user access', 'Advanced analytics', 'Priority support'],
    },
    professional: {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited records', 'Custom integrations', 'Dedicated support', 'API access'],
    },
  };

  const upgrade = tierUpgrades[currentTier as keyof typeof tierUpgrades];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-3">
                <Lock className="text-amber-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Limit Reached</h2>
                <p className="text-sm text-gray-600">Upgrade to add more records</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  {message || `You've reached the ${module} limit for your ${currentTier} tier.`}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Usage:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {currentCount}/{limit}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                    style={{ width: `${Math.min((currentCount / limit) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Upgrade info */}
              {upgrade && (
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap className="text-green-600" size={20} />
                    <h3 className="font-semibold text-green-900">Upgrade to {upgrade.name}</h3>
                  </div>
                  <p className="mb-3 text-sm text-green-800">{upgrade.price}</p>
                  <ul className="space-y-2">
                    {upgrade.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 font-medium text-white hover:from-green-600 hover:to-green-700">
                Upgrade Now
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

