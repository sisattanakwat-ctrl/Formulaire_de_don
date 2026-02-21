# Initialisation de l'application

## Étape 1: Créer le premier compte administrateur

Une fois l'application démarrée, vous devez créer le premier compte administrateur.

### Méthode: Utiliser l'API d'initialisation

1. Allez sur: `/admin` (http://localhost:3000/admin)
2. Vous verrez un message d'accès refusé
3. Ouvrez la console du navigateur (F12)
4. Exécutez la commande suivante:

```javascript
fetch('/api/admin/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'contact@watsisattanak.fr',
    password: 'votre_mot_de_passe_ici',
    name: 'Admin Principal'
  })
}).then(r => r.json())
.then(data => console.log(data));
```

5. Remplacez `votre_mot_de_passe_ici` par votre mot de passe sécurisé
6. Après exécution, le compte administrateur sera créé

### Étape 2: Connexion

1. Allez sur la page de connexion: `/login`
2. Connectez-vous avec l'email et le mot de passe que vous avez définis
3. Vous serez redirigé vers la page de don

### Étape 3: Gestion des utilisateurs

1. Une fois connecté en tant qu'administrateur, cliquez sur le bouton de déconnexion
2. Connectez-vous à nouveau avec votre compte administrateur
3. Accédez à la page d'administration: `/admin`
4. Créez d'autres utilisateurs en remplissant le formulaire "Nouvel utilisateur"

### Rôles des utilisateurs

- **admin**: Peut accéder à la page d'administration et gérer tous les utilisateurs
- **user**: Peut uniquement accéder à la page de don et effectuer des dons

### Sécurité

- Les mots de passe sont hachés avec bcrypt
- Chaque utilisateur doit avoir un email unique
- Le premier utilisateur créé doit être l'administrateur

### Accès à l'application

- Page de don (/): Nécessite d'être connecté
- Page d'administration (/admin): Nécessite d'être connecté ET administrateur
- Page de connexion (/login): Toujours accessible

## Déploiement sur Vercel/Netlify

Actuellement, l'application utilise SQLite. Pour déployer sur Vercel/Netlify:

1. **Option A - Migrer vers PostgreSQL (Supabase)**:
   - Recommandée pour la production
   - Permet un meilleur scaling
   - Supporte les fonctions serverless

2. **Option B - Utiliser Vercel KV**:
   - Pour la session et le cache
   - Compatible avec SQLite

Pour migrer vers Supabase ou PostgreSQL, contactez-moi pour:
- Créer les scripts de migration
- Adapter la configuration Prisma
- Configurer les variables d'environnement
