import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Award, Target, BookOpen, Clock, Calendar, 
  ChevronRight, Sparkles, AlertCircle, Share2, Edit2, Trash2, 
  CheckCircle, ArrowUpRight, ArrowDownRight, Layers, HelpCircle,
  Calculator, GraduationCap, X, ExternalLink, Search, Info, Check
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { 
  calculateObp, 
  calculateEaScore, 
  estimateEaRanking, 
  extractNetsFromExams,
  calculateIndividualExamScore 
} from '../services/yksScoreCalculator';
import { YOK_ATLAS_PROGRAMS } from '../data/yokAtlasData';
import { getProgramMultiYearData, evaluateProgramSafety } from '../services/yokAtlasAnalysis';
import MultiYearRankPopover from './MultiYearRankPopover';

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
  const [chartView, setChartView] = useState('ALL'); // 'ALL', 'TYT', 'AYT'
  const [activeChartExam, setActiveChartExam] = useState(null);
  const [examReportModal, setExamReportModal] = useState(null);
  const [pairedExamId, setPairedExamId] = useState('AVERAGE'); // 'AVERAGE' or specific exam ID
  const [modalActiveTab, setModalActiveTab] = useState('ELIGIBLE'); // 'ELIGIBLE', 'TREND_RISK', 'ALL'
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [reportScenario, setReportScenario] = useState('WEIGHTED_AVG'); // 'WEIGHTED_AVG', 'LATEST_2025', 'PEAK_SAFE'

  // Öğrenci Ayarları (Diploma Notu)
  const settings = StorageService.getSettings();
  const obpInfo = useMemo(() => {
    return calculateObp(settings.diplomaGrade || 88.5, settings.isObpBroken || false);
  }, [settings.diplomaGrade, settings.isObpBroken]);

  // Deneme Ortalamalarından YKS EA Puanı ve Sıralama Tahmini
  const calculatedYksStats = useMemo(() => {
    const extracted = extractNetsFromExams(exams, 'AVERAGE');
    const hasAyt = extracted.ayt.examCount > 0;
    // Eğer öğrencinin henüz AYT denemesi yoksa, 11. Sınıf EA standart hedefi (40 Net: Mat 16, Ede 15, Tar 6, Coğ 3) simüle edilir
    const effectiveAyt = hasAyt 
      ? extracted.ayt 
      : { aytMatematik: 16.0, aytEdebiyat: 15.0, aytTarih1: 6.0, aytCografya1: 3.0, examCount: 0 };
    const eaResult = calculateEaScore(extracted.tyt, effectiveAyt, obpInfo.contribution);
    const ranking = estimateEaRanking(eaResult.placementScore);
    return {
      eaResult,
      ranking,
      extracted,
      isAytSimulated: !hasAyt
    };
  }, [exams, obpInfo]);

  // Sınav Rapor Modalı Açma Yardımcısı
  const handleOpenExamReport = (exam) => {
    setExamReportModal(exam);
    setPairedExamId('AVERAGE');
    setModalActiveTab('ELIGIBLE');
    setModalSearchQuery('');
  };

  // İncelenen sınavın girebileceği bölümleri ve 1. + 2. Aşama birleşik puanını hesapla
  const examReportData = useMemo(() => {
    if (!examReportModal) return null;

    const isTyt = examReportModal.stage === 'TYT';
    const complementaryExams = exams.filter(e => isTyt ? e.stage === 'AYT' : e.stage === 'TYT');

    let customPairedNets = null;
    let customPairedLabel = '';

    // Henüz AYT denemesi girilmemişse zengin hedef simülasyonları sun
    if (isTyt && complementaryExams.length === 0) {
      if (pairedExamId === 'SIM_50') {
        customPairedNets = { aytMatematik: 22.0, aytEdebiyat: 18.0, aytTarih1: 6.5, aytCografya1: 3.5 };
        customPairedLabel = '11. Sınıf İleri Hedef AYT Simülasyonu (50.0 Net)';
      } else if (pairedExamId === 'SIM_30') {
        customPairedNets = { aytMatematik: 12.0, aytEdebiyat: 11.0, aytTarih1: 4.5, aytCografya1: 2.5 };
        customPairedLabel = '11. Sınıf Başlangıç Hedef AYT Simülasyonu (30.0 Net)';
      } else if (pairedExamId === 'SIM_60') {
        customPairedNets = { aytMatematik: 28.0, aytEdebiyat: 21.0, aytTarih1: 7.5, aytCografya1: 3.5 };
        customPairedLabel = 'EA Zirve / İlk 5 Bin Hedef AYT Simülasyonu (60.0 Net)';
      } else {
        // AVERAGE varsayılanı (40.0 Net)
        customPairedNets = { aytMatematik: 16.0, aytEdebiyat: 15.0, aytTarih1: 6.0, aytCografya1: 3.0 };
        customPairedLabel = '11. Sınıf EA Standart Hedef AYT Simülasyonu (40.0 Net)';
      }
    } else if (pairedExamId !== 'AVERAGE') {
      const selectedPair = exams.find(e => e.id === pairedExamId);
      if (selectedPair) {
        if (isTyt) {
          customPairedNets = {
            aytMatematik: selectedPair.subjects?.ayt_matematik?.net || 0,
            aytEdebiyat: selectedPair.subjects?.ayt_edebiyat?.net || 0,
            aytTarih1: selectedPair.subjects?.ayt_tarih1?.net || 0,
            aytCografya1: selectedPair.subjects?.ayt_cografya1?.net || 0,
          };
          customPairedLabel = `${selectedPair.title} (${selectedPair.totalNet.toFixed(1)} Net)`;
        } else {
          customPairedNets = {
            tytTurkce: selectedPair.subjects?.tyt_turkce?.net || 0,
            tytMatematik: selectedPair.subjects?.tyt_matematik?.net || 0,
            tytSosyal: selectedPair.subjects?.tyt_sosyal?.net || 0,
            tytFen: selectedPair.subjects?.tyt_fen?.net || 0,
          };
          customPairedLabel = `${selectedPair.title} (${selectedPair.totalNet.toFixed(1)} Net)`;
        }
      }
    }

    const perf = calculateIndividualExamScore(
      examReportModal, 
      exams, 
      settings.diplomaGrade, 
      settings.isObpBroken,
      customPairedNets,
      customPairedLabel
    );

    const userRank = perf.ranking.midRank;

    // Tüm YÖK Atlas programlarını çok yıllı gerçekçi modele göre değerlendir (2025, 2024, 2023)
    const allMapped = YOK_ATLAS_PROGRAMS.map(prog => {
      return evaluateProgramSafety(prog, userRank, reportScenario);
    }).sort((a, b) => (a.effectiveRank || a.rank) - (b.effectiveRank || b.rank));

    // Arama filtrelemesi
    const query = modalSearchQuery.trim().toLowerCase();
    const searchFiltered = query 
      ? allMapped.filter(p => 
          p.university.toLowerCase().includes(query) ||
          p.department.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          String(p.kilavuzKodu).includes(query)
        )
      : allMapped;

    // Kazanabileceği ve Hedefteki Bölümler (Garanti + Hedef)
    let eligibleList = searchFiltered.filter(p => p.status === 'GARANTI' || p.status === 'HEDEF');
    // Eğer filtre araması yoksa ve hiçbir bölüm eşleşmemişse, öğrencinin sıralamasına en yakın bölümleri göster
    if (eligibleList.length === 0 && !query) {
      eligibleList = [...allMapped].sort((a, b) => Math.abs((a.effectiveRank || a.rank) - userRank) - Math.abs((b.effectiveRank || b.rank) - userRank)).slice(0, 10);
    }

    const guaranteed = searchFiltered.filter(p => p.status === 'GARANTI');
    const targets = searchFiltered.filter(p => p.status === 'HEDEF');
    const trendRisks = searchFiltered.filter(p => p.status === 'TREND_RISK');
    const reach = searchFiltered.filter(p => p.status === 'GAYRET');

    return {
      perf,
      userRank,
      complementaryExams,
      allMapped: searchFiltered,
      totalDatabaseCount: YOK_ATLAS_PROGRAMS.length,
      eligibleList,
      guaranteed,
      targets,
      trendRisks,
      reach,
      pairedLabel: perf.pairedLabel
    };
  }, [examReportModal, exams, settings.diplomaGrade, settings.isObpBroken, pairedExamId, modalSearchQuery, reportScenario]);

  // Filtrelenmiş denemeler
  const filteredExams = exams.filter(e => {
    if (filterStage === 'ALL') return true;
    return e.stage === filterStage;
  });

  // TYT ve AYT denemelerini ayır
  const tytExams = exams.filter(e => e.stage === 'TYT');
  const aytExams = exams.filter(e => e.stage === 'AYT');

  // Kronolojik sıralı denemeler (Grafik için: Eskiden Yeniye, Soldan Sağa)
  const chronologicalExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chronologicalTyt = [...tytExams].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chronologicalAyt = [...aytExams].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Son denemeler (En yeni denemeler)
  const latestTyt = chronologicalTyt.length > 0 ? chronologicalTyt[chronologicalTyt.length - 1] : null;
  const latestAyt = chronologicalAyt.length > 0 ? chronologicalAyt[chronologicalAyt.length - 1] : null;
  const previousTyt = chronologicalTyt.length > 1 ? chronologicalTyt[chronologicalTyt.length - 2] : null;
  const previousAyt = chronologicalAyt.length > 1 ? chronologicalAyt[chronologicalAyt.length - 2] : null;

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

      {/* 2. CANLI YKS PUANI, TAHMİNİ SIRALAMA & DİPLOMA NOTU KARTI */}
      <div 
        onClick={() => onNavigateToTab('calculator')}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 p-5 sm:p-6 text-white shadow-lg cursor-pointer hover:border-indigo-500/50 transition group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 text-amber-300 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  ÖSYM YKS Eşit Ağırlık Puanı & Sıralama
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  {calculatedYksStats.ranking.percentile}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {calculatedYksStats.eaResult.placementScore.toFixed(3)}
                </span>
                <span className="text-xs text-indigo-300 font-bold">
                  Yerleştirme Puanı (Y-EA)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-amber-300 uppercase block">Tahmini EA Sıralaması</span>
              <span className="text-base sm:text-lg font-black text-amber-400 block">
                {calculatedYksStats.ranking.rankString}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Diploma: {obpInfo.diplomaGrade} (+{obpInfo.contribution} OBP)
              </span>
              {calculatedYksStats.isAytSimulated && (
                <span className="text-[9.5px] text-indigo-300 block mt-0.5">
                  💡 11. Sınıf EA Hedefi (40 Net AYT) ile
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToTab('calculator');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition"
            >
              <span>Hesapla</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Hızlı Metrik Kartları (Grid) */}
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
            <span className="text-xs text-slate-400 font-semibold">
              {latestAyt ? 'Net (Son)' : 'Henüz Girilmedi'}
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 font-medium pt-2 border-t border-slate-100">
            {latestAyt ? (
              <>
                <span>Ortalama: <b className="text-slate-800">{avgAytNet}</b></span>
                {aytDiff !== null && (
                  <span className={`inline-flex items-center font-bold ${parseFloat(aytDiff) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {parseFloat(aytDiff) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {aytDiff > 0 ? `+${aytDiff}` : aytDiff}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-slate-400 font-medium">11. Sınıf Müfredatı</span>
                <button
                  onClick={onOpenAddModal}
                  className="text-purple-600 font-bold hover:underline"
                >
                  + Deneme Ekle
                </button>
              </>
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
          <div className="mt-2 text-[11px] text-amber-900 font-semibold flex items-center justify-between gap-1 pt-2 border-t border-amber-200/60">
            {targetProgram ? (
              <>
                <span className="inline-flex items-center gap-1 font-mono">
                  <span className="font-sans">2025:</span>
                  <b>#{targetProgram.rank.toLocaleString()}</b>
                  <MultiYearRankPopover program={targetProgram} align="right" />
                </span>
                <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5">
                  Analiz <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </>
            ) : (
              <>
                <span>YÖK Atlas Net Analizi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
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
              Kronolojik sıralı (Eskiden Yeniye) 1. Aşama (TYT) ve 2. Aşama (AYT) gelişim grafiği
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Görünüm Filtresi */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setChartView('ALL')}
                className={`px-3 py-1 rounded-lg transition ${chartView === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tümü (Birleşik)
              </button>
              <button
                onClick={() => setChartView('TYT')}
                className={`px-3 py-1 rounded-lg transition ${chartView === 'TYT' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                1. Aşama (TYT)
              </button>
              <button
                onClick={() => setChartView('AYT')}
                className={`px-3 py-1 rounded-lg transition ${chartView === 'AYT' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                2. Aşama (AYT)
              </button>
            </div>
          </div>
        </div>

        {/* Gösterge Açıklamaları */}
        <div className="flex items-center gap-4 text-xs font-semibold mb-4 px-2">
          {(chartView === 'ALL' || chartView === 'TYT') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-300"></span>
              <span className="text-slate-700">1. Aşama (TYT - 120 Soru)</span>
            </div>
          )}
          {(chartView === 'ALL' || chartView === 'AYT') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 shadow-sm shadow-purple-300"></span>
              <span className="text-slate-700">2. Aşama (AYT EA - 80 Soru)</span>
            </div>
          )}
        </div>

        {/* Görsel SVG Çizgi Grafiği */}
        {exams.length > 0 ? (
          <div className="w-full relative">
            <div className="w-full h-64 sm:h-72">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 620 250" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tytGradClean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="aytGradClean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Yatay Kılavuz Çizgileri ve Ölçek */}
                {[0, 25, 50, 75, 100].map((val, idx) => {
                  const y = 210 - (val / 100) * 175;
                  return (
                    <g key={idx}>
                      <line x1="45" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
                      <text x="15" y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Dinamik Kronolojik Zaman Çizelgesi Hesaplaması */}
                {(() => {
                  // İlgili görünüme göre denemeleri belirle
                  const activeExams = chartView === 'TYT' 
                    ? chronologicalTyt 
                    : chartView === 'AYT' 
                      ? chronologicalAyt 
                      : chronologicalExams;

                  if (activeExams.length === 0) return null;

                  // Benzersiz sıralı tarihler
                  const uniqueDates = Array.from(new Set(activeExams.map(e => e.date))).sort();

                  const getX = (dateStr) => {
                    if (uniqueDates.length <= 1) return 310;
                    const dateIdx = uniqueDates.indexOf(dateStr);
                    return 55 + (dateIdx / (uniqueDates.length - 1)) * 530;
                  };

                  const getY = (net, maxQuestions = 120) => {
                    const pct = Math.min(100, Math.max(0, (net / maxQuestions) * 100));
                    return 210 - (pct / 100) * 175;
                  };

                  // TYT Noktaları
                  const showTyt = chartView === 'ALL' || chartView === 'TYT';
                  const tytList = chronologicalTyt;
                  const tytCoords = tytList.map(e => ({
                    exam: e,
                    x: getX(e.date),
                    y: getY(e.totalNet, 120)
                  }));

                  // AYT Noktaları
                  const showAyt = chartView === 'ALL' || chartView === 'AYT';
                  const aytList = chronologicalAyt;
                  const aytCoords = aytList.map(e => ({
                    exam: e,
                    x: getX(e.date),
                    y: getY(e.totalNet, 80)
                  }));

                  // SVG Polyline dizgeleri
                  const tytPointsStr = tytCoords.map(p => `${p.x},${p.y}`).join(' ');
                  const aytPointsStr = aytCoords.map(p => `${p.x},${p.y}`).join(' ');

                  const tytArea = tytCoords.length > 0 
                    ? `M ${tytCoords[0].x},210 L ${tytPointsStr} L ${tytCoords[tytCoords.length - 1].x},210 Z`
                    : '';
                  const aytArea = aytCoords.length > 0
                    ? `M ${aytCoords[0].x},210 L ${aytPointsStr} L ${aytCoords[aytCoords.length - 1].x},210 Z`
                    : '';

                  return (
                    <g>
                      {/* Tarih Etiketleri (X Ekseni) */}
                      {uniqueDates.map((d, idx) => {
                        const x = getX(d);
                        const parts = d.split('-');
                        const formattedDate = `${parts[2]}/${parts[1]}`;
                        return (
                          <g key={idx}>
                            <line x1={x} y1="210" x2={x} y2="216" stroke="#cbd5e1" strokeWidth="1.5" />
                            <text x={x} y="232" textAnchor="middle" fill="#64748b" fontSize="10.5" fontWeight="600">
                              {formattedDate}
                            </text>
                          </g>
                        );
                      })}

                      {/* TYT Çizgisi ve Alanı */}
                      {showTyt && tytCoords.length > 0 && (
                        <g>
                          {tytArea && <path d={tytArea} fill="url(#tytGradClean)" />}
                          {tytCoords.length > 1 && (
                            <polyline
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={tytPointsStr}
                            />
                          )}
                          {tytCoords.map((pt, i) => {
                            const isSelected = activeChartExam && activeChartExam.id === pt.exam.id;
                            // Badge Y konumu (TYT üstte yer alır)
                            const badgeY = pt.y - 26;
                            const badgeW = 46;
                            const badgeH = 19;

                            return (
                              <g 
                                key={`tyt-${i}`} 
                                className="cursor-pointer group"
                                onClick={() => setActiveChartExam(pt.exam)}
                              >
                                {/* Dış Halka */}
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isSelected ? 8 : 6} 
                                  fill="#4f46e5" 
                                  fillOpacity="0.2" 
                                />
                                {/* İç Nokta */}
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r="4" 
                                  fill="#ffffff" 
                                  stroke="#4f46e5" 
                                  strokeWidth="2.5" 
                                />
                                
                                {/* Şık ve Temiz Rozet (Kaba yazım şekli kaldırıldı) */}
                                <rect
                                  x={pt.x - badgeW / 2}
                                  y={badgeY}
                                  width={badgeW}
                                  height={badgeH}
                                  rx="6"
                                  fill="#4f46e5"
                                  filter="url(#badgeShadow)"
                                />
                                <text
                                  x={pt.x}
                                  y={badgeY + 13}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize="10"
                                  fontWeight="800"
                                  letterSpacing="0.2px"
                                >
                                  {pt.exam.totalNet.toFixed(1)}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* AYT Çizgisi ve Alanı */}
                      {showAyt && aytCoords.length > 0 && (
                        <g>
                          {aytArea && <path d={aytArea} fill="url(#aytGradClean)" />}
                          {aytCoords.length > 1 && (
                            <polyline
                              fill="none"
                              stroke="#9333ea"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="3 0"
                              points={aytPointsStr}
                            />
                          )}
                          {aytCoords.map((pt, i) => {
                            const isSelected = activeChartExam && activeChartExam.id === pt.exam.id;
                            // AYT Rozet Y konumu: TYT ile çakışmaması için ALTA konumlandırılır
                            const badgeY = pt.y + 9;
                            const badgeW = 46;
                            const badgeH = 19;

                            return (
                              <g 
                                key={`ayt-${i}`} 
                                className="cursor-pointer group"
                                onClick={() => setActiveChartExam(pt.exam)}
                              >
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isSelected ? 8 : 6} 
                                  fill="#9333ea" 
                                  fillOpacity="0.2" 
                                />
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r="4" 
                                  fill="#ffffff" 
                                  stroke="#9333ea" 
                                  strokeWidth="2.5" 
                                />

                                {/* AYT Şık Rozet */}
                                <rect
                                  x={pt.x - badgeW / 2}
                                  y={badgeY}
                                  width={badgeW}
                                  height={badgeH}
                                  rx="6"
                                  fill="#9333ea"
                                  filter="url(#badgeShadow)"
                                />
                                <text
                                  x={pt.x}
                                  y={badgeY + 13}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize="10"
                                  fontWeight="800"
                                  letterSpacing="0.2px"
                                >
                                  {pt.exam.totalNet.toFixed(1)}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      )}

                    </g>
                  );
                })()}

              </svg>
            </div>

            {/* Seçilen Deneme Detay Kartı (Tıklanınca Açılır) */}
            {activeChartExam && (
              <div className="mt-4 p-3.5 bg-slate-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${activeChartExam.stage === 'TYT' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'}`}>
                    {activeChartExam.stage}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {activeChartExam.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tarih: {activeChartExam.date} • {activeChartExam.institution || 'Deneme Sınavı'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Toplam Net</span>
                    <span className="text-sm font-black text-slate-900">{activeChartExam.totalNet.toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Doğru / Yanlış</span>
                    <span className="text-xs font-bold text-slate-700">{activeChartExam.totalCorrect} D / {activeChartExam.totalWrong} Y</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Başarı</span>
                    <span className="text-xs font-black text-indigo-600">%{activeChartExam.successPercentage || 0}</span>
                  </div>
                  <button
                    onClick={() => setActiveChartExam(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
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
                          {exam.examCode && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Kod: {exam.examCode} (Kitapçık: {exam.bookletType || 'A'})
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            exam.difficulty === 'Zor' || exam.difficulty === 'Çok Zor' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {exam.difficulty}
                          </span>
                          {exam.institutionScore && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Delta Karne: {exam.institutionScore.toFixed(3)} TYT • Sıra: {exam.institutionRank}
                            </span>
                          )}
                          
                          {/* Sınav Puanı ve Sıralama Rozeti */}
                          {(() => {
                            const perf = calculateIndividualExamScore(exam, exams, settings.diplomaGrade, settings.isObpBroken);
                            return (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                🎯 {perf.eaResult.placementScore.toFixed(1)} Puan • {perf.ranking.rankString}
                              </span>
                            );
                          })()}
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

                    {/* Sağ Taraf: Net Rozeti, Bölüm Butonu ve Aksiyonlar */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black text-indigo-700 block leading-tight">
                          {exam.totalNet.toFixed(2)} Net
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          %{exam.successPercentage?.toFixed(1) || 0} Başarı
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenExamReport(exam);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 transition active:scale-95"
                        title="Bu Sınavla Girebileceği Üniversite Bölümlerini Gör"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-300" />
                        <span className="hidden sm:inline">Kazanabileceği Bölümler</span>
                        <span className="sm:hidden">Bölümler</span>
                      </button>

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
                    <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-150">
                      
                      {/* Delta Eğitim Kurumları Resmi Karne Özeti */}
                      {exam.institutionScore && (
                        <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="font-black text-amber-300">Delta Eğitim Kurumları Karne Bilgisi:</span>
                            <span className="text-slate-300">Sınav Kodu: <b>{exam.examCode}</b> (Kitapçık: {exam.bookletType || 'A'})</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-bold flex-wrap">
                            <span>Karne TYT: <b className="text-emerald-300">{exam.institutionScore.toFixed(3)}</b></span>
                            <span>•</span>
                            <span>Kurum Ort: <b>{exam.institutionAverage?.toFixed(3)}</b></span>
                            <span>•</span>
                            <span>Genel Sıra: <b className="text-amber-300">{exam.institutionRank}</b></span>
                            <span>•</span>
                            <span>Sınıf Sıra: <b className="text-amber-300">{exam.classRank}</b></span>
                            <span>•</span>
                            <span>ÖSYM 26 Sıra: <b className="text-indigo-300">#{exam.osymEstimatedRank}</b></span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                      </div>

                      {/* Alt Branşlar (Sosyal Bilimler ve Fen Bilimleri Detayı) */}
                      {exam.subBranches && (
                        <div className="space-y-2 pt-1 border-t border-slate-200/60">
                          <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                            Karne Alt Branş Dağılımı (Sosyal & Fen)
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {exam.subBranches.sosyal && (
                              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-black text-orange-950">Sosyal Bilimler Branşları</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-900">20 Soru</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  {exam.subBranches.sosyal.map((sub, i) => (
                                    <div key={i} className="bg-white p-2.5 rounded-xl border border-orange-100 flex items-center justify-between shadow-2xs">
                                      <div>
                                        <span className="font-extrabold text-slate-800 block">{sub.name}</span>
                                        <span className="text-[10px] text-slate-400">{sub.correct}D {sub.wrong}Y {sub.blank}B</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-black text-orange-700 block">{sub.net.toFixed(2)} Net</span>
                                        {sub.rank && <span className="text-[9px] text-slate-400 font-bold">Sıra: {sub.rank}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {exam.subBranches.fen && (
                              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-black text-emerald-950">Fen Bilimleri Branşları</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">20 Soru</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px]">
                                  {exam.subBranches.fen.map((sub, i) => (
                                    <div key={i} className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between shadow-2xs">
                                      <span className="font-extrabold text-slate-800 truncate">{sub.name}</span>
                                      <span className="text-[10px] text-slate-400">{sub.correct}D {sub.wrong}Y {sub.blank}B</span>
                                      <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-baseline justify-between">
                                        <span className="font-black text-emerald-700">{sub.net.toFixed(2)} Net</span>
                                        {sub.rank && <span className="text-[9px] text-slate-400 font-bold">#{sub.rank}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

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

      {/* 5. SEÇİLEN SINAVIN YKS KARNESİ & GİREBİLECEĞİ BÖLÜMLER MODALI */}
      {examReportModal && examReportData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 my-6">
            
            {/* Modal Üst Başlığı */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${examReportModal.stage === 'TYT' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                    {examReportModal.stage === 'TYT' ? '1. Aşama (TYT)' : '2. Aşama (AYT)'}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">📅 {examReportModal.date}</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                    {examReportModal.institution || 'Genel Deneme'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white">
                  {examReportModal.title}
                </h3>
                <p className="text-xs text-indigo-200 font-medium mt-0.5">
                  Özel Sınav Karnesi & 1. ve 2. Aşama Birlikte YKS Yerleştirme Puanı & YÖK Atlas Tercih Rehberi
                </p>
              </div>

              <button
                onClick={() => setExamReportModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Gövdesi */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">

              {/* 1. KISIM: İNCELENEN SINAVIN DERS BAZLI NETLERİ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Bu Sınavın Ders Bazlı Net Sonuçları
                  </h4>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    Toplam: {examReportModal.totalNet.toFixed(2)} Net
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(examReportModal.subjects || {}).map(([key, sub]) => {
                    const cleanName = key.replace('tyt_', '').replace('ayt_', '').toUpperCase();
                    return (
                      <div key={key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/90 text-center">
                        <span className="text-[11px] font-extrabold text-slate-700 block truncate">{cleanName}</span>
                        <span className="text-base font-black text-indigo-600 block mt-0.5">{sub.net.toFixed(2)} Net</span>
                        <div className="mt-1 text-[10px] text-slate-400 font-bold flex justify-center gap-1.5 border-t border-slate-200/60 pt-1">
                          <span className="text-emerald-600">{sub.correct}D</span>
                          <span className="text-rose-600">{sub.wrong}Y</span>
                          <span className="text-amber-600">{sub.blank}B</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Eğer TYT Sınavı ise Müstakil TYT Skoru */}
                {examReportModal.stage === 'TYT' && examReportData.perf.tytResult && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-100/90 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-700">
                      🎯 TYT Müstakil Sınav Sonucu:
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span>Ham: <b className="text-slate-900">{examReportData.perf.tytResult.rawScore.toFixed(2)}</b></span>
                      <span>•</span>
                      <span>Y-TYT (OBP'li): <b className="text-indigo-700">{examReportData.perf.tytResult.placementScore.toFixed(2)}</b></span>
                      <span>•</span>
                      <span>TYT Sıralaması: <b className="text-indigo-800">{examReportData.perf.tytResult.ranking.rankString}</b> ({examReportData.perf.tytResult.ranking.percentile})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. KISIM: 1. AŞAMA VE 2. AŞAMA BİRLİKTE ÇALIŞMA MEKANİZMASI & TAMAMLAYICI EŞLEŞTİRME */}
              <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-3xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                      1. Aşama ve 2. Aşama Birlikte Çalışma Prensibi
                      <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
                        Resmi ÖSYM Kuralı
                      </span>
                    </h4>
                    <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                      YKS Eşit Ağırlık yerleştirme puanı (Y-EA) ve Türkiye sıralaması tek başına bir aşamadan hesaplanamaz. 
                      <b> 1. Aşama (TYT - %40 etki)</b> ve <b>2. Aşama (AYT - %60 etki)</b> birlikte çalışır; üzerine <b>Diploma Notu (OBP)</b> eklenir. 
                      Aşağıda bu sınavınız ile birlikte çalışan diğer aşamayı eşleştirebilirsiniz:
                    </p>
                  </div>
                </div>

                {/* Aşama Eşleştirme Kartı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  
                  {/* Sol: İncelenen Sınav (Sabit) */}
                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                        {examReportModal.stage === 'TYT' ? '1. Aşama (TYT) • Bu Deneme' : '2. Aşama (AYT) • Bu Deneme'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {examReportModal.stage === 'TYT' ? '%40 Ağırlık' : '%60 Ağırlık'}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm truncate">
                      {examReportModal.title}
                    </div>
                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-semibold">
                        {examReportModal.totalNet.toFixed(1)} Net
                      </span>
                      <span className="text-xs font-black text-indigo-700">
                        Katkı: +{examReportModal.stage === 'TYT' 
                          ? examReportData.perf.eaResult.tytContribution.toFixed(2) 
                          : examReportData.perf.eaResult.aytContribution.toFixed(2)} Puan
                      </span>
                    </div>
                  </div>

                  {/* Sağ: Tamamlayıcı Birlikte Çalışan Aşama (Seçilebilir) */}
                  <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">
                        {examReportModal.stage === 'TYT' ? '2. Aşama (AYT) • Tamamlayıcı Eşleşen' : '1. Aşama (TYT) • Tamamlayıcı Eşleşen'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {examReportModal.stage === 'TYT' ? '%60 Ağırlık' : '%40 Ağırlık'}
                      </span>
                    </div>

                    {/* Sınav Seçici Dropdown */}
                    <select
                      value={pairedExamId}
                      onChange={(e) => setPairedExamId(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      {examReportData.complementaryExams.length > 0 ? (
                        <>
                          <option value="AVERAGE">
                            📌 Emir'in {examReportModal.stage === 'TYT' ? 'AYT' : 'TYT'} Deneme Ortalaması ({examReportModal.stage === 'TYT' ? avgAytNet : avgTytNet} Net)
                          </option>
                          {examReportData.complementaryExams.map(ex => (
                            <option key={ex.id} value={ex.id}>
                              📝 {ex.title} ({ex.totalNet.toFixed(1)} Net - {ex.date})
                            </option>
                          ))}
                        </>
                      ) : (
                        <>
                          <option value="AVERAGE">
                            🎯 11. Sınıf EA Standart Hedefi (40.0 Net AYT)
                          </option>
                          <option value="SIM_50">
                            🚀 11. Sınıf EA İleri Hedefi (50.0 Net AYT)
                          </option>
                          <option value="SIM_30">
                            🌱 11. Sınıf EA Başlangıç Hedefi (30.0 Net AYT)
                          </option>
                          <option value="SIM_60">
                            🏆 EA Zirve / İlk 5 Bin Hedefi (60.0 Net AYT)
                          </option>
                        </>
                      )}
                    </select>
                    {examReportData.complementaryExams.length === 0 && examReportModal.stage === 'TYT' && (
                      <span className="text-[10px] text-purple-700 font-bold block mt-1">
                        💡 Henüz girilmiş AYT denemesi olmadığı için 11. sınıf hedef projeksiyonu baz alınmaktadır.
                      </span>
                    )}

                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-semibold truncate">
                        {examReportModal.stage === 'TYT' 
                          ? `${examReportData.perf.eaResult.aytTotalNet.toFixed(1)} Net`
                          : `${examReportData.perf.eaResult.tytTotalNet.toFixed(1)} Net`}
                      </span>
                      <span className="text-xs font-black text-purple-700">
                        Katkı: +{examReportModal.stage === 'TYT' 
                          ? examReportData.perf.eaResult.aytContribution.toFixed(2) 
                          : examReportData.perf.eaResult.tytContribution.toFixed(2)} Puan
                      </span>
                    </div>
                  </div>

                </div>

                {/* Formül Özeti */}
                <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-100 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1 font-semibold">
                  <span>
                    Formül: 100 Taban + {examReportData.perf.eaResult.tytContribution.toFixed(1)} (TYT %40) + {examReportData.perf.eaResult.aytContribution.toFixed(1)} (AYT %60) + {obpInfo.contribution} (OBP)
                  </span>
                  <span className="text-indigo-900 font-black">
                    = {examReportData.perf.eaResult.placementScore.toFixed(3)} Y-EA
                  </span>
                </div>
              </div>

              {/* 3. KISIM: BİRLEŞİK PUAN VE SIRALAMA GÖSTERGE KARTLARI */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                    1. ve 2. Aşama Birlikte Hesaplanan YKS Puanı
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {examReportData.perf.eaResult.placementScore.toFixed(3)}
                    </span>
                    <span className="text-xs text-indigo-200 font-bold">
                      Y-EA (Yerleştirme Puanı)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 block">
                    Ham EA: <b>{examReportData.perf.eaResult.rawScore.toFixed(2)}</b> • OBP Katkısı: <b className="text-emerald-300">+{obpInfo.contribution}</b> (Diploma Notu: {obpInfo.diplomaGrade})
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center sm:text-right">
                  <span className="text-[10px] font-bold text-amber-300 uppercase block tracking-wider">Tahmini Türkiye Sıralaması (Y-EA)</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 block mt-0.5">
                    {examReportData.perf.ranking.rankString}
                  </span>
                  <span className="text-[11px] font-bold text-slate-200">
                    {examReportData.perf.ranking.percentile}
                  </span>
                </div>
              </div>

              {/* 4. KISIM: YÖK ATLAS LİSANS PROGRAMLARI (ÇOK YILLI GERÇEKÇİ ANALİZ) */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      YÖK Atlas Çok Yıllı Tercih Analizi ({examReportData.totalDatabaseCount} Program)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Bu sınav doğrultusunda tahmini <b>#{examReportData.userRank.toLocaleString()}</b> sıralamanıza göre üniversiteler listelenmiştir.
                    </p>
                  </div>
                </div>

                {/* Çok Yıllı Gerçekçi Değerlendirme Senaryosu Seçimi */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800">
                      Rehberlik Senaryosu:
                    </span>
                  </div>
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-sm flex-wrap">
                    <button
                      onClick={() => setReportScenario('WEIGHTED_AVG')}
                      className={`px-3 py-1.5 rounded-lg transition ${reportScenario === 'WEIGHTED_AVG' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      title="Son 3 yılın ağırlıklı ortalaması (En Güvenilir & Gerçekçi Öneri)"
                    >
                      🌟 3 Yıllık Ortalama (En Gerçekçi)
                    </button>
                    <button
                      onClick={() => setReportScenario('LATEST_2025')}
                      className={`px-3 py-1.5 rounded-lg transition ${reportScenario === 'LATEST_2025' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      title="Sadece en son açıklanan 2025 resmi taban sıralaması"
                    >
                      📌 Son Yıl (2025)
                    </button>
                    <button
                      onClick={() => setReportScenario('PEAK_SAFE')}
                      className={`px-3 py-1.5 rounded-lg transition ${reportScenario === 'PEAK_SAFE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      title="Son 3 yılın en zor yılı (Açıkta kalmayı önleyen güvenli senaryo)"
                    >
                      🛡️ Güvenli / Kötümser
                    </button>
                  </div>
                </div>

                {/* Gerçekçi Tercih Bilgilendirme Notu */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-[11px] text-indigo-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <b>Gerçekçi Tercih Güvencesi:</b> Tek bir yıla (örn. yalnızca 2024'e) güvenmek, hızla yükselen popüler bölümlerde yanıltıcı olabilir. Programımız her bölümün <b>2025, 2024 ve 2023</b> sıralama trendini analiz eder. Sıralama yanındaki <b>(i)</b> butonuna tıklayarak resmi YÖK Atlas 3 yıllık verilerini inceleyebilirsiniz.
                  </div>
                </div>

                {/* Arama Çubuğu */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Üniversite, bölüm veya şehir ara... (örn: Hukuk, YBS, Boğaziçi, Marmara, Ankara)"
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                  {modalSearchQuery && (
                    <button
                      onClick={() => setModalSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sekmeler (Tabs): Kazanabileceği vs Trend Riski Olanlar vs Bütün Bölümler */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
                  <button
                    onClick={() => setModalActiveTab('ELIGIBLE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      modalActiveTab === 'ELIGIBLE'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🎯 Kazanabileceği & Hedef Bölümler
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${modalActiveTab === 'ELIGIBLE' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {examReportData.eligibleList.length}
                    </span>
                  </button>

                  {examReportData.trendRisks.length > 0 && (
                    <button
                      onClick={() => setModalActiveTab('TREND_RISK')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                        modalActiveTab === 'TREND_RISK'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      ⚠️ Kritik / Trend Riski
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${modalActiveTab === 'TREND_RISK' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'}`}>
                        {examReportData.trendRisks.length}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => setModalActiveTab('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      modalActiveTab === 'ALL'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    📚 Bütün YÖK Atlas Bölümleri
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${modalActiveTab === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {examReportData.allMapped.length}
                    </span>
                  </button>
                </div>

                {/* Program Listesi */}
                <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
                  {(() => {
                    let listToDisplay = examReportData.eligibleList;
                    if (modalActiveTab === 'TREND_RISK') {
                      listToDisplay = examReportData.trendRisks;
                    } else if (modalActiveTab === 'ALL') {
                      listToDisplay = examReportData.allMapped;
                    }

                    if (listToDisplay.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">Aramanıza uygun program bulunamadı.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Lütfen arama terimini değiştirin veya sekmeler arasında geçiş yapın.</p>
                          {modalSearchQuery && (
                            <button
                              onClick={() => setModalSearchQuery('')}
                              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                            >
                              Aramayı Temizle
                            </button>
                          )}
                        </div>
                      );
                    }

                    return listToDisplay.map((prog) => {
                      const isGuaranteed = prog.status === 'GARANTI';
                      const isTarget = prog.status === 'HEDEF';
                      const isTrendRisk = prog.status === 'TREND_RISK';
                      const isReach = prog.status === 'GAYRET';

                      return (
                        <div 
                          key={prog.id} 
                          className={`p-3.5 rounded-2xl border transition hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isGuaranteed 
                              ? 'bg-emerald-50/50 border-emerald-200' 
                              : isTrendRisk
                                ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/60'
                                : isTarget 
                                  ? 'bg-indigo-50/60 border-indigo-200' 
                                  : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-slate-900">
                                {prog.university}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                                {prog.city}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                                Kod: {prog.kilavuzKodu}
                              </span>
                            </div>

                            <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 flex-wrap">
                              <span>{prog.department}</span>
                              <span className="text-[10px] font-medium text-slate-500">
                                • {prog.faculty}
                              </span>
                            </div>

                            {/* Çok Yıllı Sıralama ve Trend Göstergesi */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold flex-wrap">
                              <span className="inline-flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                <span className="text-slate-600 font-bold">2025:</span>
                                <b className="text-indigo-950 font-black">
                                  #{prog.multi.rank2025 > 0 ? prog.multi.rank2025.toLocaleString() : '---'}
                                </b>
                                <MultiYearRankPopover program={prog} align="left" />
                              </span>

                              <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] border flex items-center gap-1 ${prog.multi.trend.badgeClass}`}>
                                <span>{prog.multi.trend.icon}</span>
                                <span>{prog.multi.trend.shortLabel || prog.multi.trend.label}</span>
                              </span>

                              <span>•</span>
                              <span>3 Yıl Ort: <b className="text-slate-800">#{prog.multi.weightedAvgRank.toLocaleString()}</b></span>
                              <span>•</span>
                              <span>Taban: <b className="text-slate-800">{prog.baseScore}</b></span>
                              <span>•</span>
                              <span>Kont: <b>{prog.quota}</b></span>
                              <span>•</span>
                              <span>Tür: <b>{prog.scholarship}</b></span>
                            </div>

                            {/* Trend Riski Uyarısı Varsa */}
                            {prog.riskAlert && (
                              <div className="mt-1 px-2.5 py-1 rounded-xl bg-amber-100/80 border border-amber-300 text-[10.5px] text-amber-950 font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                                <span>{prog.riskAlert.message}</span>
                              </div>
                            )}
                          </div>

                          {/* Sağ Durum Rozeti ve Aksiyon Butonu */}
                          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 flex-shrink-0">
                            {/* Durum Rozeti */}
                            {isGuaranteed && (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Banko Tercih (+{Math.abs(prog.rankDiff).toLocaleString()} önde)
                              </span>
                            )}
                            {isTrendRisk && (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                ⚠️ Trend Riski
                              </span>
                            )}
                            {isTarget && (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 border border-indigo-200">
                                🟡 İdeal Hedef Bandı
                              </span>
                            )}
                            {isReach && (
                              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                                🔴 Daha Fazla Net Lazım (-{Math.abs(prog.rankDiff).toLocaleString()} sıra)
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setExamReportModal(null);
                                onNavigateToTab('yokatlas');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1"
                            >
                              <span>YÖK Atlas</span>
                              <ExternalLink className="w-3 h-3 text-slate-300" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* 5. KISIM: REHBERLİK VE KOÇ DEĞERLENDİRMESİ */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold block text-amber-900">
                    Özel Rehberlik & Strateji Değerlendirmesi:
                  </span>
                  <p className="leading-relaxed">
                    Bu sınavda elde ettiğin <b>{examReportModal.totalNet.toFixed(1)} net</b>, eşleştirilen <b>{examReportData.pairedLabel}</b> ve <b>+{obpInfo.contribution} OBP katkın</b> ile birlikte seni Türkiye genelinde <b>{examReportData.perf.ranking.rankString}</b> bandına yerleştirmektedir.
                    YÖK Atlas resmi verilerine göre bu performansla seçkin devlet ve vakıf lisans programlarına (Hukuk, Yönetim Bilişim Sistemleri, İktisat ve PDR gibi) rahatlıkla yerleşebilmektesin. 
                    Hedefini daha da yukarı taşımak için 2. Aşama Matematik ve Edebiyat branşlarındaki her +2 net seni yaklaşık 6.000 ila 10.000 sıra ileri taşıyacaktır.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Alt Kapatma Barı */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                YÖK Atlas 2023-2025 Çok Yıllı Başarı Sıraları ve ÖSYM Yığılma Verileri ile entegredir.
              </span>
              <button
                onClick={() => setExamReportModal(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs shadow-md hover:bg-slate-800 transition active:scale-95"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
