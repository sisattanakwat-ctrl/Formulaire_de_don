import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as nodemailer from 'nodemailer';

const execAsync = promisify(exec);

interface DonationData {
  civility: string;
  lastName: string;
  firstName: string;
  address: string;
  postalCode: string;
  commune: string;
  email: string;
  festivalName: string;
  totalAmount: number;
}

async function generatePDF(data: any): Promise<Buffer> {
  const pythonScript = path.join(process.cwd(), 'scripts', 'generate_donation_pdf.py');
  const pythonPath = '/home/z/project_venv/bin/python3';
  const inputData = JSON.stringify(data);

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

// Email transport configuration
// Pour utiliser ce service, vous devez configurer les variables d'environnement:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || 'noreply@pagode-wat-sisattanak.com';

  // Log de débogage pour vérifier la configuration SMTP
  console.log('[SMTP Config]', {
    host,
    port,
    user: user ? '***' + user.substring(user.indexOf('@')) : 'undefined',
    pass: pass ? '***configured***' : 'undefined',
    from
  });

  if (!host || !user || !pass) {
    console.warn('SMTP configuration not found, emails will not be sent');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { email, firstName, lastName, festivalName, totalAmount } = data;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(data);

    // Get email transporter
    const transporter = getTransporter();
    
    if (!transporter) {
      console.warn('Email not sent: SMTP not configured');
      return NextResponse.json(
        { 
          success: false, 
          warning: 'Service de messagerie non configuré. Le PDF a été téléchargé mais l\'email n\'a pas été envoyé.' 
        },
        { status: 200 }
      );
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Pagode Wat Sisattanak <noreply@pagode-wat-sisattanak.com>',
      to: email,
      subject: `Reçu de don - ${firstName} ${lastName} - ${festivalName}`,
      text: `
Bonjour ${firstName} ${lastName},

Merci pour votre générosité! Veuillez trouver ci-joint votre reçu de don de ${totalAmount}€ pour la fête ${festivalName} à la Pagode Wat Sisattanak.

Détails du don:
- Donateur: ${data.civility} ${firstName} ${lastName}
- Festival: ${festivalName}
- Montant: ${totalAmount}€
Adresse:
${data.address}
${data.postalCode} ${data.commune}

Nous vous remercions sincèrement pour votre soutien à la pagode.

Cordialement,
L'équipe de la Pagode Wat Sisattanak
ວັດສິສັດຕະນັກ
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #fef3c7; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .amount { font-size: 28px; color: #b45309; font-weight: bold; text-align: center; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .thank-you { text-align: center; font-style: italic; color: #b45309; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🙏 Reçu de Don 🙏</h1>
      <p>Pagode Wat Sisattanak - ວັດສິສັດຕະນັກ</p>
    </div>
    <div class="content">
      <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
      
      <div class="thank-you">
        Merci infiniment pour votre générosité et votre soutien à notre pagode!
      </div>
      
      <p>Veuillez trouver ci-joint votre reçu de don officiel.</p>
      
      <div class="details">
        <h3>Détails du don / ລາຍລະອຽດການບໍລິຈາກ</h3>
        <p><strong>Donateur:</strong> ${data.civility} ${firstName} ${lastName}</p>
        <p><strong>Festival:</strong> ${festivalName}</p>
        <div class="amount">${totalAmount}€</div>
      </div>
      
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      
      <div class="footer">
        <p><strong>Pagode Wat Sisattanak</strong></p>
        <p>ວັດສິສັດຕະນັກ</p>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">
          Cet email a été envoyé automatiquement. Merci pour votre soutien!
        </p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
      attachments: [
        {
          filename: `recu_don_${festivalName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Reçu envoyé par email avec succès!'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
