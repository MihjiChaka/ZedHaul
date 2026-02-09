
import React, { useState } from 'react';
import { Job, Role } from '../types.ts';

interface JobCardProps {
  job: Job;
  role: Role;
  currentUserId: string;
  onBid: (jobId: string, price: number) => Promise<void>;
}

export const JobCard: React.FC<JobCardProps> = ({ job, role, onBid, currentUserId }) => {
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [isBidding, setIsBidding] = useState(false);

  const bestBid = job.bids && job.bids.length > 0 
    ? [...job.bids].sort((a, b) => a.price - b.price)[0]
    : null;

  const handleBidSubmit = async () => {
    if (bidPrice <= 0) return alert('Enter valid price');
    setIsBidding(true);
    await onBid(job.id, bidPrice);
    setBidPrice(0);
    setIsBidding(false);
  };

  return (
    <div className="bg-white industrial-border industrial-shadow overflow-hidden">
      <div className="p-6 border-b-2 border-black flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">{job.cargo}</h3>
          <p className="font-mono text-sm uppercase text-zinc-500 font-bold">
            {job.pickup} <span className="text-black mx-1">→</span> {job.delivery}
          </p>
        </div>
        <div className="text-right">
          <div className="bg-black text-white px-3 py-1 text-xs font-black uppercase">
            {job.required_tons} TONS
          </div>
          <p className="text-[10px] mt-1 font-bold opacity-40 uppercase">ID: {job.id.slice(0,8)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="p-6 bg-zinc-50 border-r-2 border-black">
          <h4 className="text-xs font-black uppercase mb-4 text-zinc-500">Current Market</h4>
          {bestBid ? (
            <div>
              <p className="text-3xl font-black tracking-tighter">${bestBid.price}</p>
              <p className="text-[10px] font-bold uppercase mt-1">Lowest Bid by {bestBid.truck_id === currentUserId ? 'YOU' : bestBid.truck_id.slice(0, 8)}</p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-bold uppercase text-zinc-300 italic">No bids yet</p>
              <p className="text-[10px] font-bold uppercase mt-1">Opportunity window open</p>
            </div>
          )}
          
          <div className="mt-4">
             <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Total Participants: {job.bids?.length || 0}</p>
             <div className="flex gap-1">
                {job.bids?.slice(0, 5).map(b => (
                  <div key={b.id} className="w-2 h-2 bg-black opacity-20" title={`$${b.price}`}></div>
                ))}
                {(job.bids?.length || 0) > 5 && <span className="text-[10px] font-bold">+{(job.bids?.length || 0) - 5}</span>}
             </div>
          </div>
        </div>

        <div className="p-6 flex flex-col justify-center bg-white">
          {role === 'TRUCK_OWNER' ? (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase block">Your Quote ($)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  placeholder="0.00"
                  className="flex-1 p-2 industrial-border font-bold outline-none focus:bg-yellow-50"
                  value={bidPrice || ''}
                  onChange={e => setBidPrice(parseFloat(e.target.value))}
                />
                <button 
                  onClick={handleBidSubmit}
                  disabled={isBidding}
                  className="bg-black text-white px-6 py-2 font-black uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {isBidding ? '...' : 'BID'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-center">
              <p className="text-xs font-black uppercase text-zinc-500 mb-2">Ownership status</p>
              <div className="p-3 border-2 border-dashed border-zinc-300 text-center">
                <p className="text-[10px] font-bold uppercase text-zinc-400">
                  {job.client_id === currentUserId ? 'This is your freight posting' : 'Managed by external client'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
