import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

// API pour générer des reçus de don en PDF
// Utilise Python avec reportlab pour la génération

const execAsync = promisify(exec);

interface DonationData {
  civility: string;
  lastName: string;
  firstName: string;
  address: string;
  postalCode?: string;
  commune?: string;
  email: string;
  phone: string;
  festivalName: string;
  paymentMethod: string;
  donDuJourAmount: string;
  plateauCelesteAmount: string;
  effetsUsuelsAmount: string;
  entretienAmount: string;
  deceasedName1?: string;
  deceasedName2?: string;
  deceasedName3?: string;
  deceasedName4?: string;
  totalAmount: number;
  donationDate: Date;
}

async function generateDonationPDF(data: DonationData): Promise<Buffer> {
  const pythonScript = path.join(process.cwd(), 'scripts', 'generate_donation_pdf.py');
  // Utiliser l'environnement virtuel Python avec reportlab installé
  const pythonPath = '/home/z/project_venv/bin/python3';

  // Prepare data for Python script
  const inputData = JSON.stringify({
    ...data,
    postalCode: data.postalCode || '',
    commune: data.commune || ''
  });

  console.log(`[PDF Generation] Using Python at: ${pythonPath}`);
  console.log(`[PDF Generation] Script: ${pythonScript}`);

  try {
    const { stdout, stderr } = await execAsync(
      `${pythonPath} ${pythonScript} '${inputData.replace(/'/g, "\\'")}'`,
      {
        encoding: 'buffer',
      }
    );

    if (stderr && stderr.length > 0) {
      console.error('PDF generation warning:', stderr.toString());
    }

    return stdout as Buffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate PDF
    const pdfBuffer = await generateDonationPDF({
      civility: data.civility,
      lastName: data.lastName,
      firstName: data.firstName,
      address: data.address,
      postalCode: data.postalCode,
      commune: data.commune,
      email: data.email,
      phone: data.phone,
      festivalName: data.festivalName,
      paymentMethod: data.paymentMethod,
      donDuJourAmount: data.donDuJourAmount,
      plateauCelesteAmount: data.plateauCelesteAmount,
      effetsUsuelsAmount: data.effetsUsuelsAmount,
      entretienAmount: data.entretienAmount,
      deceasedName1: data.deceasedName1,
      deceasedName2: data.deceasedName2,
      deceasedName3: data.deceasedName3,
      deceasedName4: data.deceasedName4,
      totalAmount: data.totalAmount,
      donationDate: new Date(),
    });

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recu_don_${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate receipt PDF' },
      { status: 500 }
    );
  }
}
