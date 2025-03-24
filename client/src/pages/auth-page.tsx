import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Login form schema
const loginSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
});

// Registration form schema
const registrationSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  displayName: z.string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(50),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100),
  confirmPassword: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegistrationFormValues = z.infer<typeof registrationSchema>;

function LoginForm() {
  const [location, setLocation] = useLocation();
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  // Login form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setLocation("/");
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        <User size={16} />
                      </span>
                      <Input 
                        placeholder="Enter your username" 
                        className="pl-9" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        <Lock size={16} />
                      </span>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password" 
                        className="pl-9 pr-10" 
                        {...field} 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <LoadingButton 
              type="submit" 
              className="w-full" 
              isLoading={loginMutation.isPending}
              loadingText="Logging in..."
            >
              Login
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const [location, setLocation] = useLocation();
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  // Registration form
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  const onSubmit = (values: RegistrationFormValues) => {
    const { confirmPassword, ...userData } = values;
    
    registerMutation.mutate(userData, {
      onSuccess: () => {
        toast({
          title: "Registration successful",
          description: "Welcome to Virtual Event Planner!",
        });
        setLocation("/");
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Fill in your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        <User size={16} />
                      </span>
                      <Input 
                        placeholder="Choose a username" 
                        className="pl-9" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    This will be used to log in to your account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        <Mail size={16} />
                      </span>
                      <Input 
                        type="email"
                        placeholder="Enter your email" 
                        className="pl-9" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="How you want to be known" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This is how you'll appear to others
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        <Lock size={16} />
                      </span>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a password" 
                        className="pl-9 pr-10" 
                        {...field} 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">
                        <Lock size={16} />
                      </span>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password" 
                        className="pl-9 pr-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <LoadingButton 
              type="submit" 
              className="w-full" 
              isLoading={registerMutation.isPending}
              loadingText="Creating account..."
            >
              Create Account
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  if (user) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen flex-col-reverse md:flex-row bg-background">
      {/* Form column */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Virtual Event Planner</h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>
          
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <LoginForm />
              <div className="mt-4 text-sm text-center">
                Don't have an account?{" "}
                <button 
                  className="text-primary underline cursor-pointer" 
                  onClick={() => setActiveTab("register")}
                >
                  Sign up
                </button>
              </div>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <RegisterForm />
              <div className="mt-4 text-sm text-center">
                Already have an account?{" "}
                <button 
                  className="text-primary underline cursor-pointer" 
                  onClick={() => setActiveTab("login")}
                >
                  Sign in
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero section */}
      <div className="flex-1 bg-primary p-8 flex items-center justify-center">
        <div className="max-w-lg space-y-6 text-primary-foreground">
          <div>
            <h2 className="text-4xl font-bold mb-4">Virtual Event Planning Made Easy</h2>
            <p className="text-xl opacity-90">
              Seamlessly organize and manage your virtual events with our intuitive platform.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Efficient Planning</h3>
                <p className="opacity-80">Plan your virtual events with our AI-powered suggestions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m7 10 3 3 7-7"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Task Management</h3>
                <p className="opacity-80">Keep track of all your tasks and deadlines in one place</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-primary-foreground/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 16.74V7.96A2 2 0 0 1 3.93 6h8.04a2 2 0 0 1 2.03 1.96v1.93a2 2 0 0 1 1.96-1.93h4.04a2 2 0 0 1 1.97 1.96v6.06a2 2 0 0 1-1.97 1.96Z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg">Vendor Management</h3>
                <p className="opacity-80">Easily find and manage vendors for all your event needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}