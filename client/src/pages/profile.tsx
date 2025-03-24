import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Settings,
  Bell,
  Calendar,
  Clock,
  LogOut,
  Heart,
  HelpCircle,
  Edit,
  UserPlus,
  Mail,
  Phone,
} from "lucide-react";
import { UserPreference } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const [userId] = useState(1); // For demo, hardcode userId to 1
  
  // Mock user data for demo purposes
  const mockUser = {
    id: 1,
    displayName: "Alex Johnson",
    username: "alexj",
    email: "alex@example.com",
  };
  
  // Fetch user preferences
  const { 
    data: preferences, 
    isLoading: isLoadingPreferences, 
    error: preferencesError 
  } = useQuery<UserPreference>({
    queryKey: [`/api/users/${userId}/preferences`]
  });
  
  // Handle toggle notification preference
  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      await apiRequest("POST", `/api/users/${userId}/preferences`, {
        userId,
        notificationsEnabled: enabled,
      });
      
      // Invalidate preferences cache
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/preferences`] });
      
      toast({
        title: "Preferences Updated",
        description: `Notifications ${enabled ? "enabled" : "disabled"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };
  
  // Handle complete onboarding
  const handleCompleteOnboarding = async () => {
    try {
      await apiRequest("POST", `/api/users/${userId}/preferences`, {
        userId,
        onboardingCompleted: true,
      });
      
      // Invalidate preferences cache
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/preferences`] });
      
      toast({
        title: "Onboarding Completed",
        description: "Your profile has been set up successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update onboarding status.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="px-4 pt-4 pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">My Profile</h2>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-4">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{mockUser.displayName}</h3>
              <p className="text-gray-500">{mockUser.email}</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Username</span>
              <span className="font-medium">{mockUser.username}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Email</span>
              <span className="font-medium">{mockUser.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPreferences ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-10" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-10" />
              </div>
            </div>
          ) : preferencesError ? (
            <div className="text-red-500">
              Error loading preferences. Please try again.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="notifications" className="text-sm">Notifications</Label>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences?.notificationsEnabled || false}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="calendar" className="text-sm">Calendar Integration</Label>
                </div>
                <Switch id="calendar" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="timezone" className="text-sm">Use 24-hour Time</Label>
                </div>
                <Switch id="timezone" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Account Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50 border-b">
            <UserPlus className="h-4 w-4 mr-3 text-gray-500" />
            <span>Invite Team Members</span>
          </button>
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50 border-b">
            <Mail className="h-4 w-4 mr-3 text-gray-500" />
            <span>Update Email</span>
          </button>
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50 border-b">
            <Phone className="h-4 w-4 mr-3 text-gray-500" />
            <span>Update Phone Number</span>
          </button>
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50 text-red-500">
            <LogOut className="h-4 w-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </CardContent>
      </Card>
      
      {/* Support and About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50 border-b">
            <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
            <span>Help Center</span>
          </button>
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50 border-b">
            <Mail className="h-4 w-4 mr-3 text-gray-500" />
            <span>Contact Support</span>
          </button>
          <button className="w-full flex items-center py-3 px-6 hover:bg-gray-50">
            <Heart className="h-4 w-4 mr-3 text-gray-500" />
            <span>About EventFlow</span>
          </button>
        </CardContent>
      </Card>
      
      {/* Onboarding Reminder (only show if onboarding not completed) */}
      {preferences && !preferences.onboardingCompleted && (
        <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h4 className="font-medium text-primary-700 mb-2">Complete Your Profile</h4>
          <p className="text-sm text-primary-600 mb-3">
            Finish setting up your profile to get personalized event recommendations.
          </p>
          <Button
            size="sm"
            onClick={handleCompleteOnboarding}
          >
            Complete Setup
          </Button>
        </div>
      )}
    </div>
  );
}
