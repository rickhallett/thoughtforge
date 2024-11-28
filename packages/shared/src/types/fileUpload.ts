import { Request } from 'express';

export interface UploadedFile {
  fieldName: string;
  filename: string;
  path: string;
}

export interface FileUploadRequest extends Request {
  files?: UploadedFile[];
}

export interface FileUploadState {
  buffer: Buffer;
  boundaryBuffer: Buffer;
  files: UploadedFile[];
  currentFile: UploadedFile | null;
  fileStream: NodeJS.WriteStream | null;
  isReadingHeader: boolean;
  rawBody: Buffer;
}
