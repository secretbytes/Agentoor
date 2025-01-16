'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAgentStore } from '@/store/useAgentStore'

export function ChatSidebar() {
  const { agents, selectedAgent, selectAgent, chatHistories, selectChatHistory } = useAgentStore()
  const [activeTab, setActiveTab] = useState<'agents' | 'history'>('agents')

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="flex border-b">
        <Button
          variant={activeTab === 'agents' ? 'default' : 'ghost'}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab('agents')}
        >
          Agents
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          className="flex-1 rounded-none"
          onClick={() => setActiveTab('history')}
        >
          History
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {activeTab === 'agents' ? (
          <div className="p-4 space-y-2">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                variant={selectedAgent?.id === agent.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => selectAgent(agent)}
              >
                {agent.agentName}
              </Button>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {chatHistories.map((history) => (
              <Button
                key={history.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => selectChatHistory(history.id)}
              >
                {new Date(history.createdAt).toLocaleString()}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

