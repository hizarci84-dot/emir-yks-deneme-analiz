import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import SubjectAnalysis from './components/SubjectAnalysis';
import YokAtlasTracker from './components/YokAtlasTracker';
import CloudSyncSettings from './components/CloudSyncSettings';
import YksScoreCalculator from './components/YksScoreCalculator';
import ExamEntryModal from './components/ExamEntryModal';
import { StorageService } from './services/storage';
import { YOK_ATLAS_PROGRAMS } from './data/yokAtlasData';
import { Smartphone, Download, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [targetProgramId, setTargetProgramId] = useState('yok_102270154');
  const [settings, setSettings] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Verileri Başlangıçta Yükle
  useEffect(() => {
    const loadedExams = StorageService.getExams();
    const loadedTarget = StorageService.getTargetProgram();
    const loadedSettings = StorageService.getSettings();

    setExams(loadedExams);
    setTargetProgramId(loadedTarget);
    setSettings(loadedSettings);

    // PWA Install Event Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // PWA Yükleme Butonu Tıklaması
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Deneme Ekleme & Güncelleme
  const handleSaveExam = (examData) => {
    if (editingExam) {
      StorageService.updateExam(examData);
    } else {
      StorageService.addExam(examData);
    }
    setExams(StorageService.getExams());
    setEditingExam(null);
  };

  // Deneme Düzenleme Başlat
  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  // Deneme Silme
  const handleDeleteExam = (examId) => {
    StorageService.deleteExam(examId);
    setExams(StorageService.getExams());
  };

  // Hedef Program Seçme
  const handleSelectTarget = (targetId) => {
    StorageService.saveTargetProgram(targetId);
    setTargetProgramId(targetId);
  };

  // Hedef program bilgisi
  const targetProgram = YOK_ATLAS_PROGRAMS.find(p => p.id === targetProgramId) || YOK_ATLAS_PROGRAMS[1];

  // Yeniden Yükle
  const handleReloadExams = () => {
    setExams(StorageService.getExams());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 sm:pb-10 selection:bg-indigo-500 selection:text-white">
      
      {/* PWA Yükleme Banner (Mobil ve Masaüstü İçin) */}
      {showInstallBanner && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-200 animate-bounce" />
            <span>Emir YKS EA uygulamasını telefonuna yükle, internetsiz ve tam ekran kullan!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallPWA}
              className="px-3 py-1 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition shadow-sm"
            >
              Uygulamayı Yükle
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-indigo-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Üst Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingExam(null);
          setIsModalOpen(true);
        }}
        settings={settings}
      />

      {/* Desktop Sekme Çubuğu */}
      <div className="hidden sm:block border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Genel Bakış & Denemeler
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${
                activeTab === 'analysis'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Ders Bazlı Analiz (Maarif)
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${
                activeTab === 'calculator'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              YKS Puanı & Sıralama Simülatörü
            </button>
            <button
              onClick={() => setActiveTab('yokatlas')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${
                activeTab === 'yokatlas'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              YÖK Atlas Hedef Simülatörü
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-bold text-sm transition-all ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Bulut, GitHub & Ayarlar
            </button>
          </nav>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            exams={exams}
            targetProgram={targetProgram}
            onOpenAddModal={() => {
              setEditingExam(null);
              setIsModalOpen(true);
            }}
            onEditExam={handleEditExam}
            onDeleteExam={handleDeleteExam}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'analysis' && (
          <SubjectAnalysis exams={exams} />
        )}

        {activeTab === 'calculator' && (
          <YksScoreCalculator
            exams={exams}
            settings={settings}
            onUpdateSettings={setSettings}
            onSelectTarget={handleSelectTarget}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'yokatlas' && (
          <YokAtlasTracker
            exams={exams}
            targetProgramId={targetProgramId}
            onSelectTarget={handleSelectTarget}
          />
        )}

        {activeTab === 'settings' && (
          <CloudSyncSettings
            exams={exams}
            settings={settings}
            onUpdateSettings={setSettings}
            onReloadExams={handleReloadExams}
            targetProgram={targetProgram}
          />
        )}
      </main>

      {/* Mobil Alt Menü Barı */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingExam(null);
          setIsModalOpen(true);
        }}
      />

      {/* Deneme Giriş / Düzenleme Modalı */}
      <ExamEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        editingExam={editingExam}
      />

    </div>
  );
}
