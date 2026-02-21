import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface DonationData {
  civility: string;
  lastName: string;
  firstName: string;
  address: string;
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

export async function generateDonationPDF(data: DonationData): Promise<Buffer> {
  const pythonScript = path.join(process.cwd(), 'scripts', 'generate_donation_pdf.py');

  // Prepare data for Python script
  const inputData = JSON.stringify(data);

  try {
    const { stdout, stderr } = await execAsync(
      `python3 ${pythonScript} '${inputData.replace(/'/g, "\\'")}'`,
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
