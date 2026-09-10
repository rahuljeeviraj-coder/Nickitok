
/**
 * Compresses an image by resizing it to a maximum width/height and reducing quality.
 * Useful for keeping base64 images within Firestore's 1MB limit.
 */
export async function compressImage(base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with quality reduction
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = (e) => reject(e);
  });
}

/**
 * Estimates the size of a base64 string in bytes.
 */
export function estimateBase64Size(base64Str: string): number {
  if (!base64Str) return 0;
  const padding = (base64Str.match(/=/g) || []).length;
  return (base64Str.length * 3) / 4 - padding;
}

/**
 * Formats bytes into a human-readable string.
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
