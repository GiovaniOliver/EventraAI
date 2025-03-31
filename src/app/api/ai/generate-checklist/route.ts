import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/ai/generate-checklist - Generate event planning checklist based on event details
 */
export async function POST(request: NextRequest) {
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
    
    // Get request data
    const {
      eventId,
      eventType,
      eventDate,
      guestCount,
      includeVendors = true,
      includeGuestManagement = true,
      includeMarketing = false,
      customTasks = []
    } = await request.json()
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }
    
    if (!eventDate) {
      return NextResponse.json(
        { error: 'Event date is required' },
        { status: 400 }
      )
    }
    
    // If eventId is provided, check if user has access to it
    let event = null
    if (eventId) {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('owner_id', userId)
        .maybeSingle()
      
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle()
      
      if ((eventError || !eventData) && (teamError || !teamMember)) {
        return NextResponse.json(
          { error: 'Event not found or unauthorized access' },
          { status: 404 }
        )
      }
      
      event = eventData
    }
    
    // Parse the event date
    const date = new Date(eventDate)
    
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }
    
    // Generate checklist items
    const checklistGroups = generateChecklist(
      eventType,
      date,
      guestCount,
      includeVendors,
      includeGuestManagement,
      includeMarketing,
      customTasks
    )
    
    // Log this suggestion for analytics
    await supabase
      .from('ai_suggestions')
      .insert({
        user_id: userId,
        event_id: eventId || null,
        suggestion_type: 'checklist',
        input_data: {
          eventType,
          eventDate,
          guestCount,
          includeVendors,
          includeGuestManagement,
          includeMarketing,
          customTasks
        },
        created_at: new Date().toISOString()
      })
    
    // If we have an eventId, we can create the tasks directly
    if (eventId && event) {
      // Flatten all tasks from all groups
      const allTasks: ChecklistTask[] = checklistGroups.reduce(
        (acc: ChecklistTask[], group: ChecklistGroup) => [...acc, ...group.tasks], 
        [] as ChecklistTask[]
      )
      
      // Format tasks for database insertion
      const tasksToInsert = allTasks.map((task: ChecklistTask) => ({
        event_id: eventId,
        title: task.title,
        description: task.description || '',
        due_date: task.dueDate || null,
        priority: task.priority || 'medium',
        category: task.category || 'general',
        assigned_to: null, // No assignment by default
        created_at: new Date().toISOString(),
        created_by: userId
      }))
      
      // Insert tasks in batches to avoid exceeding request size limits
      const BATCH_SIZE = 50
      for (let i = 0; i < tasksToInsert.length; i += BATCH_SIZE) {
        const batch = tasksToInsert.slice(i, i + BATCH_SIZE)
        await supabase.from('tasks').insert(batch)
      }
      
      return NextResponse.json({
        groups: checklistGroups,
        tasksCreated: tasksToInsert.length,
        eventId
      })
    }
    
    return NextResponse.json({
      groups: checklistGroups,
      totalTasks: checklistGroups.reduce((count, group) => count + group.tasks.length, 0)
    })
  } catch (error: any) {
    console.error('Error generating checklist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate checklist' },
      { status: 500 }
    )
  }
}

interface ChecklistTask {
  id: string
  title: string
  description?: string
  dueDate?: string
  category?: string
  priority?: 'high' | 'medium' | 'low'
  timeframe: 'immediate' | 'early' | 'mid' | 'late' | 'day-of' | 'post-event'
}

interface ChecklistGroup {
  id: string
  name: string
  description: string
  tasks: ChecklistTask[]
}

/**
 * Generate checklist based on event parameters
 */
