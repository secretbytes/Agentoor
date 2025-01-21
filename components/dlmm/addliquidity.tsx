'use client'

import { Button } from "@/components/ui/button"
import {   useAppKitProvider, } from "@reown/appkit/react"
import { type Provider } from '@reown/appkit-adapter-solana/react'
import {  ComputeBudgetProgram, Keypair, PublicKey,Transaction, TransactionInstruction } from "@solana/web3.js"
import { createSolanaConnection } from "@/lib/solana"
import bs58 from 'bs58'



export default function AddLiquidityButton({ data }) {
  const { walletProvider } = useAppKitProvider<Provider>('solana')
    // console.log("Add liquidity button data ", data)
  async function handleAddLiq() {
    // try {
      const publicKey = await walletProvider.publicKey;
      const connection = createSolanaConnection();

  
      const {
        createPositionTx
        = "", privateKey } = data
        // console.log(positionPubKey)
        const decodedPrivateKey = bs58.decode(privateKey);
        const signer = Keypair.fromSecretKey(decodedPrivateKey);
const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 900000,
      });
      console.log("Add Priority Fee : ", addPriorityFee)

      const { blockhash } = await connection.getLatestBlockhash();
      console.log("blockhash", blockhash)
      const tx = new Transaction({ ...createPositionTx, feePayer: createPositionTx?.feePayer });
      console.log("tx : ", tx)
      const instr = createPositionTx.instructions?.map((i) => new TransactionInstruction({
        keys: i.keys?.map(k => {
          return {
            ...k,
            pubkey: new PublicKey(k?.pubkey),
          }
        }),
        programId: new PublicKey(i?.programId),
        data: Buffer.from(i?.data)
      }))
      tx.add(...instr)
      tx.add(addPriorityFee)
      tx.feePayer = new PublicKey(createPositionTx?.feePayer) || publicKey;
      tx.recentBlockhash = blockhash;
      tx.sign(signer)
      const txHash = await walletProvider.signAndSendTransaction(tx)

      console.log("🚀 ~ handleAddLiq ~ sendTx:", txHash)
    // } catch (error) {
    //   console.error('Error fetching pools by token:', error)
    //   throw new Error('Failed to fetch pools by token')
    // }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Solana Swap</h1>
      {/* <WalletMultiButton /> */}
      <Button onClick={handleAddLiq}>
        Add Liquidity
      </Button>
    </div>
  )
}

