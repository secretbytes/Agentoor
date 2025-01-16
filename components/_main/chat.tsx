'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAgentStore } from '@/store/useAgentStore'
import { Card } from '@/components/ui/card'
import { Send, Plus } from 'lucide-react'
import { useAppKitAccount } from '@reown/appkit/react'
import SwapInterface from '@/components/_swap/swap-interface'
import { ChatSidebar } from './chat-sidebar'
import { ChatItem } from '@/types/agent'

export function Chat() {
    const { selectedAgent, addMessage, getMessages, createNewChat, saveChatHistory, currentChatId } = useAgentStore()
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { address } = useAppKitAccount()
    const [chatItems, setChatItems] = useState<ChatItem[]>([])

    useEffect(() => {
        if (selectedAgent && currentChatId) {
            setChatItems(getMessages(currentChatId))
        }
    }, [selectedAgent, getMessages, currentChatId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage: ChatItem = {
            id: Date.now().toString(),
            content: input + (address ? ` and my wallet address is ${address}` : ''),
            role: 'user',
            timestamp: Date.now()
        }

        const updatedItems = [...chatItems, userMessage]
        setChatItems(updatedItems)
        if (selectedAgent && currentChatId) {
            addMessage(currentChatId, userMessage)
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
                    messages: updatedItems.filter(item => 'role' in item),
                    agent: selectedAgent ? selectedAgent.agentName.toLowerCase().replace(/\s+/g, '-') : 'default',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to get response from the agent')
            }

            const data = await response.json()
            
            if (data.toolResponses && data.toolResponses.length > 0) {
                const toolResponses = data.toolResponses[0].response
                try {
                    const responseData = JSON.parse(toolResponses)
                    const tool = data.toolResponses[0].tool
                    if (tool === "requestSwapQuote") {
                        const swapItem: ChatItem = { type: 'swap', props: responseData }
                        updatedItems.push(swapItem)
                    }
                } catch (error) {
                    console.error("Failed to parse tool response:", error)
                }
            }

            const assistantMessage: ChatItem = {
                id: (Date.now() + 1).toString(),
                content: data.result,
                role: 'assistant',
                timestamp: Date.now()
            }

            const newItems = [...updatedItems, assistantMessage]
            setChatItems(newItems)
            if (selectedAgent && currentChatId) {
                addMessage(currentChatId, assistantMessage)
            }
            saveChatHistory()
        } catch (error) {
            console.error('Error in chat:', error)
            const errorMessage: ChatItem = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant',
                timestamp: Date.now()
            }
            const newItems = [...updatedItems, errorMessage]
            setChatItems(newItems)
            if (selectedAgent && currentChatId) {
                addMessage(currentChatId, errorMessage)
            }
            saveChatHistory()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <ChatSidebar />
            <Card className="flex flex-col flex-1">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">{selectedAgent?.agentName || 'Select an Agent'}</h2>
                    <Button onClick={createNewChat} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                    </Button>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {chatItems.map((item, index) => (
                        <div key={index}>
                            {'role' in item ? (
                                <div
                                    className={`flex ${
                                        item.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                            item.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        {item.content}
                                    </div>
                                </div>
                            ) : (
                                <SwapInterface props={item.props} />
                            )}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={isLoading || !selectedAgent}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !selectedAgent}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </Card>
        </div>
    )
}

