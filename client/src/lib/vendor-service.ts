import { Vendor, EventVendor } from '@shared/schema';
import { apiRequest } from './queryClient';

/**
 * Fetch all vendors or filter by criteria
 */
export async function getVendors(options?: {
  category?: string;
  isPartner?: boolean;
  userId?: number;
}): Promise<Vendor[]> {
  let url = '/api/vendors';
  const params = new URLSearchParams();
  
  if (options) {
    if (options.category) params.append('category', options.category);
    if (options.isPartner !== undefined) params.append('isPartner', options.isPartner.toString());
    if (options.userId !== undefined) params.append('userId', options.userId.toString());
  }
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  return apiRequest<Vendor[]>({
    url,
    method: 'GET',
  });
}

/**
 * Fetch partner vendors
 */
export async function getPartnerVendors(): Promise<Vendor[]> {
  return apiRequest<Vendor[]>({
    url: '/api/vendors/partners',
    method: 'GET',
  });
}

/**
 * Fetch a single vendor by ID
 */
export async function getVendor(vendorId: number): Promise<Vendor> {
  return apiRequest<Vendor>({
    url: `/api/vendors/${vendorId}`,
    method: 'GET',
  });
}

/**
 * Create a new vendor
 */
export async function createVendor(vendorData: any): Promise<Vendor> {
  return apiRequest<Vendor>({
    url: '/api/vendors',
    method: 'POST',
    data: vendorData,
  });
}

/**
 * Update an existing vendor
 */
export async function updateVendor(vendorId: number, vendorData: any): Promise<Vendor> {
  return apiRequest<Vendor>({
    url: `/api/vendors/${vendorId}`,
    method: 'PATCH',
    data: vendorData,
  });
}

/**
 * Delete a vendor
 */
export async function deleteVendor(vendorId: number): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>({
    url: `/api/vendors/${vendorId}`,
    method: 'DELETE',
  });
}

/**
 * Get vendors assigned to an event
 */
export async function getEventVendors(eventId: number): Promise<(EventVendor & { vendor?: Vendor })[]> {
  return apiRequest<(EventVendor & { vendor?: Vendor })[]>({
    url: `/api/events/${eventId}/vendors`,
    method: 'GET',
  });
}

/**
 * Add a vendor to an event
 */
export async function addVendorToEvent(eventId: number, data: {
  vendorId: number;
  budget?: number;
  notes?: string;
  status?: string;
}): Promise<EventVendor> {
  return apiRequest<EventVendor>({
    url: `/api/events/${eventId}/vendors`,
    method: 'POST',
    data,
  });
}

/**
 * Update vendor assignment for an event
 */
export async function updateEventVendor(
  eventId: number,
  eventVendorId: number,
  data: {
    budget?: number;
    notes?: string;
    status?: string;
  }
): Promise<EventVendor> {
  return apiRequest<EventVendor>({
    url: `/api/events/${eventId}/vendors/${eventVendorId}`,
    method: 'PATCH',
    data,
  });
}

/**
 * Remove vendor from event
 */
export async function removeVendorFromEvent(
  eventId: number,
  eventVendorId: number
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>({
    url: `/api/events/${eventId}/vendors/${eventVendorId}`,
    method: 'DELETE',
  });
}