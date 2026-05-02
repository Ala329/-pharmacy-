import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { blockchainService, BatchStatus, Batch } from '../lib/blockchainService';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Truck, Package, MapPin, ArrowRightLeft, Users, CheckCircle } from 'lucide-react';

export default function DistributorDashboard() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [targetPharmacyId, setTargetPharmacyId] = useState('');

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'batches'), where('currentOwnerId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
    });

    const fetchPharmacies = async () => {
      const phQ = query(collection(db, 'users'), where('role', '==', 'pharmacist'));
      const phSnap = await getDocs(phQ);
      setPharmacies(phSnap.docs.map(doc => doc.data()));
    };
    fetchPharmacies();

    return unsubscribe;
  }, [profile]);

  const handleTransfer = async (batch: Batch) => {
    if (!profile || !targetPharmacyId) return;
    const pharma = pharmacies.find(p => p.uid === targetPharmacyId);
    if (!pharma) return;

    setIsTransferring(true);
    try {
      await blockchainService.transferBatch(
        batch.batchId,
        batch.id!,
        pharma.uid,
        pharma.displayName,
        profile.uid,
        profile.displayName,
        BatchStatus.IN_TRANSIT
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Layout title="Distributor Logistics Suite">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <StatCard icon={<Truck className="text-orange-500" />} label="Avg. Delivery" value="1.2 days" />
          <StatCard icon={<ArrowRightLeft className="text-blue-500" />} label="Transfers" value={batches.length.toString()} />
          <StatCard icon={<MapPin className="text-green-500" />} label="Active Hubs" value="4" />
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Inventory Assigned to You</h2>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-400 uppercase">Target Pharmacy:</label>
              <select 
                className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
                value={targetPharmacyId}
                onChange={e => setTargetPharmacyId(e.target.value)}
              >
                <option value="">Select Receiver</option>
                {pharmacies.map(p => (
                  <option key={p.uid} value={p.uid}>{p.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {batches.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No inventory currently assigned.</p>
              </div>
            )}
            {batches.map(batch => (
              <div key={batch.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-blue-100 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{batch.name}</h4>
                    <p className="text-xs font-mono text-slate-400">ID: {batch.batchId} • Mft: {batch.manufacturerName}</p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="text-xs font-bold text-blue-600 uppercase">{batch.status}</span>
                  </div>
                  <button 
                    disabled={!targetPharmacyId || isTransferring}
                    onClick={() => handleTransfer(batch)}
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-105 transition-all shadow-lg shadow-blue-100"
                  >
                    Transfer to Pharma
                    <CheckCircle className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
      <div className="p-3 bg-slate-50 rounded-2xl mb-2">{icon}</div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}
