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

  type Token = {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    tags: string[];
    daily_volume: number;
    created_at: string;
    freeze_authority: string | null;
    mint_authority: string | null;
    permanent_delegate: string | null;
    minted_at: string | null;
    extensions: {
      coingeckoId: string;
    };
  };
  
export  async function getTokenDetailsUsingCA(CA: string): Promise<Token | null> {
    try {
      const response = await fetch("https://tokens.jup.ag/tokens?tags=verified");
      if (!response.ok) {
        throw new Error("Failed to fetch token data");
      }
  
      const tokens: Token[] = await response.json();
      const token = tokens.find((t) => t.address === CA);
  
      return token || null;
    } catch (error) {
      console.error("Error fetching token details:", error);
      return null;
    }
  }
  