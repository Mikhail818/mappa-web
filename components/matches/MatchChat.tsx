"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import {
  fetchMatchMessages,
  sendMatchMessage,
  subscribeToMatchMessages,
} from "@/lib/api/chat"
import { formatTimeAgo } from "@/lib/utils/format"
import type { Profile } from "@/types/database.types"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: Profile | null
}

export function MatchChat({ matchId, currentUserId }: { matchId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMatchMessages(matchId).then((msgs) => setMessages(msgs as unknown as Message[]))

    const channel = subscribeToMatchMessages(matchId, (msg) => {
      setMessages((prev) => [...prev, msg as unknown as Message])
    })

    return () => { channel.unsubscribe() }
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    try {
      const msg = await sendMatchMessage(matchId, currentUserId, text.trim())
      setMessages((prev) => [...prev, msg as unknown as Message])
      setText("")
    } catch {
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-80 border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/30 text-sm font-medium">Match Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground pt-8">No messages yet. Say hi!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          const initials = msg.sender?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={msg.sender?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-0.5 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatTimeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
