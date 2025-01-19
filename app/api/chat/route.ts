import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { DynamicTool } from '@langchain/core/tools'
import { agent1Functions } from '@/functions/agent1'
import { agent2Functions } from '@/functions/agent2'
import {  requestQuoteSol } from '@/functions/agent3'
import { agent4Functions } from '@/functions/agent4'
import { agent5Functions } from '@/functions/agent5'
import { createDLMMPosition } from '@/functions/agent3/create-dlmm'
import { createSolanaConnection } from '@/lib/solana'

// import { getTokenDetails } from '@/helper/helper'



export async function POST(req: NextRequest) {
  try {
    const { messages, agent } = await req.json()

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
    case 'agent-1':
      return [
        new DynamicTool({
          name: "fetchDLMMPools",
          description: "Fetch all available DLMM pools",
          func: async () => await agent1Functions.fetchDLMMPools(),
        }),
        new DynamicTool({
          name: "fetchPoolsByToken",
          description: "Fetch DLMM pools filtered by a specific token address",
          func: async (token: string) => await agent1Functions.fetchPoolsByToken(token),
        }),
        new DynamicTool({
          name: "addLiquidityToPosition",
          description: "Add liquidity to an existing position in a DLMM pool. Input format: 'connection,poolAddress,userPublicKey,user,totalXAmount,totalYAmount,totalRangeInterval'",
          func: async (input: string) => await agent1Functions.addLiquidityToPosition(input),
        }),
        new DynamicTool({
          name: "createLiquidityPosition",
          description: "Create a new liquidity position and add initial liquidity. Input format: 'connection,poolAddress,userPublicKey,user,totalXAmount,totalYAmount,totalRangeInterval'",
          func: async (input: string) => await agent1Functions.createLiquidityPosition(input),
        }),
      ]
    case 'agent-2':
      return [
        new DynamicTool({
          name: "initializeDLMMPool",
          description: "Initialize a DLMM pool and get its active bin information. Input format: 'connection,poolAddress'",
          func: async (input: string) => await agent2Functions.initializeDLMMPool(input),
        }),
        new DynamicTool({
          name: "getUserPositions",
          description: "Get all positions for a user in a specific pool. Input format: 'connection,poolAddress,userPublicKey'",
          func: async (input: string) => await agent2Functions.getUserPositions(input),
        }),
        new DynamicTool({
          name: "createPosition",
          description: "Create a new position and add initial liquidity. Input format: 'connection,poolAddress,userPublicKey,totalXAmount,rangeInterval'",
          func: async (input: string) => await agent2Functions.createPosition(input),
        }),
        new DynamicTool({
          name: "removeLiquidity",
          description: "Remove liquidity from a position. Input format: 'connection,poolAddress,userPublicKey,positionPublicKey,shouldClaimAndClose'",
          func: async (input: string) => await agent2Functions.removeLiquidity(input),
        }),
        new DynamicTool({
          name: "performSwap",
          description: "Perform a swap operation. Input format: 'connection,poolAddress,userPublicKey,swapAmount,swapYtoX,slippageBps'",
          func: async (input: string) => await agent2Functions.performSwap(input),
        }),
      ]
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
          name: "createDLMMPosition",
          description: "Create a new DLMM position and add initial liquidity. Input should be a json string with format: {pairAddress: string, walletAddress: string, positionKey: string, amount: string}",
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
              amount,
              connection
            })
            console.log("Response ---------------- ",response)

            return "outcopde is kkm"
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
    case 'agent-5':
      return [
        new DynamicTool({
          name: "getMarketData",
          description: "Get market data",
          func: async () => JSON.stringify(await agent5Functions.getMarketData()),
        }),
        new DynamicTool({
          name: "tradePair",
          description: "Trade a pair",
          func: async (input: string) => {
            const [pair, amount] = input.split(',')
            return JSON.stringify(await agent5Functions.tradePair(pair, Number(amount)))
          },
        }),
      ]
    default:
      return []
  }
}