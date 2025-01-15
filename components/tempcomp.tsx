'use client'

import { useState, useEffect } from 'react'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useSendTransaction } from '@privy-io/react-auth/solana'
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth'

export function SwapExecutor() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [walletStatus, setWalletStatus] = useState<string>('checking')
  
  const swapTransaction = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHErU8kriZKXxGrjR7vg3RN3xxEOt3H9/UJB/TFDmhap+dD1XLIQsRdoGoXPXZYJK/2efSSCLA7KOQXTyYQM422YpdxtYzPvUnZBkJmlTev5/ksFo/7V6S5uBdVHr5+gG7Nn2ImqkEycMIht9zzd52agAoqeSUZ0EVY0BtPidrM9wKh7Uj+ncbLnnXrncZ0M9fcpfQPh1Y9fJm+wF6ZvdeXAeVxNlk6uYskLTKoGgpKe/fAPEdp7tqoO/N99aPYz9i5LMXqTX3vYyT8HEvWUZIn4/VUbjZeKhLn03bLdp5r1w2xLMGczKtk26KwfXKw7UDQbnwAeYig/1hCFesBK538F/JD7R7MrykQ+ZBtfBnxPPc7nb9gAKhPbS/SITgDsPVtNRRDGey+eJoF+hs2fQYDY5XP8GRZu3jcbDVvJDoA7B249V2c9QArvHd+DsPseU3+dXkTFrbwfBeeLw2ocDKloMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAABHnVW/IxwG7udMVuzmgVB/2xst6j9I5RArHNola8E48G3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqYKX5UT/REBqE7f6ZMLP+j7G4V34k14Ax0Fw3q7wE/N9jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+Fm0P/on9df2SnTAmx8pWHneSwmrNt/J3VFLMhqns4zl6JqpObCjiO6LSoJtYoLyy0ZbEb07iiZLuOq5L1XgmddSCAwABQLAXBUADAAJAwQXAQAAAAAAEAYABgAhCw4BAQsCAAYMAgAAAGQAAAAAAAAADgEGAREQBgAJACULDgEBDUYODwAGBAMJISUNDRENIBQgExUECCEjEiAPDg4iIAoCBQ0gGSAWFwgHJCMYIA8ODiIgAQ0gGyAfGgcDJSQcIA8ODiIgHh0NLMEgmzNB1pyBBgMAAAAmZAABJmQBAiZkAgNkAAAAAAAAAFcAAAAAAAAAHgAADgMGAAABCQNzMHRRiKhLxVAQ00SFkrQdcoEOr3OTanY1TcC3NFVdRwTO0tfTBNZw1NFamDV27uvn+d64i0zEPvppJw/jXzTqzpDWCrQMIuYg1AS2ubh8AbcWkBkC5CChZm/55We6d4hStj0Dk6kaJyQIrr0IH7ajVwaLjiKJjSEBjA=="
  
  const { sendTransaction } = useSendTransaction()
  const { ready, wallets } = useSolanaWallets()
  const { isAuthenticated, login } = usePrivy()

  useEffect(() => {
    // Debug logging
    console.log('Wallet status:', {
      ready,
      walletsLength: wallets?.length,
      isAuthenticated,
    })

    if (!ready) {
      setWalletStatus('initializing')
    } else if (!isAuthenticated) {
      setWalletStatus('needsLogin')
    } else if (!wallets || wallets.length === 0) {
      setWalletStatus('needsWallet')
    } else {
      setWalletStatus('ready')
    }
  }, [ready, wallets, isAuthenticated])

  async function executeSwap() {
    if (!isAuthenticated || !wallets?.length) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const connection = new Connection(clusterApiUrl('mainnet-beta'))

    try {
      const unsignedTxBase64 = Buffer.from(swapTransaction, 'base64').toString('base64')
      const txReceipt = await sendTransaction({
        unsignedTxBase64,
        connection,
      })

      console.log('Transaction receipt:', txReceipt)
      setSuccess(true)
    } catch (error) {
      console.error('Error executing swap:', error)
      setError('Failed to execute swap. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Debug display
  console.log('Current wallet status:', walletStatus)

  return (
    <div className="space-y-4">
      {/* Status debugging (you can remove this in production) */}
      <div className="text-sm text-gray-500">
        Status: {walletStatus}
      </div>

      {walletStatus === 'needsLogin' && (
        <Button onClick={() => login()}>
          Connect Wallet
        </Button>
      )}

      {walletStatus === 'ready' && (
        <Button onClick={executeSwap} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing Swap...
            </>
          ) : (
            'Execute Swap'
          )}
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Swap executed successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}