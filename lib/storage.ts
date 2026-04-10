import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The file to upload
 * @param path The path in storage
 * @returns Promise<string> The public URL
 */
export const uploadFile = async (file: File | Blob, path: string): Promise<string> => {
  if (!file) {
    throw new Error("Nenhum arquivo fornecido para upload.");
  }

  try {
    // Sanitize path to avoid issues with special characters
    const sanitizedPath = path.split('/').map(part => part.replace(/[^a-zA-Z0-9._-]/g, '_')).join('/');
    
    // Upload to 'images' bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(sanitizedPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/webp'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(sanitizedPath);
    
    if (!publicUrl) {
      throw new Error("Falha ao obter URL pública do arquivo.");
    }

    return publicUrl;
  } catch (error: any) {
    console.error("Erro detalhado no upload:", error);
    
    if (error.status === 403) {
      throw new Error("Sem permissão para fazer upload. Verifique se você está logado.");
    } else if (error.message?.includes('quota')) {
      throw new Error("Cota de armazenamento excedida. Tente novamente mais tarde.");
    }
    
    throw new Error(`Erro ao enviar imagem: ${error.message || 'Erro desconhecido'}`);
  }
};

/**
 * Converts a base64 string to a Blob for uploading.
 * @param base64 The base64 string
 * @returns Blob
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};
