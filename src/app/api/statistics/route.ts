import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const festivalName = searchParams.get('festivalName');

    if (!festivalName) {
      return NextResponse.json(
        { success: false, error: 'Festival name is required' },
        { status: 400 }
      );
    }

    // Get total amount for this festival
    const festival = await db.festival.findUnique({
      where: { name: festivalName }
    });

    // Get count of donations
    const donationCount = await db.donation.count({
      where: { festivalName }
    });

    // Get unique donors
    const donations = await db.donation.findMany({
      where: { festivalName },
      select: { donorId: true }
    });

    const uniqueDonorCount = new Set(donations.map(d => d.donorId)).size;

    const totalAmount = festival?.counter || 0;

    return NextResponse.json({
      success: true,
      statistics: {
        totalAmount,
        donationCount,
        uniqueDonorCount
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
