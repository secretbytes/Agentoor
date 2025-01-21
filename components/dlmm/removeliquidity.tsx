import { Connection, PublicKey } from '@solana/web3.js';
import DLMM from '@meteora-ag/dlmm';
import BN from 'bn.js';

interface RemoveLiquidityParams {
    pairAddress: string;
    publicKey: string;
    positionKey: string;
    connection: Connection;
}

interface RemoveLiquidityResult {
    removeLiquidityTx: any;  // Replace 'any' with actual transaction type from DLMM if available
    error?: string;
}

export async function removeLiquidity({
    pairAddress,
    publicKey,
    positionKey,
    connection
}: RemoveLiquidityParams): Promise<RemoveLiquidityResult> {
    try {
        // Validate inputs
        if (!pairAddress) {
            throw new Error('pairAddress is required');
        }
        if (!publicKey) {
            throw new Error('publicKey is required');
        }
        if (!positionKey) {
            throw new Error('positionKey is required');
        }

        // Convert string addresses to PublicKey objects
        const POOL_ADDRESS = new PublicKey(pairAddress);
        const userPublicKey = new PublicKey(publicKey);
        const positionPublicKey = new PublicKey(positionKey);

        // Initialize DLMM pool
        const dlmmPool = await DLMM.create(connection, POOL_ADDRESS);

        // Get user positions
        const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
            userPublicKey
        );

        // Find specific position
        const userPosition = userPositions.find(({ publicKey }) =>
            publicKey.equals(positionPublicKey)
        );

        if (!userPosition) {
            throw new Error('Position not found');
        }

        // Get bin IDs to remove
        const binIdsToRemove = userPosition.positionData.positionBinData.map(
            (bin) => bin.binId
        );

        // Remove liquidity
        const removeLiquidityTx = await dlmmPool.removeLiquidity({
            position: userPosition.publicKey,
            user: userPublicKey,
            binIds: binIdsToRemove,
            bps: new BN(100 * 100), // 100% removal
            shouldClaimAndClose: true,
        });

        return { removeLiquidityTx };
    } catch (error) {
        console.error('Error removing liquidity:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to remove liquidity',
            removeLiquidityTx: null
        };
    }
}