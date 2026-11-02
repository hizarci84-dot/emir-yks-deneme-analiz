// Emir YKS EA - Yerel Depolama ve Bulut Senkronizasyon Servisi

const STORAGE_KEY_EXAMS = 'emir_yks_exams_v1';
const STORAGE_KEY_TARGET = 'emir_yks_target_v1';
const STORAGE_KEY_SETTINGS = 'emir_yks_settings_v1';

// 11. Sınıf Maarif Modeli Başlangıç Örnek Denemeleri
export const INITIAL_SAMPLE_EXAMS = [
  {
    id: 'exam-1',
    title: 'Özdebir 11. Sınıf Güz Denemesi (1. Aşama TYT)',
    date: '2026-10-05',
    stage: 'TYT',
    institution: 'Özdebir Yayınları',
    difficulty: 'Orta',
    notes: 'Dönemin ilk genel denemesi. Matematik problemlerinde zaman yönetimine dikkat edilmeli.',
    subjects: {
      tyt_turkce: { questionCount: 40, correct: 28, wrong: 8, blank: 4, net: 26.0 },
      tyt_matematik: { questionCount: 40, correct: 22, wrong: 6, blank: 12, net: 20.5 },
      tyt_sosyal: { questionCount: 20, correct: 14, wrong: 4, blank: 2, net: 13.0 },
      tyt_fen: { questionCount: 20, correct: 6, wrong: 4, blank: 10, net: 5.0 }
    },
    totalQuestions: 120,
    totalCorrect: 70,
    totalWrong: 22,
    totalBlank: 28,
    totalNet: 64.5,
    successPercentage: 53.75
  },
  {
    id: 'exam-2',
    title: '3D Yayınları 11. Sınıf EA Alan Denemesi (2. Aşama AYT)',
    date: '2026-10-15',
    stage: 'AYT',
    institution: '3D Yayınları',
    difficulty: 'Zor',
    notes: 'Trigonometri ve Divan edebiyatı ağırlıklı. Matematikte analitik geometri iyi geçti.',
    subjects: {
      ayt_matematik: { questionCount: 40, correct: 21, wrong: 5, blank: 14, net: 19.75 },
      ayt_edebiyat: { questionCount: 24, correct: 17, wrong: 4, blank: 3, net: 16.0 },
      ayt_tarih1: { questionCount: 10, correct: 7, wrong: 2, blank: 1, net: 6.5 },
      ayt_cografya1: { questionCount: 6, correct: 4, wrong: 1, blank: 1, net: 3.75 }
    },
    totalQuestions: 80,
    totalCorrect: 49,
    totalWrong: 12,
    totalBlank: 19,
    totalNet: 46.0,
    successPercentage: 57.5
  },
  {
    id: 'exam-3',
    title: 'Okul Özel Tarama Sınavı (Farklı Soru Sayısı Örneği)',
    date: '2026-10-22',
    stage: 'TYT',
    institution: 'Okul / Dershane Denemesi',
    difficulty: 'Orta',
    notes: 'Okulda 11. sınıf için yapılan 80 soruluk özel deneme (Türkçe 30, Mat 30, Sosyal 10, Fen 10).',
    subjects: {
      tyt_turkce: { questionCount: 30, correct: 24, wrong: 4, blank: 2, net: 23.0 },
      tyt_matematik: { questionCount: 30, correct: 20, wrong: 3, blank: 7, net: 19.25 },
      tyt_sosyal: { questionCount: 10, correct: 8, wrong: 1, blank: 1, net: 7.75 },
      tyt_fen: { questionCount: 10, correct: 4, wrong: 2, blank: 4, net: 3.5 }
    },
    totalQuestions: 80,
    totalCorrect: 56,
    totalWrong: 10,
    totalBlank: 14,
    totalNet: 53.5,
    successPercentage: 66.88
  },
  {
    id: 'exam-4',
    title: 'Bilgi Sarmal 1. Aşama TYT Genel Deneme-2',
    date: '2026-10-28',
    stage: 'TYT',
    institution: 'Bilgi Sarmal',
    difficulty: 'Orta',
    notes: 'Türkçe paragrafta net artışı var. Matematik yeni nesil problem modellemelerinde gelişme sağlandı.',
    subjects: {
      tyt_turkce: { questionCount: 40, correct: 31, wrong: 5, blank: 4, net: 29.75 },
      tyt_matematik: { questionCount: 40, correct: 25, wrong: 4, blank: 11, net: 24.0 },
      tyt_sosyal: { questionCount: 20, correct: 15, wrong: 3, blank: 2, net: 14.25 },
      tyt_fen: { questionCount: 20, correct: 7, wrong: 3, blank: 10, net: 6.25 }
    },
    totalQuestions: 120,
    totalCorrect: 78,
    totalWrong: 15,
    totalBlank: 27,
    totalNet: 74.25,
    successPercentage: 61.88
  }
];

