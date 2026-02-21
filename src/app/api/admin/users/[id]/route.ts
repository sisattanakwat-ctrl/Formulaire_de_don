import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuthToken(request);

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Delete user
    await db.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
