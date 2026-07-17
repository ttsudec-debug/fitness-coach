import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jhcymrtlqwhjghykpcsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY3ltcnRscXdoamdoeWtwY3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTMyNDQsImV4cCI6MjA5OTg4OTI0NH0.xCksxt_xSDPd0O80hl9yuMwzQP9_16SNdD-y6OcDzQo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
