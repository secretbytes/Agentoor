import {  PublicKey } from '@solana/web3.js';
import DLMM from '@meteora-ag/dlmm';
import BN from 'bn.js';
import { createSolanaConnection } from '@/lib/solana';

interface GetUserPositionsResult {
  data: Record<string, any> | null;
  error: string | null;
}

function serializeData(data: any): any {
  if (data instanceof PublicKey) {
    return data.toBase58();
  } else if (data instanceof BN) {
    return data.toString();
  } else if (typeof data === "bigint") {
    return data.toString();
  } else if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  } else if (data && typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeData(value);
    }
    return result;
  }
  return data;
}

export async function getUserPositions(

  publicKey: string
): Promise<GetUserPositionsResult> {
    const connection = createSolanaConnection()
  try {
    if (!publicKey) {
      return {
        data: null,
        error: 'publicKey is required'
      };
    }

    const newPublicKey = new PublicKey(publicKey);
    const positions = await DLMM.getAllLbPairPositionsByUser(connection, newPublicKey);
    
    const serializedData = Object.fromEntries(
      Array.from(positions).map(([key, value]) => [key, serializeData(value)])
    );

    return {
      data: serializedData,
      error: null
    };

  } catch (error) {
    console.error('Error fetching user positions:', error);
    return {
      data: null,
      error: 'Failed to fetch user positions'
    };
  }
}