import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const donor = await db.donor.findUnique({
      where: { phone }
    });

    if (!donor) {
      return NextResponse.json({ success: true, donor: null });
    }

    return NextResponse.json({ success: true, donor });
  } catch (error) {
    console.error('Error searching donor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search donor' },
      { status: 500 }
    );
  }
}
