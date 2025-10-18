import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadReceiptToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'flexy-receipts',
        resource_type: 'image',
        public_id: `receipt_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error);
          reject(error);
        } else if (result) {
          console.log('[Cloudinary] Upload success:', result.secure_url);
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary upload'));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};
