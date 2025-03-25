import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  Settings as SettingsIcon,
  Bell,
  Calendar,
  Lock,
  Shield,
  Globe,
  CreditCard,
  User,
  Mail,
  Palette,
  Phone,
  Clock,
  Monitor,
  Eye,
  Save,
} from "lucide-react";
import { UserPreference } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // Define a type for extended preferences
  type ExtendedPreferences = UserPreference & {
    darkModeEnabled?: boolean;
    use24HourTime?: boolean;
    compactViewEnabled?: boolean;
    timezone?: string;
    calendarIntegrationEnabled?: boolean;
    videoIntegrationEnabled?: boolean;
    emailNotificationsEnabled?: boolean;
    smsNotificationsEnabled?: boolean;
  };

  // Fetch user preferences
  const {
    data: basePreferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
  } = useQuery<UserPreference>({
    queryKey: [`/api/users/${userId}/preferences`],
    enabled: !!userId,
  });

  // Create extended preferences with additional fields
  const preferences: ExtendedPreferences | undefined = basePreferences 
    ? {
        ...basePreferences,
        // Initialize extended fields with defaults
        // In a real app, these would be stored in the database
        darkModeEnabled: false,
        use24HourTime: false,
        compactViewEnabled: false,
        timezone: "UTC",
        calendarIntegrationEnabled: false,
        videoIntegrationEnabled: false,
        emailNotificationsEnabled: false,
        smsNotificationsEnabled: false,
      }
    : undefined;

  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<UserPreference>) => {
      // Only send fields that are in the UserPreference schema
      const validFields = {
        preferredThemes: data.preferredThemes,
        preferredEventTypes: data.preferredEventTypes,
        notificationsEnabled: data.notificationsEnabled,
        onboardingCompleted: data.onboardingCompleted,
      };
      
      const response = await apiRequest(
        "PATCH",
        `/api/users/${userId}/preferences`,
        validFields
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/preferences`] });
      toast({
        title: "Preferences Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleSetting = (setting: string, value: boolean) => {
    // Special handling for extended settings that are not in the database schema
    const extendedSettings = [
      'darkModeEnabled', 
      'use24HourTime', 
      'compactViewEnabled', 
      'timezone', 
      'calendarIntegrationEnabled', 
      'videoIntegrationEnabled', 
      'emailNotificationsEnabled', 
      'smsNotificationsEnabled'
    ];
    
    if (extendedSettings.includes(setting)) {
      // For extended settings, show a toast but don't save to database
      // These would be saved in a real application
      toast({
        title: "Setting Updated",
        description: `${setting} has been set to ${value}. (Demo only)`,
      });
      return;
    }
    
    // For real database settings
    updatePreferencesMutation.mutate({
      [setting]: value,
    });
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage your app settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
                Appearance & Display
              </CardTitle>
              <CardDescription>
                Customize how the application looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="theme" className="text-sm">Dark Mode</Label>
                </div>
                <Switch
                  id="theme"
                  checked={preferences?.darkModeEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("darkModeEnabled", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="time-format" className="text-sm">Use 24-hour Time</Label>
                </div>
                <Switch
                  id="time-format"
                  checked={preferences?.use24HourTime || false}
                  onCheckedChange={(checked) => handleToggleSetting("use24HourTime", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="compact-view" className="text-sm">Compact View</Label>
                </div>
                <Switch
                  id="compact-view"
                  checked={preferences?.compactViewEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("compactViewEnabled", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-2">
                <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                <Select defaultValue={preferences?.timezone || "UTC"}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                Integration Settings
              </CardTitle>
              <CardDescription>
                Manage integrations with external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="calendar-integration" className="text-sm">Calendar Integration</Label>
                </div>
                <Switch
                  id="calendar-integration"
                  checked={preferences?.calendarIntegrationEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("calendarIntegrationEnabled", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="video-integration" className="text-sm">Video Conferencing Integration</Label>
                </div>
                <Switch
                  id="video-integration"
                  checked={preferences?.videoIntegrationEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("videoIntegrationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="display-name" className="text-sm">Display Name</Label>
                <Input id="display-name" placeholder="Display Name" defaultValue={user?.displayName || ""} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input id="email" type="email" placeholder="Email address" defaultValue={user?.email || ""} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-sm">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself" />
              </div>
              
              <Button className="mt-2" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
                Password & Security
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                <Input id="current-password" type="password" placeholder="Current Password" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="new-password" className="text-sm">New Password</Label>
                <Input id="new-password" type="password" placeholder="New Password" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm New Password" />
              </div>
              
              <Button className="mt-2" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2 text-muted-foreground" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notifications" className="text-sm">Enable Notifications</Label>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences?.notificationsEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("notificationsEnabled", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences?.emailNotificationsEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("emailNotificationsEnabled", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sms-notifications" className="text-sm">SMS Notifications</Label>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences?.smsNotificationsEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting("smsNotificationsEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                Event Notifications
              </CardTitle>
              <CardDescription>
                Configure notifications for specific event activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="event-reminders" className="text-sm">Event Reminders</Label>
                <Switch id="event-reminders" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="task-reminders" className="text-sm">Task Reminders</Label>
                <Switch id="task-reminders" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label htmlFor="guest-updates" className="text-sm">Guest Updates</Label>
                <Switch id="guest-updates" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Current Plan</h3>
                  <span className="bg-primary/10 text-primary text-xs font-medium py-1 px-2 rounded-full">
                    {user?.subscriptionTier || "Free"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {user?.subscriptionTier === "premium" 
                    ? "You are currently on the Premium plan with access to all features." 
                    : "Upgrade to Premium for access to advanced features and unlimited events."}
                </p>
                {user?.subscriptionTier !== "premium" && (
                  <Button size="sm">Upgrade Plan</Button>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Payment Methods</h3>
                <div className="rounded-md border border-border p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                Billing History
              </CardTitle>
              <CardDescription>
                View your past invoices and billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border border-border p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">March 25, 2025</p>
                    <p className="text-xs text-muted-foreground">Premium Plan - Monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$12.99</p>
                    <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                      View Receipt
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border border-border p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">February 25, 2025</p>
                    <p className="text-xs text-muted-foreground">Premium Plan - Monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$12.99</p>
                    <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                      View Receipt
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}