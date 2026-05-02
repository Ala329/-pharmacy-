import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { blockchainService, BatchStatus, Batch } from '../lib/blockchainService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Package, Calendar, Database, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

export default function ManufacturerDashboard() {
  const { profile } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', batchId: '', expiryDate: '' });
  const [selectedQR, setSelectedQR] = useState<Batch | null>(null);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'batches'), where('manufacturerId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
    });
    return unsubscribe;
  }, [profile]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsMinting(true);
    try {
      await blockchainService.registerBatch({
        batchId: newBatch.batchId.toUpperCase(),
        name: newBatch.name,
        manufacturerId: profile.uid,
        manufacturerName: profile.displayName,
        expiryDate: newBatch.expiryDate,
        currentOwnerId: profile.uid,
        currentOwnerName: profile.displayName
      });
      setShowModal(false);
      setNewBatch({ name: '', batchId: '', expiryDate: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Layout title="Manufacturer Command Center">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Package className="text-blue-600" />} label="Total Batches" value={batches.length.toString()} />
          <StatCard icon={<Database className="text-purple-600" />} label="On-Chain Records" value={batches.length.toString()} />
          <StatCard icon={<CheckCircle2 className="text-green-600" />} label="Verified" value="100%" />
        </div>

        {/* Action Table */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Production Inventory</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus className="w-4 h-4" />
              Mint New Batch
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Medicine Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Blockchain Hash</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-bold whitespace-nowrap">{batch.batchId}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">{batch.name}</span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar className="w-3 h-3" />
                      {batch.expiryDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[100px] block">{batch.blockchainHash}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedQR(batch)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Generate QR"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mint Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Mint New Blockchain Batch</h3>
              <form onSubmit={handleMint} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-widest">Medicine Name</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 font-medium" 
                    value={newBatch.name}
                    onChange={e => setNewBatch({...newBatch, name: e.target.value})}
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-widest">Batch Identifier</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 font-medium" 
                    value={newBatch.batchId}
                    onChange={e => setNewBatch({...newBatch, batchId: e.target.value})}
                    placeholder="e.g. BTC-992-X"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-widest">Expiration Date</label>
                  <input 
                    required
                    type="date"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 font-medium" 
                    value={newBatch.expiryDate}
                    onChange={e => setNewBatch({...newBatch, expiryDate: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isMinting}
                    className="flex-3 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {isMinting ? 'Recording on Ledger...' : 'Confirm Mint'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Viewer Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="bg-slate-50 p-6 rounded-3xl inline-block mb-6">
                <QRCodeSVG 
                  value={`${window.location.origin}/verify/${selectedQR.batchId}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedQR.name}</h3>
              <p className="text-slate-500 text-sm font-mono mt-1">{selectedQR.batchId}</p>
              <div className="mt-8">
                <button 
                  onClick={() => setSelectedQR(null)}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
