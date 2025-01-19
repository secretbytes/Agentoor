'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAgentStore } from '@/store/useAgentStore'
import { Terminal } from 'lucide-react'

export function ChatSidebar() {
  const { chatHistories, selectChatHistory, currentChatId } = useAgentStore()

  return (
    <div className="w-64 border-r border-primary/30 h-full flex flex-col terminal-window">
      <div className="p-4 border-b border-primary/30">
        <h2 className="text-lg font-semibold font-mono text-primary">CHAT_LOGS</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {chatHistories.map((history) => (
            <Button
              key={history.id}
              variant={currentChatId === history.id ? 'default' : 'outline'}
              className="w-full justify-start font-mono text-xs"
              onClick={() => selectChatHistory(history.id)}
            >
              <Terminal className="w-3 h-3 mr-2" />
              {new Date(history.createdAt).toLocaleString()}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

