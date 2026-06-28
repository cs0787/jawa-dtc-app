'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, List, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type DTC = {
  dtc_code: string;
  description: string;
  fault_type: string;
  fault_reason: string;
  solution_steps: string;
  validation: string;
};

export default function DTCDiagnostics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DTC[]>([]);
  const [allDTCs, setAllDTCs] = useState<DTC[]>([]);
  const [recentSearches, setRecentSearches] = useState<DTC[]>([]);
  const [selectedDTC, setSelectedDTC] = useState<DTC | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'search' | 'all'>('search');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
    loadRecentSearches();
  }, []);

  const loadData = async () => {
    setError('');
    const { data, error: fetchError } = await supabase
      .from('dtc_diagnostics')
      .select('*')
      .order('dtc_code');

    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    if (data) setAllDTCs(data);
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentDTCs');
    if (saved) setRecentSearches(JSON.parse(saved));
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('dtc_diagnostics')
      .select('*')
      .ilike('dtc_code', `%${term}%`)
      .order('dtc_code');

    setResults(data || []);
    setLoading(false);
  };

  const openDTC = (dtc: DTC) => {
    setSelectedDTC(dtc);
    const updated = [dtc, ...recentSearches.filter(d => d.dtc_code !== dtc.dtc_code)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('recentDTCs', JSON.stringify(updated));
  };

  const getSolutionSteps = (text: string): string[] => {
    if (!text) return ["No steps available."];
    return text
      .replace(/\.\s+/g, '.\n')
      .split(/\d+\.\s*|\n+|\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* JAWA Style Header */}
      <header className="border-b border-red-900/30 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-yellow-400 rounded-xl flex items-center justify-center border-2 border-black">
              <span className="text-black font-black text-4xl tracking-tighter">J</span>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">JAWA</h1>
              <p className="text-red-500 text-xs -mt-1 font-medium">DIAGNOSTICS</p>
            </div>
          </div>
          <div className="text-sm text-zinc-400">Service Technician Portal</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex justify-center gap-3 mb-10">
          <button 
            onClick={() => setView('search')} 
            className={`px-8 py-3.5 rounded-2xl font-medium transition-all flex items-center gap-2 ${view === 'search' ? 'bg-yellow-400 text-black shadow-lg' : 'bg-zinc-900 hover:bg-zinc-800'}`}
          >
            <Search size={20} /> Search DTC
          </button>
          <button 
            onClick={() => setView('all')} 
            className={`px-8 py-3.5 rounded-2xl font-medium transition-all flex items-center gap-2 ${view === 'all' ? 'bg-yellow-400 text-black shadow-lg' : 'bg-zinc-900 hover:bg-zinc-800'}`}
          >
            <List size={20} /> All Codes ({allDTCs.length})
          </button>
        </div>

        {view === 'search' && (
          <div className="max-w-3xl mx-auto">
            <div className="relative mb-16">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-yellow-400" size={32} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="P0031"
                className="w-full bg-black border-2 border-zinc-700 focus:border-yellow-400 rounded-3xl pl-24 py-8 text-4xl font-mono placeholder-zinc-500 focus:outline-none text-center"
              />
            </div>

            {results.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {results.map(dtc => (
                  <motion.div
                    key={dtc.dtc_code}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => openDTC(dtc)}
                    className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-3xl p-8 cursor-pointer transition-all"
                  >
                    <div className="font-mono text-5xl font-bold text-yellow-400 mb-3">{dtc.dtc_code}</div>
                    <p className="text-zinc-300 line-clamp-3">{dtc.description}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'all' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allDTCs.map(dtc => (
              <motion.div
                key={dtc.dtc_code}
                whileHover={{ y: -6 }}
                onClick={() => openDTC(dtc)}
                className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-3xl p-7 cursor-pointer transition-all"
              >
                <div className="text-4xl font-bold text-yellow-400 font-mono mb-3">{dtc.dtc_code}</div>
                <p className="text-sm text-zinc-400 line-clamp-4">{dtc.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {selectedDTC && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-9 border-b border-zinc-800 flex justify-between bg-black">
                <div>
                  <div className="text-6xl font-black text-yellow-400 tracking-tighter font-mono">{selectedDTC.dtc_code}</div>
                  <p className="text-2xl mt-4 text-white">{selectedDTC.description}</p>
                </div>
                <button onClick={() => setSelectedDTC(null)} className="text-5xl text-zinc-600 hover:text-white transition-colors">
                  <X />
                </button>
              </div>

              <div className="p-10 overflow-auto max-h-[65vh] space-y-14">
                <div>
                  <h4 className="text-red-400 uppercase tracking-[2px] text-sm mb-4 font-medium">FAULT REASON</h4>
                  <p className="text-zinc-200 text-lg leading-relaxed">{selectedDTC.fault_reason}</p>
                </div>

                <div>
                  <h4 className="text-yellow-400 uppercase tracking-[2px] text-sm mb-6 font-medium">SOLUTION STEPS</h4>
                  <ol className="space-y-8">
                    {getSolutionSteps(selectedDTC.solution_steps).map((step, i) => (
                      <li key={i} className="flex gap-6">
                        <div className="w-9 h-9 bg-yellow-400 text-black rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-zinc-300 leading-relaxed pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-black border border-red-900/50 rounded-3xl p-9">
                  <h4 className="text-emerald-400 uppercase tracking-[2px] text-sm mb-4 font-medium">VALIDATION PROCEDURE</h4>
                  <p className="text-zinc-400 text-[17px] leading-relaxed">{selectedDTC.validation}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}