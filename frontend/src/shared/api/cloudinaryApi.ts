export type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  created_at: string;
};

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const getCloudinaryUploadUrl = (resourceType: CloudinaryResourceType = 'image') => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Define VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
};

export const cloudinaryApi = {
  uploadFile: async (
    file: File,
    options?: {
      folder?: string;
      resourceType?: CloudinaryResourceType;
    }
  ) => {
    const uploadUrl = getCloudinaryUploadUrl(options?.resourceType ?? 'image');
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(errorData?.error?.message || 'Failed to upload media to Cloudinary');
    }

    return response.json() as Promise<CloudinaryUploadResponse>;
  },

  uploadStoreLogo: async (file: File) => {
    const result = await cloudinaryApi.uploadFile(file, {
      folder: 'tradeon/stores/logos',
      resourceType: 'image',
    });

    return result.secure_url;
  },

  uploadStoreBanner: async (file: File) => {
    const result = await cloudinaryApi.uploadFile(file, {
      folder: 'tradeon/stores/banners',
      resourceType: 'image',
    });

    return result.secure_url;
  },
  uploadProductImage: async (file: File) => {
    const result = await cloudinaryApi.uploadFile(file, {
      folder: 'tradeon/products/images',
      resourceType: 'image',
    });

    return result.secure_url;
  },
};
