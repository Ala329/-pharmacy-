import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { ShieldCheck, User, Truck, FlaskConical, Activity, ArrowRight, Chrome } from 'lucide-react';
import { UserRole, useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthPage() {
  const { user, profile, setProfile } = useAuth();
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const newProfile = {
      uid: user.uid,
      email: user.email!,
      role,
      displayName: user.displayName || user.email?.split('@')[0] || 'User'
    };

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    } catch (err: any) {
       handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  // If user is signed in but has no profile, show role selection
  const showRoleSelection = user && !profile;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-blue-600 rounded-3xl mb-4 shadow-xl shadow-blue-200 transform -rotate-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pharma<span className="text-blue-600">Trust</span></h1>
          <p className="text-slate-500 font-medium mt-2">Secure AI-Blockchain Pharmaceutical Governance</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200 border border-slate-100">
          <AnimatePresence mode="wait">
            {!showRoleSelection ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Welcome to PharmaTrust</h2>
                  <p className="text-slate-500 text-sm">Please sign in with your enterprise account</p>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-bold py-4 rounded-2xl transition-all shadow-sm group disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </button>

                {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                
                <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-[0.2em] pt-4">
                  Immutable • Auditable • Intelligent
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-slate-800">Complete Your Identity</h2>
                  <p className="text-slate-500 text-sm">Select your professional role in the supply chain</p>
                </div>

                <form onSubmit={handleCompleteRegistration} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">Professional Domain</label>
                    <div className="grid grid-cols-2 gap-3">
                      <RoleCard icon={<FlaskConical />} label="Manufacturer" active={role === 'manufacturer'} onClick={() => setRole('manufacturer')} />
                      <RoleCard icon={<Truck />} label="Distributor" active={role === 'distributor'} onClick={() => setRole('distributor')} />
                      <RoleCard icon={<Activity />} label="Pharmacist" active={role === 'pharmacist'} onClick={() => setRole('pharmacist')} />
                      <RoleCard icon={<User />} label="Patient" active={role === 'patient'} onClick={() => setRole('patient')} />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

                  <div className="space-y-3">
                    <button
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {loading ? 'Finalizing Setup...' : 'Join the Network'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => auth.signOut()}
                      className="w-full text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${active ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
    >
      <div className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
