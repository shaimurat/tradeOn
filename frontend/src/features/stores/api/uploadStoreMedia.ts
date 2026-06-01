import { cloudinaryApi } from '../../../shared/api/cloudinaryApi';

export type UploadStoreMediaParams = {
  logoFile?: File | null;
  bannerFile?: File | null;
};

export type UploadStoreMediaResult = {
  logo_url: string | null;
  banner_url: string | null;
};

export const uploadStoreMedia = async ({
  logoFile,
  bannerFile,
}: UploadStoreMediaParams): Promise<UploadStoreMediaResult> => {
  const [logoUrl, bannerUrl] = await Promise.all([
    logoFile ? cloudinaryApi.uploadStoreLogo(logoFile) : null,
    bannerFile ? cloudinaryApi.uploadStoreBanner(bannerFile) : null,
  ]);

  return {
    logo_url: logoUrl,
    banner_url: bannerUrl,
  };
};
