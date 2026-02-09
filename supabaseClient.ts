
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kccqcwnulvqzapexvosk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_E2v5YugBHX4J_AFNRzgFow_si8GxlEH';

// Initialize the Supabase client directly
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
