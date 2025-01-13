import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Agent, Message } from '../types/agent'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  messages: Record<string, Message[]>
  setAgents: (agents: Agent[]) => void
  selectAgent: (agent: Agent) => void
  addMessage: (agentId: string, message: Message) => void
  clearMessages: (agentId: string) => void
  getMessages: (agentId: string) => Message[]
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
      setAgents: (agents) => set({ agents }),
      selectAgent: (agent) => set({ selectedAgent: agent }),
      addMessage: (agentId, message) => set((state) => ({
        messages: {
          ...state.messages,
          [agentId]: [...(state.messages[agentId] || []), message]
        }
      })),
      clearMessages: (agentId) => set((state) => ({
        messages: {
          ...state.messages,
          [agentId]: []
        }
      })),
      getMessages: (agentId) => {
        const state = get()
        return state.messages[agentId] || []
      }
    }),
    {
      name: 'agent-storage',
    }
  )
)

