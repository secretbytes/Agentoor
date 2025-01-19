'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, MessageSquare, Terminal, Power, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAgentStore } from '@/store/useAgentStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDisconnect } from '@reown/appkit/react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

export function SidebarComponent() {
  const [mounted, setMounted] = useState(false)
  const { open } = useAppKit()
  const { isConnected, address, status } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  
  const { 
    chatHistories, 
    selectChatHistory, 
    currentChatId 
  } = useAgentStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const connectWallet = async () => {
    try {
      open()
    } catch (error) {
      console.error(error)
    }
  }

  const disconnectWallet = async() => {
    await disconnect()
  }

  if (!mounted) return null

  const displayAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''

  return (
    <Sidebar>
      <SidebarHeader>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-[#2A2E37] hover:bg-[#333842] text-white border-0"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnected ? displayAddress : 'Connect Wallet'}
            </Button>
          </DialogTrigger>
          <DialogContent className="terminal-window">
            <DialogHeader>
              <DialogTitle className="font-mono text-primary">SYSTEM ACCESS</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 p-4">
              {isConnected ? (
                <>
                  <p className="font-mono text-sm">
                    <span className="text-primary">STATUS:</span> {status?.toUpperCase() || 'finding...'}
                  </p>
                  <p className="font-mono text-sm">
                    <span className="text-primary">ADDRESS:</span> {displayAddress}
                  </p>
                  <Button 
                    onClick={disconnectWallet} 
                    variant="destructive"
                    className="font-mono"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    TERMINATE CONNECTION
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={connectWallet}
                  className="font-mono border border-primary/40 hover:bg-primary/20 hover:text-primary"
                >
                  {status === 'connecting' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Terminal className="w-4 h-4 mr-2" />
                  )}
                  INITIALIZE CONNECTION
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <motion.button
                whileHover={{ x: 5 }}
                className="w-full text-left px-2 py-2 rounded text-gray-400 hover:text-white hover:bg-[#2A2E37] font-mono"
              >
                Chat History
              </motion.button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {chatHistories.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                asChild
                onClick={() => selectChatHistory(chat.id)}
              >
                <motion.button
                  whileHover={{ x: 5 }}
                  className={`w-full text-left px-2 py-2 rounded font-mono flex items-center ${
                    currentChatId === chat.id ? 'bg-[#2A2E37] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2A2E37]'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="flex-1 truncate">
                    {new Date(chat.createdAt).toLocaleString()}
                  </span>
                </motion.button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default SidebarComponent