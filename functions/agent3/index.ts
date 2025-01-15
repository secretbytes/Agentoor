// import { ChainType,getStepTransaction, getStatus,  executeRoute, getChains, getRoutes, RoutesRequest } from '@lifi/sdk';
import axios from 'axios';
import { ChainType, executeRoute, getChains, getRoutes, RoutesRequest } from '@lifi/sdk';

export const requestQuoteSol = async (fromTokenAddress : string, toTokenAddress: string, fromAmount: string) => {
  try {
    const url = `https://quote-api.jup.ag/v6/quote`;
    const params = {
      inputMint:fromTokenAddress,
      outputMint:toTokenAddress,
      amount:fromAmount,
      slippageBps : 30,
    };

    const response = await axios.get(url, { params });
    console.log("response", response.data)

    const smt  = await getSwapData(response.data, "DCUN96uamHLHiV1j3wVMC3uzRHxtuXB1mCs1p2bcLnEp")
    console.log("smt ----------------------", smt)
    return response.data; 
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw new Error('Failed to fetch quote');
  }
};

export async function getSwapData(quoteResponse : string, userPublicKey:string) {
  try {
    const url = 'https://quote-api.jup.ag/v6/swap';
    const payload = {
      quoteResponse,
      userPublicKey:"DCUN96uamHLHiV1j3wVMC3uzRHxtuXB1mCs1p2bcLnEp",
      wrapAndUnwrapSol:true,
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Returns the swap transaction response
  } catch (error) {
    console.error('Error fetching swap transaction:', error);
    throw new Error('Failed to fetch swap transaction');
  }
}


