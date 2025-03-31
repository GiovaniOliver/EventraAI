import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface RouteParams {
  params: {
    eventId: string
  }
}

/**
 * GET /api/events/:id/files - List files for an event
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const eventId = params.eventId
  const supabase = createServerClient()
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check if event exists and user has access
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }
    
    // Check if user has access to the event
    if (event.user_id !== userId) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized to access files for this event' },
          { status: 403 }
        )
      }
    }
    
    // Get filter parameters
    const searchParams = request.nextUrl.searchParams
    const fileType = searchParams.get('type')
    
    // Get files for the event
    let query = supabase
      .from('event_files')
      .select('*, uploaded_by_user:uploaded_by(first_name, last_name)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    
    // Apply file type filter if provided
    if (fileType) {
      query = query.eq('file_type', fileType)
    }
    
    const { data: files, error: filesError } = await query
    
    if (filesError) {
      return NextResponse.json(
        { error: filesError.message },
        { status: 500 }
      )
    }
    
    // Get signed URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: signedUrl } = await supabase
          .storage
          .from('event-files')
          .createSignedUrl(file.file_path, 3600) // 1 hour expiration
        
        return {
          ...file,
          signed_url: signedUrl?.signedUrl
        }
      })
    )
    
    return NextResponse.json(filesWithUrls)
  } catch (error: any) {
    console.error('Error fetching event files:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event files' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/:id/files - Upload a file
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const eventId = params.eventId
  const supabase = createServerClient()
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check if event exists and user has access
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }
    
    // Check if user has access to the event
    if (event.user_id !== userId) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized to upload files for this event' },
          { status: 403 }
        )
      }
    }
    
    // Get form data with file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Get metadata
    const fileName = formData.get('fileName') as string || file.name
    const fileType = formData.get('fileType') as string || file.type
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || 'other'
    
    // Generate a unique file path
    const fileExt = fileName.split('.').pop()
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    const filePath = `${eventId}/${uniqueId}-${fileName}`
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('event-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }
    
    // Create file record in database
    const fileRecord = {
      event_id: eventId,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      description,
      category,
      uploaded_by: userId,
      created_at: new Date().toISOString()
    }
    
    const { data: fileData, error: fileError } = await supabase
      .from('event_files')
      .insert(fileRecord)
      .select()
      .single()
    
    if (fileError) {
      // If database insert fails, try to remove the uploaded file
      await supabase
        .storage
        .from('event-files')
        .remove([filePath])
      
      return NextResponse.json(
        { error: fileError.message },
        { status: 500 }
      )
    }
    
    // Get a signed URL for the file
    const { data: signedUrlData } = await supabase
      .storage
      .from('event-files')
      .createSignedUrl(filePath, 3600) // 1 hour expiration
    
    // Log the file upload activity
    await supabase
      .from('event_activity')
      .insert({
        event_id: eventId,
        user_id: userId,
        activity_type: 'file_uploaded',
        details: {
          file_id: fileData.id,
          file_name: fileName
        },
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      ...fileData,
      signed_url: signedUrlData?.signedUrl
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
} 