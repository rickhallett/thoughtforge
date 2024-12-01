import { UploadedFile } from '../types/fileUpload';

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export function validateFileType(filename: string, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) return true;

  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

export function validateFileSize(size: number, maxSize?: number): boolean {
  if (!maxSize) return true;
  return size <= maxSize;
}

export function validateFiles(files: UploadedFile[], options: FileValidationOptions = {}): void {
  const { maxFiles, allowedTypes } = options;

  if (maxFiles && files.length > maxFiles) {
    throw new FileValidationError(`Maximum number of files (${maxFiles}) exceeded`);
  }

  files.forEach((file) => {
    if (allowedTypes && !validateFileType(file.filename, allowedTypes)) {
      throw new FileValidationError(
        `File type not allowed for ${file.filename}. Allowed types: ${allowedTypes.join(', ')}`
      );
    }
  });
}
