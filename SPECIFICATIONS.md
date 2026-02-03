# 📋 Spécifications Techniques - RoofReport PWA

Documentation technique complète du projet RoofReport pour GoBo Clean.

## 🎯 Objectif

Remplacer les rapports papier par une application mobile (PWA) permettant de documenter le nettoyage de toiture avec un accent sur la fiabilité des données et la simplicité d'utilisation sur le terrain.

---

## 👥 Rôles et Permissions

### Rôle Ouvrier (Worker)

**Accès**:
- ✅ Ses propres rapports uniquement
- ✅ Création de nouveaux rapports
- ✅ Édition des rapports (tant que non finalisés)
- ✅ Suppression des brouillons
- ✅ Mode hors-ligne complet

**Restrictions**:
- ❌ Ne peut pas voir les rapports des autres ouvriers
- ❌ Pas d'accès au dashboard admin
- ❌ Ne peut pas modifier les rapports finalisés

### Rôle Admin

**Accès**:
- ✅ Tous les rapports de l'entreprise
- ✅ Dashboard avec statistiques
- ✅ Gestion des comptes utilisateurs
- ✅ Édition des paramètres entreprise (logo, mentions légales)
- ✅ Filtres avancés (par ouvrier, par date)

---

## 📱 Parcours Utilisateur

### 1. Authentification

**Caractéristiques**:
- Email + Mot de passe via Supabase Auth
- Session longue (pas de reconnexion quotidienne)
- Token JWT stocké de manière sécurisée
- Redirection automatique selon le rôle

**Sécurité**:
- Row Level Security (RLS) sur Supabase
- Isolation complète des données par utilisateur
- Service Role Key uniquement côté backend

### 2. Création de Rapport (5 Étapes)

#### Étape 1 : Informations Client

**Champs requis**:
- Prénom (min 2 caractères)
- Nom (min 2 caractères)
- Adresse complète (min 5 caractères)
- Téléphone (format: +32 ou 0 + 8-9 chiffres)

**Fonctionnalité**:
- Bouton "Géolocaliser" pour capturer les coordonnées GPS
- Validation en temps réel
- Stockage des coordonnées (latitude, longitude)

#### Étape 2 : État de la Toiture

**Champs requis**:
- Type de tuiles (menu déroulant):
  - Ardoise
  - Terre cuite
  - Béton
  - Métal
  - Bardeau
  - Autre
- Surface estimée (m², entre 1 et 10000)
- Niveau de mousse/lichen:
  - Faible (vert)
  - Moyen (jaune)
  - Fort (rouge)

#### Étape 3 : Photos

**Contraintes**:
- **Minimum**: 2 photos AVANT + 2 photos APRÈS
- **Maximum**: 10 photos par catégorie
- **Compression**: Automatique côté client
  - Largeur max: 1200px
  - Taille max: 1 MB par photo
  - Format: JPEG
  - Qualité: 80%

**Fonctionnalités**:
- Prise de photo directe (caméra)
- Sélection depuis la galerie
- Prévisualisation en temps réel
- Ordre modifiable (numérotation)
- Suppression individuelle

#### Étape 4 : Commentaires

**Caractéristiques**:
- Zone de texte libre
- **Optionnel**
- Suggestions affichées:
  - État général de la toiture
  - Tuiles endommagées
  - Problèmes détectés
  - Recommandations

#### Étape 5 : Signatures

**Contraintes**:
- Deux zones de signature distinctes:
  1. Signature de l'ouvrier
  2. Signature du client
- Format: PNG transparent
- Horodatage automatique (ISO 8601)
- **Les deux signatures sont obligatoires** pour finaliser

**Validation**:
- Bouton "Sauvegarder" par signature
- Indicateur visuel de sauvegarde
- Possibilité d'effacer et recommencer

---

## 🔌 Mode Hors-Ligne (Offline First)

### Architecture

**Technologies**:
- IndexedDB via Dexie.js
- Service Worker via @ducanh2912/next-pwa
- Queue de synchronisation

