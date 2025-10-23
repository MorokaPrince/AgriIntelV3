import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardCard({ title, value, className = '', children }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

interface InteractiveDataCardProps {
  title: string;
  data: Array<{ label: string; value: number; change?: number }>;
  primaryMetric: {
    label: string;
    value: number;
    format?: 'number' | 'currency' | 'percentage';
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
  expandable?: boolean;
  showSparkline?: boolean;
  className?: string;
}

export function InteractiveDataCard({
  title,
  data,
  primaryMetric,
  color = 'primary',
  expandable = false,
  showSparkline = false,
  className = ''
}: InteractiveDataCardProps) {
  const formatValue = (value: number) => {
    if (primaryMetric.format === 'currency') {
      return `R${value.toLocaleString()}`;
    }
    if (primaryMetric.format === 'percentage') {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{primaryMetric.label}</p>
          <p className={`text-2xl font-bold ${
            color === 'success' ? 'text-green-600' :
            color === 'warning' ? 'text-yellow-600' :
            color === 'danger' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {formatValue(primaryMetric.value)}
          </p>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{item.value}</span>
                {item.change !== undefined && (
                  <span className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change >= 0 ? '↗' : '↘'} {Math.abs(item.change)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function StatusCard({ title, value, status, className = '' }: StatusCardProps) {
  const statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    danger: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[status]}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          status === 'success' ? 'bg-green-500' :
          status === 'warning' ? 'bg-yellow-500' :
          status === 'danger' ? 'bg-red-500' : 'bg-blue-500'
        }`}></div>
        {value}
      </div>
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveGrid({ children, className = '' }: ResponsiveGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
}