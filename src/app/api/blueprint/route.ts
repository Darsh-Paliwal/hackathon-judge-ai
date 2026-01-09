import { NextRequest, NextResponse } from 'next/server';
import { blueprint } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET blueprint (criteria weights)
export async function GET() {
  return NextResponse.json(blueprint);
}

// UPDATE blueprint (in-memory)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Update blueprint in memory
    Object.assign(blueprint, body);

    return NextResponse.json({
      success: true,
      blueprint,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update blueprint' },
      { status: 500 }
    );
  }
}
