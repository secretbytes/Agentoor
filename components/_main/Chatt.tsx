"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import SwapInterface from "@/components/_swap/swap-interface"
import ReactMarkdown from "react-markdown"
import { SidebarMenuSkeleton } from "@/components/ui/sidebar"
import { WindowControls } from "@/components/window-controls"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandLine } from "@/components/command-line"
import { useAgentStore } from "@/store/useAgentStore"
import Image from "next/image"
import { TradingAnalysis } from "../special/trading-analysis"
import { Keypair } from "@solana/web3.js"
import type { Provider } from "@reown/appkit-adapter-solana/react"
import { handleApiResponse } from "@/utils/handleApiResponse"
import DLMMPositions from "../dlmm/getliquidity"
import AddLiquidityButton from "../dlmm/addliquidity"
import ActivePositions from "../dlmm/activepositions"
import { HandleRemoveLiq, RemoveLiquidityButton } from "../dlmm/removeliquidity"
import ErrorHandler from "@/components/errorhandler" // Import the ErrorHandler component
import { toast } from "sonner"
import StakedSolPositions from "../staking/showsol"

type ChatItem = {
  id: string
  content: string | React.ReactElement
  role: "user" | "assistant"
  timestamp: number
  imageUrl?: string
  type?: "swap" | "vision" | "getDLMM" | "createPosition" | "activePositions" | "removeLiquidity"
  props?: any
}

const GetSolanaPublicKey = async (walletProvider: Provider) => {
  const publicKey = await walletProvider.publicKey
  return publicKey
}

