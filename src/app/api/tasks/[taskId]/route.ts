import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/tasks/[taskId] - Get a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const taskId = params.taskId;
  const supabase = createServerClient();
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get task with event information for authorization check
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        events:event_id (
          id,
          owner_id
        )
      `)
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the task (owner or team member)
    if (task.events.owner_id !== userId) {
      // Check if user is a team member
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('id')
        .eq('event_id', task.event_id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized access to task' },
          { status: 403 }
        );
      }
    }
    
    // Get user information for assigned_to if present
    if (task.assigned_to) {
      const { data: assignee, error: assigneeError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', task.assigned_to)
        .single();
      
      if (!assigneeError && assignee) {
        task.assignee = assignee;
      }
    }
    
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[taskId] - Update a task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const taskId = params.taskId;
  const supabase = createServerClient();
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get the task to check permissions
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        events:event_id (
          id,
          owner_id
        )
      `)
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the task (owner or team member)
    let isTeamMember = false;
    
    if (task.events.owner_id !== userId) {
      // Check if user is a team member
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('id')
        .eq('event_id', task.event_id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized access to task' },
          { status: 403 }
        );
      }
      
      isTeamMember = true;
    }
    
    // Get the request data
    const requestData = await request.json();
    
    // Fields that can be updated
    const allowedFields = [
      'title',
      'description',
      'due_date',
      'priority',
      'status',
      'category'
    ];
    
    // Additional fields allowed only for event owner
    const ownerOnlyFields = [
      'assigned_to'
    ];
    
    // Filter out fields that cannot be updated
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (field in requestData) {
        updateData[field] = requestData[field];
      }
    }
    
    // Add owner-only fields if the user is the event owner
    if (!isTeamMember) {
      for (const field of ownerOnlyFields) {
        if (field in requestData) {
          updateData[field] = requestData[field];
        }
      }
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }
    
    // Log task update activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        event_id: task.event_id,
        activity_type: 'task_update',
        details: {
          task_id: taskId,
          task_title: updatedTask.title,
          changes: Object.keys(updateData).filter(k => k !== 'updated_at')
        },
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[taskId] - Delete a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const taskId = params.taskId;
  const supabase = createServerClient();
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get the task to check permissions and for activity logging
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        events:event_id (
          id,
          owner_id
        )
      `)
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to delete the task (owner only)
    if (task.events.owner_id !== userId) {
      // Check if user is an admin team member with delete permissions
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('role, permissions')
        .eq('event_id', task.event_id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (teamError || !teamMember || 
         (teamMember.role !== 'admin' && 
          (!teamMember.permissions || !teamMember.permissions.includes('delete_tasks')))) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this task' },
          { status: 403 }
        );
      }
    }
    
    // Delete the task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      );
    }
    
    // Log task deletion activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        event_id: task.event_id,
        activity_type: 'task_delete',
        details: {
          task_id: taskId,
          task_title: task.title
        },
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json({ 
      success: true,
      message: 'Task deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
} 