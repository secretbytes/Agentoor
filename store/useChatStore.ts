import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  chatId: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  lastUpdated: number
}

interface ChatStore {
  chats: Chat[]
  activeChat: string | null
  createChat: () => string
  addMessage: (chatId: string, message: Message) => void
  setActiveChat: (chatId: string) => void
  getMessages: (chatId: string) => Message[]
  getChatTitle: (chatId: string) => string
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      createChat: () => {
        const newChatId = Date.now().toString()
        set((state) => ({
          chats: [
            ...state.chats,
            {
              id: newChatId,
              title: 'New Chat',
              messages: [],
              lastUpdated: Date.now(),
            },
          ],
          activeChat: newChatId,
        }))
        return newChatId
      },
      addMessage: (chatId, message) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedMessages = [...chat.messages, message]
              return {
                ...chat,
                messages: updatedMessages,
                title: chat.messages.length === 0 ? message.content.slice(0, 30) + '...' : chat.title,
                lastUpdated: Date.now(),
              }
            }
            return chat
          }),
        }))
      },
      setActiveChat: (chatId) => {
        set({ activeChat: chatId })
      },
      getMessages: (chatId) => {
        const chat = get().chats.find((c) => c.id === chatId)
        return chat?.messages || []
      },
      getChatTitle: (chatId) => {
        const chat = get().chats.find((c) => c.id === chatId)
        return chat?.title || 'New Chat'
      },
    }),
    {
      name: 'chat-storage',
    }
  )
)

