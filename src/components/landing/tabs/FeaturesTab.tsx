'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import {
  QrCodeIcon,
  HeartIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ChartBarIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: QrCodeIcon,
    title: 'RFID Integration',
    description: 'Advanced RFID tracking system for real-time animal identification and monitoring',
    details: ['Real-time location tracking', 'Individual animal identification', 'Automated data collection'],
    category: 'tracking',
  },
  {
    icon: HeartIcon,
    title: 'Health Management',
    description: 'Comprehensive veterinary care tracking with African disease pattern recognition',
    details: ['Disease pattern analysis', 'Vaccination scheduling', 'Treatment history tracking'],
    category: 'health',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Financial Analytics',
    description: 'Multi-currency support with mobile money integration for African markets',
    details: ['Revenue tracking', 'Expense management', 'Profitability analysis'],
    category: 'financial',
  },
  {
    icon: CloudIcon,
    title: 'Weather Intelligence',
    description: 'Weather-based farming recommendations and early warning systems',
    details: ['Localized forecasts', 'Weather impact alerts', 'Farming recommendations'],
    category: 'weather',
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'AI-powered insights and predictive analytics for optimal decision making',
    details: ['Performance metrics', 'Trend analysis', 'Predictive insights'],
    category: 'analytics',
  },
  {
    icon: BellIcon,
    title: 'Smart Notifications',
    description: 'Real-time alerts for health issues, weather changes, and important events',
    details: ['Health alerts', 'Weather warnings', 'Maintenance reminders'],
    category: 'notifications',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security with regulatory compliance for African markets',
    details: ['Data encryption', 'Access control', 'Audit trails'],
    category: 'security',
  },
  {
    icon: GlobeAltIcon,
    title: 'Multi-language Support',
    description: 'Native support for 25+ African languages with localized interfaces',
    details: ['25+ languages', 'Cultural adaptation', 'Local terminology'],
    category: 'localization',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile-First Design',
    description: 'Optimized for mobile devices with offline capabilities for rural areas',
    details: ['Offline functionality', 'Mobile optimization', 'Progressive Web App'],
    category: 'mobile',
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Insights',
    description: 'Machine learning algorithms for predictive health and productivity analysis',
    details: ['Predictive analytics', 'Pattern recognition', 'Automated recommendations'],
    category: 'ai',
  },
  {
    icon: UserGroupIcon,
    title: 'Multi-user Collaboration',
    description: 'Team collaboration tools with role-based access control',
    details: ['Team management', 'Role-based permissions', 'Collaborative features'],
    category: 'collaboration',
  },
  {
    icon: DocumentTextIcon,
    title: 'Comprehensive Reporting',
    description: 'Professional reports and export capabilities for business analysis',
    details: ['PDF/Excel exports', 'Custom reports', 'Business intelligence'],
    category: 'reporting',
  },
];

const categories = [
  { id: 'all', name: 'All Features', count: features.length },
  { id: 'tracking', name: 'Animal Tracking', count: features.filter(f => f.category === 'tracking').length },
  { id: 'health', name: 'Health Management', count: features.filter(f => f.category === 'health').length },
  { id: 'financial', name: 'Financial', count: features.filter(f => f.category === 'financial').length },
  { id: 'weather', name: 'Weather', count: features.filter(f => f.category === 'weather').length },
  { id: 'analytics', name: 'Analytics', count: features.filter(f => f.category === 'analytics').length },
  { id: 'security', name: 'Security', count: features.filter(f => f.category === 'security').length },
];

export default function FeaturesTab() {
  const { translate } = useLanguageStore();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [hoveredFeature, setHoveredFeature] = React.useState<string | null>(null);

  const filteredFeatures = selectedCategory === 'all'
    ? features
    : features.filter(feature => feature.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {translate('features.title', 'Powerful Features')}
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          {translate('features.subtitle', 'Discover the comprehensive suite of tools designed to revolutionize your livestock management.')}
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filteredFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            onMouseEnter={() => setHoveredFeature(feature.title)}
            onMouseLeave={() => setHoveredFeature(null)}
            className={`bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30 text-center bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300 hover:scale-105 cursor-pointer ${
              hoveredFeature === feature.title ? 'ring-2 ring-primary-300' : ''
            }`}
          >
            <div className="w-16 h-16 bg-primary-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <feature.icon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 mb-4">{feature.description}</p>

            {/* Feature Details */}
            <div className="space-y-2">
              {feature.details.map((detail, detailIndex) => (
                <div key={detailIndex} className="flex items-center text-sm text-slate-500">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></div>
                  {detail}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 bg-gradient-to-br from-white/25 to-white/15">
          <h2 className="text-3xl font-bold text-white mb-6">Why Choose AgriIntel?</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">African-Market Focused</h3>
                <p className="text-white/80">Built specifically for African farming conditions, regulations, and practices</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Mobile-First Design</h3>
                <p className="text-white/80">Optimized for mobile devices with offline capabilities for rural connectivity</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
                <p className="text-white/80">Advanced machine learning for predictive analytics and smart recommendations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 bg-gradient-to-br from-white/25 to-white/15">
          <h2 className="text-3xl font-bold text-white mb-6">Technical Excellence</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">99.9% Uptime</h3>
                <p className="text-white/80">Reliable cloud infrastructure with enterprise-grade availability</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Bank-Level Security</h3>
                <p className="text-white/80">Advanced encryption and security measures to protect your data</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Scalable Architecture</h3>
                <p className="text-white/80">Built to grow with your farm from small-scale to enterprise level</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}