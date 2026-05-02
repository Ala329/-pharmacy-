import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, User, Home, ShieldCheck, Box, Truck, FlaskConical, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'manufacturer': return <FlaskConical className="w-5 h-5" />;
      case 'distributor': return <Truck className="w-5 h-5" />;
      case 'pharmacist': return <Activity className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Pharma<span className="text-blue-600">Trust</span></span>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase -mt-1">AI-Blockchain Ledger</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <NavItem icon={<Home className="w-4 h-4" />} label="Dashboard" active />
              <NavItem icon={<Search className="w-4 h-4" />} label="Track" />
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-800">{profile?.displayName}</span>
                <span className="text-[10px] uppercase font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                  {getRoleIcon()}
                  {profile?.role}
                </span>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">Manage infrastructure, track assets, and analyze data.</p>
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-400 font-medium">© 2026 PharmaTrust Graduation Project. Built with AI & Blockchain.</p>
          {profile && (
            <button 
              onClick={async () => {
                const { seedDemoData } = await import('../lib/demoData');
                await seedDemoData(profile.uid, profile.displayName);
                window.location.reload();
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all border border-blue-100"
            >
              Seed Presentation Data
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
      {icon}
      {label}
    </button>
  );
}
