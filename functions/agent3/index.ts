// import { ChainType,getStepTransaction, getStatus,  executeRoute, getChains, getRoutes, RoutesRequest } from '@lifi/sdk';
import { getTokenDetails } from '@/helper/helper';
import axios from 'axios';
// import { ChainType, executeRoute, getChains, getRoutes, RoutesRequest } from '@lifi/sdk';

export const requestQuoteSol = async (fromToken : string, toToken: string, fromAmount: string, walletAddress:string) => {
  try {
    const url = `https://quote-api.jup.ag/v6/quote`;



    if (!fromToken || !toToken || !fromAmount) {
      throw new Error("Missing required parameters");
    }
    const fromTokenAddressObject = await getTokenDetails(fromToken);
    console.log("fromTokenAddressObject", fromTokenAddressObject)
    const fromTokenAddress = fromTokenAddressObject?.address;
    // console.log("fromTokenAddress", fromTokenAddress)
    const fromTokenDecimals = fromTokenAddressObject?.decimals;
    const fromTokenAmount = parseFloat(fromAmount )* Math.pow(10, fromTokenDecimals);
    // console.log("fromTokenAmount", fromTokenAmount)
    const fromTokenLogo = fromTokenAddressObject?.logoURI;
    const fromTokenSymbol = fromTokenAddressObject?.symbol;
    

    const toTokenAddressObject = await getTokenDetails(toToken);
    const toTokenAddress = toTokenAddressObject?.address;
    // console.log("toTokenAddress", toTokenAddress)
    const toTokenDecimals = toTokenAddressObject?.decimals;
    const toTokenLogo = toTokenAddressObject?.logoURI;
    const toTokenSymbol = toTokenAddressObject?.symbol;


    const params = {
      inputMint:fromTokenAddress,
      outputMint:toTokenAddress,
      amount:fromTokenAmount,
      slippageBps : 300,
    };


    const response = await axios.get(url, { params });
    // console.log("response", response.data)
    // console.log(response)

    const smt  = await getSwapData(response.data, walletAddress)
    // console.log("smt ----------------------", smt)
    // const inAmount = fromTokenAmount;
    const outAmount = parseInt(response.data.outAmount) / Math.pow(10, toTokenDecimals);

    
    const data = {
      transactionData: smt.swapTransaction,
      slippage:response.data.slippageBps,
      inAmount:fromAmount,
      outAmount:outAmount,
      inCA: response.data.inputMint,
      outCA: response.data.outputMint,
      fromTokenLogo:fromTokenLogo,
      toTokenLogo:toTokenLogo,
      fromTokenSymbol:fromTokenSymbol,
      toTokenSymbol:toTokenSymbol,

    }




    return data; 
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw new Error('Failed to fetch quote');
  }
};

export async function getSwapData(quoteResponse : string, walletAddress:string) {
  try {
    const url = 'https://quote-api.jup.ag/v6/swap';
    const payload = {
      quoteResponse,
      userPublicKey:walletAddress,
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


