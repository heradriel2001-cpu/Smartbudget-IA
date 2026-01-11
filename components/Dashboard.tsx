
import React from 'react';
import { formatCurrency } from '../services/currencyService';
import { Transaction, Account } from '../types';

interface DashboardProps {
  stats: any;
  transactions: Transaction[];
  accounts: Account[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, transactions, accounts }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-1">Patrimonio Neto</p>
            <h3 className="text-4xl font-black mb-1">{formatCurrency(stats.netBalanceUYU, 'UYU')}</h3>
            <p className="text-indigo-300 font-bold opacity-80 italic">~ {formatCurrency(stats.netBalanceUSD, 'USD')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter mb-1">Por Pagar</p>
            <p className="text-xl font-black text-slate-800">{formatCurrency(stats.debtsToPay, 'UYU')}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-green-400 uppercase tracking-tighter mb-1">Por Cobrar</p>
            <p className="text-xl font-black text-slate-800">{formatCurrency(stats.debtsToCollect, 'UYU')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-lg font-bold text-slate-800 px-2 italic">Tus Carteras 🏦</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center hover:border-indigo-300 transition-all shadow-sm">
                <div>
                  <p className="font-bold text-slate-800">{acc.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{acc.currency}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600 text-lg">{formatCurrency(acc.balance, acc.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 italic">
             🕒 Recientes
           </h4>
           <div className="space-y-5">
             {transactions.length === 0 ? (
               <div className="py-10 text-center">
                 <p className="text-xs text-slate-400 italic">No hay movimientos aún...</p>
               </div>
             ) : (
               transactions.slice(0, 4).map(tx => (
                 <div key={tx.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0">
                   <div className="flex flex-col">
                     <span className="text-slate-800 font-bold truncate max-w-[120px]">{tx.description}</span>
                     <span className="text-[10px] text-slate-400 uppercase">{tx.category}</span>
                   </div>
                   <span className={`font-black ${tx.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                     {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                   </span>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
