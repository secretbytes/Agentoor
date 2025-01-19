import { createSolanaConnection } from '@/config/rpcConfig';
import DLMM, { StrategyType } from '@meteora-ag/dlmm';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log("request.url", request.nextUrl.searchParams)
        const pairAddress = request.nextUrl?.searchParams?.get("pairAddress");
        const publicKey = request.nextUrl?.searchParams?.get("publicKey");
        const positionKey = request.nextUrl?.searchParams?.get("positionKey");
        const amount = request.nextUrl?.searchParams?.get("amount");



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

        const activeBin = await dlmmPool.getActiveBin();
        const TOTAL_RANGE_INTERVAL = 69;
        const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
        const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

        const activeBinPricePerToken = Number(dlmmPool.fromPricePerLamport(
            Number(activeBin.price)
        ));
        const totalXAmount = new BN(Number(amount));
        const totalYAmount = totalXAmount.muln(Number(activeBinPricePerToken.toString()));
        const newBalancePosition = Keypair.generate();

        const createPositionTx =
            await dlmmPool.initializePositionAndAddLiquidityByStrategy({
                positionPubKey: newPositonKey,
                user: newPublicKey,
                totalXAmount,
                totalYAmount,
                strategy: {
                    maxBinId,
                    minBinId,
                    strategyType: StrategyType.SpotBalanced,
                },
            });
        return NextResponse.json({
            createPositionTx,
            positionPubKey: newBalancePosition,


        });
    } catch (error) {
        console.error('Error creating balance position:', error);
        return NextResponse.json({ error: 'Failed to create balance position' }, { status: 500 });
    }
}