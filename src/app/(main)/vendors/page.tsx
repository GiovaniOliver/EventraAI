'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  rating?: number;
  verified: boolean;
}

export default function VendorsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch vendors from API
  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ['vendors', searchQuery],
    queryFn: async () => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockVendors = [
          {
            id: '1',
            name: 'Elegant Catering Co.',
            category: 'Catering',
            description: 'Premium catering services for all occasions',
            contact_email: 'info@elegantcatering.com',
            contact_phone: '555-123-4567',
            website: 'www.elegantcatering.com',
            rating: 4.8,
            verified: true
          },
          {
            id: '2',
            name: 'Sunset Venue',
            category: 'Venues',
            description: 'Beautiful beachfront venue with stunning sunset views',
            contact_email: 'bookings@sunsetvenue.com',
            contact_phone: '555-987-6543',
            website: 'www.sunsetvenue.com',
            rating: 4.9,
            verified: true
          },
          {
            id: '3',
            name: 'Capture Moments Photography',
            category: 'Photography',
            description: 'Professional event photography that captures every special moment',
            contact_email: 'hello@capturemoments.com',
            contact_phone: '555-456-7890',
            website: 'www.capturemoments.com',
            rating: 4.7,
            verified: true
          }
        ];
        
        // Filter by search query if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return mockVendors.filter(vendor => 
            vendor.name.toLowerCase().includes(query) ||
            vendor.category.toLowerCase().includes(query) ||
            (vendor.description && vendor.description.toLowerCase().includes(query))
          );
        }
        
        return mockVendors;
      }
      
      try {
        // Build the URL with search parameters if needed
        const url = searchQuery 
          ? `/api/vendors?search=${encodeURIComponent(searchQuery)}`
          : '/api/vendors';
          
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching vendors: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
        throw error;
      }
    },
    enabled: !!user // Only run the query if user is authenticated
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search query will trigger a refetch via the queryKey
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendors</h1>
        <p className="text-muted-foreground">
          Find and manage vendors for your events
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Vendors</CardTitle>
          <CardDescription>
            Search for vendors in our marketplace or add your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name, category, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "No vendors match your search criteria. Try a different search term."
              : "You haven't added any vendors yet."}
          </p>
          <Button
            onClick={() => router.push('/vendors/new')}
            className="bg-primary hover:bg-primary/90"
          >
            Add Your First Vendor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{vendor.name}</CardTitle>
                    <CardDescription>{vendor.category}</CardDescription>
                  </div>
                  {vendor.verified && (
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Verified
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {vendor.description || "No description available."}
                </p>
                {vendor.rating && (
                  <div className="flex items-center mb-2">
                    <span className="text-amber-500 mr-1">★</span>
                    <span className="font-medium">{vendor.rating}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/vendors/${vendor.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/vendors/${vendor.id}/contact`}>
                    Contact
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Categories */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Popular Vendor Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Catering', 'Venues', 'Photography', 'Entertainment', 'Decorations', 'Transportation', 'Accommodation', 'Equipment'].map((category) => (
            <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => setSearchQuery(category)}>
              <CardContent className="p-4 text-center">
                <p className="font-medium">{category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 