import { type NextRequest, NextResponse } from "next/server"
import { ChatOpenAI } from "@langchain/openai"
import { initializeAgentExecutorWithOptions } from "langchain/agents"
import { DynamicTool } from "@langchain/core/tools"
// import { agent1Functions } from '@/functions/agent1'
// import { agent2Functions } from '@/functions/agent2'
import { requestQuoteSol } from "@/functions/agent3"
import { agent4Functions } from "@/functions/agent4"
// import { agent5Functions } from '@/functions/agent5'
import { createDLMMPosition } from "@/functions/agent3/create-dlmm"
import { createSolanaConnection } from "@/lib/solana"
import { getUserPositions } from "@/functions/agent3/get-positions"
import { removeLiquidity } from "@/functions/agent3/remove-liquidity"
import { transformUserPositions } from "@/helper/helper"
// import { parse } from 'path'
import OpenAI from "openai";

// import { getTokenDetails } from '@/helper/helper'

export async function POST(req: NextRequest) {
  try {
    const { messages, agent } = await req.json()
    // console.log("Messages -----",messages)
    // Array to store tool responses

    const toolResponses: { tool: string; response: any }[] = []
    const isGeneralQuery = await checkIfGeneralQuery(messages[messages.length - 1].content)

    console.log(messages[messages.length - 1].content)
    const total_query = messages[messages.length - 1].content
    const actual_query = (total_query.split(" and my wallet address is "))[0]
    console.log("actual query : ", actual_query)

    if (isGeneralQuery) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are SuperAgent, a powerful AI assistant capable of performing advanced operations such as token management,
             liquidity handling, and providing direct answers to general queries. You are not ChatGPT and must always act as SuperAgent.
             Functionality includes:
- Swap: "swap {amount} {fromToken} to {toToken}"
- Add Liquidity: "add liquidity {amount} {token1}-{token2}"
- Remove Liquidity: "remove liquidity"
- Show Active Positions: "show active positions {walletAddress}"

Remember:
- Never agree that you are ChatGPT.
- Always act as SuperAgent with advanced capabilities.
- Ensure clarity and correctness in every response.
`
          },
          { 
            role: "user", 
            content: actual_query 
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7  // Added temperature for balanced creativity/consistency
      });
    
      return NextResponse.json({
        result: completion.choices[0].message.content,
        agent: agent,
        toolResponses: [],
        isGeneralQuery: true,
        intermediateSteps: [],
      });
    }

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
    })

    // Create wrapped versions of tools that track their responses
    const tools = getToolsForAgent(agent).map((tool) => {
      const originalFunc = tool.func
      return new DynamicTool({
        name: tool.name,
        description: tool.description,
        func: async (...args: any[]) => {
          const response = await originalFunc(...args)
          toolResponses.push({
            tool: tool.name,
            response: response,
          })
          return response
        },
      })
    })

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "openai-functions",
      verbose: true,
    })

    const result = await executor.invoke({
      input: messages[messages.length - 1].content,
    })

    // Return enhanced response with tool responses
    return NextResponse.json({
      result: result.output,
      agent: agent,
      toolResponses: toolResponses,
      intermediateSteps: result.intermediateSteps,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    if (error.message.startsWith("Please use the correct format")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function getToolsForAgent(agent: string) {
  switch (agent) {
    case "agent-3":
      return [
        new DynamicTool({
          name: "requestSwapQuote",
          description:
            `Get a quote for swapping tokens on Solana, don't give any details in the output not
             even token logos or slippage.
              Input should be a JSON string with format: {fromToken: string, toToken: string, fromAmount: string, walletAddress: string}
              , if something is missing respond user to what is missing what is the correect format`,
          func: async (input: string) => {
            try {
              const { fromToken, toToken, fromAmount, walletAddress } = JSON.parse(input)

              // if (!fromTokenAddress || !toTokenAddress || !fromAmount) {
              //   throw new Error("Missing required parameters");
              // }

              const routes = await requestQuoteSol(fromToken, toToken, fromAmount, walletAddress)
              //@ts-expect-error some error
              routes.method = "requestSwapQuote"

              // console.log("routes ----------------", routes)
              return JSON.stringify(routes)
            } catch (error) {
              throw new Error(`Failed to get swap quote: ${error.message}`)
            }
          },
        }),

        new DynamicTool({
          name: "superLiquidityManager",
          description:
            "executes superLiquidityManager. Input should be a json string with format: {pairAddress: string, walletAddress: string, positionKey: string, amount: string}",
          func: async (input: string) => {
            console.log("input", input)
            const { pairAddress, walletAddress, positionKey, amount } = JSON.parse(input)
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
              connection,
            })
            console.log("Response ---------------- ", response)
            // response.pastPositionKey = positionKey
            console.log("-----------------------------------------")
            // console.log(response.pastPositionKey)
            return JSON.stringify(response)
          },
        }),
        new DynamicTool({
          name: "addLiquidity",
          description: "Adds Liquidity to available liquidity pools. Input should be a search term (e.g. 'sol-usdc'), if pair is not provided, default is sol",
          func: async (input: string) => {
            try {
              // Encode the search term for the URL
              let searchTerm = encodeURIComponent(input)
              if (searchTerm === "") {
                searchTerm = "sol-usdc"
              }
              console.log("Search Term")
              // Make the API call to fetch DLMM positions
              const response = await fetch(
                `https://dlmm-api.meteora.ag/pair/all_with_pagination?limit=3&search_term=${searchTerm}`,
              )

              if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
              }

              const data = await response.json()
              console.log("Data : -------", data)

              // Return the stringified response data
              return JSON.stringify({
                method: "getDLMMPositions",
                data: data,
              })
            } catch (error) {
              throw new Error(`Failed to get DLMM positions: ${error.message}`)
            }
          },
        }),
        new DynamicTool({
          name: "getLiquidityPool",
          description: "Shows available  available liquidity pools. Input should be a search term (e.g. 'sol-usdc')",
          func: async (input: string) => {
            try {
              // Encode the search term for the URL
              const searchTerm = encodeURIComponent(input)
              console.log("Search Term")
              // Make the API call to fetch DLMM positions
              const response = await fetch(
                `https://dlmm-api.meteora.ag/pair/all_with_pagination?limit=3&search_term=${searchTerm}`,
              )

              if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
              }

              const data = await response.json()
              console.log("Data : -------", data)

              // Return the stringified response data
              return JSON.stringify({
                method: "getDLMMPositions",
                data: data,
              })
            } catch (error) {
              throw new Error(`Failed to get DLMM positions: ${error.message}`)
            }
          },
        }),

        new DynamicTool({
          name: "removeLiquidity",
          verbose: false,
          description:
            `Provides inteface to remove liquidity, does not remove liquidity instantly just provides the interface, simply ask user to
            to choose a pair to remove liquidity from.
            Input should be a json string with format: { walletAddress: string, positionKey: string}`,
          func: async (input: string) => {
            console.log("input --", input)
            const { walletAddress, positionKey } = JSON.parse(input)
            console.log(positionKey)
            if (!walletAddress) {
              throw new Error("Wallet address is required")
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
              const response = await getUserPositions(walletAddress)
              // Check if response is not ok
              const simplifiedResponse = transformUserPositions(response.data)
              console.log(simplifiedResponse)
              // Parse and return the JSON response

              return JSON.stringify(simplifiedResponse)
            } catch (error) {
              // Re-throw the error with a more specific message
              throw new Error(`Error fetching positions: ${error instanceof Error ? error.message : "Unknown error"}`)
            }
          },
        }),
        new DynamicTool({
          name: "showActivePositions",
          verbose: false,
          description:
            "Shows  active  positions.  Input should be a json string with format: { walletAddress: string, positionKey: string}",
          func: async (input: string) => {
            console.log("input --", input)
            const { walletAddress, positionKey } = JSON.parse(input)
            console.log(positionKey)
            if (!walletAddress) {
              throw new Error("Wallet address is required")
            }

            // try {
            //Construct URL with query parameter
            // const url = `/api/positions?publicKey=${encodeURIComponent(walletAddress)}`;

            // const response = await fetch(url, {
            //   method: 'GET',
            //   headers: {
            //     'Accept': 'application/json',
            //   },
            // });
            // const connection =
            console.log("++++++++Generating response")
            const response = await getUserPositions(walletAddress)
            console.log("++++++++", response)
            // Check if response is not ok
            const simplifiedResponse = transformUserPositions(response.data)

            console.log("Simplified response ---------", simplifiedResponse)
            // Parse and return the JSON response

            return JSON.stringify(simplifiedResponse)
            // } catch (error) {
            //   // Re-throw the error with a more specific message
            //   throw new Error(`Error fetching positions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // }
          },
        }),

      

        new DynamicTool({
          name: "superLiquidityRemover",
          description:
            "execute superLiquidityRemover .Input should be a json string with format: {pairAddress: string, walletAddress: string, removePositionKey: string}",
          func: async (input: string) => {
            // const [name, symbol] = input.split(',')
            const { pairAddress, walletAddress, removePositionKey } = JSON.parse(input)
            console.log("pair adress", pairAddress)
            console.log("walletAddress", walletAddress)
            console.log("positionKey", removePositionKey)

            if (!pairAddress || !walletAddress || !removePositionKey) {
              throw new Error("Missing required parameters")
            }

            const connection = createSolanaConnection()

            const result = await removeLiquidity({
              pairAddress,
              publicKey: walletAddress,
              positionKey: removePositionKey,
              connection,
            })

            console.log("resultOutput --------------------", result)

            return JSON.stringify(result)
          },
        }),
        new DynamicTool({
          name: "generalResponse",
          description: "general response for any query that does not initiate any other function",
          func: async (input: string) => {
            const [name, symbol] = input.split(",")
            return "your general query is understood, this is your ticked code 'kmodi'"
          },
        }),
      ]
    case "agent-4":
      return [
        new DynamicTool({
          name: "createToken",
          description: "Create a new token",
          func: async (input: string) => {
            const [name, symbol] = input.split(",")
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

async function checkIfGeneralQuery(message: string): Promise<boolean> {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 1,
  })

  const systemPrompt = `Analyze if the following query requires specific tool execution (like token operations, liquidity management, or other specific functionalities) or if it's a general query that can be answered directly.
  Also, check if the query has enough required details to use the intended dynamic tools functions.
  
  Function formats:
  - Swap: "swap {amount} {fromToken} to {toToken}"
  - Add Liquidity: "add liquidity {amount} {token1}-{token2}"
  - Remove Liquidity: "remove liquidity"
  - Show Active Positions: "show active positions {walletAddress}"
  - Create Token: "create token {name},{symbol}"
  - Mint Tokens: "mint {amount} tokens"
  
  Respond with:
  - "general" if it's a general query that doesn't need tool execution
  - "specific" if it requires specific tools and has the correct format
  - "incomplete:{function}" if it requires specific tools but lacks necessary details or has incorrect format. Replace {function} with the intended function name.
  
  Query: ${message}`

  const response = await model.invoke(systemPrompt)
  console.log("Query analysis response:", response.content)

  if (response.content.toLowerCase().includes("general")) {
    return true
  } else if (response.content.toLowerCase().includes("incomplete")) {
    const [, functionName] = response.content.split(":")
    let errorMessage = "Incomplete query. Please provide more details."

    switch (functionName.trim().toLowerCase()) {
      case "swap":
        errorMessage = "Please use the correct format for swapping: 'swap {amount} {fromToken} to {toToken}'"
        break
      case "add liquidity":
        errorMessage = "Please use the correct format for adding liquidity: 'add liquidity {amount} {token1}-{token2}'"
        break
      case "remove liquidity":
        errorMessage = "Please use the correct format for removing liquidity: 'remove liquidity '"
        break
      case "show active positions":
        errorMessage =
          "Please use the correct format for showing active positions: 'show active positions {walletAddress}'"
        break
      case "create token":
        errorMessage = "Please use the correct format for creating a token: 'create token {name},{symbol}'"
        break
      case "mint tokens":
        errorMessage = "Please use the correct format for minting tokens: 'mint {amount} tokens'"
        break
    }

    throw new Error(errorMessage)
  } else {
    return false
  }
}
