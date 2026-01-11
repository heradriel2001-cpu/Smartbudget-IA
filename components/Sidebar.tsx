
import React, { useRef } from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const menuItems = [
    { id: AppTab.Dashboard, label: 'Dashboard', icon: '📊' },
    { id: AppTab.AIAdvisor, label: 'Asesor IA', icon: '🌸' },
    { id: AppTab.Transactions, label: 'Movimientos', icon: '💸' },
    { id: AppTab.Accounts, label: 'Mis Cuentas', icon: '🏦' },
    { id: AppTab.Debts, label: 'Deudas', icon: '🤝' },
  ];

  return (
    <div className="flex flex-col h-full py-8 px-5">
      <div className="mb-12 px-3">
        <h1 className="text-2xl font-black text-indigo-600 flex items-center gap-2 italic tracking-tighter">
          <span className="text-3xl not-italic">💎</span> SmartBudget
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 font-bold'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-black text-sm uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-100 space-y-4">
        <div className="p-5 bg-slate-50 rounded-[32px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Datos</p>
          <div className="flex flex-col gap-2">
            <button onClick={onExport} className="text-xs font-bold text-slate-600 flex items-center gap-3 hover:text-indigo-600 transition-colors p-1">
              <span>💾</span> Respaldar
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-slate-600 flex items-center gap-3 hover:text-indigo-600 transition-colors p-1">
              <span>📂</span> Restaurar
            </button>
            <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept=".json" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-[10px] font-black text-indigo-300 uppercase italic">Rocío v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
