"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight } from "lucide-react"
import { getTokenDetailsUsingCA } from "@/helper/helper"

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

interface LBPair {
  binStep: number
  tokenXMint: string
  tokenYMint: string
}

interface LBPairPosition {
  totalXAmount: string
  rewardOne: string
  rewardTwo: string
}

interface ActivePosition {
  tokenX: Token
  tokenY: Token
  lbPair: LBPair
  lbPairPositionsData: LBPairPosition[]
}

interface ActivePositionsProps {
  positions: {
    [key: string]: ActivePosition
  }
  handleSubmit: (message: string) => void
}

const getObjectData = async (CA: string) => {
  const tokenObject = await getTokenDetailsUsingCA(CA)
  return tokenObject
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

export default function ActivePositions({ positions, handleSubmit }: ActivePositionsProps) {
  const [loading, setLoading] = useState(true)
  const [tokenXObject, setTokenXObject] = useState<Token | null>(null)
  const [tokenYObject, setTokenYObject] = useState<Token | null>(null)
  const [removeAmount, setRemoveAmount] = useState<string>("")
  const PairKey = Object.keys(positions)[0]
    // console.log(positions[PairKey].lbPairPositionsData[0].publicKey)
    const removePositionKey = positions[PairKey].lbPairPositionsData[0].publicKey
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const tokenXCA = positions[PairKey].lbPair.tokenXMint
        const tokenYCA = positions[PairKey].lbPair.tokenYMint

        const [tokenX, tokenY] = await Promise.all([getObjectData(tokenXCA), getObjectData(tokenYCA)])

        setTokenXObject(tokenX)
        setTokenYObject(tokenY)
      } catch (error) {
        console.error("Error fetching token data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [PairKey, positions])

  const handleAmountChange = (value: string) => {
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setRemoveAmount(value)
    }
  }

  const isValidAmount = (amount: string) => {
    return /^\d*\.?\d+$/.test(amount) && Number.parseFloat(amount) > 0
  }



  if (loading) {
    return <div className="text-primary font-mono">Loading active positions...</div>
  }

  return (
    <div className="w-full">
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg">
        <div className="p-4">
          <h2 className="text-primary text-xl font-mono mb-4">Active Positions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem
              key={PairKey}
              value={PairKey}
              className="border border-primary/20 rounded-lg overflow-hidden bg-black/40"
            >
              <div className="flex items-center justify-between w-full px-4 py-3">
                <AccordionTrigger className="flex-grow hover:no-underline">
                  <div className="flex items-center gap-4">
                    <ChevronRight className="w-4 h-4 text-primary/60 rotate-icon transition-transform duration-200" />
                    <div className="flex items-center">
                      <div className="relative w-16 h-8">
                        {tokenXObject?.logoURI && (
                          <div className="absolute left-0 w-8 h-8 rounded-full overflow-hidden border-2 border-primary z-10">
                            <Image
                              src={tokenXObject.logoURI || "/placeholder.svg"}
                              alt={tokenXObject.symbol}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                        )}
                        {tokenYObject?.logoURI && (
                          <div className="absolute left-8 w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
                            <Image
                              src={tokenYObject.logoURI || "/placeholder.svg"}
                              alt={tokenYObject.symbol}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="ml-2">
                        <div className="text-primary font-mono text-left">
                          {tokenXObject?.symbol}/{tokenYObject?.symbol}
                        </div>
                        <div className="text-primary/60 text-sm font-mono text-left">
                          Bin Step: {positions[PairKey].lbPair.binStep}
                        </div>
                        <div className="text-primary/60 text-xs font-mono text-left">
                          Pair Key: {`${PairKey.slice(0, 4)}...${PairKey.slice(-4)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2">
                  {/* <Input
                    type="text"
                    placeholder="Amount"
                    value={removeAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-24 h-8 text-sm"
                  /> */}
                  <span className="text-xs text-primary/60">in ({tokenXObject?.symbol})</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    // disabled={!isValidAmount(removeAmount)}
                    onClick={(e) => {
                      e.preventDefault()
                    //   const tokenAmount = toTokenAmount(removeAmount, tokenXObject?.decimals || 0)
                      const message = `execute specialfunction1 with  ${PairKey} and removePositionKey is ${removePositionKey}`
                      handleSubmit(message)
                    }}
                  >
                    Remove Liquidity
                  </Button>
                </div>
              </div>
              <AccordionContent className="px-4 pb-3 pt-0">
                <div className="space-y-2 text-primary/80 font-mono">
                  <div className="flex justify-between items-center">
                    <span>Token X:</span>
                    <div className="flex items-center">
                      {tokenXObject?.logoURI && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-primary mr-2">
                          <Image
                            src={tokenXObject.logoURI || "/placeholder.svg"}
                            alt={tokenXObject.symbol}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span>
                        {tokenXObject?.symbol} ({tokenXObject?.name})
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Token Y:</span>
                    <div className="flex items-center">
                      {tokenYObject?.logoURI && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-primary mr-2">
                          <Image
                            src={tokenYObject.logoURI || "/placeholder.svg"}
                            alt={tokenYObject.symbol}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span>
                        {tokenYObject?.symbol} ({tokenYObject?.name})
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Bin Step:</span>
                    <span>{positions[PairKey].lbPair.binStep}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token X Mint:</span>
                    <span>{`${positions[PairKey].lbPair.tokenXMint.slice(0, 4)}...${positions[PairKey].lbPair.tokenXMint.slice(-4)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Y Mint:</span>
                    <span>{`${positions[PairKey].lbPair.tokenYMint.slice(0, 4)}...${positions[PairKey].lbPair.tokenYMint.slice(-4)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total X Amount:</span>
                    <span>{positions[PairKey].lbPairPositionsData[0].totalXAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reward One:</span>
                    <span>{positions[PairKey].lbPairPositionsData[0].rewardOne}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reward Two:</span>
                    <span>{positions[PairKey].lbPairPositionsData[0].rewardTwo}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Card>
    </div>
  )
}

