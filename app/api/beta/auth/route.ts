import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req:NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const whitelistPath = path.join(process.cwd(),  'data', 'whitelist.json');
    const whitelistData = JSON.parse(fs.readFileSync(whitelistPath, 'utf-8'));
    const isWhitelisted = whitelistData.addresses.includes(address);
    return NextResponse.json({ isWhitelisted });
  } catch (error) {
    console.error('Error reading whitelist file:', error);
    return NextResponse.json(
      { error: 'Failed to check whitelist' },
      { status: 500 }
    );
  }
}