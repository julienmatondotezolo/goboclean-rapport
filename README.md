# RoofReport PWA - GoBo Clean

Application mobile progressive (PWA) pour la documentation du nettoyage de toiture.

## 🚀 Fonctionnalités

- ✅ **Formulaire multi-étapes** avec validation
- ✅ **Capture et compression d'images** (max 1200px, optimisé pour mobile)
- ✅ **Module de signature** (ouvrier + client)
- ✅ **Mode hors-ligne** avec IndexedDB et synchronisation automatique
- ✅ **Géolocalisation** pour les adresses clients
- ✅ **PWA installable** sur l'écran d'accueil
- ✅ **Dashboard admin** avec statistiques
- ✅ **Génération PDF** et envoi par email
- ✅ **Authentification** avec Row Level Security (RLS)
- ✅ **Internationalisation** (FR, EN, NL)

## 📋 Prérequis

- Node.js 18+
- Yarn
- Compte Supabase
- Compte SMTP (Resend/SendGrid)

## 🛠️ Installation

### Frontend (Next.js PWA)

```bash
cd goboclean-rapport
yarn install
```

Créez un fichier `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (NestJS)

```bash
cd goboclean-rapport-backend
npm install
```

Créez un fichier `.env`:

```env
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your-api-key
SMTP_FROM=noreply@goboclean.be

PORT=3001
```

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

### 2. Appliquer les migrations

```bash
# Copiez le contenu de supabase/migrations/001_initial_schema.sql
# et exécutez-le dans l'éditeur SQL de Supabase

# Puis exécutez supabase/migrations/002_storage_policies.sql
```

### 3. Créer un utilisateur admin

```sql
-- Dans l'éditeur SQL de Supabase
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@goboclean.be',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"first_name": "Admin", "last_name": "GoBo", "role": "admin"}'::jsonb
);
```

## 🚀 Lancement

### Développement

```bash
# Frontend
cd goboclean-rapport
yarn dev

# Backend
cd goboclean-rapport-backend
npm run start:dev
```

### Production

```bash
# Frontend
cd goboclean-rapport
yarn build
yarn start

# Backend
cd goboclean-rapport-backend
npm run build
npm run start:prod
```

## 📱 Installation PWA

1. Ouvrez l'application dans Chrome/Safari sur mobile
2. Cliquez sur "Ajouter à l'écran d'accueil"
3. L'icône apparaît sur votre écran d'accueil

## 🏗️ Architecture

### Frontend
- **Next.js 16** avec App Router
- **Tailwind CSS** + **Shadcn UI**
- **React Hook Form** + **Zod** pour la validation
- **Dexie.js** pour IndexedDB
- **Supabase Client** pour l'authentification et le stockage

### Backend
- **NestJS** pour l'API REST
- **@react-pdf/renderer** pour la génération de PDF
- **Nodemailer** pour l'envoi d'emails
- **Supabase Admin SDK** pour les opérations serveur

### Base de données
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** pour la sécurité
- **Storage Buckets** pour les photos et PDFs

## 📦 Structure du projet

```
goboclean-rapport/
├── src/
│   ├── app/                    # Pages Next.js
│   │   └── [locale]/
│   │       ├── (pages)/        # Pages publiques
│   │       │   ├── login/
│   │       │   ├── reports/
│   │       │   └── admin/
│   ├── components/             # Composants React
│   │   ├── ui/                 # Composants Shadcn
│   │   ├── report-form/        # Formulaire de rapport
│   │   ├── photo-uploader.tsx
│   │   ├── signature-pad.tsx
│   │   └── sync-status.tsx
│   ├── lib/                    # Utilitaires
│   │   ├── supabase/
│   │   ├── db/                 # IndexedDB
│   │   ├── auth.ts
│   │   ├── image-compression.ts
│   │   └── geolocation.ts
│   └── types/                  # Types TypeScript
├── supabase/
│   └── migrations/             # Migrations SQL
└── public/
    ├── manifest.json
    └── icons/

goboclean-rapport-backend/
├── src/
│   ├── reports/                # Module de rapports
│   ├── pdf/                    # Génération PDF
│   ├── email/                  # Service email
│   └── supabase/               # Client Supabase
└── dist/
```

## 🔒 Sécurité

- **RLS (Row Level Security)** : Les ouvriers ne voient que leurs propres rapports
- **JWT Authentication** via Supabase
- **Storage Policies** : Contrôle d'accès aux fichiers
- **Service Role** : Le backend utilise une clé service pour les opérations privilégiées

## 📊 Workflow

1. **Ouvrier** se connecte sur iPad
2. **Crée un rapport** en 5 étapes
3. **Prend des photos** (compressées automatiquement)
4. **Collecte les signatures** (ouvrier + client)
5. **Finalise** le rapport
6. **Backend** génère le PDF
7. **Email** envoyé automatiquement au client

## 🧪 Tests

```bash
# Frontend
cd goboclean-rapport
yarn test

# Backend
cd goboclean-rapport-backend
npm run test
```

## 📝 Licence

MIT - GoBo Clean © 2026

## 👥 Support

Pour toute question : contact@goboclean.be
