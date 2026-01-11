
import React, { useState } from 'react';
import { Account, Currency } from '../types';
import { formatCurrency } from '../services/currencyService';

interface AccountListProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  onDeleteAccount: (id: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, setAccounts, onDeleteAccount }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', balance: '', currency: 'UYU' as Currency });

  const handleAdd = () => {
    if (!newAcc.name) return;
    const acc: Account = {
      id: 'acc_' + Date.now(),
      name: newAcc.name,
      balance: Number(newAcc.balance),
      currency: newAcc.currency,
      color: '#'+Math.floor(Math.random()*16777215).toString(16)
    };
    setAccounts([...accounts, acc]);
    setShowAdd(false);
    setNewAcc({ name: '', balance: '', currency: 'UYU' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Mis Cuentas y Carteras</h3>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">+ Nueva Cuenta</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Identificador</label>
            <input type="text" placeholder="Ej: Itau Pesos" className="p-3 bg-slate-50 rounded-xl border-none outline-indigo-500 text-sm" value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Saldo Inicial</label>
            <input type="number" placeholder="0.00" className="p-3 bg-slate-50 rounded-xl border-none outline-indigo-500 text-sm" value={newAcc.balance} onChange={e => setNewAcc({...newAcc, balance: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Divisa Base</label>
            <select className="p-3 bg-slate-50 rounded-xl border-none text-sm" value={newAcc.currency} onChange={e => setNewAcc({...newAcc, currency: e.target.value as Currency})}>
              <option value="UYU">Pesos Uruguayos (UYU)</option>
              <option value="USD">Dólares Americanos (USD)</option>
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 mt-2">
            <button onClick={() => setShowAdd(false)} className="text-slate-400 px-4 font-bold hover:text-slate-600 transition-colors">Descartar</button>
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors">Confirmar Apertura</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
            <div className="absolute top-0 left-0 w-2.5 h-full bg-indigo-500" style={{ backgroundColor: acc.color }}></div>
            
            <div className="flex flex-col gap-1 pr-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{acc.currency}</span>
              <span className="text-xl font-black text-slate-800 truncate">{acc.name}</span>
              <div className="mt-4">
                <span className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(acc.balance, acc.currency)}</span>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteAccount(acc.id);
              }}
              className="absolute top-6 right-6 p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-200 z-10"
              title="Cerrar cuenta"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        
        {accounts.length === 0 && (
          <div className="col-span-full py-16 text-center border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center gap-4">
            <span className="text-5xl opacity-20">🏦</span>
            <p className="text-slate-400 font-medium">Rocío: No he encontrado cuentas registradas. ¿Desea que abra una ahora?</p>
            <button onClick={() => setShowAdd(true)} className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">Abrir mi primera cuenta</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountList;
