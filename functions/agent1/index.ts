export const agent1Functions = {
    getBalance: async (address: string) => {
      // Example function for Agent 1
      console.log(address)
      return "1000 SOL "
    },
    transfer: async (to: string, amount: number) => {
      // Example function for Agent 1
      return `Transferred ${amount} SOL to ${to}`
    }
  }
  
  