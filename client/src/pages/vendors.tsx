import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vendor, InsertVendor, insertVendorSchema } from "@shared/schema";
import { getVendors, createVendor, updateVendor, deleteVendor } from "@lib/vendor-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Phone, Mail, Globe, Star, Edit, Trash2, PlusCircle } from "lucide-react";

// Extended schema with validation
const vendorFormSchema = insertVendorSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable(),
  services: z.any().optional()
});

type VendorFormData = z.infer<typeof vendorFormSchema>;

export default function Vendors() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get vendors based on active tab
  const vendorsQuery = useQuery({
    queryKey: ["vendors", activeTab],
    queryFn: async () => {
      switch (activeTab) {
        case "partners":
          return getVendors({ partnersOnly: true });
        case "mine":
          return getVendors({ userId: 1 }); // TODO: Get actual user ID from auth
        default:
          return getVendors();
      }
    }
  });
  
  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      toast({
        title: "Vendor created",
        description: "The vendor was created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsAddVendorOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create vendor: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateVendor(id, data),
    onSuccess: () => {
      toast({
        title: "Vendor updated",
        description: "The vendor was updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsAddVendorOpen(false);
      setEditingVendor(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update vendor: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      toast({
        title: "Vendor deleted",
        description: "The vendor was removed successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete vendor: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Form for adding/editing vendor
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      isPartner: false,
      services: []
    }
  });
  
  // Reset form when editing vendor changes
  useEffect(() => {
    if (editingVendor) {
      form.reset({
        name: editingVendor.name,
        category: editingVendor.category,
        description: editingVendor.description || "",
        contactEmail: editingVendor.contactEmail || "",
        contactPhone: editingVendor.contactPhone || "",
        website: editingVendor.website || "",
        isPartner: editingVendor.isPartner,
        services: editingVendor.services || [],
        logo: editingVendor.logo || "",
        rating: editingVendor.rating || undefined
      });
    } else {
      form.reset({
        name: "",
        category: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        isPartner: false,
        services: []
      });
    }
  }, [editingVendor, form]);
  
  // Handle form submission
  const onSubmit = async (data: VendorFormData) => {
    // Ensure services is an array
    if (typeof data.services === "string") {
      data.services = data.services.split(",").map(s => s.trim());
    }
    
    try {
      if (editingVendor) {
        await updateVendorMutation.mutateAsync({ id: editingVendor.id, data });
      } else {
        // Add owner ID for user-added vendors
        const vendorData = {
          ...data,
          ownerId: 1, // TODO: Replace with actual user ID from auth
          isPartner: false // User-added vendors are not partners by default
        };
        await createVendorMutation.mutateAsync(vendorData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsAddVendorOpen(true);
  };
  
  const handleAddNewVendor = () => {
    setEditingVendor(null);
    setIsAddVendorOpen(true);
  };
  
  const handleDeleteVendor = async (id: number) => {
    await deleteVendorMutation.mutateAsync(id);
  };
  
  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {Array(5).fill(0).map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };
  
  const renderVendorCard = (vendor: Vendor) => (
    <Card key={vendor.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{vendor.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Badge variant="outline">{vendor.category}</Badge>
              {vendor.isPartner && (
                <Badge className="ml-2" variant="secondary">Partner</Badge>
              )}
              {renderStars(vendor.rating)}
            </CardDescription>
          </div>
          
          {vendor.logo && (
            <div className="h-12 w-12 flex-shrink-0">
              <img 
                src={vendor.logo} 
                alt={`${vendor.name} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {vendor.description && (
          <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>
        )}
        
        <div className="grid grid-cols-1 gap-1 text-sm">
          {vendor.contactEmail && (
            <div className="flex items-center">
              <Mail size={16} className="mr-2 text-gray-500" />
              <a href={`mailto:${vendor.contactEmail}`} className="text-blue-600 hover:underline">
                {vendor.contactEmail}
              </a>
            </div>
          )}
          
          {vendor.contactPhone && (
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-gray-500" />
              <a href={`tel:${vendor.contactPhone}`} className="text-blue-600 hover:underline">
                {vendor.contactPhone}
              </a>
            </div>
          )}
          
          {vendor.website && (
            <div className="flex items-center">
              <Globe size={16} className="mr-2 text-gray-500" />
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {vendor.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
        </div>
        
        {vendor.services && vendor.services.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium">Services:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(vendor.services) && vendor.services.map((service, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end pt-2">
        {/* Only show edit/delete for user's vendors */}
        {(!vendor.isPartner || vendor.ownerId === 1) && ( // TODO: Replace with actual user ID check
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => handleEditVendor(vendor)}
            >
              <Edit size={16} className="mr-1" /> Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the vendor. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteVendor(vendor.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <Button onClick={handleAddNewVendor}>
          <PlusCircle size={18} className="mr-2" /> Add Vendor
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="partners">Partner Vendors</TabsTrigger>
          <TabsTrigger value="mine">My Vendors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {vendorsQuery.isLoading ? (
            <div className="text-center py-8">Loading vendors...</div>
          ) : vendorsQuery.error ? (
            <div className="text-center py-8 text-red-500">
              Error loading vendors: {vendorsQuery.error.message}
            </div>
          ) : vendorsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vendors found. Add your first vendor!
            </div>
          ) : (
            vendorsQuery.data?.map(renderVendorCard)
          )}
        </TabsContent>
        
        <TabsContent value="partners" className="space-y-4">
          {vendorsQuery.isLoading ? (
            <div className="text-center py-8">Loading partner vendors...</div>
          ) : vendorsQuery.error ? (
            <div className="text-center py-8 text-red-500">
              Error loading vendors: {vendorsQuery.error.message}
            </div>
          ) : vendorsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No partner vendors available.
            </div>
          ) : (
            vendorsQuery.data?.map(renderVendorCard)
          )}
        </TabsContent>
        
        <TabsContent value="mine" className="space-y-4">
          {vendorsQuery.isLoading ? (
            <div className="text-center py-8">Loading your vendors...</div>
          ) : vendorsQuery.error ? (
            <div className="text-center py-8 text-red-500">
              Error loading vendors: {vendorsQuery.error.message}
            </div>
          ) : vendorsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven't added any vendors yet. Add your first vendor!
            </div>
          ) : (
            vendorsQuery.data?.map(renderVendorCard)
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Vendor Dialog */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
            <DialogDescription>
              {editingVendor 
                ? "Update vendor information" 
                : "Add a new vendor to your collection"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Vendor name" {...field} />
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
                      <FormLabel>Category*</FormLabel>
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
                          <SelectItem value="catering">Catering</SelectItem>
                          <SelectItem value="venue">Venue</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="decor">Decor</SelectItem>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="vendor@example.com" {...field} value={field.value || ""} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Services</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Services offered (comma separated)" 
                          {...field} 
                          value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter services separated by commas (e.g., "Video recording, Live streaming")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the vendor and their services" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : editingVendor ? "Update Vendor" : "Add Vendor"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}