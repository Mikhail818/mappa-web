"use client"

import { ChatPanel, type ChatMessage } from "@/components/chat/ChatPanel"
import { fetchMatchMessages, sendMatchMessage, subscribeToMatchMessages } from "@/lib/api/chat"

type Person = { full_name: string; avatar_url: string | null }

export function MatchChat({ matchId, currentUserId, people }: { matchId: string; currentUserId: string; people: Record<string, Person> }) {
  return (
    <ChatPanel
      title="Chat"
      placeholder="Message"
      currentUserId={currentUserId}
      people={people}
      load={async () => (await fetchMatchMessages(matchId)) as unknown as ChatMessage[]}
      send={async (text) => (await sendMatchMessage(matchId, currentUserId, text)) as unknown as ChatMessage}
      subscribe={(on) => subscribeToMatchMessages(matchId, (m) => on(m as unknown as ChatMessage))}
      emptyText="Sort out the details here — time, place, who brings the ball."
    />
  )
}
