import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

function getEnvVal(key: string): string {
  try {
    const configPath = path.join(process.cwd(), 'data', 'env.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (data[key] && typeof data[key] === 'string' && data[key].trim() !== '') {
        return data[key];
      }
    }
  } catch (e) {
    // ignore
  }
  if (process.env[key]) return process.env[key] as string;
  return '';
}

// Check if Cloudinary credentials are fully provided and valid (not placeholders)
export const isCloudinaryConfigured = (): boolean => {
  const name = getEnvVal('CLOUDINARY_CLOUD_NAME');
  const key = getEnvVal('CLOUDINARY_API_KEY');
  const secret = getEnvVal('CLOUDINARY_API_SECRET');

  if (!name || !key || !secret) return false;
  if (name.includes('your_cloudinary') || key.includes('your_cloudinary') || secret.includes('your_cloudinary')) {
    return false;
  }
  return true;
};

// Configure Cloudinary if env vars exist
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: getEnvVal('CLOUDINARY_CLOUD_NAME'),
    api_key: getEnvVal('CLOUDINARY_API_KEY'),
    api_secret: getEnvVal('CLOUDINARY_API_SECRET'),
    secure: true
  });
}

export interface UploadResult {
  url: string;
  provider: 'cloudinary' | 'local';
  publicId?: string;
  folder?: string;
}

/**
 * Resolves the designated Cloudinary folder for a file based on its MIME type
 * and environment variable / custom parameter settings.
 */
export function getTargetCloudinaryFolder(file: Express.Multer.File, customFolder?: string): string {
  const rootFolder = customFolder || getEnvVal('CLOUDINARY_FOLDER') || 'portfolio_uploads';
  const cleanRoot = rootFolder.trim().replace(/\/+$/, '');

  const mime = file.mimetype ? file.mimetype.toLowerCase() : '';

  if (mime.startsWith('image/')) {
    return `${cleanRoot}/images`;
  }

  if (
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('word') ||
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    mime.includes('text') ||
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('json') ||
    mime.includes('octet-stream')
  ) {
    return `${cleanRoot}/documents`;
  }

  return `${cleanRoot}/media`;
}

/**
 * Uploads a file buffer or local disk file to Cloudinary inside designated folders
 * (e.g. portfolio_uploads/images for images, portfolio_uploads/documents for documents).
 */
export async function uploadMediaFile(
  file: Express.Multer.File,
  overrideFolder?: string
): Promise<UploadResult> {
  const targetFolder = getTargetCloudinaryFolder(file, overrideFolder);

  if (isCloudinaryConfigured()) {
    try {
      return new Promise<UploadResult>((resolve) => {
        const mime = file.mimetype ? file.mimetype.toLowerCase() : '';
        const ext = path.extname(file.originalname || '').toLowerCase();
        const isPdf = mime.includes('pdf') || ext === '.pdf';
        const isRawDoc =
          mime.includes('word') ||
          mime.includes('sheet') ||
          mime.includes('excel') ||
          mime.includes('zip') ||
          mime.includes('octet-stream') ||
          ext === '.doc' ||
          ext === '.docx' ||
          ext === '.zip';

        // For PDFs and images, Cloudinary supports 'auto' or 'image' which enables
        // format detection ('pdf'), page 1 thumbnail generation, and previews in Cloudinary console.
        // Only raw unparsed binary archives (zip/doc) use 'raw' if auto doesn't handle them.
        const resourceType = isPdf ? 'image' : (isRawDoc ? 'raw' : 'auto');

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: targetFolder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true
          },
          (error, result) => {
            if (error || !result) {
              console.error(`Cloudinary upload error to folder "${targetFolder}":`, error);
              // Fallback to local path if Cloudinary API call fails
              return resolve({
                url: `/uploads/${file.filename}`,
                provider: 'local',
                folder: 'uploads'
              });
            }
            resolve({
              url: result.secure_url,
              provider: 'cloudinary',
              publicId: result.public_id,
              folder: result.folder || targetFolder
            });
          }
        );

        uploadStream.end(file.buffer || fs.readFileSync(file.path));
      });
    } catch (err) {
      console.error('Failed to upload to Cloudinary, falling back to local file:', err);
    }
  }

  // Fallback to local storage path
  return {
    url: `/uploads/${file.filename}`,
    provider: 'local',
    folder: 'uploads'
  };
}

export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  if (!publicId || !isCloudinaryConfigured()) return false;
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (err) {
    console.error('Failed to delete Cloudinary asset:', err);
    return false;
  }
}

export function parseCloudinaryUrl(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const parts = url.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const resourceType = parts[uploadIndex - 1] || 'image';
    const pathAfterUpload = parts.slice(uploadIndex + 1);

    let versionIndex = -1;
    for (let i = 0; i < pathAfterUpload.length; i++) {
      if (/^v\d+$/.test(pathAfterUpload[i])) {
        versionIndex = i;
        break;
      }
    }

    let publicIdParts: string[];
    if (versionIndex !== -1) {
      publicIdParts = pathAfterUpload.slice(versionIndex + 1);
    } else {
      publicIdParts = pathAfterUpload.filter(p => !p.includes(',') && !/^[a-z]_[a-z0-9]/i.test(p));
    }

    const fullPath = publicIdParts.join('/');
    let format = '';
    let publicId = fullPath;

    if (resourceType === 'image') {
      const lastDot = fullPath.lastIndexOf('.');
      if (lastDot !== -1) {
        publicId = fullPath.substring(0, lastDot);
        format = fullPath.substring(lastDot + 1);
      }
    }

    return { resourceType, publicId, format };
  } catch (e) {
    return null;
  }
}

export function getSignedDownloadUrl(urlStr: string): string | null {
  if (!isCloudinaryConfigured()) return null;
  const parsed = parseCloudinaryUrl(urlStr);
  if (!parsed) return null;

  try {
    return cloudinary.utils.private_download_url(parsed.publicId, parsed.format, {
      resource_type: parsed.resourceType as any,
      type: 'upload'
    });
  } catch (err) {
    console.error('Failed to generate private_download_url:', err);
    return null;
  }
}
