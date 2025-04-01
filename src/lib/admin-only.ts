import { createServerClient } from './supabase'

export async function requireAdmin(userId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) throw new Error('Unauthorized');
    if (data.role !== 'admin') throw new Error('Forbidden');
}
