
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

const supabaseUrl = 'https://zvhmxgewwlsafdagjtsl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aG14Z2V3d2xzYWZkYWdqdHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMjM2MDQsImV4cCI6MjA4NjY5OTYwNH0.NR56oHEImLJA0fBFc7DFwqETxp1Fw8MJ7Y_ffJiNMGc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
