import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Cloud, Plus, GraduationCap, CheckCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, settings }) {
  // YKS Geri Sayım Hesaplama (Hedef yıla göre dinamik)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const targetYear = parseInt(settings?.targetYear, 10) || 2028;

  useEffect(() => {
    const calculateTime = () => {
      // YKS sınavları her yıl Haziran ayının 3. hafta sonu (Cumartesi 10:15) düzenlenir
      const yksSchedule = {
        2026: '2026-06-20T10:15:00',
        2027: '2027-06-19T10:15:00',
        2028: '2028-06-17T10:15:00',
        2029: '2029-06-16T10:15:00',
        2030: '2030-06-15T10:15:00'
      };

      const targetDateStr = yksSchedule[targetYear] || `${targetYear}-06-17T10:15:00`;
      const targetDate = new Date(targetDateStr);
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        setTimeLeft({ days, hours });
      } else {
        setTimeLeft({ days: 0, hours: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [targetYear]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Student Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {settings?.studentName || 'Emir'} <span className="text-indigo-600">YKS EA</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  11. Sınıf Maarif Modeli
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Eşit Ağırlık Deneme Analiz ve YÖK Atlas Portalı
              </p>
            </div>
          </div>

          {/* Center: Countdown Banner */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl px-2.5 py-1 sm:px-3.5 sm:py-1.5 flex items-center gap-2 shadow-sm">
              <Calendar className="w-4 h-4 text-amber-600 animate-pulse" />
              <div className="text-xs font-bold text-amber-900">
                <span className="text-amber-700 font-extrabold sm:text-sm">{timeLeft.days}</span> gün <span className="hidden sm:inline">kaldı</span>
                <span className="text-amber-600 text-[10px] font-normal block sm:inline sm:ml-1">
                  (YKS {targetYear})
                </span>
              </div>
            </div>

            {/* Cloud Status Indicator */}
            <button
              onClick={() => setActiveTab('settings')}
              title="Bulut Senkronizasyon Durumu"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 transition shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden md:inline">Bulut Aktif</span>
            </button>

            {/* Quick Add Button (Desktop) */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Deneme Ekle</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
