import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Award, Target, TrendingUp, Sparkles, 
  GraduationCap, CheckCircle, AlertCircle, ArrowUpRight, 
  Layers, BookOpen, RefreshCw, ChevronRight, HelpCircle,
  Sliders, Star, Check
} from 'lucide-react';
import { 
  calculateObp, 
  calculateTytScore, 
  calculateEaScore, 
  estimateEaRanking, 
  extractNetsFromExams 
} from '../services/yksScoreCalculator';
import { YOK_ATLAS_PROGRAMS } from '../data/yokAtlasData';
import { StorageService } from '../services/storage';

export default function YksScoreCalculator({ 
  exams = [], 
  settings = {}, 
  onUpdateSettings,
  onSelectTarget,
  onNavigateToTab 
}) {
  // Diploma Notu & OBP State
  const [diplomaGrade, setDiplomaGrade] = useState(settings?.diplomaGrade || 88.5);
  const [isBrokenObp, setIsBrokenObp] = useState(settings?.isObpBroken || false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Veri Kaynağı Modu: 'AVERAGE' (Ortalama Netler), 'LATEST' (Son Sınav Netleri), 'CUSTOM' (Serbest Simülasyon)
  const [dataSourceMode, setDataSourceMode] = useState('AVERAGE');

  // Mevcut denemelerden otomatik çıkarılan netler
  const autoNets = useMemo(() => {
    return extractNetsFromExams(exams, dataSourceMode === 'LATEST' ? 'LATEST' : 'AVERAGE');
  }, [exams, dataSourceMode]);

  // Manuel / Simülasyon Net State'leri
  const [customTyt, setCustomTyt] = useState({
    tytTurkce: 28.0,
    tytMatematik: 22.0,
    tytSosyal: 13.0,
    tytFen: 6.0
  });

  const [customAyt, setCustomAyt] = useState({
    aytMatematik: 21.0,
    aytEdebiyat: 18.0,
    aytTarih1: 7.0,
    aytCografya1: 4.0
  });

  // Otomatik mod değiştiğinde manuel netleri de senkronize et
  useEffect(() => {
    if (dataSourceMode === 'AVERAGE' || dataSourceMode === 'LATEST') {
      setCustomTyt({
        tytTurkce: autoNets.tyt.tytTurkce || 28.0,
        tytMatematik: autoNets.tyt.tytMatematik || 22.0,
        tytSosyal: autoNets.tyt.tytSosyal || 13.0,
        tytFen: autoNets.tyt.tytFen || 6.0
      });
      setCustomAyt({
        aytMatematik: autoNets.ayt.aytMatematik || 20.0,
        aytEdebiyat: autoNets.ayt.aytEdebiyat || 17.0,
        aytTarih1: autoNets.ayt.aytTarih1 || 6.5,
        aytCografya1: autoNets.ayt.aytCografya1 || 3.5
      });
    }
  }, [dataSourceMode, autoNets]);

  // Diploma notunu kaydet
  const handleSaveDiplomaSettings = () => {
    const updated = {
      ...settings,
      diplomaGrade: parseFloat(diplomaGrade),
      isObpBroken: isBrokenObp
    };
    StorageService.saveSettings(updated);
    if (onUpdateSettings) onUpdateSettings(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // OBP Hesaplaması
  const obpInfo = useMemo(() => {
    return calculateObp(diplomaGrade, isBrokenObp);
  }, [diplomaGrade, isBrokenObp]);

  // Aktif Netler
  const activeTytNets = customTyt;
  const activeAytNets = customAyt;

  // TYT Puanı
  const tytScoreResult = useMemo(() => {
    return calculateTytScore(activeTytNets, obpInfo.contribution);
  }, [activeTytNets, obpInfo.contribution]);

  // YKS EA Puanı
  const eaScoreResult = useMemo(() => {
    return calculateEaScore(activeTytNets, activeAytNets, obpInfo.contribution);
  }, [activeTytNets, activeAytNets, obpInfo.contribution]);

  // Sıralama Tahmini
  const rankingResult = useMemo(() => {
    return estimateEaRanking(eaScoreResult.placementScore);
  }, [eaScoreResult.placementScore]);

  // Bu sıralama/puanla kazanabilecek üniversite programları
  const matchingPrograms = useMemo(() => {
    const userRank = rankingResult.midRank;
    const userScore = eaScoreResult.placementScore;

    return YOK_ATLAS_PROGRAMS.map(prog => {
      const rankDiff = userRank - prog.rank;
      let status = 'HEDEF'; // HEDEF, GARANTI, GAYRET

      if (userRank <= prog.rank * 0.9) {
        status = 'GARANTI'; // Kullanıcı daha iyi bir sıralamada
      } else if (userRank <= prog.rank * 1.25) {
        status = 'HEDEF'; // Tam hedef bandında
      } else {
        status = 'GAYRET'; // Birkaç net daha istiyor
      }

      return {
        ...prog,
        rankDiff,
        status
      };
    }).sort((a, b) => a.rank - b.rank);
  }, [rankingResult.midRank, eaScoreResult.placementScore]);

  const targetProgramsList = matchingPrograms.filter(p => p.status === 'HEDEF').slice(0, 5);
  const guaranteedProgramsList = matchingPrograms.filter(p => p.status === 'GARANTI').slice(0, 5);
  const reachProgramsList = matchingPrograms.filter(p => p.status === 'GAYRET').slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ÜST BAŞLIK KARTI */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-950 text-white p-5 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-amber-300 backdrop-blur-sm border border-white/10">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>ÖSYM Resmi Formülü & YÖK Atlas Yığılımı</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              YKS Eşit Ağırlık Puan & Sıralama Simülatörü
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
              1. Aşama (TYT %40) ve 2. Aşama (AYT %60) netleri ile Diploma Puanını (OBP) birleştirerek gerçekçi Y-EA yerleştirme puanını ve tahmini Türkiye başarı sıranı anında gör.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            <GraduationCap className="w-8 h-8 text-amber-300" />
            <div>
              <span className="text-[10px] text-indigo-200 block font-bold uppercase">Diploma Notu (OBP)</span>
              <span className="text-sm sm:text-base font-black text-white">{obpInfo.diplomaGrade} / 100 (+{obpInfo.contribution} Puan)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DİPLOMA NOTU & OBP (ORTAÖĞRETİM BAŞARI PUANI) PANELİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Diploma Notu ve OBP (Ortaöğretim Başarı Puanı)
              </h3>
              <p className="text-xs text-slate-500">
                Lise mezuniyet diploma notunun YKS yerleştirme puanına resmi katkısı
              </p>
            </div>
          </div>

          {saveSuccessToast && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Diploma notu başarıyla kaydedildi!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Giriş Alanı */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              100'lük Sistemde Diploma Notu (veya Tahmini):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="100"
                step="0.1"
                value={diplomaGrade}
                onChange={(e) => setDiplomaGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-extrabold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: 92.5"
              />
              <button
                onClick={handleSaveDiplomaSettings}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Kaydet
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">11. sınıf öğrencisi için 9, 10 ve 11. sınıf ortalamanızı baz alabilirsiniz.</p>
          </div>

          {/* OBP ve Katkı Göstergeleri */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Hesaplanan OBP</span>
              <span className="text-lg font-black text-slate-900">{obpInfo.obpScore}</span>
              <span className="text-[10px] text-slate-500 block font-medium">(Not x 5)</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase block">YKS'ye Net Katkı</span>
              <span className="text-lg font-black text-indigo-700">+{obpInfo.contribution}</span>
              <span className="text-[10px] text-indigo-500 block font-medium">({isBrokenObp ? 'OBP x 0.06' : 'OBP x 0.12'})</span>
            </div>
          </div>

          {/* Kırık OBP Seçeneği */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isBrokenObp}
                onChange={(e) => setIsBrokenObp(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-extrabold text-amber-950 block">Önceki yıl üniversiteye yerleştim (Kırık OBP)</span>
                <span className="text-amber-800 text-[11px] font-medium leading-tight block mt-0.5">
                  Önceki yıl bir lisans/önlisans programına yerleştiyseniz katsayı 0.12 yerine 0.06'ya düşer.
                </span>
              </div>
            </label>
          </div>

        </div>
      </div>

      {/* 3. CANLI PUAN & SIRALAMA GÖSTERGE KARTI (Zirve Paneli) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Sol: Büyük Yerleştirme Puanı ve Sıralama */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Y-EA (Yerleştirme Eşit Ağırlık)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300">
                {rankingResult.percentile}
              </span>
            </div>

            <div>
              <span className="text-xs text-indigo-300 block font-semibold">Hesaplanan YKS Yerleştirme Puanı:</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                  {eaScoreResult.placementScore.toFixed(3)}
                </span>
                <span className="text-xs sm:text-sm text-indigo-300 font-bold">
                  / 560.000 Tam Puan
                </span>
              </div>
            </div>

            {/* Yaklaşık Sıralama */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 inline-block">
              <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
                Tahmini Türkiye Eşit Ağırlık Sıralaması:
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {rankingResult.rankString}
              </span>
              <p className="text-[11px] text-slate-300 mt-1 font-medium">
                ÖSYM'nin son 3 yıllık (2022-2024) resmi yığılma istatistiklerine göre modellenmiştir.
              </p>
            </div>
          </div>

          {/* Sağ: Puan Dağılım Kırılımı (Katsayı Detayları) */}
          <div className="grid grid-cols-2 gap-3 min-w-[300px]">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">EA Ham Puanı</span>
              <span className="text-xl font-black text-white">{eaScoreResult.rawScore.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block">Taban (100) + Netler</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-amber-400 block font-bold uppercase">Diploma (OBP) Katkısı</span>
              <span className="text-xl font-black text-amber-300">+{obpInfo.contribution}</span>
              <span className="text-[10px] text-slate-400 block">OBP ({obpInfo.obpScore})</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-indigo-300 block font-bold uppercase">TYT Ham Puanı</span>
              <span className="text-xl font-black text-indigo-200">{tytScoreResult.rawScore.toFixed(2)}</span>
              <span className="text-[10px] text-indigo-300/80 block">Toplam {eaScoreResult.tytTotalNet} Net</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-purple-300 block font-bold uppercase">AYT EA Payı</span>
              <span className="text-xl font-black text-purple-200">{eaScoreResult.aytContribution.toFixed(2)}</span>
              <span className="text-[10px] text-purple-300/80 block">Toplam {eaScoreResult.aytTotalNet} Net</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. NET KAYNAĞI SEÇİCİ VE NET GİRİŞ PANELİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        
        {/* Mod Seçici Barı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Sınav Netleri ve Hedef Simülasyonu
            </h3>
            <p className="text-xs text-slate-500">
              Mevcut deneme ortalamalarını tek tıkla yükleyebilir veya netleri değiştirerek puan simülasyonu yapabilirsin.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setDataSourceMode('AVERAGE')}
              className={`px-3 py-1.5 rounded-xl transition ${dataSourceMode === 'AVERAGE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Deneme Ortalamalarım ({autoNets.tyt.examCount + autoNets.ayt.examCount} Sınav)
            </button>
            <button
              onClick={() => setDataSourceMode('LATEST')}
              className={`px-3 py-1.5 rounded-xl transition ${dataSourceMode === 'LATEST' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Son Denemelerim
            </button>
            <button
              onClick={() => setDataSourceMode('CUSTOM')}
              className={`px-3 py-1.5 rounded-xl transition ${dataSourceMode === 'CUSTOM' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Manuel Hedef Simülatörü
            </button>
          </div>
        </div>

        {/* 2 Kolonlu Net Kontrolleri: Sol TYT, Sağ AYT EA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SOL: 1. Aşama (TYT) Netleri */}
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-wider">
                  1. Aşama (TYT) - %40 Pay
                </h4>
              </div>
              <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-xl border border-indigo-200">
                Top: {eaScoreResult.tytTotalNet} / 120 Net
              </span>
            </div>

            {/* Türkçe (40 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Türkçe (40 Soru - Katsayı 1.32):</span>
                <span className="text-indigo-700 font-black">{customTyt.tytTurkce} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.25"
                value={customTyt.tytTurkce}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomTyt({ ...customTyt, tytTurkce: parseFloat(e.target.value) });
                }}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Temel Matematik (40 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Temel Matematik (40 Soru - Katsayı 1.32):</span>
                <span className="text-indigo-700 font-black">{customTyt.tytMatematik} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.25"
                value={customTyt.tytMatematik}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomTyt({ ...customTyt, tytMatematik: parseFloat(e.target.value) });
                }}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Sosyal Bilimler (20 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Sosyal Bilimler (20 Soru - Katsayı 1.36):</span>
                <span className="text-indigo-700 font-black">{customTyt.tytSosyal} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.25"
                value={customTyt.tytSosyal}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomTyt({ ...customTyt, tytSosyal: parseFloat(e.target.value) });
                }}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Fen Bilimleri (20 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Fen Bilimleri (20 Soru - Katsayı 1.36):</span>
                <span className="text-indigo-700 font-black">{customTyt.tytFen} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.25"
                value={customTyt.tytFen}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomTyt({ ...customTyt, tytFen: parseFloat(e.target.value) });
                }}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* SAĞ: 2. Aşama (AYT Eşit Ağırlık) Netleri */}
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-black text-purple-950 uppercase tracking-wider">
                  2. Aşama (AYT EA) - %60 Pay
                </h4>
              </div>
              <span className="text-xs font-black text-purple-700 bg-white px-2.5 py-1 rounded-xl border border-purple-200">
                Top: {eaScoreResult.aytTotalNet} / 80 Net
              </span>
            </div>

            {/* AYT Matematik (40 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">AYT Matematik (40 Soru - Katsayı 3.00):</span>
                <span className="text-purple-700 font-black">{customAyt.aytMatematik} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.25"
                value={customAyt.aytMatematik}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomAyt({ ...customAyt, aytMatematik: parseFloat(e.target.value) });
                }}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Türk Dili ve Edebiyatı (24 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Türk Dili ve Edebiyatı (24 Soru - Katsayı 3.00):</span>
                <span className="text-purple-700 font-black">{customAyt.aytEdebiyat} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.25"
                value={customAyt.aytEdebiyat}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomAyt({ ...customAyt, aytEdebiyat: parseFloat(e.target.value) });
                }}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Tarih-1 (10 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Tarih-1 (10 Soru - Katsayı 2.80):</span>
                <span className="text-purple-700 font-black">{customAyt.aytTarih1} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.25"
                value={customAyt.aytTarih1}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomAyt({ ...customAyt, aytTarih1: parseFloat(e.target.value) });
                }}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Coğrafya-1 (6 Soru) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Coğrafya-1 (6 Soru - Katsayı 3.33):</span>
                <span className="text-purple-700 font-black">{customAyt.aytCografya1} Net</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.25"
                value={customAyt.aytCografya1}
                onChange={(e) => {
                  setDataSourceMode('CUSTOM');
                  setCustomAyt({ ...customAyt, aytCografya1: parseFloat(e.target.value) });
                }}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 5. BU PUAN VE SIRALAMA İLE HANGİ BÖLÜMLERE GİREBİLİRİM? (YÖK ATLAS EŞLEŞTİRME) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Bu Puan ve Sıralama İle YÖK Atlas Eşleştirmesi
            </h3>
            <p className="text-xs text-slate-500">
              Tahmini sıralaman olan <b>{rankingResult.rankString}</b> bandına göre girebileceğin örnek EA programları
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('yokatlas')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition self-start sm:self-auto"
          >
            <span>Tüm YÖK Atlas Programlarını Gör</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* 1. Hedef Bandındaki Programlar */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              🎯 Tam Hedef Sıralamanda Olan Programlar ({targetProgramsList.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {targetProgramsList.map((prog) => (
                <div key={prog.id} className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block truncate max-w-xs">
                      {prog.university}
                    </span>
                    <span className="text-[11px] text-indigo-800 font-semibold block">
                      {prog.department}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      2024 Sıralama: #{prog.rank.toLocaleString()} • Taban Puan: {prog.baseScore}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectTarget) onSelectTarget(prog.id);
                      onNavigateToTab('yokatlas');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex-shrink-0"
                  >
                    Hedef Yap
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Garanti / Güvenli Programlar */}
          {guaranteedProgramsList.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                🌟 Rahatlıkla Kazanabileceğin Güvenli Programlar ({guaranteedProgramsList.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guaranteedProgramsList.map((prog) => (
                  <div key={prog.id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block truncate max-w-xs">
                        {prog.university}
                      </span>
                      <span className="text-[11px] text-emerald-800 font-semibold block">
                        {prog.department}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        2024 Sıralama: #{prog.rank.toLocaleString()} • Taban: {prog.baseScore}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectTarget) onSelectTarget(prog.id);
                        onNavigateToTab('yokatlas');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex-shrink-0"
                    >
                      İncele
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
