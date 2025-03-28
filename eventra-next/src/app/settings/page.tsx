'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'system',
    language: 'en'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    // This would be replaced with a real API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Loading...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl p-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium border-b pb-2">Notifications</h2>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                        Email Notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        id="pushNotifications"
                        checked={formData.pushNotifications}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                        Push Notifications
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium border-b pb-2">Appearance</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                        Theme
                      </label>
                      <select
                        name="theme"
                        id="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <select
                        name="language"
                        id="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium border-b pb-2">Account</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <p className="font-medium capitalize">{user.subscription_tier || 'Free'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 