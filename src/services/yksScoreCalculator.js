// ÖSYM Resmi YKS Katsayıları, Puan Hesaplama ve Sıralama Simülatörü Servisi
// Eşit Ağırlık (EA) ve Temel Yeterlilik Testi (TYT) Standartları

export const YKS_COEFFICIENTS = {
  // ÖSYM Taban Puanı
  BASE_SCORE: 100.0,

  // TYT Puanı Hesaplama Katsayıları (Ham 100 - 500 Puan Ölçeği)
  TYT_ONLY: {
    turkce: 3.30,      // 40 soru x 3.30 = 132.0 puan
    matematik: 3.30,   // 40 soru x 3.30 = 132.0 puan
    sosyal: 3.40,      // 20 soru x 3.40 = 68.0 puan
    fen: 3.40          // 20 soru x 3.40 = 68.0 puan
    // Toplam test katkısı = 400.0 puan + 100 taban = 500.00 tam puan
  },

  // YKS EA Puanında TYT'nin %40 Payı (Maksimum 160 Puan)
  TYT_EA_CONTRIBUTION: {
    turkce: 1.32,      // 40 x 1.32 = 52.8 puan
    matematik: 1.32,   // 40 x 1.32 = 52.8 puan
    sosyal: 1.36,      // 20 x 1.36 = 27.2 puan
    fen: 1.36          // 20 x 1.36 = 27.2 puan
    // Toplam = 160.00 puan
  },

  // YKS EA Puanında AYT'nin %60 Payı (Maksimum 240 Puan)
  AYT_EA_CONTRIBUTION: {
    matematik: 3.00,       // 40 x 3.00 = 120.0 puan
    edebiyat: 3.00,        // 24 x 3.00 = 72.0 puan
    tarih1: 2.80,          // 10 x 2.80 = 28.0 puan
    cografya1: 3.333333    // 6 x 3.333 = 20.0 puan
    // Toplam = 240.00 puan
  },

  // OBP (Ortaöğretim Başarı Puanı) Katsayıları
  OBP: {
    NORMAL_MULTIPLIER: 0.12,  // Diploma Notu x 5 x 0.12 = Diploma Notu x 0.60
    BROKEN_MULTIPLIER: 0.06   // Kırık OBP (Önceki yıl yerleştiyse yarı yarıya düşer)
  }
};

/**
 * Ortaöğretim Başarı Puanı (OBP) ve Yerleştirme Katkısını Hesaplar
 * @param {number} diplomaGrade - 0 ile 100 arası diploma notu
 * @param {boolean} isBroken - Kırık OBP durumu (önceki yıl yerleştiyse)
 */
export function calculateObp(diplomaGrade = 85.0, isBroken = false) {
  const grade = Math.min(100, Math.max(50, parseFloat(diplomaGrade) || 50));
  const obpScore = grade * 5; // 250 - 500 aralığında
  const multiplier = isBroken 
    ? YKS_COEFFICIENTS.OBP.BROKEN_MULTIPLIER 
    : YKS_COEFFICIENTS.OBP.NORMAL_MULTIPLIER;
  const contribution = obpScore * multiplier; // 30 - 60 puan (kırık ise 15 - 30)

  return {
    diplomaGrade: grade,
    obpScore: parseFloat(obpScore.toFixed(2)),
    contribution: parseFloat(contribution.toFixed(2)),
    isBroken,
    multiplier
  };
}

/**
 * TYT Ham ve Yerleştirme Puanını Hesaplar
 */
export function calculateTytScore(nets = {}, obpContribution = 0) {
  const tr = Math.max(0, parseFloat(nets.tytTurkce || 0));
  const mat = Math.max(0, parseFloat(nets.tytMatematik || 0));
  const sos = Math.max(0, parseFloat(nets.tytSosyal || 0));
  const fen = Math.max(0, parseFloat(nets.tytFen || 0));

  const c = YKS_COEFFICIENTS.TYT_ONLY;
  const rawScore = YKS_COEFFICIENTS.BASE_SCORE + 
    (tr * c.turkce) + 
    (mat * c.matematik) + 
    (sos * c.sosyal) + 
    (fen * c.fen);

  const clampedRaw = Math.min(500, Math.max(100, rawScore));
  const placementScore = clampedRaw + (obpContribution || 0);

  return {
    rawScore: parseFloat(clampedRaw.toFixed(3)),
    placementScore: parseFloat(placementScore.toFixed(3)),
    totalNet: parseFloat((tr + mat + sos + fen).toFixed(2))
  };
}

/**
 * YKS Eşit Ağırlık (EA) Ham ve Yerleştirme Puanını Hesaplar
 */
