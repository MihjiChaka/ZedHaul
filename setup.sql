
-- Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    pickup TEXT NOT NULL,
    delivery TEXT NOT NULL,
    cargo TEXT NOT NULL,
    required_tons NUMERIC NOT NULL,
    client_id TEXT NOT NULL
);

-- Create Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    truck_id TEXT NOT NULL,
    price NUMERIC NOT NULL
);

-- Enable Real-time for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;

-- (Optional) Add RLS Policies - for MVP we keep it simple, but here is the template:
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON jobs FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON jobs FOR INSERT WITH CHECK (true);

-- ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON bids FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON bids FOR INSERT WITH CHECK (true);
