import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Permettre l'accès à toutes les routes - SANS AUTHENTIFICATION
  // C'est pour corriger le problème d'accès sur Z.ai preview

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
