import { getUserSubscription } from './stripe-service';
import { supabase } from './supabase';

export async function enforceLimits(userId: string, type: 'events' | 'guests' | 'vendors' | 'ai') {
    const subscription = await getUserSubscription(userId);
    if (!subscription) throw new Error('Subscription not found');

    switch (type) {
        case 'events':
            const { count: events } = await supabase.from('events').select('id', { count: 'exact' }).eq('owner_id', userId);
            if (events && events >= subscription.event_limit) throw new Error('Event limit reached');
            break;
        case 'guests':
            // Use in guest invite endpoint
            break;
        case 'vendors':
            // Use when assigning vendors
            break;
        case 'ai':
            const { count: ai } = await supabase.from('ai_usage').select('id', { count: 'exact' }).eq('user_id', userId);
            if (ai && ai >= subscription.ai_call_limit) throw new Error('AI usage limit reached');
            break;
    }
}
