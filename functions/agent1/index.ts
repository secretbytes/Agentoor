import axios from 'axios'
import DLMM, { StrategyType } from '@meteora-ag/dlmm'
import BN from 'bn.js'
import { Connection, PublicKey, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'

export const agent1Functions = {
  fetchDLMMPools: async () => {
    try {
      const response = await axios.get('https://dlmm-api.meteora.ag/pair/all_with_pagination?limit=10&search_term=sol')
      return JSON.stringify(response.data)
    } catch (error) {
      console.error('Error fetching DLMM pools:', error)
      throw new Error('Failed to fetch pools')
    }
  },

  fetchPoolsByToken: async (token: string) => {
    try {
      const response = await axios.get('https://dlmm-api.meteora.ag/pair/all')
      if (Array.isArray(response.data)) {
        const filteredPools = response.data.filter(pool => 
          pool.mint_x === token || pool.mint_y === token
        )
        return JSON.stringify(filteredPools)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error) {
      console.error('Error fetching pools by token:', error)
      throw new Error('Failed to fetch pools by token')
    }
  },

  addLiquidityToPosition: async (input: string) => {
    const [connection, poolAddress, userPublicKey, user, totalXAmount, totalYAmount, totalRangeInterval] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))

      const activeBin = await dlmmPool.getActiveBin()
      const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price))
      const activeBinPricePerTokenBN = new BN(activeBinPricePerToken.toString())

      const minBinId = activeBin.binId - Number(totalRangeInterval)
      const maxBinId = activeBin.binId + Number(totalRangeInterval)

      const totalXAmountBN = new BN(totalXAmount)
      const totalYAmountBN = new BN(totalYAmount)

      const addLiquidityTx = await dlmmPool.addLiquidityByStrategy({
        positionPubKey: new PublicKey(userPublicKey),
        user: new PublicKey(user),
        totalXAmount: totalXAmountBN,
        totalYAmount: totalYAmountBN,
        strategy: {
          maxBinId,
          minBinId,
          strategyType: StrategyType.SpotBalanced,
        },
      })

      const addLiquidityTxHash = await sendAndConfirmTransaction(conn, addLiquidityTx, [
        new PublicKey(user),
      ])

      return JSON.stringify({ transactionHash: addLiquidityTxHash })
    } catch (error) {
      console.error('Failed to add liquidity:', error)
      throw new Error('Error while adding liquidity')
    }
  },

  createLiquidityPosition: async (input: string) => {
    const [connection, poolAddress, userPublicKey, user, totalXAmount, totalYAmount, totalRangeInterval] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))

      const activeBin = await dlmmPool.getActiveBin()
      const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price))
      const activeBinPricePerTokenBN = new BN(activeBinPricePerToken.toString())

      const minBinId = activeBin.binId - Number(totalRangeInterval)
      const maxBinId = activeBin.binId + Number(totalRangeInterval)

      const totalXAmountBN = new BN(totalXAmount)
      const totalYAmountBN = new BN(totalYAmount)

      const newBalancePosition = new Keypair()
      const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newBalancePosition.publicKey,
        user: new PublicKey(user),
        totalXAmount: totalXAmountBN,
        totalYAmount: totalYAmountBN,
        strategy: {
          maxBinId,
          minBinId,
          strategyType: StrategyType.SpotBalanced,
        },
      })

      const createPositionTxHash = await sendAndConfirmTransaction(conn, createPositionTx, [
        new PublicKey(user),
      ])

      return JSON.stringify({ 
        transactionHash: createPositionTxHash,
        positionPublicKey: newBalancePosition.publicKey.toString()
      })
    } catch (error) {
      console.error('Failed to create position and add liquidity:', error)
      throw new Error('Error while creating position and adding liquidity')
    }
  },
}

