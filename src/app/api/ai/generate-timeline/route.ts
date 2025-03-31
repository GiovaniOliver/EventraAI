import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/ai/generate-timeline - Generate event timeline based on event details
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
      startTime,
      endTime,
      includeMeals = true,
      includeSetup = true,
      includeBreaks = true,
      customActivities = []
    } = await request.json()
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }
    
    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start and end times are required' },
        { status: 400 }
      )
    }
    
    // If eventId is provided, check if user has access to it
    if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .eq('owner_id', userId)
        .maybeSingle()
      
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle()
      
      if ((eventError || !event) && (teamError || !teamMember)) {
        return NextResponse.json(
          { error: 'Event not found or unauthorized access' },
          { status: 404 }
        )
      }
    }
    
    // Parse start and end times
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start or end time format' },
        { status: 400 }
      )
    }
    
    // Calculate event duration in hours
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    
    if (durationHours <= 0) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }
    
    // Get template timeline based on event type
    const timelineItems = generateTimelineItems(
      eventType,
      start,
      end,
      includeMeals,
      includeSetup,
      includeBreaks,
      customActivities
    )
    
    // Create response with timeline
    const timeline = {
      start: start.toISOString(),
      end: end.toISOString(),
      duration: durationHours,
      items: timelineItems
    }
    
    // Log this suggestion for analytics
    await supabase
      .from('ai_suggestions')
      .insert({
        user_id: userId,
        event_id: eventId || null,
        suggestion_type: 'timeline',
        input_data: {
          eventType,
          startTime,
          endTime,
          includeMeals,
          includeSetup,
          includeBreaks,
          customActivities
        },
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json(timeline)
  } catch (error: any) {
    console.error('Error generating timeline:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate timeline' },
      { status: 500 }
    )
  }
}

interface TimelineItem {
  id: string
  title: string
  startTime: string
  endTime: string
  duration: number
  type: string
  description?: string
  location?: string
  assigned?: string[]
}

/**
 * Generate timeline items based on event type and parameters
 */
