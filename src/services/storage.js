// Emir YKS EA - Yerel Depolama ve Gerçek Zamanlı Bulut Senkronizasyon Servisi

const STORAGE_KEY_EXAMS = 'emir_yks_exams_v2';
const STORAGE_KEY_TARGET = 'emir_yks_target_v1';
const STORAGE_KEY_SETTINGS = 'emir_yks_settings_v2';
const STORAGE_KEY_DELETED_IDS = 'emir_yks_deleted_ids_v1';
const STORAGE_KEY_UPDATED_AT = 'emir_yks_updated_at_v1';
const STORAGE_KEY_CHUNK_IDS = 'emir_yks_chunk_ids_v1';

// Bulut Senkronizasyon Sabitleri (Çift Katmanlı Gerçek Zamanlı Veritabanı)
const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
const MASTER_INDEX_ID = 'ff808181a09d98f701a1f07999634885';
const NTFY_TOPIC = 'emir_yks_2028_cloud_store_v1';
const CHUNK_SIZE = 720;

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

const DEFAULT_SETTINGS = {
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
  lastCloudSync: null
};

// Aktif senkronizasyon durumu izleyicileri
let syncStateListeners = [];
let currentCloudStatus = {
  state: 'IDLE', // 'IDLE', 'SYNCING', 'SYNCED', 'ERROR'
  lastSyncedAt: null,
  message: 'Bulut Aktif'
};

function notifySyncListeners(patch) {
  currentCloudStatus = { ...currentCloudStatus, ...patch };
  syncStateListeners.forEach(fn => {
    try { fn(currentCloudStatus); } catch (e) { console.error(e); }
  });
}

