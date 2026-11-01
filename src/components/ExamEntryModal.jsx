import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, Sparkles, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXAM_STAGES } from '../data/examStructure';

export default function ExamEntryModal({ isOpen, onClose, onSave, editingExam }) {
  if (!isOpen) return null;

  const [stage, setStage] = useState('TYT'); // 'TYT' or 'AYT' or 'BOTH'
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [institution, setInstitution] = useState('');
  const [difficulty, setDifficulty] = useState('Orta');
  const [notes, setNotes] = useState('');

  // Ders verileri state'i
  // Her ders objesi: { questionCount, correct, wrong, blank, net }
  const [subjectData, setSubjectData] = useState({});

  // Form açıldığında veya editingExam değiştiğinde veriyi hazırla
  useEffect(() => {
    if (editingExam) {
      setStage(editingExam.stage || 'TYT');
      setTitle(editingExam.title || '');
      setDate(editingExam.date || new Date().toISOString().split('T')[0]);
      setInstitution(editingExam.institution || '');
      setDifficulty(editingExam.difficulty || 'Orta');
      setNotes(editingExam.notes || '');
      setSubjectData(editingExam.subjects || {});
    } else {
      // Yeni deneme için varsayılan dersleri oluştur
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setInstitution('');
      setDifficulty('Orta');
      setNotes('');
      resetSubjectsForStage(stage);
    }
  }, [editingExam, isOpen]);

  // Aşama değiştiğinde dersleri güncelle
  const handleStageChange = (newStage) => {
    setStage(newStage);
    resetSubjectsForStage(newStage);
  };

  const resetSubjectsForStage = (targetStage) => {
    const initial = {};
    if (targetStage === 'TYT' || targetStage === 'BOTH') {
      EXAM_STAGES.TYT.subjects.forEach(sub => {
        initial[sub.id] = {
          questionCount: sub.defaultQuestions,
          correct: 0,
          wrong: 0,
          blank: sub.defaultQuestions,
          net: 0
        };
      });
    }
    if (targetStage === 'AYT' || targetStage === 'BOTH') {
      EXAM_STAGES.AYT.subjects.forEach(sub => {
        initial[sub.id] = {
          questionCount: sub.defaultQuestions,
          correct: 0,
          wrong: 0,
          blank: sub.defaultQuestions,
          net: 0
        };
      });
    }
    setSubjectData(initial);
  };

  // Ders alanı değiştiğinde neti ve boş sayısını anında hesapla
  const handleFieldChange = (subjectId, field, value) => {
    const numValue = Math.max(0, parseInt(value, 10) || 0);

    setSubjectData(prev => {
      const current = prev[subjectId] || { questionCount: 40, correct: 0, wrong: 0, blank: 40, net: 0 };
      const updated = { ...current, [field]: numValue };

      // Eğer soru sayısı değiştiyse boşları ayarla
      if (field === 'questionCount') {
        const remaining = Math.max(0, numValue - (updated.correct + updated.wrong));
        updated.blank = remaining;
      }

      // Net formülü: Doğru - (Yanlış / 4)
      const calculatedNet = updated.correct - (updated.wrong * 0.25);
      updated.net = Math.max(0, parseFloat(calculatedNet.toFixed(2)));

      return {
        ...prev,
        [subjectId]: updated
      };
    });
  };

  // Kalan soruları otomatik boş yap butonu
  const autoFillBlank = (subjectId) => {
    setSubjectData(prev => {
      const current = prev[subjectId];
      if (!current) return prev;
      const count = current.questionCount || 0;
      const remaining = Math.max(0, count - (current.correct + current.wrong));
      return {
        ...prev,
        [subjectId]: {
          ...current,
          blank: remaining
        }
      };
    });
  };

  // Toplam İstatistikleri Hesapla
  const currentSubjectsList = Object.entries(subjectData);
  const totalQuestions = currentSubjectsList.reduce((sum, [, data]) => sum + (data.questionCount || 0), 0);
  const totalCorrect = currentSubjectsList.reduce((sum, [, data]) => sum + (data.correct || 0), 0);
  const totalWrong = currentSubjectsList.reduce((sum, [, data]) => sum + (data.wrong || 0), 0);
  const totalBlank = currentSubjectsList.reduce((sum, [, data]) => sum + (data.blank || 0), 0);
  const totalNet = currentSubjectsList.reduce((sum, [, data]) => sum + (data.net || 0), 0);
  const successPercentage = totalQuestions > 0 ? (totalNet / totalQuestions) * 100 : 0;

  // Formu Gönder
  const handleSubmit = (e) => {
    e.preventDefault();

    const examPayload = {
      ...(editingExam ? { id: editingExam.id } : {}),
      title: title.trim() || `${stage} Deneme Sınavı - ${date}`,
      date,
      stage,
      institution: institution.trim() || 'Genel Deneme',
      difficulty,
      notes: notes.trim(),
      subjects: subjectData,
      totalQuestions,
      totalCorrect,
      totalWrong,
      totalBlank,
      totalNet: parseFloat(totalNet.toFixed(2)),
      successPercentage: parseFloat(successPercentage.toFixed(2))
    };

    onSave(examPayload);

    // Sevinç efekti (Confetti)
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    onClose();
  };

  // Gösterilecek dersleri listele
  const getDisplaySubjects = () => {
    const list = [];
    if (stage === 'TYT' || stage === 'BOTH') {
      EXAM_STAGES.TYT.subjects.forEach(s => list.push({ ...s, stageType: 'TYT' }));
    }
    if (stage === 'AYT' || stage === 'BOTH') {
      EXAM_STAGES.AYT.subjects.forEach(s => list.push({ ...s, stageType: 'AYT' }));
    }
    return list;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Modal Başlığı */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {editingExam ? 'Deneme Sınavını Düzenle' : 'Yeni Deneme Sınavı Girişi'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Maarif Modeli & Eşit Ağırlık Dinamik Soru Sayılı Veri Girişi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Aşama Seçimi (1. Aşama / 2. Aşama) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Sınav Aşaması Seçimi
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleStageChange('TYT')}
                className={`py-3 px-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  stage === 'TYT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold'
                }`}
              >
                <span className="text-sm">1. Aşama (TYT)</span>
                <span className={`text-[10px] ${stage === 'TYT' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  Temel Yeterlilik (120 Soru)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStageChange('AYT')}
                className={`py-3 px-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  stage === 'AYT'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold'
                }`}
              >
                <span className="text-sm">2. Aşama (AYT - EA)</span>
                <span className={`text-[10px] ${stage === 'AYT' ? 'text-purple-100' : 'text-slate-400'}`}>
                  Eşit Ağırlık Alanı (80 Soru)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStageChange('BOTH')}
                className={`py-3 px-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  stage === 'BOTH'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-300 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold'
                }`}
              >
                <span className="text-sm">Karma / Tam YKS</span>
                <span className={`text-[10px] ${stage === 'BOTH' ? 'text-slate-300' : 'text-slate-400'}`}>
                  1. + 2. Aşama Birlikte
                </span>
              </button>
            </div>
          </div>

          {/* Temel Bilgiler: Başlık, Tarih, Yayın, Zorluk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Deneme Adı / Başlık
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 3D Türkiye Geneli Deneme-1"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sınav Tarihi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Yayın / Kurum
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Örn: Özdebir, Bilgi Sarmal, Okul..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Zorluk Seviyesi
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Kolay">Kolay Seviye</option>
                <option value="Orta">Orta Seviye (ÖSYM Ayarı)</option>
                <option value="Zor">Zor Seviye</option>
                <option value="Çok Zor">Çok Zor (Seçici)</option>
              </select>
            </div>
          </div>

          {/* DERSLER LİSTESİ - DİNAMİK SORU SAYISI & DOĞRU/YANLIŞ/BOŞ/NET */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Ders Bazlı Soru Sayıları ve Sonuç Girişi
                </h3>
                <p className="text-xs text-slate-500">
                  Denemeye göre soru sayısını dilediğiniz gibi güncelleyebilirsiniz.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" />
                Net = Doğru - (Yanlış / 4)
              </span>
            </div>

            <div className="space-y-3">
              {getDisplaySubjects().map((sub) => {
                const data = subjectData[sub.id] || {
                  questionCount: sub.defaultQuestions,
                  correct: 0,
                  wrong: 0,
                  blank: sub.defaultQuestions,
                  net: 0
                };

                const currentCount = data.questionCount || 0;
                const sumAnswers = (data.correct || 0) + (data.wrong || 0) + (data.blank || 0);
                const isMismatch = sumAnswers !== currentCount;
                const percentage = currentCount > 0 ? ((data.net || 0) / currentCount) * 100 : 0;

                return (
                  <div
                    key={sub.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      
                      {/* Ders Başlığı ve Rozeti */}
                      <div className="min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: sub.color }}
                          ></span>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sub.stageType}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {sub.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {sub.description}
                        </p>
                      </div>

                      {/* Giriş Alanları: Soru Sayısı, Doğru, Yanlış, Boş ve Net */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 items-end">
                        
                        {/* 1. Soru Sayısı (DİNAMİK) */}
                        <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-tight text-center">
                            Soru Sayısı
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={data.questionCount ?? sub.defaultQuestions}
                            onChange={(e) => handleFieldChange(sub.id, 'questionCount', e.target.value)}
                            className="w-full text-center text-xs sm:text-sm font-bold bg-white border border-indigo-200 rounded-lg py-1 px-1 focus:ring-1 focus:ring-indigo-500 text-indigo-950"
                          />
                        </div>

                        {/* 2. Doğru */}
                        <div className="bg-emerald-50/60 p-1.5 rounded-xl border border-emerald-200/70">
                          <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-tight text-center">
                            Doğru
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={data.questionCount || 100}
                            value={data.correct || 0}
                            onChange={(e) => handleFieldChange(sub.id, 'correct', e.target.value)}
                            className="w-full text-center text-xs sm:text-sm font-bold bg-white border border-emerald-300 rounded-lg py-1 px-1 focus:ring-1 focus:ring-emerald-500 text-emerald-950"
                          />
                        </div>

                        {/* 3. Yanlış */}
                        <div className="bg-rose-50/60 p-1.5 rounded-xl border border-rose-200/70">
                          <label className="block text-[10px] font-bold text-rose-700 uppercase tracking-tight text-center">
                            Yanlış
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={data.questionCount || 100}
                            value={data.wrong || 0}
                            onChange={(e) => handleFieldChange(sub.id, 'wrong', e.target.value)}
                            className="w-full text-center text-xs sm:text-sm font-bold bg-white border border-rose-300 rounded-lg py-1 px-1 focus:ring-1 focus:ring-rose-500 text-rose-950"
                          />
                        </div>

                        {/* 4. Boş & Otomatik Doldur */}
                        <div className="bg-amber-50/60 p-1.5 rounded-xl border border-amber-200/70 relative">
                          <div className="flex items-center justify-between px-1">
                            <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                              Boş
                            </label>
                            <button
                              type="button"
                              onClick={() => autoFillBlank(sub.id)}
                              title="Kalanı otomatik boş yap"
                              className="text-[9px] text-amber-800 underline hover:font-bold"
                            >
                              Kalan
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max={data.questionCount || 100}
                            value={data.blank ?? Math.max(0, currentCount - ((data.correct || 0) + (data.wrong || 0)))}
                            onChange={(e) => handleFieldChange(sub.id, 'blank', e.target.value)}
                            className="w-full text-center text-xs sm:text-sm font-bold bg-white border border-amber-300 rounded-lg py-1 px-1 focus:ring-1 focus:ring-amber-500 text-amber-950"
                          />
                        </div>

                        {/* 5. Otomatik Hesaplanan Net */}
                        <div className="col-span-2 sm:col-span-1 bg-gradient-to-tr from-indigo-50 to-purple-50 p-1.5 rounded-xl border border-indigo-200 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-tight">
                            Net
                          </span>
                          <span className="text-sm sm:text-base font-black text-indigo-900">
                            {(data.net ?? 0).toFixed(2)}
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* Alt Çubuk: Başarı Yüzdesi ve Uyuşmazlık Uyarısı */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Başarı:</span>
                        <span className="font-bold text-slate-800">%{percentage.toFixed(1)}</span>
                        <div className="w-16 sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                          ></div>
                        </div>
                      </div>

                      {isMismatch && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Toplam soruyla fark: {sumAnswers} / {currentCount}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Notlar / Koç Yorumu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Öğrenci & Rehberlik / Koçluk Notları
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Paragrafta süre sıkıntısı yaşandı. AYT Matematikte trigonometri netleri yükseldi..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

        </form>

        {/* Modal Alt Bar: Toplam Net Özeti ve Kaydet Butonu */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Canlı Toplam Kartı */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Toplam Soru</span>
              <span className="font-extrabold text-slate-900">{totalQuestions}</span>
            </div>
            <div>
              <span className="text-emerald-600 block text-[10px] uppercase font-bold">Doğru</span>
              <span className="font-extrabold text-emerald-700">{totalCorrect}</span>
            </div>
            <div>
              <span className="text-rose-600 block text-[10px] uppercase font-bold">Yanlış</span>
              <span className="font-extrabold text-rose-700">{totalWrong}</span>
            </div>
            <div>
              <span className="text-amber-600 block text-[10px] uppercase font-bold">Boş</span>
              <span className="font-extrabold text-amber-700">{totalBlank}</span>
            </div>
            <div className="pl-3 sm:pl-4 border-l border-slate-300">
              <span className="text-indigo-600 block text-[10px] uppercase font-extrabold">TOPLAM NET</span>
              <span className="text-base sm:text-xl font-black text-indigo-700">
                {totalNet.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/70 transition"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{editingExam ? 'Güncellemeleri Kaydet' : 'Denemeyi Kaydet'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
