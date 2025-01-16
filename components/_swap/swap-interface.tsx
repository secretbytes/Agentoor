'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeftRight, Info } from 'lucide-react'
import Image from "next/image"
import { SwapData } from "@/types/swap"
import { SwapExecutor } from "@/components/tempcomp"


const swapData: SwapData = {
    from: {
      symbol: 'USDC',
      network: 'SOLANA',
      amount: '0.100000',
      value: '$0.10',
      icon: '/placeholder.svg?height=40&width=40'
    },
    to: {
      symbol: 'SOL',
      network: 'SOLANA',
      amount: '0.000496',
      value: '$0.10',
      icon: '/placeholder.svg?height=24&width=24',
      bgColor: 'black'
    },
    total: '$0.1',
    slippage: '1.00%',
    priceImpact: '<0.1%',
    via: {
      name: 'Meteora DLMM',
      type: 'route'
    },
    aiAgent: {
      name: 'Jupiter Exchange'
    }
  }

export const handleSwap = async (swapData) => {
    const response = await SwapExecutor(swapData)
    console.log("🚀 ~ handleSwap ~ response", response)

}


export default function SwapInterface(prop) {
    console.log("🚀 ~ SwapInterface ~ prop", prop)
    console.log("🚀 ~ SwapInterface ~ transactionData", prop.props.transactionData)
    // console.log("🚀 ~ SwapInterface ~ inAmount", inAmount)
    // console.log("🚀 ~ SwapInterface ~ outAmount", outAmount)
    // console.log("🚀 ~ SwapInterface ~ slippage", slippage)




  return (
    <div className="min-h-screen bg-[#F8F7FD] p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-full overflow-hidden">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/orbitui.jpg-psgev6Nv3w0p8Zni0fgCAgUbkKQwJj.jpeg"
              alt="Orbit Logo"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-medium text-gray-700">Orbit</h1>
        </div>

        {/* Main Card */}
        <Card className="p-6 bg-white shadow-sm">
          {/* Swap Interface */}
          <div className="grid gap-4">
            {/* From/To Cards Container */}
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
              {/* From Card */}
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">From</h2>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <Image
                      src={swapData.from.icon || "/placeholder.svg"}
                      alt={swapData.from.symbol}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-100 rounded-full" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{swapData.from.symbol}</div>
                    <div className="text-gray-500 text-sm">{swapData.from.network}</div>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-mono">{prop.props.inAmount}</div>
                  <div className="text-gray-600">{swapData.from.value}</div>
                </div>
              </Card>

              {/* Swap Button */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeftRight className="w-6 h-6" />
              </Button>

              {/* To Card */}
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">To</h2>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className={`w-10 h-10 ${swapData.to.bgColor ? 'bg-black' : ''} rounded-full flex items-center justify-center`}>
                      <Image
                        src={swapData.to.icon || "/placeholder.svg"}
                        alt={swapData.to.symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-100 rounded-full" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{swapData.to.symbol}</div>
                    <div className="text-gray-500 text-sm">{swapData.to.network}</div>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-mono">{prop.props.outAmount}</div>
                  <div className="text-gray-600">{swapData.to.value}</div>
                </div>
              </Card>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  <span>Total (USD)</span>
                </div>
                <span className="font-medium">{swapData.total}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 3L3 21" />
                    <path d="M21 21L3 3" />
                  </svg>
                  <span>Slippage Setting</span>
                </div>
                <span className="font-medium">{prop.props.Slippage}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                  </svg>
                  <span>Price Impact</span>
                </div>
                <span className="font-medium">{swapData.priceImpact}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span>Via</span>
                </div>
                <span className="text-gray-400">{swapData.via.name}</span>
              </div>
            </div>

            {/* Swap Button */}
            <SwapExecutor swapTransaction={prop.props.transactionData} />

            {/* AI Agent */}
            <div className="flex justify-end items-center gap-2 text-gray-400 text-sm mt-4">
              <span>AI Agent:</span>
              <span>{swapData.aiAgent.name}</span>
            </div>
          </div>
        </Card> 
      </div>
    </div>
  )
}

