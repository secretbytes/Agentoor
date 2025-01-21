"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDisconnect } from "@reown/appkit/react"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { Terminal, Power, Loader2 } from "lucide-react"

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [showNotAllowlistedModal, setShowNotAllowlistedModal] = useState(false)
  const { open } = useAppKit()
  const { isConnected, address, status } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      checkBetaAccess(address)
    }
  }, [isConnected, address])

  const checkBetaAccess = async (walletAddress: string) => {
    try {
      const response = await fetch("/api/beta/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: walletAddress }),
      })
      const data = await response.json()

      if (!data.isAllowlisted) {
        await disconnect()
        setShowNotAllowlistedModal(true)
      }
    } catch (error) {
      console.error("Error checking beta access:", error)
      await disconnect()
    }
  }

  const connectWallet = async () => {
    try {
      open()
    } catch (error) {
      console.error(error)
    }
  }

  const disconnectWallet = async () => {
    await disconnect()
  }

  if (!mounted) return null

  const displayAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ""

  return (
    <>
      <nav className="w-full border-b border-primary/30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4 h-16">
          <h1 className="text-xl font-bold font-mono text-primary glitch-text">SUPER_AGENTS</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto font-mono border-primary/40 hover:bg-primary/20 hover:text-primary"
              >
                <Terminal className="w-4 h-4 mr-2" />
                {isConnected ? displayAddress : "INITIALIZE CONNECTION"}
              </Button>
            </DialogTrigger>
            <DialogContent className="terminal-window">
              <DialogHeader>
                <DialogTitle className="font-mono text-primary">SYSTEM ACCESS</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 p-4">
                {isConnected ? (
                  <>
                    <p className="font-mono text-sm">
                      <span className="text-primary">STATUS:</span> {status?.toUpperCase() || "finding..."}
                    </p>
                    <p className="font-mono text-sm">
                      <span className="text-primary">ADDRESS:</span> {displayAddress}
                    </p>
                    <Button onClick={disconnectWallet} variant="destructive" className="font-mono">
                      <Power className="w-4 h-4 mr-2" />
                      TERMINATE CONNECTION
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={connectWallet}
                    className="font-mono border border-primary/40 hover:bg-primary/20 hover:text-primary"
                  >
                    {status === "connecting" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Terminal className="w-4 h-4 mr-2" />
                    )}
                    INITIALIZE CONNECTION
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* Not Allowlisted Modal */}
      <Dialog open={showNotAllowlistedModal} onOpenChange={setShowNotAllowlistedModal}>
        <DialogContent className="terminal-window">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary">ACCESS DENIED</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="font-mono text-sm">You are not allowlisted. Please wait for further launches.</p>
          </div>
          <Button
            onClick={() => setShowNotAllowlistedModal(false)}
            className="font-mono border border-primary/40 hover:bg-primary/20 hover:text-primary mt-4"
          >
            ACKNOWLEDGE
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

