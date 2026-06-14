import React, { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import api from "@/api/axios"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface ChatMessage {
  id: string
  content: string
  projectId: string
  senderId: string
  senderUsername: string
  timestamp: string
}

export default function TeamChat() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuthStore()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  const clientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!projectId || !user) return

    // Fetch initial chat history
    api.get(`/projects/${projectId}/chat`).then((res) => {
      setMessages(res.data)
    }).catch(console.error)

    // Setup STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS("/ws/chat"),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(`/topic/project/${projectId}`, (message) => {
          if (message.body) {
            const newMsg: ChatMessage = JSON.parse(message.body)
            setMessages((prev) => [...prev, newMsg])
          }
        })
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"])
        console.error("Additional details: " + frame.body)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (client.active) {
        client.deactivate()
      }
      setIsConnected(false)
    }
  }, [projectId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !clientRef.current?.active || !projectId || !user) return

    const payload = {
      content: input.trim(),
      projectId: projectId,
      senderId: user.id
    }

    clientRef.current.publish({
      destination: `/app/chat/${projectId}`,
      body: JSON.stringify(payload)
    })

    setInput("")
  }

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground p-8 bg-card border border-border rounded-xl">
        Select a project to view the team chat.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div>
          <h3 className="font-semibold text-foreground">Team Chat</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">Project ID: {projectId.substring(0, 8)}...</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-sm`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-xs font-medium text-foreground">
                  {isMe ? "You" : msg.senderUsername}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] break-words shadow-sm ${
                isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-muted/20 border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-background"
            disabled={!isConnected}
          />
          <Button type="submit" disabled={!isConnected || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
