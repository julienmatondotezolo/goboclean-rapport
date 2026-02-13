'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Download, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { LoadingBanner } from '@/components/loading-banner';
import { useReport } from '@/hooks/useReports';
import { handleError } from '@/lib/error-handler';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('Reports');
  const reportId = params.id as string;
  const locale = params.locale as string;

  const { data: report, isLoading, isError, error } = useReport(reportId);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Trigger file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      handleError(error, { title: 'Failed to download report' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingBanner 
          isLoading={true} 
          message="Loading report..." 
        />
        <PageHeader 
          title="Report Details" 
          showBackButton
          onBackClick={() => router.push(`/${locale}/reports`)}
        />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="Report Not Found" 
          showBackButton
          onBackClick={() => router.push(`/${locale}/reports`)}
        />
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Report Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested report could not be found or you don't have permission to view it.
          </p>
          <Button
            onClick={() => router.push(`/${locale}/reports`)}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <PageHeader 
        title={t('reportDetail') || 'Report Details'} 
        showBackButton
        onBackClick={() => router.push(`/${locale}/reports`)}
      />

      <div className="p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#064e3b]/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#064e3b]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {report.client_first_name} {report.client_last_name}
                </h1>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  {report.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleDownloadPDF}
              className="bg-[#064e3b] hover:bg-[#052d20] text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Mission Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mission Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Appointment Date</p>
                <p className="text-gray-900">{formatDate(report.appointment_time)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-gray-900">{report.client_address}</p>
              </div>
            </div>

            {report.worker_first_name && (
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned Worker</p>
                  <p className="text-gray-900">{report.worker_first_name} {report.worker_last_name}</p>
                </div>
              </div>
            )}

            {report.mission_type && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Mission Type</p>
                  <p className="text-gray-900 capitalize">{report.mission_type}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Report ID</p>
                <p className="text-gray-900 font-mono text-sm">{report.id}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-gray-900">{formatDate(report.created_at)}</p>
              </div>
            </div>

            {report.completed_at && (
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Completed</p>
                  <p className="text-gray-900">{formatDate(report.completed_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {report.additional_info && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <p className="text-gray-700">{report.additional_info}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleDownloadPDF}
            className="w-full bg-[#064e3b] hover:bg-[#052d20] text-white py-4"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Complete Report
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/reports`)}
            className="w-full py-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to All Reports
          </Button>
        </div>
      </div>
    </div>
  );
}