export const StorageService = {
  // Denemeleri Getir
  getExams: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EXAMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(INITIAL_SAMPLE_EXAMS));
        return INITIAL_SAMPLE_EXAMS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('LocalStorage okuma hatası:', e);
      return INITIAL_SAMPLE_EXAMS;
    }
  },

  // Denemeleri Kaydet
  saveExams: (exams) => {
    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
      return true;
    } catch (e) {
      console.error('LocalStorage yazma hatası:', e);
      return false;
    }
  },

  // Yeni Deneme Ekle
  addExam: (examData) => {
    const exams = StorageService.getExams();
    const newExam = {
      ...examData,
      id: 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString()
    };
    exams.unshift(newExam); // En başa ekle
    StorageService.saveExams(exams);
    return newExam;
  },

  // Deneme Güncelle
  updateExam: (updatedExam) => {
    const exams = StorageService.getExams();
    const index = exams.findIndex(e => e.id === updatedExam.id);
    if (index !== -1) {
      exams[index] = { ...updatedExam, updatedAt: new Date().toISOString() };
      StorageService.saveExams(exams);
      return true;
    }
    return false;
  },

  // Deneme Sil
  deleteExam: (id) => {
    const exams = StorageService.getExams();
    const filtered = exams.filter(e => e.id !== id);
    StorageService.saveExams(filtered);
    return true;
  },

  // Hedef Üniversite / Bölüm Kaydet & Getir
  getTargetProgram: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TARGET);
      return data ? JSON.parse(data) : 'yok_102270154'; // Varsayılan: Boğaziçi YBS
    } catch {
      return 'yok_102270154';
    }
  },

  saveTargetProgram: (targetId) => {
    try {
      localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(targetId));
      return true;
    } catch {
      return false;
    }
  },

  // Bulut ve Öğrenci Ayarları
  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return data ? JSON.parse(data) : {
        studentName: 'Emir',
        grade: '11. Sınıf',
        track: 'Eşit Ağırlık (EA)',
        targetYear: 2028,
        cloudSyncCode: 'EMIR-YKS-2028',
        firebaseConfig: null,
        lastCloudSync: null
      };
    } catch {
      return {
        studentName: 'Emir',
        grade: '11. Sınıf',
        track: 'Eşit Ağırlık (EA)',
        targetYear: 2028,
        cloudSyncCode: 'EMIR-YKS-2028'
      };
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  },

  // JSON Yedek Dışa Aktar
  exportJSON: () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      student: StorageService.getSettings(),
      target: StorageService.getTargetProgram(),
      exams: StorageService.getExams()
    };
    return JSON.stringify(backup, null, 2);
  },

  // JSON Yedek İçe Aktar
  importJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.exams && Array.isArray(parsed.exams)) {
        StorageService.saveExams(parsed.exams);
        if (parsed.target) StorageService.saveTargetProgram(parsed.target);
        if (parsed.student) StorageService.saveSettings(parsed.student);
        return { success: true, count: parsed.exams.length };
      }
      return { success: false, message: 'Geçersiz veri formatı.' };
    } catch (err) {
      return { success: false, message: 'JSON ayrıştırma hatası: ' + err.message };
    }
  },

  // WhatsApp Rapor Formatı Oluşturucu
  generateWhatsAppReport: (exams, targetInfo) => {
    if (!exams || exams.length === 0) return 'Kayıtlı deneme bulunmuyor.';
    const latest = exams[0];
    const settings = StorageService.getSettings();

    let msg = `📊 *${settings.studentName} - YKS EA Deneme Sınav Raporu*\n`;
    msg += `📅 Sınav: ${latest.title}\n`;
    msg += `🗓 Tarih: ${latest.date} | Aşama: ${latest.stage}\n`;
    msg += `🏢 Yayın: ${latest.institution || 'Belirtilmedi'}\n`;
    msg += `------------------------------------\n`;
    
    msg += `📈 *DERS NETLERİ:*\n`;
    Object.entries(latest.subjects || {}).forEach(([key, val]) => {
      let subjectName = key.replace('tyt_', 'TYT ').replace('ayt_', 'AYT ').toUpperCase();
      msg += `• ${subjectName}: ${val.correct}D / ${val.wrong}Y / ${val.blank}B -> *${val.net.toFixed(2)} Net* (Top. ${val.questionCount} Soru)\n`;
    });

    msg += `------------------------------------\n`;
    msg += `🎯 *TOPLAM: ${latest.totalNet.toFixed(2)} Net* (%${latest.successPercentage?.toFixed(1) || 0} Başarı)\n`;
    
    if (targetInfo) {
      msg += `\n🎯 *HEDEF:* ${targetInfo.university} - ${targetInfo.department}\n`;
      msg += `📌 YÖK Atlas Hedef Neti: TYT ~${targetInfo.nets.tytTotal} | AYT ~${targetInfo.nets.aytTotal}\n`;
    }

    if (latest.notes) {
      msg += `\n📝 *Öğrenci/Koç Notu:* ${latest.notes}\n`;
    }

    return encodeURIComponent(msg);
  }
};
