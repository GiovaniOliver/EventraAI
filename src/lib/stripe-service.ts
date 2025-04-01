import { createServerClient } from './supabase'

export async function getUserSubscription(userId: string) {
    const supabase = createServerClient();
    
    // Get active subscription for user
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .single();
        
    if (error) return null;
    return data;
}
