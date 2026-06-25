import { createClient } from "@/lib/supabase/client"

export async function logEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  userId?: string,
) {
  const supabase = createClient()
  await supabase.from("analytics_events").insert({
    event_name: eventName,
    properties: properties as never,
    user_id: userId ?? null,
  })
}
