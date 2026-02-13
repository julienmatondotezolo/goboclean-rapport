'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw, Users, Activity, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { LoadingBanner } from '@/components/loading-banner';
import { usePageLogger } from '@/components/page-logger';

interface UserActivity {
  userId: string;
  userRole: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  currentPage?: string;
  lastSeen: string;
  ipAddress?: string;
  activities: ActivityLog[];
}

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'page_load' | 'api_call' | 'crud_operation' | 'error';
  action: string;
  page?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

interface Statistics {
  activeUsers: number;
  totalSessions: number;
  totalActivities: number;
  recentActivities: {
    pageLoads: number;
    apiCalls: number;
    crudOperations: number;
    errors: number;
  };
  usersByRole: Record<string, number>;
  averageResponseTime: number;
  errorRate: number;
}

export default function MonitoringPage() {
  const t = useTranslations('Monitoring');
  const { user, isAdmin } = useAuth();
  const { logError, logUserAction } = usePageLogger('MonitoringPage');

  const [activeUsers, setActiveUsers] = useState<UserActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    if (!user || !isAdmin) return;

    try {
      setError(null);
      
      const [usersResponse, activitiesResponse, statsResponse] = await Promise.all([
        apiClient.get<{ success: boolean; data: UserActivity[] }>('/monitoring/active-users'),
        apiClient.get<{ success: boolean; data: ActivityLog[] }>('/monitoring/recent-activities?limit=50'),
        apiClient.get<{ success: boolean; data: Statistics }>('/monitoring/statistics'),
      ]);

      if (usersResponse.success) setActiveUsers(usersResponse.data);
      if (activitiesResponse.success) setRecentActivities(activitiesResponse.data);
      if (statsResponse.success) setStatistics(statsResponse.data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch monitoring data';
      setError(errorMessage);
      logError('Failed to fetch monitoring data', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isAdmin]);

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, user, isAdmin]);

  const handleRefresh = () => {
    logUserAction('manual_refresh');
    setIsLoading(true);
    fetchData();
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId === selectedUser ? null : userId);
    logUserAction('select_user', userId);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    return `${ms}ms`;
  };

  const getStatusColor = (type: string, statusCode?: number) => {
    if (type === 'error' || (statusCode && statusCode >= 400)) return 'destructive';
    if (type === 'crud_operation') return 'default';
    if (type === 'api_call' && statusCode && statusCode < 300) return 'secondary';
    return 'outline';
  };

  const selectedUserData = selectedUser ? activeUsers.find(u => u.userId === selectedUser) : null;

  if (!user || !isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans">
      <LoadingBanner isLoading={isLoading} message="Loading monitoring data..." />
      
      <PageHeader title="System Monitoring" />
      
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
            >
              {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
            </Button>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalActivities}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.errorRate}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.averageResponseTime}ms</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Users ({activeUsers.length})
              </CardTitle>
              <CardDescription>Currently online users and their activity</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div
                    key={user.userId}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser === user.userId ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleUserSelect(user.userId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.userEmail}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.userRole}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {user.currentPage || 'Unknown page'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(user.lastSeen)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {activeUsers.length === 0 && (
                  <p className="text-gray-500 text-center py-6">No active users</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Latest user actions and system events</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 text-xs border-b">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(activity.type, activity.statusCode)} className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="font-medium">{activity.action}</span>
                      </div>
                      {activity.page && (
                        <p className="text-gray-500 mt-1">Page: {activity.page}</p>
                      )}
                      {activity.error && (
                        <p className="text-red-500 mt-1">Error: {activity.error}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">{formatTime(activity.timestamp)}</p>
                      {activity.responseTime && (
                        <p className="text-gray-500">{formatDuration(activity.responseTime)}</p>
                      )}
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-gray-500 text-center py-6">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected User Details */}
        {selectedUserData && (
          <Card>
            <CardHeader>
              <CardTitle>
                User Activity: {selectedUserData.firstName} {selectedUserData.lastName}
              </CardTitle>
              <CardDescription>
                Detailed activity log for this user session
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {selectedUserData.activities.slice(-20).reverse().map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 text-xs border-b">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(activity.type, activity.statusCode)} className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="font-medium">{activity.action}</span>
                      </div>
                      {activity.page && (
                        <p className="text-gray-500 mt-1">Page: {activity.page}</p>
                      )}
                      {activity.error && (
                        <p className="text-red-500 mt-1">Error: {activity.error}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">{formatTime(activity.timestamp)}</p>
                      {activity.responseTime && (
                        <p className="text-gray-500">{formatDuration(activity.responseTime)}</p>
                      )}
                    </div>
                  </div>
                ))}
                {selectedUserData.activities.length === 0 && (
                  <p className="text-gray-500 text-center py-6">No activities recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}