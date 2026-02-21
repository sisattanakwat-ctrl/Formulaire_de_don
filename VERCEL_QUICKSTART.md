# ⚡ Vercel - Guide Rapide

## 🚀 Déploiement en 5 Étapes

### 1️⃣ Créer Base de Données Vercel
- Dashboard Vercel → Storage → Create Database → Postgres
- Copier le `DATABASE_URL`

### 2️⃣ Créer Compte Email
- Recommandé: [Resend](https://resend.com) (gratuit)
- Obtenir clé API et configurer SMTP

### 3️⃣ Pousser sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

### 4️⃣ Importer sur Vercel
- https://vercel.com/new
- Sélectionner votre repo GitHub
- Ajouter variables d'environnement

### 5️⃣ Ajouter Variables Vercel

Dans Settings → Environment Variables :

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=générez_avec_openssl_rand_base64_32
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=votre_clé_api_resend
SMTP_FROM=contact@watsisattanak.fr
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NODE_ENV=production
```

---

## 📝 Modifications Nécessaires pour Vercel

### 1. Changer SQLite → PostgreSQL

Dans `prisma/schema.prisma` :
```prisma
datasource db {
  provider = "postgresql"  # ← De "sqlite"
  url = env("DATABASE_URL")
}
```

### 2. Générer Client Prisma
```bash
bun run db:generate
bun run db:push
```

### 3. Utiliser API PDF JavaScript

Dans `src/app/page.tsx`, modifiez l'URL de l'API :
```typescript
const generateReceiptPDF = async () => {
  const response = await fetch('/api/generate-receipt-js', {  // ← Ajouter -js
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, totalAmount: currentTotal })
  });
  // ...
};
```

---

## 🔍 Checklist Avant Déploiement

- [ ] Base de données PostgreSQL créée
- [ ] Variables d'environnement configurées
- [ ] `DATABASE_URL` ajoutée dans Vercel
- [ ] `JWT_SECRET` sécurisé et ajouté
- [ ] SMTP configuré avec provider valide
- [ ] Schema Prisma mis à jour (postgresql)
- [ ] Client Prisma régénéré
- [ ] GitHub repository créé
- [ ] Code poussé sur GitHub
- [ ] Test PDF avec API JavaScript

---

## 📦 Commandes Utiles

```bash
# Vercel CLI
bun add -g vercel
vercel login
vercel --prod          # Déploiement production
vercel                   # Déploiement preview

# Base de données
bun run db:generate      # Générer client Prisma
bun run db:push         # Pousser schéma PostgreSQL
bun run db:migrate       # Créer migration

# Développement
bun run dev
bun run build
bun run lint
```

---

## 🆚 Résolution de Problèmes Rapide

| Problème | Solution |
|-----------|----------|
| Database connection failed | Vérifiez `DATABASE_URL` et qu'elle inclut `sslmode=require` |
| PDF generation error | Utilisez `/api/generate-receipt-js` au lieu de `/api/generate-receipt` |
| Email not sending | Vérifiez identifiants SMTP et clé API |
| Auth not working | Vérifiez que `JWT_SECRET` est identique en local et prod |

---

## 📞 Liens Utiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Resend Email](https://resend.com)
- [Next.js Vercel Deploy](https://nextjs.org/docs/deployment/vercel)

---

**✅ Prêt pour Vercel !** Suivez les étapes ci-dessus.
