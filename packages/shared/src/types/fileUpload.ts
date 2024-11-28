import { Request } from 'express';
import * as fs from 'fs';

export interface UploadedFile {
  fieldName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface FileUploadRequest extends Request {
  files?: UploadedFile[];
}

export interface FileUploadState {
  buffer: Buffer;
  boundaryBuffer: Buffer;
  files: UploadedFile[];
  currentFile: UploadedFile | null;
  fileStream: fs.WriteStream | null;
  isReadingHeader: boolean;
  rawBody: Buffer;
}
