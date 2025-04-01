import { createServerClient } from './supabase'

export async function canUserAccessEvent(userId: string, eventId: string) {
    const supabase = createServerClient();
    const { data } = await supabase.from('event_team').select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId);

    return data && data.length > 0;
}
