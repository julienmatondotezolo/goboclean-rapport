'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';

interface Report {
  id: string;
  clientName: string;
  address: string;
  workerName: string;
  updatedTime: string;
  status: 'synced' | 'pending';
}

const DUMMY_REPORTS: Report[] = [
  {
    id: '1',
    clientName: 'Sarah Jenkins',
    address: '452 O...',
    workerName: 'David Miller',
    updatedTime: '14 mins ago',
    status: 'synced',
  },
  {
    id: '2',
    clientName: 'Robert Chen',
    address: '1288...',
    workerName: 'Mike Johnson',
    updatedTime: '1 hour ago',
    status: 'pending',
  },
  {
    id: '3',
    clientName: 'Alice Cooper',
    address: '90...',
    workerName: 'Sarah Lee',
    updatedTime: '3 hours ago',
    status: 'synced',
  },
  {
    id: '4',
    clientName: 'George Williams',
    address: '33...',
    workerName: 'Mike Johnson',
    updatedTime: '5 hours ago',
    status: 'synced',
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const t = useTranslations('Reports');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = DUMMY_REPORTS.filter(report => 
    report.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.workerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="pl-12 h-14 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl text-[16px] transition-all focus:outline-none focus:border-[#84cc16] focus:bg-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
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

      {/* Recent Reports Section */}
      <div className="px-6 mt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#064e3b]">{t('recentReports')}</h2>
          <button className="text-(--brand-green) font-bold text-[14px] hover:underline">{t('viewAll')}</button>
        </div>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              className="group flex items-center gap-4 py-2 bg-white active:scale-[0.98] transition-all border-b border-slate-50 last:border-0"
              onClick={() => router.push(`/reports/${report.id}`)}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#84cc16]/10 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-[#064e3b]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate text-[17px]">
                  {report.clientName} - {report.address}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium">
                  {t('worker')}: {report.workerName}
                </p>
                <p className="text-slate-400 text-[13px] mt-0.5">
                  {t('updated')} {report.updatedTime}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                  report.status === 'synced' 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-orange-50 text-orange-600 border border-orange-100"
                )}>
                  {report.status === 'synced' ? (
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
                <ChevronRight className="w-5 h-5 text-slate-300 group-active:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



