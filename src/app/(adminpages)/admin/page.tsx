'use client'

import React, { useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// import { User, Event, Vendor, SubscriptionPlan } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Users, 
  Store, 
  CalendarDays, 
  BarChart3, 
  DollarSign, 
  ShieldCheck, 
  ShieldX, 
  Star, 
  AlertTriangle,
  Check,
  X,
  UserPlus,
  FileText,
  Plus,
  Link as LinkIcon,
  Upload
} from 'lucide-react';

// Create a client
const queryClient = new QueryClient();

// Mock API request function (replace with actual implementation later)
const apiRequest = async (method, url, data) => {
  console.log(`Making ${method} request to ${url} with data:`, data);
  // This is a mock implementation that would be replaced with actual API calls
  return {
    json: () => Promise.resolve({ success: true })
  };
};

// Sample type definitions (replace with actual types from your schema)
type User = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  subscriptionTier: string;
  isAdmin: boolean;
  createdAt: string;
};

type Vendor = {
  id: number;
  name: string;
  category: string;
  description: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  services: string[];
  isApproved: boolean;
  isPartner: boolean;
  ownerId?: number;
  affiliateLinks?: any[];
  featured: boolean;
};

type Event = {
  id: number;
  name: string;
  type: string;
  format: string;
  date: string;
  ownerId: number;
  status: string;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

// Vendor form schema
const vendorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(2, "Please select or enter a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  services: z.string().transform((val) => val.split(',').map(s => s.trim())),
  isPartner: z.boolean().default(true),
  affiliateLinks: z.string().transform((val) => {
    if (!val) return [];
    try {
      // Parse if it's a valid JSON string, otherwise treat as comma-separated
      return val.includes('{') ? JSON.parse(val) : val.split(',').map(s => ({ url: s.trim() }));
    } catch {
      return val.split(',').map(s => ({ url: s.trim() }));
    }
  }),
  featured: z.boolean().default(false),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

// Sample mock data
const mockUsers: User[] = [
  {
    id: 1,
    username: "john_doe",
    displayName: "John Doe",
    email: "john@example.com",
    subscriptionTier: "premium",
    isAdmin: true,
    createdAt: "2023-05-12T08:30:00Z"
  },
  {
    id: 2,
    username: "jane_smith",
    displayName: "Jane Smith",
    email: "jane@example.com",
    subscriptionTier: "free",
    isAdmin: false,
    createdAt: "2023-07-20T10:15:00Z"
  },
  {
    id: 3,
    username: "bob_johnson",
    displayName: "Bob Johnson",
    email: "bob@example.com",
    subscriptionTier: "premium",
    isAdmin: false,
    createdAt: "2023-08-05T14:45:00Z"
  }
];

const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "Tech Events Pro",
    category: "tech",
    description: "Provider of technical equipment for events",
    contactEmail: "info@techevents.com",
    website: "https://techevents.com",
    services: ["AV Equipment", "Live Streaming", "Lighting"],
    isApproved: true,
    isPartner: true,
    ownerId: null,
    featured: true
  },
  {
    id: 2,
    name: "Delicious Catering",
    category: "catering",
    description: "Premium catering for all event types",
    contactEmail: "hello@deliciouscatering.com",
    contactPhone: "+1 555-123-4567",
    website: "https://deliciouscatering.com",
    services: ["Corporate Meals", "Wedding Catering", "Drinks Service"],
    isApproved: true,
    isPartner: false,
    ownerId: 2,
    featured: false
  },
  {
    id: 3,
    name: "Venue Masters",
    category: "venue",
    description: "The best event spaces in the city",
    contactEmail: "bookings@venuemasters.com",
    services: ["Indoor Venues", "Outdoor Spaces", "Conference Rooms"],
    isApproved: false,
    isPartner: false,
    ownerId: 3,
    featured: false
  }
];

const mockEvents: Event[] = [
  {
    id: 1,
    name: "Annual Tech Conference",
    type: "conference",
    format: "hybrid",
    date: "2023-11-15T09:00:00Z",
    ownerId: 1,
    status: "active"
  },
  {
    id: 2,
    name: "Corporate Summit 2023",
    type: "corporate",
    format: "in-person",
    date: "2023-09-22T10:00:00Z",
    ownerId: 2,
    status: "completed"
  },
  {
    id: 3,
    name: "Marketing Workshop",
    type: "workshop",
    format: "virtual",
    date: "2023-12-05T14:00:00Z",
    ownerId: 1,
    status: "planning"
  }
];

function AdminDashboardContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  
  // Form setup
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      services: "",
      isPartner: true,
      affiliateLinks: "",
      featured: false
    }
  });
  
  // Queries - using mock data for now, replace with actual API endpoints later
  const { data: users = mockUsers, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => Promise.resolve(mockUsers),
    staleTime: 60 * 1000, // 1 minute
  });
  
  const { data: vendors = mockVendors, isLoading: isLoadingVendors } = useQuery<Vendor[]>({
    queryKey: ['/api/admin/vendors'],
    queryFn: () => Promise.resolve(mockVendors),
    staleTime: 60 * 1000, // 1 minute
  });
  
  const { data: events = mockEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['/api/admin/events'],
    queryFn: () => Promise.resolve(mockEvents),
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Mutations
  const toggleVendorApprovalMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: number, isApproved: boolean }) => {
      const response = await apiRequest('PATCH', `/api/vendors/${id}/approval`, { isApproved });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendors'] });
      toast({
        title: 'Vendor approval updated',
        description: 'The vendor approval status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update vendor approval: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const toggleVendorPartnerMutation = useMutation({
    mutationFn: async ({ id, isPartner }: { id: number, isPartner: boolean }) => {
      const response = await apiRequest('PATCH', `/api/vendors/${id}/partner`, { isPartner });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendors'] });
      toast({
        title: 'Partner status updated',
        description: 'The vendor partner status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update partner status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: VendorFormValues) => {
      const response = await apiRequest('POST', '/api/admin/vendors', {
        ...vendorData,
        // Mark as approved and verified since it's coming from admin
        isApproved: true
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendors'] });
      toast({
        title: 'Vendor created',
        description: 'The partner vendor was created successfully with affiliate links',
      });
      setIsAddVendorOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create vendor: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle approval toggle
  const handleToggleApproval = (vendor: Vendor) => {
    toggleVendorApprovalMutation.mutate({
      id: vendor.id,
      isApproved: !vendor.isApproved
    });
  };
  
  // Handle partner toggle
  const handleTogglePartner = (vendor: Vendor) => {
    toggleVendorPartnerMutation.mutate({
      id: vendor.id,
      isPartner: !vendor.isPartner
    });
  };
  
  // Calculate overview statistics
  const totalUsers = users?.length || 0;
  const totalVendors = vendors?.length || 0;
  const totalEvents = events?.length || 0;
  const pendingApprovalVendors = vendors?.filter(v => !v.isApproved).length || 0;
  const premiumUsers = users?.filter(u => u.subscriptionTier !== 'free').length || 0;
  
  const isLoading = isLoadingUsers || isLoadingVendors || isLoadingEvents;
  
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
      
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Administrator Mode</AlertTitle>
        <AlertDescription>
          You have full administrative access to the platform. Changes made here will affect all users.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  {isLoading ? "Loading..." : totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {premiumUsers} premium users
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
                  {isLoading ? "Loading..." : totalVendors}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingApprovalVendors} awaiting approval
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
                  {isLoading ? "Loading..." : totalEvents}
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
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : `${totalUsers ? Math.round((premiumUsers / totalUsers) * 100) : 0}%`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users on paid plans
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="py-4 text-center text-muted-foreground">Loading users data...</div>
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 5).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.subscriptionTier === 'free' ? 'outline' : 'default'}>
                              {user.subscriptionTier}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">No users found</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Vendors waiting for approval</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingVendors ? (
                  <div className="py-4 text-center text-muted-foreground">Loading vendors data...</div>
                ) : vendors && vendors.filter(v => !v.isApproved).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.filter(v => !v.isApproved).slice(0, 5).map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.name}</TableCell>
                          <TableCell>{vendor.category}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleApproval(vendor)}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">No pending approvals</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users in the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="py-4 text-center text-muted-foreground">Loading users data...</div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.displayName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.subscriptionTier === 'free' ? 'outline' : 'default'}>
                            {user.subscriptionTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-4 text-center text-muted-foreground">No users found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Approve vendors and manage partner status</CardDescription>
              </div>
              <Button 
                onClick={() => setIsAddVendorOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Partner Vendor
              </Button>
            </CardHeader>
            <CardContent>
              {/* Vendor Upload Dialog */}
              <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add Partner Vendor with Affiliate Links</DialogTitle>
                    <DialogDescription>
                      Create a new partner vendor that will be visible to all users. Affiliate links can be added to earn revenue from vendor referrals.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createVendorMutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Events" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="venue">Venue</SelectItem>
                                  <SelectItem value="catering">Catering</SelectItem>
                                  <SelectItem value="tech">Technology</SelectItem>
                                  <SelectItem value="decoration">Decoration</SelectItem>
                                  <SelectItem value="entertainment">Entertainment</SelectItem>
                                  <SelectItem value="photography">Photography</SelectItem>
                                  <SelectItem value="software">Software</SelectItem>
                                  <SelectItem value="consulting">Consulting</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the vendor and their services" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="contact@vendor.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.vendorwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Services (comma-separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="Virtual event hosting, Live streaming, Recording" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter services separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="affiliateLinks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Affiliate Links (comma-separated)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="https://vendor.com/ref=123, https://vendor.com/product/ref=456" 
                                className="min-h-[80px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Enter affiliate URLs separated by commas. These will generate revenue when users click through.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isPartner"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Partner Vendor</FormLabel>
                                <FormDescription>
                                  Mark as an official partner vendor
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Featured Vendor</FormLabel>
                                <FormDescription>
                                  Promote this vendor in the marketplace
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddVendorOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createVendorMutation.isPending}
                        >
                          {createVendorMutation.isPending ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Add Vendor
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {isLoadingVendors ? (
                <div className="py-4 text-center text-muted-foreground">Loading vendors data...</div>
              ) : vendors && vendors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id} className={!vendor.isApproved ? "bg-yellow-50" : ""}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.category}</TableCell>
                        <TableCell>{vendor.contactEmail}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={vendor.isApproved} 
                              onCheckedChange={() => handleToggleApproval(vendor)} 
                            />
                            <span className="text-sm">
                              {vendor.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={vendor.isPartner} 
                              onCheckedChange={() => handleTogglePartner(vendor)} 
                            />
                            <span className="text-sm">
                              {vendor.isPartner ? 'Partner' : 'Standard'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.ownerId ? `User #${vendor.ownerId}` : 'System'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-4 text-center text-muted-foreground">No vendors found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>Overview of all events in the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="py-4 text-center text-muted-foreground">Loading events data...</div>
              ) : events && events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{event.format}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground">User #{event.ownerId}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              event.status === 'completed' 
                                ? 'default' 
                                : event.status === 'active' 
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-4 text-center text-muted-foreground">No events found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboardContent />
    </QueryClientProvider>
  );
}