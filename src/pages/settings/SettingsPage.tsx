import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Building2,
  CreditCard,
  Database,
  Mail,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Tabs from '@/components/ui/Tabs';
import Select from '@/components/ui/Select';
import { useAppSelector } from '@/redux/hooks';

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'language', label: 'Language', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted">Manage your account and application preferences</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>
                <p className="text-sm text-text-muted">Update your personal details</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={user?.avatar}
                    name={`${user?.firstName} ${user?.lastName}`}
                    size="2xl"
                  />
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-text-muted mt-2">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" defaultValue={user?.firstName} />
                  <Input label="Last Name" defaultValue={user?.lastName} />
                </div>
                <Input label="Email Address" type="email" defaultValue={user?.email} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone Number" placeholder="+1 (555) 000-0000" />
                  <Input label="Job Title" defaultValue={user?.role} />
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Security Settings</h3>
                <p className="text-sm text-text-muted">Manage your password and authentication</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-background-secondary/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Password</p>
                    <p className="text-sm text-text-muted">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                    <p className="text-sm text-text-muted">Add an extra layer of security</p>
                  </div>
                  <Badge variant="warning">Disabled</Badge>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Active Sessions</p>
                    <p className="text-sm text-text-muted">2 devices currently logged in</p>
                  </div>
                  <Button variant="ghost">View All</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Notification Preferences</h3>
                <p className="text-sm text-text-muted">Choose how you want to be notified</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Email Notifications', description: 'Receive notifications via email' },
                  { label: 'Push Notifications', description: 'Receive push notifications on your devices' },
                  { label: 'SMS Notifications', description: 'Receive urgent alerts via SMS' },
                  { label: 'Production Alerts', description: 'Get notified about production issues' },
                  { label: 'Quality Alerts', description: 'Get notified about quality issues' },
                  { label: 'HR Notifications', description: 'Get notified about HR activities' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-background-secondary/50 border border-white/5">
                    <div>
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-sm text-text-muted">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index < 3} className="sr-only peer" />
                      <div className="w-11 h-6 bg-background-tertiary peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Appearance</h3>
                <p className="text-sm text-text-muted">Customize how the app looks</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Dark', 'Light', 'System'].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 rounded-xl border ${
                          theme === 'Dark'
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-white/10 hover:border-white/20'
                        } transition-all`}
                      >
                        <div className={`w-8 h-8 rounded-lg mb-2 ${theme === 'Dark' ? 'bg-background' : theme === 'Light' ? 'bg-white' : 'bg-gradient-to-r from-background to-white'}`} />
                        <span className="text-sm text-text-primary">{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">Accent Color</label>
                  <div className="flex gap-3">
                    {['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        className="w-10 h-10 rounded-lg ring-2 ring-white/10 hover:ring-white/30 transition-all"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'company' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Company Information</h3>
                <p className="text-sm text-text-muted">Update your company details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Company Name" defaultValue="FactoryFlow Manufacturing Inc." />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Industry" defaultValue="Manufacturing" />
                  <Input label="Company Size" defaultValue="500-1000 employees" />
                </div>
                <Input label="Website" placeholder="https://company.com" />
                <Input label="Address" placeholder="Company address" />
                <div className="grid grid-cols-3 gap-4">
                  <Input label="City" defaultValue="Detroit" />
                  <Input label="State" defaultValue="MI" />
                  <Input label="Country" defaultValue="USA" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Language & Region</h3>
                <p className="text-sm text-text-muted">Set your language and regional preferences</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Language"
                  options={[
                    { value: 'en', label: 'English (US)' },
                    { value: 'en-gb', label: 'English (UK)' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'de', label: 'German' },
                    { value: 'fr', label: 'French' },
                  ]}
                  value="en"
                />
                <Select
                  label="Timezone"
                  options={[
                    { value: 'america/new_york', label: 'Eastern Time (ET)' },
                    { value: 'america/chicago', label: 'Central Time (CT)' },
                    { value: 'america/denver', label: 'Mountain Time (MT)' },
                    { value: 'america/los_angeles', label: 'Pacific Time (PT)' },
                  ]}
                  value="america/new_york"
                />
                <Select
                  label="Date Format"
                  options={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                  value="MM/DD/YYYY"
                />
                <Select
                  label="Currency"
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (\u20AC)' },
                    { value: 'GBP', label: 'GBP (\u00A3)' },
                  ]}
                  value="USD"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Account Status</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="success">Active</Badge>
                <span className="text-sm text-text-muted">Premium Plan</span>
              </div>
              <div className="p-4 rounded-xl bg-background-secondary/50 border border-white/5 mb-4">
                <p className="text-sm text-text-muted mb-1">Storage Used</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-text-primary">24.5 GB</span>
                  <span className="text-sm text-text-muted">/ 100 GB</span>
                </div>
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-primary-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Quick Links</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Privacy Policy', icon: <Shield className="w-4 h-4" /> },
                { label: 'Terms of Service', icon: <Database className="w-4 h-4" /> },
                { label: 'Contact Support', icon: <Mail className="w-4 h-4" /> },
                { label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
              ].map((link) => (
                <button
                  key={link.label}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
