import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface RouteParams {
  params: {
    eventId: string
  }
}

interface CloneResult {
  success: boolean
  count?: number
  total?: number
  error?: string
}

interface CloneResults {
  [key: string]: CloneResult
}

/**
 * POST /api/events/:id/clone - Clone existing event
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
    
    // Get options for cloning from request body
    const { 
      includeVendors = true, 
      includeTasks = true, 
      includeBudget = true,
      includeFiles = false, // Default to false for files
      newName = '',
      newDate = ''
    } = await request.json()
    
    // Get the source event details
    const { data: sourceEvent, error: eventError } = await supabase
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
    if (sourceEvent.user_id !== userId) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized to clone this event' },
          { status: 403 }
        )
      }
    }
    
    // Create new event object with copied and modified values
    const now = new Date().toISOString()
    const newEvent = {
      ...sourceEvent,
      id: undefined, // Remove ID to generate new one
      name: newName || `Copy of ${sourceEvent.name}`,
      date: newDate || sourceEvent.date,
      created_at: now,
      updated_at: now,
      user_id: userId, // Set current user as owner
      status: 'planning', // Reset status to planning
      published: false, // Reset published status
    }
    
    // Insert the new event
    const { data: clonedEvent, error: insertError } = await supabase
      .from('events')
      .insert(newEvent)
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }
    
    // Clone additional data based on options
    const clonePromises = []
    
    // Clone vendors if requested
    if (includeVendors) {
      const vendorPromise = supabase
        .from('event_vendors')
        .select('*')
        .eq('event_id', eventId)
        .then(async ({ data: vendors, error: vendorError }) => {
          if (vendorError || !vendors || vendors.length === 0) {
            return { success: true, count: 0 }
          }
          
          const newVendors = vendors.map(vendor => ({
            ...vendor,
            id: undefined,
            event_id: clonedEvent.id,
            created_at: now
          }))
          
          const { error: insertVendorError } = await supabase
            .from('event_vendors')
            .insert(newVendors)
          
          return { 
            success: !insertVendorError, 
            count: vendors.length,
            error: insertVendorError?.message
          }
        })
      
      clonePromises.push({ type: 'vendors', promise: vendorPromise })
    }
    
    // Clone tasks if requested
    if (includeTasks) {
      const taskPromise = supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId)
        .then(async ({ data: tasks, error: taskError }) => {
          if (taskError || !tasks || tasks.length === 0) {
            return { success: true, count: 0 }
          }
          
          const newTasks = tasks.map(task => ({
            ...task,
            id: undefined,
            event_id: clonedEvent.id,
            created_at: now,
            completed: false, // Reset completion status
            assigned_to: null // Reset assignment
          }))
          
          const { error: insertTaskError } = await supabase
            .from('tasks')
            .insert(newTasks)
          
          return { 
            success: !insertTaskError, 
            count: tasks.length,
            error: insertTaskError?.message
          }
        })
      
      clonePromises.push({ type: 'tasks', promise: taskPromise })
    }
    
    // Clone budget if requested
    if (includeBudget) {
      const budgetPromise = supabase
        .from('budget_items')
        .select('*')
        .eq('event_id', eventId)
        .then(async ({ data: budgetItems, error: budgetError }) => {
          if (budgetError || !budgetItems || budgetItems.length === 0) {
            return { success: true, count: 0 }
          }
          
          const newBudgetItems = budgetItems.map(item => ({
            ...item,
            id: undefined,
            event_id: clonedEvent.id,
            created_at: now,
            paid: false, // Reset paid status
            payment_date: null // Reset payment date
          }))
          
          const { error: insertBudgetError } = await supabase
            .from('budget_items')
            .insert(newBudgetItems)
          
          return { 
            success: !insertBudgetError, 
            count: budgetItems.length,
            error: insertBudgetError?.message
          }
        })
      
      clonePromises.push({ type: 'budget', promise: budgetPromise })
    }
    
    // Clone files if requested
    if (includeFiles) {
      const filePromise = supabase
        .from('event_files')
        .select('*')
        .eq('event_id', eventId)
        .then(async ({ data: files, error: fileError }) => {
          if (fileError || !files || files.length === 0) {
            return { success: true, count: 0 }
          }
          
          // For files, we need to copy the actual files in storage
          const fileResults = await Promise.all(files.map(async (file) => {
            try {
              // Create new path for copied file
              const originalPath = file.file_path
              const newPath = originalPath.replace(
                eventId, 
                clonedEvent.id
              )
              
              // Copy file in storage
              const { error: copyError } = await supabase
                .storage
                .from('event-files')
                .copy(originalPath, newPath)
              
              if (copyError) {
                return { success: false, error: copyError.message }
              }
              
              // Create new file record
              const newFile = {
                ...file,
                id: undefined,
                event_id: clonedEvent.id,
                file_path: newPath,
                created_at: now,
                uploaded_by: userId
              }
              
              const { error: insertFileError } = await supabase
                .from('event_files')
                .insert(newFile)
              
              return { 
                success: !insertFileError, 
                error: insertFileError?.message 
              }
            } catch (err) {
              return { success: false, error: 'File copy failed' }
            }
          }))
          
          const successCount = fileResults.filter(r => r.success).length
          
          return { 
            success: successCount > 0, 
            count: successCount,
            total: files.length
          }
        })
      
      clonePromises.push({ type: 'files', promise: filePromise })
    }
    
    // Wait for all clone operations to complete
    const cloneResults: CloneResults = {}
    
    for (const { type, promise } of clonePromises) {
      try {
        cloneResults[type] = await promise
      } catch (error: any) {
        console.error(`Error cloning ${type}:`, error)
        cloneResults[type] = { success: false, error: error.message || 'Unknown error' }
      }
    }
    
    return NextResponse.json({
      event: clonedEvent,
      cloneResults
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error cloning event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clone event' },
      { status: 500 }
    )
  }
} 