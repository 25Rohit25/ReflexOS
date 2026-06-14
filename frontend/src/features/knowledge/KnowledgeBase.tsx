import React, { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import api from "@/api/axios"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface DocumentDto {
  id: string
  title: string
  content: string
  projectId: string
  createdAt: string
}

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function KnowledgeBase() {
  const { projectId } = useParams<{ projectId: string }>()
  
  const [documents, setDocuments] = useState<DocumentDto[]>([])
  const [newDocTitle, setNewDocTitle] = useState("")
  const [newDocContent, setNewDocContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    text: "Hello! I am your AI assistant for this project. You can ask me anything about the documents in the Knowledge Base.",
    sender: 'ai',
    timestamp: new Date()
  }])
  const [chatInput, setChatInput] = useState("")
  const [isAsking, setIsAsking] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!projectId) return
    fetchDocuments()
  }, [projectId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/documents`)
      setDocuments(res.data)
    } catch (err) {
      console.error("Failed to fetch documents", err)
    }
  }

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocTitle.trim() || !newDocContent.trim() || !projectId) return
    
    setIsUploading(true)
    try {
      const res = await api.post(`/projects/${projectId}/documents`, {
        title: newDocTitle,
        content: newDocContent
      })
      setDocuments(prev => [res.data, ...prev])
      setNewDocTitle("")
      setNewDocContent("")
    } catch (err) {
      console.error("Failed to upload document", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !projectId || isAsking) return

    const questionText = chatInput.trim()
    setChatInput("")

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: questionText,
      sender: 'user',
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, userMsg])
    setIsAsking(true)

    try {
      const res = await api.post(`/projects/${projectId}/ai/ask`, {
        question: questionText
      })
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: res.data.answer,
        sender: 'ai',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error("AI request failed", err)
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the AI service. Ensure Ollama and Qdrant are running.",
        sender: 'ai',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMsg])
    } finally {
      setIsAsking(false)
    }
  }

  if (!projectId) return <div className="p-8">Select a project to view the Knowledge Base.</div>

  return (
    <div className="h-[calc(100vh-4rem)] p-6 flex gap-6 bg-background">
      {/* Left Pane: Documents */}
      <div className="w-1/2 flex flex-col gap-6">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-1/2">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Project Documents</h2>
          <div className="flex-1 overflow-y-auto space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <h4 className="font-medium text-sm text-foreground">{doc.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-1/2">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Add to Knowledge Base</h3>
          <form onSubmit={handleAddDocument} className="flex flex-col gap-3 flex-1">
            <Input
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Document Title (e.g. Phase 1 PRD)"
              className="bg-background"
              disabled={isUploading}
            />
            <textarea
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              placeholder="Paste document content here. The AI will embed this text into the vector database..."
              className="flex-1 bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              disabled={isUploading}
            />
            <Button type="submit" disabled={isUploading || !newDocTitle || !newDocContent}>
              {isUploading ? "Uploading & Embedding..." : "Add Document"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Pane: AI Chat */}
      <div className="w-1/2 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">✨</span> AI Knowledge Assistant
          </h2>
          <p className="text-xs text-muted-foreground">Ask questions about your project's documents</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted-foreground mb-1 ml-1 mr-1">
                  {isUser ? 'You' : 'AI Assistant'}
                </span>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm whitespace-pre-wrap ${
                  isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            )
          })}
          {isAsking && (
            <div className="flex items-start">
              <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-tl-sm text-sm italic">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-muted/20">
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-background"
              disabled={isAsking}
            />
            <Button type="submit" disabled={isAsking || !chatInput.trim()}>
              Ask
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
