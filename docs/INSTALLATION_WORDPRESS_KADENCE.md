# Guide d'Installation - Intégration de l'Application Next.js dans WordPress (Thème Kadence)

Ce guide explique comment intégrer l'application de formulaire de don Next.js dans un site WordPress utilisant le thème Kadence.

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Options d'intégration](#options-dintégration)
3. [Option 1 - Intégration via iFrame](#option-1---intégration-via-iframe)
4. [Option 2 - Installation sur sous-domaine](#option-2---installation-sur-sous-domaine)
5. [Option 3 - Headless WordPress](#option-3---headless-wordpress)
6. [Personnalisation avec Kadence](#personnalisation-avec-kadence)
7. [Maintenance et mises à jour](#maintenance-et-mises-à-jour)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un site WordPress actif avec le thème Kadence installé
- ✅ Un accès FTP/SFTP ou accès au gestionnaire de fichiers
- ✅ Un accès SSH au serveur (pour Node.js et Next.js)
- ✅ Node.js 18+ installé sur le serveur
- ✅ Un accès à une base de données (ou utilisez SQLite)
- ✅ Un certificat SSL (HTTPS) configuré
- ✅ Les droits administrateur sur WordPress

---

## Options d'intégration

Il existe trois approches principales pour intégrer cette application Next.js dans WordPress :

| Option | Complexité | Performance | Utilisation recommandée |
|--------|------------|--------------|------------------------|
| **1. iFrame** | ⭐ Simple | ⚠️ Moyenne | Pour intégration rapide sans modifications |
| **2. Sous-domaine** | ⭐⭐ Moderée | ✅ Bonne | Pour séparer l'application du site principal |
| **3. Headless WordPress** | ⭐⭐⭐ Complexe | ✅✅ Excellente | Pour une intégration complète et professionnelle |

---

## Option 1 - Intégration via iFrame

Cette méthode est la plus simple et ne nécessite que peu de modifications.

### Étape 1 : Déployer l'application Next.js

```bash
# Sur votre serveur
cd /var/www/
mkdir donation-app
cd donation-app

# Copier votre application Next.js
# Via Git
git clone <votre-repo> .

# OU via FTP/SFTP
# Transférer tous les fichiers du projet

# Installer les dépendances
npm install
# OU
bun install

# Construire l'application
npm run build
# OU
bun run build

# Démarrer l'application en production
npm run start
# OU
bun run start
```

### Étape 2 : Configurer un reverse proxy (Nginx)

Ajoutez une configuration Nginx pour l'application :

```nginx
# /etc/nginx/sites-available/donation-app
server {
    listen 80;
    server_name dons.votre-site.com;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dons.votre-site.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/donation-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Étape 3 : Utiliser PM2 pour la gestion du processus

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application avec PM2
cd /var/www/donation-app
pm2 start npm --name "donation-app" -- start

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

### Étape 4 : Intégrer dans WordPress avec Kadence

#### Méthode A - Via un bloc HTML personnalisé

1. Connectez-vous à votre administration WordPress
2. Créez ou éditez une page
3. Utilisez l'éditeur Gutenberg/Block Editor
4. Ajoutez un bloc "HTML Personnalisé"
5. Insérez le code suivant :

```html
<div style="width: 100%; height: 800px; border: none; border-radius: 8px; overflow: hidden;">
    <iframe
        src="https://dons.votre-site.com"
        width="100%"
        height="100%"
        frameborder="0"
        style="border: none;"
        allow="payment"
    >
    </iframe>
</div>
```

6. Personnalisez la hauteur (`height: 800px`) selon vos besoins
7. Publiez ou mettez à jour la page

#### Méthode B - Via un shortcode personnalisé

Créez un plugin WordPress personnalisé :

```php
<?php
/**
 * Plugin Name: Formulaire de Don Next.js
 * Description: Intègre le formulaire de don Next.js via iFrame
 * Version: 1.0
 * Author: Votre Nom
 */

function donation_form_iframe_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '800',
        'url' => 'https://dons.votre-site.com',
    ), $atts);

    return '<div style="width: 100%; height: ' . esc_attr($atts['height']) . 'px; border: none; border-radius: 8px; overflow: hidden;">
        <iframe
            src="' . esc_url($atts['url']) . '"
            width="100%"
            height="100%"
            frameborder="0"
            style="border: none;"
            allow="payment"
        >
        </iframe>
    </div>';
}
add_shortcode('donation_form', 'donation_form_iframe_shortcode');
```

Utilisez ensuite le shortcode dans n'importe quelle page :

```
[donation_form height="900"]
```

---

## Option 2 - Installation sur sous-domaine

Cette méthode permet d'avoir une application Next.js séparée mais intégrée visuellement.

### Étape 1 : Créer un sous-domaine

1. Connectez-vous à votre fournisseur de domaine
2. Créez un sous-domaine (ex: `dons.votre-site.com`)
3. Pointez-le vers l'adresse IP de votre serveur

### Étape 2 : Installer l'application

Suivez les étapes 1-3 de l'Option 1 pour déployer l'application.

### Étape 3 : Intégrer avec Kadence en utilisant un lien personnalisé

#### Créer un menu personnalisé

1. **WordPress → Apparence → Menus**
2. Créez un nouveau menu "Donations"
3. Ajoutez un "Lien personnalisé" :
   - URL : `https://dons.votre-site.com`
   - Texte du lien : "Faire un don"
4. Sauvegardez le menu

#### Configurer Kadence pour ouvrir dans un iframe optionnel

Si vous voulez que l'application s'ouvre dans le même design Kadence :

1. **WordPress → Kadence → Header Builder**
2. Ajoutez un bouton dans l'en-tête
3. Configurez le bouton pour ouvrir l'application

```javascript
// Ajoutez ce code dans functions.php de votre thème enfant
add_action('wp_footer', function() {
    ?>
    <script>
    jQuery(document).ready(function($) {
        $('.donation-button').on('click', function(e) {
            e.preventDefault();

            // Créer et afficher une modal
            var modal = $('<div class="donation-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:none;align-items:center;justify-content:center;">');
            var iframe = $('<iframe src="https://dons.votre-site.com" style="width:95%;height:90%;border:none;border-radius:8px;">');

            modal.append(iframe);
            $('body').append(modal);
            modal.fadeIn();

            modal.on('click', function(e) {
                if(e.target === modal[0]) {
                    modal.fadeOut(function() {
                        $(this).remove();
                    });
                }
            });
        });
    });
    </script>
    <?php
});
```

---

## Option 3 - Headless WordPress

Cette approche avancée utilise WordPress comme backend CMS et Next.js comme frontend.

### Architecture

```
WordPress (Backend)     Next.js (Frontend)
       ↓                      ↓
   API REST           Application React
   /wp-json            Formulaire de don
                       Intégration Kadence styles
```

### Étape 1 : Configurer WordPress comme API

```php
// Dans functions.php
add_action('rest_api_init', function() {
    // Activer CORS pour l'API WordPress
    add_action('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
});
```

### Étape 2 : Modifier l'application Next.js

Installer les dépendances WordPress :

```bash
npm install wpapi
# OU
npm install @wordpress/api-fetch
```

Créer un service WordPress dans Next.js :

```typescript
// lib/wordpress.ts
import WPAPI from 'wpapi';

const wp = new WPAPI({
    endpoint: 'https://votre-site.com/wp-json'
});

export const getDonationsPage = async () => {
    try {
        const page = await wp.pages().slug('donations');
        return page[0];
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
};

export const submitDonation = async (donationData: any) => {
    // Envoyer à votre propre API ou WordPress
    const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
    });
    return response.json();
};
```

### Étape 3 : Intégrer le design Kadence dans Next.js

Extraire les styles Kadence :

```bash
# Sur votre installation WordPress
wp theme path kadence
# Copiez le fichier style.css et les ressources
```

Intégrer dans Next.js :

```typescript
// src/app/layout.tsx
import './globals.css';
import './kadence-styles.css'; // Importez les styles Kadence

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://votre-site.com/wp-content/themes/kadence/assets/css/all.min.css" />
      </head>
      <body className="kadence-theme">
        {children}
      </body>
    </html>
  );
}
```

---

## Personnalisation avec Kadence

### Adapter les couleurs

Pour que l'application Next.js corresponde au design Kadence :

1. **Récupérer les couleurs Kadence**

```php
// Dans WordPress, ajoutez ce snippet pour exporter les couleurs
add_action('wp_head', function() {
    $primary_color = get_theme_mod('kadence_theme_accent_color', '#3b82f6');
    echo '<script>window.KADENCE_COLORS = {primary: "' . $primary_color . '"};</script>';
});
```

2. **Utiliser ces couleurs dans Next.js**

```typescript
// src/app/page.tsx
const KADENCE_COLORS = {
    primary: process.env.NEXT_PUBLIC_KADENCE_PRIMARY_COLOR || '#f59e0b'
};

// Utiliser dans les composants
className="bg-amber-600" → style={{backgroundColor: KADENCE_COLORS.primary}}
```

### Créer une page de modèle Kadence

1. **WordPress → Kadence → Templates**
2. Créez un nouveau template "Page de dons"
3. Ajoutez un bloc conteneur avec l'iFrame ou le lien
4. Personnalisez le design selon votre marque

---

## Sécurité

### 1. Protéger l'API Next.js

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
        style-src 'self' 'nonce-${nonce}';
        img-src 'self' blob: data: https:;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `;

    const requestUrl = request.nextUrl.clone();
    requestUrl.headers.set('x-nonce', nonce);
    requestUrl.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());

    return NextResponse.rewrite(requestUrl);
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
```

### 2. Authentification WordPress

```php
// Dans functions.php
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) {
        return $result;
    }

    if (!is_user_logged_in()) {
        return new WP_Error(
            'rest_not_logged_in',
            'Vous devez être connecté pour accéder à cette ressource.',
            array('status' => 401)
        );
    }

    return $result;
});
```

---

## Maintenance et mises à jour

### 1. Automatiser les déploiements

Créez un script de déploiement :

```bash
#!/bin/bash
# deploy.sh

echo "Déploiement de l'application de dons..."

# Arrêter PM2
pm2 stop donation-app

# Mise à jour
git pull origin main
npm install
npm run build

# Redémarrer PM2
pm2 restart donation-app

echo "Déploiement terminé !"
```

Rendez-le exécutable :

```bash
chmod +x deploy.sh
```

### 2. Surveiller les logs

```bash
# Voir les logs en temps réel
pm2 logs donation-app

# Voir les logs des 24 dernières heures
pm2 logs donation-app --lines 1000 --nostream
```

### 3. Sauvegardes automatiques

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/donation-app"
DB_PATH="/home/z/my-project/db/prisma"

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder le code
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /var/www/donation-app

# Sauvegarder la base de données
cp -r $DB_PATH $BACKUP_DIR/db_$DATE

echo "Sauvegarde terminée : $DATE"
```

Ajoutez à crontab :

```bash
crontab -e

# Sauvegarder tous les jours à 2h du matin
0 2 * * * /backups/backup.sh
```

---

## Dépannage

### Problème : L'iFrame ne s'affiche pas

**Solution :**
- Vérifiez que l'URL est correcte et accessible
- Vérifiez les paramètres CORS et CSP
- Essayez en mode incognito

### Problème : Les styles Kadence ne s'appliquent pas

**Solution :**
- Videz le cache de WordPress
- Regénérez les assets CSS de Kadence
- Vérifiez que les CSS sont bien importés dans Next.js

### Problème : L'application Next.js ne démarre pas

**Solution :**
```bash
# Vérifier les logs PM2
pm2 logs donation-app

# Redémarrer
pm2 restart donation-app

# Si échec, réinstaller
cd /var/www/donation-app
rm -rf node_modules .next
npm install
npm run build
pm2 restart donation-app
```

### Problème : Certificat SSL

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d dons.votre-site.com

# Renouveler automatiquement (déjà configuré par Certbot)
sudo certbot renew --dry-run
```

---

## Contact et support

Pour toute question ou problème avec cette installation :

- 📧 Email : support@votre-site.com
- 📚 Documentation : /docs
- 🐛 Issues : GitHub Issues

---

**Note :** Ce guide suppose que vous avez des connaissances de base en administration de serveur Linux, en développement web et en WordPress. Si vous n'êtes pas à l'aise avec ces technologies, envisagez de faire appel à un développeur professionnel pour l'installation.
