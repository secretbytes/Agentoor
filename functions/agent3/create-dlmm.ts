import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import DLMM, { StrategyType } from '@meteora-ag/dlmm';
import BN from 'bn.js';

interface CreatePositionParams {
  pairAddress: string;
  publicKey: string;
  positionKey: string;
  amount: string;
  connection: Connection;
}

interface CreatePositionResult {
  createPositionTx: Transaction;
  positionPubKey: Keypair;
}

export async function createDLMMPosition({
  pairAddress,
  publicKey,
  positionKey,
  amount,
  connection
}: CreatePositionParams): Promise<CreatePositionResult> {
  if (!pairAddress) {
    throw new Error('pairAddress is required');
  }
  if (!publicKey) {
    throw new Error('publicKey is required');
  }
  if (!positionKey) {
    throw new Error('positionKey is required');
  }

  try {

    console.log("received input ---------------------------------", pairAddress, publicKey, positionKey, amount)
    console.log("type of input ---------------------------------", typeof pairAddress, typeof publicKey, typeof positionKey, typeof amount)



    const POOL_ADDRESS = new PublicKey(pairAddress);
    const newPublicKey = new PublicKey(publicKey);
    const newPositionKey = new PublicKey(positionKey);
    
    const dlmmPool = await DLMM.create(connection, POOL_ADDRESS);
    const activeBin = await dlmmPool.getActiveBin();
    
    const TOTAL_RANGE_INTERVAL = 69;
    const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
    
    const activeBinPricePerToken = Number(
      dlmmPool.fromPricePerLamport(Number(activeBin.price))
    );
    
    const totalXAmount = new BN(Number(amount));
    const totalYAmount = totalXAmount.muln(Number(activeBinPricePerToken.toString()));
    
    const newBalancePosition = Keypair.generate();
    
    const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newPositionKey,
      user: newPublicKey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType: StrategyType.SpotBalanced,
      },
    });

    return {
      createPositionTx,
      positionPubKey: newBalancePosition,
    };
  } catch (error) {
    console.error('Error creating balance position:', error);
    throw new Error('Failed to create balance position');
  }
}