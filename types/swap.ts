export interface Token {
    symbol: string
    network: string
    amount: string
    value: string
    icon: string
    bgColor?: string
  }
  
  export interface SwapData {
    from: Token
    to: Token
    total: string
    slippage: string
    priceImpact: string
    via: {
      name: string
      type: string
    }
    aiAgent: {
      name: string
    }
  }
  
  