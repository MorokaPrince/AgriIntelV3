'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const userProfile = {
  id: '1',
  name: 'John Anderson',
  email: 'john.anderson@farm.com',
  phone: '+27 82 123 4567',
  role: 'Farm Manager',
  avatar: '/api/placeholder/150/150',
  joinDate: '2023-01-15',
  lastLogin: '2024-01-18T10:30:00Z',
  farmName: 'Anderson Family Farm',
  farmSize: '250 hectares',
  location: 'Gauteng, South Africa',
  specialization: 'Mixed Livestock Farming'
};

const notificationSettings = [
  {
    id: 'health_alerts',
    title: 'Health Alerts',
    description: 'Critical health issues and veterinary emergencies',
    enabled: true,
    channels: ['email', 'sms', 'push'],
    frequency: 'immediate'
  },
  {
    id: 'feeding_reminders',
    title: 'Feeding Reminders',
    description: 'Scheduled feeding times and inventory alerts',
    enabled: true,
    channels: ['push', 'email'],
    frequency: '15_minutes_before'
  },
  {
    id: 'breeding_notifications',
    title: 'Breeding Notifications',
    description: 'Breeding cycle updates and fertility alerts',
    enabled: true,
    channels: ['email', 'push'],
    frequency: 'daily_summary'
  },
  {
    id: 'financial_reports',
    title: 'Financial Reports',
    description: 'Weekly financial summaries and budget alerts',
    enabled: false,
    channels: ['email'],
    frequency: 'weekly'
  },
  {
    id: 'weather_alerts',
    title: 'Weather Alerts',
    description: 'Severe weather warnings and farming conditions',
    enabled: true,
    channels: ['push', 'sms'],
    frequency: 'immediate'
  },
  {
    id: 'system_updates',
    title: 'System Updates',
    description: 'Software updates and maintenance notifications',
    enabled: false,
    channels: ['email'],
    frequency: 'weekly'
  }
];

const securitySettings = [
  {
    id: 'two_factor',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    enabled: true,
    type: 'toggle'
  },
  {
    id: 'login_notifications',
    title: 'Login Notifications',
    description: 'Get notified of new login attempts',
    enabled: true,
    type: 'toggle'
  },
  {
    id: 'session_timeout',
    title: 'Session Timeout',
    description: 'Automatically log out after inactivity',
    enabled: true,
    value: '30_minutes',
    type: 'select',
    options: ['15_minutes', '30_minutes', '1_hour', '4_hours']
  },
  {
    id: 'password_expiry',
    title: 'Password Expiry',
    description: 'Require password change every 90 days',
    enabled: false,
    type: 'toggle'
  }
];

const farmSettings = [
  {
    id: 'farm_name',
    title: 'Farm Name',
    description: 'Your farm or agricultural enterprise name',
    value: 'Anderson Family Farm',
    type: 'text'
  },
  {
    id: 'farm_size',
    title: 'Farm Size',
    description: 'Total land area under management',
    value: '250 hectares',
    type: 'text'
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Geographic location for weather and regulations',
    value: 'Gauteng, South Africa',
    type: 'text'
  },
  {
    id: 'specialization',
    title: 'Specialization',
    description: 'Primary farming focus and activities',
    value: 'Mixed Livestock Farming',
    type: 'select',
    options: ['Crop Farming', 'Livestock Farming', 'Mixed Farming', 'Dairy Farming', 'Poultry Farming', 'Other']
  },
  {
    id: 'currency',
    title: 'Currency',
    description: 'Default currency for financial reports',
    value: 'ZAR',
    type: 'select',
    options: ['ZAR', 'USD', 'EUR', 'GBP', 'KES', 'NGN', 'EGP']
  },
  {
    id: 'timezone',
    title: 'Timezone',
    description: 'Local timezone for scheduling and reports',
    value: 'Africa/Johannesburg',
    type: 'select',
    options: ['Africa/Johannesburg', 'Africa/Cairo', 'Africa/Lagos', 'Africa/Nairobi', 'Europe/London', 'UTC']
  }
];

