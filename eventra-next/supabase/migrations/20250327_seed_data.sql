-- Insert admin user data from backup
INSERT INTO public.users (
    id, 
    username, 
    password, 
    display_name, 
    email, 
    is_admin, 
    subscription_tier, 
    subscription_status
) 
VALUES (
    uuid_generate_v4(),
    'admin', 
    '510696027db8c02e5295da3d4a35b166bd3571c25edd0878ba9149fd3e1c7d98cf80022831c4c1c703ce40218b4e01f256c809defabb726e00ad02aa6bd5a269.21ab173064b7950f26adfd1032d424d9',
    'Administrator', 
    'admin@socialtizemg.com', 
    true, 
    'enterprise', 
    'active'
)
ON CONFLICT (email) DO NOTHING;

-- Insert planning tips data from backup
INSERT INTO public.planning_tips (
    title, 
    description, 
    category, 
    icon
) 
VALUES 
    ('5 Ways to Engage Virtual Attendees', 'Keep your audience engaged and interactive during online events', 'engagement', 'tips_and_updates'),
    ('Perfect Timing for Event Activities', 'Learn how to schedule your event for maximum participation', 'timing', 'schedule'),
    ('Budget Planning Essentials', 'Smart strategies to allocate resources effectively', 'budget', 'wysiwyg')
ON CONFLICT DO NOTHING;

-- Insert subscription plans data from backup
INSERT INTO public.subscription_plans (
    name, 
    display_name, 
    description, 
    price, 
    features, 
    event_limit, 
    guest_limit, 
    vendor_limit, 
    analytics_period, 
    ai_call_limit
) 
VALUES 
    ('starter', 'Starter', 'Perfect for individuals and small events', 1499, '["Up to 5 events", "Basic analytics", "Standard templates", "50 AI assistant calls per month", "Email support", "1 team member"]', 5, 75, 10, 1, 50),
    ('pro', 'Professional', 'Advanced features for professionals and growing businesses', 2999, '["Up to 15 events", "Advanced analytics", "Premium templates", "Priority support", "Custom branding", "200 AI assistant calls per month", "3 team members"]', 15, 250, 25, 3, 200),
    ('business', 'Business', 'Full-featured solution for established businesses', 5999, '["Up to 50 events", "Comprehensive analytics", "Team collaboration", "API access", "White labeling", "Custom integrations", "500 AI assistant calls per month", "10 team members"]', 50, 750, 50, 6, 500),
    ('enterprise', 'Enterprise', 'Custom solution for large organizations', 19999, '["Unlimited events", "Advanced reporting and data", "Unlimited team members", "Dedicated account manager", "Custom feature development", "Enterprise SLA", "Onboarding support", "Unlimited AI assistant calls"]', 1000, 5000, 200, 12, 1000)
ON CONFLICT DO NOTHING; 