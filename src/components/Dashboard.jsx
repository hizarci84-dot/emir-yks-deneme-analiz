import React, { useState } from 'react';
import { 
  TrendingUp, Award, Target, BookOpen, Clock, Calendar, 
  ChevronRight, Sparkles, AlertCircle, Share2, Edit2, Trash2, 
  CheckCircle, ArrowUpRight, ArrowDownRight, Layers, HelpCircle
} from 'lucide-react';
import { StorageService } from '../services/storage';

export default function Dashboard({ 
  exams, 
  targetProgram, 
  onOpenAddModal, 
  onEditExam, 
  onDeleteExam,
  onNavigateToTab 
}) {
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [filterStage, setFilterStage] = useState('ALL'); // 'ALL', 'TYT', 'AYT'

  // Filtrelenmiş denemeler
  const filteredExams = exams.filter(e => {
    if (filterStage === 'ALL') return true;
    return e.stage === filterStage;
  });

  // TYT ve AYT denemelerini ayır
  const tytExams = exams.filter(e => e.stage === 'TYT');
  const aytExams = exams.filter(e => e.stage === 'AYT');

  // Son denemeler
  const latestTyt = tytExams.length > 0 ? tytExams[0] : null;
  const latestAyt = aytExams.length > 0 ? aytExams[0] : null;
  const previousTyt = tytExams.length > 1 ? tytExams[1] : null;
  const previousAyt = aytExams.length > 1 ? aytExams[1] : null;

  // Ortalamalar
  const avgTytNet = tytExams.length > 0 
    ? (tytExams.reduce((sum, e) => sum + e.totalNet, 0) / tytExams.length).toFixed(1)
    : 0;
  const avgAytNet = aytExams.length > 0 
    ? (aytExams.reduce((sum, e) => sum + e.totalNet, 0) / aytExams.length).toFixed(1)
    : 0;

  // Net değişimleri (Trend)
  const tytDiff = (latestTyt && previousTyt) ? (latestTyt.totalNet - previousTyt.totalNet).toFixed(1) : null;
  const aytDiff = (latestAyt && previousAyt) ? (latestAyt.totalNet - previousAyt.totalNet).toFixed(1) : null;

  // WhatsApp Paylaşımı
  const handleShareWhatsApp = (exam) => {
    const encoded = StorageService.generateWhatsAppReport([exam], targetProgram);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Üst Tebrik & Karşılama Kartı */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>11. Sınıf Maarif Modeli • Eşit Ağırlık Koçluğu</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Hedefe Adım Adım, Emir! 🚀
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
              Girdiğin her deneme, 1. ve 2. aşamada eksiklerini keşfedip netlerini zirveye taşıyacak bir fırsattır. Okul ve dershane denemelerini kaydet, ders bazlı grafiklerini incele ve YÖK Atlas hedefine odaklan.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs sm:text-sm shadow-lg shadow-black/20 hover:bg-indigo-50 transition active:scale-95"
            >
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Yeni Deneme Ekle</span>
            </button>
            <button
              onClick={() => onNavigateToTab('yokatlas')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-sm border border-white/10 transition"
            >
              <Target className="w-4 h-4 text-amber-300" />
              <span>YÖK Atlas Hedefi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hızlı Metrik Kartları (Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Kart 1: 1. Aşama (TYT) Son Net */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">1. Aşama (TYT)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {latestTyt ? latestTyt.totalNet.toFixed(1) : '-'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Net (Son)</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 font-medium pt-2 border-t border-slate-100">
            <span>Ortalama: <b className="text-slate-800">{avgTytNet}</b></span>
            {tytDiff !== null && (
              <span className={`inline-flex items-center font-bold ${parseFloat(tytDiff) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {parseFloat(tytDiff) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {tytDiff > 0 ? `+${tytDiff}` : tytDiff}
              </span>
            )}
          </div>
        </div>

        {/* Kart 2: 2. Aşama (AYT - EA) Son Net */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">2. Aşama (AYT EA)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {latestAyt ? latestAyt.totalNet.toFixed(1) : '-'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Net (Son)</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 font-medium pt-2 border-t border-slate-100">
            <span>Ortalama: <b className="text-slate-800">{avgAytNet}</b></span>
            {aytDiff !== null && (
              <span className={`inline-flex items-center font-bold ${parseFloat(aytDiff) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {parseFloat(aytDiff) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {aytDiff > 0 ? `+${aytDiff}` : aytDiff}
              </span>
            )}
          </div>
        </div>

        {/* Kart 3: Toplam Kayıtlı Deneme */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Toplam Deneme</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {exams.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Sınav</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 font-medium pt-2 border-t border-slate-100">
            <span>TYT: <b className="text-indigo-600">{tytExams.length}</b></span>
            <span>AYT: <b className="text-purple-600">{aytExams.length}</b></span>
          </div>
        </div>

        {/* Kart 4: Hedef Program Durumu */}
        <div 
          onClick={() => onNavigateToTab('yokatlas')}
          className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Hedef Üniversite</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="truncate font-extrabold text-slate-900 text-sm sm:text-base">
            {targetProgram ? targetProgram.university : 'Hedef Seçilmedi'}
          </div>
          <div className="text-xs text-amber-800 font-medium truncate mt-0.5">
            {targetProgram ? targetProgram.department : 'YÖK Atlas sekmesinden seç'}
          </div>
          <div className="mt-2 text-[11px] text-amber-900 font-semibold flex items-center gap-1 pt-2 border-t border-amber-200/60">
            <span>YÖK Atlas Net Analizi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* 3. İNTERAKTİF GELİŞİM GRAFİĞİ (SVG Timeline Chart) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Net Gelişim ve Başarı Trendi
            </h3>
            <p className="text-xs text-slate-500">
              Zaman içerisindeki 1. Aşama (TYT) ve 2. Aşama (AYT) netlerinin yükseliş grafiği
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              1. Aşama (TYT)
            </span>
            <span className="inline-flex items-center gap-1.5 text-purple-600">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              2. Aşama (AYT)
            </span>
          </div>
        </div>

        {/* Görsel SVG Çizgi Grafiği */}
        {exams.length > 0 ? (
          <div className="w-full h-64 sm:h-72 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tytGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="aytGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Yatay Kılavuz Çizgileri */}
              {[0, 25, 50, 75, 100].map((val, idx) => {
                const y = 220 - (val / 100) * 190;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="590" y2={y} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="10" y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* TYT Çizgisi ve Alanı */}
              {(() => {
                const tytPoints = [...tytExams].reverse();
                if (tytPoints.length === 0) return null;
                const maxNet = 120;
                const pointsStr = tytPoints.map((item, i) => {
                  const x = 50 + (i / Math.max(1, tytPoints.length - 1)) * 520;
                  const y = 220 - (Math.min(100, (item.totalNet / maxNet) * 100) / 100) * 190;
                  return `${x},${y}`;
                }).join(' ');

                const firstX = 50;
                const lastX = 50 + (tytPoints.length > 1 ? 520 : 0);
                const areaPath = `M ${firstX},220 L ${pointsStr} L ${lastX},220 Z`;

                return (
                  <g>
                    <path d={areaPath} fill="url(#tytGrad)" />
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pointsStr}
                    />
                    {tytPoints.map((item, i) => {
                      const x = 50 + (i / Math.max(1, tytPoints.length - 1)) * 520;
                      const y = 220 - (Math.min(100, (item.totalNet / maxNet) * 100) / 100) * 190;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                          <text x={x} y={y - 10} textAnchor="middle" fill="#312e81" fontSize="11" fontWeight="bold">
                            {item.totalNet.toFixed(1)}
                          </text>
                          <text x={x} y="235" textAnchor="middle" fill="#64748b" fontSize="9">
                            {item.date ? item.date.slice(5) : ''}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}

              {/* AYT Çizgisi ve Alanı */}
              {(() => {
                const aytPoints = [...aytExams].reverse();
                if (aytPoints.length === 0) return null;
                const maxNet = 80;
                const pointsStr = aytPoints.map((item, i) => {
                  const x = 50 + (i / Math.max(1, aytPoints.length - 1)) * 520;
                  const y = 220 - (Math.min(100, (item.totalNet / maxNet) * 100) / 100) * 190;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <g>
                    <polyline
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="2 0"
                      points={pointsStr}
                    />
                    {aytPoints.map((item, i) => {
                      const x = 50 + (i / Math.max(1, aytPoints.length - 1)) * 520;
                      const y = 220 - (Math.min(100, (item.totalNet / maxNet) * 100) / 100) * 190;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#9333ea" strokeWidth="3" />
                          <text x={x} y={y - 10} textAnchor="middle" fill="#581c87" fontSize="11" fontWeight="bold">
                            {item.totalNet.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}

            </svg>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm">Henüz grafik oluşturacak kadar deneme girilmedi.</p>
          </div>
        )}

      </div>

      {/* 4. DENEME SINAVLARI GEÇMİŞİ LİSTESİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        
        {/* Filtre Başlığı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Kayıtlı Deneme Sınavları ({filteredExams.length})
            </h3>
            <p className="text-xs text-slate-500">
              Detaylı incelemek için denemeye tıklayabilir, düzenleyebilir veya WhatsApp ile paylaşabilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterStage('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filterStage === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterStage('TYT')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filterStage === 'TYT' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              1. Aşama (TYT)
            </button>
            <button
              onClick={() => setFilterStage('AYT')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filterStage === 'AYT' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              2. Aşama (AYT)
            </button>
          </div>
        </div>

        {/* Liste */}
        {filteredExams.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Bu kategoride deneme bulunmuyor</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Okulda veya dershanede girdiğin denemeyi hemen kaydederek analizini başlatabilirsin.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200"
            >
              Deneme Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExams.map((exam) => {
              const isExpanded = selectedExamDetail === exam.id;

              return (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-slate-200 hover:border-slate-300 transition-all overflow-hidden bg-white shadow-sm"
                >
                  {/* Satır Başlığı */}
                  <div
                    onClick={() => setSelectedExamDetail(isExpanded ? null : exam.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition"
                  >
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm flex-shrink-0 ${
                        exam.stage === 'TYT' ? 'bg-indigo-600' : exam.stage === 'AYT' ? 'bg-purple-600' : 'bg-slate-800'
                      }`}>
                        {exam.stage}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                            {exam.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {exam.institution || 'Genel'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exam.difficulty === 'Zor' || exam.difficulty === 'Çok Zor' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {exam.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                          <span>📅 {exam.date}</span>
                          <span>•</span>
                          <span>{exam.totalQuestions} Soru</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{exam.totalCorrect} D</span>
                          <span className="text-rose-600 font-bold">{exam.totalWrong} Y</span>
                          <span className="text-amber-600 font-bold">{exam.totalBlank} B</span>
                        </div>
                      </div>
                    </div>

                    {/* Sağ Taraf: Net Rozeti ve Aksiyonlar */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black text-indigo-700 block leading-tight">
                          {exam.totalNet.toFixed(2)} Net
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          %{exam.successPercentage?.toFixed(1) || 0} Başarı
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareWhatsApp(exam);
                          }}
                          title="WhatsApp ile Paylaş"
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditExam(exam);
                          }}
                          title="Düzenle"
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${exam.title}" silinsin mi?`)) {
                              onDeleteExam(exam.id);
                            }
                          }}
                          title="Sil"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Genişletilmiş Ders Dağılımı (Accordion) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-150">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Ders Bazlı Soru Sayıları ve Sonuçlar
                      </h5>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {Object.entries(exam.subjects || {}).map(([key, sub]) => {
                          const cleanName = key.replace('tyt_', '').replace('ayt_', '').toUpperCase();
                          return (
                            <div key={key} className="bg-white p-3 rounded-xl border border-slate-200">
                              <span className="text-xs font-extrabold text-slate-800 block truncate">
                                {cleanName}
                              </span>
                              <div className="mt-1 flex items-baseline justify-between">
                                <span className="text-sm font-black text-indigo-600">
                                  {sub.net.toFixed(2)} Net
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {sub.questionCount} Soru
                                </span>
                              </div>
                              <div className="mt-1 text-[10px] text-slate-500 font-semibold flex justify-between border-t border-slate-100 pt-1">
                                <span className="text-emerald-600">{sub.correct} D</span>
                                <span className="text-rose-600">{sub.wrong} Y</span>
                                <span className="text-amber-600">{sub.blank} B</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {exam.notes && (
                        <div className="mt-2 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 font-medium">
                          <span className="font-bold block text-indigo-800 mb-0.5">Öğrenci / Koç Yorumu:</span>
                          {exam.notes}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
