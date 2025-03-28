'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VendorsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch vendors (placeholder for now)
  useEffect(() => {
    if (user) {
      // This would be replaced with a real API call
      setIsLoading(false);
      setVendors([]);
    }
  }, [user]);

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
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <Button
            onClick={() => router.push('/vendors/new')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Vendor
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Vendors</CardTitle>
              <CardDescription>
                Search for vendors in our marketplace or add your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search vendors..."
                  className="flex-1"
                />
                <Button>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
              <p className="text-gray-500 mb-4">
                You haven't added any vendors yet, or none match your search criteria.
              </p>
              <Button
                onClick={() => router.push('/vendors/new')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Your First Vendor
              </Button>
            </div>
          ) : (
            // This would render actual vendors when available
            <p>Vendor list would appear here</p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Popular Vendor Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Catering', 'Venues', 'Photography', 'Entertainment', 'Decorations', 'Transportation', 'Accommodation', 'Equipment'].map((category) => (
              <Card key={category} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 