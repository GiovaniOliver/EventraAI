import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vendor, EventVendor, Event } from '@shared/schema';
import { getVendors, getEventVendors, addVendorToEvent } from '@/lib/vendor-service';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, DollarSign, FileText, Phone, Mail, Globe, Star } from 'lucide-react';

// Define form schema for adding vendor to event
const addVendorSchema = z.object({
  vendorId: z.string().min(1, 'Please select a vendor'),
  budget: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  notes: z.string().optional(),
  status: z.string().default('pending')
});

type AddVendorFormValues = z.infer<typeof addVendorSchema>;

type EventVendorsProps = {
  event: Event;
};

export default function EventVendors({ event }: EventVendorsProps) {
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all vendors for dropdown
  const vendorsQuery = useQuery({
    queryKey: ['vendors'],
    queryFn: () => getVendors(),
  });

  // Get vendors assigned to this event
  const eventVendorsQuery = useQuery({
    queryKey: ['event-vendors', event.id],
    queryFn: () => getEventVendors(event.id),
  });

  // Add vendor to event mutation
  const addVendorMutation = useMutation({
    mutationFn: (data: { vendorId: number, budget?: number, notes?: string, status?: string }) => 
      addVendorToEvent(event.id, data),
    onSuccess: () => {
      toast({
        title: 'Vendor added',
        description: 'Vendor has been successfully added to the event.',
      });
      queryClient.invalidateQueries({ queryKey: ['event-vendors', event.id] });
      setAddVendorOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add vendor: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Form for adding vendor to event
  const form = useForm<AddVendorFormValues>({
    resolver: zodResolver(addVendorSchema),
    defaultValues: {
      vendorId: '',
      budget: '',
      notes: '',
      status: 'pending',
    },
  });

  // Handle form submission
  const onSubmit = (values: AddVendorFormValues) => {
    addVendorMutation.mutate({
      vendorId: parseInt(values.vendorId),
      budget: values.budget,
      notes: values.notes,
      status: values.status,
    });
  };

  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render stars for rating
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

  // Get remaining vendors (not already assigned to event)
  const getAvailableVendors = () => {
    if (!vendorsQuery.data || !eventVendorsQuery.data) return [];
    
    const assignedVendorIds = new Set(
      eventVendorsQuery.data.map(ev => ev.vendorId)
    );
    
    return vendorsQuery.data.filter(vendor => !assignedVendorIds.has(vendor.id));
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Event Vendors</h2>
        <Button 
          onClick={() => setAddVendorOpen(true)} 
          disabled={getAvailableVendors().length === 0}
        >
          <PlusCircle size={18} className="mr-2" /> Add Vendor
        </Button>
      </div>

      {eventVendorsQuery.isLoading ? (
        <div className="text-center py-8">Loading vendors...</div>
      ) : eventVendorsQuery.error ? (
        <div className="text-center py-8 text-red-500">
          Error loading vendors: {eventVendorsQuery.error.message}
        </div>
      ) : eventVendorsQuery.data?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No vendors added to this event yet. Add vendors to help organize your event.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventVendorsQuery.data?.map((eventVendor) => (
            <Card key={eventVendor.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{eventVendor.vendor?.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Badge variant="outline">{eventVendor.vendor?.category}</Badge>
                      <Badge 
                        className="ml-2" 
                        variant={
                          eventVendor.status === 'confirmed' ? 'default' :
                          eventVendor.status === 'cancelled' ? 'destructive' : 'secondary'
                        }
                      >
                        {eventVendor.status.charAt(0).toUpperCase() + eventVendor.status.slice(1)}
                      </Badge>
                      {renderStars(eventVendor.vendor?.rating || null)}
                    </CardDescription>
                  </div>
                  
                  {eventVendor.vendor?.logo && (
                    <div className="h-10 w-10 flex-shrink-0">
                      <img 
                        src={eventVendor.vendor.logo} 
                        alt={`${eventVendor.vendor.name} logo`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {eventVendor.budget !== null && (
                    <div className="flex items-center text-sm">
                      <DollarSign size={16} className="mr-2 text-gray-500" />
                      <span>Budget: {formatCurrency(eventVendor.budget)}</span>
                    </div>
                  )}
                  
                  {eventVendor.notes && (
                    <div className="flex items-start text-sm">
                      <FileText size={16} className="mr-2 mt-1 text-gray-500 flex-shrink-0" />
                      <span>{eventVendor.notes}</span>
                    </div>
                  )}
                  
                  {eventVendor.vendor?.contactPhone && (
                    <div className="flex items-center text-sm">
                      <Phone size={16} className="mr-2 text-gray-500" />
                      <a href={`tel:${eventVendor.vendor.contactPhone}`} className="text-blue-600 hover:underline">
                        {eventVendor.vendor.contactPhone}
                      </a>
                    </div>
                  )}
                  
                  {eventVendor.vendor?.contactEmail && (
                    <div className="flex items-center text-sm">
                      <Mail size={16} className="mr-2 text-gray-500" />
                      <a href={`mailto:${eventVendor.vendor.contactEmail}`} className="text-blue-600 hover:underline">
                        {eventVendor.vendor.contactEmail}
                      </a>
                    </div>
                  )}
                  
                  {eventVendor.vendor?.website && (
                    <div className="flex items-center text-sm">
                      <Globe size={16} className="mr-2 text-gray-500" />
                      <a 
                        href={eventVendor.vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {eventVendor.vendor.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Vendor Dialog */}
      <Dialog open={addVendorOpen} onOpenChange={setAddVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor to Event</DialogTitle>
            <DialogDescription>
              Assign a vendor to your event and specify details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableVendors().map(vendor => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name} ({vendor.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select from available vendors or <a 
                        href="/vendors" 
                        className="text-blue-600 underline" 
                        target="_blank"
                        rel="noopener noreferrer"
                      >add a new one</a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter budget amount" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Budget allocated for this vendor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add notes about this vendor for the event" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting || addVendorMutation.isPending}>
                  {form.formState.isSubmitting || addVendorMutation.isPending ? "Adding..." : "Add Vendor"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}