'use client';

import { useState, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  Loader2,
  AlertCircle,
  Download,
  FileX2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import type { MissionReport } from '@/types/mission';

export default function ReportsPage() {
  const router = useRouter();
  const t = useTranslations('Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: reports, isLoading, isError, refetch } = useReports(
    {
      search: searchQuery || undefined,
      status: statusFilter || undefined,
    },
    {
      enabled: isAuthenticated,
    }
  );

  // Client-side search filter for instant feedback
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (!searchQuery.trim()) return reports;

    const q = searchQuery.toLowerCase();
    return reports.filter((r) =>
      `${r.client_first_name} ${r.client_last_name}`.toLowerCase().includes(q) ||
      (r.worker_first_name && `${r.worker_first_name} ${r.worker_last_name}`.toLowerCase().includes(q)) ||
      r.client_address?.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getReportStatus = (report: MissionReport): 'synced' | 'pending' => {
    return report.status === 'completed' || report.pdf_url ? 'synced' : 'pending';
  };

  const handleReportClick = (report: MissionReport) => {
    if (report.pdf_url) {
      window.open(report.pdf_url, '_blank');
    } else {
      router.push(`/reports/${report.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* Header */}
      <PageHeader title={t('allReports')} />

      {/* Search and Filters */}
      <div className="px-6 py-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
          <Input 
            placeholder={t('searchPlaceholder')}
            className="pl-12 h-14 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl text-[16px] transition-all focus:outline-none focus:border-brand-green focus:bg-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex justify-between gap-2">
          <button className="flex items-center justify-between rounded-full bg-[#9ed34b] text-white font-bold h-10 px-4 text-[13px] hover:opacity-90 transition-all shadow-sm flex-1">
            <span>{t('today')}</span> <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center justify-between rounded-full border border-[#9ed34b] text-[#1e3a34] font-bold h-10 px-4 text-[13px] bg-[#f9fff0] hover:bg-[#f4ffdf] transition-all flex-1">
            <span>{t('workers')}</span> <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center justify-between rounded-full border border-[#9ed34b] text-[#1e3a34] font-bold h-10 px-4 text-[13px] bg-[#f9fff0] hover:bg-[#f4ffdf] transition-all flex-1">
            <span>{t('status')}</span> <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-6 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
          <span className="ml-3 text-[14px] text-gray-500">{t('loading')}</span>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="px-6 py-8">
          <div className="bg-red-50 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-red-700 mb-2">{t('errorLoading')}</p>
            <button
              onClick={() => refetch()}
              className="text-[13px] font-bold text-[#064e3b] hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredReports.length === 0 && (
        <div className="px-6 py-12">
          <div className="bg-[#f8fafc] rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <FileX2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[16px] font-bold text-gray-600 mb-1">{t('noReports')}</p>
            <p className="text-[13px] text-gray-400">{t('noReportsDescription')}</p>
          </div>
        </div>
      )}

      {/* Reports List */}
      {!isLoading && !isError && filteredReports.length > 0 && (
        <div className="px-6 mt-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-brand-emerald">{t('recentReports')}</h2>
            <button className="text-(--brand-green) font-bold text-[14px] hover:underline">{t('viewAll')}</button>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => {
              const status = getReportStatus(report);
              return (
                <div 
                  key={report.id}
                  className="group flex items-center gap-4 py-2 bg-white active:scale-[0.98] transition-all border-b border-slate-50 last:border-0"
                  onClick={() => handleReportClick(report)}
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7 text-brand-emerald" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate text-[17px]">
                      {report.client_first_name} {report.client_last_name} - {report.client_address?.slice(0, 8)}...
                    </h3>
                    <p className="text-slate-500 text-[14px] font-medium">
                      {t('worker')}: {report.worker_first_name ? `${report.worker_first_name} ${report.worker_last_name}` : 'N/A'}
                    </p>
                    <p className="text-slate-400 text-[13px] mt-0.5">
                      {t('updated')} {formatTime(report.updated_at)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      status === 'synced' 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-orange-50 text-orange-600 border border-orange-100"
                    )}>
                      {status === 'synced' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white" />
                          <span>{t('synced')}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{t('pending')}</span>
                        </>
                      )}
                    </div>
                    {report.pdf_url ? (
                      <Download className="w-5 h-5 text-[#064e3b] group-hover:scale-110 transition-transform" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-300 group-active:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
