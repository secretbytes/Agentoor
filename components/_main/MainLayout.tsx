'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { SidebarComponent } from './sidebar'
import { Chat } from './Chatt'
import { motion } from 'framer-motion'
import { useAgentStore } from '@/store/useAgentStore'
import { useAppKitAccount } from '@reown/appkit/react'
import { NotConnected } from './not_connected'

export function MainLayout() {
  const { selectedAgent } = useAgentStore()
  const { isConnected } = useAppKitAccount()

  if (!isConnected) {
    return <NotConnected />
  }

  return (
    <SidebarProvider>
      <motion.div 
        className="h-screen w-screen bg-black flex overflow-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <SidebarComponent />
        {selectedAgent ? (
          <Chat />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Please select an agent to start chatting.
          </div>
        )}
      </motion.div>
    </SidebarProvider>
  )
}