'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgentStore } from '@/store/useAgentStore'
import { Terminal } from 'lucide-react'

export function AgentGrid() {
  const { agents, selectAgent } = useAgentStore()
  const router = useRouter()

  const handleAgentSelect = (agent: typeof agents[0]) => {
    selectAgent(agent)
    router.push(`agent/${agent.agentName.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto p-6">
      {agents.map((agent) => (
        <Card 
          key={agent.id}
          className="terminal-window cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] scanline"
          onClick={() => handleAgentSelect(agent)}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <Terminal className="w-6 h-6 text-primary" />
            <CardTitle className="font-mono text-primary">
              {agent.agentName.toUpperCase()}_
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

