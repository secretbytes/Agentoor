"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight } from "lucide-react"

interface StakedSolPosition {
  mint: string
  token_program: string
  name: string
  symbol: string
  logo_uri: string
  decimals: number
  pool: {
    program: string
    pool?: string
    validator_list?: string
    vote_account?: string | null
  }
  apy: number
}

interface StakedSolPositionsProps {
  positions: StakedSolPosition[]
  handleSubmit: (message: string) => void
}

export default function StakedSolPositions({ positions, handleSubmit }: StakedSolPositionsProps) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [stakeAmounts, setStakeAmounts] = useState<{ [key: string]: string }>({})

  const formatAPY = (apy: number) => {
    return (apy * 100).toFixed(2) + "%"
  }

  const handleStakeAmountChange = (mint: string, amount: string) => {
    setStakeAmounts((prev) => ({ ...prev, [mint]: amount }))
  }

  const handleStake = (position: StakedSolPosition) => {
    const amount = stakeAmounts[position.mint] || "0"
    const message = `execute stakeStakeExecuter with ${position.symbol} and amount ${amount} SOL`
    handleSubmit(message)
  }

  return (
    <div className="w-full">
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg">
        <div className="p-4">
          <h2 className="text-primary text-xl font-mono mb-4">Staked SOL Positions</h2>
          <Accordion
            type="single"
            collapsible
            className="space-y-2"
            value={selectedPosition}
            onValueChange={setSelectedPosition}
          >
            {positions.map((position) => (
              <AccordionItem
                key={position.mint}
                value={position.mint}
                className="border border-primary/20 rounded-lg overflow-hidden bg-black/40"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <ChevronRight className="w-4 h-4 text-primary/60 rotate-icon transition-transform duration-200" />
                    <div className="flex items-center flex-grow">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary mr-2">
                        <Image
                          src={position.logo_uri || "/placeholder.svg"}
                          alt={position.symbol}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-primary font-mono text-left">{position.name}</div>
                        <div className="text-primary/60 text-sm font-mono text-left">{position.symbol}</div>
                      </div>
                    </div>
                    <div className="text-primary font-mono">APY: {formatAPY(position.apy)}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="space-y-2 text-primary/80 font-mono">
                    <div className="flex justify-between">
                      <span>Mint:</span>
                      <span>{`${position.mint.slice(0, 4)}...${position.mint.slice(-4)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Program:</span>
                      <span>{`${position.token_program.slice(0, 4)}...${position.token_program.slice(-4)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Decimals:</span>
                      <span>{position.decimals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pool Program:</span>
                      <span>{position.pool.program}</span>
                    </div>
                    {position.pool.pool && (
                      <div className="flex justify-between">
                        <span>Pool:</span>
                        <span>{`${position.pool.pool.slice(0, 4)}...${position.pool.pool.slice(-4)}`}</span>
                      </div>
                    )}
                    {position.pool.validator_list && (
                      <div className="flex justify-between">
                        <span>Validator List:</span>
                        <span>{`${position.pool.validator_list.slice(0, 4)}...${position.pool.validator_list.slice(-4)}`}</span>
                      </div>
                    )}
                    {position.pool.vote_account && (
                      <div className="flex justify-between">
                        <span>Vote Account:</span>
                        <span>{`${position.pool.vote_account.slice(0, 4)}...${position.pool.vote_account.slice(-4)}`}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Amount in SOL"
                      value={stakeAmounts[position.mint] || ""}
                      onChange={(e) => handleStakeAmountChange(position.mint, e.target.value)}
                      className="flex-grow bg-black/20 border-primary/40 text-primary"
                    />
                    <Button variant="secondary" size="sm" onClick={() => handleStake(position)}>
                      Stake SOL
                    </Button>
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