function generateChecklist(
  eventType: string,
  eventDate: Date,
  guestCount: number = 50,
  includeVendors: boolean = true,
  includeGuestManagement: boolean = true,
  includeMarketing: boolean = false,
  customTasks: any[] = []
): ChecklistGroup[] {
  const groups: ChecklistGroup[] = []
  const checklistId = Date.now().toString()
  
  // Calculate timeframes based on event date
  const now = new Date()
  const daysDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // Determine planning phase
  let planningPhase: 'long-term' | 'medium-term' | 'short-term' | 'urgent'
  
  if (daysDiff > 180) { // More than 6 months
    planningPhase = 'long-term'
  } else if (daysDiff > 90) { // 3-6 months
    planningPhase = 'medium-term'
  } else if (daysDiff > 30) { // 1-3 months
    planningPhase = 'short-term'
  } else {
    planningPhase = 'urgent'
  }
  
  // Calculate key dates
  const oneYearBefore = new Date(eventDate)
  oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1)
  
  const sixMonthsBefore = new Date(eventDate)
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6)
  
  const threeMonthsBefore = new Date(eventDate)
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3)
  
  const oneMonthBefore = new Date(eventDate)
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1)
  
  const twoWeeksBefore = new Date(eventDate)
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14)
  
  const oneWeekBefore = new Date(eventDate)
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)
  
  const dayBefore = new Date(eventDate)
  dayBefore.setDate(dayBefore.getDate() - 1)
  
  const oneWeekAfter = new Date(eventDate)
  oneWeekAfter.setDate(oneWeekAfter.getDate() + 7)
  
  // Add custom tasks first
  if (customTasks.length > 0) {
    const customGroup: ChecklistGroup = {
      id: `${checklistId}-custom`,
      name: 'Custom Tasks',
      description: 'Your custom event tasks',
      tasks: customTasks.map((task, index) => ({
        id: `${checklistId}-custom-${index}`,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || null,
        category: 'custom',
        priority: task.priority || 'medium',
        timeframe: determineTimeframe(new Date(task.dueDate || eventDate), eventDate)
      }))
    }
    
    groups.push(customGroup)
  }
  
  // Common tasks for all event types
  const generalGroup: ChecklistGroup = {
    id: `${checklistId}-general`,
    name: 'General Planning',
    description: 'Essential tasks for planning your event',
    tasks: []
  }
  
  // General planning tasks
  generalGroup.tasks = [
    {
      id: `${checklistId}-general-1`,
      title: 'Define event goals and objectives',
      description: 'Clearly outline what you want to achieve with this event',
      dueDate: formatDate(Math.min(now.getTime(), oneYearBefore.getTime())),
      category: 'planning',
      priority: 'high',
      timeframe: 'immediate'
    },
    {
      id: `${checklistId}-general-2`,
      title: 'Create event budget',
      description: 'Establish your total budget and category allocations',
      dueDate: formatDate(Math.min(now.getTime(), oneYearBefore.getTime())),
      category: 'finance',
      priority: 'high',
      timeframe: 'immediate'
    },
    {
      id: `${checklistId}-general-3`,
      title: 'Select and book venue',
      description: 'Research, visit, and secure your event location',
      dueDate: formatDate(sixMonthsBefore),
      category: 'venue',
      priority: 'high',
      timeframe: 'early'
    }
  ]
  
  if (planningPhase === 'urgent') {
    // For urgent planning, add specific tasks
    generalGroup.tasks.push({
      id: `${checklistId}-general-urgent-1`,
      title: 'Create accelerated timeline',
      description: 'Develop a compressed planning schedule to meet your event date',
      dueDate: formatDate(now),
      category: 'planning',
      priority: 'high',
      timeframe: 'immediate'
    })
  }
  
  if (includeVendors) {
    generalGroup.tasks.push({
      id: `${checklistId}-general-vendors-1`,
      title: 'Research and select key vendors',
      description: 'Find and book essential service providers for your event',
      dueDate: formatDate(threeMonthsBefore),
      category: 'vendors',
      priority: 'high',
      timeframe: 'early'
    })
    
    generalGroup.tasks.push({
      id: `${checklistId}-general-vendors-2`,
      title: 'Confirm all vendor details and arrangements',
      description: 'Verify contracts, schedules, and requirements with all vendors',
      dueDate: formatDate(oneMonthBefore),
      category: 'vendors',
      priority: 'high',
      timeframe: 'mid'
    })
  }
  
  // Guest management tasks
  if (includeGuestManagement) {
    const guestGroup: ChecklistGroup = {
      id: `${checklistId}-guests`,
      name: 'Guest Management',
      description: 'Tasks related to invitations and guest experience',
      tasks: [
        {
          id: `${checklistId}-guests-1`,
          title: 'Create guest list',
          description: 'Compile names and contact information for all potential guests',
          dueDate: formatDate(threeMonthsBefore),
          category: 'guests',
          priority: 'high',
          timeframe: 'early'
        },
        {
          id: `${checklistId}-guests-2`,
          title: 'Send invitations',
          description: 'Distribute event invitations to all guests',
          dueDate: formatDate(twoMonthsBefore(eventDate)),
          category: 'guests',
          priority: 'high',
          timeframe: 'mid'
        },
        {
          id: `${checklistId}-guests-3`,
          title: 'Track RSVPs',
          description: 'Monitor and record guest responses',
          dueDate: formatDate(oneMonthBefore),
          category: 'guests',
          priority: 'medium',
          timeframe: 'mid'
        },
        {
          id: `${checklistId}-guests-4`,
          title: 'Finalize guest count',
          description: 'Confirm final number of attendees with vendors',
          dueDate: formatDate(oneWeekBefore),
          category: 'guests',
          priority: 'high',
          timeframe: 'late'
        }
      ]
    }
    
    groups.push(guestGroup)
  }
  
  // Add event-specific task groups
  switch (eventType.toLowerCase()) {
    case 'wedding':
      addWeddingTasks(groups, checklistId, eventDate, planningPhase)
      break
    case 'corporate':
      addCorporateTasks(groups, checklistId, eventDate, planningPhase, includeMarketing)
      break
    case 'conference':
      addConferenceTasks(groups, checklistId, eventDate, planningPhase, includeMarketing)
      break
    case 'birthday':
      addBirthdayTasks(groups, checklistId, eventDate, planningPhase)
      break
    default:
      // No specific tasks for other event types
  }
  
  // Day-of tasks for all events
  const dayOfGroup: ChecklistGroup = {
    id: `${checklistId}-day-of`,
    name: 'Day of Event',
    description: 'Tasks to complete on the event day',
    tasks: [
      {
        id: `${checklistId}-day-of-1`,
        title: 'Confirm vendor arrivals',
        description: 'Verify all vendors arrive and set up on schedule',
        dueDate: formatDate(eventDate),
        category: 'management',
        priority: 'high',
        timeframe: 'day-of'
      },
      {
        id: `${checklistId}-day-of-2`,
        title: 'Perform venue walk-through',
        description: 'Inspect the venue setup before guests arrive',
        dueDate: formatDate(eventDate),
        category: 'venue',
        priority: 'high',
        timeframe: 'day-of'
      },
      {
        id: `${checklistId}-day-of-3`,
        title: 'Manage guest welcome and check-in',
        description: 'Ensure smooth arrival process for all attendees',
        dueDate: formatDate(eventDate),
        category: 'guests',
        priority: 'high',
        timeframe: 'day-of'
      }
    ]
  }
  
  // Post-event tasks
  const postEventGroup: ChecklistGroup = {
    id: `${checklistId}-post-event`,
    name: 'Post-Event Tasks',
    description: 'Follow-up activities after your event',
    tasks: [
      {
        id: `${checklistId}-post-1`,
        title: 'Send thank you notes',
        description: 'Express appreciation to guests and key contributors',
        dueDate: formatDate(oneWeekAfter),
        category: 'follow-up',
        priority: 'medium',
        timeframe: 'post-event'
      },
      {
        id: `${checklistId}-post-2`,
        title: 'Collect and review feedback',
        description: 'Gather input from attendees and team members',
        dueDate: formatDate(oneWeekAfter),
        category: 'follow-up',
        priority: 'medium',
        timeframe: 'post-event'
      },
      {
        id: `${checklistId}-post-3`,
        title: 'Finalize vendor payments',
        description: 'Complete all outstanding payments to service providers',
        dueDate: formatDate(oneWeekAfter),
        category: 'finance',
        priority: 'high',
        timeframe: 'post-event'
      }
    ]
  }
  
  // Add groups in logical order
  groups.unshift(generalGroup) // Put general tasks first
  groups.push(dayOfGroup) // Day-of tasks next to last
  groups.push(postEventGroup) // Post-event tasks last
  
  return groups
}

