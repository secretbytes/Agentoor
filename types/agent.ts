export interface Agent {
    id: string
    agentName: string
    systemPrompt: string
    functionsPath: string
  }
  
  export interface Message {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: number
  }
  
  
export interface ChatHistory {
  id: string
  agentId: string
  createdAt: number
  messages?: Message[]
}

export type ChatItem = Message | { type: 'swap', props: any }