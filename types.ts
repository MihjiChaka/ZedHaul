
export interface Job {
  id: string;
  created_at: string;
  pickup: string;
  delivery: string;
  cargo: string;
  required_tons: number;
  client_id: string;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  created_at: string;
  job_id: string;
  truck_id: string;
  price: number;
}

export type Role = 'CLIENT' | 'TRUCK_OWNER';
