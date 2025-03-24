import { Vendor, EventVendor } from "@shared/schema";
import { apiRequest } from "@lib/queryClient";

/**
 * Fetch all vendors or filter by criteria
 */
export async function getVendors(options?: {
  partnersOnly?: boolean;
  userId?: number;
  category?: string;
}): Promise<Vendor[]> {
  const params = new URLSearchParams();
  
  if (options?.partnersOnly) {
    params.append("partners", "true");
  }
  
  if (options?.userId) {
    params.append("userId", options.userId.toString());
  }
  
  if (options?.category) {
    params.append("category", options.category);
  }
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/api/vendors${queryString}`);
}

/**
 * Fetch a single vendor by ID
 */
export async function getVendor(vendorId: number): Promise<Vendor> {
  return apiRequest(`/api/vendors/${vendorId}`);
}

/**
 * Create a new vendor
 */
export async function createVendor(vendorData: any): Promise<Vendor> {
  return apiRequest("/api/vendors", {
    method: "POST",
    body: JSON.stringify(vendorData),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

/**
 * Update an existing vendor
 */
export async function updateVendor(vendorId: number, vendorData: any): Promise<Vendor> {
  return apiRequest(`/api/vendors/${vendorId}`, {
    method: "PUT",
    body: JSON.stringify(vendorData),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

/**
 * Delete a vendor
 */
export async function deleteVendor(vendorId: number): Promise<{ success: boolean }> {
  return apiRequest(`/api/vendors/${vendorId}`, {
    method: "DELETE"
  });
}

/**
 * Get vendors assigned to an event
 */
export async function getEventVendors(eventId: number): Promise<(EventVendor & { vendor?: Vendor })[]> {
  return apiRequest(`/api/events/${eventId}/vendors`);
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
  return apiRequest(`/api/events/${eventId}/vendors`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  });
}