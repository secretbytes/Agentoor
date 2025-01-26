import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { NextRequest, NextResponse } from 'next/server';
import { createSolanaConnection } from '@/lib/solana';

const MINT_ADDRESS = new PublicKey('FKMbGJh236PbnCMWuMVyRESWiEDkQo5Lv6ZXAVPVpump');
const connection = createSolanaConnection()

async function getTokenBalance(walletAddress:PublicKey) {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MINT_ADDRESS, walletAddress);

    const tokenAccount = await getAccount(connection, associatedTokenAddress);
    return tokenAccount.amount.toString();
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return null;
  }
}

export async function GET(req:NextRequest) {
    const walletAddress = req.nextUrl?.searchParams?.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const balance = await getTokenBalance(walletPublicKey);

    if (balance === null) {
      return NextResponse.json({ error: 'Could not retrieve token balance' }, { status: 500 });
    }
    const tokenBalance = parseFloat(balance) / Math.pow(10, 6);
    if (tokenBalance >= 10000) {
      return NextResponse.json({ accessGranted: true, balance: tokenBalance });
    } else {
      return NextResponse.json({ accessGranted: false, balance: tokenBalance });
    }
  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}