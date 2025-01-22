import { AlertCircle, ArrowRightLeft, Droplet, BarChart3, ImagePlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ErrorHandler = () => {
  return (
    <div className="flex items-center justify-center p-4 bg-black min-h-screen">
      <Card className="bg-black border border-red-800 w-full max-w-2xl overflow-hidden shadow-lg shadow-red-900/20">
        <CardHeader className="border-b border-red-800 pb-2">
          <CardTitle className="text-center text-2xl font-mono text-red-500 flex items-center justify-center">
            <AlertCircle className="mr-2 animate-pulse" />
            Error Encountered
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-center text-red-400 font-mono mb-4">
            You ran into an error. Please make sure you are following these function formats:
          </p>
          <ul className="space-y-3 font-mono text-red-300">
            <li className="flex items-center">
              <ArrowRightLeft className="mr-2 text-red-500" />
              <span className="bg-red-950 px-2 py-1 rounded">
                swap {"{amount}"} {"{fromToken}"} to {"{toToken}"}
              </span>
            </li>
            <li className="flex items-center">
              <Droplet className="mr-2 text-red-500" />
              <span className="bg-red-950 px-2 py-1 rounded">
                add liquidity {"{amount}"} {"{token1}"}-{"{token2}"}
              </span>
            </li>
            <li className="flex items-center">
              <Droplet className="mr-2 text-red-500" />
              <span className="bg-red-950 px-2 py-1 rounded">remove liquidity</span>
            </li>
            <li className="flex items-center">
              <BarChart3 className="mr-2 text-red-500" />
              <span className="bg-red-950 px-2 py-1 rounded">show active positions</span>
            </li>
            <li className="flex items-center">
              <ImagePlus className="mr-2 text-red-500" />
              <span className="bg-red-950 px-2 py-1 rounded">upload image of a chart</span>
            </li>
          </ul>
          <div className="mt-6 text-center text-red-700 text-sm">Need help? Type &quot;help&quot; for more information.</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorHandler

