import React, { useState, useMemo } from 'react';
import { 
  Compass, ExternalLink, Target, Search, CheckCircle, 
  ChevronRight, Award, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Sparkles, Filter, RotateCcw, Building2, BookOpen, MapPin, 
  Layers, Check, Eye, X, ChevronLeft, Info
} from 'lucide-react';
import { YOK_ATLAS_PROGRAMS } from '../data/yokAtlasData';

export default function YokAtlasTracker({ 
  exams, 
  targetProgramId, 
  onSelectTarget 
}) {
  // Filtre State'leri (YÖK Atlas Tercih Sihirbazı ile birebir)
  const [filterUni, setFilterUni] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterUniType, setFilterUniType] = useState(''); // DEVLET, VAKIF
  const [filterScholarship, setFilterScholarship] = useState(''); // Burslu, Ücretsiz, %50 İndirimli
  const [filterCode, setFilterCode] = useState('');
  const [minRank, setMinRank] = useState('');
  const [maxRank, setMaxRank] = useState('');

  // Arama Tetikleyicisi
  const [appliedFilters, setAppliedFilters] = useState({
    uni: '',
    dept: '',
    city: '',
    uniType: '',
    scholarship: '',
    code: '',
    minRank: '',
    maxRank: ''
  });

  // Görünüm Modu: 'OZET' (Özet Görünüm) veya 'DETAY' (Detay Görünüm)
  const [viewMode, setViewMode] = useState('OZET');

  // Sayfalama (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // İncelenen Program Modalı (Netler ve Hedef Kıyaslama)
  const [inspectProgram, setInspectProgram] = useState(null);

  // Mevcut hedef program
  const currentTarget = YOK_ATLAS_PROGRAMS.find(p => p.id === targetProgramId) || YOK_ATLAS_PROGRAMS[0];

  // Emir'in deneme ortalamaları (1. Aşama ve 2. Aşama ayrı)
  const tytExams = exams.filter(e => e.stage === 'TYT');
  const aytExams = exams.filter(e => e.stage === 'AYT');

  const getSubjectAvg = (subId, list) => {
    const valid = list.filter(e => e.subjects && e.subjects[subId]);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, e) => sum + (e.subjects[subId].net || 0), 0) / valid.length;
  };

  const emirNets = {
    tytTurkce: getSubjectAvg('tyt_turkce', tytExams),
    tytMatematik: getSubjectAvg('tyt_matematik', tytExams),
    tytSosyal: getSubjectAvg('tyt_sosyal', tytExams),
    tytFen: getSubjectAvg('tyt_fen', tytExams),
    tytTotal: tytExams.length > 0 ? tytExams.reduce((sum, e) => sum + e.totalNet, 0) / tytExams.length : 0,

    aytMatematik: getSubjectAvg('ayt_matematik', aytExams),
    aytEdebiyat: getSubjectAvg('ayt_edebiyat', aytExams),
    aytTarih1: getSubjectAvg('ayt_tarih1', aytExams),
    aytCografya1: getSubjectAvg('ayt_cografya1', aytExams),
    aytTotal: aytExams.length > 0 ? aytExams.reduce((sum, e) => sum + e.totalNet, 0) / aytExams.length : 0,
  };

  // Dinamik Şehir, Üniversite ve Bölüm Seçenekleri
  const uniqueCities = useMemo(() => Array.from(new Set(YOK_ATLAS_PROGRAMS.map(p => p.city))).sort(), []);
  const uniqueUniversities = useMemo(() => Array.from(new Set(YOK_ATLAS_PROGRAMS.map(p => p.university))).sort(), []);
  const uniqueDepartments = useMemo(() => {
    const depts = new Set();
    YOK_ATLAS_PROGRAMS.forEach(p => {
      // Temiz bölüm adı (örn: Hukuk, Yönetim Bilişim Sistemleri, İktisat)
      if (p.department.includes('Hukuk')) depts.add('Hukuk');
      else if (p.department.includes('Yönetim Bilişim')) depts.add('Yönetim Bilişim Sistemleri');
      else if (p.department.includes('İşletme')) depts.add('İşletme');
      else if (p.department.includes('İktisat') || p.department.includes('Ekonomi')) depts.add('İktisat / Ekonomi');
      else if (p.department.includes('Psikoloji')) depts.add('Psikoloji');
      else if (p.department.includes('Uluslararası İlişkiler') || p.department.includes('Siyaset')) depts.add('Siyaset Bilimi ve Uluslararası İlişkiler');
      else if (p.department.includes('Rehberlik') || p.department.includes('PDR')) depts.add('PDR (Rehberlik)');
      else depts.add(p.department.split('(')[0].trim());
    });
    return Array.from(depts).sort();
  }, []);

  // Filtreleri Uygula Butonu
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setAppliedFilters({
      uni: filterUni,
      dept: filterDept,
      city: filterCity,
      uniType: filterUniType,
      scholarship: filterScholarship,
      code: filterCode.trim(),
      minRank: minRank ? parseInt(minRank, 10) : '',
      maxRank: maxRank ? parseInt(maxRank, 10) : ''
    });
    setCurrentPage(1);
  };

  // Filtreleri Temizle
  const handleResetFilters = () => {
    setFilterUni('');
    setFilterDept('');
    setFilterCity('');
    setFilterUniType('');
    setFilterScholarship('');
    setFilterCode('');
    setMinRank('');
    setMaxRank('');
    setAppliedFilters({
      uni: '',
      dept: '',
      city: '',
      uniType: '',
      scholarship: '',
      code: '',
      minRank: '',
      maxRank: ''
    });
    setCurrentPage(1);
  };

  // Filtrelenmiş Programlar
  const filteredList = useMemo(() => {
    return YOK_ATLAS_PROGRAMS.filter(prog => {
      if (appliedFilters.code && !String(prog.kilavuzKodu).includes(appliedFilters.code)) return false;
      if (appliedFilters.uni && !prog.university.toLowerCase().includes(appliedFilters.uni.toLowerCase())) return false;
      if (appliedFilters.dept && !prog.department.toLowerCase().includes(appliedFilters.dept.toLowerCase())) return false;
      if (appliedFilters.city && prog.city !== appliedFilters.city) return false;
      if (appliedFilters.uniType && prog.universityType !== appliedFilters.uniType) return false;
      if (appliedFilters.scholarship && !prog.scholarship.toLowerCase().includes(appliedFilters.scholarship.toLowerCase())) return false;
      if (appliedFilters.minRank !== '' && prog.rank < appliedFilters.minRank) return false;
      if (appliedFilters.maxRank !== '' && prog.rank > appliedFilters.maxRank) return false;
      return true;
    });
  }, [appliedFilters]);

  // Sayfalama Hesapları
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Net Fark Satırı Bileşeni
  const NetGapRow = ({ label, current, target, isTotal = false }) => {
    const diff = (current - target).toFixed(1);
    const isAhead = current >= target;

    return (
      <tr className={`border-b border-slate-100 ${isTotal ? 'bg-indigo-50/70 font-black' : 'hover:bg-slate-50'}`}>
        <td className="py-2 px-3 text-xs sm:text-sm text-slate-800 font-semibold">{label}</td>
        <td className="py-2 px-3 text-center text-xs sm:text-sm font-bold text-slate-900">{current.toFixed(1)}</td>
        <td className="py-2 px-3 text-center text-xs sm:text-sm font-bold text-indigo-700">{target.toFixed(1)}</td>
        <td className="py-2 px-3 text-right">
          <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
            isAhead ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
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
      
      {/* 1. YÖK ATLAS BAŞLIĞI & TERCİH SİHİRBAZI LOGO BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 font-black text-xl tracking-tighter">
            YÖK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                YÖK <span className="text-rose-600">ATLAS</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                Resmi Tercih Sihirbazı
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Yükseköğretim Program Atlası • Eşit Ağırlık (EA) Lisans Başarı Sıraları & Net Verileri
            </p>
          </div>
        </div>

        {/* Aktif Hedef Rozeti */}
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200/80 p-2.5 sm:px-4 sm:py-2 rounded-2xl">
          <Target className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Emir'in Birincil Hedefi:
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block truncate max-w-[200px] sm:max-w-xs">
              {currentTarget.university} - {currentTarget.department}
            </span>
          </div>
          <button
            onClick={() => setInspectProgram(currentTarget)}
            className="ml-auto text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex-shrink-0"
          >
            Kıyasla
          </button>
        </div>
      </div>

      {/* 2. TERCİH SİHİRBAZI FİLTRELEME FORMU (Görseldeki YÖK Atlas Şablonu) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Tercih Sihirbazı Filtreleri
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Bulunan Program: <b className="text-indigo-600">{filteredList.length}</b>
          </span>
        </div>

        <form onSubmit={handleApplyFilter} className="space-y-4">
          
          {/* 1. Satır: Puan Türü, Lisans, Üniversite, Program, Şehir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Puan Türü (Sabit EA) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Puan Türü</label>
              <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>EA (Eşit Ağırlık)</span>
                <span className="text-xs text-slate-400">✕</span>
              </div>
            </div>

            {/* Ön Lisans / Lisans (Sabit Lisans) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Ön Lisans / Lisans</label>
              <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>LİSANS (4-6 Yıl)</span>
                <span className="text-xs text-slate-400">✕</span>
              </div>
            </div>

            {/* Üniversite */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Üniversite</label>
              <input
                type="text"
                value={filterUni}
                onChange={(e) => setFilterUni(e.target.value)}
                placeholder="Örn: Boğaziçi, Galatasaray..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Program / Bölüm */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Program / Bölüm</label>
              <input
                type="text"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                placeholder="Örn: Hukuk, YBS, Psikoloji..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Şehir */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Şehir</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tüm Şehirler</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

          </div>

          {/* 2. Satır: Üniversite Türü, Ücret/Burs, Program Kodu, Başarı Sırası Aralığı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Üniversite Türü */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Üniversite Türü</label>
              <select
                value={filterUniType}
                onChange={(e) => setFilterUniType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tümü (Devlet + Vakıf)</option>
                <option value="DEVLET">Devlet Üniversitesi</option>
                <option value="VAKIF">Vakıf Üniversitesi</option>
              </select>
            </div>

            {/* Ücret / Burs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Ücret / Burs</label>
              <select
                value={filterScholarship}
                onChange={(e) => setFilterScholarship(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tüm Burs Türleri</option>
                <option value="Burslu">Burslu (Tam)</option>
                <option value="İndirimli">%50 İndirimli</option>
                <option value="Ücretsiz">Ücretsiz (Devlet)</option>
                <option value="Ücretli">Ücretli</option>
              </select>
            </div>

            {/* Program Kodu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Program Kodu</label>
              <input
                type="text"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Örn: 104010052"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* En Az Başarı Sırası */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">En Az Başarı Sırası</label>
              <input
                type="number"
                value={minRank}
                onChange={(e) => setMinRank(e.target.value)}
                placeholder="Örn: 1"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* En Çok Başarı Sırası */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">En Çok Başarı Sırası</label>
              <input
                type="number"
                value={maxRank}
                onChange={(e) => setMaxRank(e.target.value)}
                placeholder="Örn: 50000"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Aksiyon Butonları: Temizle & Ara */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 text-xs sm:text-sm font-bold transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-200"
            >
              <Search className="w-4 h-4" />
              <span>Ara</span>
            </button>
          </div>

        </form>
      </div>

      {/* 3. TABLO ÜSTÜ KONTROLLER (Özet / Detay Görünüm & Sayfalama) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('OZET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'OZET' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Özet Görünüm
            </button>
            <button
              onClick={() => setViewMode('DETAY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                viewMode === 'DETAY' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Detay Görünüm (Çoklu Yıl)
            </button>
          </div>

          <span className="text-xs text-slate-400 font-semibold hidden md:inline">
            (Toplam {filteredList.length} sonuçtan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredList.length)} gösteriliyor)
          </span>
        </div>

        {/* Sayfa Geçişleri */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2">
            Sayfa {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. TERCİH SİHİRBAZI RESMİ TABLOSU */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px] tracking-tight">
                <th className="py-3 px-3 text-center w-14">Hedef</th>
                <th className="py-3 px-3 w-28">Program Kodu</th>
                <th className="py-3 px-3">Üniversite</th>
                <th className="py-3 px-3">Program & Fakülte</th>
                <th className="py-3 px-2 text-center w-16">Kont.</th>
                <th className="py-3 px-2 text-center w-16">Doluluk</th>
                <th className="py-3 px-3 text-center">
                  Başarı Sırası {viewMode === 'DETAY' && <span className="text-[10px] text-indigo-600 block">(2025 | 2024 | 2023)</span>}
                </th>
                <th className="py-3 px-3 text-center">Taban Puan</th>
                <th className="py-3 px-3 text-center w-28">Netler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.map((prog) => {
                const isTarget = prog.id === targetProgramId;

                return (
                  <tr 
                    key={prog.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${isTarget ? 'bg-indigo-50/50 font-semibold' : ''}`}
                  >
                    
                    {/* Hedef Seçim Butonu */}
                    <td className="py-3 px-3 text-center">
                      {isTarget ? (
                        <span 
                          title="Emir'in Birincil Hedefi"
                          className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectTarget(prog.id)}
                          title="Hedefim Olarak Belirle"
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-600 text-slate-500 hover:text-white flex items-center justify-center mx-auto transition"
                        >
                          +
                        </button>
                      )}
                    </td>

                    {/* Program Kodu */}
                    <td className="py-3 px-3 font-mono text-xs font-bold text-slate-600">
                      {prog.kilavuzKodu}
                    </td>

                    {/* Üniversite */}
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900 leading-tight">
                        {prog.university}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{prog.city}</span>
                        <span>•</span>
                        <span className={`px-1 rounded text-[9px] font-bold ${prog.universityType === 'DEVLET' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                          {prog.universityType}
                        </span>
                      </div>
                    </td>

                    {/* Program & Fakülte */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-extrabold leading-tight">
                        {prog.department}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium line-clamp-1">
                        {prog.faculty || 'Lisans Programı'} ({prog.instructionLanguage}) ({prog.scholarship})
                      </div>
                    </td>

                    {/* Kontenjan */}
                    <td className="py-3 px-2 text-center font-bold text-slate-700">
                      {prog.quota}
                    </td>

                    {/* Doluluk */}
                    <td className="py-3 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        %100
                      </span>
                    </td>

                    {/* Başarı Sırası */}
                    <td className="py-3 px-3 text-center">
                      {viewMode === 'OZET' ? (
                        <span className="text-xs sm:text-sm font-black text-indigo-700">
                          #{prog.rank > 0 ? prog.rank.toLocaleString() : '---'}
                        </span>
                      ) : (
                        <div className="text-[11px] font-bold space-y-0.5">
                          <span className="text-indigo-700 block">
                            #{prog.rank > 0 ? prog.rank.toLocaleString() : '---'}
                          </span>
                          <span className="text-slate-400 block text-[10px]">
                            {prog.rank1 ? '#' + prog.rank1.toLocaleString() : '-'} | {prog.rank2 ? '#' + prog.rank2.toLocaleString() : '-'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Taban Puan */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {prog.baseScore > 0 ? prog.baseScore : '---'}
                    </td>

                    {/* Netler Butonu */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setInspectProgram(prog)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-[11px] transition shadow-sm border border-indigo-200/80"
                      >
                        Net Analizi
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SEÇİLEN PROGRAMIN DETAYLI NET ANALİZİ MODALI (HEDEFE KALAN NET KIYASLAMASI) */}
      {inspectProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            
            {/* Modal Başlığı */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10">
                    ÖSYM Kodu: {inspectProgram.kilavuzKodu}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                    Sıralama: #{inspectProgram.rank.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  {inspectProgram.university}
                </h3>
                <p className="text-xs text-indigo-200 font-bold">
                  {inspectProgram.department} ({inspectProgram.city} • Taban Puan: {inspectProgram.baseScore})
                </p>
              </div>

              <button
                onClick={() => setInspectProgram(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Gövdesi: Karşılaştırmalı Net Tablosu */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pb-2 border-b border-slate-100">
                <span>Ders Bazlı Kıyaslama Tablosu</span>
                <span className="text-indigo-600 font-bold">Emir'in Ortalaması vs YÖK Atlas</span>
              </div>

              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-black text-slate-600">
                    <th className="py-2 px-3">Ders</th>
                    <th className="py-2 px-3 text-center">Emir'in Neti</th>
                    <th className="py-2 px-3 text-center">YÖK Atlas Net</th>
                    <th className="py-2 px-3 text-right">Durum / Fark</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Aşama TYT */}
                  <tr className="bg-slate-50 font-bold text-[11px] text-indigo-900">
                    <td colSpan="4" className="py-1 px-3 uppercase tracking-wider">
                      1. AŞAMA (TYT) DERSLERİ
                    </td>
                  </tr>
                  <NetGapRow label="Türkçe (40 Soru)" current={emirNets.tytTurkce} target={inspectProgram.nets.tytTurkce} />
                  <NetGapRow label="Temel Matematik (40 Soru)" current={emirNets.tytMatematik} target={inspectProgram.nets.tytMatematik} />
                  <NetGapRow label="Sosyal Bilimler (20 Soru)" current={emirNets.tytSosyal} target={inspectProgram.nets.tytSosyal} />
                  <NetGapRow label="Fen Bilimleri (20 Soru)" current={emirNets.tytFen} target={inspectProgram.nets.tytFen} />
                  <NetGapRow label="TOPLAM TYT NETİ" current={emirNets.tytTotal} target={inspectProgram.nets.tytTotal} isTotal={true} />

                  {/* 2. Aşama AYT */}
                  <tr className="bg-slate-50 font-bold text-[11px] text-purple-900">
                    <td colSpan="4" className="py-1 px-3 uppercase tracking-wider">
                      2. AŞAMA (AYT - EŞİT AĞIRLIK) DERSLERİ
                    </td>
                  </tr>
                  <NetGapRow label="AYT Matematik (40 Soru)" current={emirNets.aytMatematik} target={inspectProgram.nets.aytMatematik} />
                  <NetGapRow label="Türk Dili ve Edebiyatı (24 Soru)" current={emirNets.aytEdebiyat} target={inspectProgram.nets.aytEdebiyat} />
                  <NetGapRow label="Tarih-1 (10 Soru)" current={emirNets.aytTarih1} target={inspectProgram.nets.aytTarih1} />
                  <NetGapRow label="Coğrafya-1 (6 Soru)" current={emirNets.aytCografya1} target={inspectProgram.nets.aytCografya1} />
                  <NetGapRow label="TOPLAM AYT NETİ" current={emirNets.aytTotal} target={inspectProgram.nets.aytTotal} isTotal={true} />
                </tbody>
              </table>

              {/* Koç Tavsiye Notu */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Rehberlik Değerlendirmesi:</span>
                  Bu bölüme yerleşen son öğrencinin TYT toplam neti <b>{inspectProgram.nets.tytTotal}</b>, AYT toplam neti ise <b>{inspectProgram.nets.aytTotal}</b> olarak gerçekleşti. Emir'in mevcut deneme ortalamalarıyla farklar yukarıdaki tabloda netleşmiştir.
                </div>
              </div>

            </div>

            {/* Modal Alt Barı: Hedef Olarak Seç & YÖK Atlas Sayfasına Git */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={inspectProgram.yokAtlasUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
              >
                <span>Resmi YÖK Atlas Sayfası</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectProgram(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition"
                >
                  Kapat
                </button>
                <button
                  onClick={() => {
                    onSelectTarget(inspectProgram.id);
                    setInspectProgram(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-200"
                >
                  Hedefim Olarak Belirle
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
