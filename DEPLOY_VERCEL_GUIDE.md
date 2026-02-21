# 🚀 Guide de Déploiement Complet - Vercel

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Configuration Base de Données](#configuration-base-de-données)
3. [Configuration Email](#configuration-email)
4. [Variables d'Environnement](#variables-d'environnement)
5. [Déploiement](#déploiement)
6. [Post-Déploiement](#post-déploiement)

---

## Prérequis

### Comptes Requis
- [x] Compte Vercel (gratuit): https://vercel.com/signup
- [x] Compte GitHub: https://github.com/signup
- [x] Compte email provider (Resend recommandé): https://resend.com

### Outils Locaux
```bash
# Installer Vercel CLI
bun add -g vercel

# Vérifier l'installation
vercel --version
```

---

## Configuration Base de Données

### Étape 1: Créer Vercel Postgres

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **"Storage"** → **"Create Database"**
4. Sélectionnez **"Postgres"**
5. Choisissez la région (ex: Europe - Frankfurt)
6. Cliquez sur **"Create"**

### Étape 2: Récupérer l'URL de connexion

Dans la page de la base de données Vercel :
- Copiez le **`DATABASE_URL`** depuis l'onglet ".env"

Cela ressemble à :
```
postgresql://postgres.xxxxxxxxxx:[PASSWORD]@ep-xxxxxxxxx.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

### Étape 3: Mettre à jour Prisma Schema

Ouvrez `prisma/schema.prisma` et modifiez :

```prisma
datasource db {
  provider = "postgresql"  // ← Changer de "sqlite" à "postgresql"
  url = env("DATABASE_URL")
}
```

### Étape 4: Générer Client Prisma

```bash
bun run db:generate
```

### Étape 5: Créer Migration

```bash
# Créer migration pour PostgreSQL
bunx prisma migrate dev --name init_postgres

# Ou pour production
bunx prisma migrate deploy
```

---

## Configuration Email

### Option 1: Resend (Recommandé pour Vercel)

1. Créez un compte sur https://resend.com
2. Dans le dashboard, cliquez sur **"API Keys"**
3. Créez une nouvelle clé API
4. Vérifiez votre domaine d'envoi

Variables Vercel :
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxxxx  # Votre clé API Resend
SMTP_FROM=contact@watsisattanak.fr
```

### Option 2: SendGrid

Variables Vercel :
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxx
SMTP_FROM=contact@watsisattanak.fr
```

### Option 3: Mailgun

Variables Vercel :
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.votredomaine.com
SMTP_PASSWORD=xxxxxxxxxxxxxxxx
SMTP_FROM=contact@watsisattanak.fr
```

---

## Variables d'Environnement

### Toutes les Variables Requises

Dans votre dashboard Vercel → **Settings** → **Environment Variables** :

| Variable | Description | Exemple |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection | Copiée depuis Vercel Postgres |
| `JWT_SECRET` | Secret JWT | Générez avec: `openssl rand -base64 32` |
| `SMTP_HOST` | Serveur SMTP | smtp.resend.com |
| `SMTP_PORT` | Port SMTP | 587 |
| `SMTP_USER` | Utilisateur SMTP | resend |
| `SMTP_PASSWORD` | Mot de passe SMTP | Votre clé API |
| `SMTP_FROM` | Email expéditeur | contact@watsisattanak.fr |
| `NEXT_PUBLIC_APP_URL` | URL publique | https://votre-app.vercel.app |
| `NODE_ENV` | Environnement | production |

### Générer JWT_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | % {[char]((Get-Random -Minimum 65 -Maximum 90).toString())}))
```

---

## Déploiement

### Méthode 1: Via GitHub (Recommandée)

#### 1. Initialiser Git Localement

```bash
cd /home/z/my-project

# Initialiser repo
git init

# Ajouter .gitignore si pas déjà fait
cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Next.js
.next/
out/
build

# Database
*.db
*.db-journal
*.sqlite
*.sqlite-journal

# Environment
.env
.env*.local
.env.production

# Logs
*.log
dev.log
server.log
EOF

# Ajouter fichiers
git add .

# Premier commit
git commit -m "Initial commit - Pagode Wat Sisattanak"
```

#### 2. Créer Repository GitHub

1. Allez sur https://github.com/new
2. Nom du repo: `watsisattanak-pagode`
3. Initialisez avec README
4. Cliquez sur **"Create repository"**

#### 3. Pousser sur GitHub

```bash
# Si vous avez créé un repo vide
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/watsisattanak-pagode.git
git push -u origin main
```

#### 4. Connecter sur Vercel

1. Allez sur https://vercel.com/new
2. Cliquez sur **"Import Git Repository"**
3. Vercel va lister vos repos GitHub
4. Sélectionnez `watsisattanak-pagode`
5. Cliquez sur **"Import"**

#### 5. Configuration Automatique

Vercel va détecter Next.js et configurer :
- **Framework Preset**: Next.js
- **Root Directory**: `./` (laisser vide)
- **Build Command**: `bun run build`
- **Output Directory**: `.next`

#### 6. Ajouter Variables d'Environnement

1. Après l'import, cliquez sur votre projet Vercel
2. Allez dans **Settings** → **Environment Variables**
3. Ajoutez toutes les variables listées ci-dessus
4. Cliquez sur **"Save"** pour chaque variable

#### 7. Redéploiement

Une fois les variables ajoutées, Vercel redéploiera automatiquement.

### Méthode 2: Via Vercel CLI

```bash
# 1. Login Vercel
bun run vercel:login

# 2. Déployer en production
bun run vercel:deploy

# Ou déployer en preview
bun run vercel:preview
```

---

## Post-Déploiement

### Vérifier le Déploiement

1. Allez sur votre dashboard Vercel
2. Vérifiez que le status est **"Ready"**
3. Cliquez sur **"Visit"** pour voir le site

### Tester les Fonctionnalités

- [ ] Page de connexion fonctionne
- [ ] Authentification JWT fonctionne
- [ ] Page de don accessible
- [ ] Génération PDF fonctionne
- [ ] Envoi email fonctionne
- [ ] Export Excel fonctionne
- [ ] Page admin accessible

### Logs et Débogage

Pour voir les logs en production :

1. Vercel Dashboard → Votre projet
2. Cliquez sur **"Logs"**
3. Filtrez par type (build, server, function)
4. Recherchez des erreurs

---

## 🐛 Résolution de Problèmes

### Erreur: "Module not found: Can't resolve 'fs'"

**Cause**: Vercel Serverless Functions n'ont pas accès complet au filesystem.

**Solution**:
- Utiliser uniquement l'API `/api/generate-receipt-js` (JavaScript)
- Ne pas utiliser l'API Python

### Erreur: "Connection timeout"

**Cause**: Vercel Postgres a un délai d'inactivité de 60s.

**Solution**: Vérifiez que `DATABASE_URL` inclut `?sslmode=require`

### Erreur: "Email not sent"

**Cause**: SMTP mal configuré ou API key invalide.

**Solution**:
- Vérifiez les identifiants SMTP
- Vérifiez que l'email FROM est vérifié
- Consultez les logs du provider email

### Erreur: "Prisma Client not generated"

**Cause**: Client Prisma pas généré après migration.

**Solution**:
```bash
bun run db:generate
```

---

## 📊 Monitoring

### Analytics Vercel

1. Dashboard → **"Analytics"**
2. Voir le trafic, performance
3. Identifier les goulots d'étranglement

### Uptime Monitoring

Utilisez un service externe :
- **UptimeRobot**: https://uptimerobot.com
- **Better Uptime**: https://betteruptime.com

---

## 🔄 Mises à Jour

### Comment déployer une mise à jour

```bash
# 1. Faire vos modifications
git add .
git commit -m "Description de la mise à jour"

# 2. Pousser sur GitHub
git push origin main

# 3. Vercel redéploie automatiquement
```

### Rollback en cas de problème

1. Vercel Dashboard → **"Deployments"**
2. Sélectionnez le déploiement précédent
3. Cliquez sur **"..."** → **"Promote to Production"**

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Status**: https://www.vercel-status.com
- **Vercel Discord**: https://vercel.com/discord
- **Prisma Help**: https://www.prisma.io/docs
- **Next.js Help**: https://nextjs.org/docs

---

**✨ Bon déploiement sur Vercel !**
