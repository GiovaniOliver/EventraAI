import OpenAI from 'openai';
import { createServerClient } from './supabase';
import { checkLimit, trackAiImageUsage } from './subscription-limiter';
import fs from 'fs';
import path from 'path';
import os from 'os';

// OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a themed venue visualization using OpenAI's DALL-E 3
 * @param userId - The user ID
 * @param eventId - The event ID
 * @param originalImagePath - Path to the original venue image in Supabase storage
 * @param theme - The desired theme for the visualization
 * @param eventType - The type of event
 * @param additionalPrompt - Optional additional prompt details
 * @returns Promise<string> - The path to the generated image in Supabase storage
 */
export async function generateVenueVisualization(
  userId: string,
  eventId: string,
  originalImagePath: string,
  theme: string,
  eventType: string,
  additionalPrompt?: string
): Promise<{ visualizationId: string; generatedImagePath: string }> {
  // Check user subscription limit
  await checkLimit(userId, 'ai_images');

  const supabase = createServerClient();

  // Get the original image URL with a temporary signed URL
  const { data: imageData } = await supabase.storage
    .from('venue-images')
    .createSignedUrl(originalImagePath, 60); // 60 seconds expiry

  if (!imageData || !imageData.signedUrl) {
    throw new Error('Failed to access original image');
  }

  // Create the venue visualization record (status: pending)
  const prompt = buildImagePrompt(theme, eventType, additionalPrompt);
  const { data: visualization, error: insertError } = await supabase
    .from('venue_visualizations')
    .insert({
      event_id: eventId,
      original_image_path: originalImagePath,
      theme,
      prompt,
      status: 'processing',
      generation_params: {
        model: 'dall-e-3',
        quality: 'hd',
        style: 'natural',
      },
    })
    .select()
    .single();

  if (insertError || !visualization) {
    throw new Error(`Failed to create visualization record: ${insertError?.message}`);
  }

  try {
    // Download the image and save it to a temporary file to use with OpenAI
    const imageBlob = await fetchImageAsBlob(imageData.signedUrl);
    const tempImagePath = await saveBlobToTempFile(imageBlob, 'original-venue.png');

    // Call OpenAI API to generate image
    const response = await openai.images.edit({
      model: 'dall-e-3',
      image: fs.createReadStream(tempImagePath),
      prompt,
      n: 1,
      size: '1024x1024',
    });

    // Remove the temporary file
    fs.unlinkSync(tempImagePath);

    // Check if we got a valid response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error('Invalid response from OpenAI');
    }

    // Download the generated image
    const generatedImageUrl = response.data[0].url;
    const generatedImageBlob = await fetchImageAsBlob(generatedImageUrl);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${eventId}/visualizations/${visualization.id}_${timestamp}.png`;
    
    // Save the generated image to another temporary file
    const tempGeneratedPath = await saveBlobToTempFile(generatedImageBlob, 'generated-venue.png');
    
    // Upload the generated image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('venue-visualizations')
      .upload(filename, fs.createReadStream(tempGeneratedPath), {
        contentType: 'image/png',
        upsert: true,
      });
      
    // Remove the temporary generated file
    fs.unlinkSync(tempGeneratedPath);

    if (uploadError) {
      throw new Error(`Failed to upload generated image: ${uploadError.message}`);
    }

    // Update the visualization record with the generated image path
    const { error: updateError } = await supabase
      .from('venue_visualizations')
      .update({
        generated_image_path: filename,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', visualization.id);

    if (updateError) {
      throw new Error(`Failed to update visualization record: ${updateError.message}`);
    }

    // Track the usage for subscription limits
    await trackAiImageUsage(userId, eventId, visualization.id);

    return {
      visualizationId: visualization.id,
      generatedImagePath: filename,
    };
  } catch (error) {
    // Update the visualization record with the error status
    await supabase
      .from('venue_visualizations')
      .update({
        status: 'failed',
        generation_params: {
          ...visualization.generation_params,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', visualization.id);

    throw error;
  }
}

/**
 * Helper function to save a Blob to a temporary file
 */
async function saveBlobToTempFile(blob: Blob, filename: string): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, filename);
  
  fs.writeFileSync(tempFilePath, buffer);
  return tempFilePath;
}

/**
 * Helper function to build consistent image prompts
 */
function buildImagePrompt(theme: string, eventType: string, additionalDetails?: string): string {
  let basePrompt = `Transform this venue into a ${theme} themed setting for a ${eventType}.`;
  
  // Add style details based on theme
  switch (theme.toLowerCase()) {
    case 'rustic':
      basePrompt += ' Apply a warm, natural decoration style with earthy colors, wooden elements, burlap, and twine accents.';
      break;
    case 'elegant':
      basePrompt += ' Apply a sophisticated decoration style with neutral colors, crystal elements, silk drapery, and subtle lighting.';
      break;
    case 'modern':
      basePrompt += ' Apply a clean, minimalist decoration style with bold geometric shapes, monochromatic colors, and sleek furniture.';
      break;
    case 'bohemian':
      basePrompt += ' Apply an eclectic decoration style with vibrant colors, mixed patterns, macramé, and abundant plants.';
      break;
    case 'vintage':
      basePrompt += ' Apply a nostalgic decoration style with antique elements, muted colors, lace details, and period-appropriate props.';
      break;
    case 'tropical':
      basePrompt += ' Apply a lively decoration style with bright colors, palm leaves, exotic flowers, and natural textures.';
      break;
    default:
      basePrompt += ` Apply decorations that emphasize the ${theme} theme with appropriate colors and elements.`;
  }
  
  // Add event-specific details
  switch (eventType.toLowerCase()) {
    case 'wedding':
      basePrompt += ' Include floral arrangements, an altar or ceremonial area, and elegant seating.';
      break;
    case 'conference':
      basePrompt += ' Include a stage or presentation area, professional seating arrangement, and technology integration.';
      break;
    case 'party':
      basePrompt += ' Include festive lighting, entertainment space, and social seating arrangements.';
      break;
    case 'workshop':
      basePrompt += ' Include collaborative workspace, interactive areas, and supplies stations.';
      break;
  }
  
  // Add additional custom details if provided
  if (additionalDetails) {
    basePrompt += ` ${additionalDetails}`;
  }
  
  // Add constraints to maintain structure
  basePrompt += ' Maintain the original structure and dimensions of the venue while enhancing with decorative elements. Keep the same general layout and architectural features intact.';
  
  return basePrompt;
}

/**
 * Helper function to fetch an image as a Blob
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Get all visualizations for an event
 */
export async function getEventVisualizations(eventId: string) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('venue_visualizations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to fetch visualizations: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get a specific visualization
 */
export async function getVisualization(visualizationId: string) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('venue_visualizations')
    .select('*')
    .eq('id', visualizationId)
    .single();
    
  if (error) {
    throw new Error(`Failed to fetch visualization: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete a visualization
 */
export async function deleteVisualization(visualizationId: string) {
  const supabase = createServerClient();
  
  // First get the visualization to get the file paths
  const { data: visualization, error: fetchError } = await supabase
    .from('venue_visualizations')
    .select('*')
    .eq('id', visualizationId)
    .single();
    
  if (fetchError || !visualization) {
    throw new Error(`Failed to fetch visualization: ${fetchError?.message}`);
  }
  
  // Delete the generated image if it exists
  if (visualization.generated_image_path) {
    const { error: deleteFileError } = await supabase.storage
      .from('venue-visualizations')
      .remove([visualization.generated_image_path]);
      
    if (deleteFileError) {
      console.error(`Failed to delete generated image: ${deleteFileError.message}`);
      // Continue with deletion anyway
    }
  }
  
  // Delete the visualization record
  const { error: deleteError } = await supabase
    .from('venue_visualizations')
    .delete()
    .eq('id', visualizationId);
    
  if (deleteError) {
    throw new Error(`Failed to delete visualization: ${deleteError.message}`);
  }
  
  return true;
} 