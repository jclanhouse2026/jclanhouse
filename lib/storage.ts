import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param path The path in storage
 * @returns Promise<string> The download URL
 */
export const uploadFile = async (file: File | Blob, path: string): Promise<string> => {
  if (!file) {
    throw new Error("Nenhum arquivo fornecido para upload.");
  }

  try {
    // Sanitize path to avoid issues with special characters
    const sanitizedPath = path.split('/').map(part => part.replace(/[^a-zA-Z0-9._-]/g, '_')).join('/');
    
    const storageRef = ref(storage, sanitizedPath);
    
    // Set metadata to help Firebase identify the file type
    const metadata = {
      contentType: file.type || 'image/webp',
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    if (!downloadURL || !downloadURL.startsWith('http')) {
      throw new Error("Falha ao obter URL pública do arquivo.");
    }

    return downloadURL;
  } catch (error: any) {
    console.error("Erro detalhado no upload:", error);
    
    // Specific error messages for common Firebase Storage issues
    if (error.code === 'storage/unauthorized') {
      throw new Error("Sem permissão para fazer upload. Verifique se você está logado.");
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error("Cota de armazenamento excedida. Tente novamente mais tarde.");
    } else if (error.code === 'storage/retry-limit-exceeded') {
      throw new Error("O upload demorou muito tempo. Verifique sua conexão.");
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
