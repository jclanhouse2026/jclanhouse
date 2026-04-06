export const optimizeImage = async (file: File, maxWidth = 800, maxHeight = 1000, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Image optimization timed out'));
    }, 15000); // 15 seconds timeout

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      try {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              clearTimeout(timeoutId);
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                clearTimeout(timeoutId);
                if (blob) {
                  const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  });
                  resolve(optimizedFile);
                } else {
                  reject(new Error('Canvas to Blob failed'));
                }
              },
              'image/webp',
              quality
            );
          } catch (err) {
            clearTimeout(timeoutId);
            reject(err);
          }
        };
        img.onerror = (error) => {
          clearTimeout(timeoutId);
          reject(error);
        };
      } catch (err) {
        clearTimeout(timeoutId);
        reject(err);
      }
    };
    reader.onerror = (error) => {
      clearTimeout(timeoutId);
      reject(error);
    };
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('File to Base64 conversion timed out'));
    }, 15000);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      clearTimeout(timeoutId);
      resolve(reader.result as string);
    };
    reader.onerror = error => {
      clearTimeout(timeoutId);
      reject(error);
    };
  });
};
