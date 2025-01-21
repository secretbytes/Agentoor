'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAgentStore } from '@/store/useAgentStore'
import { useAppKitAccount } from '@reown/appkit/react'
import { MainLayout } from '@/components/_main/MainLayout'
import { WhitelistModal } from '@/components/WhitelistModal'

export default function AgentPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAppKitAccount()
  const { agents, selectAgent, selectedAgent } = useAgentStore()
  const [notWhitelisted, setNotWhitelisted] = useState(false)

  useEffect(() => {
    const checkWhitelist = async () => {
      if (!isConnected || !address) {
        router.push('/')
        return
      }

      try {
        const response = await fetch(`/api/beta/auth?address=${address}`)
        const data = await response.json()

        if (!data.whitelisted) {
          setNotWhitelisted(true)
        } else {
          const agentName = (params.agent as string).replace(/-/g, ' ')
          const agent = agents.find(
            a => a.agentName.toLowerCase() === agentName.toLowerCase()
          )

          if (agent) {
            selectAgent(agent)
          } else {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Error checking whitelist:', error)
        router.push('/')
      }
    }

    checkWhitelist()
  }, [params.agent, isConnected, address, agents, selectAgent, router])

  if (!isConnected) {
    return (
      <div className="container mx-auto text-primary font-mono">
        Not connected
      </div>
    )
  }

  if (notWhitelisted) {
    return (
      <div className="container mx-auto">
        <WhitelistModal isOpen={true} onClose={() => {}} />
      </div>
    )
  }

  if (!selectedAgent) {
    return (
      <div className="container mx-auto text-primary font-mono">
        No agent found
      </div>
    )
  }

  return (
    <div className="container mx-auto bg-[#111214]">
      <MainLayout />
    </div>
  )
}