### Fonctionnement

1. **Création hors-ligne**:
   - Rapport stocké dans IndexedDB avec `local_id`
   - Photos stockées en tant que Blob
   - Signatures stockées en data URL
   - Flag `needs_sync: true`

2. **Détection de connexion**:
   - Listener sur `window.online`
   - Indicateur visuel en haut de l'écran

3. **Synchronisation automatique**:
   - Upload des photos vers Supabase Storage
   - Création du rapport en base de données
   - Upload des signatures
   - Mise à jour du statut

4. **Gestion des erreurs**:
   - Retry automatique (max 3 tentatives)
   - Stockage de l'erreur
   - Notification à l'utilisateur

### Indicateurs de Statut

```typescript
type SyncStatus = 
  | 'synced'      // 🟢 Synchronisé (Cloud)
  | 'pending'     // 🟡 En attente de réseau (Local)
  | 'error';      // 🔴 Erreur de synchronisation
```

---

## 📄 Génération du PDF

### Structure du Document

**Page 1**:
- En-tête avec logo entreprise
- Numéro de rapport unique
- Date d'intervention
- Informations client
- État de la toiture
- Informations technicien
- Observations techniques (si présentes)

**Page 2+**:
- Photos AVANT (grille 2 colonnes)
- Photos APRÈS (grille 2 colonnes)

**Dernière Page**:
- Zone de signatures (côte à côte)
- Dates et heures de signature
- Mention "Bon pour accord"
- Mentions légales
- Footer avec coordonnées entreprise

### Technologies

- **Génération**: @react-pdf/renderer (côté backend)
- **Stockage**: Supabase Storage (bucket `pdfs`)
- **Délai max**: 10 secondes

---

## 📧 Envoi d'Email

### Template HTML

**Contenu**:
- Header avec branding GoBo Clean
- Message personnalisé avec nom du client
- Informations de l'intervention
- Pièce jointe: PDF du rapport
- Footer avec coordonnées

**Format**:
- HTML responsive
- Compatible tous les clients email
- Poids < 100 KB (sans le PDF)

### Configuration

**Services supportés**:
1. **Resend** (recommandé)
2. **SendGrid**
3. **Tout SMTP standard**

**Délai d'envoi**: < 10 secondes après finalisation

---

## 🗄️ Base de Données (PostgreSQL/Supabase)

### Tables

#### `users`
```sql
- id: UUID (PK, ref auth.users)
- email: TEXT UNIQUE
- role: ENUM('worker', 'admin')
- first_name: TEXT
- last_name: TEXT
- phone: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `reports`
```sql
- id: UUID (PK)
- worker_id: UUID (FK users)
- status: ENUM('draft', 'pending_signature', 'completed')
- sync_status: ENUM('synced', 'pending', 'error')
- client_first_name: TEXT
- client_last_name: TEXT
- client_address: TEXT
- client_phone: TEXT
- client_latitude: DECIMAL(10,8)
- client_longitude: DECIMAL(11,8)
- roof_type: TEXT
- roof_surface: DECIMAL(10,2)
- moss_level: ENUM('low', 'medium', 'high')
- comments: TEXT
- worker_signature_url: TEXT
- worker_signature_date: TIMESTAMPTZ
- client_signature_url: TEXT
- client_signature_date: TIMESTAMPTZ
- pdf_url: TEXT
- pdf_sent_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
```

#### `photos`
```sql
- id: UUID (PK)
- report_id: UUID (FK reports)
- type: ENUM('before', 'after')
- url: TEXT
- storage_path: TEXT
- order: INTEGER
- created_at: TIMESTAMPTZ
```

#### `company_settings`
```sql
- id: UUID (PK)
- company_name: TEXT
- company_email: TEXT
- company_phone: TEXT
- company_address: TEXT
- logo_url: TEXT
- legal_mentions: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Storage Buckets

1. **roof-photos**: Photos des toitures
2. **signatures**: Signatures numériques
3. **pdfs**: Rapports PDF générés
4. **company-assets**: Logo et assets de l'entreprise

