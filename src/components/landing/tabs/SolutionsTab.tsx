'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import {
  HomeIcon,
  TruckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

const solutions = [
  {
    icon: HomeIcon,
    title: 'Small-Scale Farms',
    description: 'Perfect for family farms and small operations',
    target: '1-50 animals',
    features: [
      'Basic animal tracking',
      'Health record management',
      'Simple financial tracking',
      'Mobile app access',
      'Basic reporting',
    ],
    price: 'Free BETA',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: TruckIcon,
    title: 'Commercial Operations',
    description: 'Designed for medium to large commercial farms',
    target: '50-500 animals',
    features: [
      'Advanced RFID integration',
      'Multi-user collaboration',
      'Advanced analytics',
      'Weather integration',
      'Financial management',
      'Priority support',
    ],
    price: 'R299/month',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Enterprise Solutions',
    description: 'Comprehensive solution for large operations and cooperatives',
    target: '500+ animals',
    features: [
      'Unlimited animals',
      'Custom integrations',
      'Advanced AI insights',
      'Dedicated support',
      'Custom reporting',
      'API access',
      'Multi-farm management',
    ],
    price: 'Custom pricing',
    color: 'from-purple-500 to-purple-600',
  },
];

const industrySolutions = [
  {
    industry: 'Cattle Farming',
    icon: '🐄',
    challenges: ['Disease management', 'Breeding optimization', 'Feed efficiency'],
    solution: 'Comprehensive cattle health tracking with breeding cycle management and feed optimization recommendations.',
  },
  {
    industry: 'Sheep & Goat Farming',
    icon: '🐑',
    challenges: ['Parasite control', 'Wool quality', 'Herd management'],
    solution: 'Specialized parasite tracking, wool quality monitoring, and efficient herd management tools.',
  },
  {
    industry: 'Poultry Farming',
    icon: '🐔',
    challenges: ['Disease outbreaks', 'Egg production', 'Growth monitoring'],
    solution: 'Real-time disease monitoring, egg production analytics, and automated growth tracking systems.',
  },
  {
    industry: 'Pig Farming',
    icon: '🐖',
    challenges: ['Growth optimization', 'Health monitoring', 'Space management'],
    solution: 'Advanced growth analytics, comprehensive health monitoring, and intelligent space utilization.',
  },
];

const integrations = [
  {
    name: 'RFID Systems',
    description: 'Connect with major RFID hardware providers',
    icon: '📡',
  },
  {
    name: 'Mobile Money',
    description: 'Integration with M-Pesa, EcoCash, and other mobile payment systems',
    icon: '📱',
  },
  {
    name: 'Weather Services',
    description: 'Real-time weather data from multiple providers',
    icon: '🌦️',
  },
  {
    name: 'Veterinary Software',
    description: 'Connect with veterinary practice management systems',
    icon: '🏥',
  },
  {
    name: 'Accounting Software',
    description: 'Sync with QuickBooks, Xero, and other accounting platforms',
    icon: '📊',
  },
  {
    name: 'IoT Sensors',
    description: 'Connect with smart sensors and monitoring devices',
    icon: '🔗',
  },
];

export default function SolutionsTab() {
  const { translate } = useLanguageStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {translate('solutions.title', 'Solutions for Every Farm')}
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          {translate('solutions.subtitle', 'From small family farms to large commercial operations, we have the perfect solution for your livestock management needs.')}
        </p>
      </motion.div>

      {/* Farm Size Solutions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">Choose Your Farm Size</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white/30 text-center bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300 hover:scale-105"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-xl mx-auto mb-6 flex items-center justify-center`}>
                <solution.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{solution.title}</h3>
              <p className="text-slate-600 mb-4">{solution.description}</p>
              <p className="text-sm text-slate-500 mb-6">Target: {solution.target}</p>

              <div className="mb-6">
                <div className="text-3xl font-bold text-slate-900 mb-1">{solution.price}</div>
                <div className="text-sm text-slate-500">per month</div>
              </div>

              <ul className="space-y-3 mb-8 text-left">
                {solution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors bg-gradient-to-r ${solution.color} text-white hover:opacity-90`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Industry-Specific Solutions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">Industry-Specific Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industrySolutions.map((industry, index) => (
            <motion.div
              key={industry.industry}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30 bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{industry.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{industry.industry}</h3>
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-700 mb-2">Key Challenges:</h4>
                    <ul className="space-y-1">
                      {industry.challenges.map((challenge, challengeIndex) => (
                        <li key={challengeIndex} className="text-sm text-slate-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Our Solution:</h4>
                    <p className="text-sm text-slate-600">{industry.solution}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">Seamless Integrations</h2>
        <p className="text-xl text-white/90 text-center mb-12 max-w-3xl mx-auto">
          AgriIntel integrates with the tools and services you already use, making adoption smooth and easy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30 text-center bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{integration.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{integration.name}</h3>
              <p className="text-sm text-slate-600">{integration.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Custom Solutions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 text-center bg-gradient-to-br from-white/25 to-white/15"
      >
        <h2 className="text-3xl font-bold text-white mb-4">Need a Custom Solution?</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          We understand that every farm is unique. Our team can create custom solutions tailored to your specific needs and requirements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-xl hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Contact Our Team
          </button>
          <button className="px-8 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
            Schedule Demo
          </button>
        </div>
      </motion.div>
    </div>
  );
}