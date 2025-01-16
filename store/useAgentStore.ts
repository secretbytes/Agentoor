import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Agent, ChatItem, ChatHistory } from '../types/agent'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  messages: Record<string, ChatItem[]>
  chatHistories: ChatHistory[]
  currentChatId: string | null
  setAgents: (agents: Agent[]) => void
  selectAgent: (agent: Agent) => void
  addMessage: (agentId: string, item: ChatItem) => void
  clearMessages: (agentId: string) => void
  getMessages: (agentId: string) => ChatItem[]
  createNewChat: () => void
  selectChatHistory: (chatId: string) => void
  saveChatHistory: () => void
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [
        {
          id: '1',
          agentName: 'Agent 1',
          systemPrompt: 'You are a helpful assistant for Solana blockchain operations.',
          functionsPath: '/functions/agent1'
        },
        {
          id: '2',
          agentName: 'Agent 2',
          systemPrompt: 'You are an NFT expert on the Solana blockchain.',
          functionsPath: '/functions/agent2'
        },
        {
          id: '3',
          agentName: 'Agent 3',
          systemPrompt: 'You are a smart contract deployment and verification specialist.',
          functionsPath: '/functions/agent3'
        },
        {
          id: '4',
          agentName: 'Agent 4',
          systemPrompt: 'You are a token creation and management expert.',
          functionsPath: '/functions/agent4'
        },
        {
          id: '5',
          agentName: 'Agent 5',
          systemPrompt: 'You are a DeFi and trading specialist on the Solana blockchain.',
          functionsPath: '/functions/agent5'
        }
      ],
      selectedAgent: null,
      messages: {},
      chatHistories: [],
      currentChatId: null,
      setAgents: (agents) => set({ agents }),
      selectAgent: (agent) => set({ selectedAgent: agent }),
      addMessage: (agentId, item) => set((state) => {
        const updatedMessages = {
          ...state.messages,
          [state.currentChatId || agentId]: [...(state.messages[state.currentChatId || agentId] || []), item]
        }
        return { messages: updatedMessages }
      }),
      clearMessages: (agentId) => set((state) => ({
        messages: {
          ...state.messages,
          [agentId]: []
        }
      })),
      getMessages: (agentId) => {
        const state = get()
        return state.messages[state.currentChatId || agentId] || []
      },
      createNewChat: () => set((state) => {
        const newChatId = Date.now().toString()
        return {
          currentChatId: newChatId,
          chatHistories: [...state.chatHistories, { id: newChatId, agentId: state.selectedAgent?.id || '', createdAt: Date.now() }]
        }
      }),
      selectChatHistory: (chatId) => set({ currentChatId: chatId }),
      saveChatHistory: () => set((state) => {
        if (!state.currentChatId) return {}
        const updatedHistories = state.chatHistories.map(history => 
          history.id === state.currentChatId 
            ? { ...history, messages: state.messages[state.currentChatId] || [] }
            : history
        )
        return { chatHistories: updatedHistories }
      })
    }),
    {
      name: 'agent-storage',
    }
  )
)

