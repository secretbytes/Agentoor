"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {  useDisconnect } from "@reown/appkit/react"
import { redirect } from "next/navigation"

interface AccessDeniedModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccessDeniedModal({ isOpen }: AccessDeniedModalProps) {
    const { disconnect } = useDisconnect()
  const handleGetTokens = () => {
    window.open("https://jup.ag/swap/USDC-FKMbGJh236PbnCMWuMVyRESWiEDkQo5Lv6ZXAVPVpump", "_blank")
  }
    const handleDisconnect = ()=>{
        disconnect()
        return redirect("/")
    }

  return (
    <Dialog open={isOpen} >
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Access Denied</DialogTitle>
          <DialogDescription>
            You don&apos;t own enough SUPER tokens to access beta. You need at least 10,000 tokens to proceed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={()=>handleDisconnect()}>
            Disconnect
          </Button>
          <Button onClick={handleGetTokens}>Get SUPER Tokens</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

