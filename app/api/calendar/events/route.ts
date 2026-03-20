import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient, decodeTokens } from "@/lib/google";
import { CalendarService } from "@/lib/calendar-service";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    const timeMin = new Date(`${startDate}T00:00:00`).toISOString();
    const timeMax = new Date(`${endDate}T23:59:59`).toISOString();

    const events = await calendarService.listEvents(timeMin, timeMax);

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
      end_formatted: event.end?.dateTime
        ? new Date(event.end.dateTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : event.end?.date,
      description: event.description,
    }));

    return NextResponse.json({
      events: formattedEvents,
      total: formattedEvents.length,
    });
  } catch (error) {
    console.error("List events error:", error);
    return NextResponse.json(
      { error: "Failed to list events" },
      { status: 500 }
    );
  }
}

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
    const { title, start_time, end_time, description, attendees } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: "title, start_time, and end_time are required" },
        { status: 400 }
      );
    }

    const event = await calendarService.createEvent({
      summary: title,
      startTime: start_time,
      endTime: end_time,
      description,
      attendees,
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
        link: event.htmlLink,
      },
      message: `Meeting "${title}" has been created successfully!`,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
