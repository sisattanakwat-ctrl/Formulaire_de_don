# 🚀 Déploiement sur Serveur Personnel

Ce guide explique comment déployer l'application sur votre propre serveur (VPS, dedie, etc.)

---

## 📋 Prérequis

### Serveur
- Ubuntu 20.04+ ou Debian 11+ (Linux)
- 2GB RAM minimum (4GB recommandé)
- 20GB espace disque
- Accès SSH

### Comptes Externes
- [ ] GitHub (pour héberger le code optionnellement)
- [ ] Resend ou autre provider SMTP (pour les emails)

---

## 🔧 Étape 1 : Préparer le Serveur

### 1.1 Installer Docker et Docker Compose

```bash
# Connectez-vous à votre serveur via SSH
ssh user@your-server-ip

# Mettre à jour les paquets
sudo apt-get update && sudo apt-get upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

### 1.2 Créer l'utilisateur d'application

```bash
# Créer un utilisateur dédié
sudo adduser --disabled-password --gecos "" appuser

# Ajouter aux groupes sudo et docker
sudo usermod -aG sudo,docker appuser
```

### 1.3 Créer la structure de répertoires

```bash
# Se connecter en tant qu'appuser
su - appuser

# Créer le répertoire de l'application
cd /home/appuser
mkdir -p watsisattanak
cd watsisattanak

# Créer sous-dossiers
mkdir -p data uploads logs backups
```

---

## 📦 Étape 2 : Configurer les Variables d'Environnement

### 2.1 Créer le fichier .env

```bash
cd /home/appuser/watsisattanak
cp .env.example.server .env
nano .env
```

### 2.2 Modifier les valeurs

```env
# Database Configuration
POSTGRES_USER=watsisattanak_db
POSTGRES_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_SECURE_32_CARS_MINIMUM
POSTGRES_DB=watsisattanak
DATABASE_URL=postgresql://watsisattanak_db:CHANGEZ_CE_MOT_DE_PASSE_SECURE@postgres:5432/watsisattanak

# Authentication
JWT_SECRET=CHANGEZ_AVEC_openssl_rand_base64_32

# Email Configuration
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your_resend_api_key_here
SMTP_FROM=contact@watsisattanak.fr

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://watsisattanak.votre-domaine.com
PORT=3000
```

### 2.3 Générer JWT_SECRET sécurisé

```bash
# Sur le serveur
openssl rand -base64 32

# Copier le résultat et coller dans .env comme JWT_SECRET
```

### 2.4 Créer un compte Resend

1. Allez sur https://resend.com/signup
2. Créez un compte (gratuit)
3. Vérifiez votre email
4. Dans le dashboard, créez une API Key
5. Copiez la clé (commence par `re_`)
6. Ajoutez-la comme `SMTP_PASSWORD` dans .env

---

## 📤 Étape 3 : Envoyer le Code sur le Serveur

### Option A : Via Git (Recommandée)

#### 3.A.1 Sur votre machine locale

```bash
# Se placer dans le répertoire du projet
cd /home/z/my-project

# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit - Deploy to personal server"

# Pousser sur GitHub (optionnel)
git branch -M main
git remote add origin https://github.com/votre-username/watsisattanak.git
git push -u origin main
```

#### 3.A.2 Sur le serveur

```bash
cd /home/appuser/watsisattanak

# Cloner depuis GitHub
git clone https://github.com/votre-username/watsisattanak.git .

