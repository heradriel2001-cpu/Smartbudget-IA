
import React, { useState, useEffect } from 'react';
import { Transaction, AIAnalysisResult } from '../types';
import { analyzeFinances, generateRocioPortrait } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AIAdvisorProps {
  transactions: Transaction[];
  persistedAnalysis: AIAnalysisResult | null;
  setPersistedAnalysis: (result: AIAnalysisResult) => void;
  persistedPortrait: string | null;
  setPersistedPortrait: (url: string) => void;
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const AIAdvisor: React.FC<AIAdvisorProps> = ({ 
  transactions, 
  persistedAnalysis, 
  setPersistedAnalysis,
  persistedPortrait,
  setPersistedPortrait
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>('');
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

  useEffect(() => {
    // Solo generamos el retrato una vez para mantener la identidad fija
    if (!persistedPortrait) {
      handleGeneratePortrait();
    }
  }, []);

  const handleGeneratePortrait = async () => {
    setIsGeneratingPortrait(true);
    try {
      const url = await generateRocioPortrait();
      setPersistedPortrait(url);
    } catch (err) {
      console.error("Portrait error", err);
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  const performAnalysis = async () => {
    if (transactions.length === 0) {
      setError("Rocío: Che, necesito que cargues algún gasto primero para poder analizarte bien. 🌸");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFinances(transactions, Number(goal) || 0);
      setPersistedAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Ups, algo salió mal. ¡Probemos otra vez!');
    } finally {
      setLoading(false);
    }
  };

  const chartData = persistedAnalysis?.suggestedBudget.map(item => ({
    name: item.category,
    value: item.suggestedLimit
  })) || [];

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Hero Card de Rocío */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[50px] shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="flex flex-col lg:flex-row p-8 lg:p-12 items-center gap-12 relative z-10">
          {/* Retrato Fijo y Elegante */}
          <div className="relative group flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-200 rounded-[40px] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="w-56 h-72 lg:w-64 lg:h-80 bg-slate-800 rounded-[40px] overflow-hidden border-2 border-white/10 shadow-2xl relative">
              {persistedPortrait ? (
                <img src={persistedPortrait} alt="Rocío" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-2 italic">Rocío <span className="text-amber-400 text-3xl not-italic">🌸</span></h2>
            <p className="text-indigo-200 font-bold text-sm uppercase tracking-[0.3em] mb-6">Tu Asistente Financiera Personal</p>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[30px] p-6 border border-white/10 mb-8 max-w-xl">
              <p className="text-indigo-50 text-lg font-medium leading-relaxed italic">
                "Hola, soy Rocío. Miro tus números, entiendo tus gastos y te ayudo a que la plata te rinda más. Si tenés una meta de ahorro para este mes, decime acá abajo y vemos qué podemos hacer juntos."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex-1 relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-400 font-black">$</span>
                <input 
                  type="number" 
                  placeholder="Tu meta de ahorro (UYU)" 
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-5 pl-10 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-400 transition-all font-bold outline-none"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              <button 
                onClick={performAnalysis}
                disabled={loading}
                className="bg-amber-400 text-indigo-950 font-black px-10 py-5 rounded-2xl hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-900/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analizando...</span>
                  </div>
                ) : 'Consultar a Rocío 🚀'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-8 border-red-500 p-8 rounded-[30px] flex items-center gap-6 animate-in slide-in-from-top duration-300">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-700 font-black italic">{error}</p>
        </div>
      )}

      {persistedAnalysis && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-8">
          {/* Dashboard Premium de Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white p-10 lg:p-12 rounded-[50px] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
              <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">Gasto Mensual Estimado</h4>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-7xl font-black text-slate-900 tracking-tighter">${persistedAnalysis.monthlyPrediction.toLocaleString()}</span>
                <span className="text-indigo-600 font-black text-2xl uppercase">UYU</span>
              </div>
              <div className="bg-indigo-50/50 p-8 rounded-[40px] border-l-8 border-indigo-600">
                <p className="text-slate-800 text-xl font-bold italic leading-relaxed">
                  "{persistedAnalysis.summary}"
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-6">Salud Financiera</h4>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                  <circle cx="80" cy="80" r="72" fill="none" stroke="#6366f1" strokeWidth="16" strokeDasharray="452" strokeDashoffset={452 - (452 * persistedAnalysis.financialHealthScore / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-slate-900">{persistedAnalysis.financialHealthScore}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase">Puntos</span>
                </div>
              </div>
              <p className="mt-6 text-sm font-black text-indigo-600 uppercase tracking-widest italic">
                {persistedAnalysis.financialHealthScore > 75 ? '🔥 Impecable' : persistedAnalysis.financialHealthScore > 50 ? '⚖️ Estable' : '🚨 Cuidado'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Distribución */}
            <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
              <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="bg-indigo-100 p-2 rounded-xl text-lg">📊</span>
                Distribución Sugerida
              </h4>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Checklist de Ahorro con Estilo */}
            <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
              <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="bg-green-100 p-2 rounded-xl text-lg">✨</span>
                Oportunidades de Oro
              </h4>
              <div className="space-y-6">
                {persistedAnalysis.topSavingsOpportunities.map((opp, idx) => (
                  <div key={idx} className="group p-6 bg-slate-50 rounded-[30px] hover:bg-white border border-transparent hover:border-indigo-100 transition-all shadow-none hover:shadow-xl hover:shadow-indigo-900/5">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-black text-slate-900 text-lg">{opp.title}</h5>
                      <span className="bg-green-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-green-200">
                        + ${opp.estimatedSavings}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">{opp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback de Meta con diseño inmersivo */}
          <div className={`p-1 bg-gradient-to-r rounded-[55px] ${persistedAnalysis.savingsGoalFeedback?.isPossible ? 'from-green-400 to-emerald-600' : 'from-amber-400 to-orange-600'}`}>
            <div className="bg-white p-10 lg:p-14 rounded-[50px] flex flex-col md:flex-row gap-12 items-center">
              <div className="text-8xl filter drop-shadow-2xl">
                {persistedAnalysis.savingsGoalFeedback?.isPossible ? '🎯' : '⚠️'}
              </div>
              <div className="flex-1">
                <h4 className="text-3xl font-black text-slate-900 mb-4 italic">Veredicto Final sobre tu Meta</h4>
                <p className="text-xl text-slate-600 font-bold italic mb-8 leading-relaxed">
                  "{persistedAnalysis.savingsGoalFeedback?.verdict}"
                </p>
                <div className="flex flex-wrap gap-3">
                  {persistedAnalysis.savingsGoalFeedback?.steps.map((step, sidx) => (
                    <span key={sidx} className="bg-slate-100 px-6 py-3 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-wider border border-slate-200 group hover:bg-indigo-600 hover:text-white transition-colors cursor-default">
                      🔥 {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
