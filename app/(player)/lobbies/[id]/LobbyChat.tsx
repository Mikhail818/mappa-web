"use client"

import { ChatPanel, type ChatMessage } from "@/components/chat/ChatPanel"
import { fetchLobbyMessages, sendLobbyMessage, subscribeToLobbyMessages } from "@/lib/api/chat"

type Person = { full_name: string; avatar_url: string | null }

export function LobbyChat({ lobbyId, currentUserId, people }: { lobbyId: string; currentUserId: string; people: Record<string, Person> }) {
  return (
    <ChatPanel
      title="Group chat"
      placeholder="Message the group"
      currentUserId={currentUserId}
      people={people}
      showNames
      load={async () => (await fetchLobbyMessages(lobbyId)) as unknown as ChatMessage[]}
      send={async (text) => (await sendLobbyMessage(lobbyId, currentUserId, text)) as unknown as ChatMessage}
      subscribe={(on) => subscribeToLobbyMessages(lobbyId, (m) => on(m as unknown as ChatMessage))}
      emptyText="No messages yet. Say hi to the group!"
    />
  )
}
