'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { WindowControls } from "@/components/window-controls"
import { SidebarTrigger } from '@/components/ui/sidebar'

export function NotConnected() {
    const handleConnect = () => {
        console.log('Connecting wallet...')
    }

    return (
        <div className="flex flex-col h-screen w-full bg-black">
            <div className="flex items-center justify-between border-b border-gray-800 bg-[#1C1E21] p-2">
                <div className="flex items-center">
                    <WindowControls />
                    <SidebarTrigger />
                </div>
                <div className="text-gray-400 font-medium">
                    Terminal
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                >
                    Connect Wallet
                </Button>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow flex flex-col items-center justify-center bg-black">
                    <div className="text-center mb-8">
                        <div className="bg-[#1C1E21] shadow-lg">
                            <Image
                                src="/logo.gif"
                                alt="Super Agents"
                                width={300}
                                height={300}
                            />
                        </div>
                    </div>
                    <Button 
                        onClick={handleConnect}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        Connect Wallet
                    </Button>
                </div>
            </div>
        </div>
    )
}