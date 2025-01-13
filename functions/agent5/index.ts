export const agent5Functions = {
    getMarketData: async () => {
      // Example function for Agent 5
      return {
        price: "100 USD",
        volume: "1M USD",
        marketCap: "100M USD"
      }
    },
    tradePair: async (pair: string, amount: number) => {
      // Example function for Agent 5
      return `Traded ${amount} of ${pair}`
    }
  }
  
  