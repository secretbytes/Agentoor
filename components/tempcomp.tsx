"use client"

import { VersionedTransaction } from "@solana/web3.js"
import { useAppKitProvider } from "@reown/appkit/react"
import type { Provider } from "@reown/appkit-adapter-solana/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"

export function SwapExecutor({ swapTransaction }: { swapTransaction: string }) {
  const { walletProvider } = useAppKitProvider<Provider>("solana")
  const [isLoading, setIsLoading] = useState(false)

  async function executeSwap() {
    setIsLoading(true)
    try {
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64")
      const deserializedTx = VersionedTransaction.deserialize(swapTransactionBuf)

      const result = await walletProvider.signAndSendTransaction(deserializedTx)
      // console.log("🚀 ~ executeSwap ~ result:", result)

      toast.success("Successfully executed the swap!", {
        description: "Your transaction has been processed.",
        style: {
          background: "#e6ffee",
          border: "1px solid #006400",
          color: "#006400",
        },
      })

      return result
    } catch (error) {
      console.error("Error executing swap:", error)
      toast.error("Failed to execute swap", {
        description: "Please try again.",
        style: {
          background: "#ffebeb",
          border: "1px solid #8b0000",
          color: "#8b0000",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-lg mt-4"
        onClick={executeSwap}
        disabled={isLoading}
      >
        {isLoading ? "Swapping..." : "Swap"}
      </Button>
    </div>
  )
}

