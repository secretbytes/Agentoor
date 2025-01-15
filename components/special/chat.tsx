'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { TradingAnalysis } from './trading-analysis'
import { parseMessageContent } from '@/utils/parseContent'

type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

function MessageContent({ content }: { content: string }) {
  const parsedContent = parseMessageContent(content);
  
  if (parsedContent) {
    return <TradingAnalysis analysis={parsedContent} />;
  }

  return (
    <div className="whitespace-pre-wrap break-words">
      {content}
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !imageUrl) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || 'Uploaded an image for analysis',
      role: 'user',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let response
      if (imageUrl) {
        response = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        })
      } else {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to get response from the agent')
      }

      const data = await response.json()

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
        role: 'assistant',
        timestamp: Date.now()
      }])

      setImageUrl(null)
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Error in chat:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsLoading(true)
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.url)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[80vh] max-w-4xl mx-auto mt-4">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <MessageContent content={message.content} />
            </div>
          </div>
        ))}
        {imageUrl && (
          <div className="flex justify-center">
            <Image 
              src={imageUrl} 
              alt="Uploaded image" 
              width={300} 
              height={300} 
              className="rounded-lg object-contain" 
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {imageUrl ? 'Analyzing image...' : 'Processing...'}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={imageUrl ? "Ask about the image..." : "Type your message..."}
            className="flex-1"
            disabled={isLoading}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <Button 
            type="button" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isLoading}
            variant="outline"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}