// Helper function to add wedding-specific tasks
function addWeddingTasks(
  groups: ChecklistGroup[],
  checklistId: string,
  eventDate: Date,
  planningPhase: string
): void {
  const oneYearBefore = new Date(eventDate)
  oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1)
  
  const nineMonthsBefore = new Date(eventDate)
  nineMonthsBefore.setMonth(nineMonthsBefore.getMonth() - 9)
  
  const sixMonthsBefore = new Date(eventDate)
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6)
  
  const fourMonthsBefore = new Date(eventDate)
  fourMonthsBefore.setMonth(fourMonthsBefore.getMonth() - 4)
  
  const threeMonthsBefore = new Date(eventDate)
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3)
  
  const twoMonthsBefore = new Date(eventDate)
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2)
  
  const oneMonthBefore = new Date(eventDate)
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1)
  
  const weddingGroup: ChecklistGroup = {
    id: `${checklistId}-wedding`,
    name: 'Wedding Planning',
    description: 'Essential tasks for planning your wedding',
    tasks: [
      {
        id: `${checklistId}-wedding-1`,
        title: 'Choose wedding party members',
        description: 'Select your bridesmaids, groomsmen, and other key roles',
        dueDate: formatDate(nineMonthsBefore),
        category: 'planning',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-wedding-2`,
        title: 'Shop for wedding attire',
        description: 'Purchase or rent wedding dress, suits, and accessories',
        dueDate: formatDate(sixMonthsBefore),
        category: 'attire',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-wedding-3`,
        title: 'Book photographer and videographer',
        description: 'Secure professionals to document your special day',
        dueDate: formatDate(sixMonthsBefore),
        category: 'vendors',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-wedding-4`,
        title: 'Arrange catering and cake',
        description: 'Select food, beverages, and dessert options',
        dueDate: formatDate(fourMonthsBefore),
        category: 'food',
        priority: 'high',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-wedding-5`,
        title: 'Book entertainment',
        description: 'Secure DJ, band, or other entertainment options',
        dueDate: formatDate(fourMonthsBefore),
        category: 'entertainment',
        priority: 'medium',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-wedding-6`,
        title: 'Order flowers and decorations',
        description: 'Arrange for bouquets, centerpieces, and venue decor',
        dueDate: formatDate(threeMonthsBefore),
        category: 'decor',
        priority: 'medium',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-wedding-7`,
        title: 'Finalize ceremony details',
        description: 'Confirm officiant, readings, vows, and ceremony flow',
        dueDate: formatDate(twoMonthsBefore),
        category: 'ceremony',
        priority: 'high',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-wedding-8`,
        title: 'Create wedding timeline',
        description: 'Develop detailed schedule for the wedding day',
        dueDate: formatDate(oneMonthBefore),
        category: 'planning',
        priority: 'high',
        timeframe: 'late'
      }
    ]
  }
  
  groups.push(weddingGroup)
}

// Helper function to add corporate event tasks
function addCorporateTasks(
  groups: ChecklistGroup[],
  checklistId: string,
  eventDate: Date,
  planningPhase: string,
  includeMarketing: boolean
): void {
  const threeMonthsBefore = new Date(eventDate)
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3)
  
  const twoMonthsBefore = new Date(eventDate)
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2)
  
  const oneMonthBefore = new Date(eventDate)
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1)
  
  const twoWeeksBefore = new Date(eventDate)
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14)
  
  const corporateGroup: ChecklistGroup = {
    id: `${checklistId}-corporate`,
    name: 'Corporate Event Planning',
    description: 'Tasks specific to corporate events',
    tasks: [
      {
        id: `${checklistId}-corporate-1`,
        title: 'Establish event objectives',
        description: 'Define clear business goals for the event',
        dueDate: formatDate(threeMonthsBefore),
        category: 'planning',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-corporate-2`,
        title: 'Book keynote speakers',
        description: 'Secure main presenters and confirm their requirements',
        dueDate: formatDate(twoMonthsBefore),
        category: 'program',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-corporate-3`,
        title: 'Arrange for AV equipment',
        description: 'Secure audio-visual technology and support',
        dueDate: formatDate(oneMonthBefore),
        category: 'technical',
        priority: 'high',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-corporate-4`,
        title: 'Finalize presentation materials',
        description: 'Collect and review all slides and handouts',
        dueDate: formatDate(twoWeeksBefore),
        category: 'content',
        priority: 'high',
        timeframe: 'late'
      }
    ]
  }
  
  if (includeMarketing) {
    const marketingGroup: ChecklistGroup = {
      id: `${checklistId}-marketing`,
      name: 'Event Marketing',
      description: 'Tasks related to promoting your event',
      tasks: [
        {
          id: `${checklistId}-marketing-1`,
          title: 'Develop marketing strategy',
          description: 'Create comprehensive plan for event promotion',
          dueDate: formatDate(threeMonthsBefore),
          category: 'marketing',
          priority: 'high',
          timeframe: 'early'
        },
        {
          id: `${checklistId}-marketing-2`,
          title: 'Create event website/landing page',
          description: 'Develop online presence with event details',
          dueDate: formatDate(twoMonthsBefore),
          category: 'marketing',
          priority: 'high',
          timeframe: 'early'
        },
        {
          id: `${checklistId}-marketing-3`,
          title: 'Schedule social media campaign',
          description: 'Plan content calendar for event promotion',
          dueDate: formatDate(twoMonthsBefore),
          category: 'marketing',
          priority: 'medium',
          timeframe: 'mid'
        },
        {
          id: `${checklistId}-marketing-4`,
          title: 'Send email invitations/announcements',
          description: 'Distribute formal event information to target audience',
          dueDate: formatDate(oneMonthBefore),
          category: 'marketing',
          priority: 'high',
          timeframe: 'mid'
        }
      ]
    }
    
    groups.push(marketingGroup)
  }
  
  groups.push(corporateGroup)
}

