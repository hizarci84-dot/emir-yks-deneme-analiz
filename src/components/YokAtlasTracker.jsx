import React, { useState } from 'react';
import { 
  Compass, ExternalLink, Target, Search, CheckCircle, 
  ChevronRight, Award, AlertCircle, ArrowUpRight, ArrowDownRight, Sparkles 
} from 'lucide-react';
import { YOK_ATLAS_PROGRAMS } from '../data/yokAtlasData';

export default function YokAtlasTracker({ 
  exams, 
  targetProgramId, 
  onSelectTarget 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');

  // Mevcut hedef programı bul
  const currentTarget = YOK_ATLAS_PROGRAMS.find(p => p.id === targetProgramId) || YOK_ATLAS_PROGRAMS[1]; // Varsayılan Boğaziçi YBS

  // Emir'in son veya ortalama netlerini hesapla (1. Aşama ve 2. Aşama bağımsız oturumlar)
  const tytExams = exams.filter(e => e.stage === 'TYT');
  const aytExams = exams.filter(e => e.stage === 'AYT');

  // Ders ders ortalamaları
  const getSubjectAverage = (subId, examList) => {
    const list = examList.filter(e => e.subjects && e.subjects[subId]);
    if (list.length === 0) return 0;
    const total = list.reduce((sum, e) => sum + (e.subjects[subId].net || 0), 0);
    return total / list.length;
  };

  const emirNets = {
    tytTurkce: getSubjectAverage('tyt_turkce', tytExams),
    tytMatematik: getSubjectAverage('tyt_matematik', tytExams),
    tytSosyal: getSubjectAverage('tyt_sosyal', tytExams),
    tytFen: getSubjectAverage('tyt_fen', tytExams),
    tytTotal: tytExams.length > 0 ? tytExams.reduce((sum, e) => sum + e.totalNet, 0) / tytExams.length : 0,

    aytMatematik: getSubjectAverage('ayt_matematik', aytExams),
    aytEdebiyat: getSubjectAverage('ayt_edebiyat', aytExams),
    aytTarih1: getSubjectAverage('ayt_tarih1', aytExams),
    aytCografya1: getSubjectAverage('ayt_cografya1', aytExams),
    aytTotal: aytExams.length > 0 ? aytExams.reduce((sum, e) => sum + e.totalNet, 0) / aytExams.length : 0,
  };

  // Filtreleme
  const filteredPrograms = YOK_ATLAS_PROGRAMS.filter(prog => {
    const matchesSearch = 
      prog.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = filterCity === 'ALL' || prog.city === filterCity;
    const matchesDept = filterDept === 'ALL' || prog.department.includes(filterDept);

    return matchesSearch && matchesCity && matchesDept;
  });

  // Şehir listesi
  const cities = Array.from(new Set(YOK_ATLAS_PROGRAMS.map(p => p.city)));

  // Net farkı hesaplama bileşeni
  const NetGapRow = ({ label, current, target, isTotal = false }) => {
    const diff = (current - target).toFixed(1);
    const isAhead = current >= target;

    return (
      <tr className={`border-b border-slate-100 ${isTotal ? 'bg-indigo-50/60 font-black' : 'hover:bg-slate-50'}`}>
        <td className="py-2.5 px-3 text-xs sm:text-sm text-slate-800">
          {label}
        </td>
        <td className="py-2.5 px-3 text-center text-xs sm:text-sm font-bold text-slate-900">
          {current.toFixed(1)}
        </td>
        <td className="py-2.5 px-3 text-center text-xs sm:text-sm font-bold text-indigo-700">
          {target.toFixed(1)}
        </td>
        <td className="py-2.5 px-3 text-right">
          <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
            isAhead 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-rose-100 text-rose-800'
          }`}>
            {isAhead ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isAhead ? `+${diff}` : diff}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. SEÇİLİ HEDEF VE NET FARK ANALİZİ (NET GAP ANALYSIS) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Emir'in Aktif YÖK Atlas Hedefi</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              {currentTarget.university}
            </h2>
            <p className="text-sm sm:text-base text-indigo-200 font-bold">
              {currentTarget.department} ({currentTarget.scoreType})
            </p>
            <p className="text-xs text-slate-400 max-w-xl">
              {currentTarget.notes}
            </p>
          </div>

          {/* Hedef Rozetleri */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-indigo-300 block font-bold uppercase">2024 Sıralama</span>
              <span className="text-lg sm:text-xl font-black text-amber-300">
                #{currentTarget.rank2024.toLocaleString()}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-indigo-300 block font-bold uppercase">Taban Puan</span>
              <span className="text-lg sm:text-xl font-black text-white">
                {currentTarget.baseScore2024}
              </span>
            </div>

            <a
              href={currentTarget.yokAtlasUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>YÖK Atlas'ta Aç</span>
            </a>
          </div>

        </div>

        {/* Karşılaştırmalı Net Tablosu */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Hedefe Kalan Net Analizi (Emir vs YÖK Atlas)
            </h3>
            <span className="text-xs text-indigo-300 font-medium hidden sm:inline">
              Son deneme ortalamaların ile hedeflenen netler kıyaslanmaktadır
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white text-slate-900 shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-extrabold">
                  <th className="py-2.5 px-3">Ders Adı</th>
                  <th className="py-2.5 px-3 text-center">Emir'in Ort. Neti</th>
                  <th className="py-2.5 px-3 text-center">YÖK Atlas Hedef Net</th>
                  <th className="py-2.5 px-3 text-right">Fark / Durum</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Aşama TYT */}
                <tr className="bg-slate-50/80 font-bold text-xs text-indigo-900">
                  <td colSpan="4" className="py-1.5 px-3 uppercase tracking-wide">
                    1. AŞAMA (TYT) DERSLERİ
                  </td>
                </tr>
                <NetGapRow label="Türkçe (40 Soru)" current={emirNets.tytTurkce} target={currentTarget.nets.tytTurkce} />
                <NetGapRow label="Temel Matematik (40 Soru)" current={emirNets.tytMatematik} target={currentTarget.nets.tytMatematik} />
                <NetGapRow label="Sosyal Bilimler (20 Soru)" current={emirNets.tytSosyal} target={currentTarget.nets.tytSosyal} />
                <NetGapRow label="Fen Bilimleri (20 Soru - Ayırt Edici)" current={emirNets.tytFen} target={currentTarget.nets.tytFen} />
                <NetGapRow label="TOPLAM TYT NETİ" current={emirNets.tytTotal} target={currentTarget.nets.tytTotal} isTotal={true} />

                {/* 2. Aşama AYT EA */}
                <tr className="bg-slate-50/80 font-bold text-xs text-purple-900">
                  <td colSpan="4" className="py-1.5 px-3 uppercase tracking-wide">
                    2. AŞAMA (AYT - EŞİT AĞIRLIK) DERSLERİ
                  </td>
                </tr>
                <NetGapRow label="AYT Matematik & Geometri (40 Soru)" current={emirNets.aytMatematik} target={currentTarget.nets.aytMatematik} />
                <NetGapRow label="Türk Dili ve Edebiyatı (24 Soru)" current={emirNets.aytEdebiyat} target={currentTarget.nets.aytEdebiyat} />
                <NetGapRow label="Tarih-1 (10 Soru)" current={emirNets.aytTarih1} target={currentTarget.nets.aytTarih1} />
                <NetGapRow label="Coğrafya-1 (6 Soru)" current={emirNets.aytCografya1} target={currentTarget.nets.aytCografya1} />
                <NetGapRow label="TOPLAM AYT NETİ" current={emirNets.aytTotal} target={currentTarget.nets.aytTotal} isTotal={true} />
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* 2. YÖK ATLAS EŞİT AĞIRLIK BÖLÜMLERİ KATALOĞU */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              YÖK Atlas Eşit Ağırlık Bölümleri Kataloğu
            </h3>
            <p className="text-xs text-slate-500">
              Hedefini değiştirmek için dilediğin üniversite ve bölümün üzerindeki "Hedef Olarak Seç" butonuna tıkla
            </p>
          </div>

          {/* Arama ve Şehir Filtresi */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Üniversite veya bölüm ara..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tüm Şehirler</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Program Kartları Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPrograms.map((prog) => {
            const isSelected = prog.id === targetProgramId;

            return (
              <div
                key={prog.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {prog.city} • {prog.type}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
                      {prog.university}
                    </h4>
                    <p className="text-xs font-bold text-indigo-700">
                      {prog.department}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 block">
                      #{prog.rank2024.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">2024 Sıra</span>
                  </div>
                </div>

                {/* Net Dağılımı Özeti */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block font-semibold">TYT Hedef Net</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">
                      ~{prog.nets.tytTotal} Net
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Mat: {prog.nets.tytMatematik} • Tr: {prog.nets.tytTurkce}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block font-semibold">AYT Hedef Net</span>
                    <span className="text-xs sm:text-sm font-black text-purple-700">
                      ~{prog.nets.aytTotal} Net
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Mat: {prog.nets.aytMatematik} • Edeb: {prog.nets.aytEdebiyat}
                    </span>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                  <a
                    href={prog.yokAtlasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>YÖK Atlas Linki</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Aktif Hedefin
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectTarget(prog.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-indigo-600 transition shadow-sm"
                    >
                      Hedef Olarak Seç
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
