import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmcbwazudhxjvzgonwbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DN4mSXSKxmBJddyOsZ3lCQ_rlkdBG2q';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTitleAnalytics() {
  console.log('Checking for Analytics row by title...');
  const { data: existing, error: fetchErr } = await supabase
    .from('services')
    .select('*')
    .eq('title', 'Analytics');
  
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  console.log('Existing rows found:', existing);

  if (existing.length === 0) {
    console.log('Inserting new Analytics row...');
    const { data: inserted, error: insertErr } = await supabase
      .from('services')
      .insert({
        title: 'Analytics',
        desc: JSON.stringify({ visitors: 10, whatsappClicks: 5 }),
        order: -999,
        icon: '📊'
      })
      .select();
    
    if (insertErr) {
      console.error('Insert error:', insertErr);
    } else {
      console.log('Inserted successfully:', inserted);
    }
  } else {
    console.log('Updating existing Analytics row...');
    const { data: updated, error: updateErr } = await supabase
      .from('services')
      .update({
        desc: JSON.stringify({ visitors: 20, whatsappClicks: 10 })
      })
      .eq('title', 'Analytics')
      .select();
    
    if (updateErr) {
      console.error('Update error:', updateErr);
    } else {
      console.log('Updated successfully:', updated);
    }
  }
}

testTitleAnalytics();