export function calculateEaScore(tytNets = {}, aytNets = {}, obpContribution = 0) {
  // TYT Netleri
  const tytTr = Math.max(0, parseFloat(tytNets.tytTurkce || 0));
  const tytMat = Math.max(0, parseFloat(tytNets.tytMatematik || 0));
  const tytSos = Math.max(0, parseFloat(tytNets.tytSosyal || 0));
  const tytFen = Math.max(0, parseFloat(tytNets.tytFen || 0));

  // AYT Netleri
  const aytMat = Math.max(0, parseFloat(aytNets.aytMatematik || 0));
  const aytEde = Math.max(0, parseFloat(aytNets.aytEdebiyat || 0));
  const aytTrh = Math.max(0, parseFloat(aytNets.aytTarih1 || 0));
  const aytCog = Math.max(0, parseFloat(aytNets.aytCografya1 || 0));

  // Katkı Hesaplamaları
  const tytC = YKS_COEFFICIENTS.TYT_EA_CONTRIBUTION;
  const aytC = YKS_COEFFICIENTS.AYT_EA_CONTRIBUTION;

  const tytContribution = 
    (tytTr * tytC.turkce) + 
    (tytMat * tytC.matematik) + 
    (tytSos * tytC.sosyal) + 
    (tytFen * tytC.fen);

  const aytContribution = 
    (aytMat * aytC.matematik) + 
    (aytEde * aytC.edebiyat) + 
    (aytTrh * aytC.tarih1) + 
    (aytCog * aytC.cografya1);

  const rawScore = YKS_COEFFICIENTS.BASE_SCORE + tytContribution + aytContribution;
  const clampedRaw = Math.min(500, Math.max(100, rawScore));
  const placementScore = clampedRaw + (obpContribution || 0);

  return {
    rawScore: parseFloat(clampedRaw.toFixed(3)),
    placementScore: parseFloat(placementScore.toFixed(3)),
    tytContribution: parseFloat(tytContribution.toFixed(2)),
    aytContribution: parseFloat(aytContribution.toFixed(2)),
    tytTotalNet: parseFloat((tytTr + tytMat + tytSos + tytFen).toFixed(2)),
    aytTotalNet: parseFloat((aytMat + aytEde + aytTrh + aytCog).toFixed(2))
  };
}

/**
 * ÖSYM Resmi YKS EA Sıralama Eğrisine Göre Yaklaşık Başarı Sırasını Tahmin Eder
 * (2022, 2023 ve 2024 ÖSYM Eşit Ağırlık Yığılma Verileri)
 * @param {number} placementScore - Yerleştirme EA Puanı (örn: 485.6)
 */
export function estimateEaRanking(placementScore) {
  const p = Math.min(560, Math.max(150, parseFloat(placementScore) || 200));

  // [Puan Eşiği, Alt Sıralama, Üst Sıralama, Yüzdelik Dilim Açıklaması]
  const brackets = [
    { minP: 535, minRank: 1, maxRank: 150, pct: 'İlk %0.01 (Zirve Derece)' },
    { minP: 515, minRank: 150, maxRank: 650, pct: 'İlk %0.05 (Boğaziçi / Koç Zirvesi)' },
    { minP: 490, minRank: 650, maxRank: 1800, pct: 'İlk %0.15 (Seçkin Hukuk & YBS)' },
    { minP: 465, minRank: 1800, maxRank: 4500, pct: 'İlk %0.35 (Köklü Devlet Hukuk & İktisat)' },
    { minP: 440, minRank: 4500, maxRank: 9500, pct: 'İlk %0.75 (İlk 10 Bin Bandı)' },
    { minP: 415, minRank: 9500, maxRank: 18500, pct: 'İlk %1.45 (İlk 20 Bin Bandı)' },
    { minP: 390, minRank: 18500, maxRank: 33000, pct: 'İlk %2.60 (İlk 35 Bin Bandı)' },
    { minP: 365, minRank: 33000, maxRank: 58000, pct: 'İlk %4.50' },
    { minP: 340, minRank: 58000, maxRank: 98000, pct: 'İlk %7.50' },
    { minP: 315, minRank: 98000, maxRank: 155000, pct: 'İlk %12.00' },
    { minP: 290, minRank: 155000, maxRank: 240000, pct: 'İlk %18.50' },
    { minP: 260, minRank: 240000, maxRank: 380000, pct: 'İlk %29.00' },
    { minP: 220, minRank: 380000, maxRank: 600000, pct: 'İlk %45.00' },
    { minP: 0, minRank: 600000, maxRank: 950000, pct: '%50+' }
  ];

  let matched = brackets[brackets.length - 1];
  for (let i = 0; i < brackets.length; i++) {
    if (p >= brackets[i].minP) {
      matched = brackets[i];
      break;
    }
  }

  // Tahmini orta değer
  const midRank = Math.round((matched.minRank + matched.maxRank) / 2);

  return {
    placementScore: p,
    minRank: matched.minRank,
    maxRank: matched.maxRank,
    midRank,
    rankString: `#${matched.minRank.toLocaleString()} - #${matched.maxRank.toLocaleString()}`,
    percentile: matched.pct
  };
}

