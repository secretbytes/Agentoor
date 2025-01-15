'use client'

import { SwapExecutor } from '@/components/tempcomp'
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function SwapPage() {
  // This is a placeholder. In a real application, you would get this from your swap logic
  const dummySwapTransaction = new Uint8Array([1, 2, 3, 4, 5])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Solana Swap</h1>
      {/* <WalletMultiButton /> */}
      <SwapExecutor swapTransaction={dummySwapTransaction} />
    </div>
  )
}

