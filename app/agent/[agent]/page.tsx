'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Chat } from '@/components/_main/chat'
import { useAgentStore } from '@/store/useAgentStore'
import { useAppKitAccount } from '@reown/appkit/react'
import { usePrivy } from '@privy-io/react-auth'

export default function AgentPage() {
  const params = useParams()
  const router = useRouter()
  const {authenticated} = usePrivy()
  const { agents, selectAgent, selectedAgent } = useAgentStore()

  useEffect(() => {
    if (!authenticated) {
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
  }, [params.agent, authenticated, agents, selectAgent, router])

  if (!authenticated || !selectedAgent) {
    return null
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl  font-bold text-center mb-6">
        Chat with {selectedAgent.agentName}
      </h1>
      <Chat />
    </div>
  )
}

