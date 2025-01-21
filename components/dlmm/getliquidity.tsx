"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight } from "lucide-react"

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

interface DLMMPosition {
  address: string
  name: string
  current_price: number
  liquidity: string
  apr: number
  fees_24h: number
  trade_volume_24h: number
  bin_step: number
  base_fee_percentage: string
  mint_x: string
}

interface DLMMPositionsProps {
  pairs: DLMMPosition[]
  handleSubmit: (message: string, amount: number) => void
}

async function getTokenDetailsUsingCA(CA: string): Promise<Token | null> {
  try {
    const response = await fetch("https://tokens.jup.ag/tokens?tags=verified")
    if (!response.ok) {
      throw new Error("Failed to fetch token data")
    }

    const tokens: Token[] = await response.json()
    const token = tokens.find((t) => t.address === CA)

    return token || null
  } catch (error) {
    console.error("Error fetching token details:", error)
    return null
  }
}

// Helper function to safely multiply by decimals
function toTokenAmount(amount: string, decimals: number): string {
  try {
    const [whole, fraction = ""] = amount.split(".")
    const paddedFraction = fraction.padEnd(decimals, "0")
    const trimmedFraction = paddedFraction.slice(0, decimals)
    const finalNumber = `${whole}${trimmedFraction}`
    return finalNumber.replace(/^0+/, "") || "0"
  } catch (error) {
    console.error("Error converting amount:", error)
    return "0"
  }
}

export default function DLMMPositions({ pairs, handleSubmit }: DLMMPositionsProps) {
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({})
  const [tokenDetails, setTokenDetails] = useState<{ [key: string]: Token | null }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokenDetails = async () => {
      const details: { [key: string]: Token | null } = {}
      for (const pair of pairs) {
        const token = await getTokenDetailsUsingCA(pair.mint_x)
        details[pair.mint_x] = token
      }
      setTokenDetails(details)  
      setLoading(false)
    }

    fetchTokenDetails()
  }, [pairs])

  const handleAmountChange = (address: string, value: string) => {
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmounts((prev) => ({ ...prev, [address]: value }))
    }
  }

  const isValidAmount = (amount: string) => {
    return /^\d*\.?\d+$/.test(amount) && Number.parseFloat(amount) > 0
  }

  return (
    <div className="w-full">
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg">
        <div className="p-4">
          {/* <h2 className="text-primary text-xl font-mono mb-4">Solana Pools</h2> */}
          <Accordion type="single" collapsible className="space-y-2">
            {pairs.map((pair) => (
              <AccordionItem
                key={pair.address}
                value={pair.address}
                className="border border-primary/20 rounded-lg overflow-hidden bg-black/40"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>div>.rotate-icon]:rotate-90">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <ChevronRight className="w-4 h-4 text-primary/60 rotate-icon transition-transform duration-200" />
                      <div>
                        <div className="text-primary font-mono text-left">{pair.name}</div>
                        <div className="text-primary/60 text-sm font-mono text-left">
                          Current Daily APY: {pair.apr.toFixed(2)}%
                        </div>
                        <div className="text-primary/60 text-xs font-mono text-left">
                          CA: {`${pair.mint_x.slice(0, 4)}...${pair.mint_x.slice(-4)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Amount"
                        value={amounts[pair.address] || ""}
                        onChange={(e) => handleAmountChange(pair.address, e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                      <span className="text-xs text-primary/60">
                        in ({tokenDetails[pair.mint_x]?.symbol})
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="ml-auto"
                        disabled={!isValidAmount(amounts[pair.address] || "")}
                        onClick={(e) => {
                          e.preventDefault()
                          const tokenAmount = toTokenAmount(
                            amounts[pair.address] || "0",
                            tokenDetails[pair.mint_x]?.decimals || 0
                          )
                          handleSubmit(
                            `execute specialfunction2 ${pair.address} with amount ${tokenAmount}`,
                            Number.parseFloat(amounts[pair.address])
                          )
                        }}
                      >
                        Deposit
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="space-y-2 text-primary/80 font-mono">
                    <div className="flex justify-between">
                      <span>Total Liquidity:</span>
                      <span>${Number(pair.liquidity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>24h Trading Volume:</span>
                      <span>${pair.trade_volume_24h.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>24h Fees:</span>
                      <span>${pair.fees_24h.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Price:</span>
                      <span>${pair.current_price.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bin Step:</span>
                      <span>{pair.bin_step}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Fee:</span>
                      <span>{pair.base_fee_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pool Address:</span>
                      <span className="text-xs">{`${pair.address.slice(0, 4)}...${pair.address.slice(-4)}`}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Card>
    </div>
  )
}