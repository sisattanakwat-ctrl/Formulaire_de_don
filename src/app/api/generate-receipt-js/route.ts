import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Translations des festivals
const festivalTranslations: Record<string, { fr: string; lo: string }> = {
  'Boun Makha bouxa': { fr: 'Boun Makha bouxa', lo: 'ບຸນມາກະບູຊ' },
  'Boun Nouvel an Lao': { fr: 'Boun Nouvel an Lao', lo: 'ປີ່ນປີ່ລາວ' },
  'Boun Visakha bouxa': { fr: 'Boun Visakha bouxa', lo: 'ບຸນວິສາຂະບູຊ' },
  'Boun Khao Phansa': { fr: 'Boun Khao Phansa', lo: 'ບຸນເາວພັນຊາ' },
  'Boun Khoun Khao': { fr: 'Boun Khoun Khao', lo: 'ບຸນຂູນເາວ' },
  'Boun Hork Khao Salak': { fr: 'Boun Hork Khao Salak', lo: 'ບຸນເອກເາວສາລັກ' },
  'Boun Ok Phansa': { fr: 'Boun Ok Phansa', lo: 'ບຸນອກພັນຊາ' },
  'Boun Kathina': { fr: 'Boun Kathina', lo: 'ບຸນກະຖີນ' },
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      civility,
      lastName,
      firstName,
      address,
      postalCode,
      commune,
      email,
      phone,
      paymentMethod,
      festivalName,
      donDuJourAmount,
      plateauCelesteAmount,
      effetsUsuelsAmount,
      entretienAmount,
      deceasedName1,
      deceasedName2,
      deceasedName3,
      deceasedName4,
      totalAmount,
    } = data;

    // Créer PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reçu de Don', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Informations générales
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const generalInfoData = [
      ['Civilité', civility || ''],
      ['Nom', lastName || ''],
      ['Prénom', firstName || ''],
      ['Adresse', address || ''],
      ['Code postal, Commune', `${postalCode || ''}, ${commune || ''}`],
      ['Email', email || ''],
      ['Téléphone', phone || ''],
      ['Mode de paiement', paymentMethod === 'cash' ? 'Espèces' : 'Chèque'],
      ['Fête', festivalName || ''],
      ['Date', new Date().toLocaleDateString('fr-FR')],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: generalInfoData.map(item => item),
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Détails des dons
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails des dons', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    const donationDetails = [];
    if (donDuJourAmount && parseFloat(donDuJourAmount) > 0) {
      donationDetails.push(['Dons du jour', `${donDuJourAmount} €`]);
    }
    if (plateauCelesteAmount && parseFloat(plateauCelesteAmount) > 0) {
      donationDetails.push(['Plateau céleste', `${plateauCelesteAmount} €`]);
    }
    if (effetsUsuelsAmount && parseFloat(effetsUsuelsAmount) > 0) {
      donationDetails.push(['Effets usuels des moines', `${effetsUsuelsAmount} €`]);
    }
    if (entretienAmount && parseFloat(entretienAmount) > 0) {
      donationDetails.push(['Entretien de la pagode', `${entretienAmount} €`]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Montant']],
      body: donationDetails,
      theme: 'grid',
      headStyles: {
        fillColor: [251, 191, 36], // amber-400
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 40, halign: 'right' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${totalAmount} €`, pageWidth - 40, yPos, { align: 'right' });
    yPos += 15;

    // Défunts (si présents)
    const deceasedNames = [deceasedName1, deceasedName2, deceasedName3, deceasedName4].filter(Boolean);
    if (deceasedNames.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Pour dédier aux ancetres et parents defunts:', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      deceasedNames.forEach((name, index) => {
        doc.text(`${index + 1}. ${name}`, 25, yPos);
        yPos += 7;
      });
    }

    // Footer
    const footerY = pageHeight - 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Pagode Wat Sisattanak', pageWidth / 2, footerY, { align: 'center' });
    doc.text('ວັດສິສັດຕະນັກ', pageWidth / 2, footerY + 6, { align: 'center' });

    // Générer PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recu_don_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la generation du PDF' },
      { status: 500 }
    );
  }
}