// Helper function to add conference tasks
function addConferenceTasks(
  groups: ChecklistGroup[],
  checklistId: string,
  eventDate: Date,
  planningPhase: string,
  includeMarketing: boolean
): void {
  const sixMonthsBefore = new Date(eventDate)
  sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6)
  
  const fourMonthsBefore = new Date(eventDate)
  fourMonthsBefore.setMonth(fourMonthsBefore.getMonth() - 4)
  
  const threeMonthsBefore = new Date(eventDate)
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3)
  
  const twoMonthsBefore = new Date(eventDate)
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2)
  
  const oneMonthBefore = new Date(eventDate)
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1)
  
  const conferenceGroup: ChecklistGroup = {
    id: `${checklistId}-conference`,
    name: 'Conference Planning',
    description: 'Tasks specific to planning a successful conference',
    tasks: [
      {
        id: `${checklistId}-conference-1`,
        title: 'Develop conference program',
        description: 'Create schedule of sessions, workshops, and activities',
        dueDate: formatDate(sixMonthsBefore),
        category: 'program',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-conference-2`,
        title: 'Secure speakers and presenters',
        description: 'Confirm keynotes and session leaders',
        dueDate: formatDate(fourMonthsBefore),
        category: 'program',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-conference-3`,
        title: 'Set up registration system',
        description: 'Implement online platform for attendee registration',
        dueDate: formatDate(threeMonthsBefore),
        category: 'logistics',
        priority: 'high',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-conference-4`,
        title: 'Arrange accommodations',
        description: 'Secure hotel room blocks for attendees',
        dueDate: formatDate(threeMonthsBefore),
        category: 'logistics',
        priority: 'medium',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-conference-5`,
        title: 'Coordinate transportation',
        description: 'Arrange shuttles or other transportation options',
        dueDate: formatDate(twoMonthsBefore),
        category: 'logistics',
        priority: 'medium',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-conference-6`,
        title: 'Prepare attendee materials',
        description: 'Create badges, programs, and information packets',
        dueDate: formatDate(oneMonthBefore),
        category: 'materials',
        priority: 'medium',
        timeframe: 'late'
      }
    ]
  }
  
  // Additional technology tasks
  const techGroup: ChecklistGroup = {
    id: `${checklistId}-technology`,
    name: 'Technology & Equipment',
    description: 'Tasks related to technical aspects of the conference',
    tasks: [
      {
        id: `${checklistId}-tech-1`,
        title: 'Secure AV equipment',
        description: 'Arrange for projectors, screens, microphones, and speakers',
        dueDate: formatDate(twoMonthsBefore),
        category: 'technical',
        priority: 'high',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-tech-2`,
        title: 'Test presentation systems',
        description: 'Verify all AV equipment is working properly',
        dueDate: formatDate(oneMonthBefore),
        category: 'technical',
        priority: 'high',
        timeframe: 'late'
      },
      {
        id: `${checklistId}-tech-3`,
        title: 'Set up WiFi and internet access',
        description: 'Ensure reliable connectivity for all attendees',
        dueDate: formatDate(oneMonthBefore),
        category: 'technical',
        priority: 'high',
        timeframe: 'late'
      }
    ]
  }
  
  groups.push(conferenceGroup)
  groups.push(techGroup)
  
  if (includeMarketing) {
    const marketingGroup: ChecklistGroup = {
      id: `${checklistId}-marketing`,
      name: 'Conference Marketing',
      description: 'Tasks related to promoting your conference',
      tasks: [
        {
          id: `${checklistId}-marketing-1`,
          title: 'Develop conference branding',
          description: 'Create logo, theme, and visual identity',
          dueDate: formatDate(sixMonthsBefore),
          category: 'marketing',
          priority: 'high',
          timeframe: 'early'
        },
        {
          id: `${checklistId}-marketing-2`,
          title: 'Launch conference website',
          description: 'Publish site with program, speaker, and registration information',
          dueDate: formatDate(fourMonthsBefore),
          category: 'marketing',
          priority: 'high',
          timeframe: 'early'
        },
        {
          id: `${checklistId}-marketing-3`,
          title: 'Implement social media strategy',
          description: 'Execute phased social media campaign',
          dueDate: formatDate(threeMonthsBefore),
          category: 'marketing',
          priority: 'medium',
          timeframe: 'mid'
        },
        {
          id: `${checklistId}-marketing-4`,
          title: 'Create attendee communications',
          description: 'Develop email sequences for registered attendees',
          dueDate: formatDate(twoMonthsBefore),
          category: 'marketing',
          priority: 'medium',
          timeframe: 'mid'
        }
      ]
    }
    
    groups.push(marketingGroup)
  }
}

