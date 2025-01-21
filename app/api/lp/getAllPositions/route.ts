import { createSolanaConnection } from '@/lib/solana';
import DLMM from '@meteora-ag/dlmm';
import {  PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { NextRequest, NextResponse } from 'next/server';

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
export async function GET(request: NextRequest) {
    try {
        const publicKey = request.nextUrl?.searchParams?.get("publicKey");
        if (!publicKey) {
            return NextResponse.json({ error: 'publicKey is required' }, { status: 400 });
        }
        console.log(publicKey)
        const connection = createSolanaConnection();
        const newPublicKey = new PublicKey(publicKey);
        const positions = await DLMM.getAllLbPairPositionsByUser(connection, newPublicKey);
        const serializedData = Object.fromEntries(
            Array.from(positions).map(([key, value]) => [key, serializeData(value)])
          );      
        return NextResponse.json(serializedData);

    } catch (error) {
        console.error('Error creating balance position:', error);
        return NextResponse.json({ error: 'Failed to create balance position' }, { status: 500 });
    }
}
