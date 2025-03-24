import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupAuth } from "./auth";
import Stripe from "stripe";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertTaskSchema, 
  insertGuestSchema,
  insertVendorSchema,
  insertEventVendorSchema,
  insertUserPreferenceSchema,
  insertSubscriptionPlanSchema,
  insertTransactionSchema
} from "@shared/schema";
import { 
  generateAiSuggestions, 
  optimizeEventBudget, 
  BudgetItem, 
  openai, 
  MODEL 
} from "./services/ai-service";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Payment features will not work properly.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // All routes are prefixed with /api
  
  // Route to get all events
  app.get("/api/events", async (req, res) => {
    try {
      // For now, just return all events from user with ID 1 as a default
      const events = await storage.getEventsByOwner(1);
      return res.json(events);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get events" });
    }
  });
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Event routes
  app.post("/api/events", async (req, res) => {
    try {
      // Parse the incoming data, but convert ISO date string to Date
      if (req.body.date && typeof req.body.date === 'string') {
        req.body.date = new Date(req.body.date);
      }

      const eventData = insertEventSchema.parse(req.body);
      
      // Log the parsed data for debugging
      console.log("Parsed event data:", eventData);
      
      const event = await storage.createEvent(eventData);
      return res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      return res.status(500).json({ 
        message: "Failed to create event", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.json(event);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event" });
    }
  });
  
  app.get("/api/users/:userId/events", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const events = await storage.getEventsByOwner(userId);
      return res.json(events);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user events" });
    }
  });
  
  app.put("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = req.body;
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      return res.json(updatedEvent);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Task routes
  app.post("/api/tasks", async (req, res) => {
    try {
      console.log("Received task data:", JSON.stringify(req.body, null, 2));
      
      // Handle date formatting if it's a string
      if (req.body.dueDate && typeof req.body.dueDate === 'string') {
        req.body.dueDate = new Date(req.body.dueDate);
      }
      
      const taskData = insertTaskSchema.parse(req.body);
      console.log("Parsed task data:", JSON.stringify(taskData, null, 2));
      
      const task = await storage.createTask(taskData);
      return res.status(201).json(task);
    } catch (error) {
      console.error("Task creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      return res.status(500).json({ 
        message: "Failed to create task",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/events/:eventId/tasks", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const tasks = await storage.getTasksByEvent(eventId);
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event tasks" });
    }
  });
  
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = req.body;
      
      const updatedTask = await storage.updateTask(taskId, taskData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.json(updatedTask);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Guest routes
  app.post("/api/guests", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      return res.status(201).json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid guest data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create guest" });
    }
  });
  
  app.get("/api/events/:eventId/guests", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const guests = await storage.getGuestsByEvent(eventId);
      return res.json(guests);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event guests" });
    }
  });
  
  // Planning tips routes
  app.get("/api/planning-tips", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let tips;
      
      if (category) {
        tips = await storage.getPlanningTipsByCategory(category);
      } else {
        tips = await storage.getAllPlanningTips();
      }
      
      return res.json(tips);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get planning tips" });
    }
  });
  
  // User preferences routes
  app.post("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferenceData = { ...req.body, userId };
      
      const validatedData = insertUserPreferenceSchema.parse(preferenceData);
      
      // Check if preferences already exist
      const existingPrefs = await storage.getUserPreferences(userId);
      if (existingPrefs) {
        const updatedPrefs = await storage.updateUserPreferences(userId, validatedData);
        return res.json(updatedPrefs);
      }
      
      const preferences = await storage.createUserPreferences(validatedData);
      return res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to save user preferences" });
    }
  });
  
  app.get("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      return res.json(preferences);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user preferences" });
    }
  });
  
  // Vendor routes
  // Dedicated route for partner vendors - must come before /:id route
  app.get("/api/vendors/partners", async (req, res) => {
    try {
      const partnerVendors = await storage.getPartnerVendors();
      return res.json(partnerVendors);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get partner vendors" });
    }
  });

  app.get("/api/vendors", async (req, res) => {
    try {
      const category = req.query.category as string;
      const isPartner = req.query.isPartner === 'true';
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let vendors;
      
      if (isPartner) {
        vendors = await storage.getPartnerVendors();
      } else if (userId) {
        vendors = await storage.getUserVendors(userId);
      } else if (category) {
        vendors = await storage.getVendorsByCategory(category);
      } else {
        vendors = await storage.getAllVendors();
      }
      
      return res.json(vendors);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get vendors" });
    }
  });
  
  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendor = await storage.getVendor(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      return res.json(vendor);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get vendor" });
    }
  });
  
  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      return res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  
  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendorData = req.body;
      
      const updatedVendor = await storage.updateVendor(vendorId, vendorData);
      if (!updatedVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      return res.json(updatedVendor);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  
  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const success = await storage.deleteVendor(vendorId);
      
      if (!success) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
  
  // Event-Vendor routes
  app.get("/api/events/:eventId/vendors", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const eventVendors = await storage.getVendorsByEvent(eventId);
      
      // We need to get the full vendor details
      const fullVendors = await Promise.all(
        eventVendors.map(async (ev) => {
          const vendor = await storage.getVendor(ev.vendorId);
          return {
            ...ev,
            vendor
          };
        })
      );
      
      return res.json(fullVendors);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get event vendors" });
    }
  });
  
  app.post("/api/events/:eventId/vendors", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Make sure eventId in URL and body match
      const eventVendorData = {
        ...insertEventVendorSchema.parse(req.body),
        eventId
      };
      
      const eventVendor = await storage.createEventVendor(eventVendorData);
      return res.status(201).json(eventVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event vendor data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to add vendor to event" });
    }
  });
  
  // AI suggestions routes
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { eventType, theme, budget, preferences } = req.body;
      
      if (!eventType) {
        return res.status(400).json({ message: "Event type is required" });
      }
      
      // Get event and user data for more personalized suggestions
      const userPreferences = preferences?.userId ? 
        await storage.getUserPreferences(preferences.userId) : undefined;
      
      // Get previous events if a userId is provided
      const previousEvents = preferences?.userId ? 
        await storage.getEventsByOwner(preferences.userId) : [];
      
      // Prepare detailed preferences object for AI
      const detailedPreferences = {
        guestCount: preferences?.guestCount,
        format: preferences?.format,
        duration: preferences?.duration,
        previousEvents: previousEvents?.map(evt => evt.name),
        userPreferences: userPreferences ? {
          preferredThemes: userPreferences.preferredThemes,
          preferredEventTypes: userPreferences.preferredEventTypes
        } : undefined
      };
      
      // Generate AI suggestions with enhanced context
      const suggestions = await generateAiSuggestions(
        eventType, 
        theme, 
        budget,
        detailedPreferences
      );
      
      return res.json(suggestions);
    } catch (error) {
      console.error("AI suggestion error:", error);
      return res.status(500).json({ 
        message: "Failed to generate AI suggestions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // AI Event Improvement Suggestions
  app.post("/api/ai/improve-event", async (req, res) => {
    try {
      const { event } = req.body;
      
      if (!event || !event.id) {
        return res.status(400).json({ message: "Valid event data is required" });
      }
      
      // Get tasks for this event to provide context
      const tasks = await storage.getTasksByEvent(event.id);
      
      // Get guests for this event to provide context
      const guests = await storage.getGuestsByEvent(event.id);
      
      // Get user preferences if available
      const userPreferences = await storage.getUserPreferences(event.ownerId);
      
      const systemPrompt = `You are an expert virtual event planning assistant. Analyze the following event details and provide specific suggestions to improve this event. Consider engagement, technical aspects, and overall experience.

Event details:
- Name: ${event.name}
- Type: ${event.type}
- Format: ${event.format}
- Date: ${new Date(event.date).toISOString().split('T')[0]}
- Estimated Guests: ${event.estimatedGuests || 'Not specified'}
- Budget: ${event.budget ? `$${event.budget}` : 'Not specified'}
- Theme: ${event.theme || 'Not specified'}
- Description: ${event.description || 'Not provided'}
- Status: ${event.status}

Current tasks (${tasks.length}): ${tasks.map(t => t.title).join(', ')}

Guest count: ${guests.length} guests

Provide 3-5 specific, actionable suggestions to improve this virtual event. Each suggestion should focus on a different area (engagement, technical setup, content, etc.).

Format your response as a JSON array of improvement objects with the following structure:
[
  {
    "area": "Area of improvement (e.g., Engagement, Technical, Content)",
    "title": "Short, specific title of the suggestion",
    "description": "Detailed explanation of the issue and why it matters",
    "impact": "high|medium|low (how much this will improve the event)",
    "implementation": "Step-by-step guidance on how to implement this suggestion",
    "resources": ["Optional list of tools, websites, or resources to help implement"]
  }
]`;

      // Call OpenAI to get suggestions
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }
      
      const parsedResponse = JSON.parse(content);
      
      return res.json({ 
        improvements: parsedResponse.improvements || parsedResponse
      });
    } catch (error) {
      console.error("AI event improvement error:", error);
      return res.status(500).json({ 
        message: "Failed to generate event improvement suggestions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // AI Budget Optimization
  app.post("/api/ai/optimize-budget", async (req, res) => {
    try {
      const { event, currentBudgetItems, similarEvents } = req.body;
      
      if (!event || !event.id) {
        return res.status(400).json({ message: "Valid event data is required" });
      }
      
      // Ensure budget is available
      if (!event.budget) {
        return res.status(400).json({ 
          message: "Event must have a budget to optimize" 
        });
      }
      
      // Get budget optimization recommendations
      const optimizationResult = await optimizeEventBudget(
        event,
        currentBudgetItems,
        similarEvents
      );
      
      return res.json(optimizationResult);
    } catch (error) {
      console.error("Budget optimization error:", error);
      return res.status(500).json({ 
        message: "Failed to generate budget optimization",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Analytics routes
  app.post("/api/events/:eventId/analytics", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Validate that the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Add eventId to the analytics data
      const analyticsData = {
        ...req.body,
        eventId
      };
      
      const analytics = await storage.createEventAnalytics(analyticsData);
      return res.status(201).json(analytics);
    } catch (error) {
      console.error("Create analytics error:", error);
      return res.status(500).json({ 
        message: "Failed to create analytics data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/events/:eventId/analytics", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Get all analytics entries for this event
      const analytics = await storage.getAnalyticsByEvent(eventId);
      return res.json(analytics);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get analytics data" });
    }
  });
  
  app.put("/api/analytics/:id", async (req, res) => {
    try {
      const analyticsId = parseInt(req.params.id);
      const updatedAnalytics = await storage.updateEventAnalytics(analyticsId, req.body);
      
      if (!updatedAnalytics) {
        return res.status(404).json({ message: "Analytics data not found" });
      }
      
      return res.json(updatedAnalytics);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update analytics data" });
    }
  });
  
  // Attendee Feedback routes
  app.post("/api/events/:eventId/feedback", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Validate that the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Add eventId to the feedback data
      const feedbackData = {
        ...req.body,
        eventId
      };
      
      const feedback = await storage.createAttendeeFeedback(feedbackData);
      return res.status(201).json(feedback);
    } catch (error) {
      console.error("Create feedback error:", error);
      return res.status(500).json({ 
        message: "Failed to save feedback",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/events/:eventId/feedback", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Get all feedback entries for this event
      const feedback = await storage.getFeedbackByEvent(eventId);
      return res.json(feedback);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get feedback data" });
    }
  });
  
  app.get("/api/events/:eventId/feedback-summary", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Get a summary of all feedback for this event
      const summary = await storage.getEventFeedbackSummary(eventId);
      return res.json(summary);
    } catch (error) {
      console.error("Feedback summary error:", error);
      return res.status(500).json({ message: "Failed to get feedback summary" });
    }
  });

  // Subscription Plans routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      return res.json(plans);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get subscription plans" });
    }
  });
  
  app.get("/api/subscription-plans/active", async (req, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();
      return res.json(plans);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get active subscription plans" });
    }
  });
  
  // Stripe payment routes
  if (stripe) {
    // Create a payment intent for one-time payments
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "You must be logged in to create a payment" });
        }
        
        const { amount, currency = "usd" } = req.body;
        
        if (!amount || isNaN(parseFloat(amount))) {
          return res.status(400).json({ message: "Valid amount is required" });
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          currency,
          metadata: {
            userId: req.user.id.toString()
          }
        });
        
        // Create a transaction record
        await storage.createTransaction({
          type: "payment",
          status: "pending",
          userId: req.user.id,
          amount: parseFloat(amount),
          currency,
          stripePaymentIntentId: paymentIntent.id,
          description: "One-time payment"
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("Payment intent creation error:", error);
        res.status(500).json({ 
          message: "Error creating payment intent",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // Create or get a subscription
    app.post("/api/get-or-create-subscription", async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "You must be logged in to manage subscriptions" });
        }
        
        const { planId } = req.body;
        
        if (!planId) {
          return res.status(400).json({ message: "Plan ID is required" });
        }
        
        const user = req.user;
        const plan = await storage.getSubscriptionPlan(parseInt(planId));
        
        if (!plan) {
          return res.status(404).json({ message: "Subscription plan not found" });
        }
        
        // Free plan - just update the user's subscription
        if (plan.price === 0) {
          const updatedUser = await storage.updateUserSubscription(
            user.id,
            plan.name,
            "active"
          );
          
          return res.json({
            success: true,
            subscription: {
              tier: plan.name,
              status: "active",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          });
        }
        
        // Paid subscription
        if (user.stripeCustomerId) {
          // Get existing subscription
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1
          });
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            
            res.json({
              subscriptionId: subscription.id,
              clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
              status: subscription.status
            });
            
            return;
          }
        }
        
        // Create new customer if needed
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.displayName || user.username,
            metadata: {
              userId: user.id.toString()
            }
          });
          
          customerId = customer.id;
          await storage.updateStripeCustomerId(user.id, customerId);
        }
        
        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.displayName || plan.name,
                description: plan.description || ''
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
              recurring: {
                interval: plan.billingCycle || 'month'
              }
            }
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: user.id.toString(),
            planId: plan.id.toString()
          }
        });
        
        // Update user's subscription status
        await storage.updateUserSubscription(
          user.id,
          plan.name,
          subscription.status
        );
        
        // Create a transaction record
        await storage.createTransaction({
          type: "subscription",
          status: "pending",
          userId: user.id,
          amount: plan.price,
          currency: "usd",
          stripeInvoiceId: subscription.latest_invoice?.id || null,
          description: `Subscription to ${plan.displayName || plan.name}`
        });
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
          status: subscription.status
        });
      } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).json({ 
          message: "Error processing subscription",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // Webhook to handle Stripe events
    app.post("/api/webhook", async (req, res) => {
      let event;
      
      try {
        // Get the signature from headers
        const signature = req.headers['stripe-signature'];
        
        // This is where you would verify the signature
        // We'll skip verification for this example
        
        event = req.body;
        
        // Handle the event
        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Update transaction status
            if (paymentIntent.metadata.userId) {
              const userId = parseInt(paymentIntent.metadata.userId);
              const transactions = await storage.getUserTransactions(userId);
              const transaction = transactions.find(t => t.stripePaymentIntentId === paymentIntent.id);
              
              if (transaction) {
                await storage.updateTransaction(transaction.id, { status: "completed" });
              }
            }
            break;
            
          case 'invoice.paid':
            const invoice = event.data.object;
            // Update subscription status
            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
              if (subscription.metadata.userId) {
                const userId = parseInt(subscription.metadata.userId);
                await storage.updateUserSubscription(userId, subscription.metadata.planName || "premium", "active");
                
                // Update transaction
                const transactions = await storage.getUserTransactions(userId);
                const transaction = transactions.find(t => t.stripeInvoiceId === invoice.id);
                
                if (transaction) {
                  await storage.updateTransaction(transaction.id, { status: "completed" });
                }
              }
            }
            break;
            
          case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            if (updatedSubscription.metadata.userId) {
              const userId = parseInt(updatedSubscription.metadata.userId);
              await storage.updateUserSubscription(userId, updatedSubscription.metadata.planName || "premium", updatedSubscription.status);
            }
            break;
            
          case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            if (deletedSubscription.metadata.userId) {
              const userId = parseInt(deletedSubscription.metadata.userId);
              await storage.updateUserSubscription(userId, "free", "inactive");
            }
            break;
            
          default:
            console.log(`Unhandled event type ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    });
  }
  
  const httpServer = createServer(app);
  return httpServer;
}
