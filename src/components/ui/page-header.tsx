'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export function PageHeader({ title, onBack }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
      <button 
        onClick={handleBack}
        className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-slate-700" />
      </button>
      <h1 className="text-[18px] font-bold text-[#064e3b]">{title}</h1>
      <div className="w-10" /> {/* Spacer for centering */}
    </header>
  );
}
