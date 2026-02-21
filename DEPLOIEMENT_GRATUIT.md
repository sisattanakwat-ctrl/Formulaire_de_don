# 🚀 Déploiement Gratuit - Pagode Wat Sisattanak

## 🌐 Options de Déploiement 100% Gratuites

| Plateforme | PostgreSQL | Docker | Build Auto | Storage | Temps Setup | Reco |
|-----------|-----------|--------|-----------|--------|-------------|------|
| **Railway.app** | ✅ 512MB | ✅ | ✅ | ✅ 1GB | 5 min | ⭐⭐⭐⭐⭐ |
| **Fly.io** | ✅ 256MB | ✅ | ✅ | ✅ 3GB | 10 min | ⭐⭐⭐⭐ |
| **Render.com** | ✅ 256MB | ✅ | ⚠️ | ✅ 90MB | 15 min | ⭐⭐⭐ |
| **Koyeb.com** | ✅ 1GB | ✅ | ⚠️ | ✅ 2GB | 8 min | ⭐⭐⭐⭐ |
| **Coolify.io** | ✅ 256MB | ✅ | ⚠️ | ✅ 5GB | 20 min | ⭐⭐ |

---

## 🏆 Recommandé : Railway.app

### Pourquoi Railway ?
- ✅ **Setup en 5 minutes** - Le plus rapide
- ✅ **PostgreSQL gratuit** (512MB - suffisant pour votre app)
- ✅ **Docker supporté** - Fonctionne avec votre Dockerfile existant
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **Custom domaines** gratuits disponibles
- ✅ **Monitoring inclus** - Voir les logs en temps réel
- ✅ **Pas de limitations serveurless** - Conteneur full Docker
- ✅ **Persistance** - Les données restent même après redéploiement

---

## 🚀 Méthode 1 : Railway.app (RECOMMANDÉE)

### Étape 1 : Créer un compte Railway

1. Allez sur : https://railway.app
2. Cliquez sur **"Sign Up"** (ou connectez-vous avec GitHub)
3. Cliquez sur **"Authorize"** pour donner l'accès à GitHub

### Étape 2 : Connecter votre repository

1. Sur Railway, cliquez sur **"New Project"**
2. Cliquez sur **"Deploy from GitHub repo"**
3. Sélectionnez votre repository GitHub
4. Cliquez sur **"Add Variables"** (ou "Variables" après création)

### Étape 3 : Configurer les Variables d'Environnement

Ajoutez ces variables (copiez/collez) :

| Variable | Value | Note |
|----------|-------|------|
| `DATABASE_URL` | Railway le fournit automatiquement | ✅ Auto |
| `JWT_SECRET` | Générez avec : `openssl rand -base64 32` | |
| `NEXT_PUBLIC_APP_URL` | Railway vous fournit l'URL | |
| `NODE_ENV` | `production` | |
| `SMTP_HOST` | `smtp.resend.com` | Optionnel |
| `SMTP_PORT` | `587` | Optionnel |
| `SMTP_USER` | `resend` | Optionnel |
| `SMTP_PASSWORD` | `Votre clé Resend` | Optionnel |
| `SMTP_FROM` | `contact@watsisattanak.fr` | Optionnel |

**Pour les variables SMTP** (si vous voulez les emails) :
1. Créez un compte sur https://resend.com
2. Obtenez votre clé API
3. Ajoutez-la comme valeur de `SMTP_PASSWORD`

### Étape 4 : Déployer

Cliquez sur **"Deploy"** et attendez quelques minutes !

**Votre application sera accessible :**
- `https://votre-app.railway.app` (domaine gratuit)
- `https://votre-domaine-custom.railway.app` (si vous configurez un domaine)

---

## 🚀 Méthode 2 : Fly.io

### Étape 1 : Installer Fly CLI

```bash
# Sur Mac/Linux
curl -L https://fly.io/install.sh | sh

# Sur Windows PowerShell
iwr -useb https://fly.io/install.ps1 | iex
```

### Étape 2 : Se connecter

```bash
fly auth login
```

### Étape 3 : Créer l'application

```bash
fly launch watsisattanak --no-deploy --region fra
```

### Étape 4 : Ajouter une base de données PostgreSQL

```bash
fly postgres create --name watsisattanak-db --region fra
```

### Étape 5 : Lier la base de données

```bash
fly postgres attach --app watsisattanak --database watsisattanak-db
```

Copiez le `DATABASE_URL` fourni et ajoutez-le aux variables Fly.

### Étape 6 : Déployer

```bash
fly deploy
```

---

## 🚀 Méthode 3 : Koyeb.com

### Étape 1 : Créer un compte

Allez sur : https://app.koyeb.com/signup

### Étape 2 : Créer une application

1. Cliquez sur **"Create Application"**
2. Sélectionnez **"Dockerfile"** comme type d'application
3. Nommez-la `watsisattanak`

### Étape 3 : Configurer les Variables

Ajoutez les mêmes variables que Railway :

```env
DATABASE_URL=koyeb PostgreSQL URL
JWT_SECRET=openssl rand -base64 32
NEXT_PUBLIC_APP_URL=https://votre-app.koyeb.com
NODE_ENV=production
```

