import { Metadata } from 'next'
import SharedEventPage from './SharedEventPage'
import { createServerClient } from '@/lib/supabase'
import { Event } from '@/hooks/use-events'

interface PageProps {
  params: { eventId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Fetch the event data from the API to use for metadata
  try {
    // Create Supabase client
    const supabase = createServerClient()
    
    // Get event details - only fetch fields needed for SEO
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        type
      `)
      .eq('id', params.eventId)
      .single()
    
    if (error || !event) {
      // If there's an error or no event found, provide fallback metadata
      return {
        title: 'Event Not Found | EventraAI',
        description: 'This event may have been removed or you do not have permission to view it.',
      }
    }
    
    // Generate structured metadata from the event data
    const eventTitle = event.title || 'Event Details'
    const eventDescription = event.description || `${event.type || 'Event'} hosted on EventraAI`
    
    return {
      title: `${eventTitle} | EventraAI`,
      description: eventDescription,
      openGraph: {
        title: `${eventTitle} | EventraAI`,
        description: eventDescription,
        type: 'website',
        url: `/events/share/${params.eventId}`,
        siteName: 'EventraAI',
        images: [
          {
            url: '/images/event-types/default.jpg',
            width: 1200,
            height: 630,
            alt: eventTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${eventTitle} | EventraAI`,
        description: eventDescription,
        images: ['/images/event-types/default.jpg'],
      },
    }
  } catch (error) {
    // Fallback metadata in case of error
    console.error('Error generating metadata:', error)
    return {
      title: 'Event Details | EventraAI',
      description: 'View event details on EventraAI, the event planning platform.',
    }
  }
}

export default function Page({ params }: PageProps) {
  return <SharedEventPage params={params} />
} 