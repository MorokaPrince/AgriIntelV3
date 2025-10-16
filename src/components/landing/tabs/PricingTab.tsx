'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguageStore } from '@/stores/language-store';
import Link from 'next/link';

const plans = [
  {
    name: 'BETA',
    price: 'Free',
    period: 'Forever',
    description: 'Perfect for small farms getting started',
    features: [
      { name: 'Up to 50 animals', included: true },
      { name: '5 basic modules', included: true },
      { name: 'Animal Management', included: true },
      { name: 'Health Tracking', included: true },
      { name: 'Feed Management', included: true },
      { name: 'Financial Management', included: true },
      { name: 'General Information', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Multi-user access', included: false },
      { name: 'API access', included: false },
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: 'R299',
    period: 'per month',
    description: 'For growing farms and commercial operations',
    features: [
      { name: 'Up to 500 animals', included: true },
      { name: 'Advanced health tracking', included: true },
      { name: 'Financial management', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Multi-user access', included: true },
      { name: 'API access', included: false },
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'Contact us',
    description: 'For large operations and cooperatives',
    features: [
      { name: 'Unlimited animals', included: true },
      { name: 'Full feature access', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Multi-user access', included: true },
      { name: 'API access', included: true },
    ],
    popular: false,
  },
];

export default function PricingTab() {
  const { translate } = useLanguageStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {translate('pricing.title', 'Simple, Transparent Pricing')}
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          {translate('pricing.subtitle', 'Choose the plan that fits your farm size and needs. All plans include our core features with no hidden fees.')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border-2 relative bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300 hover:scale-105 ${
              plan.popular ? 'border-primary-500 ring-2 ring-primary-200' : 'border-white/30'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                {plan.period !== 'Contact us' && (
                  <span className="text-slate-600 ml-2">/{plan.period}</span>
                )}
              </div>
              <p className="text-slate-600">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center space-x-3">
                  {feature.included ? (
                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-slate-300 flex-shrink-0" />
                  )}
                  <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.name === 'Enterprise' ? '#contact' : '/dashboard'}
              className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
              onClick={plan.name === 'Enterprise' ? (e) => {
                e.preventDefault();
                const event = new CustomEvent('switchToContactTab');
                window.dispatchEvent(event);
              } : undefined}
            >
              {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 text-center bg-gradient-to-br from-white/25 to-white/15"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {translate('pricing.guarantee.title', '30-Day Money-Back Guarantee')}
        </h2>
        <p className="text-white/90 max-w-2xl mx-auto">
          {translate('pricing.guarantee.description', 'Try AgriIntel risk-free for 30 days. If you\'re not completely satisfied, we\'ll refund your money, no questions asked.')}
        </p>
      </motion.div>
    </div>
  );
}