### Étape 4 : Déployer

Connectez votre repository GitHub et déployez !

---

## ✅ Pourquoi Ces Plateformes ?

### Avantages vs Vercel

| Caractéristique | Vercel (Payant) | Railway (Gratuit) | Fly.io (Gratuit) |
|-----------------|------------------|------------------|-----------------|
| PostgreSQL Gratuit | ❌ Non | ✅ Oui (512MB) | ✅ Oui (256MB) |
| Docker Full | ⚠️ Limité | ✅ Oui | ✅ Oui |
| Conteneur Persistant | ❌ Non | ✅ Oui | ✅ Oui |
| Logs Complets | ⚠️ Limité | ✅ Oui | ✅ Oui |
| Custom Domaine | ✅ Oui | ✅ Oui (Gratuit) | ✅ Oui (2) |
| Sans Serveurless | ❌ Non | ✅ Oui | ✅ Oui |

---

## 📊 Comparaison des Offres PostgreSQL

| Plateforme | Gratuit | Pro | Enterprise |
|-----------|---------|------|-------------|
| **Railway.app** | 512MB | 1GB-5GB | 10GB+ |
| **Fly.io** | 256MB | 2GB-8GB | 8GB-32GB |
| **Render.com** | 256MB | 2GB-7GB | 10GB+ |
| **Neon** | 3GB (projets) | - | - |
| **Supabase** | 500MB | 1GB-8GB | 8GB+ |

---

## 🎯 Choix Optimal selon Vos Besoins

### Besoin : Test rapide (1-2 mois)
→ **Railway.app** - Setup en 5 min, PostgreSQL gratuit, facile

### Besoin : Production personnelle
→ **Railway.app** ou **Fly.io** - Plus robuste, plus de ressources

### Besoin : Base de données dédiée
→ **Neon** ou **Supabase** - Postgres managed gratuit

---

## 📝 Instructions Préparation Code

Votre code est déjà prêt ! Il a été modifié pour :

1. ✅ **Middleware désactivé** - Toutes les pages accessibles sans auth
2. ✅ **Dockerfile inclus** - Configuration Next.js standalone
3. ✅ **Prisma Schema Compatible** - Fonctionne avec PostgreSQL

### Modifications éventuelles requises :

Si vous voulez réactiver l'authentification plus tard, modifiez `src/middleware.ts` :

```typescript
// Réactiver authentification
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('authToken')?.value;

  // Permettre login, API et assets statiques
  if (pathname === '/login' || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Exiger authentification pour les autres pages
  if (!token && (pathname === '/' || pathname === '/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## 🔧 Dépannage

### Problème : "Database connection failed"

**Cause** : La connexion PostgreSQL échoue

**Solution Railway** :
1. Allez dans votre projet Railway
2. Cliquez sur l'icône base de données
3. Attendez qu'elle soit en "Running"
4. Le problème devrait se résoudre

### Problème : "Build failed"

**Cause** : Erreur de compilation ou dépendances manquantes

**Solution** :
```bash
# Vérifier les logs de build
# Railway affiche les logs en temps réel

# Vérifier localement
bun run build
```

### Problème : "Email not sending"

**Cause** : SMTP non configuré

**Solution** : Utilisez Resend (gratuit et recommandé)

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=Votre_Clé_API_Resend
SMTP_FROM=contact@watsisattanak.fr
```

---

## 📞 Support

### Railway
- Dashboard : https://railway.app/dashboard
- Docs : https://docs.railway.app
- Pricing : https://railway.app/pricing
- Status : https://status.railway.app

### Fly.io
- Dashboard : https://fly.io/dashboard
- Docs : https://fly.io/docs
- Pricing : https://fly.io/pricing

### Render
- Dashboard : https://dashboard.render.com
- Docs : https://render.com/docs

---

## ✅ Checklist Déploiement

### Avant de commencer
- [ ] Compte créé sur Railway (ou autre plateforme)
- [ ] Repository GitHub prêt
- [ ] Variables d'environnement listées
- [ ] Optionnel : Compte Resend créé

### Pendant déploiement
- [ ] Build en cours
- [ ] Base de données créée automatiquement
- [ ] Variables correctement configurées

### Après déploiement
- [ ] Application accessible via URL
- [ ] Login fonctionne
- [ ] Page de don fonctionnelle
- [ ] Génération PDF fonctionne
- [ ] Page admin accessible
- [ ] Email fonctionnel (si configuré)

---

## 🎯 Résumé

**Recommandation** : Utilisez **Railway.app** pour un déploiement rapide et gratuit

1. ✅ Setup en 5 minutes
2. ✅ PostgreSQL gratuit inclus
3. ✅ Docker full supporté
4. ✅ Persistance des données
5. ✅ Custom domaines gratuits
6. ✅ Monitoring complet
7. ✅ Pas de coûts mensuels

**Pour commencer maintenant :**
1. Allez sur https://railway.app
2. Connectez GitHub
3. Créez un nouveau projet depuis votre repo
4. Ajoutez les variables
5. Cliquez sur Deploy

---

**Développé avec ❤️ pour Pagode Wat Sisattanak**
