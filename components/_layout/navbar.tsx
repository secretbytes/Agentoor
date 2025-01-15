'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { usePrivy } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [walletStatus, setWalletStatus] = useState('')
  const [embeddedWallet, setEmbeddedWallet] = useState(null)
  const { login, authenticated, logout, user } = usePrivy()
  const { createWallet } = useSolanaWallets()
  const test = usePrivy()
  console.log(test)
  const wallets = user?.linkedAccounts || []
  const hasSolanaWallet = wallets.some(wallet => wallet.chainType === "solana");
  console.log(hasSolanaWallet)
  

  // Function to create embedded wallet
  const createEmbeddedWallet = async () => {
    try {



      console.log("Creating embedded wallet...")
      const wallet = await createWallet()
      console.log("Created embedded wallet:", wallet)
      
      if (wallet) {
        setEmbeddedWallet(wallet)
        setWalletStatus('Embedded wallet created successfully')
        console.log("Wallet address:", wallet.address)
        // console.log("Wallet public key:", wallet.publicKey)
      }
    } catch (error) {
      console.error("Error creating embedded wallet:", error)
      setWalletStatus('Error creating embedded wallet')
    }
  }

  // Effect to handle wallet creation after authentication
  useEffect(() => {
    if (authenticated && !embeddedWallet && !hasSolanaWallet)  {
      createEmbeddedWallet()
    }
  }, [authenticated])

  useEffect(() => {
    setMounted(true)
    console.log("User details:", user)
  }, [user])

  const connectWallet = async () => {
    try {
      await login()
      // No need to create wallet here - it will be handled by the useEffect
      setWalletStatus('Connecting wallet...')
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setWalletStatus('Error connecting wallet')
    }
  }

  const disconnectWallet = async () => {
    try {
      await logout()
      setWalletStatus('')
      setEmbeddedWallet(null)
      console.log("Wallet disconnected")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  if (!mounted) return null

  const displayAddress = embeddedWallet?.address 
    ? `${embeddedWallet.address.slice(0, 4)}...${embeddedWallet.address.slice(-4)}` 
    : user?.wallet?.address 
    ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
    : ''

  return (
    <nav className="w-full border-b">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-4 h-16">
        <h1 className="text-xl font-bold">SuperAgents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {authenticated ? displayAddress : 'Connect Wallet'} 
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wallet Connection</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 p-4">
              {authenticated ? (
                <>
                  <p>Status: {walletStatus || 'Connected'}</p>
                  {embeddedWallet && (
                    <div className="text-sm text-gray-500">
                      <p>Embedded Wallet Address: {embeddedWallet.address}</p>
                      <p>Public Key: {embeddedWallet.publicKey}</p>
                    </div>
                  )}
                  <Button onClick={disconnectWallet} variant="destructive">
                    Disconnect Wallet
                  </Button>
                </>
              ) : (
                <Button onClick={connectWallet}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  )
}

export default Navbar