function generateTimelineItems(
  eventType: string,
  start: Date,
  end: Date,
  includeMeals: boolean,
  includeSetup: boolean,
  includeBreaks: boolean,
  customActivities: any[]
): TimelineItem[] {
  const items: TimelineItem[] = []
  const timelineId = Date.now().toString()
  
  // Add custom activities first
  const customItems = customActivities.map((activity, index) => ({
    id: `${timelineId}-custom-${index}`,
    title: activity.title,
    startTime: new Date(activity.startTime).toISOString(),
    endTime: new Date(activity.endTime).toISOString(),
    duration: (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / (1000 * 60),
    type: activity.type || 'custom',
    description: activity.description || '',
    location: activity.location || ''
  }))
  
  items.push(...customItems)
  
  // Add setup time if requested
  if (includeSetup) {
    const setupStartTime = new Date(start)
    setupStartTime.setHours(setupStartTime.getHours() - 2)
    
    items.push({
      id: `${timelineId}-setup`,
      title: 'Setup',
      startTime: setupStartTime.toISOString(),
      endTime: start.toISOString(),
      duration: 120, // 2 hours in minutes
      type: 'setup',
      description: 'Prepare venue and setup for the event'
    })
  }
  
  // Generate timeline based on event type
  switch (eventType.toLowerCase()) {
    case 'wedding':
      generateWeddingTimeline(items, timelineId, start, end, includeMeals, includeBreaks)
      break
    case 'conference':
      generateConferenceTimeline(items, timelineId, start, end, includeMeals, includeBreaks)
      break
    case 'corporate':
      generateCorporateTimeline(items, timelineId, start, end, includeMeals, includeBreaks)
      break
    case 'birthday':
      generateBirthdayTimeline(items, timelineId, start, end, includeMeals, includeBreaks)
      break
    default:
      generateDefaultTimeline(items, timelineId, start, end, includeMeals, includeBreaks)
  }
  
  // Sort items by start time
  items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  
  return items
}

function generateWeddingTimeline(
  items: TimelineItem[],
  timelineId: string,
  start: Date,
  end: Date,
  includeMeals: boolean,
  includeBreaks: boolean
): void {
  const ceremonyStart = new Date(start)
  const ceremonyEnd = new Date(ceremonyStart)
  ceremonyEnd.setMinutes(ceremonyEnd.getMinutes() + 45)
  
  // Ceremony
  items.push({
    id: `${timelineId}-ceremony`,
    title: 'Wedding Ceremony',
    startTime: ceremonyStart.toISOString(),
    endTime: ceremonyEnd.toISOString(),
    duration: 45,
    type: 'ceremony',
    description: 'Wedding ceremony'
  })
  
  // Cocktail hour
  const cocktailStart = new Date(ceremonyEnd)
  const cocktailEnd = new Date(cocktailStart)
  cocktailEnd.setHours(cocktailEnd.getHours() + 1)
  
  items.push({
    id: `${timelineId}-cocktail`,
    title: 'Cocktail Hour',
    startTime: cocktailStart.toISOString(),
    endTime: cocktailEnd.toISOString(),
    duration: 60,
    type: 'reception',
    description: 'Drinks and appetizers while wedding party takes photos'
  })
  
  // Reception entrance
  const entranceStart = new Date(cocktailEnd)
  const entranceEnd = new Date(entranceStart)
  entranceEnd.setMinutes(entranceEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-entrance`,
    title: 'Grand Entrance',
    startTime: entranceStart.toISOString(),
    endTime: entranceEnd.toISOString(),
    duration: 30,
    type: 'reception',
    description: 'Introduction of the wedding party and newlyweds'
  })
  
  // Dinner
  if (includeMeals) {
    const dinnerStart = new Date(entranceEnd)
    const dinnerEnd = new Date(dinnerStart)
    dinnerEnd.setHours(dinnerEnd.getHours() + 1, dinnerEnd.getMinutes() + 30)
    
    items.push({
      id: `${timelineId}-dinner`,
      title: 'Dinner Service',
      startTime: dinnerStart.toISOString(),
      endTime: dinnerEnd.toISOString(),
      duration: 90,
      type: 'meal',
      description: 'Dinner service for all guests'
    })
    
    // Toasts during dinner
    const toastsStart = new Date(dinnerStart)
    toastsStart.setMinutes(toastsStart.getMinutes() + 30)
    const toastsEnd = new Date(toastsStart)
    toastsEnd.setMinutes(toastsEnd.getMinutes() + 30)
    
    items.push({
      id: `${timelineId}-toasts`,
      title: 'Toasts and Speeches',
      startTime: toastsStart.toISOString(),
      endTime: toastsEnd.toISOString(),
      duration: 30,
      type: 'speech',
      description: 'Toasts and speeches from the wedding party'
    })
    
    // First dance
    const danceStart = new Date(dinnerEnd)
    const danceEnd = new Date(danceStart)
    danceEnd.setMinutes(danceEnd.getMinutes() + 30)
    
    items.push({
      id: `${timelineId}-firstdance`,
      title: 'First Dance',
      startTime: danceStart.toISOString(),
      endTime: danceEnd.toISOString(),
      duration: 30,
      type: 'entertainment',
      description: 'First dance and parent dances'
    })
    
    // Open dancing
    const openDanceStart = new Date(danceEnd)
    const openDanceEnd = new Date(end)
    openDanceEnd.setMinutes(openDanceEnd.getMinutes() - 30)
    
    items.push({
      id: `${timelineId}-dancing`,
      title: 'Dancing',
      startTime: openDanceStart.toISOString(),
      endTime: openDanceEnd.toISOString(),
      duration: (openDanceEnd.getTime() - openDanceStart.getTime()) / (1000 * 60),
      type: 'entertainment',
      description: 'Open dance floor for all guests'
    })
    
    // Cake cutting
    const cakeStart = new Date(openDanceStart)
    cakeStart.setHours(cakeStart.getHours() + 1)
    const cakeEnd = new Date(cakeStart)
    cakeEnd.setMinutes(cakeEnd.getMinutes() + 15)
    
    items.push({
      id: `${timelineId}-cake`,
      title: 'Cake Cutting',
      startTime: cakeStart.toISOString(),
      endTime: cakeEnd.toISOString(),
      duration: 15,
      type: 'tradition',
      description: 'Cake cutting ceremony'
    })
    
    // Bouquet and garter toss
    const tossStart = new Date(openDanceStart)
    tossStart.setHours(tossStart.getHours() + 2)
    const tossEnd = new Date(tossStart)
    tossEnd.setMinutes(tossEnd.getMinutes() + 15)
    
    items.push({
      id: `${timelineId}-toss`,
      title: 'Bouquet & Garter Toss',
      startTime: tossStart.toISOString(),
      endTime: tossEnd.toISOString(),
      duration: 15,
      type: 'tradition',
      description: 'Traditional bouquet and garter toss'
    })
    
    // Send-off
    const sendOffStart = new Date(openDanceEnd)
    const sendOffEnd = new Date(end)
    
    items.push({
      id: `${timelineId}-sendoff`,
      title: 'Grand Send-Off',
      startTime: sendOffStart.toISOString(),
      endTime: sendOffEnd.toISOString(),
      duration: 30,
      type: 'closing',
      description: 'Farewell to the couple'
    })
  }
}

function generateConferenceTimeline(
  items: TimelineItem[],
  timelineId: string,
  start: Date,
  end: Date,
  includeMeals: boolean,
  includeBreaks: boolean
): void {
  // Registration
  const regStart = new Date(start)
  const regEnd = new Date(regStart)
  regEnd.setHours(regEnd.getHours() + 1)
  
  items.push({
    id: `${timelineId}-registration`,
    title: 'Registration & Check-in',
    startTime: regStart.toISOString(),
    endTime: regEnd.toISOString(),
    duration: 60,
    type: 'registration',
    description: 'Attendee registration and welcome packs'
  })
  
  // Welcome speech
  const welcomeStart = new Date(regEnd)
  const welcomeEnd = new Date(welcomeStart)
  welcomeEnd.setMinutes(welcomeEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-welcome`,
    title: 'Welcome & Introduction',
    startTime: welcomeStart.toISOString(),
    endTime: welcomeEnd.toISOString(),
    duration: 30,
    type: 'speech',
    description: 'Opening remarks and agenda overview'
  })
  
  // Calculate number of sessions based on duration
  const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  let numSessions = Math.floor(totalHours / 1.5) // Each session ~1.5 hours
  
  if (numSessions < 2) numSessions = 2
  if (numSessions > 6) numSessions = 6
  
  let currentTime = new Date(welcomeEnd)
  
  for (let i = 0; i < numSessions; i++) {
    // Session
    const sessionStart = new Date(currentTime)
    const sessionEnd = new Date(sessionStart)
    sessionEnd.setMinutes(sessionEnd.getMinutes() + 70)
    
    items.push({
      id: `${timelineId}-session-${i+1}`,
      title: `Session ${i+1}`,
      startTime: sessionStart.toISOString(),
      endTime: sessionEnd.toISOString(),
      duration: 70,
      type: 'session',
      description: `Conference session ${i+1}`
    })
    
    currentTime = new Date(sessionEnd)
    
    // Add breaks between sessions
    if (includeBreaks && i < numSessions - 1) {
      const breakStart = new Date(currentTime)
      const breakEnd = new Date(breakStart)
      breakEnd.setMinutes(breakEnd.getMinutes() + 20)
      
      items.push({
        id: `${timelineId}-break-${i+1}`,
        title: 'Networking Break',
        startTime: breakStart.toISOString(),
        endTime: breakEnd.toISOString(),
        duration: 20,
        type: 'break',
        description: 'Coffee and networking break'
      })
      
      currentTime = new Date(breakEnd)
    }
    
    // Add lunch in the middle
    if (includeMeals && i === Math.floor(numSessions / 2) - 1) {
      const lunchStart = new Date(currentTime)
      const lunchEnd = new Date(lunchStart)
      lunchEnd.setMinutes(lunchEnd.getMinutes() + 60)
      
      items.push({
        id: `${timelineId}-lunch`,
        title: 'Lunch Break',
        startTime: lunchStart.toISOString(),
        endTime: lunchEnd.toISOString(),
        duration: 60,
        type: 'meal',
        description: 'Lunch and networking'
      })
      
      currentTime = new Date(lunchEnd)
    }
  }
  
  // Closing remarks
  const closingStart = new Date(currentTime)
  const closingEnd = new Date(closingStart)
  closingEnd.setMinutes(closingEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-closing`,
    title: 'Closing Remarks',
    startTime: closingStart.toISOString(),
    endTime: closingEnd.toISOString(),
    duration: 30,
    type: 'speech',
    description: 'Closing statements and next steps'
  })
  
  // Networking reception if there's time
  if (closingEnd.getTime() < end.getTime() - 30 * 60 * 1000) {
    const receptionStart = new Date(closingEnd)
    const receptionEnd = new Date(end)
    
    items.push({
      id: `${timelineId}-reception`,
      title: 'Networking Reception',
      startTime: receptionStart.toISOString(),
      endTime: receptionEnd.toISOString(),
      duration: (receptionEnd.getTime() - receptionStart.getTime()) / (1000 * 60),
      type: 'networking',
      description: 'Post-conference reception and networking'
    })
  }
}

function generateCorporateTimeline(
  items: TimelineItem[],
  timelineId: string,
  start: Date,
  end: Date,
  includeMeals: boolean,
  includeBreaks: boolean
): void {
  // Similar pattern as conference but with more focus on business activities
  // This is a simplified implementation
  
  // Welcome coffee
  const coffeeStart = new Date(start)
  const coffeeEnd = new Date(coffeeStart)
  coffeeEnd.setMinutes(coffeeEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-coffee`,
    title: 'Welcome Coffee',
    startTime: coffeeStart.toISOString(),
    endTime: coffeeEnd.toISOString(),
    duration: 30,
    type: 'reception',
    description: 'Arrival coffee and networking'
  })
  
  // Introduction
  const introStart = new Date(coffeeEnd)
  const introEnd = new Date(introStart)
  introEnd.setMinutes(introEnd.getMinutes() + 20)
  
  items.push({
    id: `${timelineId}-intro`,
    title: 'Introduction & Agenda',
    startTime: introStart.toISOString(),
    endTime: introEnd.toISOString(),
    duration: 20,
    type: 'presentation',
    description: 'Welcome and overview of the day'
  })
  
  // Company update
  const updateStart = new Date(introEnd)
  const updateEnd = new Date(updateStart)
  updateEnd.setMinutes(updateEnd.getMinutes() + 45)
  
  items.push({
    id: `${timelineId}-update`,
    title: 'Company Update',
    startTime: updateStart.toISOString(),
    endTime: updateEnd.toISOString(),
    duration: 45,
    type: 'presentation',
    description: 'Business update and performance review'
  })
  
  // Morning break
  if (includeBreaks) {
    const breakStart = new Date(updateEnd)
    const breakEnd = new Date(breakStart)
    breakEnd.setMinutes(breakEnd.getMinutes() + 15)
    
    items.push({
      id: `${timelineId}-break1`,
      title: 'Coffee Break',
      startTime: breakStart.toISOString(),
      endTime: breakEnd.toISOString(),
      duration: 15,
      type: 'break',
      description: 'Refreshment break'
    })
    
    // Team activities
    const teamStart = new Date(breakEnd)
    const teamEnd = new Date(teamStart)
    teamEnd.setMinutes(teamEnd.getMinutes() + 90)
    
    items.push({
      id: `${timelineId}-team`,
      title: 'Team Building Activity',
      startTime: teamStart.toISOString(),
      endTime: teamEnd.toISOString(),
      duration: 90,
      type: 'activity',
      description: 'Interactive team building exercises'
    })
    
    // Lunch
    if (includeMeals) {
      const lunchStart = new Date(teamEnd)
      const lunchEnd = new Date(lunchStart)
      lunchEnd.setMinutes(lunchEnd.getMinutes() + 60)
      
      items.push({
        id: `${timelineId}-lunch`,
        title: 'Lunch',
        startTime: lunchStart.toISOString(),
        endTime: lunchEnd.toISOString(),
        duration: 60,
        type: 'meal',
        description: 'Catered lunch'
      })
      
      // Afternoon session
      const afternoonStart = new Date(lunchEnd)
      const afternoonEnd = new Date(afternoonStart)
      afternoonEnd.setMinutes(afternoonEnd.getMinutes() + 120)
      
      items.push({
        id: `${timelineId}-strategy`,
        title: 'Strategic Planning Session',
        startTime: afternoonStart.toISOString(),
        endTime: afternoonEnd.toISOString(),
        duration: 120,
        type: 'workshop',
        description: 'Strategy development and planning'
      })
      
      // Afternoon break
      if (includeBreaks) {
        const break2Start = new Date(afternoonEnd)
        const break2End = new Date(break2Start)
        break2End.setMinutes(break2End.getMinutes() + 15)
        
        items.push({
          id: `${timelineId}-break2`,
          title: 'Afternoon Break',
          startTime: break2Start.toISOString(),
          endTime: break2End.toISOString(),
          duration: 15,
          type: 'break',
          description: 'Short refreshment break'
        })
        
        // Closing session
        const closingStart = new Date(break2End)
        const closingEnd = new Date(closingStart)
        closingEnd.setMinutes(closingEnd.getMinutes() + 45)
        
        items.push({
          id: `${timelineId}-closing`,
          title: 'Action Planning & Next Steps',
          startTime: closingStart.toISOString(),
          endTime: closingEnd.toISOString(),
          duration: 45,
          type: 'workshop',
          description: 'Defining action items and responsibilities'
        })
        
        // Drinks reception
        const drinksStart = new Date(closingEnd)
        const drinksEnd = new Date(end)
        
        if (drinksEnd.getTime() - drinksStart.getTime() > 30 * 60 * 1000) {
          items.push({
            id: `${timelineId}-drinks`,
            title: 'Networking Drinks',
            startTime: drinksStart.toISOString(),
            endTime: drinksEnd.toISOString(),
            duration: (drinksEnd.getTime() - drinksStart.getTime()) / (1000 * 60),
            type: 'reception',
            description: 'Informal networking and drinks'
          })
        }
      }
    }
  }
}

