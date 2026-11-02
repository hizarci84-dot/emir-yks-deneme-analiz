import React, { useState } from 'react';
import { 
  BarChart2, TrendingUp, AlertTriangle, CheckCircle2, 
  Sparkles, BookOpen, Layers, Award, Target, HelpCircle,
  PieChart, Activity, Zap, ArrowUpRight, ArrowDownRight,
  ChevronRight, Calendar, Info
} from 'lucide-react';
import { EXAM_STAGES, MAARIF_11_TOPICS } from '../data/examStructure';

export default function SubjectAnalysis({ exams = [] }) {
  const [selectedStage, setSelectedStage] = useState('TYT'); // 'TYT' or 'AYT'
  const [activeSubjectId, setActiveSubjectId] = useState('tyt_turkce');
  const [activeExamDetail, setActiveExamDetail] = useState(null);

  // Mevcut aşamadaki dersler
  const currentStageInfo = EXAM_STAGES[selectedStage] || EXAM_STAGES.TYT;
  const subjects = currentStageInfo.subjects;

  // Seçilen aşama değiştiğinde aktif dersi de varsayılana çek
  const handleStageTab = (stageKey) => {
    setSelectedStage(stageKey);
    if (stageKey === 'TYT') setActiveSubjectId('tyt_turkce');
    if (stageKey === 'AYT') setActiveSubjectId('ayt_matematik');
  };

  // İlgili aşamadaki denemeleri al (Kronolojik sıralı: Eskiden Yeniye)
  const stageExams = [...exams]
    .filter(e => e.stage === selectedStage)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Ders istatistiklerini hesapla
  const calculateSubjectStats = (subId) => {
    const records = [];
    stageExams.forEach(exam => {
      if (exam.subjects && exam.subjects[subId]) {
        records.push({
          examId: exam.id,
          examTitle: exam.title,
          date: exam.date,
          institution: exam.institution,
          ...exam.subjects[subId]
        });
      }
    });

    if (records.length === 0) {
      return {
        records: [],
        avgNet: 0,
        avgQuestions: 0,
        avgCorrect: 0,
        avgWrong: 0,
        avgBlank: 0,
        maxNet: 0,
        minNet: 0,
        avgSuccessRate: 0,
        efficiencyRate: 0,
        netLostByWrong: 0,
        trend: 0
      };
    }

    const totalNet = records.reduce((sum, r) => sum + (r.net || 0), 0);
    const totalQ = records.reduce((sum, r) => sum + (r.questionCount || 0), 0);
    const totalC = records.reduce((sum, r) => sum + (r.correct || 0), 0);
    const totalW = records.reduce((sum, r) => sum + (r.wrong || 0), 0);
    const totalB = records.reduce((sum, r) => sum + (r.blank || 0), 0);

    const nets = records.map(r => r.net || 0);
    const maxNet = Math.max(...nets);
    const minNet = Math.min(...nets);

    const avgNet = totalNet / records.length;
    const avgQuestions = totalQ / records.length;
    const avgSuccessRate = avgQuestions > 0 ? (avgNet / avgQuestions) * 100 : 0;
    const efficiencyRate = totalC + totalW > 0 ? (totalC / (totalC + totalW)) * 100 : 0;
    const netLostByWrong = totalW * 0.25;

    // Trend: Son deneme vs bir önceki
    let trend = 0;
    if (records.length >= 2) {
      const last = records[records.length - 1];
      const prev = records[records.length - 2];
      trend = (last.net || 0) - (prev.net || 0);
    }

    return {
      records,
      avgNet,
      avgQuestions,
      avgCorrect: totalC / records.length,
      avgWrong: totalW / records.length,
      avgBlank: totalB / records.length,
      maxNet,
      minNet,
      avgSuccessRate,
      efficiencyRate,
      netLostByWrong,
      trend
    };
  };

  const activeSubjectInfo = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const activeStats = calculateSubjectStats(activeSubjectInfo.id);

  // Aşamadaki tüm derslerin karşılaştırmalı analizi
  const allSubjectStats = subjects.map(sub => {
    const stats = calculateSubjectStats(sub.id);
    return {
      ...sub,
      stats
    };
  });

  // En güçlü ve en çok gelişim potansiyeli olan dersler
  const sortedBySuccess = [...allSubjectStats].sort((a, b) => b.stats.avgSuccessRate - a.stats.avgSuccessRate);
  const strongestSubject = sortedBySuccess[0];
  const prioritySubject = sortedBySuccess[sortedBySuccess.length - 1];

  // Maarif Modeli 11. Sınıf Konu Başlıkları
  const getMaarifTopicsForSubject = (subId) => {
    if (subId.includes('matematik')) return MAARIF_11_TOPICS.matematik;
    if (subId.includes('edebiyat') || subId.includes('turkce')) return MAARIF_11_TOPICS.edebiyat;
    if (subId.includes('tarih') || subId.includes('sosyal')) return MAARIF_11_TOPICS.tarih;
    if (subId.includes('cografya')) return MAARIF_11_TOPICS.cografya;
    return ['Bağlam Temelli Sorular', 'Veri Analizi', 'Problem Çözme', 'Kavram Haritaları'];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ÜST SEKME: 1. AŞAMA VS 2. AŞAMA SEÇİMİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
              Eşit Ağırlık Ayrıntılı Ders Analizi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedStage === 'TYT' ? '1. Aşama (TYT) 120 Soru' : '2. Aşama (AYT Eşit Ağırlık) 80 Soru'} • Ders bazlı grafikler ve hata dağılımları
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => handleStageTab('TYT')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                selectedStage === 'TYT'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Aşama (TYT)</span>
            </button>
            <button
              onClick={() => handleStageTab('AYT')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                selectedStage === 'AYT'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-300'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Aşama (AYT EA)</span>
            </button>
          </div>
        </div>

        {/* Ders Seçici Butonları (Yatay Kaydırma) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map((sub) => {
            const stats = calculateSubjectStats(sub.id);
            const isSelected = activeSubjectId === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectId(sub.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  ></span>
                  <span className="text-xs sm:text-sm font-bold">{sub.name}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-xs font-black ${isSelected ? 'text-indigo-300' : 'text-indigo-600'}`}>
                    {stats.avgNet.toFixed(1)} Net Ort.
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    %{stats.avgSuccessRate.toFixed(0)} Başarı
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DERSLER ARASI KARŞILAŞTIRMALI PERFORMANS MATRİSİ (Aşamadaki Tüm Dersler) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              {selectedStage === 'TYT' ? '1. Aşama (TYT)' : '2. Aşama (AYT)'} Dersler Arası Karşılaştırma Matrisi
            </h3>
            <p className="text-xs text-slate-500">
              Aşamadaki tüm derslerin net başarı yüzdeleri ve soru verimliliği kıyaslaması
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            {strongestSubject && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                En Güçlü: {strongestSubject.name} (%{strongestSubject.stats.avgSuccessRate.toFixed(0)})
              </span>
            )}
            {prioritySubject && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                Öncelikli Gelişim: {prioritySubject.name}
              </span>
            )}
          </div>
        </div>

        {/* Karşılaştırmalı İlerleme Çubukları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allSubjectStats.map((item) => {
            const isCurrent = item.id === activeSubjectId;
            const pct = item.stats.avgSuccessRate;

            return (
              <div
                key={item.id}
                onClick={() => setActiveSubjectId(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isCurrent 
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.questionCount} Soru</span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xl font-black text-slate-900">
                    {item.stats.avgNet.toFixed(1)} <span className="text-xs text-slate-400 font-medium">Net</span>
                  </span>
                  <span className="text-xs font-black text-indigo-700">
                    %{pct.toFixed(0)}
                  </span>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, pct))}%`,
                      backgroundColor: item.color || '#4f46e5'
                    }}
                  ></div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>En Yüksek: <b className="text-slate-800">{item.stats.maxNet.toFixed(1)}</b></span>
                  <span className={item.stats.trend >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {item.stats.trend > 0 ? `+${item.stats.trend.toFixed(1)}` : item.stats.trend.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SEÇİLİ DERSİN DETAYLI 4 METRİK KARTI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Kart 1: Ortalama Net */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Ortalama Net
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">
              {activeStats.avgNet.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              / {activeStats.avgQuestions.toFixed(0)} Soru
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Tüm girilen denemelerdeki ders net ortalaması
          </p>
        </div>

        {/* Kart 2: Başarı Oranı */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Başarı Oranı (%)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              %{activeStats.avgSuccessRate.toFixed(1)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, activeStats.avgSuccessRate))}%` }}
            ></div>
          </div>
        </div>

        {/* Kart 3: Doğruluk / Verimlilik Oranı */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Cevap Verimliliği
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">
              %{activeStats.efficiencyRate.toFixed(1)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            İşaretlenen soruların doğru çıkma oranı
          </p>
        </div>

        {/* Kart 4: Son Deneme Net Değişimi */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Son Deneme Değişimi
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl sm:text-2xl font-black ${activeStats.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {activeStats.trend > 0 ? `+${activeStats.trend.toFixed(2)}` : activeStats.trend.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Net</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {activeStats.trend >= 0 ? 'Önceki denemeye göre artışta 🚀' : 'Bu denemede küçük bir gerileme var'}
          </p>
        </div>

      </div>

      {/* 4. SEÇİLİ DERSİN ZAMAN İÇİNDEKİ NET GELİŞİM ÇİZGİ GRAFİĞİ (SVG Timeline Chart) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              {activeSubjectInfo.name} Net Gelişim Trendi
            </h3>
            <p className="text-xs text-slate-500">
              Sınav sınav kronolojik net yükselişi ve ders ortalaması karşılaştırması
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              Sınav Neti
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400"></span>
              Ders Ortalaması ({activeStats.avgNet.toFixed(1)})
            </span>
          </div>
        </div>

        {activeStats.records.length > 0 ? (
          <div className="w-full relative">
            <div className="w-full h-60 sm:h-64">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="subjectNetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="subShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Kılavuz Çizgileri */}
                {(() => {
                  const maxVal = Math.max(...activeStats.records.map(r => r.questionCount || 40), 20);
                  const step = maxVal <= 20 ? 5 : maxVal <= 30 ? 10 : 10;
                  const lines = [];
                  for (let v = 0; v <= maxVal; v += step) {
                    lines.push(v);
                  }

                  return lines.map((val, idx) => {
                    const y = 185 - (val / maxVal) * 155;
                    return (
                      <g key={idx}>
                        <line x1="45" y1={y} x2="585" y2={y} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
                        <text x="15" y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold">
                          {val}
                        </text>
                      </g>
                    );
                  });
                })()}

                {/* Veri Çizimi */}
                {(() => {
                  const records = activeStats.records;
                  const maxVal = Math.max(...records.map(r => r.questionCount || 40), 20);
                  const N = records.length;

                  const getX = (idx) => {
                    if (N <= 1) return 300;
                    return 55 + (idx / (N - 1)) * 520;
                  };

                  const getY = (net) => {
                    const clamped = Math.max(0, Math.min(maxVal, net));
                    return 185 - (clamped / maxVal) * 155;
                  };

                  const points = records.map((r, i) => ({
                    ...r,
                    x: getX(i),
                    y: getY(r.net)
                  }));

                  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
                  const areaStr = points.length > 0 
                    ? `M ${points[0].x},185 L ${pointsStr} L ${points[points.length - 1].x},185 Z`
                    : '';

                  // Ortalama Çizgisi
                  const avgY = getY(activeStats.avgNet);

                  return (
                    <g>
                      {/* Ortalama Kesikli Çizgisi */}
                      <line 
                        x1="45" 
                        y1={avgY} 
                        x2="585" 
                        y2={avgY} 
                        stroke="#94a3b8" 
                        strokeWidth="1.5" 
                        strokeDasharray="5 5" 
                      />

                      {/* Alan Dolgusu */}
                      {areaStr && <path d={areaStr} fill="url(#subjectNetGrad)" />}

                      {/* Ana Çizgi */}
                      {points.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#4f46e5"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsStr}
                        />
                      )}

                      {/* Noktalar ve Rozetler */}
                      {points.map((pt, i) => {
                        const isSelected = activeExamDetail && activeExamDetail.examId === pt.examId;
                        const badgeW = 44;
                        const badgeH = 18;
                        const badgeY = pt.y - 25;

                        return (
                          <g 
                            key={i} 
                            className="cursor-pointer group"
                            onClick={() => setActiveExamDetail(pt)}
                          >
                            <circle cx={pt.x} cy={pt.y} r={isSelected ? 8 : 6} fill="#4f46e5" fillOpacity="0.2" />
                            <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />

                            {/* Rozet */}
                            <rect
                              x={pt.x - badgeW / 2}
                              y={badgeY}
                              width={badgeW}
                              height={badgeH}
                              rx="5"
                              fill="#4f46e5"
                              filter="url(#subShadow)"
                            />
                            <text
                              x={pt.x}
                              y={badgeY + 12.5}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="9.5"
                              fontWeight="bold"
                            >
                              {pt.net.toFixed(1)}
                            </text>

                            {/* Tarih Etiketi */}
                            <text
                              x={pt.x}
                              y="205"
                              textAnchor="middle"
                              fill="#64748b"
                              fontSize="10"
                              fontWeight="600"
                            >
                              {pt.date ? pt.date.slice(5) : ''}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}

              </svg>
            </div>

            {/* Tıklanan Sınav Detayı */}
            {activeExamDetail && (
              <div className="mt-4 p-3.5 bg-slate-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                <div>
                  <span className="font-extrabold text-slate-900 block">{activeExamDetail.examTitle}</span>
                  <span className="text-[11px] text-slate-500">Tarih: {activeExamDetail.date} • {activeExamDetail.institution || 'Deneme'}</span>
                </div>
                <div className="flex items-center gap-3 font-bold">
                  <span className="text-emerald-700">{activeExamDetail.correct} Doğru</span>
                  <span className="text-rose-700">{activeExamDetail.wrong} Yanlış</span>
                  <span className="text-amber-700">{activeExamDetail.blank} Boş</span>
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black">
                    {activeExamDetail.net.toFixed(2)} Net
                  </span>
                  <button onClick={() => setActiveExamDetail(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Bu ders için henüz deneme sonucu girilmedi.
          </div>
        )}
      </div>

      {/* 5. DOĞRU, YANLIŞ VE BOŞ DAĞILIM ANALİZİ (HATA VE VERİMLİLİK İNCELEMESİ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Doğru Oranı */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2 text-emerald-900">
            <span className="text-xs font-bold uppercase tracking-wider">Ortalama Doğru</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-emerald-950">
            {activeStats.avgCorrect.toFixed(1)} <span className="text-sm font-bold text-emerald-800">Soru</span>
          </span>
          <p className="text-xs text-emerald-800 mt-2 font-medium">
            Toplam soru havuzunda doğru cevaplama oranı <b>%{activeStats.avgSuccessRate.toFixed(1)}</b> seviyesindedir.
          </p>
        </div>

        {/* Yanlış Oranı & Net Kaybı */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2 text-rose-900">
            <span className="text-xs font-bold uppercase tracking-wider">Ortalama Yanlış</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <span className="text-3xl font-black text-rose-950">
            {activeStats.avgWrong.toFixed(1)} <span className="text-sm font-bold text-rose-800">Soru</span>
          </span>
          <p className="text-xs text-rose-800 mt-2 font-medium">
            ÖSYM 4 yanlış 1 doğru kuralı ile her denemede ortalama <b>-{(activeStats.avgWrong * 0.25).toFixed(2)} Net</b> kaybına yol açıyor.
          </p>
        </div>

        {/* Boş Bırakma Oranı */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2 text-amber-900">
            <span className="text-xs font-bold uppercase tracking-wider">Ortalama Boş</span>
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-3xl font-black text-amber-950">
            {activeStats.avgBlank.toFixed(1)} <span className="text-sm font-bold text-amber-800">Soru</span>
          </span>
          <p className="text-xs text-amber-800 mt-2 font-medium">
            Şüpheli ve çelişkili soruları boş bırakmak negatif net kaybını önlemektedir.
          </p>
        </div>

      </div>

      {/* 6. DENEME BAZLI AYRINTILI GEÇMİŞ LİSTESİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {activeSubjectInfo.name} Deneme Sınavları Kayıt Tablosu
            </h3>
            <p className="text-xs text-slate-500">
              Tüm denemelerde {activeSubjectInfo.name} dersinde elde ettiğin ayrıntılı soru ve net dökümü
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            {activeStats.records.length} Sınav
          </span>
        </div>

        {activeStats.records.length > 0 ? (
          <div className="space-y-3">
            {[...activeStats.records].reverse().map((rec, i) => {
              const maxPossible = rec.questionCount || 40;
              const netPct = maxPossible > 0 ? (rec.net / maxPossible) * 100 : 0;

              return (
                <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-indigo-200 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {rec.examTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({rec.date})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-emerald-700">{rec.correct} D</span>
                      <span className="text-rose-700">{rec.wrong} Y</span>
                      <span className="text-amber-700">{rec.blank} B</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-black">
                        {rec.net.toFixed(2)} Net
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({rec.questionCount} Soru • %{netPct.toFixed(0)})
                      </span>
                    </div>
                  </div>

                  {/* Renkli Dağılım Çubuğu */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(rec.correct / maxPossible) * 100}%` }}
                      title={`Doğru: ${rec.correct}`}
                    ></div>
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(rec.wrong / maxPossible) * 100}%` }}
                      title={`Yanlış: ${rec.wrong}`}
                    ></div>
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(rec.blank / maxPossible) * 100}%` }}
                      title={`Boş: ${rec.blank}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            Bu ders için henüz deneme sonucu girilmedi.
          </div>
        )}
      </div>

      {/* 7. MAARİF MODELİ 11. SINIF TEMATİK REHBERLİK & KOÇLUK PANELİ */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-3xl p-5 sm:p-7 border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              11. Sınıf Maarif Modeli Kazanım & Koçluk Rehberi
            </h3>
            <p className="text-xs text-slate-500">
              Emir için {activeSubjectInfo.name} dersinde en çok soru gelen ve dikkat edilmesi gereken kritik konular
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {getMaarifTopicsForSubject(activeSubjectInfo.id).map((topic, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {topic}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Maarif modeli analitik düşünme, metin analizi ve yeni nesil soru kazanımı.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Koç Tavsiyesi */}
        <div className="mt-5 p-4 rounded-2xl bg-white border border-indigo-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-extrabold text-slate-900 block mb-1">
              Koçun Notu (Emir'e Özel Tavsiye):
            </span>
            {activeSubjectInfo.id.includes('matematik') ? (
              <p>
                11. sınıf Eşit Ağırlıkta <b>Trigonometri</b> ve <b>Analitik Geometri</b> AYT Matematik'in omurgasını oluşturur. Maarif modelinde integrali ezberlemek yerine fonksiyonel modellemelere ve parabol mantığına ağırlık ver. Her gün en az 15-20 yeni nesil problem çöz.
              </p>
            ) : activeSubjectInfo.id.includes('edebiyat') ? (
              <p>
                Edebiyatta ezber yerine <b>metin üzerinden dönem ve akım tahlili</b> ön plana çıkıyor. Tanzimat ve Servet-i Fünun dönemi yazarlarını eser-şahıs-tema eşleştirmeleriyle kodlayarak çalış.
              </p>
            ) : activeSubjectInfo.id.includes('tarih') || activeSubjectInfo.id.includes('cografya') ? (
              <p>
                Tarih-1 ve Coğrafya-1 soruları doğrudan kavram ve harita okuryazarlığı istiyor. Harita üzerinde Türkiye ekonomi politikalarını ve nüfus dağılışlarını görsel olarak tekrar et.
              </p>
            ) : (
              <p>
                Türkçe paragraf sorularında hız kazanmak için günde en az 25 paragraf sorusunu kronometre tutarak çöz. TYT Türkçe'de 30+ net bandına ulaşmak tüm puanı yukarı çekecektir.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
