import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmcbwazudhxjvzgonwbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DN4mSXSKxmBJddyOsZ3lCQ_rlkdBG2q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('services').select('*').eq('id', 'analytics_data');
  if (error) {
    console.error('Error fetching analytics_data:', error);
  } else {
    console.log('Analytics row:', data);
  }
}

check();
