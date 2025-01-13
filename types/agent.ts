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
  
  