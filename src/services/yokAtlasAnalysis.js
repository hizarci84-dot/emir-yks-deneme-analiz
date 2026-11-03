// YÖK Atlas Çok Yıllı Sıralama, Trend Analizi ve Gerçekçi Yerleşme Risk Motoru
// Kaynak: YÖK Atlas Resmi Tercih Sihirbazı İstatistikleri (2023 - 2024 - 2025)

/**
 * Bir programın 3 yıllık (2025, 2024, 2023) başarı sırası ve taban puan verilerini normalize eder
 * @param {object} prog - YÖK Atlas program nesnesi
 */
export function getProgramMultiYearData(prog) {
  if (!prog) return null;

  const r2025 = parseInt(prog.rank, 10) || 0;
  const r2024 = parseInt(prog.rank1, 10) || r2025;
  const r2023 = parseInt(prog.rank2, 10) || r2024 || r2025;

  const score2025 = parseFloat(prog.baseScore) || 0;
  const score2024 = parseFloat(prog.baseScore1) || score2025;

  // 3 Yıllık Ağırlıklı Ortalama: En güncel yıl %50, bir önceki %30, 2 yıl önceki %20
  const weightedAvgRank = Math.round(
    (r2025 * 0.50) + (r2024 * 0.30) + (r2023 * 0.20)
  );

  // Kötümser / En Zor Yıl (Sayısal olarak en küçük sıralama)
  const peakRank = Math.min(
    r2025 > 0 ? r2025 : Infinity,
    r2024 > 0 ? r2024 : Infinity,
    r2023 > 0 ? r2023 : Infinity
  );

  // İyimser / En Kolay Yıl (Sayısal olarak en büyük sıralama)
  const relaxedRank = Math.max(r2025, r2024, r2023);

  // 3 Yıllık Trend Hesaplama
  const trend = calculateTrend(r2025, r2024, r2023);

  return {
    rank2025: r2025,
    rank2024: r2024,
    rank2023: r2023,
    score2025,
    score2024,
    weightedAvgRank,
    peakRank: peakRank === Infinity ? r2025 : peakRank,
    relaxedRank,
    trend
  };
}

/**
 * 3 yıllık sıralama hareketine göre trend ve risk yüzdesini hesaplar
 * Not: Sıralamalarda sayının küçülmesi (örn: 253 -> 105), bölümün zorlaştığını ve yükseldiğini gösterir.
 */
export function calculateTrend(r2025, r2024, r2023) {
  if (!r2025 || !r2024) {
    return {
      type: 'STABLE',
      label: 'İstikrarlı',
      icon: '⚖️',
      changePct: 0,
      description: 'Yeterli geçmiş yıl verisi bulunmuyor, sıralama sabit kabul edilmiştir.',
      color: 'slate',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      isSurging: false
    };
  }

  // 2024'ten 2025'e değişim yüzdesi
  // (r2024 - r2025) / r2024 > 0 ise bölüm ileri gitmiş / zorlaşmıştır.
  const oneYearChange = ((r2024 - r2025) / r2024) * 100;

  // 2023'ten 2025'e kümülatif 3 yıllık değişim
  const baseline = r2023 || r2024;
  const threeYearChange = ((baseline - r2025) / baseline) * 100;

  const pct = parseFloat(threeYearChange.toFixed(1));

  if (threeYearChange >= 8.0 || oneYearChange >= 10.0) {
    return {
      type: 'SURGING',
      label: 'Hızla Yükseliyor (Zorlaşıyor)',
      shortLabel: 'Yükselişte',
      icon: '📈',
      changePct: pct,
      description: `Bu bölüm son 3 yılda %${Math.abs(pct)} oranında öne çekti ve zorlaştı. Tek bir eski yıla bakarak tercih yapmak risklidir.`,
      color: 'rose',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      isSurging: true
    };
  } else if (threeYearChange <= -8.0 || oneYearChange <= -10.0) {
    return {
      type: 'SOFTENING',
      label: 'Gevşeme Eğiliminde (Kolaylaşıyor)',
      shortLabel: 'Gevşiyor',
      icon: '📉',
      changePct: pct,
      description: `Bu bölümün sıralaması son 3 yılda %${Math.abs(pct)} gevşedi. Tercih listesinde fırsat alanı oluşturabilir.`,
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isSurging: false
    };
  } else {
    return {
      type: 'STABLE',
      label: 'Dengeli / İstikrarlı',
      shortLabel: 'İstikrarlı',
      icon: '⚖️',
      changePct: pct,
      description: 'Bölümün sıralaması son 3 yıldır dengeli bir seyir izlemektedir.',
      color: 'indigo',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      isSurging: false
    };
  }
}