export function Chat() {
  const { selectedAgent, addMessage, getMessages, createNewChat, saveChatHistory, currentChatId } = useAgentStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAppKitAccount()
  const [chatItems, setChatItems] = useState<ChatItem[]>([])
  const [isInitialState, setIsInitialState] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const keypair = new Keypair()
  const positionKey = keypair.publicKey

  const { walletProvider } = useAppKitProvider<Provider>("solana")
  const publicKey = GetSolanaPublicKey(walletProvider)

  useEffect(() => {
    // console.log("Initializing chat...")
    const initializeChat = () => {
      if (!initializedRef.current) {
        // console.log("First time initialization - creating new chat")
        createNewChat()
        initializedRef.current = true
        setIsInitialState(true)
        return
      }

      if (selectedAgent && currentChatId) {
        const messages = getMessages(currentChatId)
        // console.log("Retrieved messages:", messages)
        setChatItems(messages)
        setIsInitialState(messages.length === 0)
      } else {
        // console.log("No selected agent or current chat ID")
        setChatItems([])
        setIsInitialState(true)
      }
    }

    initializeChat()
  }, [selectedAgent, currentChatId, getMessages, createNewChat])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatItems])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (value: string) => {
    if ((!value.trim() && !imageUrl) || !selectedAgent) return

    // console.log("Submitting message:", value, "Image URL:", imageUrl)

    let userMessage: ChatItem

    if (value.startsWith("Hello this is")) {
    //   console.log("Received message from DLMM component:", value)
      userMessage = {
        id: Date.now().toString(),
        content: `Created a dlmm position with pair address ${value.split("Hello this is ")[1]}
         and my wallet address is ${address}
                          and my positionKey is ${positionKey} `,
        role: "user",
        timestamp: Date.now(),
      }
    } else {
      userMessage = {
        id: Date.now().toString(),
        content: value || "Uploaded an image for analysis",
        role: "user",
        timestamp: Date.now(),
      }
    }

    setChatItems((prev) => [...prev, userMessage])
    addMessage(selectedAgent.id, userMessage)
    setInput("")
    setIsLoading(true)
    setIsInitialState(false)

    try {
      let responseData
      if (imageUrl) {
        // console.log("Sending image for analysis...")
        const response = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        })
        responseData = await response.json()
        // console.log("Received vision response:", responseData)
      } else {
        // console.log("Sending chat message...")
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...getMessages(currentChatId || selectedAgent.id),
              {
                ...userMessage,
                content:
                  userMessage.content +
                  (address
                    ? ` and my wallet address is ${address}
                        and my positionKey is ${positionKey} 
                        `
                    : ""),
              },
            ],
            agent: selectedAgent.agentName.toLowerCase().replace(/\s+/g, "-"),
          }),
        })
        responseData = await response.json()
        console.log("Received chat response:", responseData)
      }

      setImageUrl(null)

      const { responseText, responseComponent } = handleApiResponse(responseData)

      if (responseText) {
        const textMessage: ChatItem = {
          id: Date.now().toString(),
          content: responseText,
          role: "assistant",
          timestamp: Date.now(),
        }
        addMessage(selectedAgent.id, textMessage)
        setChatItems((prev) => [...prev, textMessage])
      }

      if (responseComponent) {
        addMessage(selectedAgent.id, responseComponent)
        setChatItems((prev) => [...prev, responseComponent])
      }

      saveChatHistory()

      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("Error in chat:", error)
      setChatItems((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: <ErrorHandler />,
          role: "assistant",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    // console.log("Creating new chat...")
    createNewChat()
    setChatItems([])
    setInput("")
    setIsInitialState(true)
    setImageUrl(null)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }
  const handleStake = ()=>{
    console.log("Stake handled")
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // console.log("Uploading file:", file.name)

    const formData = new FormData()
    formData.append("file", file)

    try {
      setIsLoading(true)
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
    //   console.log("Image uploaded successfully:", data.url)
      toast.success("Image uploaded succesfully")
      setImageUrl(data.url)

      const userMessage: ChatItem = {
        id: Date.now().toString(),
        content: "Uploaded an image for analysis. Please hit send to analyze",
        role: "user",
        timestamp: Date.now(),
        imageUrl: data.url,
      }
      addMessage(selectedAgent.id, userMessage)
      setChatItems((prev) => [...prev, userMessage])
      saveChatHistory()

      await handleSubmit("")
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage: ChatItem = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error while uploading the image. Please try again.",
        role: "assistant",
        timestamp: Date.now(),
      }
      addMessage(selectedAgent.id, errorMessage)
      setChatItems((prev) => [...prev, errorMessage])
      saveChatHistory()
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-black">
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#1C1E21] p-2">
        <div className="flex items-center">
          <WindowControls />
          <SidebarTrigger />
        </div>
        <div className="text-gray-400 font-medium">SuperAgents (beta)</div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleNewChat}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        {isInitialState ? (
          <div className="flex-grow flex flex-col items-center justify-center bg-black">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="bg-[#1C1E21] shadow-lg">
                <Image src="/logo.gif" alt="Super Agents" width={300} height={300} priority />
              </div>
            </motion.div>
            <CommandLine value={input} onChange={setInput} onSubmit={handleSubmit} onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <>
            <div
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
            >
              <AnimatePresence>
                {chatItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.type ? (
                      <div className="max-w-2xl">
                        {item.type === "swap" && <SwapInterface props={item.props} />}
                        {item.type === "vision" && <TradingAnalysis analysis={item.props.content} />}
                        {item.type === "getDLMM" && (
                          <DLMMPositions pairs={item.props.data.pairs} handleSubmit={handleSubmit} />
                        )}
                        {item.type === "createPosition" && <AddLiquidityButton data={item.props} />}
                        {item.type === "activePositions" && (
                          <ActivePositions positions={item.props} handleSubmit={handleSubmit} />
                        )}
                        {item.type === "removeLiquidity" && <RemoveLiquidityButton data={item.props} />}
                        {item.type === "fetchLSTS" && <StakedSolPositions positions={item.props} handleSubmit={handleSubmit} />}
                      </div> 
                    ) : (
                      <div className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-sm px-4 py-2 font-mono text-sm ${
                            item.role === "user"
                              ? "bg-primary/20 text-primary border border-primary/40"
                              : "bg-muted border border-muted-foreground/20"
                          }`}
                        >
                          <ReactMarkdown>{item.content}</ReactMarkdown>
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt="Uploaded image"
                              width={300}
                              height={300}
                              className="mt-2 rounded-md"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-sm px-4 py-2 bg-muted border border-muted-foreground/20">
                    <SidebarMenuSkeleton className="w-64 h-12" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <CommandLine value={input} onChange={setInput} onSubmit={handleSubmit} onFileUpload={handleFileUpload} />
          </>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
    </div>
  )
}

