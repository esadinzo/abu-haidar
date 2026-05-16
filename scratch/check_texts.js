import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmcbwazudhxjvzgonwbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DN4mSXSKxmBJddyOsZ3lCQ_rlkdBG2q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTexts() {
  const { data, error } = await supabase.from('texts').select('*').limit(3);
  if (error) {
    console.error('Error fetching texts:', error);
  } else {
    console.log('Texts:', data);
  }
}

checkTexts();
