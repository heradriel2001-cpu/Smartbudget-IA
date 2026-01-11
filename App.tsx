
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Account, Debt, AppTab, AIAnalysisResult } from './types';
import { convert, EXCHANGE_RATE } from './services/currencyService';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AccountList from './components/AccountList';
import DebtList from './components/DebtList';
import AIAdvisor from './components/AIAdvisor';
import Sidebar from './components/Sidebar';

const STORAGE_KEY = 'smartbudget_rocio_v2';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [rocioPortrait, setRocioPortrait] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTransactions(parsed.transactions || []);
        setAccounts(parsed.accounts || []);
        setDebts(parsed.debts || []);
        setRocioPortrait(parsed.rocioPortrait || null);
        setLastAnalysis(parsed.lastAnalysis || null);
      } catch (e) {
        console.error("Error cargando LocalStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { transactions, accounts, debts, rocioPortrait, lastAnalysis };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [transactions, accounts, debts, rocioPortrait, lastAnalysis, isLoaded]);

  const stats = useMemo(() => {
    const netBalanceUYU = accounts.reduce((sum, acc) => sum + convert(acc.balance, acc.currency, 'UYU'), 0);
    const totalDebtsToPayUYU = debts.filter(d => d.status === 'pending' && d.type === 'to_pay')
      .reduce((sum, d) => sum + convert(d.amount, d.currency, 'UYU'), 0);
    const totalDebtsToCollectUYU = debts.filter(d => d.status === 'pending' && d.type === 'to_collect')
      .reduce((sum, d) => sum + convert(d.amount, d.currency, 'UYU'), 0);

    return { 
      netBalanceUYU, 
      netBalanceUSD: netBalanceUYU / EXCHANGE_RATE,
      debtsToPay: totalDebtsToPayUYU,
      debtsToCollect: totalDebtsToCollectUYU
    };
  }, [accounts, debts]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const transaction: Transaction = { ...newTx, id };
    setAccounts(prev => prev.map(acc => {
      let balance = acc.balance;
      if (acc.id === transaction.accountId) {
        const amt = convert(transaction.amount, transaction.currency, acc.currency);
        balance += (transaction.type === 'income' ? amt : -amt);
      }
      return { ...acc, balance };
    }));
    setTransactions(prev => [transaction, ...prev]);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:block w-64 h-screen sticky top-0 bg-white border-r border-slate-200">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExport={() => {}} onImport={() => {}} />
      </div>

      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-indigo-600">💎 SmartBudget</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-indigo-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Sidebar Mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} onExport={() => {}} onImport={() => {}} />
          </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {accounts.length === 0 && activeTab !== AppTab.Accounts ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce text-indigo-600">🏦</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">¡Empecemos, che!</h2>
            <p className="text-slate-500 max-w-xs mb-8">Para que Rocío pueda ayudarte, primero agregá una cuenta o billetera.</p>
            <button onClick={() => setActiveTab(AppTab.Accounts)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">Crear Cuenta</button>
          </div>
        ) : (
          <>
            {activeTab === AppTab.Dashboard && <Dashboard stats={stats} transactions={transactions} accounts={accounts} />}
            {activeTab === AppTab.Transactions && <TransactionList transactions={transactions} accounts={accounts} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onAdd={handleAddTransaction} onUpdate={() => {}} />}
            {activeTab === AppTab.Accounts && <AccountList accounts={accounts} setAccounts={setAccounts} onDeleteAccount={(id) => setAccounts(prev => prev.filter(a => a.id !== id))} />}
            {activeTab === AppTab.Debts && <DebtList debts={debts} setDebts={setDebts} accounts={accounts} onProcessPayment={() => {}} onDeleteDebt={(id) => setDebts(prev => prev.filter(d => d.id !== id))} />}
            {activeTab === AppTab.AIAdvisor && (
              <AIAdvisor 
                transactions={transactions} 
                persistedAnalysis={lastAnalysis} 
                setPersistedAnalysis={setLastAnalysis}
                persistedPortrait={rocioPortrait}
                setPersistedPortrait={setRocioPortrait}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
