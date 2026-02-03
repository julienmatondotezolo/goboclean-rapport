# ⚡ Quick Start - RoofReport PWA

Guide rapide pour lancer l'application en 5 minutes.

## 🎯 Prérequis

- Node.js 18+ installé
- Yarn installé (`npm install -g yarn`)
- Compte Supabase (gratuit)

---

## 🚀 Étape 1 : Supabase (2 min)

### 1.1 Créer un projet

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet (choisissez la région Europe)
3. Attendez 2 minutes que le projet soit créé

### 1.2 Appliquer les migrations

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `supabase/migrations/001_initial_schema.sql`
3. Cliquez sur **Run**
4. Répétez avec `supabase/migrations/002_storage_policies.sql`

### 1.3 Créer un utilisateur de test

Dans **SQL Editor**, exécutez:

```sql
-- Créer un ouvrier de test
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
  'ouvrier@test.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  '{"first_name": "Jean", "last_name": "Dupont", "role": "worker"}'::jsonb,
  NOW(),
  NOW()
);
```

### 1.4 Récupérer les clés

Dans **Settings > API**, notez:
- Project URL
- anon public key
- service_role key

---

## 💻 Étape 2 : Frontend (1 min)

```bash
# 1. Installer les dépendances
cd goboclean-rapport
yarn install

# 2. Créer .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=VOTRE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 3. Lancer le serveur
yarn dev
```

✅ Frontend disponible sur **http://localhost:3000**

---

## 🔧 Étape 3 : Backend (1 min)

```bash
# 1. Installer les dépendances
cd ../goboclean-rapport-backend
npm install

# 2. Créer .env
cat > .env << EOF
SUPABASE_URL=VOTRE_PROJECT_URL
SUPABASE_SERVICE_ROLE_KEY=VOTRE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=VOTRE_ANON_KEY

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_user_mailtrap
SMTP_PASSWORD=votre_password_mailtrap
SMTP_FROM=test@goboclean.be

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# 3. Lancer le serveur
npm run start:dev
```

> **Note**: Pour les emails, créez un compte gratuit sur [mailtrap.io](https://mailtrap.io) pour les tests.

✅ Backend disponible sur **http://localhost:3001**

---

## 🎉 Étape 4 : Test (1 min)

### 4.1 Connexion

1. Ouvrez **http://localhost:3000**
2. Connectez-vous avec:
   - Email: `ouvrier@test.com`
   - Password: `password`

### 4.2 Créer un rapport

1. Cliquez sur "Nouveau Rapport"
2. Remplissez les 5 étapes:
   - Infos client
   - État toiture
   - Photos (2 min avant + 2 min après)
   - Commentaires (optionnel)
   - Signatures (les 2)
3. Cliquez sur "Finaliser le rapport"

### 4.3 Vérifier le PDF

1. Le backend va générer le PDF (~5 secondes)
2. Vérifiez dans Mailtrap que l'email est bien reçu avec le PDF
3. Le PDF est aussi stocké dans Supabase Storage (bucket `pdfs`)

---

## 📱 Test Mobile (PWA)

### Sur iOS/iPad

1. Ouvrez Safari
2. Allez sur `http://localhost:3000`
3. Appuyez sur le bouton "Partager"
4. Choisissez "Sur l'écran d'accueil"
5. L'app est maintenant installée !

### Sur Android

1. Ouvrez Chrome
2. Allez sur `http://localhost:3000`
3. Un bandeau "Installer l'application" apparaît
4. Cliquez sur "Installer"

---

## 🧪 Test Hors-Ligne

1. Créez un nouveau rapport
2. **Coupez votre WiFi/4G**
3. Continuez à remplir le formulaire
4. Ajoutez des photos (elles sont stockées localement)
5. Finalisez (le rapport est marqué "En attente")
6. **Rallumez la connexion**
7. Le rapport se synchronise automatiquement 🎉

---

## 🐛 Problèmes Courants

### Port déjà utilisé

```bash
# Frontend
kill -9 $(lsof -ti:3000)
yarn dev

# Backend
kill -9 $(lsof -ti:3001)
npm run start:dev
```

### Erreur "Missing Supabase configuration"

Vérifiez que vos fichiers `.env` sont bien créés et contiennent les bonnes clés.

### Photos ne s'affichent pas

Vérifiez les Storage policies dans Supabase. Les buckets doivent être créés par la migration.

### Emails non reçus

Utilisez Mailtrap.io en dev pour capturer les emails. En production, utilisez Resend ou SendGrid.

---

## 📚 Documentation Complète

- [README.md](./README.md) - Installation détaillée
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement
- [SPECIFICATIONS.md](./SPECIFICATIONS.md) - Specs techniques complètes

---

## 🎯 Étapes Suivantes

1. ✅ Testez toutes les fonctionnalités
2. 📱 Testez sur votre iPad/téléphone
3. 🚀 Déployez en production (voir [DEPLOYMENT.md](./DEPLOYMENT.md))
4. 🎨 Personnalisez le logo et les couleurs
5. 📧 Configurez un vrai service d'emails

---

## 🆘 Besoin d'aide ?

- Documentation: Consultez les fichiers README
- Support: contact@goboclean.be

Bon développement ! 🚀
