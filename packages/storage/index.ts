// Bucket constants
export { PRIVATE_ASSETS_BUCKET, PUBLIC_ASSETS_BUCKET } from './buckets';

// Environment keys
export { keys } from './keys';

// S3 file management functions
export {
  checkFileExistsInBucket,
  createBucketIfNotExists,
  createPresignedUrlToDownload,
  createPresignedUrlToUpload,
  deleteFile,
  deleteFileByPath,
  deleteFileFromBucket,
  getFileFromBucket,
  getFileUrl,
  listUserFiles,
  s3Client,
  saveFileInBucket,
  uploadFile,
} from './s3-file-management';

// Types
export type {
  FileInDBProp,
  FileProps,
  FilesListProps,
  LoadSpinnerProps,
  PresignedUrlProp,
  ShortFileProp,
  UploadFileParams,
  UploadFileResult,
} from './types';
