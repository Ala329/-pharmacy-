import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { aiService, PredictionData } from '../lib/aiService';
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Activity, Brain, TrendingDown, AlertCircle, ShoppingCart, RefreshCw, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'motion/react';

const MOCK_SALES_DATA = [
  { day: 'Mon', sales: 45 },
  { day: 'Tue', sales: 52 },
  { day: 'Wed', sales: 48 },
  { day: 'Thu', sales: 61 },
  { day: 'Fri', sales: 55 },
  { day: 'Sat', sales: 67 },
  { day: 'Sun', sales: 40 },
];

export default function PharmacistDashboard() {
  const { profile } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'inventory'), where('pharmacyId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [profile]);

  const runAiForecast = async () => {
    setIsPredicting(true);
    try {
      const results = await aiService.predictShortages();
      setPredictions(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <Layout title="Pharmacist Intelligence Hub">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Live Inventory Management</h2>
                <p className="text-slate-500 text-sm">Real-time stock monitoring and distribution.</p>
              </div>
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                <RefreshCw className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.length === 0 && (
                <div className="col-span-2 py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium">Connect to distributors to receive stock.</p>
                </div>
              )}
              {inventory.map(item => (
                <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-800">{item.medicineName}</h4>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${item.quantity < 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {item.quantity < 20 ? 'Low Stock' : 'Stable'}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-900">{item.quantity}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units Available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500">Threshold: {item.threshold || 15}</p>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.quantity < 20 ? 'bg-red-500' : 'bg-blue-500'}`} 
                          style={{ width: `${Math.min((item.quantity / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Weekly Sales Velocity
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <Brain className="absolute top-[-20px] right-[-20px] w-40 h-40 opacity-10 rotate-12" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Insight Engine</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Demand Forecaster</h3>
              <p className="text-blue-100 text-sm mb-6">Our neural networks analyze ledger velocity and supply logs to predict your next stock-out event.</p>
              <button 
                onClick={runAiForecast}
                disabled={isPredicting || inventory.length === 0}
                className="w-full py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-lg disabled:opacity-50"
              >
                {isPredicting ? 'Neural Processing...' : 'Generate Prediction'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Prediction Results</h4>
            {predictions.length === 0 && !isPredicting && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <p className="text-slate-400 text-sm font-medium">Press generate to see forecasts.</p>
                </div>
            )}
            {isPredicting && [1,2].map(i => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-32"></div>
            ))}
            {predictions.map((p, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-slate-900">{p.medicineName}</h5>
                  <div className="flex items-center gap-1 text-orange-500">
                    <AlertCircle className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-blue-600 italic">
                    {new Date(p.predictedStockOutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Est. Stock Out</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {p.reasoning}
                </p>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">AI Recommendation</p>
                  <p className="text-xs font-semibold text-blue-800">{p.suggestedAction}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
