export async function canUserAccessEvent(userId: string, eventId: string) {
    const { data } = await supabase.from('event_team').select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId);

    return data && data.length > 0;
}
