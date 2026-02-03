'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';

interface Statistics {
  totalReports: number;
  reportsByStatus: {
    draft: number;
    pending_signature: number;
    completed: number;
  };
  reportsByWorker: Array<{
    worker: { first_name: string; last_name: string };
    count: number;
  }>;
  reportsPerMonth: Array<{
    month: string;
    count: number;
  }>;
  activeWorkers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Vue d'ensemble de l'activité GoBo Clean</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rapports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Tous les rapports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reportsByStatus?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">Rapports finalisés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.reportsByStatus?.draft || 0) + (stats.reportsByStatus?.pending_signature || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Brouillons + Signatures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouvriers Actifs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkers}</div>
            <p className="text-xs text-muted-foreground">Équipe disponible</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports by Worker */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports par Ouvrier</CardTitle>
          <CardDescription>Performance de l'équipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.reportsByWorker?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {item.worker.first_name[0]}{item.worker.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.worker.first_name} {item.worker.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-gray-500">rapports</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports par Mois</CardTitle>
          <CardDescription>Activité des 12 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.reportsPerMonth?.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{item.month}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                    style={{
                      width: `${Math.min((item.count / (stats.totalReports || 1)) * 100, 100)}%`,
                      minWidth: item.count > 0 ? '40px' : '0',
                    }}
                  >
                    {item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
