import axios from 'axios'

export const agent2Functions = {
  getNFTs: async (address: string) => {
    // Existing function
    console.log(address)
    return ["NFT1", "NFT2"]
  },
  fetch24HourPriceChart: async (symbol: string) => {
    try {
      // Using CoinGecko API for demo purposes. You might want to use a different API in production.
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=1`)
      return response.data.prices
    } catch (error) {
      console.error('Error fetching price chart:', error)
      throw new Error('Failed to fetch price chart data')
    }
  }
}

