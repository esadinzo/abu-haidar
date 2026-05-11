import { createClient } from '@supabase/supabase-js';

// ==========================================
// ضع هنا مفاتيح Supabase الخاصة بك
// ==========================================
const SUPABASE_URL = 'https://rmcbwazudhxjvzgonwbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DN4mSXSKxmBJddyOsZ3lCQ_rlkdBG2q';
// ==========================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ خدمات (Services) ============

export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertService(service) {
  const { id, ...rest } = service;
  const { data, error } = await supabase
    .from('services')
    .upsert({ id, ...rest })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderServices(orderedIds) {
  const updates = orderedIds.map((id, index) => ({ id, order: index }));
  const { error } = await supabase.from('services').upsert(updates);
  if (error) throw error;
}

// ============ تسجيلات (Recordings) ============

export async function fetchRecordings() {
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertRecording(recording) {
  const { id, ...rest } = recording;
  const { data, error } = await supabase
    .from('recordings')
    .upsert({ id, ...rest })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRecording(id) {
  const { error } = await supabase.from('recordings').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderRecordings(orderedIds) {
  const updates = orderedIds.map((id, index) => ({ id, order: index }));
  const { error } = await supabase.from('recordings').upsert(updates);
  if (error) throw error;
}

// ============ رفع الملفات (Storage) ============

export async function uploadFile(file, folder = 'images') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}
