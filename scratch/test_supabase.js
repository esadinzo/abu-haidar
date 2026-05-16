import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmcbwazudhxjvzgonwbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DN4mSXSKxmBJddyOsZ3lCQ_rlkdBG2q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('services').select('*').limit(1);
  if (error) {
    console.error('Services table failed:', error);
  } else {
    console.log('Services table works! Data:', data);
  }
}

test();
