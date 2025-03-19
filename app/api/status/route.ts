/**
 * Simple API status endpoint
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
} 