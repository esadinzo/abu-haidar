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

// ============ نصوص (Texts) ============

export async function fetchTexts() {
  const { data, error } = await supabase
    .from('texts')
    .select('*')
    .order('order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertText(text) {
  const { id, ...rest } = text;
  const { data, error } = await supabase
    .from('texts')
    .upsert({ id, ...rest })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteText(id) {
  const { error } = await supabase.from('texts').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderTexts(orderedIds) {
  const updates = orderedIds.map((id, index) => ({ id, order: index }));
  const { error } = await supabase.from('texts').upsert(updates);
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

// ============ Metadata & Settings (stored dynamically by title in services) ============

export async function fetchMetadata(title, defaultValue) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('title', title);
    
    if (error) throw error;
    if (data && data.length > 0) {
      try {
        return JSON.parse(data[0].desc);
      } catch (e) {
        return defaultValue;
      }
    } else {
      // Create record if it does not exist
      const { data: inserted, error: insertErr } = await supabase
        .from('services')
        .insert({
          title,
          desc: JSON.stringify(defaultValue),
          order: -999,
          icon: '⚙️'
        })
        .select();
      if (insertErr) throw insertErr;
      return defaultValue;
    }
  } catch (err) {
    console.warn(`Failed to fetch metadata for ${title}:`, err.message);
    return defaultValue;
  }
}

export async function saveMetadata(title, value) {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('services')
      .select('*')
      .eq('title', title);
    if (fetchErr) throw fetchErr;

    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('services')
        .update({ desc: JSON.stringify(value) })
        .eq('title', title)
        .select();
      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert({
          title,
          desc: JSON.stringify(value),
          order: -999,
          icon: '⚙️'
        })
        .select();
      if (error) throw error;
      return data[0];
    }
  } catch (err) {
    console.error(`Failed to save metadata for ${title}:`, err);
    throw err;
  }
}

