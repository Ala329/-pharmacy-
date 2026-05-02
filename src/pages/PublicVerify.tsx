import React, { useState } from 'react';
import { blockchainService, Batch, LedgerEntry } from '../lib/blockchainService';
import { ShieldCheck, Search, ShieldAlert, CheckCircle, Clock, MapPin, Activity, User, FlaskConical, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function PublicVerify() {
  const [query, setQuery] = useState('');
  const [batch, setBatch] = useState<Batch | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError(false);
    try {
      const result = await blockchainService.getBatchByBatchId(query);
      if (result) {
        setBatch(result);
        const log = await blockchainService.getBatchHistory(query);
        setHistory(log);
      } else {
        setError(true);
        setBatch(null);
        setHistory([]);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Verification Header */}
      <div className="bg-blue-600 py-20 px-4 text-center text-white relative overflow-hidden">
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10" />
        <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Verify Authenticity</h1>
            <p className="text-blue-100 text-lg mb-10 font-medium">Access the global immutable ledger to verify pharmaceutical origins and storage history.</p>
            
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-all" />
              </div>
              <input 
                type="text" 
                placeholder="Enter Batch ID (e.g. BTC-992-X)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-white text-slate-900 rounded-3xl py-6 pl-14 pr-32 font-bold shadow-2xl focus:ring-4 focus:ring-blue-400 outline-none transition-all placeholder:text-slate-300"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-8 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'TRACK'}
              </button>
            </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 pb-20">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-10 rounded-3xl shadow-xl text-center border-2 border-red-100"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Counterfeit / Unregistered</h2>
              <p className="text-slate-500 max-w-sm mx-auto">The batch ID <span className="font-mono font-bold text-red-600">{query}</span> was not found in the PharmaTrust blockchain ledger.</p>
            </motion.div>
          )}

          {batch && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Product Header */}
              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-100">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">{batch.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Batch {batch.batchId}</span>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Verified Authentic</span>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Status</p>
                    <p className="text-lg font-black text-slate-900 uppercase">{batch.status.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Ledger Timeline */}
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Blockchain Proof of Custody
                </h3>

                <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
                   {history.map((entry, idx) => (
                     <div key={idx} className="relative">
                        <div className={cn(
                            "absolute -left-[41px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-4 transition-all",
                            idx === history.length - 1 ? "bg-blue-600 ring-blue-100 scale-125" : "bg-slate-200 ring-transparent"
                        )} />
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    {entry.action === 'MINT' ? 'Batch Produced' : 'Custody Transferred'}
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded tracking-tighter uppercase">{entry.action}</span>
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>From: <b className="text-slate-800">{entry.fromName}</b></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <Activity className="w-4 h-4 text-slate-400" />
                                        <span>To: <b className="text-slate-800">{entry.toName}</b></span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 bg-slate-50 p-3 rounded-xl inline-flex text-[10px] font-mono text-slate-400">
                                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                                    TX: {entry.txHash}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">{new Date(entry.timestamp?.toDate ? entry.timestamp.toDate() : Date.now()).toLocaleDateString()}</p>
                                <p className="text-xs font-medium text-slate-400">{new Date(entry.timestamp?.toDate ? entry.timestamp.toDate() : Date.now()).toLocaleTimeString()}</p>
                            </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Product Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickSpec icon={<FlaskConical />} label="Manufacturer" value={batch.manufacturerName} />
                <QuickSpec icon={<Truck />} label="Carrier" value={batch.currentOwnerName} />
                <QuickSpec icon={<MapPin />} label="Retail Point" value={batch.status === 'delivered' ? batch.currentOwnerName : 'In Transit'} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust Seal Footer */}
      <div className="text-center pb-10 opacity-50">
          <div className="flex justify-center gap-4 mb-4">
              <ShieldCheck className="w-5 h-5" />
              <Activity className="w-5 h-5" />
              <Search className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">PharmaTrust Global Ledger • Endorsed by Health Ministries</p>
      </div>
    </div>
  );
}

function QuickSpec({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900">{value}</p>
            </div>
        </div>
    )
}
