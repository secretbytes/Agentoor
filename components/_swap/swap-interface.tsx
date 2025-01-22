import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeftRight, Info } from 'lucide-react'
import Image from "next/image"
import { SwapExecutor } from "@/components/tempcomp"



export default function SwapInterface(prop: any) {
  const slippage = prop.props.slippage
  // console.log("usd Value ",prop.props.usdvalue)

  return (
    <div className="w-full ">
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg p-6">
        {/* Swap Interface */}
        <div className="grid gap-4">
          {/* From/To Cards Container */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            {/* From Card */}
            <Card className="bg-black/40 border border-primary/20 p-4">
              <h2 className="text-primary text-lg font-mono mb-4">From</h2>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <Image
                    src={prop.props.fromTokenLogo || "/placeholder.svg"}
                    alt={prop.props.fromTokenSymbol}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary/20 rounded-full" />
                </div>
                <div>
                  <div className="text-primary font-mono text-lg">{prop.props.fromTokenSymbol}</div>
                  <div className="text-primary/60 text-sm font-mono">SOLANA</div>
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono text-primary">{prop.props.inAmount}</div>
                
                <div className="text-primary/60 font-mono">
  {`${prop.props.inCA.slice(0, 4)}......${prop.props.inCA.slice(-4)}`}
</div>
              </div>
            </Card>

            {/* Swap Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full border border-primary/20 hover:bg-primary/20 text-primary"
            >
              <ArrowLeftRight className="w-6 h-6" />
            </Button>

            {/* To Card */}
            <Card className="bg-black/40 border border-primary/20 p-4">
              <h2 className="text-primary text-lg font-mono mb-4">To</h2>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Image
                      src={prop.props.toTokenLogo || "/placeholder.svg"}
                      alt={prop.props.toTokenSymbol}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary/20 rounded-full" />
                </div>
                <div>
                  <div className="text-primary font-mono text-lg">{prop.props.toTokenSymbol}</div>
                  <div className="text-primary/60 text-sm font-mono">SOLANA</div>
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono text-primary">{prop.props.outAmount}</div>
                <div className="text-primary/60 font-mono">
  {`${prop.props.outCA.slice(0, 4)}......${prop.props.outCA.slice(-4)}`}
</div>
              </div>
            </Card>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4 mt-4 border border-primary/20 rounded-md p-4 bg-black/20">
            <div className="flex justify-between items-center text-primary/80 font-mono">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                <span>Total (USD)</span>
              </div>
              <span>{prop.props.usdvalue}</span>
            </div>

            <div className="flex justify-between items-center text-primary/80 font-mono">
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
              <span>{slippage}%</span>
            </div>

            <div className="flex justify-between items-center text-primary/80 font-mono">
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
              <span>{prop.props.priceImpact}</span>
            </div>

            {/* <div className="flex justify-between items-center text-primary/80 font-mono">
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
              <span className="text-primary/60">Meteora DLMM</span>
            </div> */}
          </div>

          {/* Swap Button */}
          <SwapExecutor swapTransaction={prop.props.transactionData} />

          {/* AI Agent */}
          <div className="flex justify-end items-center gap-2 text-primary/60 text-sm mt-4 font-mono">
            <span>AI Agent:</span>
            <span>Jupiter Exchange</span>
          </div>
        </div>
      </Card>
    </div>
  )
}