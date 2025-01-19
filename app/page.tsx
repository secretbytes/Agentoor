'use client'

import { ConnectButton } from '@/components/_main/connect-button'
// import { AgentGrid } from '@/components/_main/agent-grid'
import { useAppKitAccount } from '@reown/appkit/react'
// import { Terminal } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <div className="container mx-auto ">
      {/* <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold font-mono text-primary glitch-text">
            SUPER_AGENTS
          </h1>
        </div>
        <p className="text-sm font-mono text-muted-foreground">
          {'> INITIALIZING NEURAL INTERFACE...'}
        </p>
      </div> */}
      <ConnectWalletSection />
    </div>
  )
}

function ConnectWalletSection() {
  const { isConnected } = useAppKitAccount()
  
  if (!isConnected) {
    return <ConnectButton />
  }

  // return <AgentGrid />
  return(
    redirect('/agent/agent-3')
  )
}

