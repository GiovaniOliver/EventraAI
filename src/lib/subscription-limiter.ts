import { createServerClient } from './supabase';
import { getUserSubscription } from './stripe-service';

// Define subscription limit types
export type LimitType = 'events' | 'guests' | 'ai' | 'vendors' | 'storage';

// Custom error for subscription limits
export class SubscriptionLimitError extends Error {
    constructor(
        public limitType: LimitType,
        public currentUsage: number,
        public limit: number,
        public tierName: string
    ) {
        super(`${limitType} limit reached: ${currentUsage}/${limit} for ${tierName} tier`);
        this.name = 'SubscriptionLimitError';
    }
}

// Interface for subscription plan limits
interface SubscriptionLimits {
    event_limit: number;
    guest_limit: number;
    ai_call_limit: number;
    vendor_limit: number;
    storage_limit: number; // in MB
}

// Default limits for different tiers
const DEFAULT_LIMITS: Record<string, SubscriptionLimits> = {
    free: {
        event_limit: 3,
        guest_limit: 50,
        ai_call_limit: 10,
        vendor_limit: 5,
        storage_limit: 100
    },
    starter: {
        event_limit: 10,
        guest_limit: 100,
        ai_call_limit: 50,
        vendor_limit: 10,
        storage_limit: 500
    },
    pro: {
        event_limit: 50,
        guest_limit: 500,
        ai_call_limit: 200,
        vendor_limit: 50,
        storage_limit: 2048
    },
    business: {
        event_limit: -1, // unlimited
        guest_limit: -1, // unlimited
        ai_call_limit: 1000,
        vendor_limit: -1, // unlimited
        storage_limit: 10240
    }
};

/**
 * Check if a user has reached their subscription limits
 * @param userId - The user's ID
 * @param limitType - The type of limit to check
 * @param quantity - Optional quantity to check (e.g., number of guests to add)
 * @returns Promise<void> - Throws SubscriptionLimitError if limit is reached
 */
export async function checkLimit(
    userId: string,
    limitType: LimitType,
    quantity: number = 1
): Promise<void> {
    const supabase = createServerClient();
    
    // Get user's subscription details
    const { data: user } = await supabase
        .from('users')
        .select('subscription_tier, subscription_status')
        .eq('id', userId)
        .single();
    
    if (!user) {
        throw new Error('User not found');
    }

    if (user.subscription_status !== 'active') {
        throw new Error(`Subscription is not active: ${user.subscription_status}`);
    }

    // Get subscription plan limits
    const planLimits = DEFAULT_LIMITS[user.subscription_tier] || DEFAULT_LIMITS.free;

    // Check if the plan has unlimited access for this limit type
    const limitValue = planLimits[`${limitType}_limit` as keyof SubscriptionLimits];
    if (limitValue === -1) return; // Unlimited access

    // Get current usage based on limit type
    let currentUsage = 0;
    
    switch (limitType) {
        case 'events':
            const { count: eventCount } = await supabase
                .from('events')
                .select('*', { count: 'exact' })
                .eq('owner_id', userId);
            currentUsage = eventCount || 0;
            break;

        case 'guests':
            const { count: guestCount } = await supabase
                .from('guests')
                .select('*', { count: 'exact' })
                .eq('user_id', userId);
            currentUsage = guestCount || 0;
            break;

        case 'ai':
            const { count: aiCount } = await supabase
                .from('ai_usage')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
            currentUsage = aiCount || 0;
            break;

        case 'vendors':
            const { count: vendorCount } = await supabase
                .from('event_vendors')
                .select('*', { count: 'exact' })
                .eq('user_id', userId);
            currentUsage = vendorCount || 0;
            break;

        case 'storage':
            const { data: files } = await supabase
                .from('files')
                .select('file_size')
                .eq('user_id', userId);
            currentUsage = files?.reduce((total, file) => total + (file.file_size || 0), 0) || 0;
            currentUsage = Math.ceil(currentUsage / (1024 * 1024)); // Convert to MB
            break;

        default:
            throw new Error(`Unknown limit type: ${limitType}`);
    }

    // Check if adding the new quantity would exceed the limit
    if (currentUsage + quantity > limitValue) {
        throw new SubscriptionLimitError(
            limitType,
            currentUsage,
            limitValue,
            user.subscription_tier
        );
    }
}

/**
 * Track AI usage for a user
 * @param userId - The user's ID
 * @param requestType - Type of AI request
 * @param tokensUsed - Number of tokens used
 * @returns Promise<void>
 */
export async function trackAiUsage(
    userId: string,
    requestType: string,
    tokensUsed: number
): Promise<void> {
    const supabase = createServerClient();
    
    await supabase.from('ai_usage').insert({
        user_id: userId,
        request_type: requestType,
        tokens_used: tokensUsed,
        created_at: new Date().toISOString()
    });
}

/**
 * Get current usage statistics for a user
 * @param userId - The user's ID
 * @returns Promise<Record<LimitType, { current: number, limit: number }>>
 */
export async function getUserUsage(
    userId: string
): Promise<Record<LimitType, { current: number; limit: number }>> {
    const supabase = createServerClient();
    
    // Get user's subscription tier
    const { data: user } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();
    
    if (!user) {
        throw new Error('User not found');
    }

    const planLimits = DEFAULT_LIMITS[user.subscription_tier] || DEFAULT_LIMITS.free;
    
    // Get all usage counts in parallel
    const [
        { count: eventCount },
        { count: guestCount },
        { count: aiCount },
        { count: vendorCount },
        { data: files }
    ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact' }).eq('owner_id', userId),
        supabase.from('guests').select('*', { count: 'exact' }).eq('user_id', userId),
        supabase.from('ai_usage').select('*', { count: 'exact' })
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('event_vendors').select('*', { count: 'exact' }).eq('user_id', userId),
        supabase.from('files').select('file_size').eq('user_id', userId)
    ]);

    const storageUsage = Math.ceil(
        (files?.reduce((total, file) => total + (file.file_size || 0), 0) || 0) / (1024 * 1024)
    );

    return {
        events: {
            current: eventCount || 0,
            limit: planLimits.event_limit
        },
        guests: {
            current: guestCount || 0,
            limit: planLimits.guest_limit
        },
        ai: {
            current: aiCount || 0,
            limit: planLimits.ai_call_limit
        },
        vendors: {
            current: vendorCount || 0,
            limit: planLimits.vendor_limit
        },
        storage: {
            current: storageUsage,
            limit: planLimits.storage_limit
        }
    };
}
