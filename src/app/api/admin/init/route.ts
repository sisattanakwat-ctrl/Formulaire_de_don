import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Un administrateur existe déjà',
        existingAdmin: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      }, { status: 400 });
    }

    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
