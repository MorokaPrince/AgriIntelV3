'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useTierLimit, type TierUsage } from '@/hooks/useTierLimit';

interface TierUsageIndicatorProps {
  module: string;
  showDetails?: boolean;
}

export const TierUsageIndicator: React.FC<TierUsageIndicatorProps> = ({
  module,
  showDetails = false,
}) => {
  const { getUsage, loading } = useTierLimit();
  const [usage, setUsage] = useState<TierUsage | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      const data = await getUsage();
      setUsage(data);
    };

    fetchUsage();
  }, [getUsage]);

  if (loading || !usage) {
    return null;
  }

  const moduleUsage = usage.usage[module];
  if (!moduleUsage) {
    return null;
  }

  const { current, limit, percentage } = moduleUsage;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getColorClass = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getTextColorClass = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={getTextColorClass()} />
          <span className="text-sm font-medium text-gray-700">
            {module.charAt(0).toUpperCase() + module.slice(1)} Usage
          </span>
        </div>
        <span className={`text-sm font-bold ${getTextColorClass()}`}>
          {current}/{limit}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {showDetails && (
        <div className="text-xs text-gray-600">
          {percentage}% of your {usage.tier} tier limit
        </div>
      )}

      {isAtLimit && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2">
          <AlertCircle size={14} className="text-red-600" />
          <span className="text-xs text-red-600">
            Limit reached. Upgrade to add more records.
          </span>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2">
          <AlertCircle size={14} className="text-amber-600" />
          <span className="text-xs text-amber-600">
            Approaching limit. Consider upgrading soon.
          </span>
        </div>
      )}
    </div>
  );
};

