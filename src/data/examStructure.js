// Türkiye Yüzyılı Maarif Modeli ve YKS Eşit Ağırlık (EA) Sınav Yapısı
export const EXAM_STAGES = {
  TYT: {
    id: 'TYT',
    name: '1. Aşama (TYT - Temel Yeterlilik)',
    shortName: '1. Aşama',
    description: 'Tüm adayların girdiği, 9 ve 10. sınıf kazanımları ile Maarif modeli bağlam temelli metin ve analitik düşünme becerilerini ölçen ortak oturum.',
    standardTotalQuestions: 120,
    durationMinutes: 165,
    subjects: [
      {
        id: 'tyt_turkce',
        name: 'Türkçe',
        category: 'Dil ve Anlatım',
        color: '#4f46e5', // indigo
        bgLight: '#eef2ff',
        defaultQuestions: 40,
        subTopics: ['Paragrafta Anlam', 'Sözcükte & Cümlede Anlam', 'Yazım & Noktalama', 'Metin Analizi (Maarif)', 'Dil Bilgisi'],
        description: 'Paragraf, bağlam temelli çıkarım ve okuduğunu anlama.'
      },
      {
        id: 'tyt_matematik',
        name: 'Temel Matematik',
        category: 'Matematik & Mantık',
        color: '#0284c7', // sky
        bgLight: '#f0f9ff',
        defaultQuestions: 40,
        subTopics: ['Temel Kavramlar', 'Problemler & Modelleme', 'Sayılar & Cebir', 'Mantık & Kümeler', 'Temel Geometri'],
        description: 'Matematiksel modelleme, analitik düşünme ve yeni nesil problemler.'
      },
      {
        id: 'tyt_sosyal',
        name: 'Sosyal Bilimler',
        category: 'Sosyal',
        color: '#ea580c', // orange
        bgLight: '#fff7ed',
        defaultQuestions: 20,
        subBranches: [
          { name: 'Tarih', count: 5 },
          { name: 'Coğrafya', count: 5 },
          { name: 'Felsefe', count: 5 },
          { name: 'Din Kültürü', count: 5 }
        ],
        subTopics: ['Tarih (5 Soru)', 'Coğrafya (5 Soru)', 'Felsefe (5 Soru)', 'Din Kültürü ve Ahlak Bilgisi (5 Soru)'],
        description: 'Tarih (5), Coğrafya (5), Felsefe (5) ve Din Kültürü (5).'
      },
      {
        id: 'tyt_fen',
        name: 'Fen Bilimleri',
        category: 'Fen',
        color: '#059669', // emerald
        bgLight: '#ecfdf5',
        defaultQuestions: 20,
        subBranches: [
          { name: 'Fizik', count: 7 },
          { name: 'Kimya', count: 7 },
          { name: 'Biyoloji', count: 6 }
        ],
        subTopics: ['Fizik (7 Soru)', 'Kimya (7 Soru)', 'Biyoloji (6 Soru)'],
        description: 'Eşit ağırlıkta derece hedefleyenler için kritik ayırt edici test (Fizik 7, Kimya 7, Biyoloji 6).'
      }
    ]
  },
  AYT: {
    id: 'AYT',
    name: '2. Aşama (AYT - Eşit Ağırlık / EA)',
    shortName: '2. Aşama',
    description: '11 ve 12. sınıf Eşit Ağırlık müfredatını kapsayan, alan puanını ve sıralamasını doğrudan belirleyen kritik oturum.',
    standardTotalQuestions: 80,
    durationMinutes: 180,
    subjects: [
      {
        id: 'ayt_matematik',
        name: 'AYT Matematik & Geometri',
        category: 'Matematik',
        color: '#7c3aed', // violet
        bgLight: '#f5f3ff',
        defaultQuestions: 40,
        subTopics: ['Fonksiyonlar & Parabol', 'Trigonometri (11. Sınıf)', 'Analitik Geometri', 'Diziler & Logaritma', 'Limit & Türev', 'Sayma & Olasılık', 'Çember & Katı Cisimler'],
        description: 'Maarif modeli analitik matematik, modelleme ve ileri geometri (İntegral kaldırılmıştır).'
      },
      {
        id: 'ayt_edebiyat',
        name: 'Türk Dili ve Edebiyatı',
        category: 'Edebiyat',
        color: '#e11d48', // rose
        bgLight: '#fff1f2',
        defaultQuestions: 24,
        subTopics: ['Şiir Bilgisi & Edebi Sanatlar', 'İslamiyet Öncesi & Halk Edebiyatı', 'Divan Edebiyatı', 'Tanzimat & Servet-i Fünun', 'Milli Edebiyat', 'Cumhuriyet Dönemi Edebiyatı'],
        description: 'Metin tahlili, edebi türler ve edebiyat tarihi.'
      },
      {
        id: 'ayt_tarih1',
        name: 'Tarih-1',
        category: 'Sosyal-1',
        color: '#b45309', // amber
        bgLight: '#fffbeb',
        defaultQuestions: 10,
        subTopics: ['İlk ve Orta Çağda Türk Dünyası', 'İslam Medeniyeti', 'Osmanlı Devleti Dönemleri', 'Milli Mücadele & Atatürk İnkılapları', '20. Yüzyıl Başlarında Dünya'],
        description: 'Belge analizi, neden-sonuç ilişkileri ve dönemsel bağlam soruları.'
      },
      {
        id: 'ayt_cografya1',
        name: 'Coğrafya-1',
        category: 'Sosyal-1',
        color: '#0d9488', // teal
        bgLight: '#f0fdfa',
        defaultQuestions: 6,
        subTopics: ['Biyoçeşitlilik & Ekosistemler', 'Nüfus Politikaları & Şehirleşme', 'Türkiye Ekonomisi (Tarım, Sanayi)', 'Küresel Örgütler & Çevre Sorunları'],
        description: 'Doğal sistemler, beşeri sistemler ve mekânsal bilgi teknolojileri.'
      }
    ]
  }
};

