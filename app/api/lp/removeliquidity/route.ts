import { createSolanaConnection } from '@/lib/solana';
import DLMM from '@meteora-ag/dlmm';
import {  PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log("request.url", request.nextUrl.searchParams)
        const pairAddress = request.nextUrl?.searchParams?.get("pairAddress");
        const publicKey = request.nextUrl?.searchParams?.get("publicKey");
        const positionKey = request.nextUrl?.searchParams?.get("positionKey");

        if (!pairAddress) {
            return NextResponse.json({ error: 'pairAddress is required' }, { status: 400 });
        }
        if (!publicKey) {
            return NextResponse.json({ error: 'publicKey is required' }, { status: 400 });
        }
        if (!positionKey) {
            return NextResponse.json({ error: 'positionKey is required' }, { status: 400 });
        }
        const connection = createSolanaConnection()
        const POOL_ADDRESS = new PublicKey(pairAddress);
        const newPublicKey = new PublicKey(publicKey);
        const newPositonKey = new PublicKey(positionKey);
        const dlmmPool = await DLMM.create(connection, POOL_ADDRESS);
        const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
            newPublicKey
          );
          const binData = userPositions[0].positionData.positionBinData;

        const userPosition = userPositions.find(({ publicKey }) =>
            publicKey.equals(newPositonKey)
          );

          if (!userPosition) {
            return NextResponse.json({ error: 'userPosition is required' }, { status: 400 });
        }
          // Remove Liquidity
          const binIdsToRemove = userPosition.positionData.positionBinData.map(
            (bin) => bin.binId
          );
          const removeLiquidityTx = await dlmmPool.removeLiquidity({
            position: userPosition.publicKey,
            user: newPublicKey,
            binIds: binIdsToRemove,
            bps: new BN(100 * 100),
            shouldClaimAndClose: true, 
          });
        return NextResponse.json({
            removeLiquidityTx
        });
    } catch (error) {
        console.error('Error creating balance position:', error);
        return NextResponse.json({ error: 'Failed to create balance position' }, { status: 500 });
    }
}