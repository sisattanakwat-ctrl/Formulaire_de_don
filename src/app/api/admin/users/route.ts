import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

async function verifyAuthToken(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) return null;

    // Decode JWT token (simple base64 decode)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    );

    return {
      userId: payload.userId,
      role: payload.role
    };
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des utilisateurs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé. Admin requis.' },
        { status: 403 }
      );
    }

    const { email, password, name, role } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || 'user',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