// Helper function to add birthday party tasks
function addBirthdayTasks(
  groups: ChecklistGroup[],
  checklistId: string,
  eventDate: Date,
  planningPhase: string
): void {
  const twoMonthsBefore = new Date(eventDate)
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2)
  
  const oneMonthBefore = new Date(eventDate)
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1)
  
  const twoWeeksBefore = new Date(eventDate)
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14)
  
  const oneWeekBefore = new Date(eventDate)
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)
  
  const birthdayGroup: ChecklistGroup = {
    id: `${checklistId}-birthday`,
    name: 'Birthday Party Planning',
    description: 'Tasks specific to planning a birthday celebration',
    tasks: [
      {
        id: `${checklistId}-birthday-1`,
        title: 'Choose party theme',
        description: 'Select decorations, colors, and overall party concept',
        dueDate: formatDate(twoMonthsBefore),
        category: 'planning',
        priority: 'medium',
        timeframe: 'early'
      },
      {
        id: `${checklistId}-birthday-2`,
        title: 'Order cake or desserts',
        description: 'Arrange for birthday cake or alternative desserts',
        dueDate: formatDate(twoWeeksBefore),
        category: 'food',
        priority: 'high',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-birthday-3`,
        title: 'Plan activities and games',
        description: 'Organize entertainment options for guests',
        dueDate: formatDate(twoWeeksBefore),
        category: 'entertainment',
        priority: 'medium',
        timeframe: 'mid'
      },
      {
        id: `${checklistId}-birthday-4`,
        title: 'Purchase decorations',
        description: 'Buy all party decor items',
        dueDate: formatDate(oneWeekBefore),
        category: 'decor',
        priority: 'medium',
        timeframe: 'late'
      },
      {
        id: `${checklistId}-birthday-5`,
        title: 'Buy/prepare party favors',
        description: 'Create thank-you gifts for guests',
        dueDate: formatDate(oneWeekBefore),
        category: 'gifts',
        priority: 'low',
        timeframe: 'late'
      }
    ]
  }
  
  groups.push(birthdayGroup)
}

// Helper functions
function formatDate(date: Date | number): string {
  if (typeof date === 'number') {
    date = new Date(date)
  }
  return date.toISOString().split('T')[0]
}

function twoMonthsBefore(date: Date): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() - 2)
  return result
}

function determineTimeframe(
  taskDate: Date,
  eventDate: Date
): 'immediate' | 'early' | 'mid' | 'late' | 'day-of' | 'post-event' {
  const daysDiff = Math.floor((eventDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) {
    return 'post-event'
  } else if (daysDiff === 0) {
    return 'day-of'
  } else if (daysDiff <= 14) {
    return 'late'
  } else if (daysDiff <= 60) {
    return 'mid'
  } else if (daysDiff <= 180) {
    return 'early'
  } else {
    return 'immediate'
  }
} 