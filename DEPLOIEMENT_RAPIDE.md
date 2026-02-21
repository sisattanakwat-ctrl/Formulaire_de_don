# 🚀 Déploiement Rapide sur Serveur Personnel

## ⚡ Déploiement en 1 Commande

Utilisez le script automatisé :

```bash
chmod +x deploy.sh
./deploy.sh
```

Le script vous guidera à travers :
1. ✅ Vérification des prérequis (Docker, Docker Compose)
2. ✅ Configuration de la connexion SSH
3. ✅ Préparation de l'environnement serveur
4. ✅ Envoi des fichiers (rsync)
5. ✅ Configuration automatique des variables
6. ✅ Démarrage avec Docker Compose

---

## 📋 Ce dont vous avez besoin

### 1. Serveur
- Adresse IP
- Accès SSH (port 22 par défaut)
- Utilisateur sudo
- 2GB RAM minimum (4GB recommandé)
- 20GB+ disque

### 2. Domaine
- Un nom de domaine (ex: watsisattanak.com)
- Accès DNS pour configurer l'enregistrement

### 3. Comptes Externes
- [ ] Compte Resend (pour emails) → https://resend.com/signup

---

## 🐳 Structure Après Déploiement

```
/home/appuser/watsisattanak/
├── Dockerfile              # Conteneur Node.js
├── docker-compose.yml      # PostgreSQL + Application
├── .env                   # Variables de prod
├── data/                  # Données persistantes
├── uploads/                # Fichiers uploadés
├── logs/                  # Logs applicatifs
├── backups/               # Sauvegardes DB
└── app/                   # Code Next.js
```

---

## 🌐 Accès à l'Application

Après déploiement, l'application sera accessible :

- HTTP : `http://watsisattanak.votre-domaine.com`
- HTTPS : `https://watsisattanak.votre-domaine.com`

**Note :** Pour HTTPS, vous devez configurer Nginx et SSL (voir guide complet)

---

## 🔧 Configuration DNS

Dans votre registrar de domaine (ex: Gandi, OVH, Namecheap) :

| Type | Host | Value |
|------|-------|-------|
| A | @ | IP de votre serveur |
| A | www | IP de votre serveur |

---

## 📞 Commandes Utiles

### Sur le serveur

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer l'application
docker-compose restart app

# Arrêter tout
docker-compose down

# Démarrer tout
docker-compose up -d

# Mise à jour des fichiers
git pull
docker-compose up -d --build
```

### Depuis votre machine

```bash
# SSH sur le serveur
ssh user@your-server-ip

# Voir l'espace disque
ssh user@your-server-ip "df -h"

# Voir l'utilisation mémoire
ssh user@your-server-ip "free -h"
```

---

## 🎯 Prochaines Étapes

Après le déploiement initial :

1. **Configurer Nginx** - Reverse proxy et SSL
   - Suivez `DEPLOIEMENT_SERVEUR_PERSONNEL.md`
   
2. **Configurer SSL** - Certificat Let's Encrypt gratuit
   - Commande: `sudo certbot --nginx -d votre-domaine.com`
   
3. **Configurer Sauvegardes** - Automatiser avec cron
   - Le script `backup.sh` est déjà prêt
   
4. **Configurer Pare-feu** - Sécuriser avec UFW
   - Commande: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`

---

## ✅ Check-list

Avant déploiement :
- [ ] Serveur accessible via SSH
- [ ] Docker installé sur le serveur
- [ ] Domaine configuré
- [ ] Compte Resend créé
- [ ] Mot de passe PostgreSQL préparé

Après déploiement :
- [ ] Application accessible via IP
- [ ] Base de données PostgreSQL fonctionnelle
- [ ] Login fonctionne
- [ ] Page de don accessible
- [ ] Email fonctionne

---

## 📚 Documentation

Pour des détails complets, lisez :
- `DEPLOIEMENT_SERVEUR_PERSONNEL.md` - Guide complet étape par étape
- `DEPLOY_VERCEL_GUIDE.md` - Guide pour Vercel (optionnel)
- `VERCEL_STEP_BY_STEP.md` - Guide rapide Vercel

---

## 🆘 Support

En cas de problème :

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez la documentation complète
3. Vérifiez que Docker Compose tourne : `docker-compose ps`
4. Testez la connexion DB sur le serveur

---

**Prêt à déployer !** 🚀

Executez simplement : `./deploy.sh`
