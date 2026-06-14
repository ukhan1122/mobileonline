import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
  // Support the common single-var format: cloudinary://api_key:api_secret@cloud_name
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary };
