/**
 * Demo Mode Configuration
 * 
 * This file controls demo mode for the Goboclean app.
 * When DEMO_MODE is true, all API calls are disabled and replaced with mock data.
 * 
 * Use this for stable demos when backend integration has issues.
 */

export const DEMO_MODE = false; // Set to false to re-enable backend integration

// Demo data for missions
export const DEMO_MISSIONS = [
  {
    id: '1',
    title: 'Nettoyage Toiture Villa Dubois',
    description: 'Nettoyage complet de la toiture avec démoussage',
    address: 'Rue de la Paix 15, 8500 Kortrijk',
    status: 'assigned' as const,
    priority: 'medium' as const,
    scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: 'worker-1',
    assigned_workers: [
      {
        id: 'worker-1',
        first_name: 'Marc',
        last_name: 'Janssens',
        email: 'worker@goboclean.be'
      }
    ],
    created_by: 'admin-1',
    estimated_duration: 240,
    client_name: 'M. & Mme Dubois',
    client_email: 'dubois@email.be',
    client_phone: '+32 56 123 456'
  },
  {
    id: '2',
    title: 'Nettoyage Façade Restaurant',
    description: 'Nettoyage haute pression de la façade principale',
    address: 'Grand Place 8, 8000 Bruges',
    status: 'in_progress' as const,
    priority: 'high' as const,
    scheduled_for: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: 'worker-1',
    assigned_workers: [
      {
        id: 'worker-1',
        first_name: 'Marc',
        last_name: 'Janssens',
        email: 'worker@goboclean.be'
      }
    ],
    created_by: 'admin-1',
    estimated_duration: 180,
    client_name: 'Restaurant De Garre',
    client_email: 'info@degarre.be',
    client_phone: '+32 50 341 029'
  },
  {
    id: '3',
    title: 'Nettoyage Vitres Bureaux',
    description: 'Nettoyage vitres intérieur/extérieur - 2ème étage',
    address: 'Businesspark 42, 8790 Waregem',
    status: 'completed' as const,
    priority: 'low' as const,
    scheduled_for: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assigned_to: 'worker-1',
    assigned_workers: [
      {
        id: 'worker-1',
        first_name: 'Marc',
        last_name: 'Janssens',
        email: 'worker@goboclean.be'
      }
    ],
    created_by: 'admin-1',
    estimated_duration: 120,
    client_name: 'TechCorp NV',
    client_email: 'facility@techcorp.be',
    client_phone: '+32 56 789 123'
  }
];

// Demo admin statistics
export const DEMO_ADMIN_STATS = {
  totalReports: 24,
  reportsByStatus: {
    draft: 3,
    pending_signature: 8,
    completed: 13,
  },
  reportsByWorker: [
    {
      worker: { first_name: 'Marc', last_name: 'Janssens' },
      count: 15,
    },
    {
      worker: { first_name: 'Sophie', last_name: 'Vanderstraeten' },
      count: 9,
    },
  ],
  reportsPerMonth: [
    { month: '2026-01', count: 8 },
    { month: '2026-02', count: 16 },
  ],
  activeWorkers: 2,
};

// Demo notifications
export const DEMO_NOTIFICATIONS = {
  unreadCount: 2,
  notifications: [
    {
      id: '1',
      title: 'Nouvelle mission assignée',
      message: 'Mission "Nettoyage Toiture Villa Dubois" vous a été assignée',
      created_at: new Date().toISOString(),
      read: false,
      type: 'mission_assigned' as const
    },
    {
      id: '2',
      title: 'Mission terminée',
      message: 'Mission "Nettoyage Vitres Bureaux" marquée comme terminée',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      type: 'mission_completed' as const
    }
  ]
};