'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAgentStore } from '@/store/useAgentStore'

export function ChatSidebar() {
  const { chatHistories, selectChatHistory, currentChatId } = useAgentStore()

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat History</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {chatHistories.map((history) => (
            <Button
              key={history.id}
              variant={currentChatId === history.id ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => selectChatHistory(history.id)}
            >
              {new Date(history.createdAt).toLocaleString()}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

