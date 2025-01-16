import axios from "axios";



export async function getTokenDetails(tokenName : string) {
    try {
      const response = await axios.get('https://tokens.jup.ag/tokens?tags=verified');
  
      // Get the token data from the API response
      const tokens = response.data;
      const filteredTokens = tokens.filter(token => 
        token.symbol.toLowerCase().includes(tokenName.toLowerCase()) &&
        token.extensions && token.extensions.coingeckoId
      );
      
      // Return the filtered token details
      if (filteredTokens.length > 0) {
       return filteredTokens[0]
      } 
      
    } catch (error) {
      console.error('Error fetching token details', error);
      throw new Error('Failed to fetch token details');
    }
  }