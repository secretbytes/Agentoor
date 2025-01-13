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
import { useDisconnect } from '@reown/appkit/react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const { open } = useAppKit()
  const { isConnected, address, status} = useAppKitAccount()
  const { disconnect } = useDisconnect()
  
  useEffect(() => {
    setMounted(true)

  }, [])

  const connectWallet = async () => {
    try {
      open()
    } catch (error) {
      console.error(error)
    }
  }

  const disconnectWallet = async() => {
    await disconnect()
  }

  if (!mounted) return null

  const displayAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''

  return (
    <nav className="w-full border-b">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-4 h-16">
        <h1 className="text-xl font-bold">SuperAgents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {isConnected ? displayAddress : 'Connect Wallet'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wallet Connection</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 p-4">
              {isConnected ? (
                <>
                  <p>Status: {status}</p>
               
                 
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

