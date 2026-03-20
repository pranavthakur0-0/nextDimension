import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export class CalendarService {
  private calendar: calendar_v3.Calendar;

  constructor(authClient: OAuth2Client) {
    this.calendar = google.calendar({ version: "v3", auth: authClient });
  }

  /**
   * Get free/busy information for a time range
   */
  async getFreeBusy(
    timeMin: string,
    timeMax: string
  ): Promise<calendar_v3.Schema$TimePeriod[]> {
    const res = await this.calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: "primary" }],
      },
    });

    return res.data.calendars?.primary?.busy || [];
  }

  /**
   * List events in a time range
   */
  async listEvents(
    timeMin: string,
    timeMax: string
  ): Promise<calendar_v3.Schema$Event[]> {
    const res = await this.calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    return res.data.items || [];
  }

  /**
   * Find available slots for a given date and duration
   */
  async findAvailableSlots(
    date: string, // YYYY-MM-DD
    durationMinutes: number,
    preferences?: {
      timeOfDay?: "morning" | "afternoon" | "evening" | "any";
      workingHoursStart?: number; // hour in 24h format, default 9
      workingHoursEnd?: number; // hour in 24h format, default 18
      bufferMinutes?: number; // buffer between meetings
    }
  ): Promise<{ start: string; end: string }[]> {
    const {
      timeOfDay = "any",
      workingHoursStart = 9,
      workingHoursEnd = 18,
      bufferMinutes = 0,
    } = preferences || {};

    // Determine search window based on time-of-day preference
    let searchStart = workingHoursStart;
    let searchEnd = workingHoursEnd;

    if (timeOfDay === "morning") {
      searchStart = workingHoursStart;
      searchEnd = 12;
    } else if (timeOfDay === "afternoon") {
      searchStart = 12;
      searchEnd = 17;
    } else if (timeOfDay === "evening") {
      searchStart = 17;
      searchEnd = Math.max(workingHoursEnd, 21);
    }

    const dayStart = new Date(`${date}T${String(searchStart).padStart(2, "0")}:00:00`);
    const dayEnd = new Date(`${date}T${String(searchEnd).padStart(2, "0")}:00:00`);

    // Get busy periods
    const busyPeriods = await this.getFreeBusy(
      dayStart.toISOString(),
      dayEnd.toISOString()
    );

    // Find available slots
    const slots: { start: string; end: string }[] = [];
    let currentTime = dayStart.getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const bufferMs = bufferMinutes * 60 * 1000;

    // Sort busy periods by start time
    const sortedBusy = busyPeriods
      .map((bp) => ({
        start: new Date(bp.start!).getTime(),
        end: new Date(bp.end!).getTime(),
      }))
      .sort((a, b) => a.start - b.start);

    for (const busy of sortedBusy) {
      // Check if there's enough time before this busy period
      if (currentTime + durationMs <= busy.start) {
        slots.push({
          start: new Date(currentTime).toISOString(),
          end: new Date(currentTime + durationMs).toISOString(),
        });
      }
      // Move current time past this busy period + buffer
      currentTime = Math.max(currentTime, busy.end + bufferMs);
    }

    // Check for slot after all busy periods
    if (currentTime + durationMs <= dayEnd.getTime()) {
      slots.push({
        start: new Date(currentTime).toISOString(),
        end: new Date(currentTime + durationMs).toISOString(),
      });
    }

    return slots;
  }

  /**
   * Create a calendar event
   */
  async createEvent(params: {
    summary: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendees?: string[];
  }): Promise<calendar_v3.Schema$Event> {
    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: params.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (params.attendees?.length) {
      event.attendees = params.attendees.map((email) => ({ email }));
    }

    const res = await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: "all",
    });

    return res.data;
  }

  /**
   * Find an event by name/keyword
   */
  async findEventByName(
    name: string,
    searchRangeDays: number = 14
  ): Promise<calendar_v3.Schema$Event[]> {
    const now = new Date();
    const futureDate = new Date(
      now.getTime() + searchRangeDays * 24 * 60 * 60 * 1000
    );

    const res = await this.calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      q: name,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });

    return res.data.items || [];
  }
}
