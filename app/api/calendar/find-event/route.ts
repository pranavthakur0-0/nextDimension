import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient, decodeTokens } from "@/lib/google";
import { CalendarService } from "@/lib/calendar-service";

export async function POST(request: NextRequest) {
  try {
    const tokensCookie = request.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated with Google" },
        { status: 401 }
      );
    }

    const tokens = decodeTokens(tokensCookie.value);
    const authClient = getAuthenticatedClient(tokens);
    const calendarService = new CalendarService(authClient);

    const body = await request.json();
    const { event_name, search_range_days = 14 } = body;

    if (!event_name) {
      return NextResponse.json(
        { error: "event_name is required" },
        { status: 400 }
      );
    }

    const events = await calendarService.findEventByName(
      event_name,
      search_range_days
    );

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      start_formatted: event.start?.dateTime
        ? new Date(event.start.dateTime).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : event.start?.date,
      description: event.description,
    }));

    return NextResponse.json({
      query: event_name,
      events: formattedEvents,
      total: formattedEvents.length,
      message:
        formattedEvents.length === 0
          ? `No events found matching "${event_name}" in the next ${search_range_days} days.`
          : `Found ${formattedEvents.length} event(s) matching "${event_name}".`,
    });
  } catch (error) {
    console.error("Find event error:", error);
    return NextResponse.json(
      { error: "Failed to search for events" },
      { status: 500 }
    );
  }
}
