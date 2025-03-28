'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get eventId from URL if present
  const eventId = searchParams.get('eventId');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch tasks (placeholder for now)
  useEffect(() => {
    if (user) {
      // This would be replaced with a real API call
      setIsLoading(false);
      setTasks([]);
    }
  }, [user, eventId]);

  if (authLoading || isLoading) {
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
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            {eventId && (
              <Link 
                href={`/events/${eventId}`}
                className="ml-4 text-sm text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Event
              </Link>
            )}
          </div>
          <button
            onClick={() => router.push(eventId ? `/tasks/new?eventId=${eventId}` : '/tasks/new')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Task
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {eventId ? 'Event Tasks' : 'All Tasks'}
              </h2>
              <div className="flex space-x-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  defaultValue="dueDate"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="status">Sort by Status</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>
          </div>
          
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No tasks found</p>
              <button
                onClick={() => router.push(eventId ? `/tasks/new?eventId=${eventId}` : '/tasks/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Task rows would be rendered here */}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 