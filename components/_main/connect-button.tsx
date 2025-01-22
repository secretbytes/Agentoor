"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react"
import { Terminal, Loader2, XCircle } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ConnectButton() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNotAllowlistedModal, setShowNotAllowlistedModal] = useState(false)
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const {disconnect} = useDisconnect()
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
      setIsLoading(true)
      await open()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-black">
        <div className="flex items-center justify-between border-b border-gray-800 bg-[#1C1E21] p-2">
          <div className="flex items-center">
            <div className="flex gap-1.5 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
          <div className="text-gray-400 font-medium">SuperAgents</div>
          <div className="w-20" /> {/* Spacer to match header layout */}
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="bg-[#1C1E21] shadow-lg mb-8">
              <Image src="/logo.gif" alt="Super Agents" width={300} height={300} priority />
            </div>

            <div className="space-y-4 font-mono">
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <p className="text-lg text-primary">SYSTEM ACCESS REQUIRED</p>
                  <p className="text-sm text-muted-foreground mt-2">{"> AWAITING WALLET CONNECTION..."}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              size="lg"
              onClick={connectWallet}
              className="font-mono border border-primary/40 hover:bg-primary/20 hover:text-primary relative"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Terminal className="w-4 h-4 mr-2" />}
              {isLoading ? "CONNECTING..." : "INITIALIZE CONNECTION"}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Not Allowlisted Modal */}
      <Dialog open={showNotAllowlistedModal} onOpenChange={setShowNotAllowlistedModal}>
        <DialogContent className="bg-[#1C1E21] border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-500" />
              ACCESS DENIED
            </DialogTitle>
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

export default ConnectButton

