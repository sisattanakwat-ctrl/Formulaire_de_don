# 📦 Pagode Wat Sisattanak - Déploiement

## 🌐 Options de Déploiement

Cette application peut être déployée de plusieurs manières. Choisissez celle qui convient à vos besoins :

| Option | Difficulté | Coût | Temps | Cas d'Usage |
|--------|-------------|-------|-------|-------------|
| **Vercel** | ⭐ Easy | Gratuit | 10-30 min | Test rapide, petit projet |
| **Serveur Personnel** | ⭐⭐⭐ Medium | 5-50€/mois | 1-2h | Production, contrôle total |
| **Docker Local** | ⭐⭐ Medium | Gratuit | 30 min | Développement local |

---

## 🚀 Option 1 : Vercel (Recommandée pour Test)

### Avantages
- ✅ Déploiement en quelques minutes
- ✅ HTTPS automatique
- ✅ Build et déploiement automatiques
- ✅ Gratuit pour projets small/medium
- ✅ Monitoring inclus

### Inconvénients
- ⚠️ Nécessite PostgreSQL (pas de SQLite)
- ⚠️ Fonctions serverless (limitations)
- ⚠️ Pas d'accès SSH direct

### Démarrage Rapide

1. Créez Vercel Postgres → Copiez `DATABASE_URL`
2. Créez un compte Resend → Obtenez clé API
3. Ajoutez les variables sur Vercel
4. Importez votre repo GitHub
5. C'est fini !

**Documentation :** `VERCEL_STEP_BY_STEP.md` ou `VERCEL_QUICKSTART.md`

---

## 🖥️ Option 2 : Serveur Personnel (Recommandée pour Production)

### Avantages
- ✅ Contrôle total du serveur
- ✅ Pas de limitations serverless
- ✅ Base de données dédiée
- ✅ Fichiers persistants
- ✅ Logs complets
- ✅ Scalabilité facile

### Inconvénients
- ⚠️ Nécessite des compétences Linux/Docker
- ⚠️ Coût mensuel (5-50€/mois)
- ⚠️ Maintenance à faire (backups, updates)

### Démarrage Rapide

```bash
# Exécutez le script automatisé
chmod +x deploy.sh
./deploy.sh
```

Le script fait tout automatiquement :
- ✅ Vérifie les prérequis
- ✅ Envoie les fichiers
- ✅ Configure l'environnement
- ✅ Démarre avec Docker Compose

**Documentation :** `DEPLOIEMENT_SERVEUR_PERSONNEL.md`

---

## 🐳 Option 3 : Docker Local (Développement)

### Avantages
- ✅ Environnement isolé
- ✅ Reproductible
- ✅ Facile à nettoyer
- ✅ Pas d'impact sur production

### Démarrage

```bash
# Construire et démarrer avec Docker
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## 📋 Comparaison des Bases de Données

| Type | Vercel | Serveur Personnel | Local |
|------|----------|------------------|--------|
| SQLite | ❌ Non | ❌ Non | ✅ Oui (dev only) |
| PostgreSQL | ✅ Oui | ✅ Oui | ✅ Optionnel |
| MySQL | ⚠️ Possible | ✅ Oui | ✅ Oui |
| MongoDB | ❌ Non | ⚠️ Possible | ✅ Oui |

---

## 🔧 Configuration Requise

### Variables d'Environnement Communes

| Variable | Description | Exemple |
|----------|-------------|----------|
| `DATABASE_URL` | Chaîne de connexion DB | Voir guides |
| `JWT_SECRET` | Secret JWT sécurisé | `openssl rand -base64 32` |
| `SMTP_HOST` | Serveur SMTP | `smtp.resend.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | `resend` |
| `SMTP_PASSWORD` | Mot de passe/Clef API | Clé API Resend |
| `SMTP_FROM` | Email expéditeur | `contact@watsisattanak.fr` |
| `NEXT_PUBLIC_APP_URL` | URL publique | URL de votre app |
| `NODE_ENV` | Environnement | `production` |

---

## 🎯 Recommandation

### Pour Test/Preview
→ **Vercel** (rapide, gratuit, facile)
- Parfait pour montrer à d'autres personnes
- Idéal pour développement itératif
- Pas de maintenance serveur

### Pour Production
→ **Serveur Personnel** (robuste, contrôlable, scalable)
- VPS de 2-4GB RAM suffisant
- Base de données PostgreSQL performante
- Sauvegardes automatiques
- Monitoring complet

