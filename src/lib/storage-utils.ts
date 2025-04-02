import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * Get a signed URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns The signed URL or null if an error occurs
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) {
      console.error(`Error getting signed URL for ${bucket}/${path}:`, error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error(`Error in getSignedUrl for ${bucket}/${path}:`, error);
    return null;
  }
}

/**
 * Upload a file to Supabase storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param file The file to upload
 * @param options Additional upload options
 * @returns The uploaded file path or null if an error occurs
 */
export async function uploadFile(
  bucket: string, 
  path: string, 
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert || false
      });
    
    if (error) {
      console.error(`Error uploading file to ${bucket}/${path}:`, error);
      return null;
    }
    
    return data.path;
  } catch (error) {
    console.error(`Error in uploadFile to ${bucket}/${path}:`, error);
    return null;
  }
}

/**
 * Delete a file from Supabase storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns True if deleted successfully, false otherwise
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error(`Error deleting file ${bucket}/${path}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteFile for ${bucket}/${path}:`, error);
    return false;
  }
}

/**
 * Get a public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The public URL or null if an error occurs
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  try {
    // Since this doesn't require authentication, we don't need cookies
    const supabase = createServerClient();
    
    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  } catch (error) {
    console.error(`Error getting public URL for ${bucket}/${path}:`, error);
    return null;
  }
} 