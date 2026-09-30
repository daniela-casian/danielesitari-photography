// Cloudinary Manager - Upload poze calitate maximă
const CLOUD_NAME = 'dw0dymsmz'; 
const UPLOAD_PRESET = 'photography_uploads'; // Preset-ul creat în Cloudinary

// Upload poză în Cloudinary (calitate originală)
export const uploadToCloudinary = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'danielesitari/edited');
    
    const xhr = new XMLHttpRequest();
    
    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          id: response.public_id,
          url: response.secure_url,
          thumbnail: response.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/'),
          fullsize: response.secure_url,
          filename: file.name,
          size: response.bytes,
          format: response.format,
          width: response.width,
          height: response.height,
          uploadedAt: new Date().toISOString()
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
};

// Upload multiple poze cu progress
export const uploadMultipleToCloudinary = async (files, onTotalProgress) => {
  const total = files.length;
  let completed = 0;
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await uploadToCloudinary(file, (percent) => {
        const overallProgress = Math.round(((completed + (percent / 100)) / total) * 100);
        if (onTotalProgress) {
          onTotalProgress(overallProgress, i + 1, total);
        }
      });
      
      results.push(result);
      completed++;
      
      if (onTotalProgress) {
        onTotalProgress(Math.round((completed / total) * 100), completed, total);
      }
    } catch (error) {
      console.error(`Eroare upload ${file.name}:`, error);
      results.push({ error: true, filename: file.name });
    }
  }
  
  return results;
};

// Generează URL-uri optimizate
export const getOptimizedUrl = (url, options = {}) => {
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  let transformation = `/upload/q_${quality},f_${format}`;
  
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  
  return url.replace('/upload/', transformation + '/');
};

// Șterge poză din Cloudinary (necesită backend pentru signed requests)
export const deleteFromCloudinary = async (publicId) => {
  // Acest lucru necesită signed request de la backend
  // Pentru moment, pozele rămân în Cloudinary (FREE tier = 25GB)
  console.warn('Delete necesită backend signed request');
  return false;
};