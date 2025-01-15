'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { useDisconnect } from '@reown/appkit/react'
// import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { usePrivy } from '@privy-io/react-auth'

export function ConnectButton() {
 const [mounted, setMounted] = useState(false)
  //  const { open } = useAppKit()
  //  const { isConnected, address, status} = useAppKitAccount()
  //  const { disconnect } = useDisconnect()
  //  const isConnected = false
  const {login  } = usePrivy()
   useEffect(() => {
     setMounted(true)
     
 
   }, [])
 
   const connectWallet = async () => {
     try {
      //  open()
      login()
     } catch (error) {
       console.error(error)
     }
   }
 
   
 
   if (!mounted) return null
 
  //  const displayAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''
 

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-lg text-muted-foreground">Please connect wallet to access agents</p>
      <Button size="lg" onClick={() => {
       connectWallet()
      }}>
        Connect Wallet
      </Button>
    </div>
  )
}

