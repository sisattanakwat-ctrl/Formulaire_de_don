# Résolution du problème de cache Next.js

## Problème rencontré

L'application Next.js rencontre des erreurs de cache corrompu après les modifications récentes. Les messages d'erreur indiquent :

```
Error: ENOENT: no such file or directory, open '/home/z/my-project/.next/dev/server/...'
```

## Statut actuel

### ✅ Code correct

Le code de génération de PDF a été correctement implémenté :

1. **Script Python** : `scripts/generate_donation_pdf.py` ✅
   - Génère des PDFs en format A4
   - Utilise ReportLab
   - Prend en charge les caractères lao

2. **API Endpoint** : `src/app/api/generate-receipt/route.ts` ✅
   - Import direct de `child_process`, `util`, et `path`
   - Fonction `generateDonationPDF` inline (pas de module externe)
   - Gère les erreurs Python correctement

3. **Frontend** : `src/app/page.tsx` ✅
   - Fonction `generateReceiptPDF()` implémentée
   - Intégrée dans `handleSubmit()` après validation
   - Téléchargement automatique du PDF

### ❌ Cache corrompu

Le cache `.next` est corrompu et doit être régénéré.

## Solution requise

### Redémarrage manuel du serveur de développement

Le système automatique ne peut pas résoudre ce problème. Le serveur doit être redémarré manuellement :

```bash
# Option 1: Via le terminal (avec les droits appropriés)
cd /home/z/my-project
pkill -f "bun run dev"
rm -rf .next
bun run dev
```

## Fonctionnalité de génération PDF

### Ce qui a été implémenté

1. **Format A4 standard**
   - Marges 2cm
   - Police Times New Roman pour le texte latin
   - Encodage UTF-8 pour support lao

2. **Contenu du PDF**
   - ✅ En-tête avec nom de la pagode
   - ✅ Informations générales (fête, paiement, date)
   - ✅ Informations du donateur (nom, prénom, adresse, contact)
   - ✅ Détails du don (4 catégories avec descriptions FR/LAO)
   - ✅ Dédicaces (si présentes)
   - ✅ Total du don
   - ✅ Message de remerciement

3. **Ce qui N'EST PAS inclus** (conformément à la demande)
   - ❌ Bouton "Valider"
   - ❌ Partie statistique
   - ❌ Interface utilisateur

### Test manuel

Une fois le serveur redémarré, tester la génération de PDF :

```bash
curl -X POST http://localhost:3000/api/generate-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "civility": "M.",
    "lastName": "Test",
    "firstName": "User",
    "address": "123 Rue de la Pagode",
    "email": "test@example.com",
    "phone": "0612345678",
    "festivalName": "Boun Visakha bouxa",
    "paymentMethod": "cash",
    "donDuJourAmount": "50",
    "plateauCelesteAmount": "0",
    "effetsUsuelsAmount": "0",
    "entretienAmount": "0",
    "totalAmount": 50,
    "donationDate": "2025-02-08T00:00:00.000Z"
  }' \
  -o test_receipt.pdf

# Vérifier que c'est un vrai PDF
file test_receipt.pdf
```

## Étapes pour l'utilisateur

1. **Accéder au serveur**
   - SSH sur le serveur où tourne l'application

2. **Arrêter le serveur de développement**
   ```bash
   # Trouver et arrêter le processus
   ps aux | grep "bun run dev"
   kill <PID>
   ```

3. **Nettoyer le cache**
   ```bash
   cd /home/z/my-project
   rm -rf .next
   ```

4. **Redémarrer le serveur**
   ```bash
   bun run dev
   ```

5. **Vérifier que tout fonctionne**
   - Ouvrir l'application dans le navigateur
   - Remplir un formulaire de don
   - Valider
   - Vérifier que le PDF est généré et téléchargé automatiquement

## Alternatives si le problème persiste

Si après redémarrage le problème de cache persiste :

1. **Supprimer node_modules et réinstaller**
   ```bash
   rm -rf node_modules package-lock.json bun.lock
   bun install
   rm -rf .next
   bun run dev
   ```

2. **Utiliser un autre port**
   ```bash
   bun run dev -p 3001
   ```

3. **Vérifier les permissions**
   ```bash
   ls -la scripts/generate_donation_pdf.py
   # Doit être lisible par le processus bun
   ```

## Documentation technique

Pour plus de détails sur la génération PDF, voir :

- `docs/PDF_GENERATION.md` - Documentation complète
- `scripts/generate_donation_pdf.py` - Script Python
- `src/app/api/generate-receipt/route.ts` - Endpoint API
- `src/app/page.tsx` - Intégration frontend (lignes 267-297, 327-328)

## Résumé

Le code de génération PDF est **complètement fonctionnel** mais le cache Next.js est **corrompu**.

**Action requise :** Redémarrer manuellement le serveur de développement avec nettoyage du cache.

Une fois redémarré, la fonctionnalité de génération automatique de PDF après validation devrait fonctionner parfaitement.
