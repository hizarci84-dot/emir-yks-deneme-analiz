import React, { useState, useRef, useEffect } from 'react';
import { Info, TrendingUp, TrendingDown, Minus, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getProgramMultiYearData } from '../services/yokAtlasAnalysis';

/**
 * Resmi YÖK Atlas Çok Yıllı Başarı Sırası Popover Bileşeni
 * YÖK Atlas'ın (i) bilgi butonuna basıldığında açılan 2025, 2024, 2023 penceresini birebir sunar.
 */
export default function MultiYearRankPopover({ 
  program, 
  customTrigger = null,
  showTrendBadge = true,
  align = 'right' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const multi = getProgramMultiYearData(program);

  // Dışarı tıklandığında popover'ı kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  if (!multi) return null;

  return (
    <div className="relative inline-flex items-center">
      {/* Tetikleyici (i) Butonu */}
      {customTrigger ? (
        <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          title="YÖK Atlas 3 Yıllık Başarı Sıralarını Gör (2025, 2024, 2023)"
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
            isOpen 
              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300' 
              : 'bg-indigo-50/90 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200'
          }`}
        >
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}

      {/* Popover Penceresi (YÖK Atlas Orijinal Tasarımı) */}
      {isOpen && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 text-left text-slate-800 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'left' ? 'left-0' : align === 'center' ? '-left-28 sm:-left-32' : 'right-0'
          }`}
        >
          {/* Üst Başlık & Kapatma Butonu */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                YÖK Atlas Başarı Sıraları
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Yıllık Tablo Blokları (Kullanıcının Paylaştığı YÖK Atlas Görünümüyle Birebir) */}
          <div className="space-y-1 rounded-xl overflow-hidden border border-slate-200/90 text-center text-xs font-black">
            
            {/* 2025 (En Güncel Yıl - Pembe / Kırmızımsı Vurgulu Kutu) */}
            <div className="bg-rose-50/80 hover:bg-rose-100/70 py-2 px-3 border-b border-rose-100 transition flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800">2025</span>
              <span className="text-sm font-black text-rose-900">
                #{multi.rank2025 > 0 ? multi.rank2025.toLocaleString() : '---'}
              </span>
            </div>

            {/* 2024 (Bir Önceki Yıl - Açık Mavi / Cyan Kutu) */}
            <div className="bg-cyan-50/70 hover:bg-cyan-100/70 py-2 px-3 border-b border-cyan-100 transition flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-800">2024</span>
              <span className="text-sm font-black text-cyan-900">
                #{multi.rank2024 > 0 ? multi.rank2024.toLocaleString() : '---'}
              </span>
            </div>

            {/* 2023 (İki Yıl Önceki Yıl - Nötr Kutu) */}
            <div className="bg-slate-50 hover:bg-slate-100 py-2 px-3 transition flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600">2023</span>
              <span className="text-sm font-black text-slate-700">
                #{multi.rank2023 > 0 ? multi.rank2023.toLocaleString() : '---'}
              </span>
            </div>

          </div>

          {/* 3 Yıllık Trend ve Rehberlik Analizi */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px]">
            
            {/* Trend Göstergesi */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">3 Yıllık Eğilim:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${multi.trend.badgeClass}`}>
                <span>{multi.trend.icon}</span>
                <span>{multi.trend.label}</span>
              </span>
            </div>

            {/* Ağırlıklı Ortalama */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">3 Yıllık Gerçekçi Ortalama:</span>
              <span className="font-extrabold text-indigo-700">
                #{multi.weightedAvgRank.toLocaleString()}
              </span>
            </div>

            {/* En Zor Yıl (Kötümser) */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">En Zor Yıl Barajı:</span>
              <span className="font-extrabold text-slate-800">
                #{multi.peakRank.toLocaleString()}
              </span>
            </div>

            {/* Taban Puan Bilgisi */}
            {multi.score2025 > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100/70 text-[10px] text-slate-500">
                <span>Taban Puan (2025):</span>
                <span className="font-bold text-slate-800">{multi.score2025}</span>
              </div>
            )}

            {/* Gerçekçi Tercih Tavsiyesi */}
            <div className="mt-2 p-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[10px] text-indigo-950 leading-relaxed font-medium">
              💡 <b>Rehberlik Notu:</b> {multi.trend.description}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
