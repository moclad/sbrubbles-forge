export type ShortFileProp = {
  originalFileName: string;
  fileSize: number;
};

export type PresignedUrlProp = ShortFileProp & {
  url: string;
  fileNameInBucket: string;
};

export type FileProps = ShortFileProp & {
  id: string;
  isDeleting?: boolean;
};

export type FilesListProps = {
  files: FileProps[];
  fetchFiles: () => Promise<void>;
  setFiles: (files: FileProps[] | ((files: FileProps[]) => FileProps[])) => void;
  downloadUsingPresignedUrl: boolean;
};

export type LoadSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
};

export type FileInDBProp = {
  fileNameInBucket: string;
  originalFileName: string;
  fileSize: number;
};

export type UploadFileParams = {
  bucket: string;
  pathPrefix: string;
  file: Buffer;
  userId: string;
  originalFileName: string;
};

export type UploadFileResult = {
  fileId: string;
  fileName: string;
  url: string;
  fileSize: number;
};
