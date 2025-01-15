'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// import { useDisconnect } from '@reown/appkit/react'
import { useAppKit } from '@reown/appkit/react'

export function ConnectButton() {
 const [mounted, setMounted] = useState(false)
   const { open } = useAppKit()
  //  const { address} = useAppKitAccount()
 
   
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
 
   
 
   if (!mounted) return null
 
  
 

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

