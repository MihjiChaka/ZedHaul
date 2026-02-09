
import React, { useState } from 'react';
import { Job } from '../types.ts';

interface JobFormProps {
  onSubmit: (jobData: Omit<Job, 'id' | 'created_at' | 'bids'>) => Promise<void>;
}

export const JobForm: React.FC<JobFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    pickup: '',
    delivery: '',
    cargo: '',
    required_tons: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setFormData({ pickup: '', delivery: '', cargo: '', required_tons: 1 });
    setSubmitting(false);
  };

  const inputClass = "w-full p-3 industrial-border focus:bg-zinc-50 outline-none text-sm font-semibold mb-4";
  const labelClass = "block text-xs font-black uppercase mb-1";

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label className={labelClass}>Cargo Description</label>
        <input 
          required
          className={inputClass}
          placeholder="e.g. Bulk Copper Ore"
          value={formData.cargo}
          onChange={e => setFormData({ ...formData, cargo: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Pickup City</label>
          <input 
            required
            className={inputClass}
            placeholder="Lusaka"
            value={formData.pickup}
            onChange={e => setFormData({ ...formData, pickup: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Delivery City</label>
          <input 
            required
            className={inputClass}
            placeholder="Ndola"
            value={formData.delivery}
            onChange={e => setFormData({ ...formData, delivery: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Required Payload (Tons)</label>
        <input 
          required
          type="number"
          min="1"
          className={inputClass}
          value={formData.required_tons}
          onChange={e => setFormData({ ...formData, required_tons: parseInt(e.target.value) })}
        />
      </div>
      <button 
        disabled={submitting}
        type="submit"
        className="w-full bg-black text-white p-4 font-black uppercase industrial-shadow-hover transition-all active:translate-y-1 active:shadow-none"
      >
        {submitting ? 'Broadcasting...' : 'Broadcast Job'}
      </button>
    </form>
  );
};
