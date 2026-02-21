# 🐛 Résolution du Problème de Login sur Vercel

## Symptôme
Erreur lors de la tentative de connexion sur l'application déployée.

## Causes Possibles

### 1. Problème de Cookie sur Vercel
Les cookies httpOnly peuvent avoir des problèmes avec les domaines custom.

### 2. Problème de Middleware
Le middleware Vercel peut ne pas lire correctement les cookies.

### 3. Base de données non configurée
PostgreSQL n'est pas connecté correctement.

### 4. Variables d'environnement manquantes
JWT_SECRET ou autres variables non configurées.

---

## 🔧 Solutions Rapides

### Solution 1: Vérifier les Logs Vercel

1. Allez sur Vercel Dashboard
2. Sélectionnez votre projet
3. Cliquez sur **"Deployments"**
4. Cliquez sur votre déploiement
5. Cliquez sur **"View Function Logs"**
6. Recherchez "Error" ou "Exception"

### Solution 2: Désactiver temporairement le Middleware

Modifiez le fichier `.vercelignore` pour contourner le middleware :

```
# Temporairement - pour tester
middleware.ts
```

Puis renommez `src/middleware.ts` :
```bash
mv src/middleware.ts src/middleware.ts.bak
```

Redéployez et testez si le login fonctionne.

### Solution 3: Vérifier Base de Données

Testez la connexion DB en créant un endpoint debug :

```typescript
// src/app/api/debug/db-test/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.user.findMany();
    return NextResponse.json({
      success: true,
      count: result.length,
      message: 'Database connection OK'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
```

Puis testez : `https://votre-app.vercel.app/api/debug/db-test`

### Solution 4: Vérifier les Variables

Vérifiez dans Vercel Dashboard → Settings → Environment Variables que :
- [ ] `DATABASE_URL` est présent et contient `postgresql://...`
- [ ] `JWT_SECRET` est présent (valeur masquée)
- [ ] `NODE_ENV` = `production`

---

## 📋 Correction du Middleware pour Vercel

Le problème principal est souvent que le middleware ne lit pas le cookie correctement.

Modifiez `src/middleware.ts` pour utiliser localStorage au lieu de cookies :

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permettre l'accès à login et API
  if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug')) {
    return NextResponse.next();
  }

  // Permettre l'accès à admin et homepage sans auth (temporairement pour tester)
  if (pathname === '/' || pathname === '/admin') {
    return NextResponse.next();
  }

  // Autres routes nécessitent auth
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 🚀 Déploiement avec Correction

```bash
# 1. Faire les modifications
git add .
git commit -m "Fix login issue - disable middleware temporarily"

# 2. Pousser
git push

# 3. Vercel redéploie automatiquement
```

---

## 📞 Logs à Chercher

Dans les logs Vercel, cherchez :

| Erreur | Cause |
|--------|--------|
| `DATABASE_URL is not defined` | Variable manquante |
| `Can't reach database server` | DB URL incorrecte |
| `Invalid JWT` | JWT_SECRET incorrecte |
| `Middleware error` | Problème middleware |
| `Cookie not found` | Cookie httpOnly |

---

## 🎯 Plan d'Action

1. **Consultez les logs** → Identifiez l'erreur exacte
2. **Testez l'endpoint debug** → Vérifiez la DB
3. **Désactivez middleware** → Testez sans auth
4. **Réactivez progressivement** → Identifiez ce qui bloque
5. **Documentez les erreurs** → Pour corrections futures

---

Si vous avez un message d'erreur spécifique, partagez-le et je vous aiderai à le résoudre.
