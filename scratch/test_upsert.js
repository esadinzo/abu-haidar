import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmcbwazudhxjvzgonwbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DN4mSXSKxmBJddyOsZ3lCQ_rlkdBG2q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUpsert() {
  const testData = {
    id: 999999, // use integer ID
    title: 'SEO Settings Test',
    desc: JSON.stringify({ title: 'Test Title' }),
    order: -999
  };
  const { data, error } = await supabase.from('services').upsert(testData).select();
  if (error) {
    console.error('Error during upsert:', error);
  } else {
    console.log('Upsert successful:', data);
  }
}

testUpsert();
