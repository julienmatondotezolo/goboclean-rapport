# 🚀 Guide de Déploiement - RoofReport PWA

Guide complet pour déployer l'application RoofReport en production.

## 📋 Table des Matières

1. [Configuration Supabase](#1-configuration-supabase)
2. [Déploiement Frontend (Vercel)](#2-déploiement-frontend-vercel)
3. [Déploiement Backend (Railway)](#3-déploiement-backend-railway)
4. [Configuration Email](#4-configuration-email)
5. [Test de Production](#5-test-de-production)

---

## 1. Configuration Supabase

### Étape 1.1 : Créer un Projet

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez un nom : `goboclean-rapport`
4. Choisissez une région (Europe: `eu-west-1`)
5. Définissez un mot de passe fort pour la base de données
6. Attendez que le projet soit créé (~2 minutes)

### Étape 1.2 : Appliquer les Migrations

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez le contenu de `supabase/migrations/001_initial_schema.sql`
4. Exécutez la query
5. Répétez pour `supabase/migrations/002_storage_policies.sql`

### Étape 1.3 : Récupérer les Clés

Dans **Project Settings > API**:

- `SUPABASE_URL` : Project URL
- `SUPABASE_ANON_KEY` : anon public key
- `SUPABASE_SERVICE_ROLE_KEY` : service_role key (⚠️ À garder secret!)

### Étape 1.4 : Créer un Utilisateur Admin

Dans le **SQL Editor**:

```sql
-- Créer un admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@goboclean.be',
  crypt('VotreMotDePasse123!', gen_salt('bf')),
  NOW(),
  '{"first_name": "Admin", "last_name": "GoBo", "role": "admin"}'::jsonb,
  NOW(),
  NOW()
);
```

### Étape 1.5 : Vérifier les Storage Buckets

Dans **Storage**, vérifiez que ces buckets existent:
- `roof-photos`
- `signatures`
- `pdfs`
- `company-assets`

---

## 2. Déploiement Frontend (Vercel)

### Étape 2.1 : Préparer le Projet

```bash
cd goboclean-rapport
yarn install
yarn build  # Vérifier qu'il n'y a pas d'erreurs
```

### Étape 2.2 : Déployer sur Vercel

1. Installez Vercel CLI:
```bash
npm i -g vercel
```

2. Connectez-vous:
```bash
vercel login
```

3. Déployez:
```bash
vercel --prod
```

4. Suivez les instructions interactives

### Étape 2.3 : Configuration des Variables d'Environnement

Dans le dashboard Vercel (**Settings > Environment Variables**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_BACKEND_URL=https://votre-backend.railway.app
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

### Étape 2.4 : Redéployer

```bash
vercel --prod
```

---

## 3. Déploiement Backend (Railway)

### Étape 3.1 : Préparer le Projet

```bash
cd goboclean-rapport-backend
npm install
npm run build  # Vérifier qu'il n'y a pas d'erreurs
```

### Étape 3.2 : Créer un Compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un compte (gratuit pour commencer)
3. Cliquez sur "New Project" > "Deploy from GitHub repo"

### Étape 3.3 : Connecter le Repository

1. Autorisez Railway à accéder à votre GitHub
2. Sélectionnez le repository `goboclean-rapport-backend`
3. Railway va détecter automatiquement Node.js

### Étape 3.4 : Configuration des Variables d'Environnement

Dans le dashboard Railway (**Variables**):

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (SERVICE ROLE, pas ANON!)
SUPABASE_ANON_KEY=eyJhbGc...

SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxx
SMTP_FROM=noreply@goboclean.be

PORT=3001
NODE_ENV=production
FRONTEND_URL=https://votre-app.vercel.app
```

### Étape 3.5 : Configurer le Build

Dans **Settings**:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Root Directory**: `/`

### Étape 3.6 : Déployer

Railway va déployer automatiquement. Attendez que le statut soit ✅ **Active**.

Récupérez l'URL publique dans **Settings > Domains**.

---

## 4. Configuration Email

### Option A : Resend (Recommandé)

1. Créez un compte sur [resend.com](https://resend.com)
2. Ajoutez votre domaine et vérifiez-le (DNS)
3. Créez une API Key
4. Utilisez ces paramètres:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxx
SMTP_FROM=noreply@votredomaine.com
```

### Option B : SendGrid

1. Créez un compte sur [sendgrid.com](https://sendgrid.com)
2. Créez une API Key
3. Vérifiez votre domaine
4. Utilisez ces paramètres:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxx
SMTP_FROM=noreply@votredomaine.com
```

### Option C : Gmail (Développement uniquement)

⚠️ **Déconseillé en production**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
```

---

## 5. Test de Production

### Test 5.1 : Vérifier le Frontend

1. Visitez votre URL Vercel
2. Testez la connexion avec vos identifiants admin
3. Vérifiez que le PWA s'installe correctement sur mobile

### Test 5.2 : Vérifier le Backend

1. Visitez `https://votre-backend.railway.app/api`
2. Swagger doit s'afficher
3. Testez les endpoints

### Test 5.3 : Test Complet End-to-End

1. Connectez-vous en tant qu'ouvrier
2. Créez un nouveau rapport
3. Remplissez toutes les étapes
4. Ajoutez des photos
5. Signez (ouvrier + client)
6. Finalisez le rapport
7. Vérifiez que vous recevez l'email avec le PDF

---

## 🔧 Dépannage

### Frontend ne se connecte pas au Backend

- Vérifiez `NEXT_PUBLIC_BACKEND_URL` dans Vercel
- Vérifiez les CORS dans le backend
- Ouvrez la console du navigateur pour voir les erreurs

### Emails non reçus

- Vérifiez les credentials SMTP
- Vérifiez que le domaine est vérifié
- Regardez les logs Railway pour les erreurs
- Testez avec un service email de test (Mailtrap)

### PDF ne se génère pas

- Vérifiez les logs Railway
- Vérifiez les permissions Storage dans Supabase
- Vérifiez que les photos sont accessibles publiquement

### RLS Errors dans Supabase

- Vérifiez que les policies RLS sont bien appliquées
- Vérifiez les rôles des utilisateurs dans la table `users`
- Utilisez le service_role key dans le backend, pas l'anon key

---

## 📊 Monitoring

### Logs Frontend (Vercel)

```bash
vercel logs --follow
```

### Logs Backend (Railway)

Dans le dashboard Railway > **Deployments** > Cliquez sur le déploiement actif

### Logs Supabase

Dans le dashboard Supabase > **Logs** > Sélectionnez le service

---

## 💰 Coûts Estimés

| Service | Plan Gratuit | Limites |
|---------|--------------|---------|
| **Vercel** | ✅ Oui | 100 GB bandwidth/mois |
| **Railway** | ✅ 5$ offerts/mois | Puis $0.000231/GB-hour |
| **Supabase** | ✅ Oui | 500 MB DB, 1 GB Storage |
| **Resend** | ✅ Oui | 100 emails/jour |

**Total pour démarrer**: **0€** 🎉

---

## 🎯 Checklist Finale

- [ ] Supabase: Migrations appliquées
- [ ] Supabase: Admin créé
- [ ] Supabase: Storage buckets créés
- [ ] Frontend: Déployé sur Vercel
- [ ] Frontend: Variables d'environnement configurées
- [ ] Backend: Déployé sur Railway
- [ ] Backend: Variables d'environnement configurées
- [ ] Email: Service configuré et vérifié
- [ ] Test: Rapport créé avec succès
- [ ] Test: PDF généré et reçu par email
- [ ] PWA: Installable sur mobile

---

## 🆘 Support

En cas de problème:

1. Vérifiez les logs (Vercel + Railway + Supabase)
2. Consultez la documentation
3. Contactez: contact@goboclean.be

Bon déploiement! 🚀
