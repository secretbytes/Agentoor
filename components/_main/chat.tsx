"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAgentStore } from "@/store/useAgentStore"
// import { Card } from '@/components/ui/card'
import { Send, Plus, Loader2, Wallet, ImageIcon } from "lucide-react"
import { useAppKitAccount } from "@reown/appkit/react"
import SwapInterface from "@/components/_swap/swap-interface"
import type { ChatItem } from "@/types/agent"
import ReactMarkdown from "react-markdown"
import { SidebarMenuSkeleton } from "@/components/ui/sidebar"
import { WindowControls } from "@/components/window-controls"
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  //   SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Keypair } from "@solana/web3.js"

export function Chat() {
  const { selectedAgent, addMessage, getMessages, createNewChat, saveChatHistory, currentChatId } = useAgentStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAppKitAccount()
  const [chatItems, setChatItems] = useState<ChatItem[]>([])
  const [isInitialState, setIsInitialState] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [positionKey, setPositionKey] = useState<Keypair | null>(null)

  useEffect(() => {
    const keyPair = new Keypair()
    if (keyPair) {
    //   console.log("keyPair", keyPair)
      setPositionKey(keyPair)
    }
  }, [])

  useEffect(() => {
    if (selectedAgent && currentChatId) {
      setChatItems(getMessages(currentChatId))
      setIsInitialState(false)
    }
  }, [selectedAgent, getMessages, currentChatId])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatItem = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now(),
    }

    const updatedItems = [...chatItems, userMessage]
    setChatItems(updatedItems)
    if (selectedAgent && currentChatId) {
      addMessage(currentChatId, userMessage)
    }
    setInput("")
    setIsLoading(true)
    setIsInitialState(false)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedItems
            .filter((item) => "role" in item)
            .map((item) => ({
              ...item,
              content:
                item.role === "user" && item.id === userMessage.id
                  ? item.content +
                    (address
                      ? ` and my wallet address is  and my positionKey
                                is ${positionKey?.publicKey.toBase58()}`
                      : "")
                  : item.content,
            })),
          agent: selectedAgent ? selectedAgent.agentName.toLowerCase().replace(/\s+/g, "-") : "default",
          keypair: positionKey
            ? {
                publicKey: positionKey.publicKey.toBase58(),
                secretKey: Array.from(positionKey.secretKey),
              }
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from the agent")
      }

      const data = await response.json()

      if (data.toolResponses && data.toolResponses.length > 0) {
        const toolResponses = data.toolResponses[0].response
        try {
          const responseData = JSON.parse(toolResponses)
          const tool = data.toolResponses[0].tool
          if (tool === "requestSwapQuote") {
            const swapItem: ChatItem = { type: "swap", props: responseData }
            updatedItems.push(swapItem)
          }
        } catch (error) {
          console.error("Failed to parse tool response:", error)
        }
      }

      const assistantMessage: ChatItem = {
        id: (Date.now() + 1).toString(),
        content: data.result,
        role: "assistant",
        timestamp: Date.now(),
      }

      const newItems = [...updatedItems, assistantMessage]
      setChatItems(newItems)
      if (selectedAgent && currentChatId) {
        addMessage(currentChatId, assistantMessage)
      }
      saveChatHistory()
    } catch (error) {
      console.error("Error in chat:", error)
      const errorMessage: ChatItem = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: Date.now(),
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

  const handleNewChat = () => {
    createNewChat()
    setIsInitialState(true)
    setChatItems([])
    setInput("")
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
    //   console.log("File uploaded:", file.name)
      // Handle file upload logic here
    }
  }

  return (
    <SidebarProvider>
      <motion.div
        className="h-screen w-screen bg-black flex overflow-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Button
              className="w-full bg-[#2A2E37] hover:bg-[#333842] text-white border-0"
              onClick={() => console.log("Connect wallet")}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {["Projects", "Settings", "Help"].map((item) => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton asChild>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="w-full text-left px-2 py-2 rounded text-gray-400 hover:text-white hover:bg-[#2A2E37] font-mono"
                    >
                      {item}
                    </motion.button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-gray-800 bg-[#1C1E21]">
            <div className="flex items-center">
              <WindowControls />
              <SidebarTrigger />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-gray-400 font-medium">
              {selectedAgent?.agentName || "Terminal"}
            </div>
            <Button variant="ghost" size="sm" className="mr-2 text-gray-400 hover:text-white" onClick={handleNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          <motion.div
            className="flex-1 flex flex-col justify-center items-center"
            initial={false}
            animate={isInitialState ? { y: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {isInitialState && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Terminal%20UI%20by%20Tungu-qQRrBhDFW9tXtWcjQV0BGryvuDmxFX.webp"
                  alt="Logo Animation"
                  className="w-64 h-32 object-cover rounded-lg"
                />
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {!isInitialState && (
              <motion.div
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                ref={chatContainerRef}
              >
                {chatItems.map((item, index) => (
                  <div key={index}>
                    {"role" in item ? (
                      <div className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-sm px-4 py-2 font-mono text-sm ${
                            item.role === "user"
                              ? "bg-primary/20 text-primary border border-primary/40"
                              : "bg-muted border border-muted-foreground/20"
                          }`}
                        >
                          <ReactMarkdown>{item.content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <SwapInterface props={item.props} />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-sm px-4 py-2 bg-muted border border-muted-foreground/20">
                      <SidebarMenuSkeleton className="w-64 h-12" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="p-4 border-t border-primary/30 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER_COMMAND://"
              className="flex-1 font-mono text-sm border-primary/40 focus-visible:ring-primary/40"
              disabled={isLoading || !selectedAgent}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleFileUpload}
              className="hover:bg-primary/20 hover:text-primary"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !selectedAgent}
              className="hover:bg-primary/20 hover:text-primary"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
      </motion.div>
    </SidebarProvider>
  )
}

