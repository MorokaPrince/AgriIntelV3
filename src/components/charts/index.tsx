import React from 'react';

interface MetricCardProps {
  data: {
    title: string;
    value: string | number;
    icon?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger';
    change?: {
      type: 'increase' | 'decrease';
      value: number;
      period: string;
    };
    format?: 'number' | 'currency' | 'percentage';
  };
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showTrend?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  data,
  size = 'md',
  animate = false,
  showTrend = false,
  onClick,
  className = ''
}: MetricCardProps) {
  const formatValue = (value: string | number) => {
    if (data.format === 'currency') {
      return `R${Number(value).toLocaleString()}`;
    }
    if (data.format === 'percentage') {
      return `${Number(value)}%`;
    }
    return value.toString();
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{data.title}</p>
          <p className={`text-2xl font-bold ${data.color === 'success' ? 'text-green-600' :
            data.color === 'warning' ? 'text-yellow-600' :
            data.color === 'danger' ? 'text-red-600' : 'text-blue-600'}`}>
            {formatValue(data.value)}
          </p>
          {data.change && showTrend && (
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${data.change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {data.change.type === 'increase' ? '↗' : '↘'} {data.change.value}%
              </span>
              <span className="text-xs text-gray-500">{data.change.period}</span>
            </div>
          )}
        </div>
        {data.icon && (
          <div className={`text-3xl ${data.color === 'success' ? 'text-green-600' :
            data.color === 'warning' ? 'text-yellow-600' :
            data.color === 'danger' ? 'text-red-600' : 'text-blue-600'}`}>
            {data.icon}
          </div>
        )}
      </div>
    </div>
  );
}