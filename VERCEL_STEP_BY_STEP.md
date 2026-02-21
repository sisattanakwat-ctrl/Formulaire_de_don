# 🚀 Guide de Déploiement sur Vercel - Étape par Étape

## ⚠️ IMPORTANT : Avant de déployer

1. **CRÉER LA BASE DE DONNÉES** sur Vercel
2. **METTRE À JOUR PRISMA** pour PostgreSQL
3. **TESTER LE BUILD** localement

---

## ÉTAPE 1 : Créer la Base de Données Vercel

### 1.1 Connectez-vous sur Vercel
- Allez sur : https://vercel.com
- Connectez-vous avec votre compte

### 1.2 Créez la base PostgreSQL
1. Cliquez sur **"Storage"** (en haut)
2. Cliquez sur **"Create Database"**
3. Sélectionnez **"Postgres"**
4. Sélectionnez la région **Europe (Frankfurt)**
5. Cliquez sur **"Create"**

### 1.3 Copiez DATABASE_URL
1. Une fois créée, cliquez sur votre base de données
2. Cliquez sur l'onglet **".env"**
3. Copiez la valeur complète de `DATABASE_URL`

**Exemple :**
```
postgresql://postgres.xxxxxxxxxx:[PASSWORD]@ep-xxxxxxxxx.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

---

## ÉTAPE 2 : Mettre à jour Prisma Schema

### 2.1 Ouvrez le fichier
```
prisma/schema.prisma
```

### 2.2 Modifiez la datasource
```prisma
datasource db {
  provider = "postgresql"  // ← CHANGER ICI de "sqlite" à "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.3 Sauvegardez le fichier

---

## ÉTAPE 3 : Générer Client Prisma

```bash
# Dans votre terminal
cd /home/z/my-project
bun run db:generate
```

---

## ÉTAPE 4 : Pousser sur GitHub

### 4.1 Créez un repository GitHub
1. Allez sur : https://github.com/new
2. Nom : `watsisattanak-pagode` (ou autre nom)
3. Initialisez avec README
4. Cliquez sur **"Create repository"**

### 4.2 Pousser le code
```bash
# Dans /home/z/my-project

# Initialiser git
git init

# Créer .gitignore si nécessaire
cat > .gitignore << 'EOF'
node_modules
.next
*.db
*.sqlite
.env
.env.local
EOF

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Deploy to Vercel"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/watsisattanak-pagode.git

# Pousser
git push -u origin main
```

---

## ÉTAPE 5 : Importer sur Vercel

### 5.1 Créez le projet Vercel
1. Allez sur : https://vercel.com/new
2. Cliquez sur **"Import Git Repository"**
3. Sélectionnez votre repository `watsisattanak-pagode`
4. Cliquez sur **"Import"**

### 5.2 Configuration automatique
Vercel va détecter Next.js et configurer :
- Framework : Next.js ✓
- Root Directory : `./` ✓
- Build Command : `bun run build` ✓
- Output Directory : `.next` ✓

### 5.3 Cliquez sur **"Deploy"**

---

## ÉTAPE 6 : Ajouter les Variables d'Environnement

### 6.1 Accéder aux Settings
1. Dans le dashboard Vercel, cliquez sur votre projet
2. Cliquez sur **"Settings"** (en haut)
3. Dans le menu de gauche, cliquez sur **"Environment Variables"**

### 6.2 Ajouter les variables (une par une)

Pour chaque variable :
1. Cliquez sur **"Add New"**
2. Collez le nom de la variable
3. Collez la valeur
4. Cochez **Production**, **Preview**, **Development**
5. Cliquez sur **"Save"**

#### Liste des variables à ajouter :

| Variable | Valeur |
|----------|---------|
| `DATABASE_URL` | Collez depuis ÉTAPE 1.3 |
| `JWT_SECRET` | Générez avec : `openssl rand -base64 32` |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `resend` |
| `SMTP_PASSWORD` | Votre clé API Resend (voir ÉTAPE 7) |
| `SMTP_FROM` | `contact@watsisattanak.fr` |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` |
| `NODE_ENV` | `production` |

### 6.3 Comment générer JWT_SECRET

**Mac/Linux :**
```bash
openssl rand -base64 32
```

**Windows PowerShell :**
```powershell
[Convert]::ToBase64String((1..32 | % {[char]((Get-Random -Minimum 65 -Maximum 90).toString())}))
```

---

## ÉTAPE 7 : Configurer Email (Resend)

### 7.1 Créez un compte Resend
1. Allez sur : https://resend.com/signup
2. Créez un compte (gratuit)
3. Vérifiez votre email

### 7.2 Obtenez la clé API
1. Connectez-vous sur Resend
2. Cliquez sur **"API Keys"** (dans le menu)
3. Cliquez sur **"Create API Key"**
4. Donnez un nom : `Watsisattanak Pagode`
5. Cliquez sur **"Add"**
6. Copiez la clé (commence par `re_`)

### 7.3 Ajoutez SMTP_PASSWORD
- Dans Vercel, ajoutez `SMTP_PASSWORD`
- Valeur : votre clé API Resend copiée

---

## ÉTAPE 8 : Déploiement Final

### 8.1 Vercel redéploie automatiquement
Une fois toutes les variables ajoutées, Vercel va redéployer automatiquement.

### 8.2 Vérifiez le déploiement
1. Allez dans **"Deployments"** (menu de gauche)
2. Attendez que le status passe à **"Ready"**
3. Cliquez sur **"Visit"** pour voir votre site

### 8.3 Votre URL sera
```
https://votre-nom-de-projet.vercel.app
```

---

## ✅ Vérification du Déploiement

### Testez les fonctionnalités :
- [ ] Page de connexion accessible
- [ ] Page de don fonctionnelle
- [ ] Génération PDF fonctionne
- [ ] Envoi email fonctionne
- [ ] Page admin accessible

### Consultez les logs si problèmes :
1. Vercel Dashboard → **"Deployments"**
2. Cliquez sur votre déploiement
3. Cliquez sur **"View Function Logs"**
4. Recherchez les erreurs

---

## 🐛 Problèmes Courants

### Erreur : "Module not found: Can't resolve 'fs'"
**Cause :** Vercel Serverless n'a pas accès complet au filesystem

**Solution :** L'application utilise déjà l'API JavaScript (`/api/generate-receipt-js`)

### Erreur : "Database connection timeout"
**Cause :** Connection PostgreSQL inactive trop longtemps

**Solution :** Vérifiez que `DATABASE_URL` inclut `?sslmode=require`

### Erreur : "Prisma Client not generated"
**Cause :** Client Prisma pas régénéré après changement de schema

**Solution :**
```bash
bun run db:generate
```

### Erreur : "Build failed"
**Cause :** Erreur dans le code

**Solution :**
```bash
# Testez le build localement
bun run build
# Vérifiez les erreurs
bun run lint
```

---

## 📞 Aide et Support

- **Vercel Docs :** https://vercel.com/docs
- **Vercel Status :** https://www.vercel-status.com
- **Prisma Docs :** https://www.prisma.io/docs
- **Resend Docs :** https://resend.com/docs

---

## 🔄 Mises à jour futures

### Comment déployer une mise à jour :
```bash
# 1. Faites vos modifications
# 2. Committez
git add .
git commit -m "Description"

# 3. Pousser
git push

# 4. Vercel déploie automatiquement
```

---

**🎯 POINT CLÉ :** Vous devez OBLIGATOIREMENT créer la base de données PostgreSQL sur Vercel AVANT d'importer le projet !!
