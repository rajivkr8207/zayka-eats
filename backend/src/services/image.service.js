import ImageKit, { toFile } from '@imagekit/nodejs';
import Config from '../config/config.js';
import { ApiError } from '../utils/ApiError.js';

let client = null;

const getImageKitClient = () => {
  if (!client) {
    const privateKey = Config.IMAGE_KIT || Config.image_kit || process.env.IMAGE_KIT;
    if (!privateKey) {
      throw new ApiError(
        500,
        'ImageKit private key is missing. Please set IMAGE_KIT in your environment variables.',
      );
    }
    client = new ImageKit({ privateKey });
  }
  return client;
};

export async function UploadImageToImageKit({ buffer, fileName, folderPath = 'users' }) {
  if (!buffer) {
    throw new ApiError(400, 'Image buffer is required for upload');
  }

  // 5MB max check (5 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (buffer.length > MAX_FILE_SIZE) {
    throw new ApiError(400, 'Image file size must not exceed 5MB');
  }

  const imageKit = getImageKitClient();
  const image = await imageKit.files.upload({
    file: await toFile(buffer),
    fileName: fileName || `image-${Date.now()}.jpg`,
    folder: `/zayka/${folderPath}`,
  });

  return image;
}