# OU cloner en mode minime (sans historique)
git clone --depth 1 --branch main https://github.com/votre-username/watsisattanak.git .
```

### Option B : Via SCP/SFTP

```bash
# Sur votre machine locale
scp -r /home/z/my-project/* user@your-server-ip:/home/appuser/watsisattanak/

# Ou utiliser un client SFTP comme FileZilla
```

---

## 🐳 Étape 4 : Lancer avec Docker Compose

### 4.1 Démarrer l'application

```bash
# En tant qu'appuser
cd /home/appuser/watsisattanak

# Lancer Docker Compose
docker-compose up -d

# Vérifier que les conteneurs tournent
docker-compose ps
```

### 4.2 Voir les logs

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs de l'application seulement
docker-compose logs -f app

# Voir les logs de PostgreSQL seulement
docker-compose logs -f postgres
```

### 4.3 Arrêter et redémarrer

```bash
# Arrêter
docker-compose down

# Redémarrer
docker-compose up -d
```

---

## 🌐 Étape 5 : Configurer le Reverse Proxy (Nginx)

### 5.1 Installer Nginx

```bash
# En tant que root ou avec sudo
sudo apt-get install nginx -y
```

### 5.2 Configurer Nginx

Créez le fichier de configuration :

```bash
sudo nano /etc/nginx/sites-available/watsisattanak
```

Contenu à ajouter :

```nginx
upstream watsisattanak_app {
    server localhost:3000;
}

server {
    listen 80;
    server_name watsisattanak.votre-domaine.com;

    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name watsisattanak.votre-domaine.com;

    # Configuration SSL
    ssl_certificate /etc/letsencrypt/live/watsisattanak.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/watsisattanak.votre-domaine.com/privkey.pem;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://watsisattanak_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Headers additionnels
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/watsisattanak /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 5.4 Obtenir un Certificat SSL Gratuit (Let's Encrypt)

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtenir le certificat
sudo certbot --nginx -d watsisattanak.votre-domaine.com

# Le renouvellement est automatique
sudo certbot renew --dry-run
```

---

## 🔒 Étape 6 : Sécuriser l'Application

### 6.1 Configurer le Pare-feu (UFW)

```bash
# Installer UFW
sudo apt-get install ufw -y

# Configurer les règles par défaut
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH
sudo ufw allow ssh

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le pare-feu
sudo ufw enable

# Voir le status
sudo ufw status
```

### 6.2 Variables d'Environnement Sécurisées

Assurez-vous que dans `.env` :

- [ ] `JWT_SECRET` est une chaîne longue et aléatoire (32+ caractères)
- [ ] `POSTGRES_PASSWORD` est fort (majuscules, minuscules, chiffres, symboles)
- [ ] `SMTP_PASSWORD` est une clé API sécurisée
- [ ] `NEXT_PUBLIC_APP_URL` utilise HTTPS

### 6.3 Restreindre l'accès SSH

```bash
# Modifier /etc/ssh/sshd_config
sudo nano /etc/ssh/sshd_config

# Ajouter ou modifier :
PermitRootLogin no
PasswordAuthentication no

# Redémarrer SSH
sudo systemctl restart sshd
```

---

## 🔄 Étape 7 : Gestion du Service

### 7.1 Redémarrage automatique (Optionnel)

Créez un fichier `restart.sh` :

```bash
#!/bin/bash
cd /home/appuser/watsisattanak
docker-compose down
docker-compose up -d
docker image prune -f
```

Rendez-le exécutable :

```bash
chmod +x restart.sh
```

### 7.2 Surveillance avec PM2 (Optionnel)

```bash
# Sur le serveur
sudo npm install -g pm2

# Créer le fichier ecosystem
cd /home/appuser/watsisattanak
nano ecosystem.config.js
```

Contenu :

```javascript
module.exports = {
  apps: [{
    name: 'watsisattanak',
    script: 'docker-compose up',
    cwd: '/home/appuser/watsisattanak',
    interpreter: '/bin/bash',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Démarrer avec PM2 :

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 Étape 8 : Sauvegardes

### 8.1 Sauvegarde de la Base de Données

Créez un script de sauvegarde :

```bash
#!/bin/bash
# Créer le script
nano /home/appuser/watsisattanak/backup.sh
```

Contenu :

```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/appuser/watsisattanak/backups"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder PostgreSQL
docker exec watsisattanak-postgres-1 pg_dump -U watsisattanak_db watsisattanak > $BACKUP_DIR/watsisattanak_$DATE.sql

# Comprimer la sauvegarde
gzip $BACKUP_DIR/watsisattanak_$DATE.sql

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Sauvegarde terminée: $BACKUP_DIR/watsisattanak_$DATE.sql.gz"
```

Rendre exécutable :

```bash
chmod +x backup.sh
```

### 8.2 Automatiser avec Cron

```bash
# Ajouter une tâche cron (sauvegarde chaque jour à 3h du matin)
crontab -e

# Ajouter cette ligne :
0 3 * * * /home/appuser/watsisattanak/backup.sh >> /home/appuser/watsisattanak/logs/backup.log 2>&1
```

---

## 🧪 Tests et Vérifications

### Tester l'application

```bash
# Vérifier que l'application répond
curl http://localhost:3000

# Vérifier la page de login
curl https://watsisattanak.votre-domaine.com/login

# Vérifier les logs
docker-compose logs app
```

### Liste de Vérification

- [ ] Application accessible via HTTP
- [ ] Application accessible via HTTPS
- [ ] Login fonctionne
- [ ] Page de don accessible
- [ ] Page admin accessible
- [ ] Génération PDF fonctionne
- [ ] Envoi email fonctionne
- [ ] Base de données sauvegardée automatiquement

---

## 🐛 Résolution de Problèmes

### Erreur: "Database connection failed"

**Cause :** PostgreSQL pas démarré ou mauvaise configuration

**Solution :**
```bash
# Vérifier les logs PostgreSQL
docker-compose logs postgres

# Vérifier que les variables .env sont correctes
cat .env | grep DATABASE_URL

# Redémarrer le conteneur PostgreSQL
docker-compose restart postgres
```

### Erreur: "Nginx 502 Bad Gateway"

**Cause :** Application Next.js pas accessible depuis Nginx

**Solution :**
```bash
# Vérifier que l'application tourne
docker-compose ps

# Vérifier le port
docker-compose logs app | grep "ready"

# Tester localement sur le serveur
curl http://localhost:3000
```

### Erreur: "Email not sending"

**Cause :** SMTP mal configuré

**Solution :**
```bash
# Vérifier les logs
docker-compose logs app | grep -i "email\|smtp\|resend"

# Tester l'envoi d'email (optionnel)
docker exec watsisattanak-app-1 env | grep SMTP
```

### Erreur: "SSL Certificate expired"

**Cause :** Certificat Let's Encrypt expiré

**Solution :**
```bash
# Renouveler le certificat
sudo certbot renew

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 📞 Outils et Commandes Utiles

### Docker Compose

```bash
# Voir l'état des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f app

# Arrêter tout
docker-compose down

# Démarrer tout
docker-compose up -d

# Recréer les conteneurs
docker-compose up -d --force-recreate
```

### Accéder aux conteneurs

```bash
# Entrer dans le conteneur de l'application
docker exec -it watsisattanak-app-1 /bin/sh

# Entrer dans PostgreSQL
docker exec -it watsisattanak-postgres-1 psql -U watsisattanak_db -d watsisattanak

# Voir l'espace disque
df -h
```

### Surveillance

```bash
# Voir l'utilisation du CPU
top

# Voir l'utilisation de la mémoire
free -h

# Voir l'utilisation du disque
du -sh /home/appuser/watsisattanak

# Voir les processus
ps aux
```

---

## 📝 Maintenance

### Mises à jour de l'application

```bash
# 1. Sur votre machine locale
git pull

# 2. Faire les modifications
git add .
git commit -m "Update: description"

# 3. Pousser
git push

# 4. Sur le serveur
cd /home/appuser/watsisattanak
git pull

# 5. Rebuild et redémarrer
docker-compose down
docker-compose up -d --build
```

### Sauvegarde avant mise à jour

```bash
# Toujours sauvegarder avant mise à jour majeure
/home/appuser/watsisattanak/backup.sh
```

---

## 🎯 Structure du Projet sur le Serveur

```
/home/appuser/watsisattanak/
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Services Docker
├── .env                   # Variables d'environnement
├── data/                  # Données persistantes (optionnel)
├── uploads/                # Fichiers uploadés
├── logs/                  # Logs applicatifs
├── backups/               # Sauvegardes DB
├── app/                   # Code Next.js
├── prisma/                # Schema Prisma
├── public/                # Assets statiques
└── scripts/               # Scripts de maintenance
```

---

## ✅ Check-list Finale de Déploiement

Avant de mettre en production :

- [ ] Serveur préparé (Docker, Nginx, SSL)
- [ ] Base de données PostgreSQL configurée
- [ ] Variables d'environnement sécurisées (.env)
- [ ] Code déployé sur le serveur
- [ ] Application démarrée avec Docker Compose
- [ ] Nginx configuré avec reverse proxy
- [ ] Certificat SSL installé et configuré
- [ ] Pare-feu activé (UFW)
- [ ] Sauvegardes automatisées (cron)
- [ ] Monitoring configuré (optionnel)
- [ ] Login testé et fonctionnel
- [ ] Page de don testée
- [ ] Page admin testée
- [ ] Email testé
- [ ] PDF testé

---

## 📚 Documentation Additionnelle

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Nginx Documentation](https://nginx.org/en/docs)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Développé par ❤️ pour Pagode Wat Sisattanak**

*Ce document couvre le déploiement complet sur un serveur personnel avec Docker, Nginx, PostgreSQL et Let's Encrypt.*
