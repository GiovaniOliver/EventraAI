'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/use-auth';
import { Users, CalendarDays, Store, BarChart3, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Strong protection - redirect non-admins
  React.useEffect(() => {
    if (!user) {
      // Wait for user data to load
      return;
    }
    
    if (!user.is_admin) {
      console.log('[ADMIN] Access denied - not admin user');
      router.replace('/dashboard');
    } else {
      console.log('[ADMIN] Admin access granted for:', user.email);
    }
  }, [user, router]);

  // Mock data for the dashboard
  const stats = {
    users: 124,
    premiumUsers: 45,
    events: 356,
    vendors: 67,
    pendingVendors: 12
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading admin dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <Badge variant="outline" className="ml-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
          <ShieldCheck className="w-4 h-4 mr-1" />
          Admin Access
        </Badge>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center justify-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center justify-center">
            <Store className="w-4 h-4 mr-2" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center justify-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.users}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.premiumUsers} premium users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Vendors
                </CardTitle>
                <Store className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.vendors}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingVendors} awaiting approval
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Events
                </CardTitle>
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.events}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Premium Conversion
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.premiumUsers / stats.users) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users on paid plans
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Welcome to the Admin Dashboard</h2>
            <p className="mb-2">This is your central hub for managing all aspects of the EventraAI platform.</p>
            <p>Use the tabs above to navigate between different sections:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Overview:</strong> Quick statistics and platform health</li>
              <li><strong>Users:</strong> Manage user accounts, subscriptions, and permissions</li>
              <li><strong>Vendors:</strong> Review, approve, and manage vendor listings</li>
              <li><strong>Events:</strong> Monitor all events created across the platform</li>
            </ul>
          </div>
        </TabsContent>
        
        {/* Other tab content would go here */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User management features will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Vendor management features will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Event management features will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
