# Guide de Déploiement sur Vercel

## 🚀 Prérequis

### 1. Base de Données

**⚠️ Important :** Vercel ne supporte pas SQLite pour la production. Vous devez migrer vers PostgreSQL.

**Options de base de données pour Vercel :**
- **Vercel Postgres** (Recommandé) - https://vercel.com/postgres
- **Neon** - https://neon.tech
- **Supabase** - https://supabase.com
- **PlanetScale** - https://planetscale.com

### 2. Configuration Email

Utilisez un service SMTP compatible Vercel :
- **Resend** (Recommandé pour Vercel) - https://resend.com
- **SendGrid** - https://sendgrid.com
- **Mailgun** - https://mailgun.com

### 3. Variables d'environnement requises

Ajoutez ces variables dans votre projet Vercel :

```env
# Base de données
DATABASE_URL=postgresql://...

# Authentification
JWT_SECRET=votre_secret_super_secure_au_moins_32_caracteres

# Email SMTP (exemple avec Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=votre_api_key_resend
SMTP_FROM=contact@watsisattanak.fr

# Application
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

## 📋 Étapes de Déploiement

### Option 1 : Déploiement Automatique via GitHub

1. **Pushez votre code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/votre-repo.git
   git push -u origin main
   ```

2. **Importez sur Vercel**
   - Allez sur https://vercel.com/new
   - Sélectionnez votre repository GitHub
   - Vercel détectera automatiquement Next.js

3. **Configurez les variables d'environnement**
   - Dans les settings du projet Vercel
   - Allez dans "Environment Variables"
   - Ajoutez toutes les variables listées ci-dessus

4. **Connectez Vercel Postgres**
   - Allez dans "Storage" → "Create Database"
   - Sélectionnez "Postgres"
   - Copiez le `DATABASE_URL` fourni
   - Ajoutez-le dans vos variables d'environnement

### Option 2 : Déploiement via Vercel CLI

```bash
# Installez Vercel CLI
bun add -g vercel

# Connectez-vous
vercel login

# Déployez
vercel
```

## 🔄 Migration vers PostgreSQL

### 1. Installez PostgreSQL localement
```bash
# Sur macOS
brew install postgresql

# Sur Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

### 2. Créez une base PostgreSQL locale
```bash
createdb watsisattanak_dev
```

### 3. Mettez à jour .env
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/watsisattanak_dev
```

### 4. Migration du schéma
Le schéma Prisma est déjà compatible avec PostgreSQL, il faut juste générer la migration :
```bash
bunx prisma migrate dev --name init
```

### 5. Mettez à jour DATABASE_URL pour Vercel Postgres
Une fois créé sur Vercel, utilisez l'URL fournie.

## 📄 Alternative pour PDF sur Vercel

**⚠️ Important :** Le script Python `generate_donation_pdf.py` ne fonctionnera pas sur Vercel car Vercel n'exécute pas Python dans les API routes.

### Solution : Utiliser jsPDF (JavaScript)

J'ai créé une API route en JavaScript qui remplace le script Python. Voir :
`/src/app/api/generate-receipt-js/route.ts`

Cette version utilise :
- `jspdf` pour la génération PDF
- `jspdf-autotable` pour les tableaux
- Support des fonts Unicode pour le lao

## ✅ Checklist avant déploiement

- [ ] GitHub repository créé et poussé
- [ ] Base de données PostgreSQL créée (Vercel Postgres ou autre)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] `DATABASE_URL` ajoutée avec URL PostgreSQL
- [ ] `JWT_SECRET` ajoutée (valeur sécurisée)
- [ ] Configuration SMTP ajoutée
- [ ] Migration Prisma exécutée
- [ ] Test local avec PostgreSQL
- [ ] Test de génération PDF avec nouvelle API JS

## 🐛 Dépannage

### Erreur : "Module not found: Can't resolve 'fs'"
Les API routes Vercel sont serverless, certaines fonctions `fs` ne fonctionnent pas.

### Erreur : "Database connection timeout"
Vercel Postgres a un délai d'inactivité. Utilisez connection pooling :
```prisma
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Pour Vercel Postgres
}
```

### Email ne fonctionne pas
Vérifiez que :
1. Le SMTP host est correct
2. Les identifiants sont valides
3. Le port est correct (587 pour STARTTLS, 465 pour SSL)
4. L'email FROM est vérifié chez le fournisseur

## 📞 Support

- Vercel Docs : https://vercel.com/docs
- Vercel Postgres : https://vercel.com/docs/storage/vercel-postgres
- Prisma Vercel : https://www.prisma.io/docs/guides/deployment/deploy-to-vercel
