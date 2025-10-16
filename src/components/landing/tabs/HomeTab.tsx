'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import {
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  PlayIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'Real-time insights into your livestock performance and farm productivity',
  },
  {
    icon: HeartIcon,
    title: 'Health Monitoring',
    description: 'Comprehensive health tracking with early warning systems',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Financial Management',
    description: 'Track expenses, income, and profitability across all operations',
  },
  {
    icon: CloudIcon,
    title: 'Weather Integration',
    description: 'Weather-based alerts and recommendations for optimal farming',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee',
  },
  {
    icon: GlobeAltIcon,
    title: 'Multi-language Support',
    description: 'Available in 25+ African languages for better accessibility',
  },
];

const stats = [
  { label: 'Active Farms', value: '3', suffix: '+' },
  { label: 'Animals Tracked', value: '4,826', suffix: '' },
  { label: 'Countries', value: '54', suffix: '' },
  { label: 'Languages', value: '25', suffix: '+' },
];

export default function HomeTab() {
  const { translate } = useLanguageStore();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background with Real Cattle Images */}
      <div className="absolute inset-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900" />

        {/* Multiple cattle background images */}
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/images/animals/Cows 1.jpeg"
            alt="Cattle herd"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.warn('Failed to load Cows 1.jpeg, using fallback');
              (e.target as HTMLImageElement).src = '/images/animals/cows 2.avif';
            }}
          />
        </div>
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/animals/cows 2.avif"
            alt="Cattle grazing"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.warn('Failed to load cows 2.avif, using fallback');
              (e.target as HTMLImageElement).src = '/images/animals/cows 3.jpeg';
            }}
          />
        </div>
        <div className="absolute inset-0 opacity-8">
          <Image
            src="/images/animals/cows 3.jpeg"
            alt="Farm cattle"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.warn('Failed to load cows 3.jpeg, using fallback');
              (e.target as HTMLImageElement).src = '/images/animals/cows 4.jpeg';
            }}
          />
        </div>

        {/* Overlay gradients for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 drop-shadow-lg">
              Livestock Empire
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 leading-relaxed drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The most comprehensive livestock management system designed specifically for African farmers.
            <span className="text-yellow-300 font-semibold"> Track, monitor, and optimize </span>
            your farm operations with cutting-edge technology.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/login"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-lg font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform shadow-lg hover:shadow-orange-500/25 border border-orange-400/30"
              >
                <UserIcon className="mr-2 h-5 w-5" />
                Login to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.button
              className="group inline-flex items-center px-8 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayIcon className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats with Real Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative text-center group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}{stat.suffix}
                </motion.div>
                <div className="text-white/80 text-sm md:text-base font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-white drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Everything You Need to Manage Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
              Dream Farm
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/30 text-center overflow-hidden hover:shadow-2xl"
              >
                {/* Card background with subtle cattle image */}
                <div className="absolute inset-0 opacity-5">
                  <Image
                    src={`/images/animals/cows ${((index % 4) + 1)}.jpeg`}
                    alt="Cattle background"
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>

                {/* Icon with enhanced styling */}
                <motion.div
                  className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">{feature.title}</h3>
                <p className="text-slate-600 relative z-10 leading-relaxed">{feature.description}</p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 w-0 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative bg-gradient-to-br from-white/20 via-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-3xl p-12 border border-white/30 text-center overflow-hidden"
        >
          {/* Background cattle image for CTA */}
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/animals/cows 4.jpeg"
              alt="Cattle farm"
              fill
              className="object-cover rounded-3xl"
            />
          </div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10 drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Ready to Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Agricultural Future?
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto relative z-10 drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            Join <span className="text-yellow-300 font-semibold">thousands</span> of African farmers who are already using AgriIntel to optimize their livestock operations.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white text-xl font-bold rounded-2xl hover:from-green-700 hover:via-emerald-700 hover:to-green-700 transition-all duration-300 transform shadow-2xl hover:shadow-green-500/50 border-2 border-green-400/30"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="#contact"
                className="group inline-flex items-center px-10 py-5 border-2 border-white/40 text-white text-xl font-bold rounded-2xl hover:bg-white/10 hover:border-white/60 transition-all duration-300 backdrop-blur-sm"
              >
                Contact Sales
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}