---

## 🔒 Sécurité

### Row Level Security (RLS)

**Principes**:
- Chaque utilisateur ne voit que ses propres données
- Les admins ont accès à tout via une policy spécifique
- Service Role Key pour les opérations backend

**Policies clés**:

```sql
-- Ouvriers voient leurs rapports
CREATE POLICY "Workers can view their own reports"
  ON reports FOR SELECT
  USING (worker_id = auth.uid());

-- Admins voient tout
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

### Stockage des Fichiers

**Policies Storage**:
- Lecture: Autorisée si propriétaire du rapport ou admin
- Écriture: Autorisée uniquement pour ses propres rapports
- Suppression: Uniquement pour les brouillons

---

## 📊 Statistiques Admin

### Dashboard

**Métriques affichées**:
1. Nombre total de rapports
2. Rapports par statut (brouillon, en attente, complété)
3. Nombre d'ouvriers actifs
4. Rapports par ouvrier
5. Rapports par mois (12 derniers mois)

**Filtres disponibles**:
- Par ouvrier
- Par période (date début/fin)
- Par statut

---

## 🎨 Interface Utilisateur

### Design System

**Framework**: Tailwind CSS 4
**Composants**: Shadcn UI
**Icônes**: Lucide React
**Thème**: Light/Dark (via next-themes)

### UX Principles

1. **Mobile-First**: Optimisé pour iPad et smartphone
2. **Gros boutons**: Utilisable avec des gants
3. **Feedback visuel**: Toast notifications pour chaque action
4. **Progression claire**: Stepper avec pourcentage
5. **Validation inline**: Erreurs affichées immédiatement

### Responsive

- **Mobile**: < 768px (layout vertical)
- **Tablet**: 768px - 1024px (layout optimisé)
- **Desktop**: > 1024px (dashboard admin)

---

## ⚡ Performance

### Cibles

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **Lighthouse Score**: > 90

### Optimisations

1. **Images**:
   - Compression automatique (1200px max)
   - Format optimisé (JPEG 80%)
   - Lazy loading

2. **Code**:
   - Code splitting par route
   - Tree shaking
   - Minification

3. **Cache**:
   - Service Worker
   - Cache des assets statiques
   - IndexedDB pour les données

---

## 🧪 Tests

### Critères d'Acceptation

✅ **PWA**:
- Installable sur l'écran d'accueil d'un iPad
- Fonctionne en mode plein écran
- Icône et splash screen personnalisés

✅ **Offline**:
- Rapport créable sans connexion
- Synchronisation automatique au retour de connexion
- Indicateur visuel de statut clair

✅ **Admin**:
- Dashboard accessible uniquement aux admins
- Filtres fonctionnels (ouvrier, date)
- Statistiques précises et à jour

✅ **Email**:
- Délai d'envoi < 10 secondes après signature
- PDF correct et complet
- Template professionnel

✅ **Code**:
- TypeScript sans erreurs
- Tests unitaires passants
- Documentation complète (README)

---

## 📈 Évolutions Futures

### Phase 2 (optionnelle)

- [ ] Signature électronique certifiée
- [ ] Export Excel des statistiques
- [ ] Module de facturation
- [ ] Application native (React Native)
- [ ] API webhook pour intégrations tierces
- [ ] Multi-entreprises (SaaS)

---

## 📝 Conformité

### RGPD

- Consentement explicite (signatures)
- Droit à l'effacement (suppression de rapports)
- Sécurité des données (RLS, encryption)
- Durée de conservation définie

### Accessibilité

- Labels ARIA
- Navigation au clavier
- Contraste suffisant
- Textes alternatifs

---

## 🆘 Support Technique

**Contact**: contact@goboclean.be

**Documentation**:
- README.md (guide d'installation)
- DEPLOYMENT.md (guide de déploiement)
- Ce fichier (spécifications)

---

Dernière mise à jour: Février 2026
Version: 1.0.0
