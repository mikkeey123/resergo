/**
 * Compress and resize image before converting to Base64
 * This helps reduce the payload size when storing in Firestore
 * Firestore has a 1MB limit per document, so we need aggressive compression
 */

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 800)
 * @param {number} maxHeight - Maximum height in pixels (default: 800)
 * @param {number} quality - Compression quality 0-1 (default: 0.6)
 * @returns {Promise<string>} - Base64 data URL of compressed image
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG (smaller than PNG) with compression
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                resolve(compressedDataUrl);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
};

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 800)
 * @param {number} maxHeight - Maximum height in pixels (default: 800)
 * @param {number} quality - Compression quality 0-1 (default: 0.6)
 * @returns {Promise<string[]>} - Array of Base64 data URLs
 */
export const compressImages = async (files, maxWidth = 800, maxHeight = 800, quality = 0.6) => {
    const promises = files.map(file => compressImage(file, maxWidth, maxHeight, quality));
    return Promise.all(promises);
};

