-- EventraAI Database Seed Script
-- Provides initial data for testing and development

-- Sample vendor categories
INSERT INTO public.vendors (name, category, description, contact_email, website, is_partner, is_approved, rating, price_range)
VALUES
    ('Elite Venues', 'Venue', 'Premium event spaces for all occasions', 'contact@elitevenues.com', 'https://elitevenues.com', true, true, 4.8, '$$$'),
    ('Gourmet Delights', 'Catering', 'Fine dining catering services', 'info@gourmetdelights.com', 'https://gourmetdelights.com', true, true, 4.7, '$$$'),
    ('Sound & Lighting Pro', 'Technology', 'Professional audio and visual services', 'bookings@soundlightingpro.com', 'https://soundlightingpro.com', true, true, 4.6, '$$'),
    ('Bloom Florals', 'Decor', 'Beautiful floral arrangements for any event', 'flowers@bloomflorals.com', 'https://bloomflorals.com', true, true, 4.9, '$$'),
    ('Snapshot Photography', 'Photography', 'Capturing your special moments', 'book@snapshotphoto.com', 'https://snapshotphoto.com', true, true, 4.5, '$$'),
    ('Party Planners', 'Planning', 'Full-service event planning', 'hello@partyplanners.com', 'https://partyplanners.com', true, true, 4.4, '$$$'),
    ('Melody Makers', 'Entertainment', 'DJs and live music for events', 'bookings@melodymakers.com', 'https://melodymakers.com', true, true, 4.3, '$$'),
    ('Transport Luxury', 'Transportation', 'Premium transportation services', 'reservations@transportluxury.com', 'https://transportluxury.com', true, true, 4.2, '$$$'),
    ('Sweet Creations', 'Bakery', 'Custom cakes and desserts', 'orders@sweetcreations.com', 'https://sweetcreations.com', true, true, 4.7, '$$'),
    ('Tech Events', 'Technology', 'Event technology solutions', 'support@techevents.com', 'https://techevents.com', true, true, 4.5, '$$')
ON CONFLICT DO NOTHING;

-- Sample admin user (IMPORTANT: This is for development only - use proper secure methods for production)
-- Note: This requires a matching user in auth.users with the same UUID
INSERT INTO public.users (
    id, 
    username, 
    display_name, 
    email, 
    is_admin, 
    subscription_tier, 
    subscription_status
)
VALUES (
    '00000000-0000-0000-0000-000000000000',  -- This should match a UUID in auth.users
    'admin',
    'System Administrator',
    'admin@eventra.ai',
    true,
    'business',
    'active'
)
ON CONFLICT DO NOTHING;

-- Sample event types for filtering
INSERT INTO public.event_types (name, description, icon)
VALUES
    ('Wedding', 'Wedding ceremonies and receptions', 'ring'),
    ('Corporate', 'Business meetings and corporate events', 'briefcase'),
    ('Conference', 'Industry and educational conferences', 'users'),
    ('Birthday', 'Birthday celebrations', 'cake'),
    ('Holiday', 'Holiday parties and celebrations', 'gift'),
    ('Social', 'Social gatherings and parties', 'glass-cheers'),
    ('Fundraiser', 'Charity and fundraising events', 'hand-holding-heart'),
    ('Festival', 'Festival and large public events', 'music'),
    ('Educational', 'Workshops, seminars, and educational events', 'graduation-cap')
ON CONFLICT DO NOTHING;