const deviceSettings = [
  {
    id: 'mobile_app',
    name: 'Mobile App',
    type: 'mobile',
    lastActive: '2024-01-18T10:30:00Z',
    status: 'online',
    notifications: true,
    location: 'Farm Office'
  },
  {
    id: 'desktop_web',
    name: 'Desktop Browser',
    type: 'desktop',
    lastActive: '2024-01-18T09:15:00Z',
    status: 'online',
    notifications: true,
    location: 'Farm Office'
  },
  {
    id: 'tablet_field',
    name: 'Field Tablet',
    type: 'tablet',
    lastActive: '2024-01-17T16:45:00Z',
    status: 'offline',
    notifications: false,
    location: 'Field Operations'
  }
];

const dataExportOptions = [
  {
    id: 'animal_data',
    title: 'Animal Records',
    description: 'Complete livestock database export',
    lastExport: '2024-01-15T14:30:00Z',
    size: '2.4 MB',
    format: 'CSV'
  },
  {
    id: 'health_records',
    title: 'Health Records',
    description: 'Veterinary and health tracking data',
    lastExport: '2024-01-10T09:15:00Z',
    size: '1.8 MB',
    format: 'CSV'
  },
  {
    id: 'financial_data',
    title: 'Financial Data',
    description: 'Income, expenses, and financial reports',
    lastExport: '2024-01-12T16:20:00Z',
    size: '956 KB',
    format: 'CSV'
  },
  {
    id: 'feeding_data',
    title: 'Feed & Nutrition',
    description: 'Feeding schedules and nutrition analysis',
    lastExport: '2024-01-08T11:45:00Z',
    size: '1.2 MB',
    format: 'CSV'
  }
];

const systemInfo = {
  version: '3.2.1',
  lastUpdate: '2024-01-16T03:00:00Z',
  databaseSize: '1.2 GB',
  uptime: '45 days',
  serverLocation: 'South Africa',
  supportContact: 'support@agriintel.com'
};

