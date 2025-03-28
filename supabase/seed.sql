-- Insert admin user
-- Password is 'Elijah9386$'
INSERT INTO users (username, password, display_name, email, is_admin, subscription_tier, subscription_status)
VALUES ('admin', '$2a$10$xXS.AtYE98uKUUQz1oF.T.zW5tGbCdKJVYofKFfvZ0vhOBRt2QFce', 'Administrator', 'admin@socialtizemg.com', true, 'enterprise', 'active')
ON CONFLICT (username) DO NOTHING;

-- Insert subscription plans
INSERT INTO subscription_plans (name, display_name, description, price, currency, interval, billing_cycle, features, event_limit, storage_limit, ai_call_limit, guest_limit)
VALUES 
('starter', 'Starter', 'Basic plan for simple events', 0, 'USD', 'month', 'monthly', 
 '[
   "Create up to 3 virtual events",
   "Basic planning tools",
   "Email support",
   "Basic analytics"
 ]', 3, 500, 10, 50),
('pro', 'Professional', 'For regular event planners', 2999, 'USD', 'month', 'monthly', 
 '[
   "Create up to 10 virtual events",
   "Advanced planning tools",
   "Priority email support",
   "Full analytics suite",
   "Custom event branding"
 ]', 10, 2000, 50, 200),
('business', 'Business', 'For organizations with regular events', 9999, 'USD', 'month', 'monthly', 
 '[
   "Create up to 30 virtual events",
   "Advanced planning tools",
   "Priority email & phone support",
   "Full analytics suite",
   "Custom event branding",
   "API access",
   "Team collaboration"
 ]', 30, 5000, 200, 500),
('enterprise', 'Enterprise', 'For large organizations with complex needs', 19999, 'USD', 'month', 'monthly', 
 '[
   "Unlimited virtual events",
   "Full analytics suite",
   "Custom template development",
   "Dedicated account manager",
   "Team collaboration with roles",
   "Full API access",
   "White labeling & branding",
   "SLA guarantees",
   "Advanced security features",
   "12 months analytics history"
 ]', NULL, 10000, 1000, NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert planning tips
INSERT INTO planning_tips (title, description, category, icon)
VALUES 
('Start Early', 'Begin planning your virtual event at least 8-12 weeks in advance for best results.', 'timing', 'CalendarIcon'),
('Test Technology', 'Always perform a complete technical run-through at least 48 hours before your event.', 'technical', 'ComputerIcon'),
('Engage Frequently', 'Plan for audience interaction every 5-7 minutes to maintain engagement.', 'engagement', 'UsersIcon'),
('Budget Wisely', 'Allocate 30% of your budget for the virtual platform and technical support.', 'budget', 'DollarIcon'),
('Follow Up', 'Send a thank you email with event recording and feedback survey within 24 hours.', 'post-event', 'MailIcon')
ON CONFLICT DO NOTHING;

-- Insert partner vendors
INSERT INTO vendors (name, category, description, contact_email, website, is_partner, is_approved, logo, services, rating, featured)
VALUES 
('StreamLine Events', 'technology', 'Premium virtual event streaming platform with interactive features.', 'info@streamlineevents.com', 'https://streamlineevents.com', true, true, 'https://placehold.co/100x100?text=SE', 
 '[
   {"name": "Livestreaming", "description": "Professional HD streaming services"},
   {"name": "Interactive Tools", "description": "Polls, Q&A, and breakout rooms"},
   {"name": "Recording", "description": "Cloud recording and post-production"}
 ]', 5, true),
('Digital Caterers', 'catering', 'Specialized in coordinating food delivery for virtual event attendees.', 'orders@digitalcaterers.com', 'https://digitalcaterers.com', true, true, 'https://placehold.co/100x100?text=DC', 
 '[
   {"name": "Delivery Coordination", "description": "Synchronized meal delivery to all participants"},
   {"name": "Dietary Options", "description": "Accommodates all dietary restrictions"},
   {"name": "Branded Packaging", "description": "Custom packaging with your event branding"}
 ]', 4, true),
('Virtual Entertainers', 'entertainment', 'Professional entertainers specializing in virtual performances.', 'bookings@virtualentertainers.com', 'https://virtualentertainers.com', true, true, 'https://placehold.co/100x100?text=VE', 
 '[
   {"name": "Live Music", "description": "Professional musicians for virtual events"},
   {"name": "Comedy", "description": "Stand-up comedians experienced in virtual shows"},
   {"name": "Interactive Games", "description": "Host-led virtual team building activities"}
 ]', 5, false)
ON CONFLICT DO NOTHING; 