/**
 * Öğrencinin sıralamasına ve seçilen senaryoya göre çok yıllı gerçekçi kabul analizini yapar
 * @param {object} prog - Program nesnesi
 * @param {number} userRank - Öğrencinin tahmini YKS sıralaması
 * @param {string} scenario - 'WEIGHTED_AVG' (Önerilen), 'LATEST_2025', 'PEAK_SAFE' (En Zor Yıl)
 */
export function evaluateProgramSafety(prog, userRank, scenario = 'WEIGHTED_AVG') {
  const multi = getProgramMultiYearData(prog);
  if (!multi || !userRank) {
    return {
      ...prog,
      multi,
      status: 'HEDEF',
      statusLabel: 'Hedef Bandı',
      statusColor: 'indigo',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      effectiveRank: prog.rank || 0,
      rankDiff: (userRank || 0) - (prog.rank || 0),
      riskAlert: null
    };
  }

  // Senaryoya göre baz alınan sıralama
  let effectiveRank = multi.weightedAvgRank;
  if (scenario === 'LATEST_2025') {
    effectiveRank = multi.rank2025;
  } else if (scenario === 'PEAK_SAFE') {
    effectiveRank = multi.peakRank;
  }

  const diff = userRank - effectiveRank;

  // Gerçekçi Rehberlik Önlemleri & Durum Sınıflandırması
  let status = 'HEDEF';
  let statusLabel = 'Hedef Bandı';
  let statusColor = 'indigo';
  let badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let riskAlert = null;

  // 1. Durum: Güvenli / Banko Tercih
  // Öğrencinin sıralaması, bölümün son 3 yıldaki en zor (en küçük) sıralamasından bile en az %12 daha iyiyse
  if (userRank <= multi.peakRank * 0.88) {
    status = 'GARANTI';
    statusLabel = 'Yüksek İhtimalle Kazanır (Banko)';
    statusColor = 'emerald';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } 
  // 2. Durum: Kritik Trend Riski! (Kullanıcının özellikle uyardığı durum)
  // Eski yıla (2024) göre yetiyor gibi görünse de;
  // a) Bölüm 2025'te sert yükselmiş ve öğrencinin önünde kalmışsa VEYA
  // b) Bölüm genel yükseliş trendindeyse ve öğrenci kritik eşikteyse
  else if (
    (multi.trend.isSurging && userRank > multi.rank2025) ||
    (userRank <= multi.rank2024 && userRank > multi.rank2025)
  ) {
    status = 'TREND_RISK';
    statusLabel = '⚠️ Kritik Sınır / Trend Riski';
    statusColor = 'amber';
    badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
    riskAlert = {
      title: 'Tek Yıla Aldanma Riski!',
      message: `Bu bölüm 2024'te #${multi.rank2024.toLocaleString()} iken 2025'te fırlayarak #${multi.rank2025.toLocaleString()} oldu. Sadece eski yıla güvenmek açıkta bırakabilir!`
    };
  }
  // 3. Durum: İdeal Hedef Bandı
  // Sıralaması efektif ortalamanın ±%15 aralığındaysa
  else if (userRank <= effectiveRank * 1.15) {
    status = 'HEDEF';
    statusLabel = 'Kazanma İhtimali Yüksek (İdeal Hedef)';
    statusColor = 'indigo';
    badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
  }
  // 4. Durum: Zorlayıcı / Gayret Gerektiren Hedef
  else {
    status = 'GAYRET';
    statusLabel = 'Zorlayıcı Hedef (Daha Fazla Net Lazım)';
    statusColor = 'rose';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return {
    ...prog,
    multi,
    status,
    statusLabel,
    statusColor,
    badgeClass,
    effectiveRank,
    rankDiff: diff,
    riskAlert
  };
}

/**
 * Veritabanındaki tüm programları çok yıllı modele göre değerlendirip filtreler
 */
export function evaluateAllPrograms(programs = [], userRank = 50000, scenario = 'WEIGHTED_AVG') {
  return programs.map(p => evaluateProgramSafety(p, userRank, scenario));
}
