"use client"

import { createSolanaConnection } from "@/lib/solana"
import { useAppKitProvider } from "@reown/appkit/react"
import { ComputeBudgetProgram, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import type { Provider } from "@reown/appkit-adapter-solana/react"
import { Button } from "../ui/button"
import { useState } from "react"

export function RemoveLiquidityButton({ data }) {
  const { walletProvider } = useAppKitProvider<Provider>("solana")
  const [isLoading, setIsLoading] = useState(false)

  const handleRemoveLiq = async () => {
    setIsLoading(true)
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
    } catch (error) {
      console.error("Error removing liquidity:", error)
      throw new Error("Failed to remove liquidity")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleRemoveLiq} disabled={isLoading}>
      {isLoading ? "Processing..." : "Remove Liquidity"}
    </Button>
  )
}

