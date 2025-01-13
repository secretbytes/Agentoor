"use client"

import { ConnectButton } from '@/components/_main/connect-button'
import { AgentGrid } from '@/components/_main/agent-grid'


import {  useAppKitAccount } from '@reown/appkit/react'
export default function Home() {
  return (
    <div className="container mx-auto py-6">
      <ConnectWalletSection />
    </div>
  )
}

function ConnectWalletSection() {
    const { isConnected } = useAppKitAccount()
  

  if (!isConnected) {
    return <ConnectButton />
  }

  return <AgentGrid />
}

