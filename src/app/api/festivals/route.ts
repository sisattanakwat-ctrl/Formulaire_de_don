import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const festivals = await db.festival.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, festivals });
  } catch (error) {
    console.error('Error fetching festivals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch festivals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    const festival = await db.festival.create({
      data: {
        name
      }
    });

    return NextResponse.json({ success: true, festival });
  } catch (error) {
    console.error('Error creating festival:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create festival' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { festivalId, action } = body;

    if (action === 'close') {
      const festival = await db.festival.update({
        where: { id: festivalId },
        data: {
          closed: true
        }
      });

      // Reset counter
      await db.festival.update({
        where: { id: festivalId },
        data: {
          counter: 0
        }
      });

      return NextResponse.json({ success: true, festival });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating festival:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update festival' },
      { status: 500 }
    );
  }
}