function generateBirthdayTimeline(
  items: TimelineItem[],
  timelineId: string,
  start: Date,
  end: Date,
  includeMeals: boolean,
  includeBreaks: boolean
): void {
  // Guest arrival
  const arrivalStart = new Date(start)
  const arrivalEnd = new Date(arrivalStart)
  arrivalEnd.setMinutes(arrivalEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-arrival`,
    title: 'Guest Arrival',
    startTime: arrivalStart.toISOString(),
    endTime: arrivalEnd.toISOString(),
    duration: 30,
    type: 'reception',
    description: 'Guests arrive and mingle'
  })
  
  // Welcome and drinks
  const welcomeStart = new Date(arrivalEnd)
  const welcomeEnd = new Date(welcomeStart)
  welcomeEnd.setMinutes(welcomeEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-welcome`,
    title: 'Welcome Drinks',
    startTime: welcomeStart.toISOString(),
    endTime: welcomeEnd.toISOString(),
    duration: 30,
    type: 'reception',
    description: 'Welcome drinks and snacks'
  })
  
  // Main meal
  if (includeMeals) {
    const mealStart = new Date(welcomeEnd)
    const mealEnd = new Date(mealStart)
    mealEnd.setMinutes(mealEnd.getMinutes() + 60)
    
    items.push({
      id: `${timelineId}-meal`,
      title: 'Birthday Meal',
      startTime: mealStart.toISOString(),
      endTime: mealEnd.toISOString(),
      duration: 60,
      type: 'meal',
      description: 'Main birthday meal service'
    })
    
    // Cake and speeches
    const cakeStart = new Date(mealEnd)
    const cakeEnd = new Date(cakeStart)
    cakeEnd.setMinutes(cakeEnd.getMinutes() + 30)
    
    items.push({
      id: `${timelineId}-cake`,
      title: 'Cake & Speeches',
      startTime: cakeStart.toISOString(),
      endTime: cakeEnd.toISOString(),
      duration: 30,
      type: 'tradition',
      description: 'Birthday cake, singing, and speeches'
    })
    
    // Entertainment/activities
    const entertainmentStart = new Date(cakeEnd)
    const entertainmentEnd = new Date(entertainmentStart)
    entertainmentEnd.setMinutes(entertainmentEnd.getMinutes() + 90)
    
    items.push({
      id: `${timelineId}-entertainment`,
      title: 'Games & Entertainment',
      startTime: entertainmentStart.toISOString(),
      endTime: entertainmentEnd.toISOString(),
      duration: 90,
      type: 'entertainment',
      description: 'Party games and entertainment'
    })
    
    // Dancing/music
    const danceStart = new Date(entertainmentEnd)
    const danceEnd = new Date(end)
    
    if (danceEnd.getTime() - danceStart.getTime() > 30 * 60 * 1000) {
      items.push({
        id: `${timelineId}-dancing`,
        title: 'Music & Dancing',
        startTime: danceStart.toISOString(),
        endTime: danceEnd.toISOString(),
        duration: (danceEnd.getTime() - danceStart.getTime()) / (1000 * 60),
        type: 'entertainment',
        description: 'Music and dancing'
      })
    }
  }
}

