'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';

const team = [
  {
    name: 'May Rakgama',
    role: 'CEO & Co-Founder',
    bio: 'Agricultural technology expert with passion for African farming innovation',
    image: '/images/team/may.jpg',
  },
  {
    name: 'Caiphus Olifant',
    role: 'CTO & Co-Founder',
    bio: 'Large-scale livestock specialist with expertise in modern farming systems',
    image: '/images/team/caiphus.jpg',
  },
];

const values = [
  {
    title: 'African-First',
    description: 'Built specifically for African farming conditions and practices',
  },
  {
    title: 'Accessibility',
    description: 'Making advanced technology accessible to farmers of all scales',
  },
  {
    title: 'Sustainability',
    description: 'Promoting sustainable farming practices for future generations',
  },
  {
    title: 'Innovation',
    description: 'Continuously improving through cutting-edge technology',
  },
];

export default function AboutTab() {
  const { translate } = useLanguageStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {translate('about.title', 'About AgriIntel')}
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          {translate('about.subtitle', 'We\'re on a mission to empower African farmers with technology that transforms livestock management.')}
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30 mb-12 bg-gradient-to-br from-white/95 to-white/85"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Our Mission</h2>
        <p className="text-lg text-slate-700 leading-relaxed text-center max-w-4xl mx-auto">
          To democratize access to advanced livestock management technology across Africa,
          enabling farmers to increase productivity, improve animal welfare, and build
          sustainable agricultural businesses that contribute to food security and economic growth.
        </p>
      </motion.div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30 text-center bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
              <p className="text-slate-600">{value.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <div
              key={member.name}
              className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30 text-center bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 transition-all duration-300 hover:scale-105"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
              <p className="text-primary-600 font-medium mb-3">{member.role}</p>
              <p className="text-slate-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 bg-gradient-to-br from-white/25 to-white/15"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">3</div>
            <div className="text-white/80">Active Farms</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">4,826</div>
            <div className="text-white/80">Animals Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">11</div>
            <div className="text-white/80">SA Languages</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">25+</div>
            <div className="text-white/80">African Languages</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}