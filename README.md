# 🎓 Emir YKS EA - Maarif Modeli Deneme Analiz & YÖK Atlas Koçu

Emir için özel olarak tasarlanmış; **11. Sınıf Türkiye Yüzyılı Maarif Modeli** ve **YKS Eşit Ağırlık (EA)** müfredatına tam uyumlu, bulut tabanlı ve mobilde gerçek bir uygulama gibi (PWA) çalışan kapsamlı deneme takip ve analiz portalı.

---

## 🌟 Öne Çıkan Özellikler

### 1. 📱 Telefonda Gerçek Bir Uygulama Deneyimi (PWA)
* Emir uygulamayı telefonunun ana ekranına uygulama ikonuyla ekleyebilir.
* Tam ekran çalışır (Safari/Chrome adres çubuğu gizlenir), dokunmatik alt menüye sahiptir.
* İnternet bağlantısı olmasa bile okulda veya dershanede anında deneme girişi yapılabilir (Offline-First).

### 2. 📚 Maarif Modeli İki Aşamalı Sınav Sistemi (Eşit Ağırlık / EA)
Maarif modeli ve YKS'ye göre Eşit Ağırlık öğrencisinin sorumlu olduğu tüm testler ve dersler tam entegredir:
* **1. Aşama (TYT - Temel Yeterlilik):**
  * **Türkçe:** Standart 40 Soru *(Paragraf, bağlam temelli metin analizi, okuduğunu anlama)*
  * **Temel Matematik:** Standart 40 Soru *(Matematiksel modelleme, yeni nesil problemler, geometri)*
  * **Sosyal Bilimler:** Standart 20 Soru *(Tarih: 5, Coğrafya: 5, Felsefe: 5, Din Kültürü: 5)*
  * **Fen Bilimleri:** Standart 20 Soru *(Fizik: 7, Kimya: 7, Biyoloji: 6 - Derece için EA ayırt edici test)*
* **2. Aşama (AYT - Eşit Ağırlık Alan Oturumu):**
  * **AYT Matematik & Geometri:** Standart 40 Soru *(11. Sınıf trigonometri, analitik, parabol, fonksiyonlar, limit, türev, sayma & olasılık - Maarif modelinde integral kaldırılmıştır)*
  * **Türk Dili ve Edebiyatı:** Standart 24 Soru *(Metin analizi, edebi akımlar, dönemler)*
  * **Tarih-1:** Standart 10 Soru *(Belge analizi, Türk-İslam ve Osmanlı tarihi, Cumhuriyet inkılapları)*
  * **Coğrafya-1:** Standart 6 Soru *(Biyoçeşitlilik, doğal kaynaklar, Türkiye ekonomisi, beşeri sistemler)*

### 3. 🎯 Dinamik Soru Sayısı Özelliği
* Okulda veya dershanede bazen 11. sınıf konularını taramak için 15, 20 veya 30 soruluk özel denemeler yapılır.
* Programda her dersin yanında **"Soru Sayısı"** alanı dinamik ve düzenlenebilirdir!
* Doğru, Yanlış ve Boş sayıları girildiğinde:
  $$\text{Net} = \text{Doğru} - \left(\frac{\text{Yanlış}}{4}\right)$$
  $$\text{Başarı Yüzdesi (\%)} = \left(\frac{\text{Net}}{\text{Soru Sayısı}}\right) \times 100$$
  formülleriyle anında hesaplanır.
* **"Kalan"** butonu ile kalan sorular tek tıkla otomatik olarak boş kutusuna yazılır.

### 4. 🏛️ YÖK Atlas Entegrasyonu & Hedefe Kalan Net Analizi (Net Gap Analysis)
* Boğaziçi Üniversitesi (YBS, İktisat, İşletme, Psikoloji), Galatasaray Hukuk, İstanbul Hukuk, Ankara Hukuk, ODTÜ, Marmara YBS, Dokuz Eylül ve Hacettepe gibi Türkiye’nin zirve Eşit Ağırlık bölümlerinin güncel taban sıralamaları ve son yerleşen netleri sistemde mevcuttur.
* Emir hedeflediği bölümü seçtiğinde; mevcut deneme ortalamaları ile YÖK Atlas verileri ders ders kıyaslanır.
* **Hedefe Kalan Net Tablosu:** Hedefe ulaşmak için hangi dersten kaç net eksik olduğu (veya ne kadar önde olduğu) yeşil/kırmızı göstergelerle net şekilde sunulur.
* Tek tıkla resmi YÖK Atlas sayfasına giden direkt bağlantı linki mevcuttur.

### 5. ☁️ Bulut Tabanlı & GitHub Entegrasyonu
* **Bulut Eşitleme Kodu:** Öğretmen ve Emir arasında aynı kod (`EMIR-YKS-2026`) üzerinden veriler eşitlenir.
* **WhatsApp Raporlama:** Tek tıkla tüm sınav sonuçlarını, ders ders netleri ve YÖK Atlas hedef durumunu öğretmene veya veliye WhatsApp formatında gönderme imkanı.
* **JSON Yedekleme:** Tek tıkla tüm sınav geçmişini indirip başka bir cihaza yükleyebilme.

---

## 📲 Telefona Nasıl Yüklenir? (Adım Adım)

### 🍏 iPhone (iOS / Safari)
1. Safari tarayıcısını açıp uygulamanın linkine gidin.
2. Ekranın alt kısmında bulunan **Paylaş** butonuna (kare içinden yukarı ok çıkan simge) dokunun.
3. Açılan menüyü aşağı kaydırıp **"Ana Ekrana Ekle"** seçeneğine dokunun.
4. Sağ üstteki **"Ekle"** butonuna basın. Uygulama telefonun ekranına gelecektir!

### 🤖 Android (Chrome)
1. Chrome tarayıcısında uygulamayı açın.
2. Sağ üstteki **üç nokta (⋮)** menü simgesine dokunun.
3. **"Uygulamayı Yükle"** veya **"Ana Ekrana Ekle"** butonuna dokunun.
4. Onaylayın. Uygulama ana ekranınıza yüklenecektir.

---

## 💻 Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları yükleyin
npm install --legacy-peer-deps

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı dağıtım için build alın
npm run build
```

---

## 🚀 GitHub'a Yükleme ve GitHub Pages Yayını

Uygulamayı kendi GitHub hesabınıza yüklemek için:

```bash
# 1. Git deposu başlatın ve commit atın
git init
git add .
git commit -m "Emir YKS EA Maarif Modeli Deneme Analiz ve YÖK Atlas v1.0"
git branch -M main

# 2. GitHub üzerinde 'emir-yks-deneme-analiz' adında yeni bir repo oluşturup bağlayın
git remote add origin https://github.com/KULLANICI_ADINIZ/emir-yks-deneme-analiz.git
git push -u origin main
```

> Projede bulunan `.github/workflows/deploy.yml` dosyası sayesinde, GitHub'a push yaptığınız anda uygulama otomatik olarak derlenip GitHub Pages üzerinden canlıya alınır!
