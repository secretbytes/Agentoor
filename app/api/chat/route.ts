import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { DynamicTool } from '@langchain/core/tools'
// import { agent1Functions } from '@/functions/agent1'
// import { agent2Functions } from '@/functions/agent2'
import {  requestQuoteSol } from '@/functions/agent3'
import { agent4Functions } from '@/functions/agent4'
// import { agent5Functions } from '@/functions/agent5'
import { createDLMMPosition } from '@/functions/agent3/create-dlmm'
import { createSolanaConnection } from '@/lib/solana'
import { getUserPositions } from '@/functions/agent3/get-positions'
import { removeLiquidity } from '@/functions/agent3/remove-liquidity'

// import { parse } from 'path'

// import { getTokenDetails } from '@/helper/helper'



export async function POST(req: NextRequest) {
  try {
    const { messages, agent } = await req.json()
    // console.log("Messages -----",messages)
    // Array to store tool responses
    
    const toolResponses: { tool: string; response: any }[] = []

    const model = new ChatOpenAI({ 
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    })

    // Create wrapped versions of tools that track their responses
    const tools = getToolsForAgent(agent).map(tool => {
      const originalFunc = tool.func
      return new DynamicTool({
        name: tool.name,
        description: tool.description,
        func: async (...args: any[]) => {
          const response = await originalFunc(...args) 
          toolResponses.push({
            tool: tool.name,
            response: response
          })
          return response
        }
      })
    })

    const executor = await initializeAgentExecutorWithOptions(
      tools,
      model,
      {
        agentType: "openai-functions",
        verbose: true,
      }
    )

    const result = await executor.invoke({
      input: messages[messages.length - 1].content,
    })

    // Return enhanced response with tool responses
    return NextResponse.json({ 
      result: result.output,
      agent: agent,
      toolResponses: toolResponses,
      intermediateSteps: result.intermediateSteps
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function getToolsForAgent(agent: string) {
  switch (agent) {
    
    case 'agent-3':
      return [
        new DynamicTool({
          name: "requestSwapQuote",
          description: "Get a quote for swapping tokens on Solana, don't give any details in the output not even token logos or slippage. Input should be a JSON string with format: {fromToken: string, toToken: string, fromAmount: string, walletAddress: string}",
          func: async (input: string) => {
            try {
              const { fromToken, toToken, fromAmount, walletAddress,  } = JSON.parse(input);
  
              // if (!fromTokenAddress || !toTokenAddress || !fromAmount) {
              //   throw new Error("Missing required parameters");
              // }
              
              const routes = await requestQuoteSol(fromToken, toToken, fromAmount, walletAddress);
              //@ts-expect-error some error
              routes.method = "requestSwapQuote";
              
              // console.log("routes ----------------", routes)
              return JSON.stringify(routes);
            } catch (error) {
              throw new Error(`Failed to get swap quote: ${error.message}`);
            }
          }
        }),

        new DynamicTool({
          name: "specialfunction2",
          description: "executes specialfunction2. Input should be a json string with format: {pairAddress: string, walletAddress: string, positionKey: string, amount: string}",
          func: async (input: string) => {
            console.log("input", input)
            const {pairAddress, walletAddress, positionKey, amount} = JSON.parse(input)
            const connection = await createSolanaConnection() 
            console.log("pairAddress", pairAddress)
            console.log("publicKey", walletAddress)
            console.log("positionKey", positionKey)
            console.log("amount", amount)
            
            const response = await createDLMMPosition({
              pairAddress,
              publicKey: walletAddress,
              positionKey,
              amount ,
              connection
            })
            console.log("Response ---------------- ",response)
            // response.pastPositionKey = positionKey
            console.log("-----------------------------------------")
            // console.log(response.pastPositionKey)
            return JSON.stringify(response)
          },
        }),
        new DynamicTool({
          name: "addLiquidity",
          description: "Adds Liquidity to available liquidity pools. Input should be a search term (e.g. 'sol-usdc')",
          func: async (input: string) => {
            try {
              // Encode the search term for the URL
              const searchTerm = encodeURIComponent(input);
              console.log("Search Term")
              // Make the API call to fetch DLMM positions
              const response = await fetch(
                `https://dlmm-api.meteora.ag/pair/all_with_pagination?limit=3&search_term=${searchTerm}`
              );
        
              if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
              }
        
              const data = await response.json();
              console.log("Data : -------",data)

              // Return the stringified response data
              return JSON.stringify({
                method: "getDLMMPositions",
                data: data
              });
              
            } catch (error) {
              throw new Error(`Failed to get DLMM positions: ${error.message}`);
            }
          },
        }),
        
        new DynamicTool({
          name: "removeLiquidity",
          verbose: false,
          description: "Removes Liquidity from current active positions.  Input should be a json string with format: { walletAddress: string, positionKey: string}",
          func: async (input: string) => {
            console.log("input --", input)
            const {walletAddress, positionKey} = JSON.parse(input);
              console.log(positionKey)
            if (!walletAddress) {
              throw new Error('Wallet address is required');
            }
      
            try {
              //Construct URL with query parameter
              // const url = `/api/positions?publicKey=${encodeURIComponent(walletAddress)}`;
              
              // const response = await fetch(url, {
              //   method: 'GET',
              //   headers: {
              //     'Accept': 'application/json',
              //   },
              // });
              // const connection = 
              const response =  await getUserPositions(walletAddress)
              // Check if response is not ok
              
              console.log(response)
              // Parse and return the JSON response
             
              return JSON.stringify(response);
            } catch (error) {
              // Re-throw the error with a more specific message
              throw new Error(`Error fetching positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }),


        new DynamicTool({
          name: "createToken",
          description: "Create a new token",
          func: async (input: string) => {
            const {pairAddress, walletAddress, positionKey} = JSON.parse(input)

            const url =  `/api/remove-liquidity?pairAddress=${pairAddress}&publicKey=${walletAddress}&positionKey=${positionKey}`;
            
            try {
              const response = await fetch(url);
              const data = await response.json();
              console.log(data);
            } catch (error) {
              console.error('Error:', error);
            }

          },
        }),


        new DynamicTool({
          name: "specialfunction1",
          description: "execute specialfunction1 .Input should be a json string with format: {pairAddress: string, walletAddress: string, removePositionKey: string}",
          func: async (input: string) => {
            // const [name, symbol] = input.split(',')
            const {pairAddress, walletAddress, removePositionKey} = JSON.parse(input)
            console.log("pair adress", pairAddress)
            console.log("walletAddress", walletAddress)
            console.log("positionKey", removePositionKey)

            if (!pairAddress || !walletAddress || !removePositionKey) {
              throw new Error('Missing required parameters');
          }

            const connection = createSolanaConnection();

            const result = await removeLiquidity({
              pairAddress,
              publicKey: walletAddress,
              positionKey:removePositionKey,
              connection
          });

            console.log("resultOutput --------------------", result)

            return JSON.stringify(result)
          },
        }),


      ];
    case 'agent-4':
      return [
        new DynamicTool({
          name: "createToken",
          description: "Create a new token",
          func: async (input: string) => {
            const [name, symbol] = input.split(',')
            return JSON.stringify(await agent4Functions.createToken(name, symbol))
          },
        }),
        new DynamicTool({
          name: "mintTokens",
          description: "Mint tokens",
          func: async (amount: string) => JSON.stringify(await agent4Functions.mintTokens(Number(amount))),
        }),
      ]
    
    default:
      return []
  }
}