"use client"

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TradeSetup {
  direction: "short" | "long"
  setup: string
  entry: number
  stopLoss: number
  takeProfit: number
  riskRewardRatio: number
}

interface TradingAnalysis {
  marketOverview: {
    trend: "bullish" | "bearish" | undefined
    support: number[]
    resistance: number[]
  }
  patternAnalysis: string[]
  tradeSetups: TradeSetup[]
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center ">
      <Card className="bg-black/40 border border-primary/20 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-mono text-primary">Invalid Input</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-primary/60 font-mono">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function TradingAnalysis({ analysis }: { analysis: string }) {
  let parsedAnalysis: TradingAnalysis

  try {
    parsedAnalysis = JSON.parse(analysis) as TradingAnalysis
  } catch (error) {
    return <ErrorMessage message="Please only share images of charts." />
  }

  if (!parsedAnalysis || typeof parsedAnalysis !== "object") {
    return <ErrorMessage message="Please only share images of charts." />
  }

  const { marketOverview, patternAnalysis, tradeSetups } = parsedAnalysis

  if (!marketOverview || !patternAnalysis || !tradeSetups) {
    return <ErrorMessage message="Please only share images of charts." />
  }

  if (
    marketOverview.trend === undefined ||
    !Array.isArray(marketOverview.support) ||
    !Array.isArray(marketOverview.resistance)
  ) {
    return <ErrorMessage message="Please only share images of charts." />
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto p-4">
      {/* Market Overview Card */}
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg">
        <CardHeader className="bg-black/40 border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-xl font-mono text-primary">
            Market Overview
            {marketOverview.trend === "bearish" ? (
              <ArrowDownIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ArrowUpIcon className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-primary/80">Trend:</span>
              <Badge
                variant={marketOverview.trend === "bearish" ? "destructive" : "default"}
                className="capitalize font-mono"
              >
                {marketOverview.trend}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="font-mono text-primary/80 block mb-3">Support Levels:</span>
                <div className="flex flex-wrap gap-2">
                  {marketOverview.support.map((level, i) => (
                    <Badge key={i} variant="outline" className="font-mono bg-black/40">
                      ${level.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-mono text-primary/80 block mb-3">Resistance Levels:</span>
                <div className="flex flex-wrap gap-2">
                  {marketOverview.resistance.map((level, i) => (
                    <Badge key={i} variant="outline" className="font-mono bg-black/40">
                      ${level.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Analysis Card */}
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg">
        <CardHeader className="bg-black/40 border-b border-primary/20">
          <CardTitle className="text-xl font-mono text-primary">Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {patternAnalysis.map((pattern, i) => (
              <li key={i} className="flex items-center gap-3 text-primary/80 font-mono">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="capitalize">{pattern}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Trade Setups Card */}
      <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg">
        <CardHeader className="bg-black/40 border-b border-primary/20">
          <CardTitle className="text-xl font-mono text-primary">Trade Setups</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-4">
            {tradeSetups.map((setup, i) => (
              <li key={i} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={setup.direction === "short" ? "destructive" : "default"} className="font-mono">
                    {setup.direction.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-primary/60 font-mono">{setup.setup}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-black/40 rounded-lg border border-primary/20">
                    <div className="text-sm text-primary/60 font-mono">Entry</div>
                    <div className="font-mono text-primary mt-1">${setup.entry}</div>
                  </div>
                  <div className="text-center p-3 bg-black/40 rounded-lg border border-primary/20">
                    <div className="text-sm text-primary/60 font-mono">Stop Loss</div>
                    <div className="font-mono text-red-500 mt-1">${setup.stopLoss}</div>
                  </div>
                  <div className="text-center p-3 bg-black/40 rounded-lg border border-primary/20">
                    <div className="text-sm text-primary/60 font-mono">Take Profit</div>
                    <div className="font-mono text-green-500 mt-1">${setup.takeProfit}</div>
                  </div>
                  <div className="text-center p-3 bg-black/40 rounded-lg border border-primary/20">
                    <div className="text-sm text-primary/60 font-mono">R:R</div>
                    <div className="font-mono text-primary mt-1">{setup.riskRewardRatio}:1</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default TradingAnalysis

