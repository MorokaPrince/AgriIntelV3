'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GradientCardProps {
  title: string;
  value: string | number;
  gradient?: 'metallic-blue' | 'emerald' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'agricultural';
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  showAnimation?: boolean;
}

export function GradientCard({
  title,
  value,
  gradient = 'metallic-blue',
  className = '',
  children,
  icon,
  showAnimation = true
}: GradientCardProps) {
  const gradientClasses = {
    'metallic-blue': 'from-blue-600 via-blue-500 to-blue-400',
    emerald: 'from-emerald-500 to-emerald-700',
    blue: 'from-blue-500 to-blue-700',
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    agricultural: 'from-green-600 via-yellow-500 to-orange-400'
  };

  const CardWrapper = showAnimation ? motion.div : 'div';

  return (
    <CardWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`card-agricultural hover-agricultural relative rounded-xl shadow-lg overflow-hidden group ${className}`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9Ii44Ij48cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSIuOCIgZmlsbD0iI0I1QkI1QSIvPjwvc3ZnPg==')]"></div>

      {/* Content */}
      <div className="relative z-10 p-6 text-wheat h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-wheat/90">{title}</p>
            {icon && <div className="text-white/80">{icon}</div>}
          </div>
          <p className="text-3xl font-bold mt-1 text-gold">{value}</p>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-terracotta/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </CardWrapper>
  );
}