#!/bin/bash

# Script de Déploiement Automatique - Pagode Wat Sisattanak
# Ce script déploie l'application sur votre propre serveur

set -e  # Arrêter sur erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Déploiement Pagode Wat Sisattanak${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Vérifier les prérequis
check_prerequisites() {
    echo -e "${YELLOW}Vérification des prérequis...${NC}"
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker n'est pas installé${NC}"
        echo "Installez Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker installé${NC}"
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}✗ Docker Compose n'est pas installé${NC}"
        echo "Installez Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker Compose installé${NC}"
    
    echo ""
}

# Demander les informations du serveur
get_server_info() {
    echo -e "${YELLOW}Informations du Serveur Requises${NC}"
    echo "================================"
    
    read -p "Adresse IP du serveur: " SERVER_IP
    read -p "Nom d'utilisateur SSH: " SSH_USER
    read -p "Port SSH (par défaut 22): " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}
    
    # Vérifier la connexion
    echo -e "${YELLOW}Test de la connexion SSH...${NC}"
    if ssh -o ConnectTimeout=10 -p $SSH_PORT ${SSH_USER}@${SERVER_IP} "echo 'OK'" 2>&1 | grep -q "OK"; then
        echo -e "${GREEN}✓ Connexion SSH réussie${NC}"
    else
        echo -e "${RED}✗ Impossible de se connecter au serveur${NC}"
        echo "Vérifiez l'adresse IP, l'utilisateur et que le port SSH est ouvert"
        exit 1
    fi
    echo ""
}

# Préparer l'environnement sur le serveur
prepare_server() {
    echo -e "${YELLOW}Préparation de l'environnement du serveur...${NC}"
    
    # Créer l'utilisateur si nécessaire
    ssh -p $SSH_PORT ${SSH_USER}@${SERVER_IP} << 'ENDSSH'
        if ! id appuser &> /dev/null; then
            echo "Création de l'utilisateur appuser..."
            sudo adduser --disabled-password --gecos "" appuser
            sudo usermod -aG sudo,docker appuser
        fi
        exit
ENDSSH
    
    echo -e "${GREEN}✓ Utilisateur appuser configuré${NC}"
    
    # Créer la structure de répertoires
    ssh -p $SSH_PORT ${SSH_USER}@${SERVER_IP} << 'ENDSSH'
        cd /home/appuser
        mkdir -p watsisattanak/{data,uploads,logs,backups}
        exit
ENDSSH
    
    echo -e "${GREEN}✓ Structure de répertoires créée${NC}"
    echo ""
}

# Envoyer les fichiers
deploy_files() {
    echo -e "${YELLOW}Envoi des fichiers sur le serveur...${NC}"
    
    # Méthode: rsync (recommandée) ou scp
    if command -v rsync &> /dev/null; then
        echo "Utilisation de rsync..."
        rsync -avz --progress \
            --exclude node_modules \
            --exclude .next \
            --exclude .git \
            --exclude "*.db \
            --exclude .env \
            -e "ssh -p $SSH_PORT" \
            /home/z/my-project/ \
            ${SSH_USER}@${SERVER_IP}:/home/appuser/watsisattanak/
    else
        echo "Utilisation de scp..."
        scp -r \
            -P $SSH_PORT \
            --exclude="node_modules" \
            --exclude=".next" \
            --exclude="*.db" \
            --exclude=".env" \
            /home/z/my-project/* \
            ${SSH_USER}@${SERVER_IP}:/home/appuser/watsisattanak/
    fi
    
    echo -e "${GREEN}✓ Fichiers envoyés${NC}"
    echo ""
}

# Configurer les variables d'environnement
setup_environment() {
    echo -e "${YELLOW}Configuration des variables d'environnement${NC}"
    echo "================================"
    echo "Vous devez configurer les variables suivantes :"
    echo ""
    echo "1. Mot de passe PostgreSQL (générez un mot de passe fort)"
    echo "2. JWT_SECRET (sera généré automatiquement)"
    echo "3. Clé API Resend (créez un compte sur https://resend.com)"
    echo ""
    
    read -p "Mot de passe PostgreSQL: " POSTGRES_PASSWORD
    read -p "Clé API Resend: " SMTP_API_KEY
    
    # Générer JWT_SECRET
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Demander le domaine
    read -p "Votre domaine (ex: watsisattanak.com): " DOMAIN
    DOMAIN=${DOMAIN:-watsisattanak.com}
    
    # Créer le fichier .env sur le serveur
    ssh -p $SSH_PORT ${SSH_USER}@${SERVER_IP} << 'ENDSSH'
        cd /home/appuser/watsisattanak
        
        cat > .env << ENVEOF
# Database Configuration
POSTGRES_USER=watsisattanak_db
POSTGRES_PASSWORD='$POSTGRES_PASSWORD'
POSTGRES_DB=watsisattanak
DATABASE_URL=postgresql://watsisattanak_db:$POSTGRES_PASSWORD@postgres:5432/watsisattanak

# Authentication
JWT_SECRET='$JWT_SECRET'

# Email Configuration
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD='$SMTP_API_KEY'
SMTP_FROM=contact@watsisattanak.fr

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$DOMAIN
PORT=3000
ENVEOF
        
        chmod 600 .env
        exit
ENDSSH
    
    echo -e "${GREEN}✓ Variables configurées${NC}"
    echo -e "${YELLOW}JWT_SECRET généré: $JWT_SECRET${NC}"
    echo ""
}

# Démarrer l'application
start_application() {
    echo -e "${YELLOW}Démarrage de l'application...${NC}"
    
    ssh -p $SSH_PORT ${SSH_USER}@${SERVER_IP} << 'ENDSSH'
        cd /home/appuser/watsisattanak
        
        # Démarrer avec Docker Compose
        docker-compose up -d
        
        # Attendre quelques secondes
        sleep 10
        
        # Vérifier le statut
        docker-compose ps
        
        exit
ENDSSH
    
    echo -e "${GREEN}✓ Application démarrée${NC}"
    echo ""
}

# Afficher les informations de connexion
show_connection_info() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Déploiement Terminé !${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Application accessible à :"
    echo -e "  HTTP:  http://${DOMAIN}${NC}"
    echo -e "  HTTPS: https://${DOMAIN}${NC}"
    echo ""
    echo "Pour accéder à l'application, configurez votre DNS :"
    echo "  Type A: ${DOMAIN} → votre IP serveur"
    echo ""
    echo "Commandes utiles :"
    echo "  Voir les logs: ssh ${SSH_USER}@${SERVER_IP} -p ${SSH_PORT} 'cd /home/appuser/watsisattanak && docker-compose logs -f'"
    echo "  Arrêter: ssh ${SSH_USER}@${SERVER_IP} -p ${SSH_PORT} 'cd /home/appuser/watsisattanak && docker-compose down'"
    echo "  Redémarrer: ssh ${SSH_USER}@${SERVER_IP} -p ${SSH_PORT} 'cd /home/appuser/watsisattanak && docker-compose restart'"
    echo ""
    echo "Pour configurer Nginx et SSL, suivez: DEPLOIEMENT_SERVEUR_PERSONNEL.md"
    echo ""
}

# Exécution principale
main() {
    check_prerequisites
    get_server_info
    prepare_server
    deploy_files
    setup_environment
    start_application
    show_connection_info
}

# Lancer
main "$@"
