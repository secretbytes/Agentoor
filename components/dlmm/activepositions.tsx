"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
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
  publicKey: string
}

interface ActivePosition {
  lbPair: LBPair
  lbPairPositionsData: LBPairPosition[]
}

interface ActivePositionsProps {
  positions: {
    [key: string]: ActivePosition
  }
  handleSubmit: (message: string) => void
}

interface TokenPair {
  tokenX: Token | null
  tokenY: Token | null
}

const getObjectData = async (CA: string) => {
  const tokenObject = await getTokenDetailsUsingCA(CA)
  return tokenObject
}

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
  const [tokenPairs, setTokenPairs] = useState<{ [key: string]: TokenPair }>({})
    // console.log("positions : ", positions)
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const pairPromises = Object.entries(positions).map(async ([pairKey, position]) => {
          const tokenXCA = position.lbPair.tokenXMint
          const tokenYCA = position.lbPair.tokenYMint

          const [tokenX, tokenY] = await Promise.all([getObjectData(tokenXCA), getObjectData(tokenYCA)])

          return [pairKey, { tokenX, tokenY }]
        })

        const pairResults = await Promise.all(pairPromises)
        const newTokenPairs = Object.fromEntries(pairResults)
        setTokenPairs(newTokenPairs)
      } catch (error) {
        console.error("Error fetching token data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [positions])

  const formatAmount = (amount: string, decimals: number) => {
    const value = Number(amount) / Math.pow(10, decimals)
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
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
            {Object.entries(positions).map(([pairKey, position]) => {
              const tokenPair = tokenPairs[pairKey]
              if (!tokenPair) return null

              return (
                <AccordionItem
                  key={pairKey}
                  value={pairKey}
                  className="border border-primary/20 rounded-lg overflow-hidden bg-black/40"
                >
                  <div className="flex items-center justify-between w-full px-4 py-3">
                    <AccordionTrigger className="flex-grow hover:no-underline">
                      <div className="flex items-center gap-4">
                        <ChevronRight className="w-4 h-4 text-primary/60 rotate-icon transition-transform duration-200" />
                        <div className="flex items-center">
                          <div className="relative w-16 h-8">
                            {tokenPair.tokenX?.logoURI && (
                              <div className="absolute left-0 w-8 h-8 rounded-full overflow-hidden border-2 border-primary z-10">
                                <Image
                                  src={tokenPair.tokenX.logoURI || "/placeholder.svg"}
                                  alt={tokenPair.tokenX.symbol}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {tokenPair.tokenY?.logoURI && (
                              <div className="absolute left-8 w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
                                <Image
                                  src={tokenPair.tokenY.logoURI || "/placeholder.svg"}
                                  alt={tokenPair.tokenY.symbol}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <div className="ml-2">
                            <div className="text-primary font-mono text-left">
                              {tokenPair.tokenX?.symbol}/{tokenPair.tokenY?.symbol}
                            </div>
                            <div className="text-primary/60 text-sm font-mono text-left">
                              Bin Step: {position.lbPair.binStep}
                            </div>
                            <div className="text-primary/60 text-xs font-mono text-left">
                              Pair Key: {`${pairKey.slice(0, 4)}...${pairKey.slice(-4)}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          const removePositionKey = position.lbPairPositionsData[0].publicKey
                          const message = `execute superLiquidityRemover with ${pairKey} and removePositionKey is ${removePositionKey}`
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
                          {tokenPair.tokenX?.logoURI && (
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-primary mr-2">
                              <Image
                                src={tokenPair.tokenX.logoURI || "/placeholder.svg"}
                                alt={tokenPair.tokenX.symbol}
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span>
                            {tokenPair.tokenX?.symbol} ({tokenPair.tokenX?.name})
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Token Y:</span>
                        <div className="flex items-center">
                          {tokenPair.tokenY?.logoURI && (
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-primary mr-2">
                              <Image
                                src={tokenPair.tokenY.logoURI || "/placeholder.svg"}
                                alt={tokenPair.tokenY.symbol}
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span>
                            {tokenPair.tokenY?.symbol} ({tokenPair.tokenY?.name})
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Bin Step:</span>
                        <span>{position.lbPair.binStep}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token X Amount:</span>
                        <span>
                          {formatAmount(position.lbPairPositionsData[0].totalXAmount, tokenPair.tokenX?.decimals || 0)} {tokenPair.tokenX?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reward One:</span>
                        <span>
                          {formatAmount(position.lbPairPositionsData[0].rewardOne, tokenPair.tokenX?.decimals || 0)} {tokenPair.tokenX?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reward Two:</span>
                        <span>
                          {formatAmount(position.lbPairPositionsData[0].rewardTwo, tokenPair.tokenY?.decimals || 0)} {tokenPair.tokenY?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token X Mint:</span>
                        <span>{`${position.lbPair.tokenXMint.slice(0, 4)}...${position.lbPair.tokenXMint.slice(-4)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token Y Mint:</span>
                        <span>{`${position.lbPair.tokenYMint.slice(0, 4)}...${position.lbPair.tokenYMint.slice(-4)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Position Key:</span>
                        <span>{`${position.lbPairPositionsData[0].publicKey.slice(0, 4)}...${position.lbPairPositionsData[0].publicKey.slice(-4)}`}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </Card>
    </div>
  )
}