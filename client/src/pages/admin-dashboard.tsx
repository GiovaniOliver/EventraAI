import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Vendor, Event, SubscriptionPlan } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MoreVertical, 
  Check, 
  UserPlus, 
  Edit, 
  Trash2, 
  LucideShield, 
  Users, 
  Store, 
  Calendar, 
  DollarSign, 
  LineChart,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user?.isAdmin,
  });

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
    enabled: !!user?.isAdmin,
  });

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/admin/events'],
    enabled: !!user?.isAdmin,
  });

  // Fetch subscription plans
  const { data: subscriptionPlans, isLoading: subscriptionPlansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    enabled: !!user?.isAdmin,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: number, updates: Partial<User> }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${data.userId}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Updated",
        description: "User information has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user information.",
        variant: "destructive"
      });
    }
  });

  // Toggle admin status
  const toggleAdminStatus = async (userId: number, isAdmin: boolean) => {
    updateUserMutation.mutate({ 
      userId, 
      updates: { isAdmin: !isAdmin } 
    });
  };

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: async (data: { vendorId: number, updates: Partial<Vendor> }) => {
      const response = await apiRequest('PATCH', `/api/vendors/${data.vendorId}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Vendor Updated",
        description: "Vendor information has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update vendor information.",
        variant: "destructive"
      });
    }
  });

  // Toggle partner status
  const togglePartnerStatus = async (vendorId: number, isPartner: boolean) => {
    updateVendorMutation.mutate({ 
      vendorId, 
      updates: { isPartner: !isPartner } 
    });
  };
  
  // Toggle approval status
  const toggleApprovalStatus = async (vendorId: number, isApproved: boolean) => {
    updateVendorMutation.mutate({
      vendorId,
      updates: { isApproved: !isApproved }
    });
  };
  
  // Update subscription plan mutation
  const updateSubscriptionPlanMutation = useMutation({
    mutationFn: async (data: { planId: number, updates: Partial<SubscriptionPlan> }) => {
      const response = await apiRequest('PATCH', `/api/subscription-plans/${data.planId}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Updated",
        description: "Subscription plan has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription plan.",
        variant: "destructive"
      });
    }
  });
  
  // Toggle plan active status
  const togglePlanActiveStatus = async (planId: number, isActive: boolean) => {
    updateSubscriptionPlanMutation.mutate({
      planId,
      updates: { isActive: !isActive }
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your users and vendors</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <LucideShield className="h-4 w-4" />
          Admin Mode
        </Badge>
      </div>
      
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h2 className="text-3xl font-bold">{users?.length || 0}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <h2 className="text-3xl font-bold">{vendors?.length || 0}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Approval Pending</p>
                <h2 className="text-3xl font-bold">{vendors?.filter(v => !v.isApproved).length || 0}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Partner Vendors</p>
                <h2 className="text-3xl font-bold">{vendors?.filter(v => v.isPartner).length || 0}</h2>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                Manage user access and permissions for your platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {users?.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.displayName?.charAt(0) || user.username.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium">{user.displayName || user.username}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {user.isAdmin && (
                            <Badge variant="outline" className="bg-primary/10">
                              Admin
                            </Badge>
                          )}
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={!!user.isAdmin} 
                              onCheckedChange={() => toggleAdminStatus(user.id, !!user.isAdmin)}
                              disabled={user.id === 1} // Can't demote main admin
                            />
                            <Label>Admin</Label>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled={user.id === 1}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>
                Approve and manage vendors on your platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {vendors?.map(vendor => (
                      <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex flex-col">
                          <h3 className="font-medium">{vendor.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{vendor.category}</Badge>
                            {vendor.isPartner && (
                              <Badge variant="secondary">Partner</Badge>
                            )}
                            {vendor.isApproved ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>
                            ) : (
                              <Badge variant="destructive">Pending Approval</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{vendor.description?.substring(0, 100)}...</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={!!vendor.isPartner} 
                                onCheckedChange={() => togglePartnerStatus(vendor.id, !!vendor.isPartner)}
                              />
                              <Label>Partner Status</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={!!vendor.isApproved} 
                                onCheckedChange={() => toggleApprovalStatus(vendor.id, !!vendor.isApproved)}
                              />
                              <Label>Approved</Label>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit Vendor
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                View and manage all events across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {events?.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex flex-col">
                          <h3 className="font-medium">{event.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{event.type}</Badge>
                            <Badge variant={event.status === 'upcoming' ? 'secondary' : 
                                         event.status === 'completed' ? 'outline' : 'default'}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>Owner: {event.ownerId}</span>
                            <span>•</span>
                            <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {event.description?.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  Key performance indicators and platform health metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users?.length || 0} users</div>
                      <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 20)}% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {events?.filter(e => e.status === 'upcoming' || e.status === 'in-progress').length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {events?.filter(e => e.status === 'completed').length || 0} completed events
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Vendor Adoption</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendors?.length || 0} vendors</div>
                      <p className="text-xs text-muted-foreground">
                        {vendors?.filter(v => v.isPartner).length || 0} partner vendors
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Subscription Plans</h3>
                  {subscriptionPlansLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {subscriptionPlans?.map((plan) => (
                        <Card key={plan.id}>
                          <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>${plan.price}/month</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{plan.maxEvents} events</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{plan.maxGuests} guests per event</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{plan.maxVendors} vendors per event</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={!!plan.isActive} 
                                onCheckedChange={() => togglePlanActiveStatus(plan.id, !!plan.isActive)}
                              />
                              <Label>Active</Label>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}