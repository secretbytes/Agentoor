import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { DynamicTool } from '@langchain/core/tools'
import { agent1Functions } from '@/functions/agent1'
import { agent2Functions } from '@/functions/agent2'
import { agent3Functions } from '@/functions/agent3'
import { agent4Functions } from '@/functions/agent4'
import { agent5Functions } from '@/functions/agent5'

export async function POST(req: NextRequest) {
  try {
    const { messages, agent } = await req.json()

    const model = new ChatOpenAI({ 
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    })

    const tools = getToolsForAgent(agent)

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

    return NextResponse.json({ result: result.output })
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
          name: "getBalance",
          description: "Get the balance of a given address",
          func: async (address: string) => JSON.stringify(await agent1Functions.getBalance(address)),
        }),
        new DynamicTool({
          name: "transfer",
          description: "Transfer SOL to a given address",
          func: async (input: string) => {
            const [to, amount] = input.split(',')
            return JSON.stringify(await agent1Functions.transfer(to, Number(amount)))
          },
        }),
      ]
    case 'agent-2':
      return [
        new DynamicTool({
          name: "getNFTs",
          description: "Get NFTs for a given address",
          func: async (address: string) => JSON.stringify(await agent2Functions.getNFTs(address)),
        }),
      ]
    case 'agent-3':
      return [
        new DynamicTool({
          name: "deployContract",
          description: "Deploy a smart contract",
          func: async (code: string) => JSON.stringify(await agent3Functions.deployContract(code)),
        }),
        new DynamicTool({
          name: "verifyContract",
          description: "Verify a deployed contract",
          func: async (address: string) => JSON.stringify(await agent3Functions.verifyContract(address)),
        }),
      ]
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

