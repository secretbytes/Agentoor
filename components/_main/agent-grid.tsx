'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgentStore } from '@/store/useAgentStore'

export function AgentGrid() {
  const { agents, selectAgent } = useAgentStore()
  const router = useRouter()

  const handleAgentSelect = (agent: typeof agents[0]) => {
    selectAgent(agent)
    router.push(`agent/${agent.agentName.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto p-6">
      {agents.map((agent) => (
        <Card 
          key={agent.id}
          className="cursor-pointer transition-colors hover:bg-muted"
          onClick={() => handleAgentSelect(agent)}
        >
          <CardHeader>
            <CardTitle className="text-center">{agent.agentName}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

