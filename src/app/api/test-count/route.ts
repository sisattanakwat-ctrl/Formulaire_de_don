import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const festivalName = 'Boun Makha bouxa';
    
    // Get festival
    const festival = await db.festival.findUnique({
      where: { name: festivalName }
    });

    // Simple count
    const donationCount = await db.donation.count({
      where: { festivalName }
    });

    // Get all donations
    const allDonations = await db.donation.findMany({
      where: { festivalName },
      select: {
        id: true,
        donorId: true,
        totalAmount: true,
        createdAt: true,
        paymentMethod: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Unique donors
    const uniqueDonors = new Set(allDonations.map(d => d.donorId)).size;

    return NextResponse.json({
      success: true,
      data: {
        festivalName,
        festival: festival,
        donationCount,
        allDonationsCount: allDonations.length,
        uniqueDonors,
        donations: allDonations.slice(0, 10) // First 10
      }
    });
  } catch (error) {
    console.error('Test count error:', error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
