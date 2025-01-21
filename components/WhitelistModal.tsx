import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import Link from "next/link"
// import { FaXTwitter } from "react-icons/fa6";
import { Button } from "./ui/button";
import { useDisconnect } from "@reown/appkit/react";
import { Power } from "lucide-react";
interface WhitelistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WhitelistModal({ isOpen, onClose }: WhitelistModalProps) {
    const {disconnect} = useDisconnect()
    const disconnectWallet = async() => {
        await disconnect()
      }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1E21] border w-full grid place-content-center border-gray-800 text-primary">
        <DialogHeader className="w-full flex justify-center">
          <DialogTitle className="text-primary translate-x-14 text-xl font-mono">Not Whitelisted</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-primary/80 font-mono">You are not whitelisted for beta.</p>
          <div className="flex justify-center">
            {/* <Link
              href="https://twitter.com/Superagentsfun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            > */}

<Button 
                    onClick={disconnectWallet} 
                    variant="destructive"
                    className="font-mono"
                  > 
                    <Power className="w-4 h-4 mr-2" />
                    TERMINATE CONNECTION
                  </Button>

                  
              {/* <FaXTwitter className="w-6 h-6" /> */}
              {/* <span className="font-mono text-sm">Follow us on Twitter</span> */}
            {/* </Link> */}
          </div>
          <div></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

