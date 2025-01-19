import { Connection } from '@solana/web3.js';

const RPC_URL = 'https://spring-silent-asphalt.solana-mainnet.quiknode.pro/bb1893fb836e6afbdef2f66e511cb53fc38929a2';

export function createSolanaConnection(): Connection {
    const connection = new Connection(RPC_URL, 'finalized');
    console.log('Solana connection created with RPC URL:', RPC_URL);
    return connection;
}

