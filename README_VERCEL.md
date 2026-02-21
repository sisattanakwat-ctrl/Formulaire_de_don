# 🚀 Version Vercel - Pagode Wat Sisattanak

Cette version est configurée pour le déploiement sur Vercel avec toutes les optimisations nécessaires.

## ⚡ Quick Start

```bash
# Installation
bun install

# Déploiement Vercel
vercel
```

## 📦 Principales Différences

### Base de Données
- **SQLite (local/dev)** → **PostgreSQL** (Vercel)
- Utilisez Vercel Postgres ou Neon
- Migration automatique via Prisma

### Génération PDF
- **Python (local)** → **JavaScript jsPDF** (Vercel)
- API route `/api/generate-receipt-js` pour Vercel
- Compatible serverless Vercel

### Email
- SMTP standard configuré
- Compatible avec Resend, SendGrid, Mailgun

## 🔧 Configuration

### Variables d'Environnement (Vercel)

```bash
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentification
JWT_SECRET=votre_secret_32_caracteres_minimum

# Email (Resend exemple)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxxxx
SMTP_FROM=contact@watsisattanak.fr

# Application
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NODE_ENV=production
```

## 🔄 Migration de la Base de Données

### De SQLite à PostgreSQL

```bash
# 1. Exporter depuis SQLite
bunx prisma db pull

# 2. Modifier DATABASE_URL pour PostgreSQL
# Dans .env ou variables Vercel

# 3. Générer et appliquer la migration
bunx prisma migrate dev --name migrate_to_postgres

# 4. Pousser les données
# Optionnel: Utiliser prisma db seed
```

## 📄 Génération PDF

### Local (Python)
```typescript
// Utilise /api/generate-receipt
// Scripts Python dans /scripts/generate_donation_pdf.py
```

### Vercel (JavaScript)
```typescript
// Utilise /api/generate-receipt-js
// jsPDF + jsPDF-AutoTable
```

### Pour basculer, modifiez dans src/app/page.tsx :
```typescript
const generateReceiptPDF = async () => {
  const response = await fetch('/api/generate-receipt-js', { // ← changer ici
    method: 'POST',
    // ...
  });
};
```

## 🌐 Déploiement

### Via Vercel CLI
```bash
# Installer
bun add -g vercel

# Login
vercel login

# Déployer
vercel --prod
```

### Via GitHub
1. Pushez sur GitHub
2. Importez le repository sur Vercel
3. Configurez les variables d'environnement
4. Déployez automatiquement à chaque push

## 📊 Fonctionnalités

- ✅ Système d'authentification JWT
- ✅ Gestion des utilisateurs (admin)
- ✅ Formulaire de dons multilingue
- ✅ Génération PDF automatique
- ✅ Envoi de reçus par email
- ✅ Export Excel des dons
- ✅ Statistiques en temps réel

## 🐛 Résolution de Problèmes

### Erreur Database Connection
```typescript
// Vérifiez DATABASE_URL
// Assurez-vous que PostgreSQL est accessible
```

### Erreur PDF Generation
```typescript
// Vérifiez l'API utilisée
// Local: /api/generate-receipt
// Vercel: /api/generate-receipt-js
```

### Erreur Email SMTP
```bash
# Vérifiez les identifiants SMTP
# Testez avec curl ou autre outil
```

## 📞 Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Prisma Vercel](https://www.prisma.io/docs/guides/deployment/deploy-to-vercel)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [Next.js Vercel](https://nextjs.org/docs/deployment/vercel)

## 📝 Notes de Développement

```bash
# Local development
bun run dev

# Type checking
bun run lint

# Database push (dev)
bun run db:push

# Database migration (prod)
bun run db:migrate
```

---

**Développé avec ❤️ pour Pagode Wat Sisattanak**
