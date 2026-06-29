import { supabase } from './supabase';

export async function uploadPhoto(file, path) {
  const { error } = await supabase.storage
    .from('photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(path);

  // Bust cache so the new photo shows immediately
  return { url: `${publicUrl}?t=${Date.now()}` };
}
