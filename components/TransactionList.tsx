
import React, { useState, useRef } from 'react';
import { Transaction, Account, Currency } from '../types';
import { formatCurrency } from '../services/currencyService';
import { processReceipt } from '../services/geminiService';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onUpdate: (tx: Transaction) => void;
}

const CATEGORIES_MAP: Record<string, string[]> = {
  'Vivienda y Facturas': ['Renta', 'UTE', 'OSE', 'Servicio móvil', 'WIFI', 'Gas', 'Otras facturas'],
  'Alimentación': ['Cárnicos', 'Verduras', 'Fruta', 'Arroz', 'Azúcar', 'Café', 'Harina', 'Huevos', 'Leche', 'Otros comestibles'],
  'Higiene': ['Champú', 'Jabón', 'Otros limpieza'],
  'Ingresos': ['Sueldo', 'Venta', 'Intereses', 'Otros ingresos'],
  'Otros': ['General', 'Transporte', 'Ocio']
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, accounts, onDelete, onAdd, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<any>({
    description: '', 
    amount: '', 
    category: 'Vivienda y Facturas', 
    subCategory: 'Renta',
    type: 'expense', 
    currency: 'UYU', 
    accountId: accounts[0]?.id || '', 
    toAccountId: '', 
    date: new Date().toISOString().split('T')[0]
  });

  const handleCategoryChange = (cat: string) => {
    setFormData({
      ...formData,
      category: cat,
      subCategory: CATEGORIES_MAP[cat]?.[0] || ''
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await processReceipt(base64);
        setFormData({
          ...formData,
          ...result,
          amount: result.amount?.toString() || '',
          type: 'expense'
        });
        setShowAdd(true);
        alert("¡Listo, amiga! Rocío ya leyó el ticket. Solo revisá que todo esté bien. 🌸");
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount || !formData.accountId) return;
    const finalData = { 
      ...formData, 
      amount: Number(formData.amount),
      toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined
    };
    if (editingId) {
      onUpdate({ ...finalData, id: editingId });
      setEditingId(null);
    } else {
      onAdd(finalData);
      setShowAdd(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      description: '', amount: '', category: 'Vivienda y Facturas', subCategory: 'Renta',
      type: 'expense', currency: 'UYU', accountId: accounts[0]?.id || '', toAccountId: '', 
      date: new Date().toISOString().split('T')[0] 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-slate-800">Movimientos</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1 sm:flex-none bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <span className="animate-pulse">Rocío está analizando...</span>
            ) : (
              <><span className="text-xl">📸</span> Escanear Ticket</>
            )}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange} 
          />
          <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">+ Manual</button>
        </div>
      </div>

      {(showAdd || editingId) && (
        <div className="bg-white p-6 rounded-3xl border-2 border-indigo-100 shadow-xl mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descripción</label>
            <input type="text" className="p-3 bg-slate-50 rounded-xl border-none outline-indigo-500 text-sm font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monto</label>
            <input type="number" className="p-3 bg-slate-50 rounded-xl border-none outline-indigo-500 text-sm font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Divisa</label>
            <select className="p-3 bg-slate-50 rounded-xl border-none text-sm font-bold" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
              <option value="UYU">Pesos (UYU)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
          
          {formData.type !== 'transfer' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Categoría</label>
                <select className="p-3 bg-slate-50 rounded-xl border-none text-sm" value={formData.category} onChange={e => handleCategoryChange(e.target.value)}>
                  {Object.keys(CATEGORIES_MAP).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subcategoría</label>
                <select className="p-3 bg-slate-50 rounded-xl border-none text-sm" value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})}>
                  {CATEGORIES_MAP[formData.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cuenta</label>
            <select className="p-3 bg-slate-50 rounded-xl border-none text-sm" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          
          <div className="lg:col-span-3 flex gap-2 justify-end mt-4">
            <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              {editingId ? 'Actualizar' : '¡Listo! Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Fecha</th>
                <th className="px-6 py-5">Movimiento</th>
                <th className="px-6 py-5">Categoría</th>
                <th className="px-6 py-5">Monto</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/20 transition-colors group">
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{tx.description}</span>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase">{accounts.find(a => a.id === tx.accountId)?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">{tx.category}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{tx.subCategory}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-black ${tx.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(tx.id)} className="text-slate-200 hover:text-red-500 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
