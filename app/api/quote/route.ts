import { NextRequest, NextResponse } from 'next/server';
import { ChainType, RoutesRequest, getChains, getRoutes } from '@lifi/sdk';
import { z } from 'zod';

// Input validation schema
const QuoteRequestSchema = z.object({
  fromTokenAddress: z.string(),
  toTokenAddress: z.string(),
  fromAmount: z.string()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = QuoteRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validation.error },
        { status: 400 }
      );
    }

    const { fromTokenAddress, toTokenAddress, fromAmount } = validation.data;

    // Get chains and validate
    const chains = await getChains({ chainTypes: [ChainType.SVM] });
    if (!chains) {
      return NextResponse.json(
        { error: 'Failed to fetch chain information' },
        { status: 500 }
      );
    }

    // Prepare route request
    const routesRequest: RoutesRequest = {
      fromChainId: 1151111081099710,
      toChainId: 1151111081099710,
      fromTokenAddress,
      toTokenAddress,
      fromAmount
    };

    // Get routes
    const result = await getRoutes(routesRequest);
    const routes = result.routes;

    return NextResponse.json({ routes });

  } catch (error) {
    console.error('Error in quote endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}