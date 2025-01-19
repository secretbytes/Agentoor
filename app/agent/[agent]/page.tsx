'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
// import { Chat } from '@/components/_main/chat'
import { useAgentStore } from '@/store/useAgentStore'
import { useAppKitAccount } from '@reown/appkit/react'
import { MainLayout } from '@/components/_main/MainLayout'

export default function AgentPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected } = useAppKitAccount()
  const { agents, selectAgent, selectedAgent } = useAgentStore()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    const agentName = (params.agent as string).replace(/-/g, ' ')
    const agent = agents.find(
      a => a.agentName.toLowerCase() === agentName.toLowerCase()
    )

    if (agent) {
      selectAgent(agent)
    } else {
      router.push('/')
    }
  }, [params.agent, isConnected, agents, selectAgent, router])

  if (!isConnected || !selectedAgent) {
    return (<>
    
    No agent found
    
    </>)
  }

  return (
    <div className="container mx-auto  ">
      {/* <Chat /> */}
      <MainLayout/>
    </div>
  )
}

