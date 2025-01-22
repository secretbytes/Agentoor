"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppKitProvider } from "@reown/appkit/react"
import type { Provider } from "@reown/appkit-adapter-solana/react"
import { ComputeBudgetProgram, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { createSolanaConnection } from "@/lib/solana"
import bs58 from "bs58"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AddLiquidityButton({ data }) {
  const { walletProvider } = useAppKitProvider<Provider>("solana")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  async function handleAddLiq() {
    setIsLoading(true)
    setTxHash(null)
    try {
      const publicKey = await walletProvider.publicKey
      const connection = createSolanaConnection()

      const { createPositionTx = "", privateKey } = data
      const decodedPrivateKey = bs58.decode(privateKey)
      const signer = Keypair.fromSecretKey(decodedPrivateKey)
      const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 900000,
      })

      const { blockhash } = await connection.getLatestBlockhash()
      const tx = new Transaction({ ...createPositionTx, feePayer: createPositionTx?.feePayer })
      const instr = createPositionTx.instructions?.map(
        (i) =>
          new TransactionInstruction({
            keys: i.keys?.map((k) => ({
              ...k,
              pubkey: new PublicKey(k?.pubkey),
            })),
            programId: new PublicKey(i?.programId),
            data: Buffer.from(i?.data),
          }),
      )
      tx.add(...instr)
      tx.add(addPriorityFee)
      tx.feePayer = new PublicKey(createPositionTx?.feePayer) || publicKey
      tx.recentBlockhash = blockhash
      tx.sign(signer)
      const txHash = await walletProvider.signAndSendTransaction(tx)

      console.log("🚀 ~ handleAddLiq ~ sendTx:", txHash)
      setTxHash(txHash)
      toast.success("Liquidity added successfully", {
        description: "Your transaction has been processed.",
        style: {
          background: "#e6ffee",
          border: "1px solid #006400",
          color: "#006400",
        },
      })
    } catch (error) {
      console.error("Error adding liquidity:", error)
      toast.error("Failed to add liquidity", {
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
          Click the button below to add liquidity
        </motion.p>
        <Button
          onClick={handleAddLiq}
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
                Adding Liquidity...
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Add Liquidity
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

