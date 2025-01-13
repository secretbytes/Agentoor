'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAgentStore } from '@/store/useAgentStore'
import { Card } from '@/components/ui/card'
import { Send } from 'lucide-react'
export function Chat() {
    const { selectedAgent, addMessage, getMessages } = useAgentStore()
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || !selectedAgent) return
  
      const userMessage = {
        id: Date.now().toString(),
        content: input,
        role: 'user' as const,
        timestamp: Date.now()
      }
  
      addMessage(selectedAgent.id, userMessage)
      setInput('')
      setIsLoading(true)
  
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...getMessages(selectedAgent.id), userMessage],
            agent: selectedAgent.agentName.toLowerCase().replace(/\s+/g, '-'),
          }),
        })
  
        if (!response.ok) {
          throw new Error('Failed to get response from the agent')
        }
  
        const data = await response.json()
  
        addMessage(selectedAgent.id, {
          id: (Date.now() + 1).toString(),
          content: data.result,
          role: 'assistant',
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('Error in chat:', error)
        addMessage(selectedAgent.id, {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          timestamp: Date.now()
        })
      } finally {
        setIsLoading(false)
      }
    }
  
    if (!selectedAgent) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Select an agent to start chatting</p>
        </div>
      )
    }
  
    const messages = getMessages(selectedAgent.id)
  
    return (
      <Card className="flex flex-col h-[60vh] max-w-4xl mx-auto mt-4">
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
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    )
  }
  