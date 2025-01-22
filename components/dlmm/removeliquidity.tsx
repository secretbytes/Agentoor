"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppKitProvider } from "@reown/appkit/react"
import type { Provider } from "@reown/appkit-adapter-solana/react"
import { ComputeBudgetProgram, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { createSolanaConnection } from "@/lib/solana"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function RemoveLiquidityButton({ data }) {
  const { walletProvider } = useAppKitProvider<Provider>("solana")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleRemoveLiq = async () => {
    setIsLoading(true)
    setTxHash(null)
    try {
      const connection = createSolanaConnection()

      const { removeLiquidityTx = "" } = data
      console.log("🚀 ~ handleRemoveLiq ~ removeLiquidityTx:", removeLiquidityTx)

      const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 900000,
      })
      const { blockhash } = await connection.getLatestBlockhash()

      const tx = new Transaction({ ...removeLiquidityTx, feePayer: removeLiquidityTx?.feePayer })
      const instr = removeLiquidityTx.instructions?.map(
        (i: any) =>
          new TransactionInstruction({
            keys: i.keys?.map((k) => ({
              ...k,
              pubkey: new PublicKey(k?.pubkey),
            })),
            programId: new PublicKey(i?.programId),
            data: Buffer.from(i?.data),
          }),
      )
      tx.add(...instr, addPriorityFee)
      tx.feePayer = new PublicKey(removeLiquidityTx?.feePayer) || walletProvider.publicKey
      tx.recentBlockhash = blockhash

      const txHash = await walletProvider.signAndSendTransaction(tx)
      console.log("🚀 ~ handleRemoveLiq ~ txHash:", txHash)
      setTxHash(txHash)
      toast.success("Liquidity removed successfully", {
        description: "Your transaction has been processed.",
        style: {
          background: "#e6ffee",
          border: "1px solid #006400",
          color: "#006400",
        },
      })
    } catch (error) {
      console.error("Error removing liquidity:", error)
      toast.error("Failed to remove liquidity", {
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
    <Card className="bg-[#1C1E21] border border-gray-800 shadow-lg p-6 overflow-hidden">
      <div className="space-y-4">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary/80 font-mono text-center mb-2"
        >
          Click the button below to remove liquidity
        </motion.p>
        <Button
          onClick={handleRemoveLiq}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-sm font-mono relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing Liquidity...
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Remove Liquidity
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-primary/80 font-mono text-center text-sm"
            >
              <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
              <p className="mt-2">Transaction processing...</p>
            </motion.div>
          )}
          {txHash && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-primary/80 font-mono text-center text-sm"
            >
              <p>Transaction complete</p>
              <p className="break-all mt-1">Transaction hash = {txHash}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

