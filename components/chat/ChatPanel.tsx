"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initialsOf } from "@/lib/utils/format"
import { formatTime, relativeDayLabel } from "@/lib/utils/time"
import { cn } from "@/lib/utils"

type Person = { full_name: string; avatar_url: string | null }

export interface ChatMessage {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender?: Person | null
}

interface ChatPanelProps {
  title: string
  placeholder: string
  currentUserId: string
  /** Known participants, used to label realtime messages that arrive without a profile. */
  people: Record<string, Person>
  load: () => Promise<ChatMessage[]>
  send: (text: string) => Promise<ChatMessage>
  subscribe: (onMessage: (msg: ChatMessage) => void) => RealtimeChannel
  showNames?: boolean
  emptyText?: string
}

export function ChatPanel({ title, placeholder, currentUserId, people, load, send, subscribe, showNames, emptyText = "No messages yet — say hi!" }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // The same message can arrive from our own insert and from realtime: keep one copy.
  const merge = (incoming: ChatMessage[]) =>
    setMessages((prev) => {
      const byId = new Map((prev ?? []).map((m) => [m.id, m]))
      for (const m of incoming) byId.set(m.id, { ...byId.get(m.id), ...m, sender: m.sender ?? byId.get(m.id)?.sender })
      return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at))
    })

  useEffect(() => {
    load().then(merge).catch(() => setMessages([]))
    const channel = subscribe((m) => merge([m]))
    return () => { channel.unsubscribe() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll the chat itself — never the page.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  async function handleSend() {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    try {
      merge([await send(body)])
      setText("")
    } catch {
      toast.error("Message not sent. Try again.")
    } finally {
      setSending(false)
    }
  }

  const list = messages ?? []

  return (
    <section className="overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-foreground/[0.06]">
      <h2 className="border-b border-border/70 px-5 py-3.5 font-semibold">{title}</h2>
      <div ref={scrollRef} className="h-80 space-y-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        {messages === null ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
        ) : list.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          list.map((m, i) => {
            const mine = m.sender_id === currentUserId
            const who = m.sender ?? people[m.sender_id] ?? null
            const prev = list[i - 1]
            const next = list[i + 1]
            const firstOfGroup = !prev || prev.sender_id !== m.sender_id
            const lastOfGroup = !next || next.sender_id !== m.sender_id
            const newDay = !prev || relativeDayLabel(new Date(prev.created_at)) !== relativeDayLabel(new Date(m.created_at))
            return (
              <div key={m.id}>
                {newDay && (
                  <p className="py-2 text-center text-[11px] font-medium text-muted-foreground">{relativeDayLabel(new Date(m.created_at))}</p>
                )}
                <div className={cn("flex items-end gap-2", mine && "flex-row-reverse", firstOfGroup && !newDay && "mt-3")}>
                  {!mine && (
                    <Avatar className={cn("size-7 shrink-0", !lastOfGroup && "invisible")}>
                      <AvatarImage src={who?.avatar_url ?? undefined} alt="" />
                      <AvatarFallback className="text-[10px]">{initialsOf(who?.full_name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex max-w-[78%] flex-col", mine ? "items-end" : "items-start")}>
                    {!mine && showNames && firstOfGroup && who && (
                      <p className="mb-0.5 px-3 text-[11px] text-muted-foreground">{who.full_name}</p>
                    )}
                    <p
                      className={cn(
                        "rounded-[20px] px-3.5 py-2 text-[15px] leading-snug break-words whitespace-pre-wrap",
                        mine ? "bg-primary text-primary-foreground" : "bg-muted",
                        mine && lastOfGroup && "rounded-br-md",
                        !mine && lastOfGroup && "rounded-bl-md",
                      )}
                    >
                      {m.content}
                    </p>
                    {lastOfGroup && <p className="mt-0.5 px-2 text-[10px] text-muted-foreground">{formatTime(new Date(m.created_at))}</p>}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form
        className="flex items-center gap-2 border-t border-border/70 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={1000}
          className="h-10 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Send"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all active:scale-90 disabled:opacity-30"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-5" strokeWidth={2.5} />}
        </button>
      </form>
    </section>
  )
}
