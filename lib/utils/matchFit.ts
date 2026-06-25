import type { Profile } from "@/types/database.types"

const SKILL_ORDER = ["Beginner", "Intermediate", "Advanced", "Elite"]

function mmrScore(a: Profile, b: Profile): number {
  const diff = Math.abs((a.matchmaking_rating ?? 50) - (b.matchmaking_rating ?? 50))
  return Math.max(0, 1 - diff / 50)
}

function availabilityScore(a: Profile, b: Profile): number {
  const slotsA = new Set(a.availability_slots)
  const slotsB = new Set(b.availability_slots)
  if (slotsA.size === 0 || slotsB.size === 0) return 0.5
  const intersection = [...slotsA].filter((s) => slotsB.has(s))
  return intersection.length / Math.max(slotsA.size, slotsB.size)
}

function reliabilityScore(b: Profile): number {
  return Math.min(1, Number(b.reliability_score) / 100)
}

function locationScore(a: Profile, b: Profile): number {
  if (a.home_city && b.home_city) {
    return a.home_city === b.home_city ? 1 : 0.3
  }
  return 0.5
}

export function computeMatchFit(viewer: Profile, target: Profile): number {
  const mmr = mmrScore(viewer, target) * 0.45
  const avail = availabilityScore(viewer, target) * 0.2
  const rel = reliabilityScore(target) * 0.15
  const loc = locationScore(viewer, target) * 0.15
  const bonus = target.is_seeded ? 0.05 : 0

  const raw = mmr + avail + rel + loc + bonus
  return Math.round(Math.min(1, raw) * 100)
}
