import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import type { BusyRange } from "./slots"

/** Everything that makes a pitch unavailable between `from` and `to`: live bookings and venue blackouts. */
export async function fetchBusyRanges(
  supabase: SupabaseClient<Database>,
  pitchId: string,
  from: Date,
  to: Date,
): Promise<BusyRange[]> {
  const [bookings, blackouts] = await Promise.all([
    supabase
      .from("football_bookings")
      .select("starts_at, ends_at")
      .eq("pitch_id", pitchId)
      .in("status", ["requested", "confirmed"])
      .lt("starts_at", to.toISOString())
      .gt("ends_at", from.toISOString()),
    supabase
      .from("football_pitch_blackouts")
      .select("starts_at, ends_at")
      .eq("pitch_id", pitchId)
      .lt("starts_at", to.toISOString())
      .gt("ends_at", from.toISOString()),
  ])
  return [...(bookings.data ?? []), ...(blackouts.data ?? [])]
}
