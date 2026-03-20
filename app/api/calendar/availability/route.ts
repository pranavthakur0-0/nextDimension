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
    const { date, duration_minutes = 60, time_preference = "any" } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const slots = await calendarService.findAvailableSlots(
      date,
      duration_minutes,
      { timeOfDay: time_preference }
    );

    // Format slots for human readability
    const formattedSlots = slots.map((slot) => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      return {
        start: slot.start,
        end: slot.end,
        start_formatted: start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        end_formatted: end.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        date_formatted: start.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      };
    });

    return NextResponse.json({
      date,
      duration_minutes,
      time_preference,
      available_slots: formattedSlots,
      total_slots: formattedSlots.length,
      message:
        formattedSlots.length === 0
          ? `No available ${duration_minutes}-minute slots found for ${date} (${time_preference}). Try a different day or time preference.`
          : `Found ${formattedSlots.length} available slot(s).`,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
