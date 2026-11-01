import React, { useState } from 'react';
import { 
  BarChart2, TrendingUp, AlertTriangle, CheckCircle2, 
  Sparkles, BookOpen, Layers, Award, Target, HelpCircle 
} from 'lucide-react';
import { EXAM_STAGES, MAARIF_11_TOPICS } from '../data/examStructure';

export default function SubjectAnalysis({ exams }) {
  const [selectedStage, setSelectedStage] = useState('TYT'); // 'TYT' or 'AYT'
  const [activeSubjectId, setActiveSubjectId] = useState('tyt_turkce');

  // Mevcut aşamadaki dersler
  const currentStageInfo = EXAM_STAGES[selectedStage] || EXAM_STAGES.TYT;
  const subjects = currentStageInfo.subjects;

  // Seçilen aşama değiştiğinde aktif dersi de varsayılana çek
  const handleStageTab = (stageKey) => {
    setSelectedStage(stageKey);
    if (stageKey === 'TYT') setActiveSubjectId('tyt_turkce');
    if (stageKey === 'AYT') setActiveSubjectId('ayt_matematik');
  };

  // İlgili aşamadaki denemeleri al (1. Aşama ve 2. Aşama bağımsız yapılır)
  const stageExams = exams.filter(e => e.stage === selectedStage);

  // Ders istatistiklerini hesapla
  const calculateSubjectStats = (subId) => {
    const records = [];
    stageExams.forEach(exam => {
      if (exam.subjects && exam.subjects[subId]) {
        records.push({
          examTitle: exam.title,
          date: exam.date,
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

    // Trend: Son deneme vs bir önceki
    let trend = 0;
    if (records.length >= 2) {
      trend = (records[0].net || 0) - (records[1].net || 0);
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
      trend
    };
  };

  const activeSubjectInfo = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const activeStats = calculateSubjectStats(activeSubjectInfo.id);

  // Maarif Modeli 11. Sınıf Konu Başlıkları
  const getMaarifTopicsForSubject = (subId) => {
    if (subId.includes('matematik')) return MAARIF_11_TOPICS.matematik;
    if (subId.includes('edebiyat') || subId.includes('turkce')) return MAARIF_11_TOPICS.edebiyat;
    if (subId.includes('tarih') || subId.includes('sosyal')) return MAARIF_11_TOPICS.tarih;
    if (subId.includes('cografya')) return MAARIF_11_TOPICS.cografya;
    return ['Bağlam Temelli Sorular', 'Veri Analizi', 'Problem Çözme'];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Üst Sekme: 1. Aşama vs 2. Aşama Seçimi */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
              Eşit Ağırlık Ders Bazlı Performans Analizi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Maarif modeline göre 1. ve 2. aşamada çözdüğün derslerin gelişim ve net istatistikleri
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => handleStageTab('TYT')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
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
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                selectedStage === 'AYT'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-300'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Aşama (AYT - EA)</span>
            </button>
          </div>
        </div>

        {/* Ders Seçici Butonları (Yatay Kaydırma) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map((sub) => {
            const stats = calculateSubjectStats(sub.id);
            const isSelected = activeSubjectId === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectId(sub.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
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

      {/* 2. Seçili Dersin Detaylı Metrikleri */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
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
            Tüm girilen denemelerdeki ders ortalaması
          </p>
        </div>

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

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            En Yüksek / En Düşük Net
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {activeStats.maxNet.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ min {activeStats.minNet.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Kişisel rekor ve taban net aralığı
          </p>
        </div>

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
            {activeStats.trend >= 0 ? 'Yükseliş trendi devam ediyor' : 'Bu denemede küçük bir gerileme var'}
          </p>
        </div>

      </div>

      {/* 3. DERS NET GELİŞİM GRAFİĞİ (Bar Chart) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              {activeSubjectInfo.name} Deneme Net Geçmişi
            </h3>
            <p className="text-xs text-slate-500">
              Her denemede elde edilen netler ve soru sayılarına göre performans dağılımı
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
            {activeStats.records.length} Sınav Kaydı
          </span>
        </div>

        {activeStats.records.length > 0 ? (
          <div className="space-y-3">
            {[...activeStats.records].reverse().map((rec, i) => {
              const maxPossible = rec.questionCount || 40;
              const netPct = maxPossible > 0 ? (rec.net / maxPossible) * 100 : 0;

              return (
                <div key={i} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-indigo-200 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
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
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-black">
                        {rec.net.toFixed(2)} Net
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (Top. {rec.questionCount} Soru)
                      </span>
                    </div>
                  </div>

                  {/* Görsel İlerleme Çubuğu */}
                  <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden flex">
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

      {/* 4. MAARİF MODELİ 11. SINIF TEMATİK REHBERLİK & KOÇLUK PANELİ */}
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
              Emir için {activeSubjectInfo.name} dersinde en çok soru gelen ve dikkat edilmesi gereken konular
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
