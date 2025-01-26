"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAgentStore } from "@/store/useAgentStore"
import { useAppKitAccount } from "@reown/appkit/react"
import { MainLayout } from "@/components/_main/MainLayout"
import { AccessDeniedModal } from "@/components/utils/access-denied-modal"

export default function AgentPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const { agents, selectAgent, selectedAgent } = useAgentStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/beta/authv2?walletAddress=${address}`)
        const data = await response.json()

        if (!data.accessGranted) {
          setIsModalOpen(true)
          setHasAccess(false)
        } else {
          setIsModalOpen(false)
          setHasAccess(true)

          const agentName = (params.agent as string).replace(/-/g, " ")
          const agent = agents.find((a) => a.agentName.toLowerCase() === agentName.toLowerCase())

          if (agent) {
            selectAgent(agent)
          } else {
            router.push("/")
          }
        }
      } catch (error) {
        console.error("Error checking access:", error)
        setIsModalOpen(true)
        setHasAccess(false)
      }

      setIsLoading(false)
    }

    checkAccess()

    // Set up interval to check access every second
    const intervalId = setInterval(checkAccess, 1000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [params.agent, isConnected, address, agents, selectAgent, router])

  if (isLoading) {
    return <div className="container mx-auto text-primary font-mono">Loading...</div>
  }

  if (!isConnected) {
    return <div className="container mx-auto text-primary font-mono">Not connected</div>
  }

  if (isConnected && !hasAccess) {
    return <AccessDeniedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  }

  if (!selectedAgent) {
    return <div className="container mx-auto text-primary font-mono">No agent found</div>
  }

  return (
    <div className="container mx-auto bg-[#111214]">
      <MainLayout />
    </div>
  )
}

