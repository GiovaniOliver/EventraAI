import { api } from './api';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  description?: string;
  contact_email?: string;
  website?: string;
  is_partner: boolean;
  is_approved: boolean;
  logo?: string;
  services: any[];
  rating?: number;
  featured?: boolean;
  user_id?: string;
  created_at: string;
}

export interface EventVendor {
  id: string;
  event_id: string;
  vendor_id: string;
  budget?: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

/**
 * Fetch all vendors or filter by criteria
 */
export async function getVendors(options?: {
  category?: string;
  isPartner?: boolean;
  userId?: string;
}): Promise<Vendor[]> {
  let endpoint = '/api/vendors';
  const params = new URLSearchParams();
  
  if (options) {
    if (options.category) params.append('category', options.category);
    if (options.isPartner !== undefined) params.append('isPartner', options.isPartner.toString());
    if (options.userId !== undefined) params.append('userId', options.userId);
  }
  
  const queryString = params.toString();
  if (queryString) endpoint += `?${queryString}`;
  
  return api.get<Vendor[]>(endpoint);
}

/**
 * Fetch partner vendors
 */
export async function getPartnerVendors(): Promise<Vendor[]> {
  return api.get<Vendor[]>('/api/vendors/partners');
}

/**
 * Fetch a single vendor by ID
 */
export async function getVendor(vendorId: string): Promise<Vendor> {
  return api.get<Vendor>(`/api/vendors/${vendorId}`);
}

/**
 * Create a new vendor
 */
export async function createVendor(vendorData: Partial<Vendor>): Promise<Vendor> {
  return api.post<Vendor>('/api/vendors', vendorData);
}

/**
 * Update an existing vendor
 */
export async function updateVendor(vendorId: string, vendorData: Partial<Vendor>): Promise<Vendor> {
  return api.patch<Vendor>(`/api/vendors/${vendorId}`, vendorData);
}

/**
 * Delete a vendor
 */
export async function deleteVendor(vendorId: string): Promise<{ success: boolean }> {
  return api.delete<{ success: boolean }>(`/api/vendors/${vendorId}`);
}

/**
 * Get vendors assigned to an event
 */
export async function getEventVendors(eventId: string): Promise<EventVendor[]> {
  return api.get<EventVendor[]>(`/api/events/${eventId}/vendors`);
}

/**
 * Add a vendor to an event
 */
export async function addVendorToEvent(eventId: string, data: {
  vendorId: string;
  budget?: number;
  notes?: string;
  status?: string;
}): Promise<EventVendor> {
  return api.post<EventVendor>(`/api/events/${eventId}/vendors`, data);
}

/**
 * Update vendor assignment for an event
 */
export async function updateEventVendor(
  eventId: string,
  eventVendorId: string,
  data: {
    budget?: number;
    notes?: string;
    status?: string;
  }
): Promise<EventVendor> {
  return api.patch<EventVendor>(
    `/api/events/${eventId}/vendors/${eventVendorId}`, 
    data
  );
}

/**
 * Remove vendor from event
 */
export async function removeVendorFromEvent(
  eventId: string,
  eventVendorId: string
): Promise<{ success: boolean }> {
  return api.delete<{ success: boolean }>(
    `/api/events/${eventId}/vendors/${eventVendorId}`
  );
} 