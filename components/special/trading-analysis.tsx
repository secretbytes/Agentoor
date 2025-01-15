'use client'

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"

interface TradingAnalysis {
  marketOverview: {
    trend: "bullish" | "bearish"
    support: number[]
    resistance: number[]
  }
  patternAnalysis: string[]
  tradeSetups: string[]
}

export function TradingAnalysis({ analysis }: { analysis: TradingAnalysis }) {
  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto p-4">
      {/* Market Overview Card */}
      <Card className="border-2">
        <CardHeader className="bg-blue-50 dark:bg-blue-950">
          <CardTitle className="flex items-center gap-2 text-xl">
            Market Overview
            {analysis.marketOverview.trend === 'bearish' ? (
              <ArrowDownIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ArrowUpIcon className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Trend:</span>
              <Badge 
                variant={analysis.marketOverview.trend === 'bearish' ? 'destructive' : 'default'}
                className="capitalize"
              >
                {analysis.marketOverview.trend}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold block mb-2">Support Levels:</span>
                <div className="space-y-1">
                  {analysis.marketOverview.support.map((level, i) => (
                    <Badge key={i} variant="outline" className="mr-2">
                      ${level.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold block mb-2">Resistance Levels:</span>
                <div className="space-y-1">
                  {analysis.marketOverview.resistance.map((level, i) => (
                    <Badge key={i} variant="outline" className="mr-2">
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
      <Card className="border-2">
        <CardHeader className="bg-green-50 dark:bg-green-950">
          <CardTitle className="text-xl">Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-2">
            {analysis.patternAnalysis.map((pattern, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="capitalize">{pattern}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Trade Setups Card */}
      <Card className="border-2">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-950">
          <CardTitle className="text-xl">Trade Setups</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {analysis.tradeSetups.map((setup, i) => {
              // Parse the setup string to extract values
              const isShort = setup.toLowerCase().includes('short');
              const position = setup.match(/at (\d+\.\d+)/)?.[1];
              const stopLoss = setup.match(/stop-loss at (\d+\.\d+)/)?.[1];
              const takeProfit = setup.match(/take-profit at (\d+\.\d+)/)?.[1];

              return (
                <li key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={isShort ? 'destructive' : 'default'}>
                      {isShort ? 'SHORT' : 'LONG'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Position</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Entry</div>
                      <div className="font-semibold">${position}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Stop Loss</div>
                      <div className="font-semibold text-red-500">${stopLoss}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Take Profit</div>
                      <div className="font-semibold text-green-500">${takeProfit}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

