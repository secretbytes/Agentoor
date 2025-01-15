import { Connection, PublicKey, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import DLMM, { StrategyType } from '@meteora-ag/dlmm'
import BN from 'bn.js'
import axios from 'axios'

export const agent2Functions = {
  // Initialize DLMM Pool
  initializeDLMMPool: async (input: string) => {
    const [connection, poolAddress] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))
      const activeBin = await dlmmPool.getActiveBin()
      return JSON.stringify({
        activeBinId: activeBin.binId,
        price: activeBin.price.toString(),
        pricePerToken: dlmmPool.fromPricePerLamport(Number(activeBin.price))
      })
    } catch (error) {
      console.error('Error initializing DLMM pool:', error)
      throw new Error('Failed to initialize DLMM pool')
    }
  },

  // Get User Positions
  getUserPositions: async (input: string) => {
    const [connection, poolAddress, userPublicKey] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))
      const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
        new PublicKey(userPublicKey)
      )
      return JSON.stringify(userPositions.map(position => ({
        publicKey: position.publicKey.toString(),
        binData: position.positionData.positionBinData
      })))
    } catch (error) {
      console.error('Error fetching user positions:', error)
      throw new Error('Failed to fetch user positions')
    }
  },

  // Create Position and Add Liquidity
  createPosition: async (input: string) => {
    const [connection, poolAddress, userPublicKey, totalXAmount, rangeInterval] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))
      
      const activeBin = await dlmmPool.getActiveBin()
      const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price))
      
      const minBinId = activeBin.binId - Number(rangeInterval)
      const maxBinId = activeBin.binId + Number(rangeInterval)
      
      const totalXAmountBN = new BN(totalXAmount)
      const totalYAmountBN = totalXAmountBN.mul(new BN(Number(activeBinPricePerToken)))
      
      const newPosition = new Keypair()
      const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newPosition.publicKey,
        user: new PublicKey(userPublicKey),
        totalXAmount: totalXAmountBN,
        totalYAmount: totalYAmountBN,
        strategy: {
          maxBinId,
          minBinId,
          strategyType: StrategyType.SpotBalanced,
        },
      })

      const txHash = await sendAndConfirmTransaction(conn, createPositionTx, [
        new PublicKey(userPublicKey),
        newPosition
      ])

      return JSON.stringify({
        transactionHash: txHash,
        positionPublicKey: newPosition.publicKey.toString()
      })
    } catch (error) {
      console.error('Error creating position:', error)
      throw new Error('Failed to create position')
    }
  },

  // Remove Liquidity
  removeLiquidity: async (input: string) => {
    const [connection, poolAddress, userPublicKey, positionPublicKey, shouldClaimAndClose] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))
      
      const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
        new PublicKey(userPublicKey)
      )
      
      const userPosition = userPositions.find(({ publicKey }) => 
        publicKey.equals(new PublicKey(positionPublicKey))
      )
      
      if (!userPosition) {
        throw new Error('Position not found')
      }

      const binIdsToRemove = userPosition.positionData.positionBinData.map(
        (bin) => bin.binId
      )

      const removeLiquidityTx = await dlmmPool.removeLiquidity({
        position: userPosition.publicKey,
        user: new PublicKey(userPublicKey),
        binIds: binIdsToRemove,
        liquiditiesBpsToRemove: new Array(binIdsToRemove.length).fill(new BN(100 * 100)),
        shouldClaimAndClose: shouldClaimAndClose === 'true'
      })

      const txHashes = []
      for (let tx of Array.isArray(removeLiquidityTx) ? removeLiquidityTx : [removeLiquidityTx]) {
        const txHash = await sendAndConfirmTransaction(conn, tx, [new PublicKey(userPublicKey)], {
          skipPreflight: false,
          preflightCommitment: "singleGossip"
        })
        txHashes.push(txHash)
      }

      return JSON.stringify({ transactionHashes: txHashes })
    } catch (error) {
      console.error('Error removing liquidity:', error)
      throw new Error('Failed to remove liquidity')
    }
  },

  // Perform Swap
  performSwap: async (input: string) => {
    const [connection, poolAddress, userPublicKey, swapAmount, swapYtoX, slippageBps] = input.split(',')
    try {
      const conn = new Connection(connection)
      const dlmmPool = await DLMM.create(conn, new PublicKey(poolAddress))
      
      const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX === 'true')
      const swapQuote = await dlmmPool.swapQuote(
        new BN(swapAmount),
        swapYtoX === 'true',
        new BN(slippageBps),
        binArrays
      )

      const swapTx = await dlmmPool.swap({
        inToken: swapYtoX === 'true' ? dlmmPool.tokenY.publicKey : dlmmPool.tokenX.publicKey,
        binArraysPubkey: swapQuote.binArraysPubkey,
        inAmount: new BN(swapAmount),
        lbPair: dlmmPool.pubkey,
        user: new PublicKey(userPublicKey),
        minOutAmount: swapQuote.minOutAmount,
        outToken: swapYtoX === 'true' ? dlmmPool.tokenX.publicKey : dlmmPool.tokenY.publicKey,
      })

      const txHash = await sendAndConfirmTransaction(conn, swapTx, [new PublicKey(userPublicKey)])
      
      return JSON.stringify({
        transactionHash: txHash,
        expectedOutAmount: swapQuote.minOutAmount.toString()
      })
    } catch (error) {
      console.error('Error performing swap:', error)
      throw new Error('Failed to perform swap')
    }
  }
}