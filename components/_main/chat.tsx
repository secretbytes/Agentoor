'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAgentStore } from '@/store/useAgentStore'
import { Card } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { useAppKitAccount } from '@reown/appkit/react'
import SwapInterface from '@/components/_swap/swap-interface'

export function Chat() {
    const { selectedAgent, addMessage, getMessages } = useAgentStore()
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showSwapInterface, setShowSwapInterface] = useState(false)
    const { address } = useAppKitAccount()
    const [prop, setProp] = useState({})
    const [chatHistory, setChatHistory] = useState([])

    useEffect(() => {
        if (selectedAgent) {
            setChatHistory(getMessages(selectedAgent.id))
        }
    }, [selectedAgent, getMessages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = {
            id: Date.now().toString(),
            content: input + (address ? ` and my wallet address is ${address}` : ''),
            role: 'user' as const,
            timestamp: Date.now()
        }

        const updatedHistory = [...chatHistory, userMessage]
        setChatHistory(updatedHistory)
        if (selectedAgent) {
            addMessage(selectedAgent.id, userMessage)
        }
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: updatedHistory, // Send the entire chat history
                    agent: selectedAgent ? selectedAgent.agentName.toLowerCase().replace(/\s+/g, '-') : 'default',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to get response from the agent')
            }

            const data = await response.json()
            console.log("🚀 ~ handleSubmit ~ data ---------------", data)
            
            if (data.toolResponses && data.toolResponses.length > 0) {
                const toolResponses = data.toolResponses[0].response
                try {
                    const responseData = JSON.parse(toolResponses)
                    setProp(responseData)
                    const tool = data.toolResponses[0].tool
                    console.log("🚀 ~ handleSubmit ~ toolResponses", toolResponses)
                    setShowSwapInterface(tool === "requestSwapQuote")
                } catch (error) {
                    console.error("Failed to parse tool response:", error)
                }
            }

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                content: data.result,
                role: 'assistant',
                timestamp: Date.now()
            }

            const newHistory = [...updatedHistory, assistantMessage]
            setChatHistory(newHistory)
            if (selectedAgent) {
                addMessage(selectedAgent.id, assistantMessage)
            }
        } catch (error) {
            console.error('Error in chat:', error)
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant',
                timestamp: Date.now()
            }
            const newHistory = [...updatedHistory, errorMessage]
            setChatHistory(newHistory)
            if (selectedAgent) {
                addMessage(selectedAgent.id, errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="flex flex-col h-[60vh] max-w-4xl mx-auto mt-4">
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatHistory.map((message) => (
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
                {showSwapInterface && <SwapInterface props={prop} />}
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

