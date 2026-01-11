
import React, { useState } from 'react';
import { Debt, Currency, Account } from '../types';
import { formatCurrency } from '../services/currencyService';

interface DebtListProps {
  debts: Debt[];
  setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
  accounts: Account[];
  onProcessPayment: (id: string) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtList: React.FC<DebtListProps> = ({ debts, setDebts, accounts, onProcessPayment, onDeleteDebt }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newDebt, setNewDebt] = useState<any>({ 
    contactName: '', amount: '', currency: 'UYU', type: 'to_pay', 
    description: '', dueDate: '', linkedAccountId: '' 
  });

  const handleAdd = () => {
    if (!newDebt.contactName || !newDebt.amount) return;
    const debt: Debt = { 
      ...newDebt, 
      id: 'd' + Date.now(), 
      amount: Number(newDebt.amount), 
      status: 'pending' 
    };
    setDebts([...debts, debt]);
    setShowAdd(false);
    setNewDebt({ contactName: '', amount: '', currency: 'UYU', type: 'to_pay', description: '', dueDate: '', linkedAccountId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Deudas y Préstamos</h3>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">+ Nueva Deuda</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-[32px] border-2 border-indigo-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contacto</label>
            <input type="text" placeholder="Ej: Visa, Juan" className="p-3 bg-slate-50 rounded-xl text-sm" value={newDebt.contactName} onChange={e => setNewDebt({...newDebt, contactName: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monto</label>
            <input type="number" placeholder="0.00" className="p-3 bg-slate-50 rounded-xl font-bold text-sm" value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sentido</label>
            <select className="p-3 bg-slate-50 rounded-xl text-sm" value={newDebt.type} onChange={e => setNewDebt({...newDebt, type: e.target.value})}>
              <option value="to_pay">Debo pagar a...</option>
              <option value="to_collect">Me deben de...</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Moneda</label>
            <select className="p-3 bg-slate-50 rounded-xl text-sm" value={newDebt.currency} onChange={e => setNewDebt({...newDebt, currency: e.target.value as Currency})}>
              <option value="UYU">UYU (Pesos)</option>
              <option value="USD">USD (Dólares)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cuenta de cobro/pago</label>
            <select className="p-3 bg-slate-50 rounded-xl text-sm font-medium" value={newDebt.linkedAccountId} onChange={e => setNewDebt({...newDebt, linkedAccountId: e.target.value})}>
              <option value="">Ninguna (Manual)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha límite</label>
            <input type="date" className="p-3 bg-slate-50 rounded-xl text-sm" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 mt-4">
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">Descartar</button>
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Guardar Deuda</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-black text-slate-400 uppercase text-xs tracking-widest px-2">🔴 Por Pagar (Mis deudas)</h4>
          {debts.filter(d => d.type === 'to_pay' && d.status === 'pending').map(d => {
            const linkedAcc = accounts.find(a => a.id === d.linkedAccountId);
            return (
              <div key={d.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-red-100 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-slate-800 text-lg">{d.contactName}</p>
                    <p className="text-xs text-slate-400 font-bold">Vence: {d.dueDate || 'Sin fecha'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-500">{formatCurrency(d.amount, d.currency)}</span>
                    {linkedAcc && (
                      <p className="text-[10px] text-indigo-400 font-black uppercase mt-1">Desde: {linkedAcc.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => onProcessPayment(d.id)} 
                    className="flex-1 bg-green-50 text-green-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm"
                  >
                    Pagar Ahora {linkedAcc ? '🏦' : '✅'}
                  </button>
                  <button onClick={() => onDeleteDebt(d.id)} className="px-4 text-slate-200 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-slate-400 uppercase text-xs tracking-widest px-2">🟢 Por Cobrar (Me deben)</h4>
          {debts.filter(d => d.type === 'to_collect' && d.status === 'pending').map(d => {
            const linkedAcc = accounts.find(a => a.id === d.linkedAccountId);
            return (
              <div key={d.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-green-100 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-slate-800 text-lg">{d.contactName}</p>
                    <p className="text-xs text-slate-400 font-bold">Vence: {d.dueDate || 'Sin fecha'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-green-500">{formatCurrency(d.amount, d.currency)}</span>
                    {linkedAcc && (
                      <p className="text-[10px] text-indigo-400 font-black uppercase mt-1">A: {linkedAcc.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => onProcessPayment(d.id)} 
                    className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Registrar Cobro {linkedAcc ? '🏦' : '✅'}
                  </button>
                  <button onClick={() => onDeleteDebt(d.id)} className="px-4 text-slate-200 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {debts.some(d => d.status === 'paid') && (
        <div className="mt-12">
          <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4 px-2">Historial Reciente (Saldadas)</h4>
          <div className="bg-slate-50 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {debts.filter(d => d.status === 'paid').slice(0, 6).map(d => (
              <div key={d.id} className="bg-white/50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center opacity-60">
                <span className="font-bold text-slate-500 text-sm line-through">{d.contactName}</span>
                <span className="font-black text-slate-400 text-sm">{formatCurrency(d.amount, d.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtList;
