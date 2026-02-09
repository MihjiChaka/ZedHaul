
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient.ts';
import { Job, Role } from './types.ts';
import { JobCard } from './components/JobCard.tsx';
import { JobForm } from './components/JobForm.tsx';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('CLIENT');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userId] = useState(() => {
    const saved = localStorage.getItem('zedhaul_user_id');
    if (saved) return saved;
    const newId = `ID_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    localStorage.setItem('zedhaul_user_id', newId);
    return newId;
  });

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, bids (*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to load network data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    const channel = supabase
      .channel('zedhaul_live_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => fetchJobs()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => fetchJobs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const handleCreateJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'bids'>) => {
    const { error } = await supabase
      .from('jobs')
      .insert([{ 
        pickup: jobData.pickup, 
        delivery: jobData.delivery, 
        cargo: jobData.cargo, 
        required_tons: Number(jobData.required_tons), 
        client_id: userId 
      }]);
    
    if (error) {
      alert('NETWORK ERROR: UNABLE TO POST FREIGHT');
      console.error(error);
    }
  };

  const handleSubmitBid = async (jobId: string, price: number) => {
    const { error } = await supabase
      .from('bids')
      .insert([{ 
        job_id: jobId, 
        price: Number(price), 
        truck_id: userId 
      }]);
    
    if (error) {
      alert('NETWORK ERROR: BID REJECTED');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-black">
      <header className="bg-black text-white p-6 border-b-[8px] border-yellow-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 text-black p-2 font-black italic text-2xl industrial-border">ZH</div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">ZedHaul</h1>
              <p className="text-[10px] tracking-[0.2em] font-bold opacity-60 uppercase mt-1">Global Logistics & Freight Exchange</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="flex bg-zinc-900 p-1 border border-zinc-700">
                <button 
                  onClick={() => setRole('CLIENT')}
                  className={`px-6 py-2 text-xs font-black uppercase transition-all ${role === 'CLIENT' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  Post Freight
                </button>
                <button 
                  onClick={() => setRole('TRUCK_OWNER')}
                  className={`px-6 py-2 text-xs font-black uppercase transition-all ${role === 'TRUCK_OWNER' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  Carrier View
                </button>
              </div>
              <div className="text-[10px] font-mono text-zinc-500">USER_SESSION: {userId}</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white industrial-border p-6 industrial-shadow">
            <h2 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">
              {role === 'CLIENT' ? 'Terminal: Dispatch' : 'Terminal: Fleet'}
            </h2>
            
            {role === 'CLIENT' ? (
              <JobForm onSubmit={handleCreateJob} />
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-black text-white">
                  <p className="text-[10px] font-black uppercase text-yellow-400">System Status</p>
                  <p className="text-sm font-bold mt-1">Awaiting Bids: {jobs.length} active loads</p>
                </div>
                <div className="p-4 bg-zinc-100 border-2 border-dashed border-black">
                  <p className="text-xs font-bold leading-relaxed">
                    Instructions: Review the live job board. Submit your most competitive price to secure the manifest. 
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-400 industrial-border p-4 industrial-shadow flex items-center gap-3">
             <div className="animate-pulse w-3 h-3 bg-red-600 rounded-full"></div>
             <p className="text-[11px] font-black uppercase italic">Live Network Feed Active</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Active Manifests</h2>
            <div className="text-[10px] font-bold uppercase opacity-40">Showing {jobs.length} Results</div>
          </div>

          <div className="space-y-8">
            {loading ? (
              <div className="p-20 text-center industrial-border border-dashed border-zinc-300">
                <div className="inline-block animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mb-4"></div>
                <p className="font-black uppercase tracking-widest text-zinc-400">Syncing Data...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white industrial-border p-12 text-center industrial-shadow border-dashed">
                <p className="font-black text-zinc-300 text-2xl uppercase">MANIFEST CLEAR</p>
                <p className="text-xs font-bold text-zinc-400 mt-2 uppercase italic">No freight detected on the network</p>
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  role={role} 
                  onBid={handleSubmitBid} 
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-zinc-300 p-8 text-center">
         <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
            ZedHaul v1.0.4-MVP | SUPABASE_CLOUD_ENGINE
         </p>
      </footer>
    </div>
  );
};

export default App;