// Maarif Modeli 11. Sınıf Eşit Ağırlık Önemli Temaları
export const MAARIF_11_TOPICS = {
  matematik: [
    'Trigonometrik Fonksiyonlar ve Bağıntılar',
    'Doğrunun Analitik İncelenmesi',
    'Fonksiyonlarda Uygulamalar (Artan/Azalan, Parabol)',
    'İkinci Dereceden İki Bilinmeyenli Denklem ve Eşitsizlik Sistemleri',
    'Çemberin Temel Elemanları ve Açılar',
    'Katı Cisimler (Prizma, Piramit, Koni)',
    'Koşullu Olasılık ve Deneysel Olasılık'
  ],
  edebiyat: [
    'Giriş (Edebiyat ve Toplum, Dilin Değişimi)',
    'Hikaye (Cumhuriyet Dönemi 1923-1980)',
    'Şiir (Tanzimat, Servetifünun, Fecriati, Saf Şiir, Milli Edebiyat)',
    'Makale, Sohbet ve Fıkra',
    'Roman (Tanzimat, Milli Edebiyat, Cumhuriyet)',
    'Tiyatro ve Mülakat/Röportaj'
  ],
  tarih: [
    'Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti (1595-1774)',
    'Değişim Çağında Avrupa ve Osmanlı',
    'Uluslararası İlişkilerde Denge Stratejisi (1774-1914)',
    'Devrimler Çağında Değişen Devlet-Toplum İlişkileri',
    'Sermaye ve Emek',
    'XIX. ve XX. Yüzyılda Değişen Gündelik Hayat'
  ],
  cografya: [
    'Doğal Sistemler (Biyoçeşitlilik, Madde Döngüleri)',
    'Beşeri Sistemler (Nüfus Politikaları, Şehirlerin Fonksiyonları)',
    'Mekânsal Sentez: Türkiye (Ekonomi Politikaları, Tarım, Hayvancılık)',
    'Çevre ve Toplum (Doğal Kaynaklar ve Sürdürülebilirlik)'
  ]
};