const recentActivity = [
  {
    id: 1,
    type: 'profile_update',
    description: 'Profile information updated',
    timestamp: '2024-01-18T10:30:00Z',
    icon: UserIcon
  },
  {
    id: 2,
    type: 'security',
    description: 'Password changed successfully',
    timestamp: '2024-01-17T15:45:00Z',
    icon: KeyIcon
  },
  {
    id: 3,
    type: 'notification',
    description: 'Email notification preferences updated',
    timestamp: '2024-01-16T09:20:00Z',
    icon: BellIcon
  },
  {
    id: 4,
    type: 'device',
    description: 'New device logged in from mobile app',
    timestamp: '2024-01-15T14:10:00Z',
    icon: DevicePhoneMobileIcon
  },
  {
    id: 5,
    type: 'export',
    description: 'Animal data export completed',
    timestamp: '2024-01-15T14:30:00Z',
    icon: ArrowRightIcon
  }
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      sms: 'bg-green-100 text-green-800',
      push: 'bg-purple-100 text-purple-800'
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
  };

  if (!mounted) {
    return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  }

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account, preferences, and system configuration"
    >
      <div className="space-y-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: UserIcon },
                  { id: 'notifications', label: 'Notifications', icon: BellIcon },
                  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
                  { id: 'farm', label: 'Farm Settings', icon: GlobeAltIcon },
                  { id: 'devices', label: 'Devices', icon: DevicePhoneMobileIcon },
                  { id: 'appearance', label: 'Appearance', icon: SunIcon },
                  { id: 'data', label: 'Data & Export', icon: ArrowRightIcon },
                  { id: 'system', label: 'System Info', icon: InformationCircleIcon }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeTab}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {activeTab === 'profile' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue={userProfile.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          defaultValue={userProfile.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          defaultValue={userProfile.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          defaultValue={userProfile.role}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                        <input
                          type="text"
                          defaultValue={userProfile.farmName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size</label>
                        <input
                          type="text"
                          defaultValue={userProfile.farmSize}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          defaultValue={userProfile.location}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                        <input
                          type="text"
                          defaultValue={userProfile.specialization}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>Member since: {new Date(userProfile.joinDate).toLocaleDateString()}</p>
                        <p>Last login: {new Date(userProfile.lastLogin).toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                          Cancel
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    {notificationSettings.map((setting) => (
                      <div key={setting.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{setting.title}</h3>
                              <div className={`flex items-center space-x-2 ${setting.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                {setting.enabled ? <CheckIcon className="h-4 w-4" /> : <XMarkIcon className="h-4 w-4" />}
                                <span className="text-sm font-medium">
                                  {setting.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{setting.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {setting.channels.map((channel) => (
                                <span key={channel} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChannelBadge(channel)}`}>
                                  {channel.toUpperCase()}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">Frequency:</span>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {setting.frequency.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-blue-600 hover:text-blue-800">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    {securitySettings.map((setting) => (
                      <div key={setting.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{setting.title}</h3>
                            <p className="text-gray-600">{setting.description}</p>
                            {setting.value && (
                              <p className="text-sm text-gray-500 mt-1">Current: {setting.value.replace('_', ' ')}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-4">
                            {setting.type === 'toggle' && (
                              <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                setting.enabled ? 'bg-green-600' : 'bg-gray-200'
                              }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            )}

                            {setting.type === 'select' && (
                              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {setting.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button className="p-2 text-blue-600 hover:text-blue-800">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'farm' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Configuration</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {farmSettings.map((setting) => (
                      <div key={setting.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{setting.title}</h3>
                            <p className="text-gray-600">{setting.description}</p>
                          </div>
                        </div>

                        {setting.type === 'text' && (
                          <input
                            type="text"
                            defaultValue={setting.value}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {setting.type === 'select' && (
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {setting.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'devices' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected Devices</h2>

                  <div className="space-y-6">
                    {deviceSettings.map((device) => (
                      <div key={device.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${
                              device.type === 'mobile' ? 'bg-green-100' :
                              device.type === 'desktop' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              {device.type === 'mobile' && <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />}
                              {device.type === 'desktop' && <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />}
                              {device.type === 'tablet' && <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600" />}
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                              <p className="text-gray-600">{device.location}</p>
                              <p className="text-sm text-gray-500">
                                Last active: {new Date(device.lastActive).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(device.status)}`}>
                              {device.status}
                            </span>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Notifications:</span>
                              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                device.notifications ? 'bg-green-600' : 'bg-gray-200'
                              }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  device.notifications ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </div>
                            </div>

                            <button className="p-2 text-red-600 hover:text-red-800">
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance Settings</h2>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'light', name: 'Light', icon: SunIcon },
                          { id: 'dark', name: 'Dark', icon: MoonIcon },
                          { id: 'system', name: 'System', icon: ComputerDesktopIcon }
                        ].map((themeOption) => (
                          <button
                            key={themeOption.id}
                            onClick={() => setTheme(themeOption.id)}
                            className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-colors ${
                              theme.id === themeOption.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <themeOption.icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">{themeOption.name}</span>
                            {theme.id === themeOption.id && <CheckIcon className="h-4 w-4 text-blue-600 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Compact Mode</h4>
                            <p className="text-sm text-gray-600">Show more data in less space</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                            <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Animations</h4>
                            <p className="text-sm text-gray-600">Enable smooth transitions and effects</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                            <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Management</h2>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                      <div className="space-y-4">
                        {dataExportOptions.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{option.title}</h4>
                              <p className="text-sm text-gray-600">{option.description}</p>
                              <p className="text-xs text-gray-500">
                                Last export: {new Date(option.lastExport).toLocaleString()} • {option.size} • {option.format}
                              </p>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                              Export
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Auto-delete old data</h4>
                            <p className="text-sm text-gray-600">Automatically remove data older than 2 years</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                            <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Data backup frequency</h4>
                            <p className="text-sm text-gray-600">How often to create system backups</p>
                          </div>
                          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">System Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Version:</span>
                          <span className="font-medium">{systemInfo.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Update:</span>
                          <span className="font-medium">{new Date(systemInfo.lastUpdate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">System Uptime:</span>
                          <span className="font-medium">{systemInfo.uptime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Database Size:</span>
                          <span className="font-medium">{systemInfo.databaseSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Server Location:</span>
                          <span className="font-medium">{systemInfo.serverLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Support Contact:</span>
                          <span className="font-medium">{systemInfo.supportContact}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <activity.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}