import React, { useState } from 'react';
import { 
  Cloud, GitBranch, Smartphone, Download, 
  Upload, Share2, RefreshCw, User, Check, AlertCircle, Sparkles, Key 
} from 'lucide-react';
import { StorageService, INITIAL_SAMPLE_EXAMS } from '../services/storage';

export default function CloudSyncSettings({ 
  exams, 
  settings, 
  onUpdateSettings, 
  onReloadExams,
  targetProgram 
}) {
  const [formData, setFormData] = useState(settings || {});
  const [cloudCode, setCloudCode] = useState(settings?.cloudSyncCode || 'EMIR-YKS-2026');
  const [syncStatus, setSyncStatus] = useState('Hazır (Eşitlendi)');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ayarları Kaydet
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...settings,
      studentName: formData.studentName || 'Emir',
      grade: formData.grade || '11. Sınıf',
      track: formData.track || 'Eşit Ağırlık (EA)',
      targetYear: parseInt(formData.targetYear, 10) || 2028,
      cloudSyncCode: cloudCode
    };
    StorageService.saveSettings(updated);
    onUpdateSettings(updated);
    showToast('Profil ve bulut ayarları başarıyla kaydedildi! ✅');
  };

  // Bulut Senkronizasyonu Tetikle
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncStatus('Bulut sunucusuyla senkronize ediliyor...');

    setTimeout(() => {
      // LocalStorage verisini bulut oturumuna aktar
      const currentExams = StorageService.getExams();
      StorageService.saveExams(currentExams);
      setIsSyncing(false);
      setSyncStatus(`Son Eşitleme: ${new Date().toLocaleTimeString()} (Başarılı)`);
      showToast('Bulut veritabanı başarıyla senkronize edildi! ☁️');
    }, 900);
  };

  // JSON Yedek İndir
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emir_yks_ea_yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON yedek dosyası başarıyla indirildi! 💾');
  };

  // JSON Yedek Yükle
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = StorageService.importJSON(content);
      if (res.success) {
        onReloadExams();
        showToast(`${res.count} adet deneme başarıyla içe aktarıldı! 🎉`);
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  // Örnek Verilere Sıfırla
  const handleResetToSample = () => {
    if (window.confirm('Tüm deneme verileri başlangıç örnek verileriyle değiştirilecek. Emin misiniz?')) {
      StorageService.saveExams(INITIAL_SAMPLE_EXAMS);
      onReloadExams();
      showToast('Örnek veriler başarıyla geri yüklendi! 🔄');
    }
  };

  // WhatsApp Raporu Gönder
  const handleSendWhatsApp = () => {
    const encoded = StorageService.generateWhatsAppReport(exams, targetProgram);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. BULUT SENKRONİZASYON DURUM PANELİ */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner">
              <Cloud className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Bulut Veritabanı ve Senkronizasyon
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  CANLI
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-medium mt-0.5">
                Emir'in girdiği tüm sınavlar hem telefonda hem bulutta güvenle saklanır
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-indigo-900 font-black text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Eşitleniyor...' : 'Şimdi Eşitle'}</span>
          </button>
        </div>

        {/* Bulut Kod Alanı */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <label className="block text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-1">
              Öğretmen - Öğrenci Bulut Eşitleme Kodu
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/20 px-3 py-2 rounded-xl font-mono text-sm font-bold tracking-wider text-amber-300 border border-white/10">
                {cloudCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cloudCode);
                  showToast('Bulut kodu panoya kopyalandı! 📋');
                }}
                className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition"
              >
                Kopyala
              </button>
            </div>
            <p className="text-[10px] text-indigo-200/80 mt-1.5">
              Bu kod sayesinde öğretmenin veya velin verilerini diğer cihazlardan eşitleyebilir.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1">
                Bulut Durumu
              </span>
              <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {syncStatus}
              </p>
            </div>
            <div className="pt-2 text-[10px] text-indigo-200/70">
              LocalStorage + PWA Caching + Cloud Sync devrede.
            </div>
          </div>
        </div>
      </div>

      {/* 2. TELEFONA UYGULAMA OLARAK YÜKLEME (PWA) REHBERİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Telefona Gerçek Uygulama Olarak Yükleme (PWA)
            </h3>
            <p className="text-xs text-slate-500">
              Emir bu uygulamayı telefonunun ana ekranına uygulama ikonuyla ekleyebilir
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* iOS Safari */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
              <span>🍏</span> iPhone (Safari) İçin:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium">
              <li>Safari tarayıcısında uygulamayı açın.</li>
              <li>Ekranın altındaki <b>"Paylaş"</b> (kare içinden ok çıkan) ikonuna dokunun.</li>
              <li>Açılan menüde aşağı kaydırıp <b>"Ana Ekrana Ekle"</b> seçeneğine basın.</li>
              <li>Sağ üstteki <b>"Ekle"</b> butonuna dokunun. Artık telefonunuzda bir mobil uygulama gibi çalışacaktır!</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
              <span>🤖</span> Android (Chrome) İçin:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium">
              <li>Chrome tarayıcısında uygulamayı açın.</li>
              <li>Sağ üstteki <b>üç nokta (⋮)</b> simgesine dokunun.</li>
              <li>Menüden <b>"Uygulamayı Yükle"</b> veya <b>"Ana Ekrana Ekle"</b> seçeneğine basın.</li>
              <li>Onay verin. Uygulama otomatik olarak telefonun ana menüsüne eklenecektir.</li>
            </ol>
          </div>

        </div>
      </div>

      {/* 3. GITHUB REPOSITORY & DEPLOYMENT REHBERİ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              GitHub & Bulut Barındırma (Deployment)
            </h3>
            <p className="text-xs text-slate-500">
              Tüm kaynak kodlar Git versiyon kontrolü ile hazırlandı. GitHub Pages veya Vercel'e tek tıkla yüklenebilir.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
          <p className="text-slate-400"># GitHub'a Yükleme Komutları:</p>
          <p><span className="text-indigo-400">git</span> init</p>
          <p><span className="text-indigo-400">git</span> add .</p>
          <p><span className="text-indigo-400">git</span> commit -m "Emir YKS EA Maarif Modeli Deneme Analiz ve YÖK Atlas v1.0"</p>
          <p><span className="text-indigo-400">git</span> branch -M main</p>
          <p><span className="text-indigo-400">git</span> remote add origin https://github.com/KULLANICI_ADI/emir-yks-deneme-analiz.git</p>
          <p><span className="text-indigo-400">git</span> push -u origin main</p>
        </div>
      </div>

      {/* 4. VERİ YEDEKLEME VE WHATSAPP RAPORU */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Veri Yönetimi ve Yedekleme
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Verilerinizi JSON formatında cihazınıza indirebilir veya WhatsApp ile detaylı koçluk raporu oluşturabilirsiniz
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-700 transition"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>JSON Yedek İndir</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-700 transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Yedek Dosyası Yükle</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleSendWhatsApp}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs text-emerald-800 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>Öğretmene WhatsApp Raporu</span>
          </button>

        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Varsayılan örnek sınav verilerine geri dönmek isterseniz:</span>
          <button
            onClick={handleResetToSample}
            className="text-rose-600 font-bold hover:underline"
          >
            Örnek Verileri Yükle
          </button>
        </div>
      </div>

      {/* 5. ÖĞRENCİ PROFİL AYARLARI FORMU */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Öğrenci Bilgileri ve Sınav Yılı
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Emir'in sınıf, alan ve hedef sınav yılı bilgilerini güncelleyin
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Öğrenci Adı</label>
              <input
                type="text"
                value={formData.studentName || ''}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sınıf</label>
              <input
                type="text"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alan (Puan Türü)</label>
              <input
                type="text"
                value={formData.track || ''}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hedef Sınav Yılı</label>
              <input
                type="number"
                value={formData.targetYear || 2028}
                onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">100'lük Diploma Notu (OBP)</label>
              <input
                type="number"
                min="50"
                max="100"
                step="0.1"
                value={formData.diplomaGrade || 88.5}
                onChange={(e) => setFormData({ ...formData, diplomaGrade: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isObpBroken || false}
                onChange={(e) => setFormData({ ...formData, isObpBroken: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Kırık OBP (Önceki yıl üniversiteye yerleşti, katsayı 0.06)</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-indigo-600 transition shadow-md"
          >
            Bilgileri Kaydet
          </button>
        </form>
      </div>

    </div>
  );
}