export const StorageService = {
  // Bulut durumunu oku veya dinle
  getCloudStatus: () => currentCloudStatus,
  onCloudStatusChange: (listener) => {
    syncStateListeners.push(listener);
    listener(currentCloudStatus);
    return () => {
      syncStateListeners = syncStateListeners.filter(l => l !== listener);
    };
  },

  // Silinen deneme ID'lerini takip et (Farklı cihazlarda silinen denemenin geri gelmesini önler)
  getDeletedIds: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveDeletedIds: (ids) => {
    try {
      localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(new Set(ids))));
    } catch (e) {
      console.error(e);
    }
  },

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
  saveExams: (exams, skipCloud = false) => {
    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_UPDATED_AT, now);
      if (!skipCloud) {
        StorageService.pushToCloud();
      }
      return true;
    } catch (e) {
      console.error('LocalStorage yazma hatası:', e);
      return false;
    }
  },

  // Yeni Deneme Ekle
  addExam: (examData) => {
    const exams = StorageService.getExams();
    const now = new Date().toISOString();
    const newExam = {
      ...examData,
      id: 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: now,
      updatedAt: now
    };
    exams.unshift(newExam);
    StorageService.saveExams(exams, false);
    return newExam;
  },

  // Deneme Güncelle
  updateExam: (updatedExam) => {
    const exams = StorageService.getExams();
    const index = exams.findIndex(e => e.id === updatedExam.id);
    if (index !== -1) {
      exams[index] = { ...updatedExam, updatedAt: new Date().toISOString() };
      StorageService.saveExams(exams, false);
      return true;
    }
    return false;
  },

  // Deneme Sil
  deleteExam: (id) => {
    const exams = StorageService.getExams();
    const filtered = exams.filter(e => e.id !== id);
    const deletedIds = StorageService.getDeletedIds();
    deletedIds.push(id);
    StorageService.saveDeletedIds(deletedIds);
    StorageService.saveExams(filtered, false);
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

  saveTargetProgram: (targetId, skipCloud = false) => {
    try {
      localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(targetId));
      localStorage.setItem(STORAGE_KEY_UPDATED_AT, new Date().toISOString());
      if (!skipCloud) {
        StorageService.pushToCloud();
      }
      return true;
    } catch {
      return false;
    }
  },

  // Bulut ve Öğrenci Ayarları
  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings, skipCloud = false) => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY_UPDATED_AT, new Date().toISOString());
      if (!skipCloud) {
        StorageService.pushToCloud();
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * GERÇEK ZAMANLI BULUT SENKRONİZASYONU - VERİYİ BULUTA GÖNDER (PUSH)
   * Hem parçalı kalıcı bulut veritabanına (restful-api.dev) hem de anlık bildirim kanalına (ntfy.sh) yazar.
   */
  pushToCloud: async () => {
    try {
      notifySyncListeners({ state: 'SYNCING', message: 'Buluta kaydediliyor...' });

      const exams = StorageService.getExams();
      const targetProgram = StorageService.getTargetProgram();
      const settings = StorageService.getSettings();
      const deletedIds = StorageService.getDeletedIds();
      const updatedAt = localStorage.getItem(STORAGE_KEY_UPDATED_AT) || new Date().toISOString();

      const fullPayloadObj = {
        v: 2,
        syncCode: settings.cloudSyncCode || 'EMIR-YKS-2028',
        updatedAt,
        targetProgram,
        settings,
        deletedIds,
        exams
      };

      const payloadStr = JSON.stringify(fullPayloadObj);

      // 1. Katman: Anlık Gerçek Zamanlı Kanal (ntfy.sh) - Açık olan öğretmen/öğrenci ekranlarını <1 sn içinde günceller
      let ntfyFileUrl = '';
      try {
        const ntfyRes = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
          method: 'POST',
          body: payloadStr
        });
        if (ntfyRes.ok) {
          const ntfyJson = await ntfyRes.json();
          if (ntfyJson?.attachment?.url) {
            ntfyFileUrl = ntfyJson.attachment.url;
          }
        }
      } catch (ntfyErr) {
        console.warn('Canlı bildirim kanalı uyarısı:', ntfyErr);
      }

      // 2. Katman: Kalıcı Parçalı Bulut Veritabanı (api.restful-api.dev)
      const chunks = [];
      for (let i = 0; i < payloadStr.length; i += CHUNK_SIZE) {
        chunks.push(payloadStr.slice(i, i + CHUNK_SIZE));
      }

      // Mevcut parça ID'lerini al (varsa yeniden kullan)
      let existingIds = [];
      try {
        const cachedIds = localStorage.getItem(STORAGE_KEY_CHUNK_IDS);
        if (cachedIds) {
          existingIds = JSON.parse(cachedIds);
        } else {
          const idxCheck = await fetch(`${CLOUD_API_BASE}/${MASTER_INDEX_ID}`, { cache: 'no-store' });
          if (idxCheck.ok) {
            const idxJson = await idxCheck.json();
            if (idxJson?.data?.ids) {
              existingIds = idxJson.data.ids.split(',').filter(Boolean);
            }
          }
        }
      } catch {
        existingIds = [];
      }

      const finalChunkIds = await Promise.all(
        chunks.map(async (chunkText, idx) => {
          const existingId = existingIds[idx];
          if (existingId) {
            try {
              const rPut = await fetch(`${CLOUD_API_BASE}/${existingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `emir-c-${idx}`, data: { i: idx, c: chunkText } })
              });
              if (rPut.ok) return existingId;
            } catch {
              // PUT başarısız olursa yeni oluştur
            }
          }
          const rPost = await fetch(CLOUD_API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `emir-c-${idx}`, data: { i: idx, c: chunkText } })
          });
          const jPost = await rPost.json();
          return jPost.id;
        })
      );

      localStorage.setItem(STORAGE_KEY_CHUNK_IDS, JSON.stringify(finalChunkIds));

      // Eğer parça sayısı 20'yi aşarsa taşan ID'leri ek indeks nesnesine kaydet
      let page1Ids = finalChunkIds.slice(0, 20);
      let overflowIndexId = '';
      if (finalChunkIds.length > 20) {
        const overflowIds = finalChunkIds.slice(20);
        const rOver = await fetch(CLOUD_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'emir-overflow-idx', data: { ids: overflowIds.join(',') } })
        });
        if (rOver.ok) {
          const jOver = await rOver.json();
          overflowIndexId = jOver.id;
        }
      }

      // Ana İndeks Nesnesini Güncelle
      await fetch(`${CLOUD_API_BASE}/${MASTER_INDEX_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'EMIR-YKS-2028-MASTER',
          data: {
            updatedAt,
            count: exams.length,
            ids: page1Ids.join(','),
            more: overflowIndexId,
            ntfyUrl: ntfyFileUrl
          }
        })
      });

      const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      notifySyncListeners({
        state: 'SYNCED',
        lastSyncedAt: updatedAt,
        message: `Bulut Eşitlendi (${timeStr})`
      });

      return { success: true, updatedAt, count: exams.length };
    } catch (err) {
      console.error('Bulut gönderim hatası:', err);
      notifySyncListeners({ state: 'ERROR', message: 'Çevrimdışı (Yerel Kayıt)' });
      return { success: false, error: err.message };
    }
  },

  /**
   * GERÇEK ZAMANLI BULUT SENKRONİZASYONU - VERİYİ BULUTTAN ÇEK (PULL)
   * Öğretmen veya öğrenci linki açtığında en güncel deneme ve hedefleri otomatik getirir.
   */
  pullFromCloud: async () => {
    try {
      notifySyncListeners({ state: 'SYNCING', message: 'Eşitleniyor...' });

      let cloudData = null;

      // 1. Önce Kalıcı Ana İndeks Nesnesinden (api.restful-api.dev) Oku
      try {
        const rIdx = await fetch(`${CLOUD_API_BASE}/${MASTER_INDEX_ID}`, { cache: 'no-store' });
        if (rIdx.ok) {
          const idxObj = await rIdx.json();
          if (idxObj?.data?.ids) {
            let allIds = idxObj.data.ids.split(',').filter(Boolean);
            if (idxObj.data.more) {
              const rMore = await fetch(`${CLOUD_API_BASE}/${idxObj.data.more}`, { cache: 'no-store' });
              if (rMore.ok) {
                const moreObj = await rMore.json();
                if (moreObj?.data?.ids) {
                  allIds = allIds.concat(moreObj.data.ids.split(',').filter(Boolean));
                }
              }
            }

            localStorage.setItem(STORAGE_KEY_CHUNK_IDS, JSON.stringify(allIds));

            // 20'şerli gruplar halinde parçaları tek seferde çek
            const chunkMap = {};
            for (let i = 0; i < allIds.length; i += 20) {
              const slice = allIds.slice(i, i + 20);
              const query = slice.map(id => `id=${id}`).join('&');
              const rBatch = await fetch(`${CLOUD_API_BASE}?${query}`, { cache: 'no-store' });
              if (rBatch.ok) {
                const batchArr = await rBatch.json();
                batchArr.forEach(item => {
                  if (item && item.id && item.data) {
                    chunkMap[item.id] = item.data.c || '';
                  }
                });
              }
            }

            const reconstructed = allIds.map(id => chunkMap[id] || '').join('');
            if (reconstructed) {
              cloudData = JSON.parse(reconstructed);
            }
          }
        }
      } catch (restErr) {
        console.warn('Kalıcı bulut okuma uyarısı, yedek kanala geçiliyor:', restErr);
      }

      // 2. Eğer 1. katmandan veri alınamadıysa veya ntfy kanalında daha yeni bir anlık kayıt varsa onu kontrol et
      try {
        const rNtfy = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1&since=all`, { cache: 'no-store' });
        if (rNtfy.ok) {
          const text = await rNtfy.text();
          const lines = text.trim().split('\n').filter(Boolean);
          if (lines.length > 0) {
            const lastEvent = JSON.parse(lines[lines.length - 1]);
            let ntfyData = null;
            if (lastEvent?.attachment?.url) {
              const rAtt = await fetch(lastEvent.attachment.url, { cache: 'no-store' });
              if (rAtt.ok) ntfyData = await rAtt.json();
            } else if (lastEvent?.message) {
              ntfyData = JSON.parse(lastEvent.message);
            }
            if (ntfyData && Array.isArray(ntfyData.exams)) {
              if (!cloudData || new Date(ntfyData.updatedAt || 0) > new Date(cloudData.updatedAt || 0)) {
                cloudData = ntfyData;
              }
            }
          }
        }
      } catch (ntfyErr) {
        console.warn('Yedek bulut okuma uyarısı:', ntfyErr);
      }

      if (!cloudData || !Array.isArray(cloudData.exams)) {
        notifySyncListeners({ state: 'SYNCED', message: 'Bulut Aktif' });
        return { success: false };
      }

      // 3. Akıllı Birleştirme (Smart Merge): Hiçbir cihazdaki yeni girilen sınav kaybolmaz!
      const localExams = StorageService.getExams();
      const localDeleted = StorageService.getDeletedIds();
      const localUpdatedAt = localStorage.getItem(STORAGE_KEY_UPDATED_AT);

      const mergedDeleted = Array.from(new Set([...localDeleted, ...(cloudData.deletedIds || [])]));
      const deletedSet = new Set(mergedDeleted);
      StorageService.saveDeletedIds(mergedDeleted);

      const examMap = new Map();
      // Önce bulut sınavlarını ekle
      cloudData.exams.forEach(ex => {
        if (ex && ex.id && !deletedSet.has(ex.id)) {
          examMap.set(ex.id, ex);
        }
      });

      // Yerelde olup bulutta olmayan veya yerelde daha yeni güncellenmiş sınavları koru
      let hasLocalUnsyncedChanges = false;
      localExams.forEach(localEx => {
        if (!localEx || !localEx.id || deletedSet.has(localEx.id)) return;
        const cloudEx = examMap.get(localEx.id);
        if (!cloudEx) {
          // Sadece yerelde yeni eklenmiş bir sınav varsa (ve yerel cihazda daha önce kayıt yapılmışsa)
          if (localUpdatedAt) {
            examMap.set(localEx.id, localEx);
            hasLocalUnsyncedChanges = true;
          }
        } else {
          const localTime = new Date(localEx.updatedAt || localEx.createdAt || 0).getTime();
          const cloudTime = new Date(cloudEx.updatedAt || cloudEx.createdAt || 0).getTime();
          if (localTime > cloudTime) {
            examMap.set(localEx.id, localEx);
            hasLocalUnsyncedChanges = true;
          }
        }
      });

      const mergedExams = Array.from(examMap.values()).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Eğer birleştirme sonucu en az 1 sınav varsa kaydet
      if (mergedExams.length > 0) {
        localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(mergedExams));
      }

      // Hedef bölüm ve öğrenci ayarlarını güncelle
      const isCloudNewer = !localUpdatedAt || new Date(cloudData.updatedAt || 0) >= new Date(localUpdatedAt);
      if (isCloudNewer) {
        if (cloudData.targetProgram) {
          localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(cloudData.targetProgram));
        }
        if (cloudData.settings) {
          const mergedSettings = { ...StorageService.getSettings(), ...cloudData.settings };
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(mergedSettings));
        }
        if (cloudData.updatedAt) {
          localStorage.setItem(STORAGE_KEY_UPDATED_AT, cloudData.updatedAt);
        }
      }

      const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      notifySyncListeners({
        state: 'SYNCED',
        lastSyncedAt: cloudData.updatedAt || new Date().toISOString(),
        message: `Canlı Eşitlendi (${timeStr})`
      });

      // Eğer yerel cihazda bulutta olmayan yeni bir deneme tespit edildiyse buluta da gönder
      if (hasLocalUnsyncedChanges) {
        StorageService.pushToCloud();
      }

      return {
        success: true,
        exams: StorageService.getExams(),
        targetProgram: StorageService.getTargetProgram(),
        settings: StorageService.getSettings(),
        updatedAt: cloudData.updatedAt
      };
    } catch (err) {
      console.error('Bulut çekme hatası:', err);
      notifySyncListeners({ state: 'ERROR', message: 'Yerel Mod' });
      return { success: false, error: err.message };
    }
  },

  /**
   * CANLI DİNLEYİCİ (SSE + Sekme Odaklanma + Periyodik Kontrol)
   * Emir telefonundan deneme girdiği anda öğretmenin ekranında sayfa yenilemeye gerek kalmadan sonucu gösterir!
   */
  subscribeToLiveSync: (onDataUpdated) => {
    let eventSource = null;

    const triggerPull = async () => {
      const res = await StorageService.pullFromCloud();
      if (res && res.success && onDataUpdated) {
        onDataUpdated(res);
      }
    };

    // 1. Sayfa açılışında hemen buluttan en güncel veriyi çek
    triggerPull();

    // 2. Gerçek zamanlı SSE (Server-Sent Events) aboneliği
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        eventSource = new EventSource(`https://ntfy.sh/${NTFY_TOPIC}/sse`);
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.event === 'message') {
              triggerPull();
            }
          } catch {
            // Yoksay
          }
        };
      } catch (e) {
        console.warn('SSE bağlantı uyarısı:', e);
      }
    }

    // 3. Sekmeye geri dönüldüğünde (Focus / Visibility) otomatik kontrol et
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerPull();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', triggerPull);

    // 4. Her 30 saniyede bir sessiz arka plan senkronizasyonu
    const intervalId = setInterval(triggerPull, 30000);

    return () => {
      if (eventSource) eventSource.close();
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', triggerPull);
      clearInterval(intervalId);
    };
  },

  // JSON Yedek Dışa Aktar
  exportJSON: () => {
    const backup = {
      version: '2.0',
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
        StorageService.saveExams(parsed.exams, false);
        if (parsed.target) StorageService.saveTargetProgram(parsed.target, true);
        if (parsed.student) StorageService.saveSettings(parsed.student, true);
        StorageService.pushToCloud();
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