### Pour Développement Local
→ **Docker Local** (isolé, reproductible)
- Environnement de test sécurisé
- Pas de risque de casser la production
- Facile à partager avec l'équipe

---

## 📞 Outils de Déploiement

### Scripts Inclus

| Script | Description | Emplacement |
|--------|-------------|------------|
| `deploy.sh` | Déploiement automatisé serveur | `/` |
| `Dockerfile` | Conteneur Docker | `/` |
| `docker-compose.yml` | Services Docker | `/` |

### Documentation

| Document | Contenu | Emplacement |
|----------|----------|------------|
| `DEPLOIEMENT_RAPIDE.md` | Guide rapide serveur | `/` |
| `DEPLOIEMENT_SERVEUR_PERSONNEL.md` | Guide complet serveur | `/` |
| `VERCEL_QUICKSTART.md` | Guide rapide Vercel | `/` |
| `VERCEL_STEP_BY_STEP.md` | Guide détaillé Vercel | `/` |
| `DEPLOY_VERCEL_GUIDE.md` | Guide déploiement Vercel | `/` |

---

## ✅ Check-list Pré-déploiement

### Base de données
- [ ] Choix de la base de données fait (PostgreSQL recommandé)
- [ ] Vercel Postgres créée (si Vercel)
- [ ] Plan de base de données serveur prêt (si serveur)

### Email
- [ ] Compte Resend créé
- [ ] Clé API obtenue
- [ ] Domaine email vérifié

### Code
- [ ] Code prêt à déployer
- [ ] Git repository créé
- [ ] Branche principale configurée

### Authentification
- [ ] `JWT_SECRET` généré sécurisé
- [ ] Admin utilisateur prêt à créer

### Documentation
- [ ] Guide de déploiement consulté
- [ ] Script de déploiement prêt

---

## 🎯 Pour Commencer

### Si vous voulez Vercel (Test/Preview)
```
→ Lisez VERCEL_QUICKSTART.md
→ Suivez les 6 étapes simples
→ Déploiement en ~15 minutes
```

### Si vous voulez Serveur Personnel (Production)
```
→ Lisez DEPLOIEMENT_RAPIDE.md
→ Exécutez: ./deploy.sh
→ Suivez les instructions du script
→ Déploiement en ~30-60 minutes
```

### Si vous voulez Docker Local (Dév)
```
→ Exécutez: docker-compose up -d
→ Application accessible: http://localhost:3000
→ Déploiement en ~10 minutes
```

---

## 📊 Comparatif de Coûts

### Vercel (Plan Hobby - Gratuit)
- ✅ 100GB Bandwidth/mois
- ✅ 6GB RAM builds
- ✅ Déploiements illimités
- ✅ Custom domaines
- ❌ Pas d'accès root

### VPS (Ex: OVH, Hetzner, DigitalOcean) - ~10€/mois
- ✅ 2 vCPU
- ✅ 4GB RAM
- ✅ 80GB SSD
- ✅ 4TB Bandwidth
- ✅ Accès root complet

### Hébergement Premium - ~50€/mois
- ✅ 4-8 vCPU
- ✅ 16GB RAM
- ✅ 320GB NVMe SSD
- ✅ Support prioritaire
- ✅ Sauvegardes automatiques

---

## 🆚 Support

Si vous rencontrez des problèmes :

### Vercel
- Dashboard: https://vercel.com/dashboard
- Status: https://www.vercel-status.com
- Docs: https://vercel.com/docs

### Serveur Personnel
- Vérifiez les logs: `docker-compose logs -f`
- Consultez: `DEPLOIEMENT_SERVEUR_PERSONNEL.md`
- Testez la connexion DB

### Général
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Docker Docs: https://docs.docker.com

---

## 📝 Notes Importantes

### ⚠️ SQLite vs PostgreSQL
- **SQLite** = Développement local uniquement
- **PostgreSQL** = Production (Vercel et Serveur)
- Le code supporte les deux via Prisma

### 🔑 Sécurité
- Générez toujours des secrets forts (`openssl rand -base64 32`)
- Utilisez HTTPS en production
- Ne commitez JAMAIS les secrets dans Git
- Activez le pare-feu sur les serveurs

### 🔄 Mises à jour
- Testez les mises à jour en Vercel preview d'abord
- Sauvegardez la base de données avant mise à jour majeure
- Lisez les logs en cas de problème

---

**Choisissez votre option de déploiement et suivez le guide correspondant !** 🚀
