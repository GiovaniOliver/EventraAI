import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface RouteParams {
  params: {
    eventId: string
    fileId: string
  }
}

/**
 * GET /api/events/:id/files/:fileId - Download a file
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { eventId, fileId } = params
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
    
    // Get file details
    const { data: file, error: fileError } = await supabase
      .from('event_files')
      .select('*')
      .eq('id', fileId)
      .eq('event_id', eventId)
      .single()
    
    if (fileError) {
      if (fileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: fileError.message },
        { status: 500 }
      )
    }
    
    // Create download URL with long expiration (direct download)
    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from('event-files')
      .createSignedUrl(file.file_path, 60 * 60 * 24) // 24 hour expiration for download
    
    if (downloadError) {
      return NextResponse.json(
        { error: downloadError.message },
        { status: 500 }
      )
    }
    
    if (!downloadData?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      )
    }
    
    // Log the download activity
    await supabase
      .from('event_activity')
      .insert({
        event_id: eventId,
        user_id: userId,
        activity_type: 'file_downloaded',
        details: {
          file_id: fileId,
          file_name: file.file_name
        },
        created_at: new Date().toISOString()
      })
    
    // Either redirect to the signed URL or return it as JSON
    const downloadMethod = request.nextUrl.searchParams.get('method')
    
    if (downloadMethod === 'redirect') {
      // Redirect to the signed URL for direct download
      return NextResponse.redirect(downloadData.signedUrl)
    } else {
      // Return the signed URL for client-side handling
      return NextResponse.json({
        file,
        download_url: downloadData.signedUrl
      })
    }
  } catch (error: any) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/:id/files/:fileId - Delete a file
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { eventId, fileId } = params
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
    let isOwner = event.user_id === userId
    
    if (!isOwner) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized to delete files for this event' },
          { status: 403 }
        )
      }
      
      // Only team members with 'admin' or 'editor' role can delete files
      if (teamMember.role !== 'admin' && teamMember.role !== 'editor') {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete files' },
          { status: 403 }
        )
      }
    }
    
    // Get file details
    const { data: file, error: fileError } = await supabase
      .from('event_files')
      .select('*')
      .eq('id', fileId)
      .eq('event_id', eventId)
      .single()
    
    if (fileError) {
      if (fileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: fileError.message },
        { status: 500 }
      )
    }
    
    // Additional permission check: only file uploader or event owner can delete
    if (!isOwner && file.uploaded_by !== userId) {
      // Check if user is admin
      const { data: teamMemberRole, error: teamRoleError } = await supabase
        .from('event_team')
        .select('role')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamRoleError || !teamMemberRole || teamMemberRole.role !== 'admin') {
        return NextResponse.json(
          { error: 'You can only delete files you uploaded unless you are the event owner or admin' },
          { status: 403 }
        )
      }
    }
    
    // First, delete the file record from the database
    const { error: deleteRecordError } = await supabase
      .from('event_files')
      .delete()
      .eq('id', fileId)
    
    if (deleteRecordError) {
      return NextResponse.json(
        { error: deleteRecordError.message },
        { status: 500 }
      )
    }
    
    // Then delete the actual file from storage
    const { error: deleteStorageError } = await supabase
      .storage
      .from('event-files')
      .remove([file.file_path])
    
    if (deleteStorageError) {
      console.error('Storage deletion failed, but database record was removed:', deleteStorageError)
    }
    
    // Log the deletion activity
    await supabase
      .from('event_activity')
      .insert({
        event_id: eventId,
        user_id: userId,
        activity_type: 'file_deleted',
        details: {
          file_id: fileId,
          file_name: file.file_name
        },
        created_at: new Date().toISOString()
      })
    
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: 500 }
    )
  }
} 