// Emir YKS EA - Yerel Depolama ve Bulut Senkronizasyon Servisi

const STORAGE_KEY_EXAMS = 'emir_yks_exams_v2';
const STORAGE_KEY_TARGET = 'emir_yks_target_v1';
const STORAGE_KEY_SETTINGS = 'emir_yks_settings_v2';

// Öğrenci Emir Uysal - Delta Kurs Resmi Sınav Sonuç Karneleri (Karne 1 & Karne 2)
export const EMIR_REAL_EXAMS = [
  {
    id: 'emir-exam-2',
    title: 'MAARİF ORİJİNAL TYT',
    date: '2026-10-18',
    stage: 'TYT',
    institution: 'Delta Kurs',
    examCode: '1104',
    bookletType: 'A',
    studentNo: '1086',
    studentClass: '1103',
    institutionScore: 326.430,
    institutionAverage: 324.360,
    percentile: '%50,00',
    institutionRank: '25 / 50',
    classRank: '3 / 11',
    osymEstimatedRank: '275.559',
    difficulty: 'Orta',
    notes: '18 Ekim 2026 Maarif Orijinal TYT Denemesi (Karne 1). Müthiş bir sıçrama: Net 39.75 ten 59.50 ye (+19.75 net artış!), TYT puanı 266.48 den 326.43 e yükseldi. Matematik 9 dan 18.5 nete çıkarak sınıf 1.si oldu. Sosyal Bilimler 17 doğru 0 yanlış ile harika sonuçlandı. Fen Bilimleri 8.25 net (Biyoloji 5 net ile sınıf 1.si).',
    subjects: {
      tyt_turkce: { questionCount: 40, correct: 18, wrong: 9, blank: 13, net: 15.75 },
      tyt_matematik: { questionCount: 40, correct: 19, wrong: 2, blank: 19, net: 18.50 },
      tyt_sosyal: { questionCount: 20, correct: 17, wrong: 0, blank: 3, net: 17.00 },
      tyt_fen: { questionCount: 20, correct: 9, wrong: 3, blank: 8, net: 8.25 }
    },
    subBranches: {
      sosyal: [
        { name: 'Tarih', questionCount: 5, correct: 5, wrong: 0, blank: 0, net: 5.00, rank: '1' },
        { name: 'Coğrafya', questionCount: 5, correct: 3, wrong: 0, blank: 2, net: 3.00, rank: '19' },
        { name: 'Felsefe', questionCount: 5, correct: 4, wrong: 0, blank: 1, net: 4.00, rank: '8' },
        { name: 'Din Kültürü', questionCount: 5, correct: 5, wrong: 0, blank: 0, net: 5.00, rank: '1' }
      ],
      fen: [
        { name: 'Fizik', questionCount: 7, correct: 3, wrong: 1, blank: 3, net: 2.75, rank: '36' },
        { name: 'Kimya', questionCount: 7, correct: 1, wrong: 2, blank: 4, net: 0.50, rank: '25' },
        { name: 'Biyoloji', questionCount: 6, correct: 5, wrong: 0, blank: 1, net: 5.00, rank: '3' }
      ]
    },
    totalQuestions: 120,
    totalCorrect: 63,
    totalWrong: 14,
    totalBlank: 43,
    totalNet: 59.50,
    successPercentage: 49.58
  },
  {
    id: 'emir-exam-1',
    title: 'ÇAP-MAARİF TYT',
    date: '2026-09-04',
    stage: 'TYT',
    institution: 'Delta Kurs',
    examCode: '1103',
    bookletType: 'B',
    studentNo: '1086',
    studentClass: '1103',
    institutionScore: 266.480,
    institutionAverage: 269.717,
    percentile: '%52,63',
    institutionRank: '10 / 19',
    classRank: '1 / 5',
    osymEstimatedRank: '719.156',
    difficulty: 'Orta',
    notes: '4 Eylül 2026 Çap-Maarif Sezon Başı TYT Denemesi (Karne 2). Türkçe 20.75 net ile sınıf 1.si oldu. Sosyal Bilimler 10 net, Matematik 9 net. Fen testine zaman ayrılmadı (0 net). Toplam 39.75 Net.',
    subjects: {
      tyt_turkce: { questionCount: 40, correct: 23, wrong: 9, blank: 8, net: 20.75 },
      tyt_matematik: { questionCount: 40, correct: 11, wrong: 8, blank: 21, net: 9.00 },
      tyt_sosyal: { questionCount: 20, correct: 11, wrong: 4, blank: 5, net: 10.00 },
      tyt_fen: { questionCount: 20, correct: 0, wrong: 0, blank: 20, net: 0.00 }
    },
    subBranches: {
      sosyal: [
        { name: 'Tarih', questionCount: 5, correct: 4, wrong: 1, blank: 0, net: 3.75, rank: '6' },
        { name: 'Coğrafya', questionCount: 5, correct: 0, wrong: 1, blank: 4, net: -0.25, rank: '16' },
        { name: 'Felsefe', questionCount: 5, correct: 4, wrong: 0, blank: 1, net: 4.00, rank: '11' },
        { name: 'Din Kültürü', questionCount: 5, correct: 3, wrong: 2, blank: 0, net: 2.50, rank: '16' }
      ],
      fen: [
        { name: 'Fizik', questionCount: 7, correct: 0, wrong: 0, blank: 7, net: 0.00, rank: '15' },
        { name: 'Kimya', questionCount: 7, correct: 0, wrong: 0, blank: 7, net: 0.00, rank: '14' },
        { name: 'Biyoloji', questionCount: 6, correct: 0, wrong: 0, blank: 6, net: 0.00, rank: '14' }
      ]
    },
    totalQuestions: 120,
    totalCorrect: 45,
    totalWrong: 21,
    totalBlank: 54,
    totalNet: 39.75,
    successPercentage: 33.13
  }
];

export const INITIAL_SAMPLE_EXAMS = EMIR_REAL_EXAMS;

export const StorageService = {
  // Denemeleri Getir
  getExams: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EXAMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(EMIR_REAL_EXAMS));
        return EMIR_REAL_EXAMS;
      }
      const parsed = JSON.parse(data);
      // Eski örnek deneme kalıntıları varsa temizle
      const hasMock = parsed.some(e => ['exam-1', 'exam-2', 'exam-3', 'exam-4'].includes(e.id) || (e.title && (e.title.includes('Özdebir') || e.title.includes('3D Yayınları'))));
      if (hasMock || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(EMIR_REAL_EXAMS));
        return EMIR_REAL_EXAMS;
      }
      return parsed;
    } catch (e) {
      console.error('LocalStorage okuma hatası:', e);
      return EMIR_REAL_EXAMS;
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
        studentName: 'Emir Uysal',
        studentNo: '1086',
        class: '1103 (11. Sınıf)',
        institution: 'Delta Kurs',
        grade: '11. Sınıf',
        track: 'Eşit Ağırlık (EA)',
        targetYear: 2028,
        diplomaGrade: 88.5,
        isObpBroken: false,
        cloudSyncCode: 'EMIR-YKS-2028',
        firebaseConfig: null,
        lastCloudSync: null
      };
    } catch {
      return {
        studentName: 'Emir Uysal',
        studentNo: '1086',
        class: '1103 (11. Sınıf)',
        institution: 'Delta Kurs',
        grade: '11. Sınıf',
        track: 'Eşit Ağırlık (EA)',
        targetYear: 2028,
        diplomaGrade: 88.5,
        isObpBroken: false,
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
