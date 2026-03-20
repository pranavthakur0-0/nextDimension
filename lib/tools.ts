/**
 * OpenAI Realtime API tool definitions for the scheduling agent.
 * These are sent in the session config so the LLM can call them during conversation.
 */

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    name: "check_availability",
    description:
      "Check the user's Google Calendar for available time slots on a specific date. " +
      "Use this when the user wants to schedule a meeting and you need to find open times. " +
      "Returns a list of available time slots.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description:
            "The date to check availability for, in YYYY-MM-DD format. " +
            "You must resolve relative dates like 'Tuesday' or 'next week' to an actual date.",
        },
        duration_minutes: {
          type: "number",
          description: "The duration of the meeting in minutes. Defaults to 60 if not specified.",
        },
        time_preference: {
          type: "string",
          enum: ["morning", "afternoon", "evening", "any"],
          description:
            "Preferred time of day. 'morning' = 9am-12pm, 'afternoon' = 12pm-5pm, " +
            "'evening' = 5pm-9pm, 'any' = full working hours.",
        },
      },
      required: ["date", "duration_minutes"],
    },
  },
  {
    type: "function" as const,
    name: "create_event",
    description:
      "Create a new event on the user's Google Calendar. " +
      "Only call this AFTER the user has confirmed a specific time slot. " +
      "Never create an event without explicit user confirmation.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title/summary of the meeting.",
        },
        start_time: {
          type: "string",
          description: "The start time of the event in ISO 8601 format (e.g., 2025-03-20T14:00:00).",
        },
        end_time: {
          type: "string",
          description: "The end time of the event in ISO 8601 format.",
        },
        description: {
          type: "string",
          description: "Optional description or notes for the meeting.",
        },
        attendees: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of attendee email addresses.",
        },
      },
      required: ["title", "start_time", "end_time"],
    },
  },
  {
    type: "function" as const,
    name: "list_events",
    description:
      "List existing events on the user's calendar for a date range. " +
      "Use this when you need to understand the user's existing schedule, " +
      "such as when they say 'after my last meeting' or 'between my morning meetings'.",
    parameters: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Start of the date range in YYYY-MM-DD format.",
        },
        end_date: {
          type: "string",
          description: "End of the date range in YYYY-MM-DD format.",
        },
      },
      required: ["start_date", "end_date"],
    },
  },
  {
    type: "function" as const,
    name: "find_event_by_name",
    description:
      "Search for an event on the user's calendar by name or keyword. " +
      "Use this when the user references a specific event, e.g., " +
      "'after the Project Alpha meeting' or 'before my flight on Friday'.",
    parameters: {
      type: "object",
      properties: {
        event_name: {
          type: "string",
          description: "The name or keyword to search for in event titles.",
        },
        search_range_days: {
          type: "number",
          description: "How many days ahead to search. Defaults to 14.",
        },
      },
      required: ["event_name"],
    },
  },
  {
    type: "function" as const,
    name: "end_session",
    description: "End the current voice session and disconnect the microphone. Call this if the user says 'done', 'goodbye', 'end session', or indicates they no longer need assistance.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];