/**
 * Tek bir deneme sınavının sonuçlarına göre YKS Puanı, Sıralama ve Bölüm Eşleştirmesi Hesaplar
 * @param {object} exam - İncelenen tekil deneme nesnesi
 * @param {array} allExams - Tüm denemeler listesi (tamamlayıcı aşama netlerini bulmak için)
 * @param {number} diplomaGrade - 100 üzerinden diploma notu
 * @param {boolean} isBrokenObp - Kırık OBP durumu
 */
export function calculateIndividualExamScore(exam, allExams = [], diplomaGrade = 88.5, isBrokenObp = false) {
  if (!exam) return null;

  const obpInfo = calculateObp(diplomaGrade, isBrokenObp);
  const isTyt = exam.stage === 'TYT';
  const isAyt = exam.stage === 'AYT';

  // Tüm denemelerdeki ortalama tamamlayıcı netler
  const allNets = extractNetsFromExams(allExams, 'AVERAGE');

  let activeTyt = {};
  let activeAyt = {};

  if (isTyt) {
    // İncelenen sınavın TYT netleri
    activeTyt = {
      tytTurkce: exam.subjects?.tyt_turkce?.net || 0,
      tytMatematik: exam.subjects?.tyt_matematik?.net || 0,
      tytSosyal: exam.subjects?.tyt_sosyal?.net || 0,
      tytFen: exam.subjects?.tyt_fen?.net || 0,
    };
    // Tamamlayıcı olarak öğrencinin mevcut AYT net ortalamasını kullan
    activeAyt = {
      aytMatematik: allNets.ayt.aytMatematik || 20.0,
      aytEdebiyat: allNets.ayt.aytEdebiyat || 17.0,
      aytTarih1: allNets.ayt.aytTarih1 || 6.5,
      aytCografya1: allNets.ayt.aytCografya1 || 3.5,
    };
  } else if (isAyt) {
    // İncelenen sınavın AYT netleri
    activeAyt = {
      aytMatematik: exam.subjects?.ayt_matematik?.net || 0,
      aytEdebiyat: exam.subjects?.ayt_edebiyat?.net || 0,
      aytTarih1: exam.subjects?.ayt_tarih1?.net || 0,
      aytCografya1: exam.subjects?.ayt_cografya1?.net || 0,
    };
    // Tamamlayıcı olarak öğrencinin mevcut TYT net ortalamasını kullan
    activeTyt = {
      tytTurkce: allNets.tyt.tytTurkce || 28.0,
      tytMatematik: allNets.tyt.tytMatematik || 22.0,
      tytSosyal: allNets.tyt.tytSosyal || 13.0,
      tytFen: allNets.tyt.tytFen || 6.0,
    };
  }

  // TYT Skoru
  const tytResult = calculateTytScore(activeTyt, obpInfo.contribution);
  // YKS EA Skoru
  const eaResult = calculateEaScore(activeTyt, activeAyt, obpInfo.contribution);
  // Sıralama
  const ranking = estimateEaRanking(eaResult.placementScore);

  return {
    examId: exam.id,
    examTitle: exam.title,
    examDate: exam.date,
    stage: exam.stage,
    totalNet: exam.totalNet,
    obpInfo,
    tytResult,
    eaResult,
    ranking,
    pairedStage: isTyt ? 'AYT Ortalaması ile Birlikte' : 'TYT Ortalaması ile Birlikte'
  };
}

/**
 * Deneme listesinden ortalama veya son deneme netlerini çıkartır
 */
export function extractNetsFromExams(exams = [], mode = 'AVERAGE') {
  const tytExams = exams.filter(e => e.stage === 'TYT');
  const aytExams = exams.filter(e => e.stage === 'AYT');

  const getSub = (subId, list) => {
    if (list.length === 0) return 0;
    if (mode === 'LATEST') {
      const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
      return sorted[0]?.subjects?.[subId]?.net || 0;
    }
    const valid = list.filter(e => e.subjects && e.subjects[subId]);
    if (valid.length === 0) return 0;
    const total = valid.reduce((sum, e) => sum + (e.subjects[subId].net || 0), 0);
    return parseFloat((total / valid.length).toFixed(2));
  };

  return {
    tyt: {
      tytTurkce: getSub('tyt_turkce', tytExams),
      tytMatematik: getSub('tyt_matematik', tytExams),
      tytSosyal: getSub('tyt_sosyal', tytExams),
      tytFen: getSub('tyt_fen', tytExams),
      examCount: tytExams.length
    },
    ayt: {
      aytMatematik: getSub('ayt_matematik', aytExams),
      aytEdebiyat: getSub('ayt_edebiyat', aytExams),
      aytTarih1: getSub('ayt_tarih1', aytExams),
      aytCografya1: getSub('ayt_cografya1', aytExams),
      examCount: aytExams.length
    }
  };
}