function generateDefaultTimeline(
  items: TimelineItem[],
  timelineId: string,
  start: Date,
  end: Date,
  includeMeals: boolean,
  includeBreaks: boolean
): void {
  // Generic timeline for any event type
  
  // Arrival/check-in
  const arrivalStart = new Date(start)
  const arrivalEnd = new Date(arrivalStart)
  arrivalEnd.setMinutes(arrivalEnd.getMinutes() + 30)
  
  items.push({
    id: `${timelineId}-arrival`,
    title: 'Guest Arrival',
    startTime: arrivalStart.toISOString(),
    endTime: arrivalEnd.toISOString(),
    duration: 30,
    type: 'reception',
    description: 'Guest arrival and check-in'
  })
  
  // Welcome
  const welcomeStart = new Date(arrivalEnd)
  const welcomeEnd = new Date(welcomeStart)
  welcomeEnd.setMinutes(welcomeEnd.getMinutes() + 15)
  
  items.push({
    id: `${timelineId}-welcome`,
    title: 'Welcome & Introduction',
    startTime: welcomeStart.toISOString(),
    endTime: welcomeEnd.toISOString(),
    duration: 15,
    type: 'presentation',
    description: 'Welcome and event introduction'
  })
  
  // Main event sections
  const totalMinutes = (end.getTime() - welcomeEnd.getTime()) / (1000 * 60)
  const segments = 3
  const segmentDuration = Math.floor(totalMinutes / segments)
  
  let currentTime = new Date(welcomeEnd)
  
  for (let i = 0; i < segments; i++) {
    const segmentStart = new Date(currentTime)
    const segmentEnd = new Date(segmentStart)
    segmentEnd.setMinutes(segmentEnd.getMinutes() + segmentDuration)
    
    if (i === segments - 1) {
      // Make the last segment end at the event end time
      segmentEnd.setTime(end.getTime() - 15 * 60 * 1000) // 15 minutes before end
    }
    
    items.push({
      id: `${timelineId}-segment-${i+1}`,
      title: `Main Activity ${i+1}`,
      startTime: segmentStart.toISOString(),
      endTime: segmentEnd.toISOString(),
      duration: (segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60),
      type: 'activity',
      description: `Main event activity ${i+1}`
    })
    
    currentTime = new Date(segmentEnd)
    
    // Add breaks between segments if not the last segment
    if (includeBreaks && i < segments - 1) {
      const breakStart = new Date(currentTime)
      const breakEnd = new Date(breakStart)
      breakEnd.setMinutes(breakEnd.getMinutes() + 15)
      
      items.push({
        id: `${timelineId}-break-${i+1}`,
        title: 'Break',
        startTime: breakStart.toISOString(),
        endTime: breakEnd.toISOString(),
        duration: 15,
        type: 'break',
        description: 'Short break'
      })
      
      currentTime = new Date(breakEnd)
    }
    
    // Add meal in the middle
    if (includeMeals && i === Math.floor(segments / 2) - 1) {
      const mealStart = new Date(currentTime)
      const mealEnd = new Date(mealStart)
      mealEnd.setMinutes(mealEnd.getMinutes() + 45)
      
      items.push({
        id: `${timelineId}-meal`,
        title: 'Meal Service',
        startTime: mealStart.toISOString(),
        endTime: mealEnd.toISOString(),
        duration: 45,
        type: 'meal',
        description: 'Food and refreshments'
      })
      
      currentTime = new Date(mealEnd)
    }
  }
  
  // Closing
  const closingStart = new Date(currentTime)
  const closingEnd = new Date(end)
  
  items.push({
    id: `${timelineId}-closing`,
    title: 'Closing & Farewells',
    startTime: closingStart.toISOString(),
    endTime: closingEnd.toISOString(),
    duration: (closingEnd.getTime() - closingStart.getTime()) / (1000 * 60),
    type: 'closing',
    description: 'Event closing and guest departures'
  })
} 