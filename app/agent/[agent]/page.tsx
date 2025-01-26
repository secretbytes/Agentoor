"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAgentStore } from "@/store/useAgentStore"
import { useAppKitAccount } from "@reown/appkit/react"
import { MainLayout } from "@/components/_main/MainLayout"

export default function AgentPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const { agents, selectAgent, selectedAgent } = useAgentStore()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!isConnected || !address) {
        router.push("/")
        return
      }

      try {
        const response = await fetch(`/api/beta/authv2?walletAddress=${address}`)
        const data = await response.json()

        if (!data.accessGranted) {
          setErrorMessage("You don't own enough agent tokens to access beta")
          return
        }

        const agentName = (params.agent as string).replace(/-/g, " ")
        const agent = agents.find((a) => a.agentName.toLowerCase() === agentName.toLowerCase())

        if (agent) {
          selectAgent(agent)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking access:", error)
        setErrorMessage("An error occurred while checking access")
      }
    }

    checkAccess()
  }, [params.agent, isConnected, address, agents, selectAgent, router])

  if (errorMessage) {
    return <div className="container mx-auto text-primary font-mono">{errorMessage}</div>
  }

  if (!isConnected) {
    return <div className="container mx-auto text-primary font-mono">Not connected</div>
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

