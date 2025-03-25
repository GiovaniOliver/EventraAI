import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Vendor } from "@shared/schema";
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
import { MoreVertical, Check, UserPlus, Edit, Trash2, LucideShield } from "lucide-react";
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
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
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
                              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">Pending Approval</Badge>
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
      </Tabs>
    </div>
  );
}