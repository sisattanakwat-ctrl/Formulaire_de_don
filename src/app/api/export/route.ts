import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Workbook } from 'exceljs';

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

    // Get donations for this festival
    const donations = await db.donation.findMany({
      where: { festivalName },
      include: {
        donor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Create Excel workbook
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Dons');

    // Add headers with multilingual labels
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Civilité', key: 'civility', width: 15 },
      { header: 'Nom', key: 'lastName', width: 20 },
      { header: 'Prénom', key: 'firstName', width: 20 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'phone', width: 15 },
      { header: 'Fête', key: 'festivalName', width: 25 },
      { header: 'Mode de paiement', key: 'paymentMethod', width: 15 },
      { header: 'Dons du jour (€)', key: 'donDuJourAmount', width: 15 },
      { header: 'Plateau céleste (€)', key: 'plateauCelesteAmount', width: 15 },
      { header: 'Effets usuels (€)', key: 'effetsUsuelsAmount', width: 15 },
      { header: 'Entretien pagode (€)', key: 'entretienAmount', width: 15 },
      { header: 'Total (€)', key: 'totalAmount', width: 12 },
      { header: 'Défunt 1', key: 'deceasedName1', width: 20 },
      { header: 'Défunt 2', key: 'deceasedName2', width: 20 },
      { header: 'Défunt 3', key: 'deceasedName3', width: 20 },
      { header: 'Défunt 4', key: 'deceasedName4', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // Add data rows
    donations.forEach((donation, index) => {
      const paymentMethodLabel = donation.paymentMethod === 'cash' ? 'Espèces' : 'Chèque';
      
      worksheet.addRow({
        date: new Date(donation.createdAt).toLocaleDateString('fr-FR'),
        civility: donation.donor.civility || '',
        lastName: donation.donor.lastName,
        firstName: donation.donor.firstName,
        address: donation.donor.address || '',
        email: donation.donor.email || '',
        phone: donation.donor.phone,
        festivalName: donation.festivalName,
        paymentMethod: paymentMethodLabel,
        donDuJourAmount: donation.donDuJourAmount || '',
        plateauCelesteAmount: donation.plateauCelesteAmount || '',
        effetsUsuelsAmount: donation.effetsUsuelsAmount || '',
        entretienAmount: donation.entretienAmount || '',
        totalAmount: donation.totalAmount,
        deceasedName1: donation.deceasedName1 || '',
        deceasedName2: donation.deceasedName2 || '',
        deceasedName3: donation.deceasedName3 || '',
        deceasedName4: donation.deceasedName4 || ''
      });

      // Auto-fit row height
      worksheet.getRow(index + 2).alignment = { vertical: 'top', wrapText: true };
    });

    // Calculate totals
    const totalDonDuJour = donations.reduce((sum, d) => sum + (d.donDuJourAmount || 0), 0);
    const totalPlateauCeleste = donations.reduce((sum, d) => sum + (d.plateauCelesteAmount || 0), 0);
    const totalEffetsUsuels = donations.reduce((sum, d) => sum + (d.effetsUsuelsAmount || 0), 0);
    const totalEntretien = donations.reduce((sum, d) => sum + (d.entretienAmount || 0), 0);
    const grandTotal = donations.reduce((sum, d) => sum + d.totalAmount, 0);

    // Add total rows
    worksheet.addRow({ 
      donDuJourAmount: totalDonDuJour,
      plateauCelesteAmount: totalPlateauCeleste,
      effetsUsuelsAmount: totalEffetsUsuels,
      entretienAmount: totalEntretien,
      totalAmount: grandTotal
    });

    const totalRowIndex = donations.length + 2;
    worksheet.getRow(totalRowIndex).font = { bold: true, size: 12 };
    worksheet.getRow(totalRowIndex).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="dons_${festivalName}_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export Excel' },
      { status: 500 }
    );
  }
}
