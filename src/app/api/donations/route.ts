import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      civility,
      lastName,
      firstName,
      address,
      postalCode,
      commune,
      email,
      phone,
      festivalName,
      paymentMethod,
      donDuJourAmount,
      plateauCelesteAmount,
      effetsUsuelsAmount,
      entretienAmount,
      deceasedName1,
      deceasedName2,
      deceasedName3,
      deceasedName4
    } = body;

    // Calculate total amount
    const totalAmount =
      (parseFloat(donDuJourAmount) || 0) +
      (parseFloat(plateauCelesteAmount) || 0) +
      (parseFloat(effetsUsuelsAmount) || 0) +
      (parseFloat(entretienAmount) || 0);

    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Le montant total doit être supérieur à 0' },
        { status: 400 }
      );
    }

    // Find or create donor
    let donor: any;

    try {
      // Try to find existing donor using parameterized query
      const existingDonor = await db.$queryRawUnsafe(
        `SELECT id FROM Donor WHERE phone = '${phone}' LIMIT 1`
      );

      if (existingDonor && existingDonor.length > 0) {
        // Update existing donor
        await db.$executeRawUnsafe(
          `UPDATE Donor
          SET civility = '${civility || ''}', lastName = '${lastName || ''}', firstName = '${firstName || ''}',
              address = '${address || ''}', postalCode = '${postalCode || ''}', commune = '${commune || ''}',
              email = '${email || ''}'
          WHERE phone = '${phone}'`
        );

        const updatedDonor = await db.$queryRawUnsafe(
          `SELECT * FROM Donor WHERE phone = '${phone}' LIMIT 1`
        );
        donor = updatedDonor[0];
      } else {
        // Create new donor
        const newDonorId = crypto.randomUUID();
        await db.$executeRawUnsafe(
          `INSERT INTO Donor (id, civility, lastName, firstName, address, postalCode, commune, email, phone)
          VALUES ('${newDonorId}', '${civility || ''}', '${lastName || ''}', '${firstName || ''}',
                  '${address || ''}', '${postalCode || ''}', '${commune || ''}', '${email || ''}', '${phone}')`
        );

        const newDonor = await db.$queryRawUnsafe(
          `SELECT * FROM Donor WHERE id = '${newDonorId}' LIMIT 1`
        );
        donor = newDonor[0];
      }
    } catch (error: any) {
      console.error('Error with raw SQL, falling back to Prisma:', error);
      // Fallback to Prisma methods
      let donorPrisma = await db.donor.findUnique({
        where: { phone }
      });

      if (!donorPrisma) {
        donorPrisma = await db.donor.create({
          data: {
            civility,
            lastName,
            firstName,
            address,
            postalCode,
            commune,
            email,
            phone
          }
        });
      } else {
        donorPrisma = await db.donor.update({
          where: { phone },
          data: {
            civility,
            lastName,
            firstName,
            address,
            postalCode,
            commune,
            email
          }
        });
      }
      donor = donorPrisma;
    }

    // Create donation using raw SQL
    const donationId = crypto.randomUUID();
    const donDuJour = parseFloat(donDuJourAmount) || 0;
    const plateau = parseFloat(plateauCelesteAmount) || 0;
    const effets = parseFloat(effetsUsuelsAmount) || 0;
    const entretien = parseFloat(entretienAmount) || 0;
    const deceased1 = deceasedName1 || null;
    const deceased2 = deceasedName2 || null;
    const deceased3 = deceasedName3 || null;
    const deceased4 = deceasedName4 || null;

    await db.$executeRawUnsafe(
      `INSERT INTO Donation (id, donorId, festivalName, paymentMethod, donDuJourAmount, plateauCelesteAmount,
                          effetsUsuelsAmount, entretienAmount, deceasedName1, deceasedName2, deceasedName3,
                          deceasedName4, postalCode, commune, totalAmount)
      VALUES ('${donationId}', '${donor.id}', '${festivalName}', '${paymentMethod}', ${donDuJour}, ${plateau},
              ${effets}, ${entretien}, ${deceased1 ? `'${deceased1}'` : 'NULL'},
              ${deceased2 ? `'${deceased2}'` : 'NULL'}, ${deceased3 ? `'${deceased3}'` : 'NULL'},
              ${deceased4 ? `'${deceased4}'` : 'NULL'}, '${postalCode || ''}', '${commune || ''}', ${totalAmount})`
    );

    const donation = await db.$queryRawUnsafe(
      `SELECT * FROM Donation WHERE id = '${donationId}' LIMIT 1`
    );

    // Update festival counter
    let festival: any;
    try {
      const existingFestival = await db.$queryRawUnsafe(
        `SELECT * FROM Festival WHERE name = '${festivalName}' LIMIT 1`
      );

      if (existingFestival && existingFestival.length > 0) {
        await db.$executeRawUnsafe(
          `UPDATE Festival SET counter = counter + ${totalAmount} WHERE name = '${festivalName}'`
        );
        festival = existingFestival[0];
        festival.counter = festival.counter + totalAmount;
      } else {
        const newFestivalId = crypto.randomUUID();
        await db.$executeRawUnsafe(
          `INSERT INTO Festival (id, name, counter)
          VALUES ('${newFestivalId}', '${festivalName}', ${totalAmount})`
        );
        festival = { id: newFestivalId, name: festivalName, counter: totalAmount };
      }
    } catch (error) {
      console.error('Error updating festival:', error);
      // Fallback to Prisma for festival
      let festivalPrisma = await db.festival.findUnique({
        where: { name: festivalName }
      });

      if (!festivalPrisma) {
        festivalPrisma = await db.festival.create({
          data: {
            name: festivalName,
            counter: totalAmount
          }
        });
      } else {
        festivalPrisma = await db.festival.update({
          where: { name: festivalName },
          data: {
            counter: festivalPrisma.counter + totalAmount
          }
        });
      }
      festival = festivalPrisma;
    }

    return NextResponse.json({
      success: true,
      donation: donation[0],
      donor,
      totalAmount: festival.counter
    });
  } catch (error) {
    console.error('Error saving donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save donation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const donations = await db.donation.findMany({
      include: {
        donor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}