import React from 'react';
import { LayoutDashboard, LineChart, PlusCircle, Compass, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  const navItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'analysis', label: 'Ders Analizi', icon: LineChart },
    { id: 'add', label: 'Deneme Gir', icon: PlusCircle, isSpecial: true },
    { id: 'yokatlas', label: 'YÖK Atlas', icon: Compass },
    { id: 'settings', label: 'Bulut & Ayar', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 sm:hidden safe-bottom shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={onOpenAddModal}
                className="flex flex-col items-center justify-center -mt-5 focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-400 active:scale-95 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold text-indigo-700 mt-1">Ekle</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
