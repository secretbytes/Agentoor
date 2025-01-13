import { create } from 'zustand'


interface WalletState {
  publicKey: string | null
  connected: boolean
  setPublicKey: (key: string | null) => void
  setConnected: (status: boolean) => void
  disconnect: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  connected: false,
  setPublicKey: (key) => set({ publicKey: key }),
  setConnected: (status) => set({ connected: status }),
  disconnect: () => set({ publicKey: null, connected: false })
}))

