import { z } from "zod";

export const eventTypeEnum = [
  "virtual_conference",
  "workshop",
  "webinar",
  "team_building",
  "product_launch",
  "networking_event",
  "training_session",
  "panel_discussion",
  "award_ceremony"
] as const;

export const eventFormatEnum = [
  "virtual",
  "in-person",
  "hybrid"
] as const;

export const eventStatusEnum = [
  "draft",
  "planning",
  "confirmed",
  "completed",
  "cancelled"
] as const;

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(eventTypeEnum),
  format: z.enum(eventFormatEnum),
  description: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  estimated_guests: z.number().positive().optional(),
  budget: z.number().nonnegative().optional(),
  status: z.enum(eventStatusEnum).default("draft"),
  owner_id: z.string().optional(),
});

export type EventType = z.infer<typeof eventSchema>;
export type EventTypeEnum = typeof eventTypeEnum[number];
export type EventFormatEnum = typeof eventFormatEnum[number];
export type EventStatusEnum = typeof eventStatusEnum[number]; 