import { fileToBase64 } from './imageUtils';

/**
 * Converts a file to base64 and returns it as a data URL.
 * This bypasses Firebase Storage and allows saving directly to Firestore.
 * @param file The file to upload
 * @param path The path in storage (ignored in this implementation)
 * @returns Promise<string> The base64 data URL
 */
export const uploadFile = async (file: File | Blob, path: string): Promise<string> => {
  try {
    if (file instanceof File) {
      return await fileToBase64(file);
    } else {
      // Convert Blob to File
      const newFile = new File([file], "image.webp", { type: file.type });
      return await fileToBase64(newFile);
    }
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw error;
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
